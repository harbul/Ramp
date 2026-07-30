"""Render a figure's page region to PNG.

Why this exists: a tagged /Figure often draws from *several* image XObjects (one
real campus figure was 8 tiles), or from vector content with no image XObject at
all. Extracting a single XObject sends the model a fragment of the figure. A
PDF/UA figure carries its layout bounding box at /A /BBox, so the honest thing
is to render that region of the page — the figure exactly as a sighted reader
sees it, composites and vector art included.

pypdfium2 is BSD-3-Clause / Apache-2.0 — unlike PyMuPDF (AGPL), it can be
bundled in a hosted service without a licence obligation.
"""

from __future__ import annotations

from io import BytesIO

import pypdfium2 as pdfium

from .images import MAX_LONG_EDGE, downscale

# A figure whose layout box is smaller than this (in points, ~1/72") is a rule,
# a bullet, or a spacer — not something to spend a vision call on.
MIN_BBOX_EDGE_PT = 10.0

# 2 device pixels per point. A US-Letter page (612x792 pt) renders to
# 1224x1584 px — under the model's 2576 px cap, so most figures never downscale.
RENDER_SCALE = 2.0

BBox = tuple[float, float, float, float]


class RenderError(Exception):
    pass


def bbox_is_meaningful(bbox: BBox) -> bool:
    x0, y0, x1, y1 = _normalise(bbox)
    return (x1 - x0) >= MIN_BBOX_EDGE_PT and (y1 - y0) >= MIN_BBOX_EDGE_PT


def crop_margins(bbox: BBox, mediabox: BBox, rotation: int) -> tuple[float, float, float, float]:
    """Convert a figure BBox (unrotated user space) into pypdfium2 crop margins
    (left, bottom, right, top) in the page's *displayed* orientation.

    The BBox is in the PDF's native coordinate system. pypdfium2 applies /Rotate
    before rendering, so the margins have to be permuted to match. Derivation,
    verified against a real /Rotate=90 page:

        rotating the page clockwise moves the original left edge to the top, so
        each rotation is a cyclic permutation of the four unrotated margins.
    """
    mx0, my0, mx1, my1 = mediabox
    page_w = mx1 - mx0
    page_h = my1 - my0

    bx0, by0, bx1, by1 = _normalise(bbox)
    # Margins from each edge, bottom-left origin, unrotated.
    left = bx0 - mx0
    right = page_w - (bx1 - mx0)
    bottom = by0 - my0
    top = page_h - (by1 - my0)

    rotation %= 360
    if rotation == 0:
        margins = (left, bottom, right, top)
    elif rotation == 90:
        margins = (bottom, right, top, left)
    elif rotation == 180:
        margins = (right, top, left, bottom)
    elif rotation == 270:
        margins = (top, left, bottom, right)
    else:
        # Non-orthogonal /Rotate is out of spec; treat as unrotated.
        margins = (left, bottom, right, top)

    # Clamp tiny negatives from float noise or a BBox that pokes past the page.
    return tuple(max(0.0, m) for m in margins)  # type: ignore[return-value]


def render_figure_png(pdf_bytes: bytes, page_number: int, bbox: BBox) -> bytes:
    """Render one figure region to PNG. Opens the document — for several figures
    use render_regions, which opens once."""
    doc = pdfium.PdfDocument(pdf_bytes)
    try:
        return _render_one(doc, page_number, bbox)
    finally:
        doc.close()


def render_regions(pdf_bytes: bytes, requests: list[tuple[int, BBox]]) -> list[bytes | None]:
    """Render many figure regions from a single open.

    Returns one entry per request, in order; None where that figure couldn't be
    rendered (out-of-range page, pdfium failure). Opening a large PDF is the
    expensive part, so a 16-figure document opens it once, not 16 times.
    """
    doc = pdfium.PdfDocument(pdf_bytes)
    try:
        out: list[bytes | None] = []
        for page_number, bbox in requests:
            try:
                out.append(_render_one(doc, page_number, bbox))
            except RenderError as exc:
                out.append(None)
                # Caller decides what to do; this is expected for vector figures
                # whose box renders empty, or a malformed BBox.
                _log_skip(page_number, exc)
        return out
    finally:
        doc.close()


def _render_one(doc: pdfium.PdfDocument, page_number: int, bbox: BBox) -> bytes:
    if page_number < 1 or page_number > len(doc):
        raise RenderError(f"Page {page_number} out of range (1..{len(doc)}).")

    page = doc[page_number - 1]
    mediabox = page.get_mediabox()
    if mediabox is None:
        raise RenderError("Page has no MediaBox.")
    rotation = page.get_rotation()

    crop = crop_margins(bbox, mediabox, rotation)

    try:
        # may_draw_forms=False: don't paint AcroForm field overlays over the
        # figure (this document has an AcroForm).
        bitmap = page.render(scale=RENDER_SCALE, crop=crop, may_draw_forms=False)
        pil = bitmap.to_pil()
    except Exception as exc:  # pdfium raises assorted low-level errors
        raise RenderError(f"pdfium could not render the region: {exc}") from exc

    if pil.width < 1 or pil.height < 1:
        raise RenderError("Rendered region was empty.")

    if pil.mode not in ("RGB", "L"):
        pil = pil.convert("RGB")
    pil = downscale(pil, MAX_LONG_EDGE)

    out = BytesIO()
    pil.save(out, format="PNG", optimize=True)
    return out.getvalue()


def _log_skip(page_number: int, exc: RenderError) -> None:
    import logging

    logging.getLogger(__name__).warning("skipped render on page %d: %s", page_number, exc)


def _normalise(bbox: BBox) -> BBox:
    """PDF rectangles aren't required to be lower-left..upper-right ordered."""
    x0, y0, x1, y1 = bbox
    return (min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1))
