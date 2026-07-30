"""Where PDF bytes and extracted images live. Local dir now, S3 later."""

from __future__ import annotations

from typing import Protocol


class Storage(Protocol):
    def get_bytes(self, key: str) -> bytes: ...

    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        """Store and return the canonical location (a path or an s3:// URI)."""
        ...

    def presign_get(self, key: str, expires_in: int = 900) -> str:
        """A URL the browser can download from directly."""
        ...

    def presign_put(self, key: str, expires_in: int = 900) -> str:
        """A URL the browser can upload to directly — bytes never pass through
        the API."""
        ...
