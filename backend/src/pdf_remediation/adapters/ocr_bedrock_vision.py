"""OCR provider using Amazon Bedrock with Claude Haiku 4.5 vision.

Textract is blocked by SCP in this account, so this adapter sends each rendered
page to Claude via the Converse API and parses the structured JSON response into
the project's OcrResult model.

Credentials follow the standard SDK chain: AWS_PROFILE locally, execution role
in Lambda.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import time
import uuid
from io import BytesIO
from typing import Dict

import boto3
import pypdfium2 as pdfium

from ..errors import OcrProviderError, OcrJobNotFound, OcrJobNotComplete
from ..models import (
    OcrBlock,
    OcrJob,
    OcrJobStatus,
    OcrLine,
    OcrPage,
    OcrProviderMetadata,
    OcrResult,
    OcrWord,
    TextType,
)

log = logging.getLogger(__name__)

# The cross-region inference profile for Claude Haiku 4.5
DEFAULT_MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0"
DEFAULT_REGION = "us-west-2"

# US Letter dimensions in PDF points
PAGE_WIDTH_PTS = 612.0
PAGE_HEIGHT_PTS = 792.0

# Structured prompt sent with each page image
_OCR_PROMPT = """Analyze this scanned document page. Extract all text content and identify visual elements.

Return a JSON object with this exact structure:
{
  "blocks": [
    {
      "type": "TITLE" | "HEADING" | "TEXT" | "FIGURE",
      "text": "the text content (empty string for FIGURE)",
      "bbox": [x0, y0, x1, y1],
      "confidence": 0.0-1.0
    }
  ],
  "language": "en"
}

Rules:
- bbox uses NORMALIZED coordinates from 0 to 1000. x0,y0 is top-left corner, x1,y1 is bottom-right corner. 0,0 is the top-left of the page, 1000,1000 is the bottom-right.
- Use TITLE for the main document title or header
- Use HEADING for section headers
- Use TEXT for body paragraphs, form fields, labels, table cells, lists
- Use FIGURE only for meaningful visual content: photographs, charts, graphs, logos, diagrams, illustrations. NOT for: borders, lines, margins, blank areas, scan artifacts, or page edges.
- For FIGURE blocks, text must be empty string.
- FIGURE bounding boxes must be at least 80 units wide AND 80 units tall.
- confidence should reflect how certain you are about the text (0.95+ for clear text, lower for blurry/handwritten)
- Return ONLY the JSON, no explanation"""

_OCR_RETRY_PROMPT = """Return ONLY valid JSON (no markdown, no explanation):
{"blocks": [{"type": "TEXT", "text": "...", "bbox": [x0, y0, x1, y1], "confidence": 0.95}], "language": "en"}
Analyze the document page. bbox uses normalized 0-1000 coordinates (top-left origin)."""



def _render_page_png(pdf_bytes: bytes, page_number: int) -> tuple[bytes, float, float]:
    """Render a single PDF page to PNG bytes at 2x scale for clarity.

    Returns (png_bytes, page_width_pts, page_height_pts).
    """
    doc = pdfium.PdfDocument(pdf_bytes)
    try:
        page = doc[page_number - 1]  # 0-indexed internally
        width_pts = page.get_width()
        height_pts = page.get_height()
        # Render at 2x for better OCR quality
        bitmap = page.render(scale=2.0)
        pil_image = bitmap.to_pil()
        buf = BytesIO()
        pil_image.save(buf, format="PNG")
        return buf.getvalue(), width_pts, height_pts
    finally:
        doc.close()


def _get_page_count(pdf_bytes: bytes) -> int:
    """Return the number of pages in a PDF."""
    doc = pdfium.PdfDocument(pdf_bytes)
    try:
        return len(doc)
    finally:
        doc.close()


def _strip_code_fences(text: str) -> str:
    """Remove markdown code fences if present around JSON."""
    text = text.strip()
    # Handle ```json ... ``` or ``` ... ```
    match = re.match(r"^```(?:json)?\s*\n?(.*?)\n?\s*```$", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text


def _parse_claude_response(text: str) -> dict:
    """Parse Claude's response text into a dict, handling code fences."""
    cleaned = _strip_code_fences(text)
    return json.loads(cleaned)


def _clamp(val: float, low: float, high: float) -> float:
    """Clamp a value between low and high."""
    return max(low, min(high, val))


def _build_ocr_page(page_number: int, width: float, height: float, data: dict) -> OcrPage:
    """Convert Claude's JSON response into an OcrPage with full model hierarchy."""
    blocks: list[OcrBlock] = []

    for raw_block in data.get("blocks", []):
        block_type = raw_block.get("type", "TEXT").upper()
        text = raw_block.get("text", "")
        confidence = float(raw_block.get("confidence", 0.9))
        raw_bbox = raw_block.get("bbox", [0, 0, width, height])

        # Convert normalized 0-1000 coordinates to page points (top-left origin)
        if len(raw_bbox) < 4:
            raw_bbox = [0, 0, 1000, 1000]

        bbox = (
            _clamp(float(raw_bbox[0]) / 1000.0 * width, 0, width),
            _clamp(float(raw_bbox[1]) / 1000.0 * height, 0, height),
            _clamp(float(raw_bbox[2]) / 1000.0 * width, 0, width),
            _clamp(float(raw_bbox[3]) / 1000.0 * height, 0, height),
        )

        # Skip FIGURE blocks with invalid or too-small bounding boxes
        if block_type == "FIGURE":
            fig_width = bbox[2] - bbox[0]
            fig_height = bbox[3] - bbox[1]
            if fig_width < 40 or fig_height < 40:
                log.debug(
                    "Skipping FIGURE with bad bbox on page %d: %s (%.0fx%.0f)",
                    page_number, bbox, fig_width, fig_height,
                )
                continue

        # Build lines and words from the text for non-FIGURE blocks
        lines: list[OcrLine] = []
        if text and block_type != "FIGURE":
            # Split text into lines for the line-level model
            text_lines = text.split("\n") if "\n" in text else [text]
            line_height = (bbox[3] - bbox[1]) / max(len(text_lines), 1)

            for i, line_text in enumerate(text_lines):
                if not line_text.strip():
                    continue
                line_y0 = bbox[1] + i * line_height
                line_y1 = line_y0 + line_height
                line_bbox = (bbox[0], line_y0, bbox[2], line_y1)

                # Split line into words
                words: list[OcrWord] = []
                word_texts = line_text.split()
                if word_texts:
                    word_width = (bbox[2] - bbox[0]) / max(len(word_texts), 1)
                    for j, word_text in enumerate(word_texts):
                        word_x0 = bbox[0] + j * word_width
                        word_x1 = word_x0 + word_width
                        words.append(OcrWord(
                            text=word_text,
                            confidence=confidence,
                            bbox=(word_x0, line_y0, word_x1, line_y1),
                            text_type=TextType.PRINTED,
                        ))

                lines.append(OcrLine(
                    text=line_text.strip(),
                    confidence=confidence,
                    bbox=line_bbox,
                    words=words,
                    text_type=TextType.PRINTED,
                ))

        blocks.append(OcrBlock(
            text=text,
            confidence=confidence,
            bbox=bbox,
            lines=lines,
            block_type=block_type,
            text_type=TextType.PRINTED,
        ))

    return OcrPage(
        page_number=page_number,
        width=width,
        height=height,
        blocks=blocks,
    )


class BedrockVisionOcrProvider:
    """OCR via Amazon Bedrock Claude Haiku 4.5 vision (Converse API).

    Since the Converse API is synchronous, `start_ocr_job` processes all pages
    immediately and stores the result in memory. Subsequent calls to
    `get_job_status` and `get_ocr_result` simply return the cached data.
    """

    def __init__(
        self,
        *,
        profile_name: str | None = None,
        region: str | None = None,
        model_id: str | None = None,
    ):
        self._region = region or DEFAULT_REGION
        self._model_id = model_id or DEFAULT_MODEL_ID
        self._profile_name = profile_name

        # Lazy-init the boto3 client
        self._client = None

        # In-memory store for completed jobs and results
        self._jobs: Dict[str, OcrJob] = {}
        self._results: Dict[str, OcrResult] = {}

    def _get_client(self):
        """Lazily create the bedrock-runtime client."""
        if self._client is None:
            session_kwargs: dict = {"region_name": self._region}
            if self._profile_name:
                session_kwargs["profile_name"] = self._profile_name
            session = boto3.Session(**session_kwargs)
            self._client = session.client("bedrock-runtime")
        return self._client

    async def start_ocr_job(self, pdf_data: bytes, job_id: str) -> OcrJob:
        """Render all pages, send to Claude for OCR, store results immediately."""
        provider_job_id = f"bedrock-vision-{job_id}-{uuid.uuid4().hex[:8]}"
        total_pages = _get_page_count(pdf_data)

        job = OcrJob(
            job_id=job_id,
            provider_job_id=provider_job_id,
            status=OcrJobStatus.RUNNING,
            total_pages=total_pages,
        )
        self._jobs[provider_job_id] = job

        log.info(
            "Starting Bedrock Vision OCR: job_id=%s, provider_job_id=%s, pages=%d",
            job_id, provider_job_id, total_pages,
        )

        start_time = time.time()
        pages: list[OcrPage] = []
        detected_language = "en"

        for page_num in range(1, total_pages + 1):
            log.info("Processing page %d of %d", page_num, total_pages)
            try:
                ocr_page = await self._process_page(pdf_data, page_num)
                pages.append(ocr_page)
            except Exception as exc:
                # Don't fail the whole job for one page
                log.error(
                    "Failed to OCR page %d: %s. Returning empty page.",
                    page_num, exc,
                )
                pages.append(OcrPage(
                    page_number=page_num,
                    width=PAGE_WIDTH_PTS,
                    height=PAGE_HEIGHT_PTS,
                    blocks=[],
                ))

            job.pages_processed = page_num
            job.progress_percent = int((page_num / total_pages) * 100)

        elapsed = time.time() - start_time

        # Store the completed result
        result = OcrResult(
            pages=pages,
            document_language=detected_language,
            provider_metadata=OcrProviderMetadata(
                provider_name="bedrock_vision",
                model_version=self._model_id,
                api_version="converse-v1",
                processing_time_seconds=round(elapsed, 2),
                job_id=provider_job_id,
            ),
        )
        self._results[provider_job_id] = result

        # Mark job complete
        job.status = OcrJobStatus.COMPLETE
        job.progress_percent = 100

        log.info(
            "Bedrock Vision OCR complete: %d pages in %.1fs, provider_job_id=%s",
            total_pages, elapsed, provider_job_id,
        )

        return job

    async def get_job_status(self, provider_job_id: str) -> OcrJob:
        """Return the stored job status (always COMPLETE after start finishes)."""
        if provider_job_id not in self._jobs:
            raise OcrJobNotFound(f"OCR job {provider_job_id} not found")
        return self._jobs[provider_job_id]

    async def get_ocr_result(self, provider_job_id: str) -> OcrResult:
        """Return the stored OcrResult for a completed job."""
        if provider_job_id not in self._jobs:
            raise OcrJobNotFound(f"OCR job {provider_job_id} not found")

        job = self._jobs[provider_job_id]
        if not job.is_complete:
            raise OcrJobNotComplete(
                f"OCR job {provider_job_id} is not complete (status: {job.status})"
            )

        if provider_job_id not in self._results:
            raise OcrProviderError(
                f"Results not found for completed job {provider_job_id}"
            )

        return self._results[provider_job_id]

    async def cancel_job(self, provider_job_id: str) -> bool:
        """Cancel a job. Since processing is synchronous, this is a no-op
        unless called from another thread during processing."""
        if provider_job_id not in self._jobs:
            return False

        job = self._jobs[provider_job_id]
        if job.is_terminal:
            return False

        job.status = OcrJobStatus.CANCELLED
        return True

    async def _process_page(self, pdf_data: bytes, page_number: int) -> OcrPage:
        """Render a single page and send it to Claude for OCR."""
        # Render page to PNG (runs in thread pool to not block event loop)
        loop = asyncio.get_event_loop()
        png_bytes, width_pts, height_pts = await loop.run_in_executor(
            None, _render_page_png, pdf_data, page_number
        )

        # Call Bedrock Converse API
        response_data = await self._call_converse(png_bytes, width_pts, height_pts)

        # Build the OcrPage from Claude's response
        return _build_ocr_page(page_number, width_pts, height_pts, response_data)

    async def _call_converse(
        self, png_bytes: bytes, page_width: float, page_height: float
    ) -> dict:
        """Send the page image to Claude via Converse API and parse the JSON response.

        Retries once with a simpler prompt if the response is not valid JSON.
        """
        # Prompt uses normalized 0-1000 coordinates, no page dimensions needed
        prompt = _OCR_PROMPT

        response_text = await self._invoke_model(png_bytes, prompt)

        # Try to parse the response
        try:
            return _parse_claude_response(response_text)
        except (json.JSONDecodeError, ValueError) as first_err:
            log.warning(
                "First OCR response was not valid JSON, retrying with simpler prompt: %s",
                first_err,
            )

        # Retry with simpler prompt
        retry_prompt = _OCR_RETRY_PROMPT
        response_text = await self._invoke_model(png_bytes, retry_prompt)

        try:
            return _parse_claude_response(response_text)
        except (json.JSONDecodeError, ValueError) as retry_err:
            log.error("Retry also returned invalid JSON: %s", retry_err)
            # Return empty blocks rather than failing
            return {"blocks": [], "language": "en"}

    async def _invoke_model(self, png_bytes: bytes, prompt: str) -> str:
        """Invoke the Bedrock Converse API with an image and text prompt.

        Runs the synchronous boto3 call in a thread pool executor.
        """
        loop = asyncio.get_event_loop()

        def _call():
            client = self._get_client()
            try:
                response = client.converse(
                    modelId=self._model_id,
                    messages=[{
                        "role": "user",
                        "content": [
                            {
                                "image": {
                                    "format": "png",
                                    "source": {"bytes": png_bytes},
                                }
                            },
                            {"text": prompt},
                        ],
                    }],
                    inferenceConfig={"maxTokens": 4096},
                )
                return response["output"]["message"]["content"][0]["text"]
            except client.exceptions.ThrottlingException as exc:
                raise OcrProviderError(
                    f"Bedrock rate limited: {exc}. Consider reducing concurrency."
                ) from exc
            except client.exceptions.ModelTimeoutException as exc:
                raise OcrProviderError(
                    f"Bedrock model timeout: {exc}"
                ) from exc
            except Exception as exc:
                # Catch all boto3/botocore errors
                if "AccessDeniedException" in type(exc).__name__ or "AccessDenied" in str(exc):
                    raise OcrProviderError(
                        f"Access denied for model {self._model_id} in {self._region}. "
                        f"Verify bedrock:InvokeModel permission and model access."
                    ) from exc
                if "ValidationException" in type(exc).__name__:
                    raise OcrProviderError(
                        f"Bedrock validation error: {exc}"
                    ) from exc
                # Re-raise OcrProviderError as-is
                if isinstance(exc, OcrProviderError):
                    raise
                raise OcrProviderError(
                    f"Bedrock Converse API error: {type(exc).__name__}: {exc}"
                ) from exc

        return await loop.run_in_executor(None, _call)
