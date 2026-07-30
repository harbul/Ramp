"""Triage pipeline: classify PDF → recommend action → auto-remediate if needed.

Orchestrates the form classification (inventory module) with the existing
alt-text remediation (backend module). This is the unified entry point for PDF
uploads in the MVP.

Flow:
  1. Classify the PDF (form fields, labels, text layer)
  2. Generate recommendation (no_action | remediate | recreate | migrate)
  3. If images detected → auto-start alt-text remediation job
  4. Store document in dashboard inventory
  5. Return classification + recommendation to frontend

The dashboard displays all uploaded documents with their recommendations.
Only "remediate_in_place" documents with images get auto-processed.
"""

from __future__ import annotations

import logging
import re
import sys
from pathlib import Path

from pypdf import PdfReader

# Add inventory module to path
_inventory_path = Path(__file__).resolve().parents[4] / "inventory" / "src"
if str(_inventory_path) not in sys.path:
    sys.path.insert(0, str(_inventory_path))

from classify_form import classify
from label_infer import tier1_humanize
from recommend import FormProfile, recommend

from ..core.scan import scan_bytes
from ..models import IssueStatus, JobStatus, TagStatus, TriageInfo
from ..service import RemediationService

log = logging.getLogger(__name__)

# Process-need + data-sensitivity signal detection, ported from the sac-state
# pipeline (build_form_profile). Keyword heuristics against field names and the
# filename, deliberately conservative (assume sensitive when unsure). These are
# what let a live upload reach the same migrate/recreate reasoning the 90-form
# corpus shows; without them, migrate never fires.
_SENSITIVE_KEYWORDS = re.compile(
    r"ssn|social\s*security|date\s*of\s*birth|\bdob\b|ein|tax\s*id|"
    r"bank|account\s*number|routing|salary|pay\s*rate|medical|health|"
    r"empl|employee|driver|license|credit\s*card|card\s*number",
    re.I,
)
_EMPLOYMENT_RECORD_KEYWORDS = re.compile(
    r"employee|empl|hr\b|payroll|timesheet|personnel|adjustment\s*amount", re.I
)
_WORKFLOW_KEYWORDS = re.compile(r"approv|supervisor|manager|department\s*head|route", re.I)
_EXTERNAL_USER_FILENAME_KEYWORDS = re.compile(r"guest|vendor|consultant|bank|insurance", re.I)


def _field_names(pdf_path: str) -> list[str]:
    try:
        reader = PdfReader(pdf_path)
        return list((reader.get_fields() or {}).keys())
    except Exception:
        return []


def _build_profile(filename: str, classification, pdf_path: str) -> tuple[FormProfile, list[str]]:
    """Build a FormProfile with the process-need/data-sensitivity signals the
    rubric engine needs, plus a short list of the positive signals that fired
    (for the dashboard to surface honestly). Mirrors the sac-state pipeline."""
    field_names = _field_names(pdf_path)
    blob = " ".join(field_names)

    sensitive_hit = bool(_SENSITIVE_KEYWORDS.search(blob))
    employment_hit = bool(_EMPLOYMENT_RECORD_KEYWORDS.search(blob)) or bool(
        _EMPLOYMENT_RECORD_KEYWORDS.search(filename)
    )
    workflow_hit = bool(_WORKFLOW_KEYWORDS.search(blob))
    external_hit = bool(_EXTERNAL_USER_FILENAME_KEYWORDS.search(filename))
    # Conservative: a form with no fields to scan hasn't been ruled safe.
    touches_sensitive = sensitive_hit or not field_names

    # Tier-1 pass: how many missing labels resolve from the field's own name
    # (no pdfplumber, no AI), for the "X auto-fixable" work item.
    auto_fixable = 0
    if classification.missing_label_count:
        try:
            fields = PdfReader(pdf_path).get_fields() or {}
            for fname, f in fields.items():
                if not f.get("/TU"):
                    _, conf = tier1_humanize(fname)
                    if conf == "high":
                        auto_fixable += 1
        except Exception:
            pass

    profile = FormProfile(
        name=filename,
        touches_level_1_2_data=touches_sensitive,
        becomes_student_or_employment_record=employment_hit,
        needs_signature=classification.has_signature_field,
        needs_workflow=workflow_hit,
        needs_approval=workflow_hit,  # same keyword family; split if a form needs otherwise
        needs_external_users=external_hit,
        accessibility_category=classification.category,
        field_count=classification.field_count,
        missing_label_count=classification.missing_label_count,
        auto_fixable_label_count=auto_fixable,
    )

    signals: list[str] = []
    if classification.has_signature_field:
        signals.append("signature field present (from PDF structure)")
    if sensitive_hit:
        signals.append("sensitive-data keywords in field names")
    elif not field_names:
        signals.append("no fields to scan; treated as sensitive by default")
    if employment_hit:
        signals.append("employment-record keywords")
    if workflow_hit:
        signals.append("approval/workflow keywords")
    if external_hit:
        signals.append("external-user keywords in filename")

    return profile, signals


class TriageResult:
    """Result of the triage pipeline."""

    def __init__(
        self,
        *,
        doc_id: str,
        filename: str,
        classification: dict,
        recommendation: dict,
        has_images: bool,
        auto_remediated: bool = False,
        job_id: str | None = None,
        remediation_status: str = "skipped",
        fixed_count: int = 0,
        signals: list[str] | None = None,
    ):
        self.doc_id = doc_id
        self.filename = filename
        self.classification = classification
        self.recommendation = recommendation
        self.has_images = has_images
        self.auto_remediated = auto_remediated
        self.job_id = job_id
        # remediation_status: skipped | complete | needs_review | failed
        self.remediation_status = remediation_status
        self.fixed_count = fixed_count
        self.signals = signals or []

    def to_dict(self) -> dict:
        return {
            "docId": self.doc_id,
            "filename": self.filename,
            "classification": self.classification,
            "recommendation": self.recommendation,
            "hasImages": self.has_images,
            "autoRemediated": self.auto_remediated,
            "jobId": self.job_id,
            "remediationStatus": self.remediation_status,
            "fixedCount": self.fixed_count,
            "signals": self.signals,
        }


async def triage_document(
    service: RemediationService,
    *,
    filename: str,
    department: str,
    pdf_bytes: bytes,
) -> TriageResult:
    """Run the full triage pipeline on an uploaded PDF.

    Steps:
    1. Scan for structure (tags + images)
    2. Classify form fields
    3. Generate recommendation
    4. Auto-remediate if images present
    5. Register in library

    Returns TriageResult with all metadata for dashboard display.
    """
    # Step 1: Scan structure (existing backend logic)
    scan = scan_bytes(pdf_bytes)
    has_images = scan.figures_missing_alt > 0

    # Step 2: Classify form and detect process-need/sensitivity signals.
    # Write bytes to a temp file for classify() + field-name inspection.
    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        classification = classify(tmp_path)
        profile, signals = _build_profile(filename, classification, tmp_path)
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    # Step 3: Generate recommendation (inventory module)
    recommendation = recommend(profile)

    # Step 4: Register document (stores in library), then attach the triage
    # metadata so it persists and the dashboard survives a reload.
    document, doc_scan = service.register_document(
        filename=filename,
        department=department,
        pdf_bytes=pdf_bytes,
    )
    document.triage = TriageInfo(
        category=classification.category,
        pages=classification.pages,
        field_count=classification.field_count,
        missing_label_count=classification.missing_label_count,
        has_signature_field=classification.has_signature_field,
        recommended_action=recommendation.action,
        work_items=recommendation.work_items,
        rationale=recommendation.rationale,
        platforms=recommendation.platforms,
        platform_caveats=recommendation.platform_caveats,
        platform_migration_required=recommendation.platform_migration_required,
        signals=signals,
    )

    # Step 5: Auto-remediate if images detected and the PDF is tagged.
    #
    # This runs the FULL alt-text pipeline unattended:
    #   analyze() -> get a suggestion for every figure missing /Alt
    #   approve()  -> accept each suggestion (no human in the loop)
    #   apply()    -> write the alt text into the PDF and verify it reads back
    #
    # It is synchronous here because the default provider is the offline stub
    # (instant). With the Bedrock provider, vision calls can exceed API
    # Gateway's 29s limit - production should move this to the worker Lambda
    # (202 + poll), same as the /pdf/jobs/{id}/analyze route already does.
    job_id = None
    auto_remediated = False
    remediation_status = "skipped"
    fixed_count = 0

    if has_images and scan.tag_status == TagStatus.TAGGED:
        try:
            job = service.create_job(document.doc_id)
            job_id = job.job_id

            # 1. Scan figures and get an alt-text suggestion for each.
            job = service.analyze(job_id)

            # 2. Accept every suggestion. approve() falls back to the
            #    suggested text when no explicit altText is given.
            for issue in job.issues:
                if issue.suggested_alt_text:
                    service.approve(job_id, issue.issue_id, approved=True)

            # 3. Write the approved alt text into the PDF.
            job = service.apply(job_id)

            fixed_count = sum(1 for i in job.issues if i.status is IssueStatus.APPLIED)
            auto_remediated = job.status is JobStatus.COMPLETE and fixed_count > 0
            remediation_status = "complete" if auto_remediated else job.status.value.lower()
            if auto_remediated and job.remediated_pdf_location:
                document.remediated_pdf_key = job.remediated_pdf_location
            log.info(
                f"Auto-remediated {filename}: job={job_id} status={job.status.value} "
                f"fixed={fixed_count}/{scan.figures_missing_alt}"
            )
        except Exception as exc:
            remediation_status = "failed"
            log.warning(f"Auto-remediation failed for {filename}: {exc}")

    # Persist the enriched document (triage + remediated-PDF link) so it
    # survives a reload and shows in the library with full data.
    service.jobs.put_document(document)

    # Build result
    classification_dict = {
        "category": classification.category,
        "pages": classification.pages,
        "hasTextLayer": classification.has_text_layer,
        "fieldCount": classification.field_count,
        "missingLabelCount": classification.missing_label_count,
        "missingLabelPct": classification.missing_label_pct,
        "hasSignatureField": classification.has_signature_field,
        "notes": classification.notes,
        "tagStatus": scan.tag_status.value,
        "figuresMissingAlt": scan.figures_missing_alt,
    }

    recommendation_dict = {
        "action": recommendation.action,
        "workItems": recommendation.work_items,
        "rationale": recommendation.rationale,
        "platforms": recommendation.platforms,
        "platformCaveats": recommendation.platform_caveats,
        "platformMigrationRequired": recommendation.platform_migration_required,
    }

    return TriageResult(
        doc_id=document.doc_id,
        filename=filename,
        classification=classification_dict,
        recommendation=recommendation_dict,
        has_images=has_images,
        auto_remediated=auto_remediated,
        job_id=job_id,
        remediation_status=remediation_status,
        fixed_count=fixed_count,
        signals=signals,
    )
