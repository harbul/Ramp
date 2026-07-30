"""Filesystem storage for the Phase-1 PoC. No AWS required."""

from __future__ import annotations

from pathlib import Path


class LocalStorage:
    def __init__(self, root: Path | str):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        # Keys are built from job ids and page numbers, never user input, but
        # resolve-and-check anyway so a bad key can't escape the work dir.
        path = (self.root / key).resolve()
        if not path.is_relative_to(self.root.resolve()):
            raise ValueError(f"Key escapes storage root: {key!r}")
        return path

    def get_bytes(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return str(path)

    def presign_get(self, key: str, expires_in: int = 900) -> str:
        """No signing locally — a file:// URL keeps the CLI honest about what
        the API would hand back."""
        return self._path(key).as_uri()

    def presign_put(self, key: str, expires_in: int = 900) -> str:
        return self._path(key).as_uri()

    def exists(self, key: str) -> bool:
        return self._path(key).exists()
