"""Deterministic WCAG fixers.

Each function takes ``bytes`` and returns modified ``bytes`` - no I/O, no state.
The API layer decides when to apply which fixers; ``one_click_modernize`` chains
the safe ones together for the "Modernize" workflow.

Fixers here handle metadata-level repairs. The heavier operations
(structure-tree injection, alt-text writing, label writing) live where they
belong:

    * ``service._inject_tag_structure`` - inject a struct tree into an untagged PDF
    * ``core.apply.apply_alt_text``     - write /Alt to a /Figure
    * ``core.labels_write``             - (future) write /TU to form fields
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pikepdf
from pikepdf import Name, Pdf, String


DEFAULT_LANG = "en-US"
DEFAULT_PDFUA_XMP = """<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="pdf-remediation-assistant">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfuaid="http://www.aiim.org/pdfua/ns/id/">
      <pdfuaid:part>1</pdfuaid:part>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">{title}</rdf:li></rdf:Alt></dc:title>
      <dc:language><rdf:Bag><rdf:li>{lang}</rdf:li></rdf:Bag></dc:language>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>"""


def _open(data: bytes) -> Pdf:
    return pikepdf.open(BytesIO(data))


def _save(pdf: Pdf) -> bytes:
    out = BytesIO()
    pdf.save(out)
    return out.getvalue()


def set_language(data: bytes, lang: str = DEFAULT_LANG) -> bytes:
    """Set the /Lang entry on the document catalog (WCAG 3.1.1)."""
    with _open(data) as pdf:
        pdf.Root["/Lang"] = String(lang)
        return _save(pdf)


def set_title(data: bytes, title: str) -> bytes:
    """Set the /Title in the document info dictionary (WCAG 2.4.2)."""
    with _open(data) as pdf:
        with pdf.open_metadata() as meta:
            meta["dc:title"] = title
        # Also set docinfo for viewers that read the legacy dict
        pdf.docinfo["/Title"] = String(title)
        return _save(pdf)


def set_marked_info(data: bytes, marked: bool = True) -> bytes:
    """Add /MarkInfo << /Marked true >> so viewers treat the doc as tagged."""
    with _open(data) as pdf:
        pdf.Root["/MarkInfo"] = pikepdf.Dictionary(Marked=marked)
        return _save(pdf)


def set_pdfua_metadata(data: bytes, title: str | None = None, lang: str = DEFAULT_LANG) -> bytes:
    """Declare PDF/UA-1 conformance in the XMP metadata stream."""
    with _open(data) as pdf:
        with pdf.open_metadata() as meta:
            meta["pdfuaid:part"] = "1"
            if title:
                meta["dc:title"] = title
            meta["dc:language"] = lang
        return _save(pdf)


def suggest_title_from_filename(filename: str) -> str:
    """Derive a human-readable title from a PDF filename.

    "TravelReimbursement-v2.pdf" -> "Travel Reimbursement"
    """
    stem = Path(filename).stem
    # Strip common version/date suffixes
    for sep in ("-v", "_v", "-V"):
        if sep in stem:
            stem = stem.split(sep)[0]
    stem = stem.replace("_", " ").replace("-", " ")
    # Split camelCase: "TravelReimbursement" -> "Travel Reimbursement"
    parts: list[str] = []
    buf = ""
    for ch in stem:
        if ch.isupper() and buf and not buf[-1].isupper() and not buf[-1].isspace():
            parts.append(buf)
            buf = ch
        else:
            buf += ch
    if buf:
        parts.append(buf)
    return " ".join(p.strip() for p in parts if p.strip()).title()


def one_click_modernize(
    data: bytes,
    filename: str,
    inject_tag_structure_fn,
    lang: str = DEFAULT_LANG,
    title: str | None = None,
) -> tuple[bytes, list[str]]:
    """Apply every safe, non-reviewable fixer in one shot.

    ``inject_tag_structure_fn`` is passed in to avoid a circular import with
    service.py. Callers should pass ``service._inject_tag_structure``.

    Returns the modernized PDF bytes and a list of human-readable actions taken.
    """
    actions: list[str] = []
    current = data
    if title is None:
        title = suggest_title_from_filename(filename)

    # Tag structure first, so subsequent metadata edits happen on a tagged doc
    with _open(current) as pdf:
        needs_tags = "/StructTreeRoot" not in pdf.Root
        needs_marked = pdf.Root.get("/MarkInfo") is None
        current_lang = pdf.Root.get("/Lang")
        try:
            current_title = str(pdf.docinfo.get("/Title", "")).strip() if pdf.docinfo else ""
        except Exception:
            current_title = ""

    if needs_tags:
        current = inject_tag_structure_fn(current)
        actions.append("Injected structure tree with /Figure elements around images")

    current = set_marked_info(current, True)
    if needs_marked:
        actions.append("Set /MarkInfo << /Marked true >> flag")

    if not current_lang:
        current = set_language(current, lang)
        actions.append(f"Set document language to {lang}")

    if not current_title:
        current = set_title(current, title)
        actions.append(f"Set document title to '{title}'")

    current = set_pdfua_metadata(current, title=title or current_title, lang=lang)
    actions.append("Declared PDF/UA-1 conformance in XMP metadata")

    return current, actions
