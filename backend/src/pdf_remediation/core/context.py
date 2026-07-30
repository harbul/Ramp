"""Pull the surrounding text so the model describes *this form's* figure.

This is the difference between "a photo of people outdoors" and "students
walking outside a Sacramento State campus building" — a generic captioner sees
only pixels, while a reviewer judges the alt text against the document. Page
text is what closes that gap, so it's worth the extra parse.
"""

from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO

import pdfplumber

# Enough to establish what the form is and what the figure is doing in it,
# without paying for a whole page of boilerplate on every call.
MAX_CONTEXT_CHARS = 1500


@dataclass
class PageContext:
    page_number: int
    document_title: str | None
    text: str

    def as_prompt_block(self) -> str:
        parts = []
        if self.document_title:
            parts.append(f"Document: {self.document_title}")
        parts.append(f"Page {self.page_number} text:\n{self.text}")
        return "\n\n".join(parts)


def _clean(text: str) -> str:
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(line for line in lines if line)


def extract_page_contexts(data: bytes, page_numbers: set[int]) -> dict[int, PageContext]:
    """Text for just the pages that have figures — no point parsing the rest."""
    contexts: dict[int, PageContext] = {}

    with pdfplumber.open(BytesIO(data)) as pdf:
        title = _document_title(pdf)
        for page_number in sorted(page_numbers):
            if page_number < 1 or page_number > len(pdf.pages):
                continue
            page = pdf.pages[page_number - 1]
            text = _clean(page.extract_text() or "")
            contexts[page_number] = PageContext(
                page_number=page_number,
                document_title=title,
                text=text[:MAX_CONTEXT_CHARS],
            )

    return contexts


def _document_title(pdf: pdfplumber.PDF) -> str | None:
    title = (pdf.metadata or {}).get("Title")
    if isinstance(title, str) and title.strip():
        return title.strip()

    # Untitled is the norm for legacy forms, so fall back to the first line of
    # page 1 — usually the form's own heading.
    if pdf.pages:
        text = _clean(pdf.pages[0].extract_text() or "")
        if text:
            return text.splitlines()[0][:120]
    return None
