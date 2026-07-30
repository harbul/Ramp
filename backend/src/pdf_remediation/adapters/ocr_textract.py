"""Amazon Textract OCR adapter.

Implements the OCR provider contract using Textract's asynchronous
StartDocumentAnalysis / GetDocumentAnalysis API. AWS response types never
cross this boundary — the caller only sees normalized domain models.

Design notes:
  * Multipage PDFs must use the async API (sync AnalyzeDocument is single-page).
  * The async API requires the source document in S3, so we upload it to a
    caller-supplied prefix and record the key as the stable input artifact.
  * We request all feature types (TABLES, FORMS, LAYOUT, SIGNATURES) in one
    job to avoid paying the per-page minimum twice.
  * GetDocumentAnalysis is paginated; we exhaust all pages before normalizing.
  * Idempotency: if the caller passes a job_id that already has a provider
    job recorded in the in-memory registry, we return that job rather than
    starting a second one.

Credentials are never passed in code — boto3 resolves them from the Lambda
execution role in AWS, or the ambient profile / environment locally.
"""

from __future__ import annotations

import logging
import time
from typing import Any

import boto3
import botocore.exceptions

from ..errors import OcrJobNotComplete, OcrJobNotFound, OcrProviderError
from ..models import (
    OcrBlock,
    OcrJob,
    OcrJobStatus,
    OcrKeyValue,
    OcrLine,
    OcrPage,
    OcrProviderMetadata,
    OcrResult,
    OcrSelection,
    OcrTable,
    OcrWord,
    TextType,
    utc_now,
)

log = logging.getLogger(__name__)

# All feature types the PRD requires.  SIGNATURES is only available in
# async analysis, which is another reason we don't use the sync API.
_FEATURE_TYPES = ["TABLES", "FORMS", "LAYOUT", "SIGNATURES"]

# Textract job status strings
_STATUS_MAP: dict[str, OcrJobStatus] = {
    "IN_PROGRESS": OcrJobStatus.RUNNING,
    "SUCCEEDED": OcrJobStatus.COMPLETE,
    "FAILED": OcrJobStatus.FAILED,
    "PARTIAL_SUCCESS": OcrJobStatus.COMPLETE,  # treat as complete; blocks present
}

# Max pages to retrieve per GetDocumentAnalysis call (Textract max is 1000)
_PAGE_SIZE = 1000

# Retry config for transient AWS errors
_MAX_RETRIES = 3
_RETRY_BASE_DELAY = 1.0  # seconds


class TextractOcrProvider:
    """OCR provider backed by Amazon Textract async document analysis.

    Args:
        s3_bucket: S3 bucket where source PDFs will be uploaded for Textract.
        s3_prefix: Key prefix for Textract input objects (default: "ocr-input/").
        region: AWS region (default: "us-west-2").
        sns_topic_arn: Optional SNS topic ARN for Textract completion notifications.
            When None, callers must poll get_job_status().
    """

    def __init__(
        self,
        *,
        s3_bucket: str,
        s3_prefix: str = "ocr-input/",
        region: str = "us-west-2",
        sns_topic_arn: str | None = None,
        sns_role_arn: str | None = None,
    ) -> None:
        self._bucket = s3_bucket
        self._prefix = s3_prefix.rstrip("/") + "/"
        self._region = region
        self._sns_topic_arn = sns_topic_arn
        self._sns_role_arn = sns_role_arn

        # boto3 resolves credentials from the environment / IAM role — we
        # never accept or store credentials in application code.
        self._s3 = boto3.client("s3", region_name=region)
        self._textract = boto3.client("textract", region_name=region)

        # In-memory registry: app job_id -> OcrJob.  A real deployment would
        # persist this in DynamoDB alongside the OCR result artifact.
        self._jobs: dict[str, OcrJob] = {}

    # ── public interface ──────────────────────────────────────────────

    async def start_ocr_job(self, pdf_data: bytes, job_id: str) -> OcrJob:
        """Upload PDF to S3 and start Textract async analysis.

        Idempotent: if job_id already maps to a provider job, returns the
        existing OcrJob without starting a second Textract job.
        """
        # Idempotency check
        if job_id in self._jobs:
            log.info("ocr job already started, returning existing job_id=%s", job_id)
            return self._jobs[job_id]

        # Upload source PDF to S3 as the immutable input artifact
        s3_key = f"{self._prefix}{job_id}/source.pdf"
        try:
            self._s3.put_object(
                Bucket=self._bucket,
                Key=s3_key,
                Body=pdf_data,
                ContentType="application/pdf",
            )
            log.info("uploaded ocr input job_id=%s s3://%s/%s", job_id, self._bucket, s3_key)
        except botocore.exceptions.ClientError as exc:
            raise OcrProviderError(
                f"Failed to upload PDF to S3 for OCR: {exc.response['Error']['Message']}"
            ) from exc

        # Start async Textract analysis
        try:
            kwargs: dict[str, Any] = {
                "DocumentLocation": {
                    "S3Object": {"Bucket": self._bucket, "Name": s3_key}
                },
                "FeatureTypes": _FEATURE_TYPES,
                "ClientRequestToken": job_id,  # Textract idempotency token
            }
            # Wire up SNS notification if configured
            if self._sns_topic_arn and self._sns_role_arn:
                kwargs["NotificationChannel"] = {
                    "SNSTopicArn": self._sns_topic_arn,
                    "RoleArn": self._sns_role_arn,
                }

            response = self._textract.start_document_analysis(**kwargs)
            provider_job_id: str = response["JobId"]
        except botocore.exceptions.ClientError as exc:
            raise OcrProviderError(
                f"Failed to start Textract job: {exc.response['Error']['Message']}"
            ) from exc

        job = OcrJob(
            job_id=job_id,
            provider_job_id=provider_job_id,
            status=OcrJobStatus.QUEUED,
            created_at=utc_now(),
            updated_at=utc_now(),
        )
        self._jobs[job_id] = job
        log.info(
            "started textract job job_id=%s provider_job_id=%s",
            job_id,
            provider_job_id,
        )
        return job

    async def get_job_status(self, provider_job_id: str) -> OcrJob:
        """Poll Textract for current job status and progress."""
        job = self._find_by_provider_id(provider_job_id)
        if job is None:
            raise OcrJobNotFound(f"No OCR job with provider_job_id={provider_job_id!r}")

        if job.is_terminal:
            return job

        try:
            # Fetch first page only — we just want status + page progress
            resp = self._textract.get_document_analysis(
                JobId=provider_job_id, MaxResults=1
            )
        except botocore.exceptions.ClientError as exc:
            code = exc.response["Error"]["Code"]
            if code == "InvalidJobIdException":
                raise OcrJobNotFound(
                    f"Textract job {provider_job_id!r} not found"
                ) from exc
            raise OcrProviderError(
                f"Textract GetDocumentAnalysis failed: {exc.response['Error']['Message']}"
            ) from exc

        raw_status = resp.get("JobStatus", "IN_PROGRESS")
        job.status = _STATUS_MAP.get(raw_status, OcrJobStatus.RUNNING)
        job.updated_at = utc_now()

        # Surface progress from DocumentMetadata if available
        doc_meta = resp.get("DocumentMetadata", {})
        total = doc_meta.get("Pages", 0)
        if total:
            job.total_pages = total

        # Textract doesn't expose per-page progress in the status call, so we
        # approximate from the status string.
        if job.status == OcrJobStatus.RUNNING:
            job.progress_percent = max(10, min(85, job.progress_percent or 10))
        elif job.status == OcrJobStatus.COMPLETE:
            job.progress_percent = 100
            job.pages_processed = total

        if job.status == OcrJobStatus.FAILED:
            job.error_message = resp.get("StatusMessage", "Textract job failed")

        self._jobs[job.job_id] = job
        return job

    async def get_ocr_result(self, provider_job_id: str) -> OcrResult:
        """Retrieve and normalize all Textract blocks into an OcrResult.

        Exhausts GetDocumentAnalysis pagination, then converts every Textract
        block type into the provider-agnostic domain model. AWS types do not
        leave this method.
        """
        job = self._find_by_provider_id(provider_job_id)
        if job is None:
            raise OcrJobNotFound(f"No OCR job with provider_job_id={provider_job_id!r}")

        if not job.is_complete:
            raise OcrJobNotComplete(
                f"Textract job {provider_job_id!r} is not complete (status={job.status})"
            )

        # Collect all pages of Textract blocks
        all_blocks: list[dict] = []
        next_token: str | None = None
        doc_meta: dict = {}
        api_version: str | None = None

        while True:
            kwargs: dict[str, Any] = {
                "JobId": provider_job_id,
                "MaxResults": _PAGE_SIZE,
            }
            if next_token:
                kwargs["NextToken"] = next_token

            try:
                resp = self._textract.get_document_analysis(**kwargs)
            except botocore.exceptions.ClientError as exc:
                raise OcrProviderError(
                    f"Textract GetDocumentAnalysis failed: {exc.response['Error']['Message']}"
                ) from exc

            if not doc_meta:
                doc_meta = resp.get("DocumentMetadata", {})
            if not api_version:
                # Capture response metadata for provenance
                api_version = resp.get("ResponseMetadata", {}).get(
                    "HTTPHeaders", {}
                ).get("x-amzn-requestid")

            all_blocks.extend(resp.get("Blocks", []))
            next_token = resp.get("NextToken")
            if not next_token:
                break

        log.info(
            "retrieved %d textract blocks provider_job_id=%s",
            len(all_blocks),
            provider_job_id,
        )

        result = _normalize_blocks(all_blocks, doc_meta)
        result.provider_metadata = OcrProviderMetadata(
            provider_name="amazon-textract",
            model_version="DocumentAnalysis",
            api_version=api_version,
        )
        return result

    async def cancel_job(self, provider_job_id: str) -> bool:
        """Textract does not support job cancellation; always returns False."""
        log.info(
            "cancel_job called but Textract does not support cancellation "
            "provider_job_id=%s",
            provider_job_id,
        )
        return False

    # ── helpers ───────────────────────────────────────────────────────

    def _find_by_provider_id(self, provider_job_id: str) -> OcrJob | None:
        """Locate a tracked job by its Textract job id."""
        for job in self._jobs.values():
            if job.provider_job_id == provider_job_id:
                return job
        return None


# ── Textract block normalization ──────────────────────────────────────────────
#
# Textract represents a document as a flat list of Block objects connected by
# id relationships.  We reconstruct page-grouped, hierarchical domain objects
# from that flat representation.
#
# Block type hierarchy we care about:
#   PAGE
#   └── LAYOUT_* (LAYOUT_TITLE, LAYOUT_SECTION_HEADER, LAYOUT_TEXT, …)
#   └── LINE  →  WORD
#   └── TABLE →  TABLE_TITLE?, MERGED_CELL / CELL →  WORD
#   └── KEY_VALUE_SET (KEY) → WORD; KEY_VALUE_SET (VALUE_ID) → WORD
#   └── SELECTION_ELEMENT
#   └── SIGNATURE
# ─────────────────────────────────────────────────────────────────────────────


def _bbox_from_geometry(geometry: dict | None) -> tuple[float, float, float, float]:
    """Convert a Textract BoundingBox dict into (x0, y0, x1, y1).

    Textract coordinates are normalised 0-1 fractions of page dimensions;
    we preserve that representation and let the reconstruction writer convert
    to PDF user-space using the actual page MediaBox.
    """
    if not geometry:
        return (0.0, 0.0, 0.0, 0.0)
    bb = geometry.get("BoundingBox", {})
    left = float(bb.get("Left", 0))
    top = float(bb.get("Top", 0))
    width = float(bb.get("Width", 0))
    height = float(bb.get("Height", 0))
    return (left, top, left + width, top + height)


def _text_type_from_block(block: dict) -> TextType:
    """Map Textract text type to our domain TextType enum."""
    raw = block.get("TextType", "PRINTED")
    if raw == "HANDWRITING":
        return TextType.HANDWRITTEN
    return TextType.PRINTED


def _block_type_label(block_type: str) -> str:
    """Map a Textract LAYOUT_* block type to a readable label."""
    mapping = {
        "LAYOUT_TITLE": "TITLE",
        "LAYOUT_SECTION_HEADER": "HEADING",
        "LAYOUT_TEXT": "TEXT",
        "LAYOUT_FIGURE": "FIGURE",
        "LAYOUT_TABLE": "TABLE",
        "LAYOUT_LIST": "LIST",
        "LAYOUT_FOOTER": "FOOTER",
        "LAYOUT_HEADER": "HEADER",
        "LAYOUT_PAGE_NUMBER": "PAGE_NUMBER",
        "LAYOUT_KEY_VALUE": "KEY_VALUE",
    }
    return mapping.get(block_type, "TEXT")


def _normalize_blocks(blocks: list[dict], doc_meta: dict) -> OcrResult:
    """Convert flat Textract block list into a structured OcrResult."""

    # Build an id->block index for relationship traversal
    by_id: dict[str, dict] = {b["Id"]: b for b in blocks}

    def child_ids(block: dict, rel_type: str = "CHILD") -> list[str]:
        return [
            rel_id
            for rel in block.get("Relationships", [])
            if rel["Type"] == rel_type
            for rel_id in rel["Ids"]
        ]

    def value_ids(block: dict) -> list[str]:
        return [
            rel_id
            for rel in block.get("Relationships", [])
            if rel["Type"] == "VALUE"
            for rel_id in rel["Ids"]
        ]

    # Collect all PAGE blocks in order
    page_blocks = [b for b in blocks if b["BlockType"] == "PAGE"]
    page_blocks.sort(key=lambda b: b.get("Page", 1))

    pages: list[OcrPage] = []

    for page_block in page_blocks:
        page_num = page_block.get("Page", 1)

        # We work with per-page child block ids
        direct_children: set[str] = set(child_ids(page_block))

        ocr_blocks: list[OcrBlock] = []
        ocr_tables: list[OcrTable] = []
        ocr_kvs: list[OcrKeyValue] = []
        ocr_selections: list[OcrSelection] = []

        # Track which block ids we've already folded into a higher-level object
        consumed: set[str] = set()

        # --- Tables ---
        for bid in direct_children:
            block = by_id.get(bid)
            if block is None or block["BlockType"] != "TABLE":
                continue
            consumed.add(bid)
            table = _normalize_table(block, by_id, child_ids)
            ocr_tables.append(table)
            # Mark all cells / words as consumed
            for cell_id in child_ids(block):
                consumed.add(cell_id)
                cell = by_id.get(cell_id)
                if cell:
                    for word_id in child_ids(cell):
                        consumed.add(word_id)

        # --- Key-value pairs (forms) ---
        # KEY_VALUE_SET blocks with EntityTypes=["KEY"] paired with VALUE blocks
        for bid in list(direct_children) + [
            b["Id"] for b in blocks if b.get("Page") == page_num and b["BlockType"] == "KEY_VALUE_SET"
        ]:
            block = by_id.get(bid)
            if block is None or block["BlockType"] != "KEY_VALUE_SET":
                continue
            entity_types = block.get("EntityTypes", [])
            if "KEY" not in entity_types:
                continue
            if bid in consumed:
                continue
            consumed.add(bid)

            kv = _normalize_key_value(block, by_id, child_ids, value_ids)
            if kv:
                ocr_kvs.append(kv)
                for val_id in value_ids(block):
                    consumed.add(val_id)
                    val_block = by_id.get(val_id)
                    if val_block:
                        for wid in child_ids(val_block):
                            consumed.add(wid)
                for wid in child_ids(block):
                    consumed.add(wid)

        # --- Selections (checkboxes / radio buttons) ---
        for bid in list(direct_children) + [
            b["Id"] for b in blocks
            if b.get("Page") == page_num and b["BlockType"] == "SELECTION_ELEMENT"
        ]:
            block = by_id.get(bid)
            if block is None or block["BlockType"] != "SELECTION_ELEMENT":
                continue
            if bid in consumed:
                continue
            consumed.add(bid)
            sel = OcrSelection(
                bbox=_bbox_from_geometry(block.get("Geometry")),
                confidence=float(block.get("Confidence", 0)) / 100.0,
                selection_status=block.get("SelectionStatus", "NOT_SELECTED"),
            )
            ocr_selections.append(sel)

        # --- LAYOUT blocks and LINE/WORD blocks ---
        # Prefer LAYOUT_* blocks when present (they give semantic roles).
        # Fall back to LINE blocks when the page has no LAYOUT blocks.
        layout_blocks = [
            by_id[bid]
            for bid in direct_children
            if bid not in consumed
            and by_id.get(bid, {}).get("BlockType", "").startswith("LAYOUT_")
        ]
        if layout_blocks:
            for layout_block in layout_blocks:
                consumed.add(layout_block["Id"])
                ocr_block = _normalize_layout_block(layout_block, by_id, child_ids, consumed)
                ocr_blocks.append(ocr_block)
        else:
            # Fallback: group LINE blocks into TEXT blocks
            lines: list[OcrLine] = []
            for bid in direct_children:
                block = by_id.get(bid)
                if block is None or block["BlockType"] != "LINE" or bid in consumed:
                    continue
                consumed.add(bid)
                line = _normalize_line(block, by_id, child_ids, consumed)
                lines.append(line)
            if lines:
                full_text = " ".join(ln.text for ln in lines)
                avg_conf = sum(ln.confidence for ln in lines) / len(lines) if lines else 1.0
                page_bbox = _bbox_from_geometry(page_block.get("Geometry"))
                ocr_blocks.append(
                    OcrBlock(
                        text=full_text,
                        confidence=avg_conf,
                        bbox=page_bbox,
                        lines=lines,
                        block_type="TEXT",
                    )
                )

        pages.append(
            OcrPage(
                page_number=page_num,
                width=1.0,   # Textract coords are normalised; real dimensions
                height=1.0,  # resolved during reconstruction from MediaBox.
                blocks=ocr_blocks,
                tables=ocr_tables,
                key_values=ocr_kvs,
                selections=ocr_selections,
            )
        )

    return OcrResult(pages=pages)


def _normalize_layout_block(
    layout_block: dict,
    by_id: dict[str, dict],
    child_ids_fn,
    consumed: set[str],
) -> OcrBlock:
    """Convert a Textract LAYOUT_* block to an OcrBlock with nested lines/words."""
    block_type = _block_type_label(layout_block["BlockType"])
    bbox = _bbox_from_geometry(layout_block.get("Geometry"))
    confidence = float(layout_block.get("Confidence", 0)) / 100.0

    lines: list[OcrLine] = []
    for child_id in child_ids_fn(layout_block):
        child = by_id.get(child_id)
        if child is None:
            continue
        consumed.add(child_id)
        if child["BlockType"] == "LINE":
            lines.append(_normalize_line(child, by_id, child_ids_fn, consumed))

    full_text = " ".join(ln.text for ln in lines) or layout_block.get("Text", "")
    if lines:
        confidence = sum(ln.confidence for ln in lines) / len(lines)

    return OcrBlock(
        text=full_text,
        confidence=confidence,
        bbox=bbox,
        lines=lines,
        block_type=block_type,
        text_type=_text_type_from_block(layout_block),
    )


def _normalize_line(
    line_block: dict,
    by_id: dict[str, dict],
    child_ids_fn,
    consumed: set[str],
) -> OcrLine:
    """Convert a Textract LINE block (and its WORD children) to an OcrLine."""
    words: list[OcrWord] = []
    for word_id in child_ids_fn(line_block):
        word_block = by_id.get(word_id)
        if word_block is None or word_block["BlockType"] != "WORD":
            continue
        consumed.add(word_id)
        words.append(
            OcrWord(
                text=word_block.get("Text", ""),
                confidence=float(word_block.get("Confidence", 0)) / 100.0,
                bbox=_bbox_from_geometry(word_block.get("Geometry")),
                text_type=_text_type_from_block(word_block),
            )
        )

    text = line_block.get("Text", "") or " ".join(w.text for w in words)
    confidence = float(line_block.get("Confidence", 0)) / 100.0

    return OcrLine(
        text=text,
        confidence=confidence,
        bbox=_bbox_from_geometry(line_block.get("Geometry")),
        words=words,
        text_type=_text_type_from_block(line_block),
    )


def _normalize_table(
    table_block: dict,
    by_id: dict[str, dict],
    child_ids_fn,
) -> OcrTable:
    """Convert a Textract TABLE block to an OcrTable."""
    cells: list[dict] = []
    max_row = 0
    max_col = 0

    for cell_id in child_ids_fn(table_block):
        cell_block = by_id.get(cell_id)
        if cell_block is None or cell_block["BlockType"] not in ("CELL", "MERGED_CELL"):
            continue
        row = cell_block.get("RowIndex", 1)
        col = cell_block.get("ColumnIndex", 1)
        max_row = max(max_row, row)
        max_col = max(max_col, col)

        # Gather cell text from its WORD children
        words = [
            by_id[wid].get("Text", "")
            for wid in child_ids_fn(cell_block)
            if by_id.get(wid, {}).get("BlockType") == "WORD"
        ]
        cells.append(
            {
                "row": row,
                "col": col,
                "text": " ".join(words),
                "row_span": cell_block.get("RowSpan", 1),
                "col_span": cell_block.get("ColumnSpan", 1),
                "bbox": _bbox_from_geometry(cell_block.get("Geometry")),
                "confidence": float(cell_block.get("Confidence", 0)) / 100.0,
            }
        )

    return OcrTable(
        bbox=_bbox_from_geometry(table_block.get("Geometry")),
        confidence=float(table_block.get("Confidence", 0)) / 100.0,
        rows=max_row,
        columns=max_col,
        cells=cells,
    )


def _normalize_key_value(
    key_block: dict,
    by_id: dict[str, dict],
    child_ids_fn,
    value_ids_fn,
) -> OcrKeyValue | None:
    """Convert a Textract KEY_VALUE_SET key/value pair to an OcrKeyValue."""
    # Gather key text
    key_words = [
        by_id[wid].get("Text", "")
        for wid in child_ids_fn(key_block)
        if by_id.get(wid, {}).get("BlockType") == "WORD"
    ]
    key_text = " ".join(key_words)
    key_bbox = _bbox_from_geometry(key_block.get("Geometry"))
    confidence = float(key_block.get("Confidence", 0)) / 100.0

    # Gather value text from the linked VALUE block
    val_text = ""
    val_bbox = (0.0, 0.0, 0.0, 0.0)
    for val_id in value_ids_fn(key_block):
        val_block = by_id.get(val_id)
        if val_block is None:
            continue
        val_words = [
            by_id[wid].get("Text", "")
            for wid in child_ids_fn(val_block)
            if by_id.get(wid, {}).get("BlockType") == "WORD"
        ]
        val_text = " ".join(val_words)
        val_bbox = _bbox_from_geometry(val_block.get("Geometry"))
        break  # one value per key

    if not key_text:
        return None

    return OcrKeyValue(
        key=key_text,
        value=val_text,
        key_bbox=key_bbox,
        value_bbox=val_bbox,
        confidence=confidence,
    )
