"""HTTP surface over RemediationService.

Deliberately thin: routes validate, delegate, and serialise. All the logic lives
in service.py, which the Lambda handlers call the same way - so this file is a
dev-time convenience, not a second implementation.

Two conventions bridge Python and the React app:
  * snake_case -> camelCase at the edge (models.py stays free of API concerns)
  * every domain error carries its own code + status, mapped once below
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import asdict, is_dataclass
from typing import Any

from fastapi import BackgroundTasks, FastAPI, File, Form, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..config import Settings, build_service
from ..errors import CorpusFileNotFound, InvalidStateTransition, RemediationError
from ..models import JobStatus, TagStatus
from ..service import RemediationService

log = logging.getLogger(__name__)


def _camel(text: str) -> str:
    head, *rest = text.split("_")
    return head + "".join(word.capitalize() for word in rest)


def camelise(value: Any) -> Any:
    """Recursively convert dict keys to camelCase for the frontend."""
    if is_dataclass(value) and not isinstance(value, type):
        return camelise(asdict(value))
    if isinstance(value, dict):
        return {_camel(k): camelise(v) for k, v in value.items()}
    if isinstance(value, list):
        return [camelise(v) for v in value]
    return value


class ApproveRequest(BaseModel):
    approved: bool
    altText: str | None = None  # noqa: N815 - the wire is camelCase
    decorative: bool = False


class CreateJobRequest(BaseModel):
    docId: str  # noqa: N815


class CorpusIngestRequest(BaseModel):
    department: str
    file: str


def create_app(
    service: RemediationService | None = None,
    *,
    cors_origins: list[str] | None = None,
) -> FastAPI:
    app = FastAPI(title="PDF Remediation API", version="0.1.0")

    # Injected in tests; built from env in dev/prod.
    settings = Settings.from_env()
    app.state.settings = settings
    app.state.service = service or build_service(settings)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins or ["http://localhost:5173"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RemediationError)
    async def _domain_error(_: Request, exc: RemediationError):
        # One place decides HTTP. Routes never build error responses.
        return JSONResponse(status_code=exc.http_status, content=exc.to_dict())

    def svc() -> RemediationService:
        return app.state.service

    # ── library ───────────────────────────────────────────────────────

    @app.get("/pdf/documents")
    def list_documents(
        tagStatus: str | None = None,  # noqa: N803
        department: str | None = None, 
        q: str | None = None,
        route: str | None = None,
    ):
        """The library list with optional filtering by route.
        
        `tagStatus` is what the Library filter sends.
        `route` can be ALT_TEXT_REMEDIATION, OCR_RECONSTRUCTION, or UNSUPPORTED.
        """
        status = None
        if tagStatus:
            try:
                status = TagStatus(tagStatus)
            except ValueError:
                return JSONResponse(
                    status_code=422,
                    content={
                        "error": {
                            "code": "BAD_TAG_STATUS",
                            "message": (
                                f"{tagStatus!r} is not a tag status. Expected one of: "
                                f"{', '.join(t.value for t in TagStatus)}."
                            ),
                        }
                    },
                )

        document_route = None
        if route:
            try:
                from ..models import DocumentRoute
                document_route = DocumentRoute(route)
            except ValueError:
                return JSONResponse(
                    status_code=422,
                    content={
                        "error": {
                            "code": "BAD_ROUTE",
                            "message": (
                                f"{route!r} is not a valid route. Expected one of: "
                                f"{', '.join(r.value for r in DocumentRoute)}."
                            ),
                        }
                    },
                )

        documents = svc().list_documents(
            tag_status=status, department=department, query=q, route=document_route
        )
        return {"documents": camelise(documents)}

    @app.get("/api/dashboard/stats")
    def dashboard_stats():
        """Dashboard summary statistics.

        Returns richer rollups than the basic MVP: overall counts, per-tag-status,
        per-recommendation-action, per-department, and estimated staff hours saved
        (based on missing form-field labels, ~2 min each). Consumed by the
        Dashboard "Accessibility overview" page.
        """
        documents = svc().list_documents()

        # Overall
        total = len(documents)
        tagged = sum(1 for d in documents if d.tag_status == TagStatus.TAGGED)
        untagged = sum(1 for d in documents if d.tag_status == TagStatus.UNTAGGED)
        tagged_no_figs = sum(1 for d in documents if d.tag_status == TagStatus.TAGGED_NO_FIGURES)
        with_missing_alt = sum(1 for d in documents if d.figures_missing_alt > 0)

        # By recommended action (triage may not have run on every doc)
        by_action: dict[str, int] = {}
        for d in documents:
            action = (d.triage.recommended_action if d.triage else None) or "unknown"
            by_action[action] = by_action.get(action, 0) + 1

        # By department
        by_department: dict[str, dict[str, int]] = {}
        for d in documents:
            dept = d.department or "Unknown"
            bucket = by_department.setdefault(dept, {"total": 0, "needsRemediation": 0, "untagged": 0})
            bucket["total"] += 1
            if d.figures_missing_alt > 0 or d.tag_status == TagStatus.UNTAGGED:
                bucket["needsRemediation"] += 1
            if d.tag_status == TagStatus.UNTAGGED:
                bucket["untagged"] += 1

        # Signals
        signal_counts: dict[str, int] = {}
        total_missing_labels = 0
        for d in documents:
            if not d.triage:
                continue
            total_missing_labels += d.triage.missing_label_count or 0
            for s in d.triage.signals or []:
                signal_counts[s] = signal_counts.get(s, 0) + 1

        # Estimated staff hours saved (2 min per auto-fixable label +
        # 5 min per figure-missing-alt that the AI would draft)
        seconds_saved = 120 * total_missing_labels + 300 * sum(d.figures_missing_alt for d in documents)
        hours_saved = round(seconds_saved / 3600, 1)

        return {
            "total": total,
            "tagged": tagged,
            "untagged": untagged,
            "taggedNoFigures": tagged_no_figs,
            "withMissingAlt": with_missing_alt,
            "withImages": with_missing_alt,
            "needsRemediation": with_missing_alt + untagged,
            "noActionNeeded": max(0, total - with_missing_alt - untagged),
            "byAction": by_action,
            "byDepartment": by_department,
            "bySignal": signal_counts,
            "totalMissingLabels": total_missing_labels,
            "estimatedHoursSaved": hours_saved,
        }

    @app.post("/pdf/documents", status_code=201)
    async def upload_document(file: UploadFile = File(...), department: str = Form("Unknown")):
        """Register a PDF and scan it.

        Multipart is fine locally. In AWS the browser PUTs straight to S3 via a
        presigned URL - PDF bytes never cross Lambda (payload limits, cost).
        """
        data = await file.read()
        document, scan = svc().register_document(
            filename=file.filename or "upload.pdf", department=department, pdf_bytes=data
        )
        return {"document": camelise(document), "scan": camelise(scan)}

    @app.post("/pdf/documents/from-corpus", status_code=201)
    def ingest_from_corpus(body: CorpusIngestRequest):
        """Register an already-analyzed campus form straight from the corpus
        bucket, so the Review Queue can remediate it without a re-upload.

        The PDFs live at s3://{corpus_bucket}/{corpus_prefix}/{department}/{file}.
        We fetch the bytes, then hand them to the same register_document path an
        upload uses, so the create -> analyze -> apply flow is identical after this.
        """
        data = _fetch_corpus_pdf(app.state.settings, body.department, body.file)
        # A stable id keyed on the corpus path, so clicking Remediate twice on
        # the same form reuses one document instead of piling up duplicates.
        doc_id = str(
            uuid.uuid5(uuid.NAMESPACE_URL, f"{body.department}/{body.file}")
        )
        document, scan = svc().register_document(
            filename=body.file,
            department=body.department,
            pdf_bytes=data,
            doc_id=doc_id,
        )
        return {"document": camelise(document), "scan": camelise(scan)}

    @app.post("/pdf/triage", status_code=201)
    async def triage_document_endpoint(file: UploadFile = File(...), department: str = Form("Unknown")):
        """Triage pipeline: classify → recommend → auto-remediate.

        This is the new unified upload endpoint that:
        1. Classifies form fields (missing labels, signature fields, etc.)
        2. Generates a recommendation (remediate/recreate/migrate/ok)
        3. Auto-starts alt-text remediation if images are present
        4. Returns full triage result for dashboard display

        The old /pdf/documents endpoint remains for direct library uploads
        without triage.
        """
        from .triage import triage_document

        data = await file.read()
        result = await triage_document(
            svc(),
            filename=file.filename or "upload.pdf",
            department=department,
            pdf_bytes=data,
        )
        return result.to_dict()

    # ── jobs ──────────────────────────────────────────────────────────

    @app.post("/pdf/jobs", status_code=201)
    def create_job(body: CreateJobRequest):
        """Refuses an untagged PDF with 422 NOT_TAGGED - at the door, before we
        spend any model calls on a document we could never write back into."""
        return {"job": camelise(svc().create_job(body.docId))}

    @app.get("/pdf/jobs/{job_id}")
    def get_job(job_id: str):
        """Poll target while status is ANALYZING or APPLYING."""
        return {"job": camelise(svc().get_job(job_id))}

    @app.post("/pdf/jobs/{job_id}/analyze", status_code=202)
    def analyze(job_id: str, background: BackgroundTasks):
        """202 + poll, because a multi-image PDF takes longer than API
        Gateway's hard 29s timeout allows."""
        service = svc()
        job = _begin(service, job_id, JobStatus.ANALYZING)
        background.add_task(service.analyze, job_id)
        return {"job": camelise(job)}

    @app.post("/pdf/jobs/{job_id}/alt-text/{issue_id}/approve")
    def approve(job_id: str, issue_id: str, body: ApproveRequest):
        """The reviewer's edited text arrives here and is what gets written.

        buildResult() in the frontend never reads IssueState.altText, so if this
        took the whole result object instead, every edit would be silently lost.
        """
        issue = svc().approve(
            job_id, issue_id, approved=body.approved, alt_text=body.altText, decorative=body.decorative
        )
        return {"issue": camelise(issue)}

    @app.post("/pdf/jobs/{job_id}/apply", status_code=202)
    def apply(job_id: str, background: BackgroundTasks):
        service = svc()
        job = _begin(service, job_id, JobStatus.APPLYING)
        background.add_task(service.apply, job_id)
        return {"job": camelise(job)}

    # ── OCR reconstruction workflow ────────────────────────────────────

    @app.post("/pdf/ocr-jobs", status_code=201)
    def create_ocr_job(body: CreateJobRequest):
        """Create a job for OCR reconstruction workflow.
        
        Accepts documents routed as OCR_RECONSTRUCTION. Unlike ALT-text jobs,
        OCR jobs can process untagged scanned PDFs.
        """
        return {"job": camelise(svc().create_ocr_job(body.docId))}

    @app.get("/pdf/ocr-jobs/{job_id}")
    def get_ocr_job(job_id: str):
        """Get OCR job status and progress."""
        return {"job": camelise(svc().get_ocr_job(job_id))}

    @app.post("/pdf/ocr-jobs/{job_id}/reconstruct", status_code=202)
    def reconstruct_ocr(job_id: str, background: BackgroundTasks):
        """Start OCR reconstruction process.
        
        This performs full document reconstruction including:
        - Text extraction via OCR
        - Structure analysis
        - Content tagging
        - Accessibility enhancement
        """
        service = svc()
        job = _begin_ocr(service, job_id, JobStatus.ANALYZING)
        background.add_task(service.reconstruct_ocr, job_id)
        return {"job": camelise(job)}

    @app.post("/pdf/ocr-jobs/{job_id}/review-complete", status_code=202)
    def complete_ocr_review(job_id: str):
        """Mark OCR reconstruction review as complete and finalize the document."""
        job = svc().complete_ocr_review(job_id)
        return {"job": camelise(job)}

    @app.get("/pdf/ocr-jobs/{job_id}/preview")
    def get_ocr_preview(job_id: str):
        """Get preview of OCR reconstruction results for review."""
        preview = svc().get_ocr_preview(job_id)
        return {"preview": camelise(preview)}

    @app.get("/pdf/ocr-jobs/{job_id}/download")
    def download_ocr(job_id: str):
        """Download the reconstructed PDF."""
        url, filename = svc().download_ocr_url(job_id)
        return {"downloadUrl": url, "filename": filename, "expiresIn": 900}

    @app.get("/pdf/ocr-jobs/{job_id}/images/{image_id}")
    def ocr_image(job_id: str, image_id: str):
        """Get a detected image from OCR reconstruction for review."""
        png = svc().ocr_image_bytes(job_id, image_id)
        return Response(content=png, media_type="image/png")

    @app.get("/pdf/ocr-jobs/{job_id}/reconstructed.pdf")
    def download_ocr_file(job_id: str):
        """Stream the reconstructed PDF directly."""
        data, filename = svc().reconstructed_bytes(job_id)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    @app.get("/pdf/jobs/{job_id}/download")
    def download(job_id: str):
        url, filename = svc().download_url(job_id)
        return {"downloadUrl": url, "filename": filename, "expiresIn": 900}

    @app.get("/pdf/jobs/{job_id}/issues/{issue_id}/image")
    def figure_image(job_id: str, issue_id: str):
        """The rendered figure PNG, so the review UI shows what the AI saw."""
        png = svc().figure_image_bytes(job_id, issue_id)
        return Response(content=png, media_type="image/png")

    @app.get("/pdf/jobs/{job_id}/remediated.pdf")
    def download_file(job_id: str):
        """Stream the remediated PDF directly. Works for local storage, where a
        presigned file:// URL wouldn't download in a browser; for S3 the
        presigned URL from /download is the efficient path."""
        data, filename = svc().remediated_bytes(job_id)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    # ── WCAG 2.1 AA compliance ────────────────────────────────────────

    @app.post("/pdf/wcag/check")
    async def wcag_check_upload(file: UploadFile = File(...)):
        """Run the WCAG 2.1 AA checker on an uploaded PDF (no persistence).

        Returns the full ``WcagReport`` including per-rule findings, an overall
        score, and which findings are auto-fixable by the tag/modernize/alt-text
        endpoints.
        """
        from ..core.wcag import check_pdf_bytes

        data = await file.read()
        report = check_pdf_bytes(data)
        return camelise(report)

    @app.get("/pdf/documents/{doc_id}/wcag")
    def wcag_check_document(doc_id: str):
        """Run the WCAG checker on the persisted copy of a registered document.

        Uses the original PDF the user uploaded, not the remediated one -
        that's what a demo audience wants to see the score for.
        """
        from ..core.wcag import check_pdf_bytes

        service = svc()
        data = service.get_original_bytes(doc_id)
        report = check_pdf_bytes(data)
        return camelise(report)

    @app.post("/pdf/documents/{doc_id}/tag")
    def tag_document(doc_id: str):
        """Inject a structure tree into an untagged PDF (WCAG 1.3.1 blocker fix).

        Wraps images as /Figure elements and sets /MarkInfo, so the alt-text
        remediation workflow can then process it. Replaces the stored original
        bytes with the tagged version, so subsequent scan/wcag calls see the
        repaired document.
        """
        from ..service import _inject_tag_structure

        service = svc()
        data = service.get_original_bytes(doc_id)
        tagged = _inject_tag_structure(data)
        # Also set MarkInfo flag so viewers treat it as tagged
        from ..core.fixers import set_marked_info
        tagged = set_marked_info(tagged, True)
        service.replace_original_bytes(doc_id, tagged)
        # Re-scan so the persisted Document reflects the new tag status
        _document, scan = service.rescan_document(doc_id)
        return {"scan": camelise(scan), "message": "Structure tree injected."}

    @app.post("/pdf/documents/{doc_id}/modernize")
    def modernize_document(doc_id: str):
        """One-click accessibility modernization (unattended).

        Applies every deterministic WCAG fixer in one shot:
            * inject structure tree (if untagged)
            * set /MarkInfo flag
            * set /Lang (default en-US)
            * set /Title (derived from filename)
            * declare PDF/UA-1 in XMP metadata

        Alt text and form-field labels still need review, but this brings the
        document to the "structural" line of compliance without human input.
        Distinct from ``/pdf/jobs/{id}/apply`` (Remediate), which reviews each
        AI suggestion before writing.
        """
        from ..core.fixers import one_click_modernize
        from ..core.wcag import check_pdf_bytes
        from ..service import _inject_tag_structure

        service = svc()
        doc = service.get_document(doc_id)
        data = service.get_original_bytes(doc_id)
        before = check_pdf_bytes(data)
        modernized, actions = one_click_modernize(
            data, doc.filename, _inject_tag_structure
        )
        service.replace_original_bytes(doc_id, modernized)
        _document, scan = service.rescan_document(doc_id)
        after = check_pdf_bytes(modernized)
        return {
            "actions": actions,
            "before": camelise(before),
            "after": camelise(after),
            "scan": camelise(scan),
        }

    @app.post("/pdf/documents/{doc_id}/clone", status_code=201)
    def clone_document(doc_id: str):
        """Copy an existing document into a new doc_id.

        Used by the Review Queue's Fix Issues button so the Workbench can
        apply fixes to a clone without mutating the parent row. The clone
        carries ``parent_doc_id`` back to the original; the frontend hides
        docs with a parent from the main Review Queue.
        """
        service = svc()
        clone, scan = service.clone_document(doc_id)
        return {"document": camelise(clone), "scan": camelise(scan)}

    @app.post("/pdf/documents/{doc_id}/infer-labels")
    def infer_labels(doc_id: str):
        """Infer form-field labels from field names and write them as /TU
        (WCAG 4.1.2). Uses tier1_humanize (deterministic, no LLM); tiers 2/3
        (geometric header match + Bedrock fallback) are wired in later.

        Returns per-field label writes so the reviewer can audit them.
        """
        from ..core.labels_write import infer_and_write_labels

        service = svc()
        data = service.get_original_bytes(doc_id)
        modified, writes = infer_and_write_labels(data)
        if writes:
            service.replace_original_bytes(doc_id, modified)
            service.rescan_document(doc_id)
        return {
            "labelsWritten": len(writes),
            "writes": [
                {"fieldName": w.field_name, "inferredLabel": w.inferred_label, "confidence": w.confidence}
                for w in writes
            ],
        }

    @app.get("/pdf/documents/{doc_id}/original.pdf")
    def download_original(doc_id: str, download: int = 0):
        """Stream the current stored bytes for a document (post-fix if fixed).

        Default disposition is ``inline`` so the browser's PDF viewer can
        render the file inside an iframe (used by the Review Queue preview
        modal). Pass ``?download=1`` to force ``attachment`` for a "Save As"
        prompt (used by the modal's Download button and the terminal
        Download panel).
        """
        service = svc()
        doc = service.get_document(doc_id)
        data = service.get_original_bytes(doc_id)
        disposition = "attachment" if download else "inline"
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'{disposition}; filename="{doc.filename}"'},
        )

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/pdf/routes")
    def get_routes():
        """Get available document routes and unsupported reasons for frontend filters."""
        from ..models import DocumentRoute, UnsupportedReason

        return {
            "routes": [route.value for route in DocumentRoute],
            "unsupportedReasons": [reason.value for reason in UnsupportedReason],
        }

    return app


_ALLOWED_BEFORE = {
    JobStatus.ANALYZING: {JobStatus.UPLOADED, JobStatus.ANALYZING, JobStatus.NEEDS_REVIEW},
    JobStatus.APPLYING: {JobStatus.NEEDS_REVIEW, JobStatus.APPLYING},
}

# OCR workflow allows different transitions
_OCR_ALLOWED_BEFORE = {
    JobStatus.ANALYZING: {JobStatus.UPLOADED, JobStatus.ANALYZING},
    JobStatus.APPLYING: {JobStatus.NEEDS_REVIEW, JobStatus.APPLYING},
    JobStatus.COMPLETE: {JobStatus.NEEDS_REVIEW, JobStatus.APPLYING},
}


def _fetch_corpus_pdf(settings: Settings, department: str, file: str) -> bytes:
    """Read one form's PDF bytes from the read-only corpus bucket.

    Path traversal is refused (department/file are used verbatim in an S3 key),
    and a missing object or unconfigured bucket surfaces as a clean 404.
    """
    if not settings.corpus_bucket:
        raise CorpusFileNotFound(
            "No corpus bucket configured. Set PDF_CORPUS_BUCKET to remediate "
            "listed forms without a re-upload."
        )
    for part in (department, file):
        if not part or "/" in part or ".." in part or part.startswith("."):
            raise CorpusFileNotFound(f"Invalid corpus reference: {department!r}/{file!r}.")

    import boto3
    from botocore.exceptions import ClientError

    key = f"{settings.corpus_prefix.rstrip('/')}/{department}/{file}"
    s3 = boto3.client("s3", region_name=settings.aws_region)
    try:
        obj = s3.get_object(Bucket=settings.corpus_bucket, Key=key)
        return obj["Body"].read()
    except ClientError as exc:
        code = exc.response.get("Error", {}).get("Code", "")
        if code in ("NoSuchKey", "404", "NoSuchBucket", "AccessDenied"):
            raise CorpusFileNotFound(
                f"{department}/{file} is not in the corpus bucket "
                f"(s3://{settings.corpus_bucket}/{key})."
            ) from exc
        raise


def _begin(service: RemediationService, job_id: str, target: JobStatus):
    """Validate and flip the status *before* returning 202.

    If the background task set it, the client could poll in the gap and see the
    old status - reading "not started" for work that is queued.
    """
    job = service.get_job(job_id)
    if job.status not in _ALLOWED_BEFORE[target]:
        raise InvalidStateTransition(
            f"Cannot {target.value.lower()} a job in state {job.status.value}."
        )
    job.status = target
    service.jobs.put_job(job)
    return job


def _begin_ocr(service: RemediationService, job_id: str, target: JobStatus):
    """OCR-specific job state transitions."""
    job = service.get_ocr_job(job_id)
    if job.status not in _OCR_ALLOWED_BEFORE[target]:
        raise InvalidStateTransition(
            f"Cannot {target.value.lower()} an OCR job in state {job.status.value}."
        )
    job.status = target
    service.jobs.put_job(job)
    return job


# uvicorn pdf_remediation.api.app:app --reload --port 8000
app = create_app() if __name__ != "__main__" else None
