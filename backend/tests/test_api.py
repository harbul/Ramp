"""API contract: status codes, the refusals, camelCase, and ?tagStatus filtering.

Uses the stub provider and local storage, so this runs offline.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from pdf_remediation.adapters.alt_text_stub import StubAltTextProvider
from pdf_remediation.adapters.job_store_json import JsonJobStore
from pdf_remediation.adapters.storage_local import LocalStorage
from pdf_remediation.api.app import camelise, create_app
from pdf_remediation.service import RemediationService


@pytest.fixture
def client(tmp_path):
    service = RemediationService(
        storage=LocalStorage(tmp_path / "work"),
        jobs=JsonJobStore(tmp_path / "state"),
        alt_text=StubAltTextProvider(),
    )
    return TestClient(create_app(service))


def _upload(client, data: bytes, name="Travel Reimbursement Form.pdf", dept="Accounts Payable Travel"):
    response = client.post(
        "/pdf/documents",
        files={"file": (name, data, "application/pdf")},
        data={"department": dept},
    )
    assert response.status_code == 201, response.text
    return response.json()["document"]


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_upload_returns_camelcase_and_tag_status(client, tagged_with_figures):
    document = _upload(client, tagged_with_figures)

    # The frontend reads camelCase; models.py stays snake_case.
    assert document["tagStatus"] == "TAGGED"
    assert document["figuresMissingAlt"] == 2
    assert "tag_status" not in document


def test_full_flow_over_http(client, tagged_with_figures):
    document = _upload(client, tagged_with_figures)

    job = client.post("/pdf/jobs", json={"docId": document["docId"]}).json()["job"]
    assert job["status"] == "UPLOADED"
    job_id = job["jobId"]

    # 202 + poll: TestClient runs background tasks before returning, so by the
    # time we poll the work is done.
    assert client.post(f"/pdf/jobs/{job_id}/analyze").status_code == 202

    job = client.get(f"/pdf/jobs/{job_id}").json()["job"]
    assert job["status"] == "NEEDS_REVIEW"
    assert len(job["issues"]) == 2
    assert job["issues"][0]["issueId"] == "fig-p1-0"
    assert job["issues"][0]["suggestedAltText"]

    # The reviewer's edit is the payload that matters.
    edited = "Students walking outside a Sacramento State campus building."
    response = client.post(
        f"/pdf/jobs/{job_id}/alt-text/fig-p1-0/approve",
        json={"approved": True, "altText": edited},
    )
    assert response.status_code == 200
    assert response.json()["issue"]["approvedAltText"] == edited
    assert response.json()["issue"]["status"] == "APPROVED"

    client.post(f"/pdf/jobs/{job_id}/alt-text/fig-p2-0/approve", json={"approved": False})

    assert client.post(f"/pdf/jobs/{job_id}/apply").status_code == 202

    job = client.get(f"/pdf/jobs/{job_id}").json()["job"]
    assert job["status"] == "COMPLETE", job["errorMessage"]

    download = client.get(f"/pdf/jobs/{job_id}/download").json()
    assert download["filename"] == "Travel-Reimbursement-Form-remediated.pdf"
    assert download["expiresIn"] == 900


def test_untagged_pdf_is_refused_at_job_creation(client, untagged_scanned):
    """It's registered (so the library can show it) but can't be remediated."""
    document = _upload(client, untagged_scanned, name="Scanned Receipt.pdf")
    assert document["tagStatus"] == "UNTAGGED"

    response = client.post("/pdf/jobs", json={"docId": document["docId"]})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "NOT_TAGGED"
    assert "cannot be processed" in response.json()["error"]["message"]


def test_tag_status_filter(client, tagged_with_figures, untagged_scanned, tagged_no_figures):
    """What the Library filter chip calls."""
    _upload(client, tagged_with_figures, name="Travel Form.pdf")
    _upload(client, untagged_scanned, name="Scanned Receipt.pdf", dept="Bursar")
    _upload(client, tagged_no_figures, name="Direct Deposit.pdf", dept="Payroll")

    def names(**params):
        response = client.get("/pdf/documents", params=params)
        assert response.status_code == 200
        return [d["filename"] for d in response.json()["documents"]]

    assert len(names()) == 3
    assert names(tagStatus="TAGGED") == ["Travel Form.pdf"]
    assert names(tagStatus="UNTAGGED") == ["Scanned Receipt.pdf"]
    assert names(tagStatus="TAGGED_NO_FIGURES") == ["Direct Deposit.pdf"]
    assert names(department="Payroll") == ["Direct Deposit.pdf"]
    assert names(q="deposit") == ["Direct Deposit.pdf"]


def test_bad_tag_status_is_a_422_not_a_500(client):
    response = client.get("/pdf/documents", params={"tagStatus": "banana"})

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "BAD_TAG_STATUS"
    assert "TAGGED" in response.json()["error"]["message"]  # tells you the valid set


def test_unknown_job_is_404(client):
    response = client.get("/pdf/jobs/does-not-exist")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "JOB_NOT_FOUND"


def test_download_before_complete_is_409(client, tagged_with_figures):
    document = _upload(client, tagged_with_figures)
    job_id = client.post("/pdf/jobs", json={"docId": document["docId"]}).json()["job"]["jobId"]

    response = client.get(f"/pdf/jobs/{job_id}/download")

    assert response.status_code == 409
    assert response.json()["error"]["code"] == "INVALID_STATE"


def test_apply_before_analyze_is_409(client, tagged_with_figures):
    document = _upload(client, tagged_with_figures)
    job_id = client.post("/pdf/jobs", json={"docId": document["docId"]}).json()["job"]["jobId"]

    response = client.post(f"/pdf/jobs/{job_id}/apply")

    assert response.status_code == 409


def test_over_long_alt_text_is_422(client, tagged_with_figures):
    document = _upload(client, tagged_with_figures)
    job_id = client.post("/pdf/jobs", json={"docId": document["docId"]}).json()["job"]["jobId"]
    client.post(f"/pdf/jobs/{job_id}/analyze")

    response = client.post(
        f"/pdf/jobs/{job_id}/alt-text/fig-p1-0/approve",
        json={"approved": True, "altText": "x" * 126},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "ALT_TEXT_TOO_LONG"


def test_unknown_issue_is_404(client, tagged_with_figures):
    document = _upload(client, tagged_with_figures)
    job_id = client.post("/pdf/jobs", json={"docId": document["docId"]}).json()["job"]["jobId"]
    client.post(f"/pdf/jobs/{job_id}/analyze")

    response = client.post(
        f"/pdf/jobs/{job_id}/alt-text/fig-p9-9/approve", json={"approved": True}
    )

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "ISSUE_NOT_FOUND"


def test_camelise_handles_nesting():
    assert camelise({"job_id": "1", "issues": [{"page_number": 2, "has_alt_text": False}]}) == {
        "jobId": "1",
        "issues": [{"pageNumber": 2, "hasAltText": False}],
    }
