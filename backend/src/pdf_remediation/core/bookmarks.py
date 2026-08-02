"""Bookmark (outline) generation from the document's heading structure, and
validity-checking for existing outlines.

The outline built here is FLAT — one top-level entry per heading, in document
order — rather than nested by heading level. Simpler to construct correctly,
and it still gives full one-click navigation to every section, which is what
WCAG 2.4.5 actually requires.

Regeneration is unconditional: whenever generate_bookmarks_from_headings() is
called on a document with headings, it REPLACES whatever's at /Outlines. That
single code path covers both "add bookmarks" (nothing was there) and "fix
broken bookmarks" (something was there but didn't resolve) — no separate
repair-vs-create branch needed.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO

import pikepdf
from pikepdf import Array, Dictionary, Name, Object, Pdf, String

from .headings import _heading_level, _walk_all, extract_text_and_font
from .scan import _first_mcid, _obj_ref, is_tagged

# Keep the Modernization recap readable: list bookmarks individually up to
# this many, otherwise summarize as a single "Added N bookmarks" line.
_MAX_LISTED_BOOKMARKS = 8


def _resolve_dest_page_ref(pdf: Pdf, item: Object) -> str | None:
    """The object ref of the page an outline item's /Dest or /A(GoTo) points
    at, or None if it doesn't resolve to anything."""
    dest = item.get("/Dest")
    if dest is not None:
        try:
            if isinstance(dest, pikepdf.Array) and len(dest) > 0:
                return _obj_ref(dest[0])
            if isinstance(dest, (pikepdf.String, str)):
                return None  # named destination — not resolved here, treated as unverifiable
        except Exception:
            return None
    action = item.get("/A")
    if action is not None and str(action.get("/S", "")) == "/GoTo":
        d = action.get("/D")
        if isinstance(d, pikepdf.Array) and len(d) > 0:
            try:
                return _obj_ref(d[0])
            except Exception:
                return None
    return None


def outline_is_valid(pdf: Pdf) -> bool:
    """True iff /Outlines exists, has at least one child, and every child's
    destination resolves to an actual page in this document.

    A bare /Outlines dict with no /First (empty outline), or one whose items
    point at pages that don't exist in this document (a common symptom of a
    PDF that was assembled/merged from another file without fixing its
    bookmarks), both count as broken.
    """
    outlines = pdf.Root.get("/Outlines")
    if outlines is None:
        return False
    first = outlines.get("/First")
    if first is None:
        return False

    page_refs = {_obj_ref(p.obj) for p in pdf.pages}
    node = first
    seen: set[str] = set()
    count = 0
    while node is not None:
        try:
            ref = _obj_ref(node)
        except Exception:
            return False
        if ref in seen:
            return False  # cyclic linked list — malformed
        seen.add(ref)
        count += 1
        dest_ref = _resolve_dest_page_ref(pdf, node)
        if dest_ref is not None and dest_ref not in page_refs:
            return False  # points at a page that isn't in this document
        node = node.get("/Next")

    return count > 0


@dataclass
class BookmarkFix:
    pdf_bytes: bytes
    actions: list[str]


def generate_bookmarks_from_headings(data: bytes) -> BookmarkFix:
    """Build a flat outline, one entry per heading, replacing any existing
    (possibly broken) /Outlines. No-op if the document has no tagged
    headings yet — run repair_heading_skips()/promote_missing_headings()
    first so there's something to bookmark.
    """
    with pikepdf.open(BytesIO(data)) as pdf:
        if not is_tagged(pdf):
            return BookmarkFix(pdf_bytes=data, actions=[])

        headings = [(e, lvl) for e in _walk_all(pdf) if (lvl := _heading_level(e)) is not None]
        if not headings:
            return BookmarkFix(pdf_bytes=data, actions=[])

        pages_by_ref = {_obj_ref(p.obj): n for n, p in enumerate(pdf.pages)}

        # Resolve each heading to (page_index, mcid); drop any that don't
        # resolve to a real page (shouldn't happen for well-formed input, but
        # never crash on a malformed one).
        resolved: list[tuple[int, int]] = []  # (page_index, mcid)
        for elem, _lvl in headings:
            mcid = _first_mcid(elem.get("/K"))
            pg = elem.get("/Pg")
            if mcid is None or pg is None:
                continue
            page_idx = pages_by_ref.get(_obj_ref(pg))
            if page_idx is None:
                continue
            resolved.append((page_idx, mcid))

        if not resolved:
            return BookmarkFix(pdf_bytes=data, actions=[])

        # Extract label text for every heading, one content-stream parse per page.
        mcids_by_page: dict[int, set[int]] = {}
        for page_idx, mcid in resolved:
            mcids_by_page.setdefault(page_idx, set()).add(mcid)

        text_by_key: dict[tuple[int, int], str] = {}
        for page_idx, mcids in mcids_by_page.items():
            extracted = extract_text_and_font(pdf.pages[page_idx], mcids)
            for mcid, (text, _size) in extracted.items():
                text_by_key[(page_idx, mcid)] = text

        entries: list[tuple[Object, str]] = []
        for page_idx, mcid in resolved:
            label = text_by_key.get((page_idx, mcid), "").strip()
            if not label:
                label = f"Page {page_idx + 1}"
            entries.append((pdf.pages[page_idx].obj, label))

        outlines_dict = pdf.make_indirect(Dictionary(Type=Name.Outlines))
        item_objs: list[Object] = []
        for page_obj, label in entries:
            item = pdf.make_indirect(
                Dictionary(
                    Title=String(label),
                    Parent=outlines_dict,
                    Dest=Array([page_obj, Name.Fit]),
                )
            )
            item_objs.append(item)

        for i, item in enumerate(item_objs):
            if i > 0:
                item.Prev = item_objs[i - 1]
            if i < len(item_objs) - 1:
                item.Next = item_objs[i + 1]

        outlines_dict.First = item_objs[0]
        outlines_dict.Last = item_objs[-1]
        outlines_dict.Count = len(item_objs)
        pdf.Root.Outlines = outlines_dict

        if len(entries) <= _MAX_LISTED_BOOKMARKS:
            actions = [f'Bookmark added: "{label}"' for _page_obj, label in entries]
        else:
            actions = [f"Added {len(entries)} bookmarks from the document's heading structure"]

        out = BytesIO()
        pdf.save(out)
        return BookmarkFix(pdf_bytes=out.getvalue(), actions=actions)
