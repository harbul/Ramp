"""Generate layout detection ground truth from the ONNX detector.

Run this once to snapshot the current (validated) ONNX detections as ground
truth. Subsequent pytest runs compare live detections against this snapshot.

Usage:
    cd backend
    source .venv/bin/activate
    PYTHONPATH=src python tests/fixtures/snapshot_layout.py

Re-run after intentional changes to the model, thresholds, or preprocessing.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pypdfium2 as pdfium

# Add src to path for imports
BACKEND = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BACKEND / "src"))

from pdf_remediation.adapters.layout_onnx_yolo import OnnxYoloLayoutDetector

DEMO_PDF = BACKEND / "demo" / "sample_inaccessible.pdf"
GROUND_TRUTH_PATH = Path(__file__).parent / "layout_ground_truth.json"


def snapshot() -> dict:
    """Run the ONNX detector on the demo PDF and return structured results."""
    detector = OnnxYoloLayoutDetector()

    doc = pdfium.PdfDocument(str(DEMO_PDF))
    try:
        pages = []
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_w = page.get_width()
            page_h = page.get_height()

            # Render at 2x scale (same as production pipeline)
            bitmap = page.render(scale=2.0)
            pil_image = bitmap.to_pil()

            detections = detector.detect_figures(pil_image, page_w, page_h)

            figures = []
            for det in detections:
                figures.append({
                    "bbox": list(det.bbox),
                    "confidence": round(det.confidence, 4),
                    "label": det.label,
                })

            pages.append({
                "page_number": page_idx + 1,
                "page_width_pts": page_w,
                "page_height_pts": page_h,
                "figures": figures,
            })
    finally:
        doc.close()

    return {
        "source_pdf": "demo/sample_inaccessible.pdf",
        "detector": "OnnxYoloLayoutDetector",
        "confidence_threshold": 0.3,
        "pages": pages,
    }


def main() -> None:
    if not DEMO_PDF.exists():
        print(f"ERROR: Demo PDF not found at {DEMO_PDF}")
        print("Run: python backend/demo/make_sample_pdf.py")
        sys.exit(1)

    print(f"Running ONNX detector on {DEMO_PDF.name}...")
    result = snapshot()

    total_figures = sum(len(p["figures"]) for p in result["pages"])
    print(f"  Pages: {len(result['pages'])}")
    print(f"  Total figures detected: {total_figures}")

    for page in result["pages"]:
        print(f"  Page {page['page_number']}: {len(page['figures'])} figure(s)")
        for fig in page["figures"]:
            bbox = fig["bbox"]
            print(
                f"    {fig['label']} conf={fig['confidence']:.2f} "
                f"bbox=[{bbox[0]:.0f}, {bbox[1]:.0f}, {bbox[2]:.0f}, {bbox[3]:.0f}]"
            )

    GROUND_TRUTH_PATH.write_text(json.dumps(result, indent=2) + "\n")
    print(f"\nGround truth written to: {GROUND_TRUTH_PATH}")


if __name__ == "__main__":
    main()
