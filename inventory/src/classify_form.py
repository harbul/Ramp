"""
classify_form.py

Inspects a single PDF and determines:
  - whether it has a text layer at all (scanned/image-only vs. born-digital)
  - whether it has interactive AcroForm fields
  - how many of those fields are missing an accessible label (/TU tooltip)
  - which category it falls into for triage

This is deliberately dependency-light (pypdf only) so it runs anywhere,
including inside a Kiro-managed environment with no poppler/system deps.

Categories (see design.md for the full decision tree):
  SCANNED          - no extractable text layer at all -> needs OCR + full recreation
  FLAT_NO_FIELDS   - has text but zero interactive form fields -> "looks like a
                     form" but nobody using assistive tech (or honestly most
                     people) can fill it in on-screen. Recreate or migrate.
  WELL_LABELED     - has fields, <=10% missing accessible labels -> verify/QA only
  NEEDS_REMEDIATION- has fields, >10% missing accessible labels -> primary
                     automation target: infer labels, write back /TU

Validated against 17 real Sacramento State forms on 2026-07-14. See
data/processed/sample_classification_results.csv for the ground-truth run.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

from pypdf import PdfReader

LABEL_GAP_THRESHOLD = 0.10  # >10% of fields missing /TU -> remediation candidate
MIN_CHARS_FOR_TEXT_LAYER = 20  # below this, treat as scanned/no text layer


@dataclass
class FormClassification:
    file: str
    pages: int
    has_text_layer: bool
    field_count: int
    field_types: dict
    missing_label_count: int
    missing_label_pct: float
    has_signature_field: bool
    category: str
    notes: str = ""


def _sample_text_length(reader: PdfReader, max_pages: int = 3) -> int:
    total = 0
    for page in reader.pages[:max_pages]:
        try:
            total += len(page.extract_text() or "")
        except Exception:
            pass
    return total


def classify(pdf_path: str) -> FormClassification:
    path = Path(pdf_path)
    reader = PdfReader(str(path))
    pages = len(reader.pages)

    text_len = _sample_text_length(reader)
    has_text_layer = text_len >= MIN_CHARS_FOR_TEXT_LAYER

    fields = reader.get_fields() or {}
    field_count = len(fields)

    field_types: dict = {}
    missing_label_count = 0
    has_signature_field = False
    for _name, field in fields.items():
        ft = str(field.get("/FT", "unknown"))
        field_types[ft] = field_types.get(ft, 0) + 1
        if ft == "/Sig":
            has_signature_field = True
        tu = field.get("/TU")
        if not tu or not str(tu).strip():
            missing_label_count += 1

    missing_label_pct = (missing_label_count / field_count) if field_count else 0.0

    if not has_text_layer:
        category = "SCANNED"
        notes = "No usable text layer detected in the first pages sampled; needs OCR before anything else."
    elif field_count == 0:
        category = "FLAT_NO_FIELDS"
        notes = "Text layer present but no interactive AcroForm fields; nothing for a screen reader or keyboard user to fill in on-screen."
    elif missing_label_pct <= LABEL_GAP_THRESHOLD:
        category = "WELL_LABELED"
        notes = "Most fields already carry an accessible label (/TU); spot-check rather than full remediation."
    else:
        category = "NEEDS_REMEDIATION"
        notes = f"{missing_label_count}/{field_count} fields ({missing_label_pct:.0%}) are missing an accessible label."

    return FormClassification(
        file=path.name,
        pages=pages,
        has_text_layer=has_text_layer,
        field_count=field_count,
        field_types=field_types,
        missing_label_count=missing_label_count,
        missing_label_pct=round(missing_label_pct, 3),
        has_signature_field=has_signature_field,
        category=category,
        notes=notes,
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python classify_form.py <path-to-pdf>")
        sys.exit(1)
    result = classify(sys.argv[1])
    print(json.dumps(asdict(result), indent=2))
