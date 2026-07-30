"""Alt-text generation. A stub for tests, Bedrock in production."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass
class AltTextSuggestion:
    alt_text: str
    is_decorative: bool = False


class AltTextProvider(Protocol):
    def suggest(self, *, image_png: bytes, context: str) -> AltTextSuggestion:
        """Propose alt text for one figure.

        `context` is the surrounding page text — without it the model writes
        generic captions, which reviewers reject.
        """
        ...
