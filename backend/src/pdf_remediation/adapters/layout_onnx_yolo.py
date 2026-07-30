"""ONNX-based YOLOv10 document layout detector.

Uses a YOLOv10 model trained on DocLayNet, exported to ONNX format.
Detects figures, tables, titles, and other document elements with tight
bounding boxes — no systematic offset like Claude's vision model.

Model: Oblix/yolov10m-doclaynet_ONNX_document-layout-analysis (~65MB)
License: MIT (onnxruntime) + Apache-2.0 (model weights)
Speed: ~0.2s/page on CPU (MacOS ARM)
"""

from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
from PIL import Image

from ..ports.layout import FigureDetection

log = logging.getLogger(__name__)

# HuggingFace repo for the ONNX model
_HF_REPO_ID = "Oblix/yolov10m-doclaynet_ONNX_document-layout-analysis"
_HF_FILENAME = "onnx/model.onnx"

# DocLayNet class labels
_LABELS = {
    0: "Caption",
    1: "Footnote",
    2: "Formula",
    3: "List-item",
    4: "Page-footer",
    5: "Page-header",
    6: "Picture",
    7: "Section-header",
    8: "Table",
    9: "Text",
    10: "Title",
}

# Only these classes are treated as "figures" needing alt text
_FIGURE_CLASSES = {6}  # Picture

# Model input size
_INPUT_SIZE = 640

# Minimum detection dimensions in PDF points (filters out thin logos/rules)
_MIN_WIDTH_PT = 30.0
_MIN_HEIGHT_PT = 30.0


class OnnxYoloLayoutDetector:
    """Layout detector using ONNX YOLOv10 trained on DocLayNet.

    Lazily loads the model on first call to avoid slow startup when
    layout detection is not needed.
    """

    def __init__(
        self,
        *,
        model_path: str | Path | None = None,
        confidence_threshold: float = 0.3,
    ):
        """
        Args:
            model_path: Path to the ONNX model file. If None, downloads from HuggingFace.
            confidence_threshold: Minimum confidence to accept a detection.
        """
        self._model_path = model_path
        self._confidence_threshold = confidence_threshold
        self._session = None  # Lazy init

    def _get_session(self):
        """Lazily load the ONNX model."""
        if self._session is not None:
            return self._session

        import onnxruntime as ort

        if self._model_path is None:
            from huggingface_hub import hf_hub_download

            log.info("Downloading layout detection model from HuggingFace...")
            self._model_path = hf_hub_download(
                repo_id=_HF_REPO_ID,
                filename=_HF_FILENAME,
            )

        log.info("Loading ONNX layout model from %s", self._model_path)
        self._session = ort.InferenceSession(
            str(self._model_path),
            providers=["CPUExecutionProvider"],
        )
        return self._session

    def detect_figures(
        self,
        pil_image: Image.Image,
        page_width_pts: float,
        page_height_pts: float,
    ) -> list[FigureDetection]:
        """Detect figure regions in a rendered page image.

        Args:
            pil_image: Rendered page as a PIL Image (any size/scale).
            page_width_pts: Page width in PDF points.
            page_height_pts: Page height in PDF points.

        Returns:
            List of FigureDetection objects for Picture-class detections,
            with bboxes in PDF points (top-left origin).
        """
        session = self._get_session()

        # Preprocess: resize to model input, normalize to [0, 1], CHW format
        orig_w, orig_h = pil_image.size
        img_rgb = pil_image.convert("RGB") if pil_image.mode != "RGB" else pil_image
        img_resized = img_rgb.resize((_INPUT_SIZE, _INPUT_SIZE), Image.BILINEAR)

        img_array = np.array(img_resized, dtype=np.float32) / 255.0
        img_array = np.transpose(img_array, (2, 0, 1))  # HWC -> CHW
        img_array = np.expand_dims(img_array, axis=0)  # [1, 3, 640, 640]

        # Run inference
        input_name = session.get_inputs()[0].name
        outputs = session.run(None, {input_name: img_array})

        # Parse: output is [1, N, 6] = [x1, y1, x2, y2, score, class_id]
        # Coordinates are in the 640x640 resized space
        predictions = outputs[0][0]

        # Scale factors: 640 -> original pixels -> PDF points
        scale_x = page_width_pts / _INPUT_SIZE
        scale_y = page_height_pts / _INPUT_SIZE

        detections: list[FigureDetection] = []

        for pred in predictions:
            x1, y1, x2, y2, score, class_id = pred
            if score < self._confidence_threshold:
                continue

            class_id = int(class_id)
            if class_id not in _FIGURE_CLASSES:
                continue

            # Convert from 640x640 space directly to PDF points
            pdf_x0 = float(x1) * scale_x
            pdf_y0 = float(y1) * scale_y
            pdf_x1 = float(x2) * scale_x
            pdf_y1 = float(y2) * scale_y

            # Filter out tiny detections (thin logos, rules, artifacts)
            width_pt = pdf_x1 - pdf_x0
            height_pt = pdf_y1 - pdf_y0
            if width_pt < _MIN_WIDTH_PT or height_pt < _MIN_HEIGHT_PT:
                log.debug(
                    "Skipping small detection: %.0fx%.0f pts, conf=%.2f",
                    width_pt, height_pt, score,
                )
                continue

            label = _LABELS.get(class_id, f"class_{class_id}")
            detections.append(FigureDetection(
                bbox=(pdf_x0, pdf_y0, pdf_x1, pdf_y1),
                label=label,
                confidence=float(score),
            ))

        log.info(
            "Layout detection found %d figure(s) on page (%.0fx%.0f pts)",
            len(detections), page_width_pts, page_height_pts,
        )
        return detections
