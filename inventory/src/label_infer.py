"""
label_infer.py

Answers a question worth asking at an AI camp: does inferring a missing
field label actually require AI? Tested against the real NEEDS_REMEDIATION
forms in the sample set, the answer is "mostly no."

Three tiers, escalating only when the cheaper tier can't produce a
confident answer:

  TIER 1 (free, instant) -- humanize the field's own internal /T name.
      Acrobat/form authors often name fields descriptively
      ("DepartmentName", "ApprovingOfficialEmail") even when they forget
      to set the /TU tooltip. A pure regex transform recovers a good
      label with zero API calls.

  TIER 2 (free, instant) -- geometric column-header match. For repeating
      grids/tables where field names are meaningless ('Text1.6.0'), find
      the nearest column header above the field (by x-range overlap) using
      pdfplumber word positions. Validated on the hardest real case in the
      sample (a lost-receipt line-item grid) with a 100% match rate.

  TIER 3 (costs money, needs Bedrock) -- only for fields where tiers 1 and
      2 both fail or produce a low-confidence result. This should be the
      minority case, not the default path.

Run `python label_infer.py --report` to see the real tier breakdown across
every NEEDS_REMEDIATION form in data/sample_forms/.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
from pypdf import PdfReader

GENERIC_TOKENS = re.compile(r"^(text|check\s*box|group|button|field|signature)\s*\d*$", re.I)

ROOT = Path(__file__).resolve().parent.parent
SAMPLE_DIR = ROOT / "data" / "sample_forms"


@dataclass
class LabelResult:
    field_name: str
    label: str | None
    tier: int  # 1, 2, or 3
    confidence: str  # "high", "low", "needs_ai"


def tier1_humanize(field_name: str) -> tuple[str | None, str]:
    """Free string transform on the field's own internal name."""
    if not field_name:
        return None, "needs_ai"
    base = re.sub(r"_af_date$", "", field_name)
    leaf = base.split(".")[-1]
    if re.fullmatch(r"\d+", leaf):
        return None, "needs_ai"
    spaced = re.sub(r"(?<!^)(?=[A-Z][a-z])", " ", base)
    spaced = spaced.replace("_", " ").replace(".", " ").replace("-", " ")
    spaced = re.sub(r"\s+", " ", spaced).strip()
    if not spaced:
        return None, "needs_ai"
    if GENERIC_TOKENS.match(spaced) or GENERIC_TOKENS.match(leaf):
        return spaced, "low"
    if re.search(r"\d", leaf) and len(leaf) <= 3:
        return spaced, "low"
    return spaced, "high"


def _column_headers(page: "pdfplumber.page.Page", header_band: tuple[float, float]) -> list[tuple[str, float, float]]:
    """Extract candidate column-header words within a given pdf-coordinate
    y-band (top-down pdfplumber 'top' values), grouped loosely by proximity
    into label spans. This is intentionally simple -- good enough to
    validate the approach, not a general table-header parser."""
    words = page.extract_words()
    h = page.height
    headers = []
    for w in words:
        pdf_y = h - w["top"]
        if header_band[0] <= pdf_y <= header_band[1]:
            headers.append((w["text"], w["x0"], w["x1"]))
    return headers


def tier2_geometric_header_match(
    field_rect: list[float], page: "pdfplumber.page.Page", header_band: tuple[float, float]
) -> tuple[str | None, str]:
    """Match a field's x-position against nearby column-header text above it.
    header_band is a (y_min, y_max) window in PDF coordinates (bottom-up) to
    search for header words -- caller supplies this based on where the grid's
    header row actually sits on the page."""
    x0, x1 = field_rect[0], field_rect[2]
    mid = (x0 + x1) / 2
    words = _column_headers(page, header_band)
    if not words:
        return None, "needs_ai"
    # group consecutive words into spans, then find the span whose x-range
    # contains this field's midpoint
    words_sorted = sorted(words, key=lambda w: w[1])
    spans = []
    cur = [words_sorted[0]]
    for w in words_sorted[1:]:
        if w[1] - cur[-1][2] < 15:  # close enough to be the same header phrase
            cur.append(w)
        else:
            spans.append(cur)
            cur = [w]
    spans.append(cur)
    for span in spans:
        span_x0 = min(w[1] for w in span)
        span_x1 = max(w[2] for w in span)
        if span_x0 - 10 <= mid <= span_x1 + 10:
            text = " ".join(w[0] for w in span)
            return text, "high"

    # Fallback: fields in a table are usually left-aligned with their column
    # header even when the field itself is wider than the header text (e.g.
    # a merged "description" cell that visually extends past its header).
    # Match on closest left-edge (x0) instead of midpoint containment.
    best_span, best_dist = None, None
    for span in spans:
        span_x0 = min(w[1] for w in span)
        dist = abs(x0 - span_x0)
        if best_dist is None or dist < best_dist:
            best_span, best_dist = span, dist
    if best_span is not None and best_dist <= 20:
        text = " ".join(w[0] for w in best_span)
        return text, "high"
    return None, "needs_ai"


def _iter_widgets(page):
    """Yield (display_name, tu, rect) for every form-field widget on a page,
    working directly from the raw annotation objects. This sidesteps
    pypdf's hierarchical qualified-name joining, which doesn't reliably
    map back to a single widget's rect when fields share a parent."""
    annots = page.get("/Annots")
    if annots is None:
        return
    if hasattr(annots, "get_object"):
        annots = annots.get_object()
    for a in annots:
        obj = a.get_object() if hasattr(a, "get_object") else a
        if obj.get("/Subtype") != "/Widget":
            continue
        name = obj.get("/T")
        parent = obj.get("/Parent")
        parent_name = None
        if parent is not None:
            parent_obj = parent.get_object()
            parent_name = parent_obj.get("/T")
        display_name = name or parent_name or "unnamed"
        tu = obj.get("/TU")
        rect = [float(x) for x in obj.get("/Rect")]
        yield display_name, tu, rect


def infer_labels_for_form(pdf_path: str, header_band: tuple[float, float] | None = None) -> list[LabelResult]:
    reader = PdfReader(pdf_path)
    page = reader.pages[0]

    results = []
    with pdfplumber.open(pdf_path) as plumber_pdf:
        pl_page = plumber_pdf.pages[0]
        for name, tu, rect in _iter_widgets(page):
            if tu:
                continue  # already labeled
            label, conf = tier1_humanize(name)
            if conf == "high":
                results.append(LabelResult(name, label, 1, conf))
                continue
            if header_band:
                label2, conf2 = tier2_geometric_header_match(rect, pl_page, header_band)
                if conf2 == "high":
                    results.append(LabelResult(name, label2, 2, conf2))
                    continue
            results.append(LabelResult(name, label, 3, "needs_ai"))
    return results


def report():
    # header_band is the (y_min, y_max) PDF-coordinate window where each
    # form's grid header row lives -- determined by inspection once per
    # form with a repeating-grid layout. Forms without a grid don't need one.
    forms_with_grids = {
        "01_2025_procardmissingreceiptform.pdf": (470, 495),  # "Item No./Description | Qty | Unit Price | Extension"
    }
    all_forms = [
        "01_2025_hardcopyrequisition.pdf",
        "01_2025_justificationforsolebrand.pdf",
        "01_2025_preapprovalforthepurchaseofgiftcards.pdf",
        "01_2025_procardmissingreceiptform.pdf",
        "01_2025_voyagercardupdaterequestform.pdf",
        "01_2025_voyagercarduseragreement.pdf",
        "hr-adjustment-9-26-24.pdf",
        "us-bank-capradio-one-card-application-april-2025.pdf",
    ]

    tier_counts = {1: 0, 2: 0, 3: 0}
    for fname in all_forms:
        path = SAMPLE_DIR / fname
        if not path.exists():
            continue
        results = infer_labels_for_form(str(path), header_band=forms_with_grids.get(fname))
        for r in results:
            tier_counts[r.tier] += 1
        if results:
            t1 = sum(1 for r in results if r.tier == 1)
            t2 = sum(1 for r in results if r.tier == 2)
            t3 = sum(1 for r in results if r.tier == 3)
            print(f"{fname}: {len(results)} missing -> tier1(free/name): {t1}, tier2(free/geometry): {t2}, tier3(needs AI): {t3}")

    total = sum(tier_counts.values())
    free = tier_counts[1] + tier_counts[2]
    print()
    print(f"TOTAL missing labels across sample: {total}")
    print(f"  Resolved with ZERO AI cost (tier 1 + tier 2): {free} ({free/total:.0%})")
    print(f"  Genuinely need AI escalation (tier 3): {tier_counts[3]} ({tier_counts[3]/total:.0%})")


if __name__ == "__main__":
    if "--report" in sys.argv:
        report()
    else:
        print("Usage: python label_infer.py --report")
