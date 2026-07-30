"""JSON-file job store for the Phase-1 PoC.

One file per job, one per document. Deliberately dumb: it exists so the CLI has
somewhere to put state, and so `service.py` is written against the port from day
one rather than being retrofitted when DynamoDB arrives.
"""

from __future__ import annotations

import json
from pathlib import Path

from ..models import Document, DocumentRoute, Job, TagStatus
from ._serde import document_from_dict, document_to_dict, job_from_dict, job_to_dict

# Enums are StrEnum, so json.dumps writes their plain values with no encoder hook.


class JsonJobStore:
    def __init__(self, root: Path | str):
        self.root = Path(root)
        self.jobs_dir = self.root / "jobs"
        self.docs_dir = self.root / "documents"
        self.jobs_dir.mkdir(parents=True, exist_ok=True)
        self.docs_dir.mkdir(parents=True, exist_ok=True)

    # ── jobs ──────────────────────────────────────────────────────────

    def get_job(self, job_id: str) -> Job | None:
        path = self.jobs_dir / f"{job_id}.json"
        if not path.exists():
            return None
        return job_from_dict(json.loads(path.read_text()))

    def put_job(self, job: Job) -> None:
        path = self.jobs_dir / f"{job.job_id}.json"
        path.write_text(json.dumps(job_to_dict(job), indent=2))

    # ── documents ─────────────────────────────────────────────────────

    def get_document(self, doc_id: str) -> Document | None:
        path = self.docs_dir / f"{doc_id}.json"
        if not path.exists():
            return None
        return document_from_dict(json.loads(path.read_text()))

    def put_document(self, document: Document) -> None:
        path = self.docs_dir / f"{document.doc_id}.json"
        path.write_text(json.dumps(document_to_dict(document), indent=2))

    def list_documents(
        self,
        *,
        tag_status: TagStatus | None = None,
        department: str | None = None,
        query: str | None = None,
        route: DocumentRoute | None = None,
    ) -> list[Document]:
        docs = [
            document_from_dict(json.loads(p.read_text()))
            for p in sorted(self.docs_dir.glob("*.json"))
        ]
        return filter_documents(
            docs, tag_status=tag_status, department=department, query=query, route=route
        )


def filter_documents(
    docs: list[Document],
    *,
    tag_status: TagStatus | None = None,
    department: str | None = None,
    query: str | None = None,
    route: DocumentRoute | None = None,
) -> list[Document]:
    """The library filter. Shared with the DynamoDB store so both apply the same
    rules (query matches filename OR department, mirroring the frontend)."""
    if tag_status is not None:
        docs = [d for d in docs if d.tag_status is tag_status]
    if department:
        docs = [d for d in docs if d.department == department]
    if query:
        needle = query.lower()
        docs = [
            d for d in docs
            if needle in d.filename.lower() or needle in d.department.lower()
        ]
    if route is not None:
        docs = [d for d in docs if d.route is route]
    return sorted(docs, key=lambda d: d.filename)
