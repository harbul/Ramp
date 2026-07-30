"""Layout detection contract.

A LayoutDetector identifies visual regions (figures, tables, etc.) on a
rendered page image and returns their bounding boxes in PDF coordinates.
This replaces relying on Claude's imprecise FIGURE bounding boxes.
"""

from __future__ import annotations

from typing import Protocol

from PIL import Image


class FigureDetection:
    """A single detected figure region."""

    __slots__ = ("bbox", "label", "confidence")

    def __init__(self, bbox: tuple[float, float, float, float], label: str, confidence: float):
        """
        Args:
            bbox: (x0, y0, x1, y1) in PDF points, top-left origin.
            label: Detection class (e.g. "Picture", "Table").
            confidence: Model confidence score 0.0-1.0.
        """
        self.bbox = bbox
        self.label = label
        self.confidence = confidence

    def __repr__(self) -> str:
        return f"FigureDetection(bbox={self.bbox}, label={self.label!r}, conf={self.confidence:.2f})"


class LayoutDetector(Protocol):
    """Contract for layout detection services."""

    def detect_figures(
        self,
        pil_image: Image.Image,
        page_width_pts: float,
        page_height_pts: float,
    ) -> list[FigureDetection]:
        """Detect figure regions in a rendered page image.

        Args:
            pil_image: Rendered page as a PIL Image (any size/scale).
            page_width_pts: Page width in PDF points (e.g. 612 for US Letter).
            page_height_pts: Page height in PDF points (e.g. 792 for US Letter).

        Returns:
            List of FigureDetection objects with bboxes in PDF points (top-left origin).
        """
        ...
