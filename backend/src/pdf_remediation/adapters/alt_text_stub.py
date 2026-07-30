"""Deterministic alt-text provider.

The default in tests and for the offline PoC: the suite runs with no AWS
account, no network, and no per-run cost, and asserts on exact strings. It
mimics the real provider's shape (including the decorative path) so swapping in
Bedrock changes one config value, not any test.
"""

from __future__ import annotations

import hashlib

from ..core.images import MIN_MEANINGFUL_EDGE  # noqa: F401  (documents the size rule)
from ..ports.alt_text import AltTextSuggestion


class StubAltTextProvider:
    def __init__(self, *, fixed_text: str | None = None):
        self.fixed_text = fixed_text
        self.calls: list[tuple[int, str]] = []  # (image size, context) — assert on this

    def suggest(self, *, image_png: bytes, context: str) -> AltTextSuggestion:
        self.calls.append((len(image_png), context))

        if self.fixed_text is not None:
            return AltTextSuggestion(alt_text=self.fixed_text)

        # Stable across runs, distinct per figure, and visibly fake so nobody
        # mistakes stub output for a real suggestion in a demo. Echoing the
        # caption proves the page context actually reached the provider.
        digest = hashlib.sha256(image_png).hexdigest()[:8]
        return AltTextSuggestion(
            alt_text=f"[stub] Figure near {_caption(context)!r} ({digest})."
        )


def _caption(context: str) -> str:
    """Last non-empty line of the page text — for our fixtures and most real
    forms that's the figure's caption."""
    lines = [ln.strip() for ln in context.splitlines() if ln.strip()]
    return lines[-1] if lines else "the form"
