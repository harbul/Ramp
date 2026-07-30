"""Job and document persistence. JSON files now, DynamoDB later."""

from __future__ import annotations

from typing import Protocol

from ..models import Document, DocumentRoute, Job, TagStatus


class JobStore(Protocol):
    def get_job(self, job_id: str) -> Job | None: ...

    def put_job(self, job: Job) -> None: ...

    def get_document(self, doc_id: str) -> Document | None: ...

    def put_document(self, document: Document) -> None: ...

    def list_documents(
        self,
        *,
        tag_status: TagStatus | None = None,
        department: str | None = None,
        query: str | None = None,
        route: DocumentRoute | None = None,
    ) -> list[Document]:
        """The library list with optional filtering by document route."""
        ...
