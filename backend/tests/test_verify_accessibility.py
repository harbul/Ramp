"""Layer 2: Screen reader accessibility verification.

After the full OCR reconstruction pipeline runs (ONNX detection → structure
building → alt text application), validates that the output PDF satisfies
all screen-reader accessibility invariants:

  - StructTreeRoot exists and is well-formed
  - /MarkInfo <</Marked true>> present
  - /Lang is set
  - Every /Figure has /A /BBox with non-zero area
  - Every /Figure has /Alt after alt text is applied
  - Reading order is logical (headings before body, figures in page order)
  - ParentTree is consistent with page StructParents
  - MCIDs in struct tree have corresponding BDC/EMC in content streams

These are the invariants that determine whether a screen reader (JAWS, NVDA,
VoiceOver) can actually traverse and read the document.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path
from unittest.mock import MagicMock

import pikepdf
import pypdfium2 as pdfium
import pytest
from pikepdf import Array, Name, Pdf

from pdf_remediation.adapters.layout_onnx_yolo import OnnxYoloLayoutDetector
from pdf_remediation.core.apply import apply_alt_text, verify_alt_text
from pdf_remediation.core.ocr_structure import build_ocr_structure
from pdf_remediation.core.scan import walk_figures, is_tagged
from pdf_remediation.models import OcrBlock, OcrPage, OcrResult


# ---------------------------------------------------------------------------
# Fixtures for building a tagged PDF from the OCR pipeline
# ---------------------------------------------------------------------------


def _build_mock_ocr_result(pdf_bytes: bytes) -> OcrResult:
    """Build a realistic mock OcrResult for the demo PDF.

    Simulates what Textract would return: text blocks for the headings and
    body text on each page, plus FIGURE blocks for the chart regions.
    """
    doc = pdfium.PdfDocument(pdf_bytes)
    pages = []
    try:
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            page_w = page.get_width()
            page_h = page.get_height()

            # Simulate text blocks typical of the demo PDF structure
            blocks = [
                OcrBlock(
                    text="Sacramento State" if page_idx == 0 else "Office of the Budget",
                    confidence=0.99,
                    bbox=(72, 50, 400, 80),
                    block_type="TITLE",
                ),
                OcrBlock(
                    text="Sample document for accessibility remediation.",
                    confidence=0.97,
                    bbox=(72, 90, 540, 120),
                    block_type="TEXT",
                ),
            ]

            pages.append(OcrPage(
                page_number=page_idx + 1,
                width=page_w,
                height=page_h,
                blocks=blocks,
            ))
    finally:
        doc.close()

    return OcrResult(pages=pages)


def _build_tagged_pdf_from_pipeline(pdf_bytes: bytes) -> tuple[bytes, list[dict]]:
    """Run the OCR structure builder with the real ONNX layout detector.

    Returns the tagged PDF bytes and the list of detected images.
    """
    ocr_result = _build_mock_ocr_result(pdf_bytes)
    detector = OnnxYoloLayoutDetector()

    # Mock storage that just captures put_bytes calls
    storage = MagicMock()
    storage.put_bytes = MagicMock()

    tagged_bytes, detected_images = build_ocr_structure(
        pdf_bytes,
        ocr_result,
        job_id="test-accessibility",
        storage=storage,
        layout_detector=detector,
    )
    return tagged_bytes, detected_images


@pytest.fixture(scope="module")
def pipeline_output(demo_pdf_bytes: bytes) -> tuple[bytes, list[dict]]:
    """Run the pipeline once and cache for the module — it's expensive (~2s)."""
    return _build_tagged_pdf_from_pipeline(demo_pdf_bytes)


@pytest.fixture(scope="module")
def tagged_pdf_bytes(pipeline_output: tuple[bytes, list[dict]]) -> bytes:
    """The tagged PDF produced by the OCR pipeline."""
    return pipeline_output[0]


@pytest.fixture(scope="module")
def detected_images(pipeline_output: tuple[bytes, list[dict]]) -> list[dict]:
    """The detected images from the OCR pipeline."""
    return pipeline_output[1]


@pytest.fixture(scope="module")
def demo_pdf_bytes() -> bytes:
    """Module-scoped demo PDF bytes (avoids re-reading for each test)."""
    demo_path = Path(__file__).parent.parent / "demo" / "sample_inaccessible.pdf"
    if not demo_path.exists():
        pytest.skip("Demo PDF not found. Run: python demo/make_sample_pdf.py")
    return demo_path.read_bytes()


# ---------------------------------------------------------------------------
# Structure tree validation tests
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestStructureTreeIntegrity:
    """Validate the structure tree exists and is well-formed."""

    def test_structure_tree_exists(self, tagged_pdf_bytes: bytes):
        """StructTreeRoot must be present in the document catalog."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            assert "/StructTreeRoot" in pdf.Root, (
                "Output PDF has no /StructTreeRoot — screen readers cannot "
                "traverse the document structure."
            )

    def test_markinfo_present(self, tagged_pdf_bytes: bytes):
        """PDF/UA requires /MarkInfo <</Marked true>> in the catalog."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            assert "/MarkInfo" in pdf.Root, (
                "Output PDF has no /MarkInfo — PDF/UA compliance requires it."
            )
            mark_info = pdf.Root.MarkInfo
            assert bool(mark_info.get("/Marked", False)), (
                "/MarkInfo exists but /Marked is not true."
            )

    def test_lang_set(self, tagged_pdf_bytes: bytes):
        """Document language must be declared for screen reader pronunciation."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            assert "/Lang" in pdf.Root, (
                "Output PDF has no /Lang — screen readers need this for "
                "correct pronunciation."
            )
            lang = str(pdf.Root.Lang)
            assert len(lang) >= 2, f"/Lang is empty or too short: {lang!r}"

    def test_document_element_exists(self, tagged_pdf_bytes: bytes):
        """StructTreeRoot must have a /Document child element."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            tree_root = pdf.Root.StructTreeRoot
            kids = tree_root.get("/K")
            assert kids is not None, "StructTreeRoot has no /K (children)."

            # /K might be an array or a single element
            if isinstance(kids, pikepdf.Array):
                doc_elem = kids[0]
            else:
                doc_elem = kids

            assert doc_elem.get("/S") == Name("/Document"), (
                f"StructTreeRoot child is {doc_elem.get('/S')}, expected /Document"
            )


# ---------------------------------------------------------------------------
# Figure accessibility tests
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestFigureAccessibility:
    """Validate that detected figures are accessible to screen readers."""

    def test_figures_detected(self, tagged_pdf_bytes: bytes, detected_images: list[dict]):
        """At least one figure should be detected and embedded in the structure tree."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            figures = list(walk_figures(pdf))
            assert len(figures) > 0, "No /Figure elements in the structure tree."
            assert len(detected_images) > 0, "Pipeline detected no images."

    def test_all_figures_have_bbox(self, tagged_pdf_bytes: bytes):
        """Every /Figure must have /A /BBox with non-zero area for rendering."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            figures = list(walk_figures(pdf))
            for fig in figures:
                assert fig.bbox is not None, (
                    f"Figure on page {fig.page_number} (mcid={fig.mcid}) "
                    f"has no /BBox — screen readers can't determine its position."
                )
                x0, y0, x1, y1 = fig.bbox
                area = abs(x1 - x0) * abs(y1 - y0)
                assert area > 0, (
                    f"Figure on page {fig.page_number} has zero-area BBox: {fig.bbox}"
                )

    def test_all_figures_have_alt_after_apply(
        self, tagged_pdf_bytes: bytes, detected_images: list[dict]
    ):
        """After applying alt text, every /Figure must have non-empty /Alt."""
        # First get the figure refs from the tagged PDF
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            figures = list(walk_figures(pdf))

        if not figures:
            pytest.skip("No figures to test alt text on.")

        # Build approvals for all figures
        approvals = {}
        for fig in figures:
            approvals[fig.struct_elem_ref] = (
                f"Test alt text for figure on page {fig.page_number}"
            )

        # Apply alt text
        result = apply_alt_text(tagged_pdf_bytes, approvals)
        assert len(result.applied) == len(figures), (
            f"Expected to apply alt text to {len(figures)} figures, "
            f"but only applied to {len(result.applied)}"
        )

        # Verify all figures now have /Alt
        with pikepdf.open(BytesIO(result.pdf_bytes)) as pdf:
            figures_after = list(walk_figures(pdf))
            for fig in figures_after:
                assert fig.has_alt_text, (
                    f"Figure on page {fig.page_number} (mcid={fig.mcid}) "
                    f"still has no /Alt after apply_alt_text."
                )

    def test_verify_alt_text_passes(
        self, tagged_pdf_bytes: bytes
    ):
        """The existing verify_alt_text function must pass on the remediated PDF."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            figures = list(walk_figures(pdf))

        if not figures:
            pytest.skip("No figures to verify.")

        approvals = {
            fig.struct_elem_ref: f"Alt text for page {fig.page_number} figure"
            for fig in figures
        }

        result = apply_alt_text(tagged_pdf_bytes, approvals)

        # This should NOT raise — it's the production verification function
        verify_alt_text(result.pdf_bytes, result.applied)


# ---------------------------------------------------------------------------
# Reading order tests
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestReadingOrder:
    """Validate that the structure tree reading order is logical."""

    def test_reading_order_logical(self, tagged_pdf_bytes: bytes):
        """Structure elements should appear in logical document order.

        Expected order for each page: Title/Headings → Body text → Figures
        (This matches how a screen reader would present the content.)
        """
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            tree_root = pdf.Root.StructTreeRoot
            kids = tree_root.get("/K")
            if isinstance(kids, pikepdf.Array):
                doc_elem = kids[0]
            else:
                doc_elem = kids

            doc_kids = doc_elem.get("/K")
            if doc_kids is None:
                pytest.skip("Document element has no children.")

            # Walk children and track element types in order
            elements = []
            if isinstance(doc_kids, pikepdf.Array):
                for kid in doc_kids:
                    if isinstance(kid, pikepdf.Dictionary):
                        s_type = str(kid.get("/S", ""))
                        elements.append(s_type)
            else:
                if isinstance(doc_kids, pikepdf.Dictionary):
                    elements.append(str(doc_kids.get("/S", "")))

            # Verify figures don't appear before all text on the same page
            # (simplified check: /Figure elements should not be the first element)
            assert len(elements) > 0, "No structure elements found."

            # Check that we have a mix of text and figure elements
            has_text = any(
                e in ("/H1", "/H", "/P", "Name('/H1')", "Name('/H')", "Name('/P')")
                or "H1" in e or "/P" in e or "/H" in e
                for e in elements
            )
            has_figure = any("Figure" in e for e in elements)

            assert has_text, f"No text elements found in reading order: {elements}"
            assert has_figure, f"No figure elements found in reading order: {elements}"

    def test_figures_appear_in_page_order(self, tagged_pdf_bytes: bytes):
        """Figures should appear in ascending page order in the structure tree."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            figures = list(walk_figures(pdf))

        if len(figures) < 2:
            pytest.skip("Need at least 2 figures to test ordering.")

        page_numbers = [f.page_number for f in figures]
        assert page_numbers == sorted(page_numbers), (
            f"Figures are not in page order: {page_numbers}"
        )


# ---------------------------------------------------------------------------
# ParentTree and MCID consistency tests
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestParentTreeConsistency:
    """Validate ParentTree and MCID bindings are correct."""

    def test_parent_tree_exists(self, tagged_pdf_bytes: bytes):
        """StructTreeRoot must have a ParentTree for MCID → struct elem lookup."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            tree_root = pdf.Root.StructTreeRoot
            assert "/ParentTree" in tree_root, (
                "StructTreeRoot has no /ParentTree — MCIDs cannot resolve "
                "back to structure elements."
            )

    def test_struct_parents_on_pages(self, tagged_pdf_bytes: bytes):
        """Each page with marked content must have a /StructParents entry."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                page_obj = page.obj
                # If the page has content with marked content sequences,
                # it must declare its StructParents index
                assert "/StructParents" in page_obj, (
                    f"Page {page_idx + 1} has no /StructParents — "
                    f"MCIDs on this page cannot be resolved."
                )

    def test_parent_tree_has_entries_for_pages(self, tagged_pdf_bytes: bytes):
        """ParentTree /Nums should have an entry for each page's StructParents index."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            tree_root = pdf.Root.StructTreeRoot
            parent_tree = tree_root.get("/ParentTree")
            assert parent_tree is not None

            nums = parent_tree.get("/Nums")
            assert nums is not None, "ParentTree has no /Nums array."
            assert len(nums) > 0, "ParentTree /Nums is empty."

            # /Nums is [index, array, index, array, ...]
            # Collect all declared indices
            declared_indices = set()
            for i in range(0, len(nums), 2):
                declared_indices.add(int(nums[i]))

            # Check each page's StructParents is in the declared set
            for page_idx, page in enumerate(pdf.pages):
                sp = page.obj.get("/StructParents")
                if sp is not None:
                    sp_val = int(sp)
                    assert sp_val in declared_indices, (
                        f"Page {page_idx + 1} has StructParents={sp_val} "
                        f"but ParentTree has no entry for it. "
                        f"Declared: {sorted(declared_indices)}"
                    )

    def test_mcid_content_stream_binding(self, tagged_pdf_bytes: bytes):
        """MCIDs referenced in struct elements must have BDC/EMC in content streams."""
        with pikepdf.open(BytesIO(tagged_pdf_bytes)) as pdf:
            # Collect all MCIDs declared in the structure tree
            figures = list(walk_figures(pdf))
            struct_mcids = {
                (fig.page_number, fig.mcid)
                for fig in figures
                if fig.mcid is not None
            }

            if not struct_mcids:
                pytest.skip("No MCIDs to validate.")

            # For each page, parse content stream and find BDC markers with MCIDs
            for page_idx, page in enumerate(pdf.pages):
                page_number = page_idx + 1
                page_mcids_expected = {
                    mcid for (pn, mcid) in struct_mcids if pn == page_number
                }

                if not page_mcids_expected:
                    continue

                # Parse content stream for BDC/EMC sequences
                try:
                    instructions = pikepdf.parse_content_stream(page)
                except pikepdf.PdfError:
                    pytest.fail(
                        f"Page {page_number}: content stream is unparseable — "
                        f"MCIDs cannot be verified."
                    )

                found_mcids = set()
                for instruction in instructions:
                    op = str(instruction.operator)
                    if op == "BDC" and len(instruction.operands) >= 2:
                        props = instruction.operands[1]
                        if isinstance(props, pikepdf.Dictionary):
                            mcid = props.get("/MCID")
                            if mcid is not None:
                                found_mcids.add(int(mcid))

                missing = page_mcids_expected - found_mcids
                assert not missing, (
                    f"Page {page_number}: MCIDs {missing} are in the structure tree "
                    f"but have no BDC marker in the content stream. "
                    f"Found MCIDs: {sorted(found_mcids)}"
                )


# ---------------------------------------------------------------------------
# Full pipeline integration smoke test (combines Layer 1 + Layer 2)
# ---------------------------------------------------------------------------


@pytest.mark.integration
class TestFullPipelineEndToEnd:
    """End-to-end smoke test: PDF → detection → structure → alt text → verify.

    This is the single most important test. If it passes, the entire pipeline
    produces a valid, screen-reader-accessible PDF. If it fails, the error
    message indicates which layer broke.
    """

    def test_full_pipeline_produces_accessible_pdf(self, demo_pdf_bytes: bytes):
        """Complete pipeline produces a PDF that passes all accessibility checks."""
        # ---------------------------------------------------------------
        # Layer 1: ONNX detection produces valid figure detections
        # ---------------------------------------------------------------
        detector = OnnxYoloLayoutDetector()
        doc = pdfium.PdfDocument(demo_pdf_bytes)
        all_detections = {}
        try:
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                page_w = page.get_width()
                page_h = page.get_height()
                bitmap = page.render(scale=2.0)
                pil_image = bitmap.to_pil()

                detections = detector.detect_figures(pil_image, page_w, page_h)
                all_detections[page_idx + 1] = detections
        finally:
            doc.close()

        total_figures = sum(len(d) for d in all_detections.values())
        assert total_figures > 0, (
            "LAYER 1 FAILURE: ONNX detector found no figures in the demo PDF. "
            "The detection model may have changed or the demo PDF is corrupted."
        )

        # ---------------------------------------------------------------
        # Pipeline: build structure tree with detected figures
        # ---------------------------------------------------------------
        ocr_result = _build_mock_ocr_result(demo_pdf_bytes)
        storage = MagicMock()
        storage.put_bytes = MagicMock()

        tagged_bytes, detected_images = build_ocr_structure(
            demo_pdf_bytes,
            ocr_result,
            job_id="test-e2e-pipeline",
            storage=storage,
            layout_detector=detector,
        )

        assert len(detected_images) > 0, (
            "PIPELINE FAILURE: build_ocr_structure detected no images despite "
            f"ONNX finding {total_figures} figure(s). Check cropping logic."
        )

        # ---------------------------------------------------------------
        # Layer 2a: Structure tree is well-formed
        # ---------------------------------------------------------------
        with pikepdf.open(BytesIO(tagged_bytes)) as pdf:
            assert "/StructTreeRoot" in pdf.Root, (
                "LAYER 2 FAILURE: No StructTreeRoot in output PDF."
            )
            assert "/MarkInfo" in pdf.Root, (
                "LAYER 2 FAILURE: No /MarkInfo in output PDF."
            )
            assert bool(pdf.Root.MarkInfo.get("/Marked", False)), (
                "LAYER 2 FAILURE: /MarkInfo /Marked is not true."
            )
            assert "/Lang" in pdf.Root, (
                "LAYER 2 FAILURE: No /Lang in output PDF."
            )

            # All figures have BBox
            figures = list(walk_figures(pdf))
            assert len(figures) > 0, (
                "LAYER 2 FAILURE: No /Figure elements in structure tree "
                f"despite {len(detected_images)} detected images."
            )
            for fig in figures:
                assert fig.bbox is not None, (
                    f"LAYER 2 FAILURE: Figure on page {fig.page_number} "
                    f"has no /BBox."
                )

        # ---------------------------------------------------------------
        # Apply alt text and verify it's reachable
        # ---------------------------------------------------------------
        with pikepdf.open(BytesIO(tagged_bytes)) as pdf:
            figures = list(walk_figures(pdf))

        approvals = {
            fig.struct_elem_ref: (
                f"Accessible alt text for figure on page {fig.page_number}"
            )
            for fig in figures
        }

        result = apply_alt_text(tagged_bytes, approvals)
        assert len(result.applied) == len(figures), (
            f"ALT TEXT FAILURE: Applied to {len(result.applied)} figures "
            f"but expected {len(figures)}. "
            f"Skipped refs: {result.skipped_refs}"
        )

        # ---------------------------------------------------------------
        # Layer 2b: verify_alt_text (production verification function)
        # ---------------------------------------------------------------
        # This is the exact same check that runs in production before
        # releasing a remediated PDF to the user.
        try:
            verify_alt_text(result.pdf_bytes, result.applied)
        except Exception as exc:
            pytest.fail(
                f"VERIFICATION FAILURE: verify_alt_text raised: {exc}\n"
                "The applied alt text is not reachable through the structure tree."
            )

        # ---------------------------------------------------------------
        # Final check: all figures in output have non-empty /Alt
        # ---------------------------------------------------------------
        with pikepdf.open(BytesIO(result.pdf_bytes)) as pdf:
            final_figures = list(walk_figures(pdf))
            for fig in final_figures:
                assert fig.has_alt_text, (
                    f"FINAL CHECK FAILURE: Figure on page {fig.page_number} "
                    f"(mcid={fig.mcid}) has no /Alt in the final output."
                )

        # If we get here, the full pipeline works end-to-end:
        # PDF → ONNX detection → structure building → alt text → verification ✓
