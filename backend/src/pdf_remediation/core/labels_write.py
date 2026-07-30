"""Infer and write form-field labels (/TU tooltips) into a PDF.

Wraps ``inventory.src.label_infer.tier1_humanize`` and applies the result to
every AcroForm field that has no /TU. Signature fields are skipped (Acrobat
Sign / other tools label them themselves). Returns the number of labels
written and the actual labels applied, so the UI can show a review list.

Tiers 2 (pdfplumber geometric header match) and 3 (Bedrock LLM fallback) are
implemented in ``label_infer.py`` but are not invoked here - tier 1 is
deterministic and requires no OCR/LLM, so it works in the fully-offline demo.
Wiring tier 2/3 in is a follow-on when a per-field review UI exists.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path
import sys

import pikepdf
from pikepdf import Name, Pdf, String

# The inventory module lives outside pdf_remediation, so import it via sys.path.
_INVENTORY_SRC = Path(__file__).resolve().parents[4] / "inventory" / "src"
if str(_INVENTORY_SRC) not in sys.path:
    sys.path.insert(0, str(_INVENTORY_SRC))
from label_infer import tier1_humanize  # noqa: E402


@dataclass
class LabelWrite:
    field_name: str      # internal /T name
    inferred_label: str  # the label written into /TU
    confidence: str      # "high" | "low" (from tier1_humanize)


def _iter_terminal_fields(pdf: Pdf):
    acro = pdf.Root.get("/AcroForm")
    if acro is None or "/Fields" not in acro:
        return
    stack = list(acro.Fields)
    while stack:
        node = stack.pop()
        kids = None
        try:
            kids = node.get("/Kids")
        except Exception:
            kids = None
        if kids is not None and len(kids) > 0:
            for k in kids:
                stack.append(k)
            continue
        yield node


def infer_and_write_labels(data: bytes) -> tuple[bytes, list[LabelWrite]]:
    """Add /TU tooltips to every AcroForm field that lacks one.

    Returns the modified PDF bytes and a list of per-field label writes so
    the reviewer can audit them.
    """
    writes: list[LabelWrite] = []
    with pikepdf.open(BytesIO(data)) as pdf:
        for field in _iter_terminal_fields(pdf):
            if field.get("/FT") == Name.Sig:
                continue
            if field.get("/TU"):
                continue
            try:
                name = str(field.get("/T", ""))
            except Exception:
                name = ""
            if not name:
                continue
            label, confidence = tier1_humanize(name)
            if not label:
                continue
            field["/TU"] = String(label)
            writes.append(LabelWrite(field_name=name, inferred_label=label, confidence=confidence))
        if not writes:
            return data, []
        out = BytesIO()
        pdf.save(out)
        return out.getvalue(), writes
