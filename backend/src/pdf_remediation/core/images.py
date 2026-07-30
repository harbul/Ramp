"""Extract figure images and prepare them for the model."""

from __future__ import annotations

from io import BytesIO

import pikepdf
from PIL import Image

# Claude's high-resolution vision tops out at 2576px on the long edge. Sending
# more costs tokens (a full-res image runs ~4.8k) and buys nothing.
MAX_LONG_EDGE = 2576

# Below this, an "image" is a rule, a bullet, or a spacer — not something worth
# a vision call or a reviewer's attention.
MIN_MEANINGFUL_EDGE = 16


class ImageExtractionError(Exception):
    """The XObject exists but we couldn't turn it into pixels."""


def extract_png(xobject: pikepdf.Object) -> bytes:
    """Decode an image XObject to PNG bytes, downscaled for the model."""
    try:
        pdf_image = pikepdf.PdfImage(xobject)
        pil = pdf_image.as_pil_image()
    except Exception as exc:  # pikepdf raises a variety of decode errors
        raise ImageExtractionError(f"Could not decode image XObject: {exc}") from exc

    if pil.mode not in ("RGB", "L"):
        pil = pil.convert("RGB")

    pil = downscale(pil)

    out = BytesIO()
    pil.save(out, format="PNG", optimize=True)
    return out.getvalue()


def downscale(pil: Image.Image, max_edge: int = MAX_LONG_EDGE) -> Image.Image:
    long_edge = max(pil.width, pil.height)
    if long_edge <= max_edge:
        return pil
    scale = max_edge / long_edge
    return pil.resize(
        (max(1, round(pil.width * scale)), max(1, round(pil.height * scale))),
        Image.LANCZOS,
    )


def is_meaningful(xobject: pikepdf.Object) -> bool:
    """Cheap size gate, read from the dict — no decode."""
    try:
        width = int(xobject.get("/Width", 0))
        height = int(xobject.get("/Height", 0))
    except (TypeError, ValueError):
        return False
    return width >= MIN_MEANINGFUL_EDGE and height >= MIN_MEANINGFUL_EDGE
