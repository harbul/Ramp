"""S3 storage and DynamoDB job store, against moto (mocked AWS).

No real AWS, no cost. The point is that these adapters satisfy the same
`Storage` / `JobStore` contracts as the local/JSON ones, so `service.py` behaves
identically whichever is wired in.
"""

from __future__ import annotations

import boto3
import pytest
from moto import mock_aws

from pdf_remediation.adapters.job_store_dynamo import DynamoJobStore
from pdf_remediation.adapters.job_store_json import JsonJobStore
from pdf_remediation.adapters.storage_s3 import S3Storage, StorageError
from pdf_remediation.models import Document, DocumentRoute, Issue, IssueStatus, Job, JobStatus, TagStatus

REGION = "us-west-2"
BUCKET = "sacstate-pdf-remediation-test"
TABLE = "pdf-remediation-test"


# ── S3 storage ────────────────────────────────────────────────────────


@pytest.fixture
def s3():
    with mock_aws():
        client = boto3.client("s3", region_name=REGION)
        client.create_bucket(
            Bucket=BUCKET, CreateBucketConfiguration={"LocationConstraint": REGION}
        )
        yield S3Storage(bucket=BUCKET, region=REGION, client=client)


def test_put_then_get_roundtrips(s3):
    location = s3.put_bytes("jobs/j1/original/form.pdf", b"%PDF-1.7 data", "application/pdf")
    assert location == f"s3://{BUCKET}/jobs/j1/original/form.pdf"
    assert s3.get_bytes("jobs/j1/original/form.pdf") == b"%PDF-1.7 data"


def test_exists(s3):
    assert not s3.exists("jobs/j1/missing.pdf")
    s3.put_bytes("jobs/j1/here.pdf", b"x")
    assert s3.exists("jobs/j1/here.pdf")


def test_get_missing_key_is_a_storage_error(s3):
    with pytest.raises(StorageError):
        s3.get_bytes("jobs/j1/nope.pdf")


def test_presign_urls_point_at_the_object(s3):
    s3.put_bytes("jobs/j1/remediated/out.pdf", b"x")

    get_url = s3.presign_get("jobs/j1/remediated/out.pdf", expires_in=900)
    put_url = s3.presign_put("jobs/j1/original/in.pdf", expires_in=900)

    assert BUCKET in get_url and "jobs/j1/remediated/out.pdf" in get_url
    assert "Signature" in get_url                # signed (SigV4 or, under moto, SigV2)
    assert "Expires" in get_url                  # carries an expiry
    assert "jobs/j1/original/in.pdf" in put_url


def test_client_is_configured_for_sigv4(s3):
    """Real S3 in us-west-2 requires SigV4 presigned URLs; moto's dummy creds
    don't exercise it, so assert the intent at the config level."""
    assert s3._s3.meta.config.signature_version == "s3v4"


def test_missing_bucket_is_a_config_error():
    with pytest.raises(ValueError):
        S3Storage(bucket=None)


# ── DynamoDB job store ────────────────────────────────────────────────


@pytest.fixture
def dynamo():
    with mock_aws():
        ddb = boto3.resource("dynamodb", region_name=REGION)
        ddb.create_table(
            TableName=TABLE,
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        yield DynamoJobStore(table=TABLE, region=REGION, resource=ddb)


def _job() -> Job:
    return Job(
        job_id="job-1",
        doc_id="doc-1",
        original_pdf_location="jobs/doc-1/original/form.pdf",
        status=JobStatus.NEEDS_REVIEW,
        issues=[
            Issue(
                issue_id="fig-p2-0",
                page_number=2,
                image_index=0,
                struct_elem_ref="13,0",
                has_alt_text=False,
                suggested_alt_text="Students outside a building.",
                status=IssueStatus.SUGGESTED,
            )
        ],
    )


def _doc(doc_id, filename, dept, status) -> Document:
    # Infer a sensible route from tag_status for test convenience
    if status == TagStatus.TAGGED:
        route = DocumentRoute.ALT_TEXT_REMEDIATION
    elif status == TagStatus.UNTAGGED:
        route = DocumentRoute.UNSUPPORTED
    else:
        route = DocumentRoute.UNSUPPORTED
    return Document(
        doc_id=doc_id,
        filename=filename,
        department=dept,
        tag_status=status,
        figures_missing_alt=2,
        size_bytes=1000,
        updated_at="2026-07-16T00:00:00Z",
        route=route,
    )


def test_job_roundtrips_with_nested_issues(dynamo):
    dynamo.put_job(_job())
    got = dynamo.get_job("job-1")

    assert got is not None
    assert got.status is JobStatus.NEEDS_REVIEW
    assert len(got.issues) == 1
    assert got.issues[0].issue_id == "fig-p2-0"
    assert got.issues[0].status is IssueStatus.SUGGESTED
    assert got.issues[0].suggested_alt_text == "Students outside a building."


def test_missing_job_is_none(dynamo):
    assert dynamo.get_job("nope") is None


def test_document_roundtrips(dynamo):
    dynamo.put_document(_doc("doc-1", "Travel Form.pdf", "Accounts Payable Travel", TagStatus.TAGGED))
    got = dynamo.get_document("doc-1")

    assert got is not None
    assert got.tag_status is TagStatus.TAGGED
    assert got.filename == "Travel Form.pdf"


def test_list_documents_filters_like_the_frontend(dynamo):
    dynamo.put_document(_doc("d1", "Travel Form.pdf", "Accounts Payable Travel", TagStatus.TAGGED))
    dynamo.put_document(_doc("d2", "Scanned Receipt.pdf", "Bursar", TagStatus.UNTAGGED))
    dynamo.put_document(_doc("d3", "Direct Deposit.pdf", "Payroll", TagStatus.TAGGED_NO_FIGURES))
    # a job in the same table must not leak into the document list
    dynamo.put_job(_job())

    names = lambda **kw: [d.filename for d in dynamo.list_documents(**kw)]  # noqa: E731

    assert len(names()) == 3
    assert names(tag_status=TagStatus.TAGGED) == ["Travel Form.pdf"]
    assert names(tag_status=TagStatus.UNTAGGED) == ["Scanned Receipt.pdf"]
    assert names(department="Payroll") == ["Direct Deposit.pdf"]
    assert names(query="deposit") == ["Direct Deposit.pdf"]
    assert names(query="bursar") == ["Scanned Receipt.pdf"]  # query matches department


def test_dynamo_and_json_stores_agree(dynamo, tmp_path):
    """Parity: the two stores must return the same thing for the same inputs, so
    swapping them can't change behaviour."""
    json_store = JsonJobStore(tmp_path)

    for store in (dynamo, json_store):
        store.put_document(_doc("d1", "Travel Form.pdf", "Accounts Payable Travel", TagStatus.TAGGED))
        store.put_document(_doc("d2", "Scanned.pdf", "Bursar", TagStatus.UNTAGGED))
        store.put_job(_job())

    for kw in ({}, {"tag_status": TagStatus.TAGGED}, {"query": "travel"}):
        assert [d.doc_id for d in dynamo.list_documents(**kw)] == [
            d.doc_id for d in json_store.list_documents(**kw)
        ]

    assert dynamo.get_job("job-1").status is json_store.get_job("job-1").status


def test_missing_table_is_a_config_error():
    with pytest.raises(ValueError):
        DynamoJobStore(table=None)
