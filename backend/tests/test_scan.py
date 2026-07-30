"""Tag classification. The library filter, the door policy, and the whole scope
boundary depend on getting these three buckets right.
"""

from __future__ import annotations

import pikepdf
import pytest

from helpers import open_bytes
from pdf_remediation.core.scan import scan_bytes, walk_figures
from pdf_remediation.models import TagStatus


def test_tagged_with_figures_is_remediable(tagged_with_figures):
    scan = scan_bytes(tagged_with_figures)

    assert scan.tag_status is TagStatus.TAGGED
    assert scan.page_count == 2
    assert scan.figure_count == 2
    assert scan.figures_missing_alt == 2
    assert scan.image_count == 2
    assert scan.is_remediable


def test_figure_already_has_alt_is_not_work(tagged_alt_present):
    scan = scan_bytes(tagged_alt_present)

    # Tagged and has a figure, but there's nothing left to do — it must not show
    # up as remediable work in the library.
    assert scan.figure_count == 1
    assert scan.figures_missing_alt == 0
    assert scan.tag_status is TagStatus.TAGGED_NO_FIGURES
    assert not scan.is_remediable


def test_tagged_without_figures(tagged_no_figures):
    scan = scan_bytes(tagged_no_figures)

    assert scan.tag_status is TagStatus.TAGGED_NO_FIGURES
    assert scan.figure_count == 0
    assert not scan.is_remediable


def test_untagged_is_detected_not_remediable(untagged_scanned):
    scan = scan_bytes(untagged_scanned)

    # It has an image, so a naive "find images" check would call it work.
    # Without a structure tree there is nothing to attach alt text to.
    assert scan.image_count == 1
    assert scan.tag_status is TagStatus.UNTAGGED
    assert scan.figure_count == 0
    assert not scan.is_remediable


def test_walk_figures_reports_page_numbers_and_order(tagged_with_figures):
    with open_bytes(tagged_with_figures) as pdf:
        figures = list(walk_figures(pdf))

    assert [f.page_number for f in figures] == [1, 2]
    assert [f.index_on_page for f in figures] == [0, 0]
    assert [f.mcid for f in figures] == [0, 0]
    assert all(not f.has_alt_text for f in figures)
    # refs are distinct and objgen-shaped
    assert len({f.struct_elem_ref for f in figures}) == 2


def test_walk_figures_reads_existing_alt(tagged_alt_present):
    with open_bytes(tagged_alt_present) as pdf:
        (figure,) = list(walk_figures(pdf))

    assert figure.has_alt_text
    assert "Sacramento State" in figure.alt_text


def test_walk_figures_finds_nested_figures():
    """Real PDFs nest (Document -> Sect -> Figure). Our fixtures are flat, so
    build a nested tree here rather than assume the shallow shape."""
    pdf = pikepdf.Pdf.new()
    pdf.add_blank_page()
    page = pdf.pages[0].obj
    page.StructParents = 0

    root = pdf.make_indirect(pikepdf.Dictionary(Type=pikepdf.Name.StructTreeRoot))
    figure = pdf.make_indirect(
        pikepdf.Dictionary(
            Type=pikepdf.Name.StructElem, S=pikepdf.Name.Figure, Pg=page, K=0
        )
    )
    sect = pdf.make_indirect(
        pikepdf.Dictionary(
            Type=pikepdf.Name.StructElem, S=pikepdf.Name.Sect, K=pikepdf.Array([figure])
        )
    )
    doc = pdf.make_indirect(
        pikepdf.Dictionary(
            Type=pikepdf.Name.StructElem, S=pikepdf.Name.Document, K=pikepdf.Array([sect])
        )
    )
    root.K = pikepdf.Array([doc])
    pdf.Root.StructTreeRoot = root

    figures = list(walk_figures(pdf))

    assert len(figures) == 1
    assert figures[0].page_number == 1


def test_figure_inherits_page_from_ancestor():
    """/Pg is inheritable — a Figure without one belongs to its parent's page."""
    pdf = pikepdf.Pdf.new()
    pdf.add_blank_page()
    pdf.add_blank_page()
    page2 = pdf.pages[1].obj

    root = pdf.make_indirect(pikepdf.Dictionary(Type=pikepdf.Name.StructTreeRoot))
    figure = pdf.make_indirect(
        pikepdf.Dictionary(Type=pikepdf.Name.StructElem, S=pikepdf.Name.Figure, K=0)
    )  # no /Pg
    sect = pdf.make_indirect(
        pikepdf.Dictionary(
            Type=pikepdf.Name.StructElem,
            S=pikepdf.Name.Sect,
            Pg=page2,
            K=pikepdf.Array([figure]),
        )
    )
    root.K = pikepdf.Array([sect])
    pdf.Root.StructTreeRoot = root

    (found,) = list(walk_figures(pdf))

    assert found.page_number == 2


def test_garbage_bytes_returns_corrupt_pdf():
    """Corrupt/unparseable input gets classified as UNSUPPORTED with CORRUPT_PDF reason."""
    from pdf_remediation.models import DocumentRoute, UnsupportedReason

    result = scan_bytes(b"this is definitely not a pdf")
    assert result.route == DocumentRoute.UNSUPPORTED
    assert result.unsupported_reason == UnsupportedReason.CORRUPT_PDF
    assert not result.is_supported
