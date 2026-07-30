"""Tests for the Textract OCR adapter and normalization logic.

All tests here are offline — they use moto (mocked AWS) and minimized
Textract response fixtures. No real AWS account, no cost.

The `live` marker is reserved for opt-in tests that actually call Textract.
"""

from __future__ import annotations

import pytest
import boto3
from moto import mock_aws
from unittest.mock import MagicMock, patch

from pdf_remediation.adapters.ocr_textract import (
    TextractOcrProvider,
    _normalize_blocks,
    _bbox_from_geometry,
    _normalize_table,
    _normalize_key_value,
)
from pdf_remediation.models import (
    OcrJobStatus,
    OcrResult,
    TextType,
)
from pdf_remediation.errors import OcrJobNotFound, OcrJobNotComplete, OcrProviderError

REGION = "us-west-2"
BUCKET = "test-ocr-bucket"


# ── shared Textract response fixtures ────────────────────────────────


def _make_word(id_: str, text: str, page: int = 1, confidence: float = 99.0) -> dict:
    return {
        "BlockType": "WORD",
        "Id": id_,
        "Text": text,
        "Confidence": confidence,
        "Page": page,
        "TextType": "PRINTED",
        "Geometry": {
            "BoundingBox": {"Left": 0.1, "Top": 0.1, "Width": 0.1, "Height": 0.02}
        },
        "Relationships": [],
    }


def _make_line(id_: str, text: str, word_ids: list[str], page: int = 1) -> dict:
    return {
        "BlockType": "LINE",
        "Id": id_,
        "Text": text,
        "Confidence": 95.0,
        "Page": page,
        "TextType": "PRINTED",
        "Geometry": {
            "BoundingBox": {"Left": 0.1, "Top": 0.1, "Width": 0.5, "Height": 0.02}
        },
        "Relationships": [{"Type": "CHILD", "Ids": word_ids}],
    }


def _make_page(id_: str, child_ids: list[str], page: int = 1) -> dict:
    return {
        "BlockType": "PAGE",
        "Id": id_,
        "Page": page,
        "Geometry": {
            "BoundingBox": {"Left": 0.0, "Top": 0.0, "Width": 1.0, "Height": 1.0}
        },
        "Relationships": [{"Type": "CHILD", "Ids": child_ids}],
    }


def _make_layout(
    id_: str, block_type: str, child_ids: list[str], page: int = 1
) -> dict:
    return {
        "BlockType": block_type,
        "Id": id_,
        "Confidence": 92.0,
        "Page": page,
        "Geometry": {
            "BoundingBox": {"Left": 0.1, "Top": 0.08, "Width": 0.8, "Height": 0.05}
        },
        "Relationships": [{"Type": "CHILD", "Ids": child_ids}],
    }


# ── bbox conversion ───────────────────────────────────────────────────


def test_bbox_from_geometry_basic():
    geo = {"BoundingBox": {"Left": 0.1, "Top": 0.2, "Width": 0.5, "Height": 0.1}}
    x0, y0, x1, y1 = _bbox_from_geometry(geo)
    assert x0 == pytest.approx(0.1)
    assert y0 == pytest.approx(0.2)
    assert x1 == pytest.approx(0.6)
    assert y1 == pytest.approx(0.3)


def test_bbox_from_geometry_none():
    assert _bbox_from_geometry(None) == (0.0, 0.0, 0.0, 0.0)


def test_bbox_from_geometry_empty():
    assert _bbox_from_geometry({}) == (0.0, 0.0, 0.0, 0.0)


# ── block normalization ───────────────────────────────────────────────


def test_normalize_single_page_lines_and_words():
    """LINE/WORD blocks with no LAYOUT blocks fold into one TEXT OcrBlock."""
    word1 = _make_word("w1", "Hello")
    word2 = _make_word("w2", "world")
    line = _make_line("l1", "Hello world", ["w1", "w2"])
    page = _make_page("p1", ["l1"])

    result = _normalize_blocks([page, line, word1, word2], {})

    assert len(result.pages) == 1
    p = result.pages[0]
    assert p.page_number == 1
    assert len(p.blocks) == 1
    block = p.blocks[0]
    assert block.block_type == "TEXT"
    assert "Hello world" in block.text
    assert len(block.lines) == 1
    assert len(block.lines[0].words) == 2
    assert block.lines[0].words[0].text == "Hello"
    assert block.lines[0].words[1].text == "world"


def test_normalize_layout_block_gives_semantic_role():
    """LAYOUT_TITLE block produces a TITLE OcrBlock."""
    word = _make_word("w1", "Introduction")
    line = _make_line("l1", "Introduction", ["w1"])
    layout = _make_layout("lay1", "LAYOUT_TITLE", ["l1"])
    page = _make_page("p1", ["lay1"])

    result = _normalize_blocks([page, layout, line, word], {})

    assert result.pages[0].blocks[0].block_type == "TITLE"
    assert result.pages[0].blocks[0].text == "Introduction"


def test_normalize_layout_section_header():
    word = _make_word("w1", "Section")
    line = _make_line("l1", "Section", ["w1"])
    layout = _make_layout("lay1", "LAYOUT_SECTION_HEADER", ["l1"])
    page = _make_page("p1", ["lay1"])

    result = _normalize_blocks([page, layout, line, word], {})

    assert result.pages[0].blocks[0].block_type == "HEADING"


def test_normalize_multipage():
    """Two PAGE blocks produce two OcrPage objects in page order."""
    w1 = _make_word("w1", "First", page=1)
    l1 = _make_line("l1", "First", ["w1"], page=1)
    p1 = _make_page("pg1", ["l1"], page=1)

    w2 = _make_word("w2", "Second", page=2)
    l2 = _make_line("l2", "Second", ["w2"], page=2)
    p2 = _make_page("pg2", ["l2"], page=2)

    result = _normalize_blocks([p1, p2, l1, w1, l2, w2], {})

    assert len(result.pages) == 2
    assert result.pages[0].page_number == 1
    assert result.pages[1].page_number == 2


def test_normalize_word_confidence_converted_from_percent():
    """Textract confidence is 0-100; we normalize to 0.0-1.0."""
    word = _make_word("w1", "Hi", confidence=87.5)
    line = _make_line("l1", "Hi", ["w1"])
    page = _make_page("p1", ["l1"])

    result = _normalize_blocks([page, line, word], {})

    w = result.pages[0].blocks[0].lines[0].words[0]
    assert w.confidence == pytest.approx(0.875)


def test_normalize_handwriting_text_type():
    """WORD blocks with TextType=HANDWRITING map to TextType.HANDWRITTEN."""
    word = {
        "BlockType": "WORD",
        "Id": "w1",
        "Text": "signed",
        "Confidence": 70.0,
        "Page": 1,
        "TextType": "HANDWRITING",
        "Geometry": {
            "BoundingBox": {"Left": 0.1, "Top": 0.5, "Width": 0.2, "Height": 0.02}
        },
        "Relationships": [],
    }
    line = _make_line("l1", "signed", ["w1"])
    page = _make_page("p1", ["l1"])

    result = _normalize_blocks([page, line, word], {})

    w = result.pages[0].blocks[0].lines[0].words[0]
    assert w.text_type == TextType.HANDWRITTEN


# ── table normalization ───────────────────────────────────────────────


def _make_cell(id_: str, row: int, col: int, word_ids: list[str]) -> dict:
    return {
        "BlockType": "CELL",
        "Id": id_,
        "RowIndex": row,
        "ColumnIndex": col,
        "RowSpan": 1,
        "ColumnSpan": 1,
        "Confidence": 98.0,
        "Geometry": {
            "BoundingBox": {"Left": 0.1, "Top": 0.3, "Width": 0.2, "Height": 0.05}
        },
        "Relationships": [{"Type": "CHILD", "Ids": word_ids}] if word_ids else [],
    }


def test_normalize_table_cells_and_dimensions():
    w1 = _make_word("w1", "Name")
    w2 = _make_word("w2", "Score")
    w3 = _make_word("w3", "Alice")
    w4 = _make_word("w4", "95")
    cell1 = _make_cell("c1", 1, 1, ["w1"])
    cell2 = _make_cell("c2", 1, 2, ["w2"])
    cell3 = _make_cell("c3", 2, 1, ["w3"])
    cell4 = _make_cell("c4", 2, 2, ["w4"])
    table_block = {
        "BlockType": "TABLE",
        "Id": "t1",
        "Confidence": 97.0,
        "Geometry": {
            "BoundingBox": {"Left": 0.1, "Top": 0.3, "Width": 0.8, "Height": 0.2}
        },
        "Relationships": [{"Type": "CHILD", "Ids": ["c1", "c2", "c3", "c4"]}],
    }
    by_id = {b["Id"]: b for b in [table_block, cell1, cell2, cell3, cell4, w1, w2, w3, w4]}

    def child_ids(block, rel_type="CHILD"):
        return [
            rid
            for rel in block.get("Relationships", [])
            if rel["Type"] == rel_type
            for rid in rel["Ids"]
        ]

    table = _normalize_table(table_block, by_id, child_ids)

    assert table.rows == 2
    assert table.columns == 2
    assert len(table.cells) == 4
    texts = {(c["row"], c["col"]): c["text"] for c in table.cells}
    assert texts[(1, 1)] == "Name"
    assert texts[(2, 2)] == "95"


# ── key-value normalization ───────────────────────────────────────────


def test_normalize_key_value_pair():
    key_word = _make_word("kw1", "Department")
    val_word = _make_word("vw1", "Engineering")

    key_block = {
        "BlockType": "KEY_VALUE_SET",
        "Id": "k1",
        "EntityTypes": ["KEY"],
        "Confidence": 96.0,
        "Geometry": {
            "BoundingBox": {"Left": 0.1, "Top": 0.4, "Width": 0.2, "Height": 0.02}
        },
        "Relationships": [
            {"Type": "CHILD", "Ids": ["kw1"]},
            {"Type": "VALUE", "Ids": ["v1"]},
        ],
    }
    val_block = {
        "BlockType": "KEY_VALUE_SET",
        "Id": "v1",
        "EntityTypes": ["VALUE"],
        "Confidence": 94.0,
        "Geometry": {
            "BoundingBox": {"Left": 0.35, "Top": 0.4, "Width": 0.3, "Height": 0.02}
        },
        "Relationships": [{"Type": "CHILD", "Ids": ["vw1"]}],
    }
    by_id = {"k1": key_block, "v1": val_block, "kw1": key_word, "vw1": val_word}

    def child_ids(block, rel_type="CHILD"):
        return [r for rel in block.get("Relationships", []) if rel["Type"] == rel_type for r in rel["Ids"]]

    def value_ids(block):
        return [r for rel in block.get("Relationships", []) if rel["Type"] == "VALUE" for r in rel["Ids"]]

    kv = _normalize_key_value(key_block, by_id, child_ids, value_ids)

    assert kv is not None
    assert kv.key == "Department"
    assert kv.value == "Engineering"
    assert kv.confidence == pytest.approx(0.96)


def test_normalize_key_value_empty_key_returns_none():
    """KEY_VALUE_SET with no words for the key should be discarded."""
    key_block = {
        "BlockType": "KEY_VALUE_SET",
        "Id": "k1",
        "EntityTypes": ["KEY"],
        "Confidence": 80.0,
        "Geometry": {"BoundingBox": {"Left": 0.1, "Top": 0.4, "Width": 0.2, "Height": 0.02}},
        "Relationships": [],
    }
    by_id = {"k1": key_block}

    def child_ids(block, rel_type="CHILD"):
        return []

    def value_ids(block):
        return []

    assert _normalize_key_value(key_block, by_id, child_ids, value_ids) is None


# ── TextractOcrProvider (mocked Textract + S3 via moto) ───────────────


def _minimal_textract_response(page_count: int = 1) -> dict:
    """Minimal Textract GetDocumentAnalysis response for testing normalization."""
    blocks = []
    for pg in range(1, page_count + 1):
        word_id = f"w{pg}"
        line_id = f"l{pg}"
        page_id = f"p{pg}"
        blocks.extend([
            _make_word(word_id, f"PageContent{pg}", page=pg),
            _make_line(line_id, f"PageContent{pg}", [word_id], page=pg),
            _make_page(page_id, [line_id], page=pg),
        ])
    return {
        "JobStatus": "SUCCEEDED",
        "DocumentMetadata": {"Pages": page_count},
        "Blocks": blocks,
        "ResponseMetadata": {"HTTPHeaders": {"x-amzn-requestid": "req-abc-123"}},
    }


@pytest.fixture
def textract_provider():
    """Provider wired to a moto-mocked S3 bucket with a fake Textract client."""
    with mock_aws():
        s3_client = boto3.client("s3", region_name=REGION)
        s3_client.create_bucket(
            Bucket=BUCKET,
            CreateBucketConfiguration={"LocationConstraint": REGION},
        )
        provider = TextractOcrProvider(
            s3_bucket=BUCKET,
            region=REGION,
        )
        # Replace the real boto3 clients with moto-backed ones
        provider._s3 = s3_client
        # Textract isn't mocked by moto for async operations, so we patch it
        provider._textract = MagicMock()
        yield provider


@pytest.mark.asyncio
async def test_start_ocr_job_uploads_pdf_to_s3(textract_provider):
    """start_ocr_job puts the source PDF in S3 and returns a QUEUED job."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-001"
    }
    pdf_data = b"%PDF-1.4 fake"

    job = await textract_provider.start_ocr_job(pdf_data, job_id="app-job-1")

    assert job.job_id == "app-job-1"
    assert job.provider_job_id == "textract-job-001"
    assert job.status == OcrJobStatus.QUEUED

    # Confirm the object was uploaded to S3
    obj = _get_s3_upload(textract_provider, "app-job-1")
    assert obj == pdf_data


def _get_s3_upload(provider: TextractOcrProvider, job_id: str) -> bytes:
    key = f"{provider._prefix}{job_id}/source.pdf"
    resp = provider._s3.get_object(Bucket=provider._bucket, Key=key)
    return resp["Body"].read()


@pytest.mark.asyncio
async def test_start_ocr_job_idempotent(textract_provider):
    """Calling start_ocr_job twice with the same job_id returns the same job."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-002"
    }
    job1 = await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-2")
    job2 = await textract_provider.start_ocr_job(b"%PDF-1.4 different", job_id="app-job-2")

    assert job1.provider_job_id == job2.provider_job_id
    # start_document_analysis should only be called once
    assert textract_provider._textract.start_document_analysis.call_count == 1


@pytest.mark.asyncio
async def test_start_ocr_job_passes_all_feature_types(textract_provider):
    """start_document_analysis must request TABLES, FORMS, LAYOUT, SIGNATURES."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-003"
    }
    await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-3")

    call_kwargs = textract_provider._textract.start_document_analysis.call_args[1]
    feature_types = call_kwargs["FeatureTypes"]
    for expected in ("TABLES", "FORMS", "LAYOUT", "SIGNATURES"):
        assert expected in feature_types, f"Missing feature type: {expected}"


@pytest.mark.asyncio
async def test_get_job_status_running(textract_provider):
    """get_job_status maps IN_PROGRESS -> RUNNING."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-004"
    }
    await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-4")

    textract_provider._textract.get_document_analysis.return_value = {
        "JobStatus": "IN_PROGRESS",
        "DocumentMetadata": {"Pages": 3},
        "Blocks": [],
    }

    job = await textract_provider.get_job_status("textract-job-004")
    assert job.status == OcrJobStatus.RUNNING
    assert job.total_pages == 3


@pytest.mark.asyncio
async def test_get_job_status_complete(textract_provider):
    """get_job_status maps SUCCEEDED -> COMPLETE with 100% progress."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-005"
    }
    await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-5")

    textract_provider._textract.get_document_analysis.return_value = {
        "JobStatus": "SUCCEEDED",
        "DocumentMetadata": {"Pages": 2},
        "Blocks": [],
    }

    job = await textract_provider.get_job_status("textract-job-005")
    assert job.status == OcrJobStatus.COMPLETE
    assert job.progress_percent == 100


@pytest.mark.asyncio
async def test_get_job_status_failed(textract_provider):
    """get_job_status maps FAILED with error message."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-006"
    }
    await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-6")

    textract_provider._textract.get_document_analysis.return_value = {
        "JobStatus": "FAILED",
        "StatusMessage": "Unsupported document format",
        "DocumentMetadata": {},
        "Blocks": [],
    }

    job = await textract_provider.get_job_status("textract-job-006")
    assert job.status == OcrJobStatus.FAILED
    assert "Unsupported" in job.error_message


@pytest.mark.asyncio
async def test_get_job_status_unknown_provider_id_raises(textract_provider):
    with pytest.raises(OcrJobNotFound):
        await textract_provider.get_job_status("no-such-textract-job")


@pytest.mark.asyncio
async def test_get_ocr_result_normalizes_blocks(textract_provider):
    """get_ocr_result collects all pages and returns a structured OcrResult."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-007"
    }
    await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-7")

    # Mark as complete so get_ocr_result doesn't raise
    textract_provider._textract.get_document_analysis.return_value = {
        "JobStatus": "SUCCEEDED",
        "DocumentMetadata": {"Pages": 1},
        "Blocks": [],
    }
    await textract_provider.get_job_status("textract-job-007")

    # Now return actual blocks for get_ocr_result
    textract_provider._textract.get_document_analysis.return_value = (
        _minimal_textract_response(page_count=1)
    )

    result = await textract_provider.get_ocr_result("textract-job-007")

    assert isinstance(result, OcrResult)
    assert result.page_count == 1
    assert result.provider_metadata is not None
    assert result.provider_metadata.provider_name == "amazon-textract"


@pytest.mark.asyncio
async def test_get_ocr_result_pagination(textract_provider):
    """get_ocr_result exhausts NextToken pagination to get all blocks."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-008"
    }
    await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-8")

    textract_provider._textract.get_document_analysis.return_value = {
        "JobStatus": "SUCCEEDED",
        "DocumentMetadata": {"Pages": 2},
        "Blocks": [],
    }
    await textract_provider.get_job_status("textract-job-008")

    page1_resp = _minimal_textract_response(page_count=1)
    page1_resp["NextToken"] = "token-abc"

    page2_blocks = [
        _make_word("w2", "PageTwo", page=2),
        _make_line("l2", "PageTwo", ["w2"], page=2),
        _make_page("pg2", ["l2"], page=2),
    ]
    page2_resp = {
        "JobStatus": "SUCCEEDED",
        "DocumentMetadata": {"Pages": 2},
        "Blocks": page2_blocks,
        "ResponseMetadata": {"HTTPHeaders": {}},
    }

    textract_provider._textract.get_document_analysis.side_effect = [
        page1_resp,
        page2_resp,
    ]

    result = await textract_provider.get_ocr_result("textract-job-008")
    assert result.page_count == 2


@pytest.mark.asyncio
async def test_get_ocr_result_raises_when_not_complete(textract_provider):
    """Calling get_ocr_result on a still-running job raises OcrJobNotComplete."""
    textract_provider._textract.start_document_analysis.return_value = {
        "JobId": "textract-job-009"
    }
    job = await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-9")
    # job is QUEUED, not COMPLETE
    with pytest.raises(OcrJobNotComplete):
        await textract_provider.get_ocr_result("textract-job-009")


@pytest.mark.asyncio
async def test_cancel_job_returns_false(textract_provider):
    """Textract doesn't support cancellation; cancel_job always returns False."""
    result = await textract_provider.cancel_job("any-job-id")
    assert result is False


@pytest.mark.asyncio
async def test_s3_upload_failure_raises_ocr_provider_error(textract_provider):
    """If S3 upload fails, OcrProviderError is raised before Textract is called."""
    import botocore.exceptions

    textract_provider._s3 = MagicMock()
    textract_provider._s3.put_object.side_effect = botocore.exceptions.ClientError(
        {"Error": {"Code": "AccessDenied", "Message": "Access Denied"}}, "PutObject"
    )

    with pytest.raises(OcrProviderError, match="Failed to upload PDF"):
        await textract_provider.start_ocr_job(b"%PDF-1.4", job_id="app-job-fail")

    # Textract should never be called if S3 upload fails
    textract_provider._textract.start_document_analysis.assert_not_called()


# ── stub provider ─────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_stub_provider_full_lifecycle():
    """StubOcrProvider runs the complete start -> poll -> result cycle."""
    from pdf_remediation.adapters.ocr_stub import StubOcrProvider
    import asyncio

    provider = StubOcrProvider()
    job = await provider.start_ocr_job(b"%PDF-1.4 stub data" * 100, job_id="stub-job-1")

    assert job.status == OcrJobStatus.QUEUED
    assert job.provider_job_id == "stub-stub-job-1"

    # Let the background task run
    await asyncio.sleep(0.5)

    updated = await provider.get_job_status(job.provider_job_id)
    # Should be running or complete by now
    assert updated.status in (OcrJobStatus.RUNNING, OcrJobStatus.COMPLETE)


@pytest.mark.asyncio
async def test_stub_provider_get_result_requires_complete():
    from pdf_remediation.adapters.ocr_stub import StubOcrProvider

    provider = StubOcrProvider()
    job = await provider.start_ocr_job(b"%PDF-1.4", job_id="stub-job-2")

    with pytest.raises(OcrJobNotComplete):
        await provider.get_ocr_result(job.provider_job_id)


@pytest.mark.asyncio
async def test_stub_provider_cancel():
    from pdf_remediation.adapters.ocr_stub import StubOcrProvider

    provider = StubOcrProvider()
    job = await provider.start_ocr_job(b"%PDF-1.4", job_id="stub-job-3")
    cancelled = await provider.cancel_job(job.provider_job_id)
    assert cancelled is True

    updated = await provider.get_job_status(job.provider_job_id)
    assert updated.status == OcrJobStatus.CANCELLED


# ── live test (opt-in) ────────────────────────────────────────────────


@pytest.mark.live
@pytest.mark.asyncio
async def test_live_textract_contract():
    """Opt-in live test against real Textract. Verifies account permissions
    and that the adapter satisfies the provider contract end-to-end.

    Run with: pytest -m live tests/test_ocr_textract.py::test_live_textract_contract
    """
    import os

    bucket = os.environ.get("PDF_S3_BUCKET")
    if not bucket:
        pytest.skip("PDF_S3_BUCKET not set — skipping live Textract test")

    # A real single-page scanned PDF is needed here. For CI, keep a small
    # public fixture in the test bucket and reference it by key.
    pytest.skip("Live Textract test not yet wired to a fixture document")
