"""DynamoDB-backed job and document store.

One table, one partition key `pk` that is `JOB#<id>` or `DOC#<id>`. Jobs and
documents are only ever fetched by id, so a single-key table is enough; the
library list is a Scan filtered to documents. For a campus corpus (hundreds of
documents, not millions) a Scan is fine — a GSI would be premature. The whole
model is stored as a JSON blob under `body`, so adding a field never means a
schema migration.

Filterable document attributes (`tag_status`, `department`, `filename`) are also
written as top-level values so the tag-status filter can run server-side in the
Scan and only the matching items cross the wire.
"""

from __future__ import annotations

import json

import boto3
from botocore.exceptions import ClientError

from ..errors import RemediationError
from ..models import Document, DocumentRoute, Job, TagStatus
from ._serde import document_from_dict, document_to_dict, job_from_dict, job_to_dict
from .job_store_json import filter_documents

_JOB = "JOB#"
_DOC = "DOC#"


class JobStoreError(RemediationError):
    code = "JOB_STORE_ERROR"
    http_status = 502


class DynamoJobStore:
    def __init__(self, *, table: str | None, region: str | None = None, resource=None):
        if not table:
            raise ValueError("DynamoJobStore needs a table (set PDF_DDB_TABLE).")
        ddb = resource or boto3.resource("dynamodb", region_name=region)
        self._table = ddb.Table(table)

    # ── jobs ──────────────────────────────────────────────────────────

    def get_job(self, job_id: str) -> Job | None:
        item = self._get(_JOB + job_id)
        return job_from_dict(json.loads(item["body"])) if item else None

    def put_job(self, job: Job) -> None:
        self._put(
            {
                "pk": _JOB + job.job_id,
                "type": "job",
                "body": json.dumps(job_to_dict(job)),
            }
        )

    # ── documents ─────────────────────────────────────────────────────

    def get_document(self, doc_id: str) -> Document | None:
        item = self._get(_DOC + doc_id)
        return document_from_dict(json.loads(item["body"])) if item else None

    def put_document(self, document: Document) -> None:
        self._put(
            {
                "pk": _DOC + document.doc_id,
                "type": "document",
                # Top-level so a Scan can filter server-side.
                "tag_status": document.tag_status.value,
                "department": document.department,
                "filename": document.filename,
                "route": document.route.value if document.route else None,
                "body": json.dumps(document_to_dict(document)),
            }
        )

    def list_documents(
        self,
        *,
        tag_status: TagStatus | None = None,
        department: str | None = None,
        query: str | None = None,
        route: DocumentRoute | None = None,
    ) -> list[Document]:
        # Server-side filter on the cheap-to-express predicates; substring query
        # is applied client-side (Dynamo can't do case-insensitive contains).
        expr = ["#t = :doc"]
        names = {"#t": "type"}
        values: dict = {":doc": "document"}
        if tag_status is not None:
            expr.append("tag_status = :ts")
            values[":ts"] = tag_status.value
        if department:
            expr.append("department = :dept")
            values[":dept"] = department
        if route is not None:
            expr.append("#route = :route")
            names["#route"] = "route"
            values[":route"] = route.value

        docs = [
            document_from_dict(json.loads(item["body"]))
            for item in self._scan(" AND ".join(expr), names, values)
        ]
        # Re-apply every filter client-side too, so json and dynamo stores return
        # identical results (and the substring query is handled in one place).
        return filter_documents(
            docs, tag_status=tag_status, department=department, query=query, route=route
        )

    # ── low level ─────────────────────────────────────────────────────

    def _get(self, pk: str) -> dict | None:
        try:
            return self._table.get_item(Key={"pk": pk}).get("Item")
        except ClientError as exc:
            raise JobStoreError(f"DynamoDB get failed for {pk}: {_msg(exc)}") from exc

    def _put(self, item: dict) -> None:
        try:
            self._table.put_item(Item=item)
        except ClientError as exc:
            raise JobStoreError(f"DynamoDB put failed for {item['pk']}: {_msg(exc)}") from exc

    def _scan(self, filter_expr: str, names: dict, values: dict):
        """Paginated Scan — DynamoDB caps each page at 1MB."""
        items: list[dict] = []
        kwargs = {
            "FilterExpression": filter_expr,
            "ExpressionAttributeNames": names,
            "ExpressionAttributeValues": values,
        }
        try:
            while True:
                page = self._table.scan(**kwargs)
                items.extend(page.get("Items", []))
                start = page.get("LastEvaluatedKey")
                if not start:
                    return items
                kwargs["ExclusiveStartKey"] = start
        except ClientError as exc:
            raise JobStoreError(f"DynamoDB scan failed: {_msg(exc)}") from exc


def _msg(exc: ClientError) -> str:
    return exc.response.get("Error", {}).get("Message", str(exc))
