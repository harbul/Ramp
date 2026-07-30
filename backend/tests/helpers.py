from __future__ import annotations

from io import BytesIO

import pikepdf


def open_bytes(data: bytes) -> pikepdf.Pdf:
    """pikepdf.open() takes a path or a stream — wrap in-memory PDF bytes.

    Use as a context manager:  with open_bytes(data) as pdf: ...
    """
    return pikepdf.open(BytesIO(data))


def to_bytes(pdf: pikepdf.Pdf) -> bytes:
    buf = BytesIO()
    pdf.save(buf)
    return buf.getvalue()
