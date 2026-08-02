"""Model <-> plain-dict conversion, shared by the JSON and DynamoDB stores.

`asdict` handles the model -> dict direction (enums are StrEnum, so they
serialise to their plain string value with no hook). This module owns the
dict -> model direction so the two stores can't disagree on it.
"""

from __future__ import annotations

from dataclasses import asdict

from ..models import (
    Document,
    DocumentRoute,
    Issue,
    IssueStatus,
    Job,
    JobStatus,
    TagStatus,
    TriageInfo,
    UnsupportedReason,
)


def job_to_dict(job: Job) -> dict:
    return asdict(job)


def document_to_dict(document: Document) -> dict:
    return asdict(document)


def job_from_dict(data: dict) -> Job:
    return Job(
        job_id=data["job_id"],
        doc_id=data["doc_id"],
        original_pdf_location=data["original_pdf_location"],
        status=JobStatus(data["status"]),
        issues=[issue_from_dict(i) for i in data.get("issues", [])],
        remediated_pdf_location=data.get("remediated_pdf_location"),
        created_at=data["created_at"],
        updated_at=data["updated_at"],
        error_message=data.get("error_message"),
    )


def issue_from_dict(data: dict) -> Issue:
    return Issue(
        issue_id=data["issue_id"],
        page_number=data["page_number"],
        image_index=data["image_index"],
        struct_elem_ref=data["struct_elem_ref"],
        has_alt_text=data["has_alt_text"],
        image_location=data.get("image_location"),
        severity=data.get("severity", "High"),
        suggested_alt_text=data.get("suggested_alt_text"),
        approved_alt_text=data.get("approved_alt_text"),
        status=IssueStatus(data.get("status", "DETECTED")),
        is_decorative=data.get("is_decorative", False),
    )


def document_from_dict(data: dict) -> Document:
    # Parse route — defaults to ALT_TEXT_REMEDIATION for backward compat with
    # documents stored before routing was added.
    raw_route = data.get("route")
    if raw_route is not None:
        route = DocumentRoute(raw_route)
    else:
        # Infer from tag_status for legacy documents
        ts = TagStatus(data["tag_status"])
        if ts == TagStatus.TAGGED:
            route = DocumentRoute.ALT_TEXT_REMEDIATION
        else:
            route = DocumentRoute.UNSUPPORTED

    # Parse unsupported_reason (optional)
    raw_reason = data.get("unsupported_reason")
    unsupported_reason = UnsupportedReason(raw_reason) if raw_reason else None

    # Parse triage metadata (optional). Only known fields are passed through, so
    # a stored record with extra/legacy keys still reconstructs cleanly.
    raw_triage = data.get("triage")
    triage = None
    if raw_triage:
        allowed = TriageInfo.__dataclass_fields__.keys()
        triage = TriageInfo(**{k: v for k, v in raw_triage.items() if k in allowed})

    return Document(
        doc_id=data["doc_id"],
        filename=data["filename"],
        department=data["department"],
        tag_status=TagStatus(data["tag_status"]),
        figures_missing_alt=data["figures_missing_alt"],
        size_bytes=data["size_bytes"],
        updated_at=data["updated_at"],
        route=route,
        unsupported_reason=unsupported_reason,
        is_scan_dominant=data.get("is_scan_dominant", False),
        triage=triage,
        remediated_pdf_key=data.get("remediated_pdf_key"),
        fixed_by_ramp=data.get("fixed_by_ramp", False),
        parent_doc_id=data.get("parent_doc_id"),
    )
