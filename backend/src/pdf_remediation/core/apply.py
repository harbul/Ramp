"""Write approved alt text into a tagged PDF.

This is the whole product in one file. It only ever sets /Alt on a /Figure
structure element that already exists — it never builds a structure tree, and it
refuses outright on an untagged PDF rather than emit a file that looks
remediated but reads as empty to a screen reader.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO

import pikepdf
from pikepdf import Dictionary, Name, Object, Pdf, String

from ..errors import NotTagged, PdfUnreadable, VerificationFailed
from ..models import ALT_TEXT_MAX_CHARS
from .scan import _first_mcid, _obj_ref, is_tagged, walk_figures


@dataclass
class AppliedFix:
    struct_elem_ref: str      # object ref in the INPUT; unstable across save
    page_number: int
    alt_text: str
    # Marked-content id: stable across save and the actual binding to page
    # content. This, not struct_elem_ref, is what verification matches on.
    mcid: int | None


@dataclass
class ApplyResult:
    pdf_bytes: bytes
    applied: list[AppliedFix]
    skipped_refs: list[str]     # requested but not found in the document
    marked_info_added: bool


def _find_figures_by_ref(pdf: Pdf) -> dict[str, Object]:
    """Map struct_elem_ref -> the live /Figure object in this Pdf handle.

    walk_figures() yields our value objects; to *write* we need the pikepdf
    object itself, so re-walk and index by the same ref scheme.
    """
    found: dict[str, Object] = {}
    if "/StructTreeRoot" not in pdf.Root:
        return found

    def visit(node: Object, depth: int = 0) -> None:
        if depth > 64:
            return
        if isinstance(node, pikepdf.Array):
            for kid in node:
                visit(kid, depth + 1)
            return
        if not isinstance(node, pikepdf.Dictionary):
            return
        if node.get("/S") == Name.Figure:
            found.setdefault(_obj_ref(node), node)
        kids = node.get("/K")
        if kids is not None:
            visit(kids, depth + 1)

    visit(pdf.Root.StructTreeRoot.get("/K"))
    return found


def apply_alt_text(data: bytes, approvals: dict[str, str]) -> ApplyResult:
    """Set /Alt on each approved figure.

    `approvals` maps struct_elem_ref -> the reviewer's approved text. Text is the
    reviewer's, not the model's: whatever they edited is what lands in the file.

    Applying to a figure that already has /Alt overwrites it — a reviewer
    correcting bad alt text is a legitimate action, not an error.
    """
    try:
        pdf = pikepdf.open(BytesIO(data), allow_overwriting_input=False)
    except pikepdf.PasswordError as exc:
        raise PdfUnreadable("PDF is encrypted and cannot be opened.") from exc
    except pikepdf.PdfError as exc:
        raise PdfUnreadable(f"PDF could not be parsed: {exc}") from exc

    with pdf:
        if not is_tagged(pdf):
            raise NotTagged(
                "This PDF has no structure tree, so alt text written into it would be "
                "unreachable by screen readers. It must be tagged before it can be "
                "remediated."
            )

        figures = _find_figures_by_ref(pdf)
        applied: list[AppliedFix] = []
        skipped: list[str] = []

        pages_by_ref = {_obj_ref(p.obj): n for n, p in enumerate(pdf.pages, start=1)}

        for ref, text in approvals.items():
            elem = figures.get(ref)
            if elem is None:
                skipped.append(ref)
                continue

            cleaned = _normalise(text)
            elem.Alt = String(cleaned)

            pg = elem.get("/Pg")
            page_number = pages_by_ref.get(_obj_ref(pg), 0) if pg is not None else 0
            applied.append(
                AppliedFix(
                    struct_elem_ref=ref,
                    page_number=page_number,
                    alt_text=cleaned,
                    mcid=_first_mcid(elem.get("/K")),
                )
            )

        # PDF/UA requires the catalog to declare the document is tagged. A tree
        # without this flag is a real (and common) defect in legacy files, and
        # it's free to repair while we're here.
        marked_added = False
        mark_info = pdf.Root.get("/MarkInfo")
        if mark_info is None:
            pdf.Root.MarkInfo = Dictionary(Marked=True)
            marked_added = True
        elif not bool(mark_info.get("/Marked", False)):
            mark_info.Marked = True
            marked_added = True

        out = BytesIO()
        pdf.save(out)

    return ApplyResult(
        pdf_bytes=out.getvalue(),
        applied=applied,
        skipped_refs=skipped,
        marked_info_added=marked_added,
    )


def _normalise(text: str) -> str:
    """Collapse whitespace. Length is enforced at the API edge (AltTextTooLong)
    so the reviewer gets the error, not a silent truncation here."""
    return " ".join(text.split())


def verify_alt_text(data: bytes, applied: list[AppliedFix]) -> None:
    """Re-open the output and assert every applied /Alt is present and reachable
    through the structure tree.

    Matches on (page, mcid), NOT on struct_elem_ref: pikepdf renumbers objects on
    save, so the input ref no longer identifies the output object. (page, mcid) is
    stable across save — and it's the marked-content binding that actually makes
    the alt text reachable, so it's the better thing to check anyway.

    Called on the bytes we're about to hand back. If this raises, the file does
    not ship — a remediation that can't be read back isn't one.
    """
    try:
        with pikepdf.open(BytesIO(data)) as pdf:
            if not is_tagged(pdf):
                raise VerificationFailed("Output PDF lost its structure tree.")

            # (page, mcid) -> the alt texts present there. A well-formed PDF has
            # one figure per (page, mcid), but this document has two figures
            # sharing an mcid, so a list is correct, not a dict.
            present: dict[tuple[int, int | None], list[str | None]] = {}
            for fig in walk_figures(pdf):
                present.setdefault((fig.page_number, fig.mcid), []).append(fig.alt_text)

            for fix in applied:
                want = _normalise(fix.alt_text)
                here = present.get((fix.page_number, fix.mcid), [])
                # `a is not None`, not truthy: an explicit empty /Alt (the
                # decorative case) must compare equal to "", not collapse to
                # the same None bucket as a genuinely MISSING /Alt — those are
                # different outcomes and a truthy check can't tell them apart.
                if want not in [(_normalise(a) if a is not None else None) for a in here]:
                    raise VerificationFailed(
                        f"Approved alt text for the figure on page {fix.page_number} "
                        f"(mcid {fix.mcid}) is not present in the output PDF."
                    )
    except pikepdf.PdfError as exc:
        raise VerificationFailed(f"Output PDF is not readable: {exc}") from exc


def within_limit(text: str) -> bool:
    return len(_normalise(text)) <= ALT_TEXT_MAX_CHARS
