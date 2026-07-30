"""Bedrock provider, offline.

A fake client stands in for AnthropicBedrockMantle so these run in CI with no
AWS account and no cost. The one test that really calls Bedrock is marked
`live` and skipped by default.
"""

from __future__ import annotations

import anthropic
import httpx
import pytest

from pdf_remediation.adapters.alt_text_bedrock import (
    SYSTEM_PROMPT,
    BedrockAltTextProvider,
    _AltTextResult,
)
from pdf_remediation.errors import UpstreamError

PNG = b"\x89PNG\r\n\x1a\n" + b"fake pixels"
CONTEXT = "Document: Travel Reimbursement Form\n\nPage 2 text:\nFigure 1: campus building"


class _ToolUseBlock:
    """Mimics a real tool_use content block."""

    type = "tool_use"

    def __init__(self, tool_input: dict):
        self.input = tool_input


class _Response:
    def __init__(self, content):
        self.content = content


def _tool_response(tool_input: dict | None) -> _Response:
    """A response carrying the forced tool call (or no tool_use block at all)."""
    if tool_input is None:
        return _Response([])  # model failed to call the tool
    return _Response([_ToolUseBlock(tool_input)])


class _FakeMessages:
    def __init__(self, response=None, raises=None):
        self._response = response
        self._raises = raises
        self.calls: list[dict] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if self._raises is not None:
            exc = self._raises
            # a list means "fail these, then succeed"
            if isinstance(exc, list):
                if exc:
                    raise exc.pop(0)
            else:
                raise exc
        return self._response


class _FakeClient:
    def __init__(self, response=None, raises=None):
        self.messages = _FakeMessages(response, raises)


def _provider(
    result: _AltTextResult | None = None, raises=None
) -> tuple[BedrockAltTextProvider, _FakeClient]:
    """result -> the tool input the fake model 'returns'."""
    response = None if result is None else _tool_response(result.model_dump())
    client = _FakeClient(response, raises)
    return BedrockAltTextProvider(client=client, region="us-west-2"), client


def _status_error(status: int) -> anthropic.APIStatusError:
    request = httpx.Request("POST", "https://example.invalid")
    response = httpx.Response(status, request=request, json={"error": {"message": "nope"}})
    return anthropic.APIStatusError("nope", response=response, body=None)


def test_returns_suggestion_and_sends_image_plus_context(monkeypatch):
    # This asserts the default model id, so clear any ambient BEDROCK_MODEL_ID
    # (a developer's gitignored .env would otherwise override the default).
    monkeypatch.delenv("BEDROCK_MODEL_ID", raising=False)
    provider, client = _provider(_AltTextResult(alt_text="Students outside a building.", is_decorative=False))

    suggestion = provider.suggest(image_png=PNG, context=CONTEXT)

    assert suggestion.alt_text == "Students outside a building."
    assert not suggestion.is_decorative

    (call,) = client.messages.calls
    assert call["model"] == "us.anthropic.claude-opus-4-8"   # cross-region profile
    assert call["system"] is SYSTEM_PROMPT
    # Structured output via a forced tool, not output_format (unsupported on the
    # classic Bedrock path).
    assert call["tool_choice"] == {"type": "tool", "name": "provide_alt_text"}
    assert call["tools"][0]["name"] == "provide_alt_text"

    content = call["messages"][0]["content"]
    image_block, text_block = content
    assert image_block["type"] == "image"
    assert image_block["source"]["media_type"] == "image/png"
    # The page context has to reach the model — it's the whole point.
    assert "Figure 1: campus building" in text_block["text"]


def test_decorative_image_gets_empty_alt_not_a_description():
    """A decorative image should be marked as an artifact. Describing the
    divider is the failure mode we're avoiding."""
    provider, _ = _provider(_AltTextResult(alt_text="A green horizontal rule.", is_decorative=True))

    suggestion = provider.suggest(image_png=PNG, context=CONTEXT)

    assert suggestion.is_decorative
    assert suggestion.alt_text == ""


def test_whitespace_is_normalised():
    provider, _ = _provider(_AltTextResult(alt_text="  Students   walking\n outside. ", is_decorative=False))

    assert provider.suggest(image_png=PNG, context=CONTEXT).alt_text == "Students walking outside."


def test_over_long_text_is_passed_through_for_the_reviewer_not_truncated(caplog):
    """Truncating mid-sentence produces worse alt text than the reviewer editing
    it down. The API rejects >125 on approve anyway."""
    long = "x" * 200
    provider, _ = _provider(_AltTextResult(alt_text=long, is_decorative=False))

    suggestion = provider.suggest(image_png=PNG, context=CONTEXT)

    assert suggestion.alt_text == long
    assert "limit" in caplog.text.lower() or "125" in caplog.text


def test_empty_alt_on_a_non_decorative_image_is_an_error():
    provider, _ = _provider(_AltTextResult(alt_text="   ", is_decorative=False))

    with pytest.raises(UpstreamError):
        provider.suggest(image_png=PNG, context=CONTEXT)


def test_missing_tool_call_is_an_error():
    """If the model answers with prose instead of the forced tool call, that's an
    upstream failure, not a crash."""
    client = _FakeClient(_tool_response(None))  # empty content, no tool_use
    provider = BedrockAltTextProvider(client=client, region="us-west-2")

    with pytest.raises(UpstreamError) as exc:
        provider.suggest(image_png=PNG, context=CONTEXT)
    assert "tool call" in str(exc.value).lower()


def test_no_context_still_produces_a_prompt():
    provider, client = _provider(_AltTextResult(alt_text="A voided cheque.", is_decorative=False))

    provider.suggest(image_png=PNG, context="")

    text = client.messages.calls[0]["messages"][0]["content"][1]["text"]
    assert "No surrounding text" in text


def test_throttling_is_retried_then_succeeds(monkeypatch):
    monkeypatch.setattr("pdf_remediation.adapters.alt_text_bedrock.time.sleep", lambda _: None)
    request = httpx.Request("POST", "https://example.invalid")
    throttle = anthropic.RateLimitError(
        "slow down", response=httpx.Response(429, request=request), body=None
    )
    provider, client = _provider(
        _AltTextResult(alt_text="Worked on retry.", is_decorative=False),
        raises=[throttle, throttle],
    )

    suggestion = provider.suggest(image_png=PNG, context=CONTEXT)

    assert suggestion.alt_text == "Worked on retry."
    assert len(client.messages.calls) == 3  # two failures, then success


def test_persistent_throttling_becomes_upstream_error(monkeypatch):
    monkeypatch.setattr("pdf_remediation.adapters.alt_text_bedrock.time.sleep", lambda _: None)
    request = httpx.Request("POST", "https://example.invalid")
    throttle = anthropic.RateLimitError(
        "slow down", response=httpx.Response(429, request=request), body=None
    )
    provider, _ = _provider(raises=[throttle] * 10)

    with pytest.raises(UpstreamError) as exc:
        provider.suggest(image_png=PNG, context=CONTEXT)
    assert "4 attempts" in str(exc.value)


def test_access_denied_explains_the_two_real_causes():
    """403 on day one is either no model access or no bedrock:InvokeModel.
    The error should say which knobs to check, not just re-print the status."""
    provider, client = _provider(raises=_status_error(403))

    with pytest.raises(UpstreamError) as exc:
        provider.suggest(image_png=PNG, context=CONTEXT)

    message = str(exc.value)
    assert "bedrock:InvokeModel" in message
    assert "Model access" in message
    assert "us-west-2" in message
    assert len(client.messages.calls) == 1  # not retried — it won't fix itself


def test_unknown_model_tells_you_how_to_list_the_real_ones():
    provider, _ = _provider(raises=_status_error(404))

    with pytest.raises(UpstreamError) as exc:
        provider.suggest(image_png=PNG, context=CONTEXT)

    message = str(exc.value)
    assert "list-foundation-models" in message
    assert "BEDROCK_MODEL_ID" in message


def test_model_id_comes_from_env(monkeypatch):
    monkeypatch.setenv("BEDROCK_MODEL_ID", "anthropic.claude-sonnet-5")
    provider, _ = _provider(_AltTextResult(alt_text="ok", is_decorative=False))
    assert provider.model_id == "anthropic.claude-sonnet-5"


@pytest.mark.live
def test_live_bedrock_call(tagged_with_figures):
    """Real Bedrock. Opt in with:  pytest -m live

    Needs AWS credentials and Bedrock model access in the region. This is the
    only test that costs money.
    """
    from io import BytesIO

    import pikepdf

    from pdf_remediation.core.images import extract_png
    from pdf_remediation.core.inspect import find_figure_images
    from pdf_remediation.core.scan import walk_figures

    with pikepdf.open(BytesIO(tagged_with_figures)) as pdf:
        figures = list(walk_figures(pdf))
        resolved, _ = find_figure_images(pdf, figures)
        png = extract_png(resolved[0].xobject)

    provider = BedrockAltTextProvider()
    suggestion = provider.suggest(image_png=png, context=CONTEXT)

    print(f"\nBedrock ({provider.model_id}) -> {suggestion.alt_text!r}")
    assert suggestion.alt_text or suggestion.is_decorative
    assert not suggestion.alt_text.lower().startswith(("image of", "picture of"))
