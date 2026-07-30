"""Orchestration: create -> analyze -> approve -> apply.

The CLI and both Lambda handlers are thin adapters over this class. It talks to
storage, the job store, and the alt-text provider only through their ports, so
the same code runs against a local directory or against S3 + DynamoDB + Bedrock.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from io import BytesIO

import pikepdf

from .core import render
from .core.apply import apply_alt_text, verify_alt_text, within_limit
from .core.context import extract_page_contexts
from .core.images import ImageExtractionError, extract_png, is_meaningful
from .core.inspect import find_figure_images
from .core.scan import scan_bytes, walk_figures
from .errors import (
    AltTextTooLong,
    InvalidStateTransition,
    IssueNotFound,
    JobNotFound,
    NotTagged,
    OcrProviderError,
)
from .models import (
    DocScan,
    Document,
    DocumentRoute,
    Issue,
    IssueStatus,
    Job,
    JobStatus,
    OcrJob,
    OcrJobStatus,
    TagStatus,
    utc_now,
)
from .ports.alt_text import AltTextProvider
from .ports.job_store import JobStore
from .ports.ocr import OcrProvider
from .ports.storage import Storage

log = logging.getLogger(__name__)


class RemediationService:
    def __init__(self, *, storage: Storage, jobs: JobStore, alt_text: AltTextProvider, ocr: OcrProvider | None = None, layout_detector=None):
        self.storage = storage
        self.jobs = jobs
        self.alt_text = alt_text
        self.ocr = ocr
        self.layout_detector = layout_detector

    # ── library ───────────────────────────────────────────────────────

    def register_document(
        self, *, filename: str, department: str, pdf_bytes: bytes, doc_id: str | None = None
    ) -> tuple[Document, DocScan]:
        """Scan on arrival and record the tag status and routing decision.

        Documents are classified into ALT_TEXT_REMEDIATION (existing workflow),
        OCR_RECONSTRUCTION (new workflow), or UNSUPPORTED (with specific reason).
        All documents are registered for visibility, but only supported ones
        can create jobs.
        """
        doc_id = doc_id or str(uuid.uuid4())
        scan = scan_bytes(pdf_bytes)

        self.storage.put_bytes(
            _original_key(doc_id, filename), pdf_bytes, "application/pdf"
        )

        document = Document(
            doc_id=doc_id,
            filename=filename,
            department=department,
            tag_status=scan.tag_status,
            figures_missing_alt=scan.figures_missing_alt,
            size_bytes=len(pdf_bytes),
            updated_at=utc_now(),
            route=scan.route,
            unsupported_reason=scan.unsupported_reason,
            is_scan_dominant=scan.is_scan_dominant,
        )
        self.jobs.put_document(document)
        log.info(
            "registered doc_id=%s route=%s tag_status=%s figures_missing_alt=%d",
            doc_id, scan.route.value, scan.tag_status.value, scan.figures_missing_alt,
        )
        return document, scan

    def list_documents(self, **filters) -> list[Document]:
        return self.jobs.list_documents(**filters)

    def get_document(self, doc_id: str) -> Document:
        """Fetch a persisted Document by id (or raise JobNotFound)."""
        doc = self.jobs.get_document(doc_id)
        if doc is None:
            raise JobNotFound(f"No document {doc_id!r}.")
        return doc

    def get_original_bytes(self, doc_id: str) -> bytes:
        """Read the currently stored PDF bytes for a document.

        After ``replace_original_bytes`` this returns the post-fix bytes; the
        original ceases to exist. That matches the demo flow: 'the file has
        been modernized' means the stored copy IS the new one.
        """
        doc = self.get_document(doc_id)
        return self.storage.get_bytes(_original_key(doc_id, doc.filename))

    def replace_original_bytes(self, doc_id: str, pdf_bytes: bytes) -> None:
        """Overwrite the stored PDF for a document (used by tag/modernize).

        Also marks the document as fixed_by_ramp so the Review Queue's Fix
        Issues state ("Issues Fixed ✓") flips on the parent row and the
        "Fixed by Ramp" filter (future) picks up the clone.
        """
        doc = self.get_document(doc_id)
        self.storage.put_bytes(
            _original_key(doc_id, doc.filename), pdf_bytes, "application/pdf"
        )
        if not doc.fixed_by_ramp:
            doc.fixed_by_ramp = True
            doc.updated_at = utc_now()
            self.jobs.put_document(doc)

    def clone_document(self, doc_id: str) -> tuple[Document, DocScan]:
        """Copy an existing document's bytes into a new doc_id so the
        Workbench can apply fixes to the clone without mutating the original.

        Used by the Review Queue's Fix Issues button: the parent row stays
        byte-identical, and the clone (with parent_doc_id pointing back to
        the parent) receives every apply()/modernize()/tag/labels write.
        """
        parent = self.get_document(doc_id)
        data = self.get_original_bytes(doc_id)
        # Add a "-fixed" suffix to disambiguate the filename in downloads.
        stem = parent.filename[:-4] if parent.filename.lower().endswith(".pdf") else parent.filename
        clone_filename = f"{stem}-fixed.pdf"
        clone_id = str(uuid.uuid4())
        scan = scan_bytes(data)
        self.storage.put_bytes(
            _original_key(clone_id, clone_filename), data, "application/pdf"
        )
        clone = Document(
            doc_id=clone_id,
            filename=clone_filename,
            department=parent.department,
            tag_status=scan.tag_status,
            figures_missing_alt=scan.figures_missing_alt,
            size_bytes=len(data),
            updated_at=utc_now(),
            route=scan.route,
            unsupported_reason=scan.unsupported_reason,
            is_scan_dominant=scan.is_scan_dominant,
            triage=parent.triage,
            parent_doc_id=parent.doc_id,
            fixed_by_ramp=False,  # flips to True on first apply/modernize
        )
        self.jobs.put_document(clone)
        return clone, scan

    def rescan_document(self, doc_id: str) -> tuple[Document, DocScan]:
        """Re-scan the currently stored bytes and persist updated tag_status.

        Called after ``tag`` or ``modernize`` so the Review Queue sees the new
        state without needing a re-upload.
        """
        data = self.get_original_bytes(doc_id)
        scan = scan_bytes(data)
        doc = self.get_document(doc_id)
        doc.tag_status = scan.tag_status
        doc.figures_missing_alt = scan.figures_missing_alt
        doc.route = scan.route
        doc.unsupported_reason = scan.unsupported_reason
        doc.is_scan_dominant = scan.is_scan_dominant
        doc.size_bytes = len(data)
        doc.updated_at = utc_now()
        self.jobs.put_document(doc)
        return doc, scan

    # ── jobs ──────────────────────────────────────────────────────────

    def create_job(self, doc_id: str) -> Job:
        document = self.jobs.get_document(doc_id)
        if document is None:
            raise JobNotFound(f"No document {doc_id!r}.")

        # Check if document is supported for any workflow
        if document.route == DocumentRoute.UNSUPPORTED:
            reason_msg = f"unsupported ({document.unsupported_reason.value if document.unsupported_reason else 'unknown reason'})"
            raise NotTagged(f"{document.filename!r} is {reason_msg} and cannot be processed.")
        
        # Legacy check for backward compatibility - ALT_TEXT_REMEDIATION requires tagged PDFs
        if document.route == DocumentRoute.ALT_TEXT_REMEDIATION and document.tag_status == TagStatus.UNTAGGED:
            raise NotTagged(
                f"{document.filename!r} has no structure tree. Alt text written into it "
                "would be unreachable by screen readers, so it must be tagged before it "
                "can be remediated."
            )

        job = Job(
            job_id=str(uuid.uuid4()),
            doc_id=doc_id,
            original_pdf_location=_original_key(doc_id, document.filename),
            status=JobStatus.UPLOADED,
        )
        self.jobs.put_job(job)
        return job

    def get_job(self, job_id: str) -> Job:
        job = self.jobs.get_job(job_id)
        if job is None:
            raise JobNotFound(f"No job {job_id!r}.")
        return job

    def analyze(self, job_id: str) -> Job:
        """Find the figures missing alt text, extract each image plus its page
        context, and ask the provider for a suggestion.

        The slow part (vision calls) — this is what runs in the worker Lambda.
        """
        job = self.get_job(job_id)
        if job.status not in (JobStatus.UPLOADED, JobStatus.ANALYZING, JobStatus.NEEDS_REVIEW):
            raise InvalidStateTransition(
                f"Cannot analyze a job in state {job.status.value}."
            )

        job.status = JobStatus.ANALYZING
        job.updated_at = utc_now()
        self.jobs.put_job(job)

        try:
            data = self.storage.get_bytes(job.original_pdf_location)
            job.issues = self._detect_and_suggest(job, data)
            job.status = JobStatus.NEEDS_REVIEW
            job.error_message = None
        except Exception as exc:
            # A job must never stick in ANALYZING — the frontend polls forever.
            log.exception("analyze failed job_id=%s", job_id)
            job.status = JobStatus.FAILED
            job.error_message = str(exc)
        finally:
            job.updated_at = utc_now()
            self.jobs.put_job(job)

        return job

    def _detect_and_suggest(self, job: Job, data: bytes) -> list[Issue]:
        with pikepdf.open(BytesIO(data)) as pdf:
            figures = [f for f in walk_figures(pdf) if not f.has_alt_text]
            if not figures:
                return []

            extracted, unresolved = self._figure_pixels(pdf, data, figures)

        contexts = extract_page_contexts(data, {f.page_number for f, _ in extracted})

        issues: list[Issue] = []
        for figure, png in extracted:
            key = _image_key(job.job_id, figure.page_number, figure.index_on_page)
            location = self.storage.put_bytes(key, png, "image/png")

            context = contexts.get(figure.page_number)
            suggestion = self.alt_text.suggest(
                image_png=png,
                context=context.as_prompt_block() if context else "",
            )

            issues.append(
                Issue(
                    issue_id=_issue_id(figure.page_number, figure.index_on_page),
                    page_number=figure.page_number,
                    image_index=figure.index_on_page,
                    struct_elem_ref=figure.struct_elem_ref,
                    has_alt_text=False,
                    image_location=location,
                    severity="Low" if suggestion.is_decorative else "High",
                    suggested_alt_text=suggestion.alt_text,
                    status=IssueStatus.SUGGESTED,
                )
            )

        # Figures we found but couldn't get pixels for still need a human — a
        # vector diagram is exactly the kind of thing that needs describing.
        for figure in unresolved:
            issues.append(
                Issue(
                    issue_id=_issue_id(figure.page_number, figure.index_on_page),
                    page_number=figure.page_number,
                    image_index=figure.index_on_page,
                    struct_elem_ref=figure.struct_elem_ref,
                    has_alt_text=False,
                    image_location=None,
                    suggested_alt_text=None,
                    status=IssueStatus.DETECTED,  # detected, but no suggestion
                )
            )

        issues.sort(key=lambda i: (i.page_number, i.image_index))
        return issues

    def _figure_pixels(
        self, pdf, data: bytes, figures: list
    ) -> tuple[list[tuple], list]:
        """Get a PNG for each figure. Returns (extracted, unresolved).

        Two strategies, in order:

        1. **Render the /A /BBox region** when the figure has one. This is the
           figure as a sighted reader sees it — composites (one campus figure
           was 8 image tiles) and vector art included. This is why the model
           gets the whole figure, not a fragment.
        2. **Extract the single image XObject** when there's no BBox. Covers
           older tagged PDFs that lack layout attributes.

        A figure that yields no pixels either way is `unresolved` — reported for
        a human, never silently dropped.
        """
        extracted: list[tuple] = []
        unresolved: list = []

        with_bbox = [f for f in figures if f.bbox and render.bbox_is_meaningful(f.bbox)]
        without_bbox = [f for f in figures if not (f.bbox and render.bbox_is_meaningful(f.bbox))]

        if with_bbox:
            pngs = render.render_regions(data, [(f.page_number, f.bbox) for f in with_bbox])
            for figure, png in zip(with_bbox, pngs, strict=True):
                if png is None:
                    unresolved.append(figure)
                else:
                    extracted.append((figure, png))

        # XObject fallback for figures without a usable BBox.
        if without_bbox:
            resolved, missing = find_figure_images(pdf, without_bbox)
            unresolved.extend(missing)
            for item in resolved:
                if not is_meaningful(item.xobject):
                    continue  # a rule or spacer, not worth a vision call
                try:
                    extracted.append((item.figure, extract_png(item.xobject)))
                except ImageExtractionError:
                    log.warning("could not extract image for %s", item.figure.struct_elem_ref)
                    unresolved.append(item.figure)

        return extracted, unresolved

    # ── review ────────────────────────────────────────────────────────

    def approve(self, job_id: str, issue_id: str, *, approved: bool, alt_text: str | None = None) -> Issue:
        """Record the reviewer's decision.

        `alt_text` is the reviewer's edit and takes precedence over the model's
        suggestion. If they didn't edit it, the suggestion stands.
        """
        job = self.get_job(job_id)
        issue = job.issue(issue_id)
        if issue is None:
            raise IssueNotFound(f"No issue {issue_id!r} on job {job_id!r}.")

        if not approved:
            issue.status = IssueStatus.REJECTED
            issue.approved_alt_text = None
        else:
            text = alt_text if alt_text is not None else issue.suggested_alt_text
            if not text or not text.strip():
                raise IssueNotFound(
                    f"Issue {issue_id!r} has no suggestion to approve; provide altText."
                )
            if not within_limit(text):
                raise AltTextTooLong(
                    f"Alt text is {len(text)} characters; WCAG guidance keeps "
                    f"assistive-tech-readable descriptions under 125."
                )
            issue.approved_alt_text = text
            issue.status = IssueStatus.APPROVED

        job.updated_at = utc_now()
        self.jobs.put_job(job)
        return issue

    # ── apply ─────────────────────────────────────────────────────────

    def apply(self, job_id: str) -> Job:
        job = self.get_job(job_id)
        if job.status not in (JobStatus.NEEDS_REVIEW, JobStatus.APPLYING):
            raise InvalidStateTransition(
                f"Cannot apply a job in state {job.status.value}."
            )

        job.status = JobStatus.APPLYING
        job.updated_at = utc_now()
        self.jobs.put_job(job)

        try:
            data = self.storage.get_bytes(job.original_pdf_location)
            approvals = {
                i.struct_elem_ref: i.approved_alt_text
                for i in job.issues
                if i.is_approved and i.approved_alt_text
            }

            result = apply_alt_text(data, approvals)

            # Never ship a file we can't read the answer back out of. Verify by
            # the applied fixes (matched on page+mcid), not the input refs —
            # pikepdf renumbers objects on save.
            verify_alt_text(result.pdf_bytes, result.applied)

            key = _remediated_key(job.job_id, self._filename(job))
            job.remediated_pdf_location = self.storage.put_bytes(
                key, result.pdf_bytes, "application/pdf"
            )

            # Overwrite the doc's original storage too so subsequent WCAG
            # scans, downloads, and Workbench operations see the fixed bytes.
            # Also flips fixed_by_ramp=True on the doc (see
            # replace_original_bytes for the flag write).
            try:
                self.replace_original_bytes(job.doc_id, result.pdf_bytes)
            except Exception:
                log.warning("could not sync remediated bytes to original for %s", job.doc_id)

            applied_refs = {f.struct_elem_ref for f in result.applied}
            for issue in job.issues:
                if issue.struct_elem_ref in applied_refs:
                    issue.status = IssueStatus.APPLIED

            job.status = JobStatus.COMPLETE
            job.error_message = None
            log.info(
                "applied job_id=%s fixed=%d skipped=%d",
                job_id, len(result.applied), len(result.skipped_refs),
            )
        except Exception as exc:
            log.exception("apply failed job_id=%s", job_id)
            job.status = JobStatus.FAILED
            job.error_message = str(exc)
        finally:
            job.updated_at = utc_now()
            self.jobs.put_job(job)

        return job

    def download_url(self, job_id: str, expires_in: int = 900) -> tuple[str, str]:
        job = self.get_job(job_id)
        if job.status is not JobStatus.COMPLETE or not job.remediated_pdf_location:
            raise InvalidStateTransition(
                f"Job {job_id!r} is {job.status.value}; nothing to download yet."
            )
        filename = remediated_filename(self._filename(job))
        key = _remediated_key(job.job_id, self._filename(job))
        return self.storage.presign_get(key, expires_in), filename

    def figure_image_bytes(self, job_id: str, issue_id: str) -> bytes:
        """The rendered figure PNG for one issue — so the reviewer sees what the
        AI saw. Served by the API for the browser to display."""
        job = self.get_job(job_id)
        issue = job.issue(issue_id)
        if issue is None:
            raise IssueNotFound(f"No issue {issue_id!r} on job {job_id!r}.")
        if not issue.image_location:
            raise IssueNotFound(f"Issue {issue_id!r} has no image (vector figure).")
        key = _image_key(job_id, issue.page_number, issue.image_index)
        return self.storage.get_bytes(key)

    def remediated_bytes(self, job_id: str) -> tuple[bytes, str]:
        """The remediated PDF bytes + download filename. Lets the API stream the
        file directly, which works for local storage (a presigned file:// URL
        would not download in a browser)."""
        job = self.get_job(job_id)
        if job.status is not JobStatus.COMPLETE or not job.remediated_pdf_location:
            raise InvalidStateTransition(
                f"Job {job_id!r} is {job.status.value}; nothing to download yet."
            )
        key = _remediated_key(job.job_id, self._filename(job))
        return self.storage.get_bytes(key), remediated_filename(self._filename(job))

    # ── OCR reconstruction workflow ───────────────────────────────────

    def create_ocr_job(self, doc_id: str) -> Job:
        """Create a job for OCR reconstruction workflow.
        
        Unlike ALT-text jobs, OCR jobs can process untagged scanned documents
        that are classified as OCR_RECONSTRUCTION route.
        """
        document = self.jobs.get_document(doc_id)
        if document is None:
            raise JobNotFound(f"No document {doc_id!r}.")

        if document.route != DocumentRoute.OCR_RECONSTRUCTION:
            if document.route == DocumentRoute.UNSUPPORTED:
                reason_msg = f"unsupported ({document.unsupported_reason.value if document.unsupported_reason else 'unknown reason'})"
                raise NotTagged(f"{document.filename!r} is {reason_msg} and cannot be processed via OCR reconstruction.")
            else:
                raise NotTagged(f"{document.filename!r} is not eligible for OCR reconstruction workflow.")

        job = Job(
            job_id=str(uuid.uuid4()),
            doc_id=doc_id,
            original_pdf_location=_original_key(doc_id, document.filename),
            status=JobStatus.UPLOADED,
        )
        self.jobs.put_job(job)
        log.info("created OCR job job_id=%s doc_id=%s", job.job_id, doc_id)
        return job

    def get_ocr_job(self, job_id: str) -> Job:
        """Get OCR job by ID."""
        return self.get_job(job_id)  # Same underlying job model

    def reconstruct_ocr(self, job_id: str) -> Job:
        """Start OCR processing for a scanned PDF.

        Uploads the source PDF to the OCR provider (Textract in production),
        records the provider job id on the application job, and transitions
        to ANALYZING.  The caller is responsible for polling get_ocr_job_status
        until the provider job reaches a terminal state, then calling
        complete_ocr_review.

        Idempotent: safe to retry if the job is already ANALYZING.
        """
        job = self.get_job(job_id)
        if job.status not in (JobStatus.UPLOADED, JobStatus.ANALYZING):
            raise InvalidStateTransition(
                f"Cannot reconstruct OCR for job in state {job.status.value}."
            )

        if self.ocr is None:
            job.status = JobStatus.FAILED
            job.error_message = "No OCR provider configured. Set PDF_OCR_PROVIDER=textract or PDF_OCR_PROVIDER=stub."
            job.updated_at = utc_now()
            self.jobs.put_job(job)
            return job

        job.status = JobStatus.ANALYZING
        job.updated_at = utc_now()
        self.jobs.put_job(job)

        try:
            data = self.storage.get_bytes(job.original_pdf_location)

            # Run the full OCR pipeline synchronously in this background thread:
            # start the job, poll until done, then retrieve and persist results.
            async def _run_ocr_pipeline():
                ocr_job = await self.ocr.start_ocr_job(data, job_id=job_id)
                provider_job_id = ocr_job.provider_job_id

                # Poll until the provider finishes
                import asyncio as _asyncio
                for _ in range(300):  # ~5 min max with 1s sleep
                    status = await self.ocr.get_job_status(provider_job_id)
                    if status.is_terminal:
                        break
                    await _asyncio.sleep(1.0)

                if status.status != OcrJobStatus.COMPLETE:
                    raise OcrProviderError(
                        f"OCR job ended with status {status.status.value}: "
                        f"{status.error_message or 'unknown error'}"
                    )

                # Retrieve the normalized result
                return provider_job_id, await self.ocr.get_ocr_result(provider_job_id)

            provider_job_id, ocr_result = asyncio.run(_run_ocr_pipeline())

            # Persist normalized result as a versioned artifact
            import json
            from dataclasses import asdict

            result_key = f"jobs/{job_id}/ocr/normalized_result.json"
            result_bytes = json.dumps(asdict(ocr_result), default=str).encode()
            self.storage.put_bytes(result_key, result_bytes, "application/json")

            job.error_message = f"ocr_provider_job_id={provider_job_id}"
            job.status = JobStatus.NEEDS_REVIEW
            log.info(
                "OCR complete job_id=%s provider_job_id=%s pages=%d",
                job_id,
                provider_job_id,
                ocr_result.page_count,
            )
        except OcrProviderError as exc:
            log.exception("OCR failed job_id=%s", job_id)
            job.status = JobStatus.FAILED
            job.error_message = str(exc)
        except Exception as exc:
            log.exception("OCR start failed job_id=%s", job_id)
            job.status = JobStatus.FAILED
            job.error_message = str(exc)
        finally:
            job.updated_at = utc_now()
            self.jobs.put_job(job)

        return job

    def get_ocr_provider_job_status(self, job_id: str) -> OcrJob:
        """Poll the OCR provider for current job status.

        Returns an OcrJob with the current provider status.  The caller
        should keep polling while status is QUEUED or RUNNING, then call
        finalize_ocr once COMPLETE.
        """
        job = self.get_job(job_id)
        provider_job_id = _extract_provider_job_id(job.error_message)
        if not provider_job_id:
            raise InvalidStateTransition(
                f"Job {job_id!r} has no provider job id — was reconstruct_ocr called first?"
            )

        if self.ocr is None:
            raise OcrProviderError("No OCR provider configured.")

        return asyncio.run(self.ocr.get_job_status(provider_job_id))

    def finalize_ocr(self, job_id: str) -> Job:
        """Retrieve normalized OCR results and transition job to NEEDS_REVIEW.

        Called after get_ocr_provider_job_status returns COMPLETE.
        Persists the normalized OcrResult as a JSON artifact for the reviewer.
        """
        import json
        from dataclasses import asdict

        job = self.get_job(job_id)
        if job.status not in (JobStatus.ANALYZING, JobStatus.NEEDS_REVIEW):
            raise InvalidStateTransition(
                f"Cannot finalize OCR for job in state {job.status.value}."
            )

        provider_job_id = _extract_provider_job_id(job.error_message)
        if not provider_job_id:
            raise InvalidStateTransition(
                f"Job {job_id!r} has no provider job id."
            )

        if self.ocr is None:
            raise OcrProviderError("No OCR provider configured.")

        try:
            ocr_result = asyncio.run(self.ocr.get_ocr_result(provider_job_id))

            # Persist normalized result as a versioned artifact
            result_key = f"jobs/{job_id}/ocr/normalized_result.json"
            result_bytes = json.dumps(asdict(ocr_result), default=str).encode()
            self.storage.put_bytes(result_key, result_bytes, "application/json")

            job.status = JobStatus.NEEDS_REVIEW
            job.error_message = f"ocr_provider_job_id={provider_job_id}"  # keep it for reference
            log.info(
                "OCR result persisted job_id=%s pages=%d",
                job_id,
                ocr_result.page_count,
            )
        except Exception as exc:
            log.exception("OCR finalization failed job_id=%s", job_id)
            job.status = JobStatus.FAILED
            job.error_message = str(exc)
        finally:
            job.updated_at = utc_now()
            self.jobs.put_job(job)

        return job

    def complete_ocr_review(self, job_id: str) -> Job:
        """Complete the OCR review process and finalize the document.

        Loads the normalized OCR result and uses it to build a proper
        StructTreeRoot with text structure (H1/H/P) and Figure elements.
        Detected images are stored for later alt-text review.
        """
        import json

        from .core.ocr_structure import build_ocr_structure

        job = self.get_job(job_id)
        if job.status != JobStatus.NEEDS_REVIEW:
            raise InvalidStateTransition(
                f"Cannot complete review for OCR job in state {job.status.value}."
            )

        job.status = JobStatus.APPLYING
        job.updated_at = utc_now()
        self.jobs.put_job(job)

        try:
            # Load OCR result from storage
            result_key = f"jobs/{job_id}/ocr/normalized_result.json"
            result_bytes = self.storage.get_bytes(result_key)
            ocr_data = json.loads(result_bytes)
            ocr_result = _ocr_result_from_dict(ocr_data)

            # Load the original PDF
            data = self.storage.get_bytes(job.original_pdf_location)

            # Build OCR-aware structure tree
            tagged_data, detected_images = build_ocr_structure(
                data, ocr_result, job_id, self.storage,
                layout_detector=self.layout_detector,
            )

            # Persist detected images list for preview/review
            images_key = f"jobs/{job_id}/ocr/detected_images.json"
            images_bytes = json.dumps(detected_images, default=str).encode()
            self.storage.put_bytes(images_key, images_bytes, "application/json")

            # Store the reconstructed PDF
            key = _reconstructed_key(job.job_id, self._filename(job))
            job.remediated_pdf_location = self.storage.put_bytes(
                key, tagged_data, "application/pdf"
            )

            job.status = JobStatus.COMPLETE
            job.error_message = None
            log.info("OCR reconstruction completed for job_id=%s", job_id)
            
        except Exception as exc:
            log.exception("OCR review completion failed job_id=%s", job_id)
            job.status = JobStatus.FAILED
            job.error_message = str(exc)
        finally:
            job.updated_at = utc_now()
            self.jobs.put_job(job)

        return job

    def get_ocr_preview(self, job_id: str) -> dict:
        """Get preview of OCR reconstruction results.

        Returns a summary of what was detected and reconstructed for review,
        including text regions, detected images, and confidence scores.
        """
        import json

        job = self.get_job(job_id)
        if job.status not in (JobStatus.NEEDS_REVIEW, JobStatus.APPLYING, JobStatus.COMPLETE):
            raise InvalidStateTransition(
                f"No preview available for OCR job in state {job.status.value}."
            )

        # Load OCR result
        result_key = f"jobs/{job_id}/ocr/normalized_result.json"
        try:
            result_bytes = self.storage.get_bytes(result_key)
            ocr_data = json.loads(result_bytes)
            ocr_result = _ocr_result_from_dict(ocr_data)
        except Exception:
            # Fallback if OCR result is not yet available
            return {
                "job_id": job_id,
                "pages_processed": 0,
                "text_regions": [],
                "images_detected": 0,
                "detected_images": [],
                "structure_elements": [],
                "confidence_score": 0.0,
            }

        # Load detected images (may not exist yet if review not completed)
        images_key = f"jobs/{job_id}/ocr/detected_images.json"
        try:
            images_bytes = self.storage.get_bytes(images_key)
            detected_images = json.loads(images_bytes)
        except Exception:
            detected_images = []

        # Build text regions from OCR result
        text_regions = [
            {
                "page": p.page_number,
                "blocks": [
                    {
                        "text": b.text,
                        "type": b.block_type,
                        "confidence": b.confidence,
                    }
                    for b in p.blocks
                ],
            }
            for p in ocr_result.pages
        ]

        # Count structure elements by type
        type_counts: dict[str, int] = {}
        for page in ocr_result.pages:
            for block in page.blocks:
                elem_type = {"TITLE": "H1", "HEADING": "H", "TEXT": "P"}.get(
                    block.block_type, "P"
                )
                type_counts[elem_type] = type_counts.get(elem_type, 0) + 1
        if detected_images:
            type_counts["Figure"] = len(detected_images)
        structure_elements = [
            {"type": t, "count": c} for t, c in sorted(type_counts.items())
        ]

        # Calculate average confidence
        all_confidences = [
            b.confidence
            for p in ocr_result.pages
            for b in p.blocks
        ]
        confidence_score = (
            sum(all_confidences) / len(all_confidences)
            if all_confidences
            else 0.0
        )

        return {
            "job_id": job_id,
            "pages_processed": ocr_result.page_count,
            "text_regions": text_regions,
            "images_detected": len(detected_images),
            "detected_images": detected_images,
            "structure_elements": structure_elements,
            "confidence_score": round(confidence_score, 3),
        }

    def download_ocr_url(self, job_id: str, expires_in: int = 900) -> tuple[str, str]:
        """Get download URL for reconstructed PDF."""
        job = self.get_job(job_id)
        if job.status is not JobStatus.COMPLETE or not job.remediated_pdf_location:
            raise InvalidStateTransition(
                f"OCR job {job_id!r} is {job.status.value}; nothing to download yet."
            )
        filename = reconstructed_filename(self._filename(job))
        key = _reconstructed_key(job.job_id, self._filename(job))
        return self.storage.presign_get(key, expires_in), filename

    def reconstructed_bytes(self, job_id: str) -> tuple[bytes, str]:
        """Get the reconstructed PDF bytes for streaming."""
        job = self.get_job(job_id)
        if job.status is not JobStatus.COMPLETE or not job.remediated_pdf_location:
            raise InvalidStateTransition(
                f"OCR job {job_id!r} is {job.status.value}; nothing to download yet."
            )
        key = _reconstructed_key(job.job_id, self._filename(job))
        return self.storage.get_bytes(key), reconstructed_filename(self._filename(job))

    def ocr_image_bytes(self, job_id: str, image_id: str) -> bytes:
        """Get a detected image from OCR reconstruction for review.

        The image_id is in the format 'img-p{page}-{index}'. The PNG is
        stored at jobs/{job_id}/ocr/images/{image_id}.png during
        build_ocr_structure.
        """
        # Validate the image_id format to prevent path traversal
        if not image_id.startswith("img-p"):
            raise IssueNotFound(f"Invalid image_id format: {image_id!r}")
        key = f"jobs/{job_id}/ocr/images/{image_id}.png"
        try:
            return self.storage.get_bytes(key)
        except Exception as exc:
            raise IssueNotFound(
                f"Image {image_id!r} not found for job {job_id!r}."
            ) from exc

    def _filename(self, job: Job) -> str:
        document = self.jobs.get_document(job.doc_id)
        return document.filename if document else "document.pdf"


# ── key scheme (mirrors the S3 layout in the plan) ───────────────────

def _original_key(doc_id: str, filename: str) -> str:
    return f"jobs/{doc_id}/original/{filename}"


def _image_key(job_id: str, page: int, index: int) -> str:
    return f"jobs/{job_id}/images/p{page}-f{index}.png"


def _remediated_key(job_id: str, filename: str) -> str:
    return f"jobs/{job_id}/remediated/{remediated_filename(filename)}"


def _reconstructed_key(job_id: str, filename: str) -> str:
    """Key for OCR reconstructed PDFs."""
    return f"jobs/{job_id}/reconstructed/{reconstructed_filename(filename)}"


def _issue_id(page: int, index: int) -> str:
    return f"fig-p{page}-{index}"


def _extract_provider_job_id(error_message: str | None) -> str | None:
    """Extract the OCR provider job ID from the job's error_message carrier field.

    The format is 'ocr_provider_job_id=<id>'. Returns None if the field is
    absent or doesn't contain the expected prefix.
    """
    if not error_message:
        return None
    prefix = "ocr_provider_job_id="
    if error_message.startswith(prefix):
        return error_message[len(prefix):]
    return None


def _ocr_result_from_dict(data: dict) -> "OcrResult":
    """Reconstruct an OcrResult from its JSON-serialized dict form."""
    from .models import (
        OcrBlock,
        OcrLine,
        OcrPage,
        OcrProviderMetadata,
        OcrResult,
        OcrWord,
        TextType,
    )

    pages = []
    for page_data in data.get("pages", []):
        blocks = []
        for block_data in page_data.get("blocks", []):
            lines = []
            for line_data in block_data.get("lines", []):
                words = []
                for word_data in line_data.get("words", []):
                    words.append(OcrWord(
                        text=word_data["text"],
                        confidence=float(word_data["confidence"]),
                        bbox=tuple(word_data["bbox"]),
                        text_type=TextType(word_data.get("text_type", "PRINTED")),
                    ))
                lines.append(OcrLine(
                    text=line_data["text"],
                    confidence=float(line_data["confidence"]),
                    bbox=tuple(line_data["bbox"]),
                    words=words,
                    text_type=TextType(line_data.get("text_type", "PRINTED")),
                ))
            blocks.append(OcrBlock(
                text=block_data["text"],
                confidence=float(block_data["confidence"]),
                bbox=tuple(block_data["bbox"]),
                lines=lines,
                block_type=block_data.get("block_type", "TEXT"),
                text_type=TextType(block_data.get("text_type", "PRINTED")),
            ))
        pages.append(OcrPage(
            page_number=int(page_data["page_number"]),
            width=float(page_data["width"]),
            height=float(page_data["height"]),
            blocks=blocks,
        ))

    provider_metadata = None
    if data.get("provider_metadata"):
        pm = data["provider_metadata"]
        provider_metadata = OcrProviderMetadata(
            provider_name=pm["provider_name"],
            model_version=pm.get("model_version"),
            api_version=pm.get("api_version"),
            processing_time_seconds=pm.get("processing_time_seconds"),
            job_id=pm.get("job_id"),
        )

    return OcrResult(
        pages=pages,
        document_language=data.get("document_language", "en"),
        provider_metadata=provider_metadata,
        created_at=data.get("created_at", ""),
    )


def remediated_filename(original: str) -> str:
    """'Travel Reimbursement Form.pdf' -> 'Travel-Reimbursement-Form-remediated.pdf'

    Matches remediatedFileName() in the frontend's lib/remediation.ts so the
    name the reviewer was promised is the name they get.
    """
    base = original[:-4] if original.lower().endswith(".pdf") else original
    return f"{'-'.join(base.split())}-remediated.pdf"


def reconstructed_filename(original: str) -> str:
    """'Travel Reimbursement Form.pdf' -> 'Travel-Reimbursement-Form-reconstructed.pdf'
    
    Similar to remediated_filename but for OCR reconstruction workflow.
    """
    base = original[:-4] if original.lower().endswith(".pdf") else original
    return f"{'-'.join(base.split())}-reconstructed.pdf"


def _inject_tag_structure(pdf_bytes: bytes) -> bytes:
    """Inject a basic PDF structure tree into an untagged PDF.

    For each page, marks every image XObject as a /Figure structure element
    (without /Alt, so the alt-text remediation flow picks them up). Also adds
    /MarkInfo <</Marked true>> so PDF readers treat it as a tagged document.

    This turns a flat scanned PDF into a tagged PDF that the alt-text
    remediation workflow can accept and process.
    """
    from io import BytesIO

    import pikepdf
    from pikepdf import Array, Dictionary, Name, Pdf

    with pikepdf.open(BytesIO(pdf_bytes)) as pdf:
        # Build the structure tree
        struct_elems = []

        for page_idx, page in enumerate(pdf.pages):
            resources = page.obj.get("/Resources", {})
            xobjects = resources.get("/XObject")
            if xobjects is None:
                continue

            # Find all image XObjects on this page
            image_names = [
                name for name, obj in xobjects.items()
                if obj.get("/Subtype") == Name.Image
            ]
            if not image_names:
                continue

            # Parse the existing content stream
            existing_content = b""
            if "/Contents" in page.obj:
                contents = page.obj["/Contents"]
                if isinstance(contents, pikepdf.Array):
                    for stream in contents:
                        existing_content += stream.read_bytes()
                else:
                    existing_content = contents.read_bytes()

            # Rebuild the content stream: wrap each image Do command in BDC/EMC
            # and track MCIDs for any images we find
            mcid_counter = 0
            page_struct_elems = []

            # Strategy: parse content, find Do operators for images, wrap them
            try:
                instructions = pikepdf.parse_content_stream(page)
            except pikepdf.PdfError:
                # Can't parse — fall back to wrapping all images at the end
                instructions = None

            if instructions is not None:
                new_instructions = []
                for instruction in instructions:
                    op = str(instruction.operator)
                    if op == "Do" and instruction.operands:
                        xobj_name = str(instruction.operands[0])
                        if xobj_name in image_names:
                            # Wrap this Do in a marked content sequence
                            props = pikepdf.Dictionary({"/MCID": mcid_counter})
                            new_instructions.append(
                                pikepdf.ContentStreamInstruction(
                                    [Name.Figure, props], pikepdf.Operator("BDC")
                                )
                            )
                            new_instructions.append(instruction)
                            new_instructions.append(
                                pikepdf.ContentStreamInstruction([], pikepdf.Operator("EMC"))
                            )

                            struct_elem = pdf.make_indirect(Dictionary({
                                "/Type": Name.StructElem,
                                "/S": Name.Figure,
                                "/Pg": page.obj,
                                "/K": mcid_counter,
                            }))
                            page_struct_elems.append(struct_elem)
                            mcid_counter += 1
                        else:
                            new_instructions.append(instruction)
                    else:
                        new_instructions.append(instruction)

                # Write the modified content stream
                new_content = pikepdf.unparse_content_stream(new_instructions)
                page.obj["/Contents"] = pdf.make_stream(new_content)
            else:
                # Fallback: prepend BDC/EMC wrapped Do commands for each image
                new_content = b""
                for name in image_names:
                    new_content += f"/Figure <</MCID {mcid_counter}>> BDC\n".encode()
                    new_content += f"q 612 0 0 792 0 0 cm {name} Do Q\n".encode()
                    new_content += b"EMC\n"

                    struct_elem = pdf.make_indirect(Dictionary({
                        "/Type": Name.StructElem,
                        "/S": Name.Figure,
                        "/Pg": page.obj,
                        "/K": mcid_counter,
                    }))
                    page_struct_elems.append(struct_elem)
                    mcid_counter += 1

                # Append original content after
                new_content += existing_content
                page.obj["/Contents"] = pdf.make_stream(new_content)

            struct_elems.extend(page_struct_elems)

        if not struct_elems:
            # No images found — add a single Document element so it's still tagged
            struct_elems.append(pdf.make_indirect(Dictionary({
                "/Type": Name.StructElem,
                "/S": Name("/Document"),
                "/K": Array([]),
            })))

        # Create the root of the structure tree
        struct_tree_root = pdf.make_indirect(Dictionary({
            "/Type": Name.StructTreeRoot,
            "/K": Array(struct_elems) if len(struct_elems) > 1 else struct_elems[0],
            "/ParentTree": pdf.make_indirect(Dictionary({
                "/Type": Name("/NumberTree"),
                "/Nums": Array([]),
            })),
        }))

        # Set parent references on struct elems
        for elem in struct_elems:
            elem["/P"] = struct_tree_root

        # Attach to the document catalog
        pdf.Root["/StructTreeRoot"] = struct_tree_root
        pdf.Root["/MarkInfo"] = Dictionary({"/Marked": True})

        # Write to bytes
        out = BytesIO()
        pdf.save(out)
        return out.getvalue()
