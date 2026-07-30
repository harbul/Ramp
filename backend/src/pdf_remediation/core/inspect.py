"""Bind each /Figure structure element to the actual image on the page.

The structure tree tells us a figure exists and which marked-content id it owns.
It does not tell us which image XObject that is. To send pixels to the model we
have to read the page's content stream, track the BDC/EMC nesting, and find the
`Do` operator that draws inside the figure's marked-content sequence.
"""

from __future__ import annotations

from dataclasses import dataclass

import pikepdf
from pikepdf import Name, Object, Pdf

from ..models import FigureRef


@dataclass
class FigureImage:
    """A figure we can actually generate alt text for, because we found pixels."""

    figure: FigureRef
    xobject_name: str          # e.g. "/Im0"
    xobject: Object


def _xobject_names_by_mcid(page: pikepdf.Page) -> dict[int, list[str]]:
    """Walk the content stream and record which XObjects are drawn inside each
    marked-content sequence.

    BDC/EMC nest, so track a stack rather than a single current id — an image
    inside /Figure > /Span would otherwise be attributed to the wrong element
    (or to none).
    """
    drawn: dict[int, list[str]] = {}
    mcid_stack: list[int | None] = []

    try:
        instructions = pikepdf.parse_content_stream(page)
    except pikepdf.PdfError:
        return drawn  # unparseable content stream — caller falls back

    for instruction in instructions:
        op = str(instruction.operator)

        if op == "BDC":
            mcid: int | None = None
            if len(instruction.operands) >= 2:
                props = instruction.operands[1]
                if isinstance(props, pikepdf.Dictionary) and "/MCID" in props:
                    mcid = int(props.MCID)
            mcid_stack.append(mcid)

        elif op == "BMC":
            mcid_stack.append(None)  # no properties, so no id — still nests

        elif op == "EMC":
            if mcid_stack:
                mcid_stack.pop()

        elif op == "Do" and instruction.operands:
            # Attribute to the innermost enclosing sequence that has an id.
            current = next((m for m in reversed(mcid_stack) if m is not None), None)
            if current is not None:
                drawn.setdefault(current, []).append(str(instruction.operands[0]))

    return drawn


def _lookup_xobject(page: pikepdf.Page, name: str) -> Object | None:
    resources = page.obj.get("/Resources")
    if resources is None:
        return None
    xobjects = resources.get("/XObject")
    if xobjects is None:
        return None
    obj = xobjects.get(name)
    if obj is None or obj.get("/Subtype") != Name.Image:
        return None
    return obj


def find_figure_images(pdf: Pdf, figures: list[FigureRef]) -> tuple[list[FigureImage], list[FigureRef]]:
    """Split figures into those we found an image for and those we didn't.

    A /Figure can legitimately wrap a vector drawing rather than a raster image.
    We have no rasteriser (the obvious one, PyMuPDF, is AGPL — see
    requirements.txt), so there are no pixels to send the model. Those figures
    are returned as `unresolved` and reported rather than silently dropped: a
    human still needs to describe them.
    """
    resolved: list[FigureImage] = []
    unresolved: list[FigureRef] = []

    by_page: dict[int, dict[int, list[str]]] = {}

    for figure in figures:
        if figure.mcid is None or figure.page_number < 1 or figure.page_number > len(pdf.pages):
            unresolved.append(figure)
            continue

        page = pdf.pages[figure.page_number - 1]
        if figure.page_number not in by_page:
            by_page[figure.page_number] = _xobject_names_by_mcid(page)

        names = by_page[figure.page_number].get(figure.mcid, [])
        xobject = next(
            (obj for n in names if (obj := _lookup_xobject(page, n)) is not None), None
        )
        if xobject is None:
            unresolved.append(figure)
            continue

        name = next(n for n in names if _lookup_xobject(page, n) is not None)
        resolved.append(FigureImage(figure=figure, xobject_name=name, xobject=xobject))

    return resolved, unresolved
