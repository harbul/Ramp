"""The load-bearing tests: does the alt text we write actually land on the right
/Figure, reachable through the structure tree — and do we refuse when it can't?

If these fail, the whole approach changes.
"""

from __future__ import annotations

from io import BytesIO

import pdfplumber
import pytest

from helpers import open_bytes
from pdf_remediation.core.apply import apply_alt_text, verify_alt_text, within_limit
from pdf_remediation.core.scan import scan_bytes, walk_figures
from pdf_remediation.errors import NotTagged, VerificationFailed
from pdf_remediation.models import TagStatus

CAMPUS_ALT = "Students walking outside a Sacramento State campus building."
CHECK_ALT = "Sample voided check with routing and account numbers labeled."


def _refs(data: bytes) -> list[str]:
    with open_bytes(data) as pdf:
        return [f.struct_elem_ref for f in walk_figures(pdf)]


def test_alt_text_lands_on_the_correct_figure(tagged_with_figures):
    ref_p1, ref_p2 = _refs(tagged_with_figures)

    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT, ref_p2: CHECK_ALT})

    assert len(result.applied) == 2
    assert result.skipped_refs == []

    # Re-open the OUTPUT and check each figure got its own text — not just that
    # some alt text exists somewhere.
    with open_bytes(result.pdf_bytes) as pdf:
        figures = {f.struct_elem_ref: f for f in walk_figures(pdf)}

    assert figures[ref_p1].alt_text == CAMPUS_ALT
    assert figures[ref_p1].page_number == 1
    assert figures[ref_p2].alt_text == CHECK_ALT
    assert figures[ref_p2].page_number == 2


def test_alt_text_is_reachable_by_an_independent_parser(tagged_with_figures):
    """pikepdf reading back what pikepdf wrote proves little. pdfplumber walks
    the tree the way a consumer does — MCID resolution and all — so this is the
    test that the alt text is genuinely *reachable*, not just present."""
    ref_p1, _ = _refs(tagged_with_figures)

    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT})

    with pdfplumber.open(BytesIO(result.pdf_bytes)) as pdf:
        tree = pdf.pages[0].structure_tree

    figures = [n for n in tree[0]["children"] if n["type"] == "Figure"]
    assert len(figures) == 1
    assert figures[0]["alt_text"] == CAMPUS_ALT
    assert figures[0]["mcids"] == [0]  # still bound to the content on the page


def test_untagged_pdf_is_refused_not_faked(untagged_scanned):
    """The most important test in the suite. A PDF with no structure tree must
    error, not come back looking remediated."""
    with pytest.raises(NotTagged) as exc:
        apply_alt_text(untagged_scanned, {"1,0": CAMPUS_ALT})

    assert exc.value.code == "NOT_TAGGED"
    assert "tagged" in str(exc.value).lower()


def test_remediated_document_is_no_longer_flagged_as_work(tagged_with_figures):
    """End-to-end at the scan level: after remediation the library should stop
    showing the document as having missing alt text."""
    before = scan_bytes(tagged_with_figures)
    assert before.figures_missing_alt == 2
    assert before.is_remediable

    refs = _refs(tagged_with_figures)
    result = apply_alt_text(tagged_with_figures, dict.fromkeys(refs, CAMPUS_ALT))

    after = scan_bytes(result.pdf_bytes)
    assert after.figures_missing_alt == 0
    assert after.tag_status is TagStatus.TAGGED_NO_FIGURES
    assert not after.is_remediable


def test_partial_approval_leaves_other_figures_untouched(tagged_with_figures):
    """Rejecting a suggestion means that figure keeps no alt text — the reviewer's
    'no' has to survive."""
    ref_p1, ref_p2 = _refs(tagged_with_figures)

    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT})

    with open_bytes(result.pdf_bytes) as pdf:
        figures = {f.struct_elem_ref: f for f in walk_figures(pdf)}

    assert figures[ref_p1].has_alt_text
    assert not figures[ref_p2].has_alt_text

    after = scan_bytes(result.pdf_bytes)
    assert after.figures_missing_alt == 1
    assert after.is_remediable  # still work left to do


def test_reviewer_edit_is_what_lands_not_the_suggestion(tagged_with_figures):
    """apply_alt_text only ever sees approved text. This guards the seam where
    the frontend's edited value could get dropped in favour of the model's."""
    ref_p1, _ = _refs(tagged_with_figures)
    edited = "Reviewer's own wording for this figure."

    result = apply_alt_text(tagged_with_figures, {ref_p1: edited})

    with open_bytes(result.pdf_bytes) as pdf:
        figures = {f.struct_elem_ref: f for f in walk_figures(pdf)}
    assert figures[ref_p1].alt_text == edited


def test_existing_alt_text_can_be_corrected(tagged_alt_present):
    """Overwriting bad alt text is a legitimate reviewer action, not an error."""
    (ref,) = _refs(tagged_alt_present)
    corrected = "A corrected description of the figure."

    result = apply_alt_text(tagged_alt_present, {ref: corrected})

    with open_bytes(result.pdf_bytes) as pdf:
        (figure,) = list(walk_figures(pdf))
    assert figure.alt_text == corrected


def test_unknown_ref_is_reported_as_skipped_not_crashed(tagged_with_figures):
    ref_p1, _ = _refs(tagged_with_figures)

    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT, "9999,0": "ghost"})

    assert len(result.applied) == 1
    assert result.skipped_refs == ["9999,0"]


def test_whitespace_is_normalised(tagged_with_figures):
    ref_p1, _ = _refs(tagged_with_figures)

    result = apply_alt_text(tagged_with_figures, {ref_p1: "  Students   walking\n\toutside.  "})

    with open_bytes(result.pdf_bytes) as pdf:
        (figure, _) = list(walk_figures(pdf))
    assert figure.alt_text == "Students walking outside."


def test_markinfo_is_repaired_when_missing(tagged_with_figures):
    """A tree without /MarkInfo <</Marked true>> is a real defect in legacy files.
    We repair it on the way out."""
    with open_bytes(tagged_with_figures) as pdf:
        del pdf.Root.MarkInfo
        buf = BytesIO()
        pdf.save(buf)
    without_markinfo = buf.getvalue()

    ref_p1 = _refs(without_markinfo)[0]
    result = apply_alt_text(without_markinfo, {ref_p1: CAMPUS_ALT})

    assert result.marked_info_added
    with open_bytes(result.pdf_bytes) as pdf:
        assert bool(pdf.Root.MarkInfo.Marked)


def test_verify_passes_on_a_good_write(tagged_with_figures):
    ref_p1, _ = _refs(tagged_with_figures)
    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT})

    verify_alt_text(result.pdf_bytes, result.applied)  # must not raise


def test_verify_survives_object_renumbering_on_save(tagged_with_figures):
    """The real-PDF bug: pikepdf renumbers objects on save, so the input
    struct_elem_ref no longer identifies the output object. Verify must match on
    (page, mcid) — stable across save — not on the ref. This is the regression
    guard for the vol-33 failure."""
    ref_p1, _ = _refs(tagged_with_figures)
    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT})

    verify_alt_text(result.pdf_bytes, result.applied)          # must not raise
    assert result.applied[0].mcid is not None                  # mcid captured for matching


def test_verify_catches_missing_alt(tagged_with_figures):
    """Verification has to actually fail when the alt text isn't there —
    otherwise it's decoration."""
    from dataclasses import replace

    ref_p1, _ = _refs(tagged_with_figures)
    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT})

    # Claim we applied text to a figure we didn't touch (page 2).
    phantom = replace(result.applied[0], page_number=2, alt_text=CHECK_ALT)
    with pytest.raises(VerificationFailed):
        verify_alt_text(result.pdf_bytes, [phantom])


def test_verify_catches_wrong_text(tagged_with_figures):
    from dataclasses import replace

    ref_p1, _ = _refs(tagged_with_figures)
    result = apply_alt_text(tagged_with_figures, {ref_p1: CAMPUS_ALT})

    wrong = replace(result.applied[0], alt_text="something else entirely")
    with pytest.raises(VerificationFailed):
        verify_alt_text(result.pdf_bytes, [wrong])


def test_within_limit_matches_frontend_rule():
    assert within_limit("short")
    assert within_limit("x" * 125)
    assert not within_limit("x" * 126)
