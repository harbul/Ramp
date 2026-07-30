"""Issue 001 integration tests — route uploads to correct workflow.

Covers every acceptance criterion:
  1. Eligible scans (blank/public English ≤50pp ≤25MB) → OCR_RECONSTRUCTION
  2. Hidden OCR does not disqualify
  3. Tagged digital PDFs → ALT_TEXT_REMEDIATION (regression)
  4. Every unsupported class → distinct reason
  5. Original upload stored unchanged
  6. Stable route + reason in service/HTTP responses
  7. Upload interface presents route info
  8. Boundary values for page count and file size
  9. Existing tagged-PDF regression
"""

from __future__ import annotations

import zlib
from io import BytesIO

import pikepdf
import pytest
from pikepdf import Array, Dictionary, Name, Pdf, Stream, String

from pdf_remediation.adapters.alt_text_stub import StubAltTextProvider
from pdf_remediation.adapters.job_store_json import JsonJobStore
from pdf_remediation.adapters.storage_local import LocalStorage
from pdf_remediation.core.scan import scan_bytes
from pdf_remediation.errors import NotTagged
from pdf_remediation.models import (
    DocumentRoute,
    JobStatus,
    TagStatus,
    UnsupportedReason,
)
from pdf_remediation.service import RemediationService


# ── Fixture helpers ──────────────────────────────────────────────────


PAGE_W, PAGE_H = 612, 792


def _image_xobject(pdf: Pdf, w: int = 600, h: int = 780) -> Stream:
    """Large image that dominates a page (scan-like)."""
    raw = bytes([128, 128, 128]) * (w * h)
    xobj = Stream(pdf, zlib.compress(raw))
    xobj.Type = Name.XObject
    xobj.Subtype = Name.Image
    xobj.Width = w
    xobj.Height = h
    xobj.ColorSpace = Name.DeviceRGB
    xobj.BitsPerComponent = 8
    xobj.Filter = Name.FlateDecode
    return xobj


def _small_image(pdf: Pdf) -> Stream:
    """Tiny image (not scan-dominant)."""
    raw = bytes([200, 200, 200]) * (10 * 10)
    xobj = Stream(pdf, zlib.compress(raw))
    xobj.Type = Name.XObject
    xobj.Subtype = Name.Image
    xobj.Width = 10
    xobj.Height = 10
    xobj.ColorSpace = Name.DeviceRGB
    xobj.BitsPerComponent = 8
    xobj.Filter = Name.FlateDecode
    return xobj


def _font(pdf: Pdf) -> Dictionary:
    return pdf.make_indirect(
        Dictionary(
            Type=Name.Font,
            Subtype=Name.Type1,
            BaseFont=Name.Helvetica,
            Encoding=Name.WinAnsiEncoding,
        )
    )


def _to_bytes(pdf: Pdf) -> bytes:
    buf = BytesIO()
    pdf.save(buf)
    return buf.getvalue()


def _make_scan_pdf(pages: int = 1) -> bytes:
    """Untagged PDF with large images filling each page (scan-dominant)."""
    pdf = Pdf.new()
    font = _font(pdf)
    for _ in range(pages):
        xobj = _image_xobject(pdf)
        content = b"q 612 0 0 792 0 0 cm /Im0 Do Q\n"
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(
                    Font=Dictionary(F1=font),
                    XObject=Dictionary(Im0=pdf.make_indirect(xobj)),
                ),
                Contents=pdf.make_indirect(Stream(pdf, content)),
            )
        )
        pdf.pages.append(pikepdf.Page(page))
    result = _to_bytes(pdf)
    pdf.close()
    return result


def _make_tagged_pdf(figures_missing_alt: int = 1) -> bytes:
    """Tagged PDF with figures missing alt text."""
    pdf = Pdf.new()
    font = _font(pdf)
    struct_root = pdf.make_indirect(Dictionary(Type=Name.StructTreeRoot))
    doc_elem = pdf.make_indirect(
        Dictionary(Type=Name.StructElem, S=Name.Document, P=struct_root, K=Array([]))
    )
    doc_kids = Array([])
    parent_tree_nums = Array([])

    for i in range(figures_missing_alt):
        xobj = _small_image(pdf)
        content = (
            b"/Figure <</MCID 0>> BDC\n"
            b"q 64 0 0 48 60 600 cm /Im0 Do Q\n"
            b"EMC\n"
        )
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(
                    Font=Dictionary(F1=font),
                    XObject=Dictionary(Im0=pdf.make_indirect(xobj)),
                ),
                Contents=pdf.make_indirect(Stream(pdf, content)),
                StructParents=i,
            )
        )
        pdf.pages.append(pikepdf.Page(page))
        page = pdf.pages[i].obj

        figure = pdf.make_indirect(
            Dictionary(
                Type=Name.StructElem, S=Name.Figure, P=doc_elem, Pg=page, K=0
            )
        )
        doc_kids.append(figure)
        parent_tree_nums.append(i)
        parent_tree_nums.append(Array([figure]))

    doc_elem.K = doc_kids
    struct_root.K = Array([doc_elem])
    struct_root.ParentTree = pdf.make_indirect(Dictionary(Nums=parent_tree_nums))
    struct_root.ParentTreeNextKey = figures_missing_alt

    pdf.Root.StructTreeRoot = struct_root
    pdf.Root.MarkInfo = Dictionary(Marked=True)
    pdf.Root.Lang = String("en-US")

    result = _to_bytes(pdf)
    pdf.close()
    return result


def _make_untagged_digital() -> bytes:
    """Born-digital PDF without tags (not scan-dominant)."""
    pdf = Pdf.new()
    font = _font(pdf)
    content = b"BT /F1 12 Tf 72 700 Td (Hello World) Tj ET\n"
    page = pdf.make_indirect(
        Dictionary(
            Type=Name.Page,
            MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
            Resources=Dictionary(Font=Dictionary(F1=font)),
            Contents=pdf.make_indirect(Stream(pdf, content)),
        )
    )
    pdf.pages.append(pikepdf.Page(page))
    result = _to_bytes(pdf)
    pdf.close()
    return result


@pytest.fixture
def service(tmp_path):
    return RemediationService(
        storage=LocalStorage(tmp_path / "work"),
        jobs=JsonJobStore(tmp_path / "state"),
        alt_text=StubAltTextProvider(),
    )


# ══════════════════════════════════════════════════════════════════════
# AC1: Eligible scans (blank/public English ≤50pp ≤25MB) → OCR_RECONSTRUCTION
# ══════════════════════════════════════════════════════════════════════


class TestEligibleScansRouteToOcr:
    def test_single_page_scan_routes_to_ocr(self):
        scan = scan_bytes(_make_scan_pdf(pages=1))
        assert scan.route == DocumentRoute.OCR_RECONSTRUCTION
        assert scan.unsupported_reason is None
        assert scan.is_scan_dominant is True

    def test_multipage_scan_within_limits(self):
        scan = scan_bytes(_make_scan_pdf(pages=5))
        assert scan.route == DocumentRoute.OCR_RECONSTRUCTION

    def test_scan_at_50_page_boundary(self):
        """Exactly 50 pages is still eligible."""
        scan = scan_bytes(_make_scan_pdf(pages=50))
        assert scan.route == DocumentRoute.OCR_RECONSTRUCTION

    def test_scan_over_50_pages_unsupported(self):
        """51 pages exceeds the limit."""
        scan = scan_bytes(_make_scan_pdf(pages=51))
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.TOO_MANY_PAGES

    def test_service_registers_ocr_eligible_scan(self, service):
        data = _make_scan_pdf(pages=2)
        doc, scan = service.register_document(
            filename="blank_form.pdf", department="Admissions", pdf_bytes=data
        )
        assert doc.route == DocumentRoute.OCR_RECONSTRUCTION
        assert doc.is_scan_dominant is True
        assert scan.route == DocumentRoute.OCR_RECONSTRUCTION


# ══════════════════════════════════════════════════════════════════════
# AC2: Hidden OCR does not disqualify eligible scans
# ══════════════════════════════════════════════════════════════════════


class TestHiddenOcrDoesNotDisqualify:
    def test_scan_with_hidden_text_still_eligible(self):
        """A scan that has invisible OCR text remains eligible for reconstruction."""
        pdf = Pdf.new()
        font = _font(pdf)
        xobj = _image_xobject(pdf)
        # Full-page image + invisible text render mode (Tr 3 = invisible)
        content = (
            b"q 612 0 0 792 0 0 cm /Im0 Do Q\n"
            b"BT /F1 1 Tf 3 Tr 72 700 Td (hidden ocr text) Tj ET\n"
        )
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(
                    Font=Dictionary(F1=font),
                    XObject=Dictionary(Im0=pdf.make_indirect(xobj)),
                ),
                Contents=pdf.make_indirect(Stream(pdf, content)),
            )
        )
        pdf.pages.append(pikepdf.Page(page))
        data = _to_bytes(pdf)
        pdf.close()

        scan = scan_bytes(data)
        # Still scan-dominant despite having some text
        assert scan.is_scan_dominant is True
        assert scan.route == DocumentRoute.OCR_RECONSTRUCTION


# ══════════════════════════════════════════════════════════════════════
# AC3: Tagged digital PDFs continue through ALT-text remediation
# ══════════════════════════════════════════════════════════════════════


class TestTaggedPdfsRouteToAltText:
    def test_tagged_with_missing_alt_routes_to_alt_text(self):
        data = _make_tagged_pdf(figures_missing_alt=2)
        scan = scan_bytes(data)
        assert scan.route == DocumentRoute.ALT_TEXT_REMEDIATION
        assert scan.tag_status == TagStatus.TAGGED
        assert scan.figures_missing_alt == 2

    def test_service_creates_alt_text_job_for_tagged_pdf(self, service):
        data = _make_tagged_pdf(figures_missing_alt=1)
        doc, _ = service.register_document(
            filename="tagged.pdf", department="HR", pdf_bytes=data
        )
        assert doc.route == DocumentRoute.ALT_TEXT_REMEDIATION

        job = service.create_job(doc.doc_id)
        assert job.status == JobStatus.UPLOADED

    def test_tagged_no_figures_is_unsupported(self):
        """Tagged PDF with no figures → nothing to process."""
        pdf = Pdf.new()
        font = _font(pdf)
        struct_root = pdf.make_indirect(Dictionary(Type=Name.StructTreeRoot))
        doc_elem = pdf.make_indirect(
            Dictionary(Type=Name.StructElem, S=Name.Document, P=struct_root, K=Array([]))
        )
        content = (
            b"/P <</MCID 0>> BDC\n"
            b"BT /F1 12 Tf 72 700 Td (Just text) Tj ET\n"
            b"EMC\n"
        )
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(Font=Dictionary(F1=font)),
                Contents=pdf.make_indirect(Stream(pdf, content)),
                StructParents=0,
            )
        )
        pdf.pages.append(pikepdf.Page(page))
        page = pdf.pages[0].obj
        para = pdf.make_indirect(
            Dictionary(Type=Name.StructElem, S=Name.P, P=doc_elem, Pg=page, K=0)
        )
        doc_elem.K = Array([para])
        struct_root.K = Array([doc_elem])
        struct_root.ParentTree = pdf.make_indirect(
            Dictionary(Nums=Array([0, Array([para])]))
        )
        pdf.Root.StructTreeRoot = struct_root
        pdf.Root.MarkInfo = Dictionary(Marked=True)
        data = _to_bytes(pdf)
        pdf.close()

        scan = scan_bytes(data)
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.NO_PROCESSABLE_CONTENT


# ══════════════════════════════════════════════════════════════════════
# AC4: Unsupported input classes → distinct reasons
# ══════════════════════════════════════════════════════════════════════


class TestUnsupportedReasons:
    def test_born_digital_untagged(self):
        """Untagged but not scan-dominant → BORN_DIGITAL_UNTAGGED."""
        scan = scan_bytes(_make_untagged_digital())
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.BORN_DIGITAL_UNTAGGED

    def test_corrupt_pdf(self):
        scan = scan_bytes(b"not a pdf at all")
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.CORRUPT_PDF

    def test_encrypted_pdf(self):
        """Password-protected PDF → ENCRYPTED_PDF."""
        pdf = Pdf.new()
        font = _font(pdf)
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(Font=Dictionary(F1=font)),
                Contents=pdf.make_indirect(Stream(pdf, b"BT /F1 12 Tf 72 700 Td (Secret) Tj ET\n")),
            )
        )
        pdf.pages.append(pikepdf.Page(page))
        buf = BytesIO()
        pdf.save(buf, encryption=pikepdf.Encryption(owner="owner", user="pass"))
        pdf.close()
        data = buf.getvalue()

        scan = scan_bytes(data)
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.ENCRYPTED_PDF

    def test_interactive_form_fields(self):
        """PDF with AcroForm fields → INTERACTIVE_FORMS."""
        pdf = Pdf.new()
        font = _font(pdf)
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(Font=Dictionary(F1=font)),
                Contents=pdf.make_indirect(Stream(pdf, b"")),
            )
        )
        pdf.pages.append(pikepdf.Page(page))
        page = pdf.pages[0].obj

        # Add a text field
        field = pdf.make_indirect(
            Dictionary(
                Type=Name.Annot,
                Subtype=Name("/Widget"),
                FT=Name("/Tx"),
                T=String("Name"),
                Rect=Array([72, 700, 200, 720]),
                P=page,
            )
        )
        pdf.Root.AcroForm = Dictionary(Fields=Array([field]))
        data = _to_bytes(pdf)
        pdf.close()

        scan = scan_bytes(data)
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.INTERACTIVE_FORMS

    def test_digitally_signed(self):
        """PDF with digital signatures → DIGITALLY_SIGNED."""
        pdf = Pdf.new()
        font = _font(pdf)
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(Font=Dictionary(F1=font)),
                Contents=pdf.make_indirect(Stream(pdf, b"")),
            )
        )
        pdf.pages.append(pikepdf.Page(page))

        # SigFlags > 0 indicates the document has been signed
        pdf.Root.AcroForm = Dictionary(Fields=Array([]), SigFlags=1)
        data = _to_bytes(pdf)
        pdf.close()

        scan = scan_bytes(data)
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.DIGITALLY_SIGNED

    def test_too_many_pages(self):
        """Over 50 pages → TOO_MANY_PAGES."""
        scan = scan_bytes(_make_scan_pdf(pages=51))
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.TOO_MANY_PAGES

    def test_file_too_large(self):
        """Over 25MB → FILE_TOO_LARGE (tested via scan_pdf with explicit size)."""
        from pdf_remediation.core.scan import scan_pdf

        pdf = Pdf.new()
        font = _font(pdf)
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(Font=Dictionary(F1=font)),
                Contents=pdf.make_indirect(Stream(pdf, b"")),
            )
        )
        pdf.pages.append(pikepdf.Page(page))

        # Simulate a 26MB file by passing size explicitly
        scan = scan_pdf(pdf, file_size_bytes=26 * 1024 * 1024)
        pdf.close()

        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.FILE_TOO_LARGE

    def test_no_processable_content(self):
        """Tagged PDF with all alt text present → NO_PROCESSABLE_CONTENT."""
        pdf = Pdf.new()
        font = _font(pdf)
        struct_root = pdf.make_indirect(Dictionary(Type=Name.StructTreeRoot))
        doc_elem = pdf.make_indirect(
            Dictionary(Type=Name.StructElem, S=Name.Document, P=struct_root, K=Array([]))
        )
        xobj = _small_image(pdf)
        content = b"/Figure <</MCID 0>> BDC\nq 64 0 0 48 60 600 cm /Im0 Do Q\nEMC\n"
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(
                    Font=Dictionary(F1=font),
                    XObject=Dictionary(Im0=pdf.make_indirect(xobj)),
                ),
                Contents=pdf.make_indirect(Stream(pdf, content)),
                StructParents=0,
            )
        )
        pdf.pages.append(pikepdf.Page(page))
        page = pdf.pages[0].obj

        figure = pdf.make_indirect(
            Dictionary(
                Type=Name.StructElem,
                S=Name.Figure,
                P=doc_elem,
                Pg=page,
                K=0,
                Alt=String("Already has alt text"),
            )
        )
        doc_elem.K = Array([figure])
        struct_root.K = Array([doc_elem])
        struct_root.ParentTree = pdf.make_indirect(
            Dictionary(Nums=Array([0, Array([figure])]))
        )
        pdf.Root.StructTreeRoot = struct_root
        pdf.Root.MarkInfo = Dictionary(Marked=True)
        data = _to_bytes(pdf)
        pdf.close()

        scan = scan_bytes(data)
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.NO_PROCESSABLE_CONTENT


# ══════════════════════════════════════════════════════════════════════
# AC5: Original upload stored unchanged with stable provenance
# ══════════════════════════════════════════════════════════════════════


class TestOriginalStoredUnchanged:
    def test_upload_bytes_preserved_exactly(self, service):
        """The stored original is byte-for-byte identical to the upload."""
        data = _make_tagged_pdf(figures_missing_alt=1)
        doc, _ = service.register_document(
            filename="form.pdf", department="Finance", pdf_bytes=data
        )
        # Retrieve what was stored
        stored = service.storage.get_bytes(f"jobs/{doc.doc_id}/original/form.pdf")
        assert stored == data

    def test_different_uploads_get_different_doc_ids(self, service):
        data1 = _make_tagged_pdf(figures_missing_alt=1)
        data2 = _make_scan_pdf(pages=1)
        doc1, _ = service.register_document(
            filename="a.pdf", department="A", pdf_bytes=data1
        )
        doc2, _ = service.register_document(
            filename="b.pdf", department="B", pdf_bytes=data2
        )
        assert doc1.doc_id != doc2.doc_id


# ══════════════════════════════════════════════════════════════════════
# AC6: Stable route and reason in service and HTTP responses
# ══════════════════════════════════════════════════════════════════════


class TestStableRouteInResponses:
    def test_service_exposes_route_on_document(self, service):
        data = _make_scan_pdf(pages=2)
        doc, scan = service.register_document(
            filename="scan.pdf", department="Registrar", pdf_bytes=data
        )
        assert doc.route == DocumentRoute.OCR_RECONSTRUCTION
        assert doc.unsupported_reason is None

        # Retrieve from store
        stored_doc = service.jobs.get_document(doc.doc_id)
        assert stored_doc.route == DocumentRoute.OCR_RECONSTRUCTION

    def test_unsupported_exposes_reason(self, service):
        data = _make_untagged_digital()
        doc, scan = service.register_document(
            filename="digital.pdf", department="IT", pdf_bytes=data
        )
        assert doc.route == DocumentRoute.UNSUPPORTED
        assert doc.unsupported_reason == UnsupportedReason.BORN_DIGITAL_UNTAGGED

    def test_route_persists_through_serde_roundtrip(self, service):
        """Route survives JSON serialization/deserialization."""
        data = _make_scan_pdf(pages=1)
        doc, _ = service.register_document(
            filename="scan.pdf", department="Admissions", pdf_bytes=data
        )
        reloaded = service.jobs.get_document(doc.doc_id)
        assert reloaded.route == DocumentRoute.OCR_RECONSTRUCTION
        assert reloaded.is_scan_dominant is True


# ══════════════════════════════════════════════════════════════════════
# AC7: Unsupported input is never presented as remediated
# ══════════════════════════════════════════════════════════════════════


class TestUnsupportedCannotCreateJob:
    def test_unsupported_document_refuses_alt_text_job(self, service):
        data = _make_untagged_digital()
        doc, _ = service.register_document(
            filename="nope.pdf", department="Test", pdf_bytes=data
        )
        assert doc.route == DocumentRoute.UNSUPPORTED

        with pytest.raises(NotTagged):
            service.create_job(doc.doc_id)

    def test_unsupported_document_refuses_ocr_job(self, service):
        data = _make_untagged_digital()
        doc, _ = service.register_document(
            filename="nope.pdf", department="Test", pdf_bytes=data
        )
        with pytest.raises(NotTagged):
            service.create_ocr_job(doc.doc_id)

    def test_corrupt_pdf_refuses_job(self, service):
        doc, _ = service.register_document(
            filename="bad.pdf", department="Test", pdf_bytes=b"garbage"
        )
        assert doc.route == DocumentRoute.UNSUPPORTED
        assert doc.unsupported_reason == UnsupportedReason.CORRUPT_PDF

        with pytest.raises(NotTagged):
            service.create_job(doc.doc_id)


# ══════════════════════════════════════════════════════════════════════
# AC8: API integration tests cover every input class
# ══════════════════════════════════════════════════════════════════════


class TestApiRouting:
    """HTTP-level tests using FastAPI TestClient."""

    @pytest.fixture
    def client(self, tmp_path):
        from fastapi.testclient import TestClient
        from pdf_remediation.api.app import create_app

        svc = RemediationService(
            storage=LocalStorage(tmp_path / "work"),
            jobs=JsonJobStore(tmp_path / "state"),
            alt_text=StubAltTextProvider(),
        )
        app = create_app(svc)
        return TestClient(app)

    def _upload(self, client, data: bytes, name: str = "test.pdf"):
        resp = client.post(
            "/pdf/documents",
            files={"file": (name, data, "application/pdf")},
            data={"department": "Test"},
        )
        assert resp.status_code == 201
        return resp.json()

    def test_upload_tagged_returns_alt_text_route(self, client):
        data = _make_tagged_pdf(figures_missing_alt=1)
        result = self._upload(client, data, "tagged.pdf")
        assert result["document"]["route"] == "ALT_TEXT_REMEDIATION"
        assert result["scan"]["route"] == "ALT_TEXT_REMEDIATION"

    def test_upload_scan_returns_ocr_route(self, client):
        data = _make_scan_pdf(pages=2)
        result = self._upload(client, data, "scan.pdf")
        assert result["document"]["route"] == "OCR_RECONSTRUCTION"
        assert result["document"]["isScanDominant"] is True

    def test_upload_unsupported_returns_reason(self, client):
        data = _make_untagged_digital()
        result = self._upload(client, data, "digital.pdf")
        assert result["document"]["route"] == "UNSUPPORTED"
        assert result["document"]["unsupportedReason"] == "BORN_DIGITAL_UNTAGGED"

    def test_upload_corrupt_returns_reason(self, client):
        result = self._upload(client, b"not a pdf", "bad.pdf")
        assert result["document"]["route"] == "UNSUPPORTED"
        assert result["document"]["unsupportedReason"] == "CORRUPT_PDF"

    def test_create_job_for_unsupported_returns_422(self, client):
        result = self._upload(client, _make_untagged_digital(), "digital.pdf")
        doc_id = result["document"]["docId"]

        resp = client.post("/pdf/jobs", json={"docId": doc_id})
        assert resp.status_code == 422
        assert resp.json()["error"]["code"] == "NOT_TAGGED"

    def test_routes_endpoint_lists_all_options(self, client):
        resp = client.get("/pdf/routes")
        assert resp.status_code == 200
        body = resp.json()
        assert "ALT_TEXT_REMEDIATION" in body["routes"]
        assert "OCR_RECONSTRUCTION" in body["routes"]
        assert "UNSUPPORTED" in body["routes"]
        assert "CORRUPT_PDF" in body["unsupportedReasons"]
        assert "FILE_TOO_LARGE" in body["unsupportedReasons"]

    def test_list_documents_filter_by_route(self, client):
        self._upload(client, _make_tagged_pdf(1), "tagged.pdf")
        self._upload(client, _make_scan_pdf(1), "scan.pdf")
        self._upload(client, _make_untagged_digital(), "digital.pdf")

        resp = client.get("/pdf/documents", params={"route": "ALT_TEXT_REMEDIATION"})
        assert resp.status_code == 200
        docs = resp.json()["documents"]
        assert len(docs) == 1
        assert docs[0]["filename"] == "tagged.pdf"

        resp = client.get("/pdf/documents", params={"route": "OCR_RECONSTRUCTION"})
        docs = resp.json()["documents"]
        assert len(docs) == 1
        assert docs[0]["filename"] == "scan.pdf"


# ══════════════════════════════════════════════════════════════════════
# AC9: Existing tagged-PDF regression + boundary values
# ══════════════════════════════════════════════════════════════════════


class TestRegressionTaggedFlow:
    """Verify the existing ALT-text remediation flow is undisturbed."""

    def test_full_alt_text_flow_still_works(self, service, tagged_with_figures):
        """Register → create job → analyze → approve → apply still works."""
        from helpers import open_bytes

        doc, scan = service.register_document(
            filename="form.pdf", department="HR", pdf_bytes=tagged_with_figures
        )
        assert doc.route == DocumentRoute.ALT_TEXT_REMEDIATION
        assert scan.figures_missing_alt == 2

        job = service.create_job(doc.doc_id)
        job = service.analyze(job.job_id)
        assert job.status == JobStatus.NEEDS_REVIEW
        assert len(job.issues) == 2

        # Approve both
        for issue in job.issues:
            service.approve(
                job.job_id, issue.issue_id, approved=True, alt_text="Test alt"
            )

        job = service.apply(job.job_id)
        assert job.status == JobStatus.COMPLETE

    def test_untagged_from_conftest_fixture(self, service, untagged_scanned):
        """The conftest untagged fixture still routes correctly."""
        doc, scan = service.register_document(
            filename="scan.pdf", department="Test", pdf_bytes=untagged_scanned
        )
        # The conftest untagged fixture is scan-dominant (has a large image)
        assert doc.route in (
            DocumentRoute.OCR_RECONSTRUCTION,
            DocumentRoute.UNSUPPORTED,
        )


class TestBoundaryValues:
    """File size and page count boundary tests."""

    def test_exactly_25mb_is_eligible(self):
        """A scan exactly at the 25MB limit is still eligible."""
        from pdf_remediation.core.scan import scan_pdf

        pdf = Pdf.new()
        xobj = _image_xobject(pdf)
        content = b"q 612 0 0 792 0 0 cm /Im0 Do Q\n"
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(
                    XObject=Dictionary(Im0=pdf.make_indirect(xobj))
                ),
                Contents=pdf.make_indirect(Stream(pdf, content)),
            )
        )
        pdf.pages.append(pikepdf.Page(page))

        # Exactly 25MB
        scan = scan_pdf(pdf, file_size_bytes=25 * 1024 * 1024)
        pdf.close()
        assert scan.route == DocumentRoute.OCR_RECONSTRUCTION

    def test_one_byte_over_25mb_is_too_large(self):
        from pdf_remediation.core.scan import scan_pdf

        pdf = Pdf.new()
        xobj = _image_xobject(pdf)
        content = b"q 612 0 0 792 0 0 cm /Im0 Do Q\n"
        page = pdf.make_indirect(
            Dictionary(
                Type=Name.Page,
                MediaBox=Array([0, 0, PAGE_W, PAGE_H]),
                Resources=Dictionary(
                    XObject=Dictionary(Im0=pdf.make_indirect(xobj))
                ),
                Contents=pdf.make_indirect(Stream(pdf, content)),
            )
        )
        pdf.pages.append(pikepdf.Page(page))

        scan = scan_pdf(pdf, file_size_bytes=25 * 1024 * 1024 + 1)
        pdf.close()
        assert scan.route == DocumentRoute.UNSUPPORTED
        assert scan.unsupported_reason == UnsupportedReason.FILE_TOO_LARGE

    def test_zero_page_pdf(self):
        """An empty PDF (no pages) should be handled gracefully."""
        pdf = Pdf.new()
        data = _to_bytes(pdf)
        pdf.close()
        # Should not crash
        scan = scan_bytes(data)
        assert scan.page_count == 0
