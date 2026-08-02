"""Heading structure repair.

Two operations, both of which rewrite ONLY the /S tag on existing StructElem
objects — never a page's content stream. Visible text, layout, fonts, and
formatting are byte-for-byte unchanged; only what a screen reader announces
each element as changes.

    repair_heading_skips()    — renumber existing headings so levels increase
                                 by at most 1 at a time (no H1 -> H3 jumps).
                                 Purely mechanical: it never decides what IS a
                                 heading, only fixes the numbering of headings
                                 the document's own author already tagged.

    promote_missing_headings() — when a tagged document has ZERO heading
                                 elements, promotes the most plausible /P
                                 candidates based on font size relative to the
                                 document's median body-text size. This is a
                                 heuristic, not a guarantee: every promotion is
                                 listed in the caller's action trail so a
                                 reviewer can verify the result at a glance.
"""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass
from io import BytesIO

import pikepdf
from pikepdf import Name, Object, Pdf

from .scan import _first_mcid, _obj_ref, is_tagged

_MAX_DEPTH = 64
_MAX_HEADING_CHARS = 90        # headings are short; longer text is body copy
_SIZE_RATIO_THRESHOLD = 1.25   # candidate must be >=25% larger than median body text
_MAX_PROMOTED_LEVEL = 3        # cap promotion at H3 so we don't over-fragment


def _walk_all(pdf: Pdf) -> Iterator[Object]:
    """Yield every StructElem in the tree, in document order."""
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
        yield node
        kids = node.get("/K")
        if kids is not None:
            yield from visit(kids, depth + 1)

    yield from visit(pdf.Root.StructTreeRoot.get("/K"), 0)


def _heading_level(elem: Object) -> int | None:
    """1-6 if elem is tagged /H1../H6 or the generic /H (treated as 1)."""
    s = elem.get("/S")
    if s is None:
        return None
    name = str(s)
    if not name.startswith("/H"):
        return None
    suffix = name[2:]
    if suffix == "":
        return 1
    if suffix.isdigit():
        level = int(suffix)
        if 1 <= level <= 6:
            return level
    return None


def extract_text_and_font(
    page: Object, target_mcids: set[int]
) -> dict[int, tuple[str, float | None]]:
    """Walk one page's content stream once; for every marked-content span
    `/<Tag> <</MCID n>> BDC ... EMC` where n is in target_mcids, return the
    text drawn and the font size active throughout that span. The tag itself
    (/P, /H1, /H2, ...) doesn't matter — callers already know which mcids
    they care about; this just resolves mcid -> (text, size).

    Font size is None if the span used more than one distinct size (mixed
    formatting within one paragraph) — callers must treat None as "not a safe
    promotion candidate," not as a fallback size.
    """
    results: dict[int, tuple[str, float | None]] = {}
    try:
        instructions = list(pikepdf.parse_content_stream(page))
    except pikepdf.PdfError:
        return results

    current_font_size: float | None = None
    in_span_mcid: int | None = None
    span_text_parts: list[str] = []
    span_sizes: set[float] = set()

    def _text_of(op: str, operands) -> str:
        if op == "Tj" and operands:
            try:
                return str(operands[0])
            except Exception:
                return ""
        if op == "TJ" and operands:
            parts = []
            try:
                for item in operands[0]:
                    if isinstance(item, (pikepdf.String, str)):
                        parts.append(str(item))
            except Exception:
                pass
            return "".join(parts)
        return ""

    for instr in instructions:
        op = str(instr.operator)
        operands = instr.operands

        if op == "Tf" and len(operands) >= 2:
            try:
                current_font_size = float(operands[1])
            except (TypeError, ValueError):
                current_font_size = None

        elif op == "BDC" and operands:
            props = operands[1] if len(operands) > 1 else None
            mcid = None
            if isinstance(props, pikepdf.Dictionary) and "/MCID" in props:
                try:
                    mcid = int(props.MCID)
                except (TypeError, ValueError):
                    mcid = None
            if mcid is not None and mcid in target_mcids:
                in_span_mcid = mcid
                span_text_parts = []
                span_sizes = set()

        elif op == "EMC":
            if in_span_mcid is not None:
                text = "".join(span_text_parts).strip()
                size = next(iter(span_sizes)) if len(span_sizes) == 1 else None
                results[in_span_mcid] = (text, size)
            in_span_mcid = None

        elif op in ("Tj", "TJ") and in_span_mcid is not None:
            span_text_parts.append(_text_of(op, operands))
            if current_font_size is not None:
                span_sizes.add(current_font_size)

    return results


@dataclass
class HeadingFix:
    pdf_bytes: bytes
    actions: list[str]


def repair_heading_skips(data: bytes) -> HeadingFix:
    """Renumber existing heading levels so they never jump by more than 1
    (e.g. H1 -> H3 becomes H1 -> H2). Only rewrites /S on elements ALREADY
    tagged as headings; never touches non-heading elements or content streams.

    A decrease (H3 -> H1) is always left as-authored — WCAG only penalizes
    jumping to a MORE specific level than the outline supports, not returning
    to a shallower one.
    """
    with pikepdf.open(BytesIO(data)) as pdf:
        if not is_tagged(pdf):
            return HeadingFix(pdf_bytes=data, actions=[])

        headings = [(e, lvl) for e in _walk_all(pdf) if (lvl := _heading_level(e)) is not None]
        if not headings:
            return HeadingFix(pdf_bytes=data, actions=[])

        actions: list[str] = []
        prev_out = 0
        for elem, orig_level in headings:
            new_level = orig_level if prev_out == 0 else min(orig_level, prev_out + 1)
            new_level = max(1, min(6, new_level))
            if new_level != orig_level:
                elem.S = Name(f"/H{new_level}")
                actions.append(f"Renumbered a heading from H{orig_level} to H{new_level}")
            prev_out = new_level

        if not actions:
            return HeadingFix(pdf_bytes=data, actions=[])

        out = BytesIO()
        pdf.save(out)
        return HeadingFix(pdf_bytes=out.getvalue(), actions=actions)


def promote_missing_headings(data: bytes) -> HeadingFix:
    """When a tagged document has zero heading elements, promote the most
    plausible /P candidates to headings based on font size.

    Conservative by construction: only considers /P elements bound to exactly
    one MCID whose content-stream span uses exactly one font size (mixed-size
    paragraphs are left alone, not guessed at), and whose text is short enough
    to plausibly be a heading. No-op (returns the input unchanged) if the
    document already has any heading, or if no candidate clears the size
    threshold — this never invents a heading where the visual design doesn't
    already suggest one.
    """
    with pikepdf.open(BytesIO(data)) as pdf:
        if not is_tagged(pdf):
            return HeadingFix(pdf_bytes=data, actions=[])

        all_elems = list(_walk_all(pdf))
        if any(_heading_level(e) is not None for e in all_elems):
            return HeadingFix(pdf_bytes=data, actions=[])  # already has headings

        pages_by_ref = {_obj_ref(p.obj): n for n, p in enumerate(pdf.pages)}

        # (elem, page_index, mcid) for every single-MCID /P on a resolvable page.
        p_elems: list[tuple[Object, int, int]] = []
        for elem in all_elems:
            if str(elem.get("/S", "")) != "/P":
                continue
            mcid = _first_mcid(elem.get("/K"))
            if mcid is None:
                continue
            pg = elem.get("/Pg")
            if pg is None:
                continue
            page_idx = pages_by_ref.get(_obj_ref(pg))
            if page_idx is None:
                continue
            p_elems.append((elem, page_idx, mcid))

        if not p_elems:
            return HeadingFix(pdf_bytes=data, actions=[])

        mcids_by_page: dict[int, set[int]] = {}
        for _, page_idx, mcid in p_elems:
            mcids_by_page.setdefault(page_idx, set()).add(mcid)

        font_info: dict[tuple[int, int], tuple[str, float | None]] = {}
        for page_idx, mcids in mcids_by_page.items():
            extracted = extract_text_and_font(pdf.pages[page_idx], mcids)
            for mcid, val in extracted.items():
                font_info[(page_idx, mcid)] = val

        body_sizes: list[float] = []
        candidates: list[tuple[Object, str, float]] = []
        for elem, page_idx, mcid in p_elems:
            text, size = font_info.get((page_idx, mcid), ("", None))
            if size is None or not text:
                continue
            body_sizes.append(size)
            if len(text) <= _MAX_HEADING_CHARS:
                candidates.append((elem, text, size))

        if not body_sizes or not candidates:
            return HeadingFix(pdf_bytes=data, actions=[])

        body_sizes.sort()
        median = body_sizes[len(body_sizes) // 2]
        threshold = median * _SIZE_RATIO_THRESHOLD

        promoted = [(e, t, s) for e, t, s in candidates if s >= threshold]
        if not promoted:
            return HeadingFix(pdf_bytes=data, actions=[])

        # Rank distinct qualifying sizes descending -> H1, H2, H3 (capped).
        # Rank-based (not absolute), so the largest promoted size is always H1
        # — this can never itself produce a skipped level.
        distinct_sizes = sorted({s for _, _, s in promoted}, reverse=True)
        level_by_size = {s: min(i + 1, _MAX_PROMOTED_LEVEL) for i, s in enumerate(distinct_sizes)}

        actions: list[str] = []
        for elem, text, size in promoted:
            level = level_by_size[size]
            elem.S = Name(f"/H{level}")
            snippet = text if len(text) <= 60 else text[:57] + "..."
            actions.append(f'Tagged "{snippet}" as H{level} ({size:.0f}pt vs {median:.0f}pt body text)')

        out = BytesIO()
        pdf.save(out)
        return HeadingFix(pdf_bytes=out.getvalue(), actions=actions)
