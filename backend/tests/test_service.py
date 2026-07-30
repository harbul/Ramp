"""Full create -> analyze -> approve -> apply, offline (stub provider + local
storage). No AWS, no network, no cost.
"""

from __future__ import annotations

import pytest

from helpers import open_bytes
from pdf_remediation.adapters.alt_text_stub import StubAltTextProvider
from pdf_remediation.adapters.job_store_json import JsonJobStore
from pdf_remediation.adapters.storage_local import LocalStorage
from pdf_remediation.core.scan import walk_figures
from pdf_remediation.errors import AltTextTooLong, InvalidStateTransition, JobNotFound, NotTagged
from pdf_remediation.models import IssueStatus, JobStatus, TagStatus
from pdf_remediation.service import RemediationService, remediated_filename


@pytest.fixture
def service(tmp_path):
    return RemediationService(
        storage=LocalStorage(tmp_path / "work"),
        jobs=JsonJobStore(tmp_path / "state"),
        alt_text=StubAltTextProvider(),
    )


def _register(service, data, name="Travel Reimbursement Form.pdf"):
    doc, _ = service.register_document(
        filename=name, department="Accounts Payable Travel", pdf_bytes=data
    )
    return doc


def test_full_flow_writes_reviewer_text_into_the_pdf(service, tagged_with_figures):
    doc = _register(service, tagged_with_figures)
    assert doc.tag_status is TagStatus.TAGGED
    assert doc.figures_missing_alt == 2

    job = service.create_job(doc.doc_id)
    assert job.status is JobStatus.UPLOADED

    job = service.analyze(job.job_id)
    assert job.status is JobStatus.NEEDS_REVIEW
    assert len(job.issues) == 2
    assert [i.issue_id for i in job.issues] == ["fig-p1-0", "fig-p2-0"]
    assert all(i.status is IssueStatus.SUGGESTED for i in job.issues)
    assert all(i.suggested_alt_text for i in job.issues)

    # Reviewer edits one, accepts the suggestion on the other.
    edited = "Students walking outside a Sacramento State campus building."
    service.approve(job.job_id, "fig-p1-0", approved=True, alt_text=edited)
    service.approve(job.job_id, "fig-p2-0", approved=True)

    job = service.apply(job.job_id)
    assert job.status is JobStatus.COMPLETE, job.error_message
    assert job.remediated_pdf_location

    # The edited text — not the suggestion — is what's in the file.
    data = service.storage.get_bytes(
        f"jobs/{job.job_id}/remediated/Travel-Reimbursement-Form-remediated.pdf"
    )
    with open_bytes(data) as pdf:
        alts = {f.page_number: f.alt_text for f in walk_figures(pdf)}

    assert alts[1] == edited
    assert alts[2].startswith("[stub]")  # the accepted suggestion
    assert all(i.status is IssueStatus.APPLIED for i in job.issues)


def test_rejected_issue_is_not_written(service, tagged_with_figures):
    doc = _register(service, tagged_with_figures)
    job = service.analyze(service.create_job(doc.doc_id).job_id)

    service.approve(job.job_id, "fig-p1-0", approved=True)
    service.approve(job.job_id, "fig-p2-0", approved=False)

    job = service.apply(job.job_id)
    assert job.status is JobStatus.COMPLETE

    data = service.storage.get_bytes(
        f"jobs/{job.job_id}/remediated/Travel-Reimbursement-Form-remediated.pdf"
    )
    with open_bytes(data) as pdf:
        figures = {f.page_number: f for f in walk_figures(pdf)}

    assert figures[1].has_alt_text
    assert not figures[2].has_alt_text  # the reviewer's "no" survived

    rejected = job.issue("fig-p2-0")
    assert rejected.status is IssueStatus.REJECTED


def test_untagged_document_is_registered_but_cannot_be_remediated(service, untagged_scanned):
    """The library should show it (so the reviewer knows it exists and why it's
    stuck), but creating a job must refuse."""
    doc = _register(service, untagged_scanned, name="Scanned Receipt.pdf")

    assert doc.tag_status is TagStatus.UNTAGGED
    assert doc.figures_missing_alt == 0

    with pytest.raises(NotTagged) as exc:
        service.create_job(doc.doc_id)
    assert "cannot be processed" in str(exc.value)


def test_document_with_nothing_to_fix_is_registered_but_refused(service, tagged_alt_present):
    """A tagged document where all figures already have alt text is classified as
    UNSUPPORTED (no processable content) and cannot create a job."""
    doc = _register(service, tagged_alt_present, name="Already Done.pdf")
    assert doc.tag_status is TagStatus.TAGGED_NO_FIGURES

    with pytest.raises(NotTagged):
        service.create_job(doc.doc_id)


def test_analyze_passes_page_context_to_the_provider(tmp_path, tagged_with_figures):
    """Context is the whole reason the output beats a generic captioner — assert
    it actually reaches the model."""
    provider = StubAltTextProvider()
    service = RemediationService(
        storage=LocalStorage(tmp_path / "work"),
        jobs=JsonJobStore(tmp_path / "state"),
        alt_text=provider,
    )
    doc = _register(service, tagged_with_figures)
    service.analyze(service.create_job(doc.doc_id).job_id)

    assert len(provider.calls) == 2
    for size, context in provider.calls:
        assert size > 0                     # real pixels
        assert "Page" in context            # page text block
    assert "campus building" in provider.calls[0][1]
    assert "voided check" in provider.calls[1][1]


def test_alt_text_over_the_limit_is_rejected(service, tagged_with_figures):
    doc = _register(service, tagged_with_figures)
    job = service.analyze(service.create_job(doc.doc_id).job_id)

    with pytest.raises(AltTextTooLong):
        service.approve(job.job_id, "fig-p1-0", approved=True, alt_text="x" * 126)


def test_download_before_complete_is_refused(service, tagged_with_figures):
    doc = _register(service, tagged_with_figures)
    job = service.analyze(service.create_job(doc.doc_id).job_id)

    with pytest.raises(InvalidStateTransition):
        service.download_url(job.job_id)


def test_download_url_after_complete(service, tagged_with_figures):
    doc = _register(service, tagged_with_figures)
    job = service.analyze(service.create_job(doc.doc_id).job_id)
    service.approve(job.job_id, "fig-p1-0", approved=True)
    job = service.apply(job.job_id)

    url, filename = service.download_url(job.job_id)

    assert filename == "Travel-Reimbursement-Form-remediated.pdf"
    assert url.startswith("file://")


def test_unknown_job_raises(service):
    with pytest.raises(JobNotFound):
        service.get_job("nope")


def test_analyze_records_failure_rather_than_hanging(service, tagged_with_figures, monkeypatch):
    """A job stuck in ANALYZING is worse than a failed one — the frontend polls
    it forever."""
    doc = _register(service, tagged_with_figures)
    job = service.create_job(doc.doc_id)

    def boom(*args, **kwargs):
        raise RuntimeError("bedrock exploded")

    monkeypatch.setattr(service.alt_text, "suggest", boom)

    job = service.analyze(job.job_id)

    assert job.status is JobStatus.FAILED
    assert "bedrock exploded" in job.error_message


def test_library_filter_by_tag_status(service, tagged_with_figures, untagged_scanned, tagged_no_figures):
    """This is what the new Library filter chip calls."""
    service.register_document(
        filename="Travel Form.pdf",
        department="Accounts Payable Travel",
        pdf_bytes=tagged_with_figures,
    )
    service.register_document(
        filename="Scanned Receipt.pdf", department="Bursar", pdf_bytes=untagged_scanned
    )
    service.register_document(
        filename="Direct Deposit.pdf", department="Payroll", pdf_bytes=tagged_no_figures
    )

    assert len(service.list_documents()) == 3

    tagged = service.list_documents(tag_status=TagStatus.TAGGED)
    assert [d.filename for d in tagged] == ["Travel Form.pdf"]

    untagged = service.list_documents(tag_status=TagStatus.UNTAGGED)
    assert [d.filename for d in untagged] == ["Scanned Receipt.pdf"]

    nothing_to_do = service.list_documents(tag_status=TagStatus.TAGGED_NO_FIGURES)
    assert [d.filename for d in nothing_to_do] == ["Direct Deposit.pdf"]

    assert [d.filename for d in service.list_documents(department="Payroll")] == [
        "Direct Deposit.pdf"
    ]
    # Search covers filename and department, mirroring the frontend's matchesQuery.
    assert [d.filename for d in service.list_documents(query="deposit")] == [
        "Direct Deposit.pdf"
    ]
    assert [d.filename for d in service.list_documents(query="bursar")] == [
        "Scanned Receipt.pdf"
    ]


def test_remediated_filename_matches_the_frontend_rule():
    assert remediated_filename("Travel Reimbursement Form.pdf") == (
        "Travel-Reimbursement-Form-remediated.pdf"
    )
    assert remediated_filename("Payroll Direct Deposit.pdf") == (
        "Payroll-Direct-Deposit-remediated.pdf"
    )
