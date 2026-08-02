"""Table header repair.

Promotes a table's first row from /TD to /TH cells when none of that row's
cells are already tagged as headers - the exact recipe a reviewer would
follow by hand in a PDF editor ("select the first row, change /TD to /TH,
set /Scope=Column"). A tag-only edit: no content stream, visible text, or
layout is touched, only which structure tag each first-row cell wears.

The row-walking helpers here are also used by core.wcag's table-headers
check, so detection and repair agree on what counts as a table's "rows" -
including the /THead / /TBody / /TFoot wrapper shape, not just a flat
/Table -> /TR list.
"""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass
from io import BytesIO

import pikepdf
from pikepdf import Dictionary, Name, Object, Pdf

from .scan import is_tagged

_MAX_DEPTH = 64
_ROW_CONTAINER_TAGS = {"/THead", "/TBody", "/TFoot"}


def walk_tables(pdf: Pdf) -> Iterator[Object]:
    """Yield every /Table StructElem, in document order."""
    if "/StructTreeRoot" not in pdf.Root:
        return

    def visit(node: Object, depth: int) -> Iterator[Object]:
        if depth > _MAX_DEPTH:
            return
        if isinstance(node, pikepdf.Array):
            for kid in node:
                yield from visit(kid, depth + 1)
            return
        if not isinstance(node, pikepdf.Dictionary):
            return
        if node.get("/S") == Name.Table:
            yield node
        kids = node.get("/K")
        if kids is not None:
            yield from visit(kids, depth + 1)

    yield from visit(pdf.Root.StructTreeRoot.get("/K"), 0)


def _as_list(kids: Object | None) -> list[Object]:
    if kids is None:
        return []
    items = kids if isinstance(kids, pikepdf.Array) else [kids]
    return [k for k in items if isinstance(k, pikepdf.Dictionary)]


def table_rows(table: Object) -> list[Object]:
    """A table's /TR elements in order, whether they sit directly under
    /Table or are wrapped in /THead, /TBody, and/or /TFoot - all valid
    PDF/UA table shapes."""
    rows: list[Object] = []
    for child in _as_list(table.get("/K")):
        tag = str(child.get("/S", ""))
        if tag == "/TR":
            rows.append(child)
        elif tag in _ROW_CONTAINER_TAGS:
            rows.extend(k for k in _as_list(child.get("/K")) if str(k.get("/S", "")) == "/TR")
    return rows


def row_cells(row: Object) -> list[Object]:
    return _as_list(row.get("/K"))


@dataclass
class TableFix:
    pdf_bytes: bytes
    actions: list[str]


def fix_table_headers(data: bytes) -> TableFix:
    """For every table whose first row has no /TH cell, retag that row's
    /TD cells as /TH with /Scope /Column.

    Skips tables with fewer than two rows (nothing to distinguish a header
    row from) and tables whose first row already has at least one /TH cell
    (already correct - possibly a header shape this fixer wouldn't have
    built itself, e.g. header cells mixed with row-scope cells).
    """
    with pikepdf.open(BytesIO(data)) as pdf:
        if not is_tagged(pdf):
            return TableFix(pdf_bytes=data, actions=[])

        actions: list[str] = []
        for index, table in enumerate(walk_tables(pdf), start=1):
            rows = table_rows(table)
            if len(rows) < 2:
                continue

            cells = row_cells(rows[0])
            if not cells or any(str(c.get("/S", "")) == "/TH" for c in cells):
                continue

            converted = 0
            for cell in cells:
                if str(cell.get("/S", "")) != "/TD":
                    continue
                cell.S = Name.TH
                cell.A = Dictionary(O=Name.Table, Scope=Name.Column)
                converted += 1

            if converted:
                plural = "s" if converted != 1 else ""
                actions.append(f"Table {index}: tagged {converted} first-row cell{plural} as column headers")

        if not actions:
            return TableFix(pdf_bytes=data, actions=[])

        out = BytesIO()
        pdf.save(out)
        return TableFix(pdf_bytes=out.getvalue(), actions=actions)
