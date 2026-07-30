"""Layer 1: Layout detection accuracy verification.

Compares live ONNX detections against the snapshotted ground truth using IoU
(Intersection over Union). Catches regressions in the detector, preprocessing,
or threshold tuning.

On failure, saves a debug overlay PNG to backend/tests/artifacts/ showing
ground-truth boxes (green) vs detected boxes (red) for visual diagnosis.

Regenerate ground truth after intentional changes:
    PYTHONPATH=src python tests/fixtures/snapshot_layout.py
"""

from __future__ import annotations

from pathlib import Path

import pypdfium2 as pdfium
import pytest
from PIL import Image, ImageDraw

from pdf_remediation.adapters.layout_onnx_yolo import OnnxYoloLayoutDetector

# IoU threshold — detections must overlap ground truth by at least this much
IOU_THRESHOLD = 0.6

# Maximum extra detections allowed per page (tolerance for logos/decorative)
MAX_FALSE_POSITIVES_PER_PAGE = 1

# Minimum confidence that any detection must have
MIN_CONFIDENCE = 0.3


# ---------------------------------------------------------------------------
# IoU helper
# ---------------------------------------------------------------------------


def compute_iou(
    bbox_a: list[float] | tuple[float, ...],
    bbox_b: list[float] | tuple[float, ...],
) -> float:
    """Compute Intersection over Union between two bounding boxes.

    Each bbox is (x0, y0, x1, y1) with top-left origin.
    Returns 0.0 if no overlap, 1.0 for identical boxes.
    """
    x0_a, y0_a, x1_a, y1_a = bbox_a
    x0_b, y0_b, x1_b, y1_b = bbox_b

    # Intersection rectangle
    inter_x0 = max(x0_a, x0_b)
    inter_y0 = max(y0_a, y0_b)
    inter_x1 = min(x1_a, x1_b)
    inter_y1 = min(y1_a, y1_b)

    inter_w = max(0.0, inter_x1 - inter_x0)
    inter_h = max(0.0, inter_y1 - inter_y0)
    inter_area = inter_w * inter_h

    if inter_area == 0:
        return 0.0

    # Union
    area_a = (x1_a - x0_a) * (y1_a - y0_a)
    area_b = (x1_b - x0_b) * (y1_b - y0_b)
    union_area = area_a + area_b - inter_area

    if union_area <= 0:
        return 0.0

    return inter_area / union_area


# ---------------------------------------------------------------------------
# Debug overlay helper
# ---------------------------------------------------------------------------


def _save_debug_overlay(
    pdf_bytes: bytes,
    page_number: int,
    ground_truth_bboxes: list[list[float]],
    detected_bboxes: list[tuple[float, ...]],
    artifacts_dir: Path,
) -> Path:
    """Render a page with GT boxes (green) and detected boxes (red) overlaid."""
    doc = pdfium.PdfDocument(pdf_bytes)
    try:
        page = doc[page_number - 1]
        page_w = page.get_width()
        page_h = page.get_height()
        bitmap = page.render(scale=2.0)
        pil_image = bitmap.to_pil()
    finally:
        doc.close()

    draw = ImageDraw.Draw(pil_image)
    img_w, img_h = pil_image.size
    scale_x = img_w / page_w
    scale_y = img_h / page_h

    # Draw ground truth in green (thick)
    for bbox in ground_truth_bboxes:
        x0, y0, x1, y1 = bbox
        draw.rectangle(
            [x0 * scale_x, y0 * scale_y, x1 * scale_x, y1 * scale_y],
            outline="lime",
            width=4,
        )

    # Draw detections in red (thinner)
    for bbox in detected_bboxes:
        x0, y0, x1, y1 = bbox
        draw.rectangle(
            [x0 * scale_x, y0 * scale_y, x1 * scale_x, y1 * scale_y],
            outline="red",
            width=3,
        )

    out_path = artifacts_dir / f"page{page_number}_overlay.png"
    pil_image.save(out_path, format="PNG")
    return out_path


# ---------------------------------------------------------------------------
# Detector helper
# ---------------------------------------------------------------------------


def _run_detector_on_page(pdf_bytes: bytes, page_number: int) -> list:
    """Run the ONNX detector on a specific page and return FigureDetection list."""
    detector = OnnxYoloLayoutDetector()
    doc = pdfium.PdfDocument(pdf_bytes)
    try:
        page = doc[page_number - 1]
        page_w = page.get_width()
        page_h = page.get_height()
        bitmap = page.render(scale=2.0)
        pil_image = bitmap.to_pil()
    finally:
        doc.close()

    return detector.detect_figures(pil_image, page_w, page_h)


# ---------------------------------------------------------------------------
# Unit tests for IoU helper
# ---------------------------------------------------------------------------


class TestComputeIoU:
    """Unit tests for the IoU computation — no ONNX model needed."""

    def test_identical_boxes(self):
        bbox = [100, 100, 300, 300]
        assert compute_iou(bbox, bbox) == pytest.approx(1.0)

    def test_no_overlap(self):
        a = [0, 0, 50, 50]
        b = [100, 100, 200, 200]
        assert compute_iou(a, b) == 0.0

    def test_partial_overlap(self):
        a = [0, 0, 100, 100]
        b = [50, 50, 150, 150]
        # Intersection: 50x50 = 2500
        # Union: 10000 + 10000 - 2500 = 17500
        expected = 2500 / 17500
        assert compute_iou(a, b) == pytest.approx(expected, abs=0.001)

    def test_contained_box(self):
        outer = [0, 0, 200, 200]
        inner = [50, 50, 100, 100]
        # Intersection = inner area = 2500
        # Union = outer area = 40000
        expected = 2500 / 40000
        assert compute_iou(outer, inner) == pytest.approx(expected, abs=0.001)

    def test_zero_area_box(self):
        a = [100, 100, 100, 100]  # zero area
        b = [50, 50, 150, 150]
        assert compute_iou(a, b) == 0.0

    def test_touching_edges(self):
        a = [0, 0, 100, 100]
        b = [100, 0, 200, 100]  # shares edge, no area overlap
        assert compute_iou(a, b) == 0.0


# ---------------------------------------------------------------------------
# Integration tests: live detector vs ground truth
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestLayoutAccuracy:
    """Compare live ONNX detections against snapshotted ground truth."""

    def test_detection_count_per_page(
        self, demo_pdf_bytes: bytes, layout_ground_truth: dict
    ):
        """Each page should detect at least as many figures as ground truth."""
        for gt_page in layout_ground_truth["pages"]:
            page_num = gt_page["page_number"]
            expected_count = len(gt_page["figures"])

            detections = _run_detector_on_page(demo_pdf_bytes, page_num)

            assert len(detections) >= expected_count, (
                f"Page {page_num}: expected at least {expected_count} figure(s), "
                f"got {len(detections)}"
            )

    def test_iou_above_threshold(
        self, demo_pdf_bytes: bytes, layout_ground_truth: dict, artifacts_dir: Path
    ):
        """Every ground-truth figure must have a matching detection with IoU ≥ threshold."""
        for gt_page in layout_ground_truth["pages"]:
            page_num = gt_page["page_number"]
            gt_figures = gt_page["figures"]

            detections = _run_detector_on_page(demo_pdf_bytes, page_num)
            detected_bboxes = [d.bbox for d in detections]

            for fig_idx, gt_fig in enumerate(gt_figures):
                gt_bbox = gt_fig["bbox"]

                # Find best matching detection
                best_iou = 0.0
                for det_bbox in detected_bboxes:
                    iou = compute_iou(gt_bbox, det_bbox)
                    best_iou = max(best_iou, iou)

                if best_iou < IOU_THRESHOLD:
                    # Save debug overlay on failure
                    overlay_path = _save_debug_overlay(
                        demo_pdf_bytes,
                        page_num,
                        [f["bbox"] for f in gt_figures],
                        detected_bboxes,
                        artifacts_dir,
                    )
                    pytest.fail(
                        f"Page {page_num}, figure {fig_idx}: "
                        f"best IoU = {best_iou:.3f} < {IOU_THRESHOLD} threshold.\n"
                        f"  Ground truth bbox: [{gt_bbox[0]:.0f}, {gt_bbox[1]:.0f}, "
                        f"{gt_bbox[2]:.0f}, {gt_bbox[3]:.0f}]\n"
                        f"  Detected bboxes: {[f'[{b[0]:.0f},{b[1]:.0f},{b[2]:.0f},{b[3]:.0f}]' for b in detected_bboxes]}\n"
                        f"  Debug overlay: {overlay_path}"
                    )

    def test_no_excessive_false_positives(
        self, demo_pdf_bytes: bytes, layout_ground_truth: dict, artifacts_dir: Path
    ):
        """Extra detections beyond ground truth should be limited."""
        for gt_page in layout_ground_truth["pages"]:
            page_num = gt_page["page_number"]
            expected_count = len(gt_page["figures"])

            detections = _run_detector_on_page(demo_pdf_bytes, page_num)
            extra = len(detections) - expected_count

            if extra > MAX_FALSE_POSITIVES_PER_PAGE:
                detected_bboxes = [d.bbox for d in detections]
                overlay_path = _save_debug_overlay(
                    demo_pdf_bytes,
                    page_num,
                    [f["bbox"] for f in gt_page["figures"]],
                    detected_bboxes,
                    artifacts_dir,
                )
                pytest.fail(
                    f"Page {page_num}: {extra} extra detection(s) beyond ground truth "
                    f"(max allowed: {MAX_FALSE_POSITIVES_PER_PAGE}).\n"
                    f"  Expected: {expected_count}, Got: {len(detections)}\n"
                    f"  Debug overlay: {overlay_path}"
                )

    def test_confidence_above_minimum(
        self, demo_pdf_bytes: bytes, layout_ground_truth: dict
    ):
        """All detections matching ground truth should have confidence ≥ minimum."""
        for gt_page in layout_ground_truth["pages"]:
            page_num = gt_page["page_number"]
            gt_figures = gt_page["figures"]

            detections = _run_detector_on_page(demo_pdf_bytes, page_num)

            for gt_fig in gt_figures:
                gt_bbox = gt_fig["bbox"]
                gt_conf = gt_fig["confidence"]

                # Find best matching detection
                best_det = None
                best_iou = 0.0
                for det in detections:
                    iou = compute_iou(gt_bbox, det.bbox)
                    if iou > best_iou:
                        best_iou = iou
                        best_det = det

                if best_det is not None:
                    assert best_det.confidence >= MIN_CONFIDENCE, (
                        f"Page {page_num}: matched detection confidence "
                        f"{best_det.confidence:.3f} < {MIN_CONFIDENCE} minimum"
                    )
                    # Also check confidence hasn't degraded significantly from snapshot
                    conf_drop = gt_conf - best_det.confidence
                    assert conf_drop < 0.2, (
                        f"Page {page_num}: confidence dropped from "
                        f"{gt_conf:.3f} to {best_det.confidence:.3f} "
                        f"(Δ={conf_drop:.3f} > 0.2 threshold)"
                    )
