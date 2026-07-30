"""Alt-text suggestions from Claude on Amazon Bedrock.

Uses the Anthropic SDK's `AnthropicBedrock` client — the classic
`bedrock-runtime` InvokeModel path, the same one the Bedrock console playground
uses. (The newer `AnthropicBedrockMantle` endpoint returned 403 for this
account's SSO role, which is normal: it's a separate Anthropic-operated endpoint
that most Bedrock IAM roles aren't authorized for. The classic path just needs
`bedrock:InvokeModel`.) boto3 still handles S3 and Lambda — this is only the
model call.

Two Bedrock specifics we verified live against this account:
  * The model is invoked through a **cross-region inference profile**
    (`us.anthropic.claude-opus-4-8`), not the bare `anthropic.claude-opus-4-8`
    — the bare id 400s with "on-demand throughput isn't supported."
  * The classic path does **not** accept `output_config.format` (structured
    outputs 400 with "Extra inputs are not permitted"), so we get structured
    output the portable way: a single tool with a forced `tool_choice`. The
    model returns a validated `tool_use` block — no prose to regex.

Credentials are never passed in code. The client resolves them the normal way:
the Lambda execution role in AWS, AWS_PROFILE or the ambient environment
locally.
"""

from __future__ import annotations

import base64
import logging
import os
import random
import time

import anthropic
from anthropic import AnthropicBedrock
from pydantic import BaseModel, Field, ValidationError

from ..errors import UpstreamError
from ..models import ALT_TEXT_MAX_CHARS
from ..ports.alt_text import AltTextSuggestion

log = logging.getLogger(__name__)

# The cross-region inference profile, not the bare model id (see module docstring).
DEFAULT_MODEL_ID = "us.anthropic.claude-opus-4-8"
DEFAULT_REGION = "us-west-2"

MAX_ATTEMPTS = 4

# Worth retrying: the call could succeed next time. Everything else (400, 403,
# 404) is caused by the request or the account and won't fix itself.
_TRANSIENT = (
    anthropic.RateLimitError,
    anthropic.OverloadedError,
    anthropic.APIConnectionError,
    anthropic.InternalServerError,
)

_TOOL_NAME = "provide_alt_text"


class _AltTextResult(BaseModel):
    """The tool's input schema. The model is forced to call the tool, so its
    input arrives shaped like this; we validate it here."""

    alt_text: str = Field(
        description=(
            "Alternative text for the image. Be concise but thorough — one or two "
            "sentences. Empty string if the image is decorative."
        )
    )
    is_decorative: bool = Field(
        description=(
            "True if the image conveys no information (a divider, a border, a "
            "background flourish) and should be marked as an artifact rather than "
            "described."
        )
    )


# Built from the pydantic schema so the two never drift.
_ALT_TEXT_TOOL = {
    "name": _TOOL_NAME,
    "description": "Return alternative text for the provided image.",
    "input_schema": _AltTextResult.model_json_schema(),
}


# The prompt is the product. A generic captioner sees only pixels and writes
# "a photo of people outdoors"; a reviewer rejects that. Feeding it the page
# text is what turns the same image into "students walking outside a Sacramento
# State campus building". Rules mirror what the UI already enforces so a
# suggestion doesn't arrive pre-broken (the character counter, the severity).
SYSTEM_PROMPT = f"""\
You write alternative text for images inside university PDF forms, for screen \
reader users. The documents are Sacramento State campus administrative forms.

Rules:
- Be concise but thorough. Describe what the image conveys in one or two sentences.
- Describe what the image conveys *in the context of this form*, not every \
visual detail. Use the surrounding page text to work out what the image is for.
- Never begin with "image of", "picture of", "photo of", or "graphic of" — \
assistive technology already announces that it is an image.
- If the image carries information the reader needs (a chart, a diagram, a \
labelled example, a map), convey that information rather than describing the \
appearance.
- If the image is purely decorative — a rule, a border, a flourish, a spacer, \
a background texture — set is_decorative to true and return an empty alt_text. \
Do not invent a description for it.
- If the image is ambiguous on its own, rely on the page text to disambiguate. \
Do not guess wildly; prefer the plainest accurate description.
- Write plainly. No marketing language.
"""


class BedrockAltTextProvider:
    def __init__(
        self,
        *,
        region: str | None = None,
        model_id: str | None = None,
        profile: str | None = None,
        client: object | None = None,
    ):
        self.model_id = model_id or os.getenv("BEDROCK_MODEL_ID", DEFAULT_MODEL_ID)
        self.region = region or os.getenv("AWS_REGION") or DEFAULT_REGION
        # `client` is an injection point for tests; nothing else passes it.
        self._client = client or AnthropicBedrock(
            aws_region=self.region,
            aws_profile=profile or os.getenv("AWS_PROFILE"),
        )

    def suggest(self, *, image_png: bytes, context: str) -> AltTextSuggestion:
        message = [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": base64.standard_b64encode(image_png).decode("ascii"),
                },
            },
            {"type": "text", "text": _user_prompt(context)},
        ]

        response = self._call_with_retry(message)
        result = _parse_tool_result(response)

        alt = " ".join(result.alt_text.split())

        if result.is_decorative:
            # A decorative image gets an empty /Alt, which is how a tagged PDF
            # says "skip this" — not a description of a divider.
            return AltTextSuggestion(alt_text="", is_decorative=True)

        if not alt:
            raise UpstreamError("Bedrock returned empty alt text for a non-decorative image.")

        if len(alt) > ALT_TEXT_MAX_CHARS:
            # Don't truncate — a half sentence is worse than none. Surface it so
            # the reviewer edits it down; the API rejects over-long text anyway.
            log.warning(
                "Bedrock returned %d chars (limit %d); leaving it for the reviewer",
                len(alt), ALT_TEXT_MAX_CHARS,
            )

        return AltTextSuggestion(alt_text=alt, is_decorative=False)

    def _call_with_retry(self, content: list[dict]):
        """Retry throttling and transient server errors; fail fast on anything
        the caller's request caused."""
        last: Exception | None = None

        for attempt in range(MAX_ATTEMPTS):
            try:
                return self._client.messages.create(
                    model=self.model_id,
                    max_tokens=1024,
                    system=SYSTEM_PROMPT,
                    tools=[_ALT_TEXT_TOOL],
                    # Force the tool so the answer always comes back structured.
                    tool_choice={"type": "tool", "name": _TOOL_NAME},
                    messages=[{"role": "user", "content": content}],
                )
            except _TRANSIENT as exc:
                last = exc
                if attempt == MAX_ATTEMPTS - 1:
                    break
                delay = min(2**attempt + random.uniform(0, 0.5), 20)
                log.warning("Bedrock %s; retrying in %.1fs", type(exc).__name__, delay)
                time.sleep(delay)
            except anthropic.APIStatusError as exc:
                # 400/403/404 won't fix themselves — a bad model id, no model
                # access, or a missing bedrock:InvokeModel permission.
                raise UpstreamError(_explain(exc, self.model_id, self.region)) from exc

        raise UpstreamError(
            f"Bedrock did not respond after {MAX_ATTEMPTS} attempts: {last}"
        ) from last


def _parse_tool_result(response) -> _AltTextResult:
    """Pull the forced tool call's input out of the response and validate it."""
    block = next((b for b in response.content if b.type == "tool_use"), None)
    if block is None:
        raise UpstreamError("Bedrock did not return the alt-text tool call.")
    try:
        return _AltTextResult.model_validate(block.input)
    except ValidationError as exc:
        raise UpstreamError(f"Bedrock returned malformed alt text: {exc}") from exc


def _user_prompt(context: str) -> str:
    if not context.strip():
        return (
            "Write alternative text for this image. No surrounding text was "
            "available, so describe only what is clearly visible."
        )
    return (
        "Write alternative text for this image from a campus PDF form.\n\n"
        "Here is the text around it, to tell you what the image is for:\n\n"
        f"{context}"
    )


def _explain(exc: anthropic.APIStatusError, model_id: str, region: str) -> str:
    """Turn the three failures you actually hit on day one into instructions."""
    status = getattr(exc, "status_code", None)
    if status == 403:
        return (
            f"Access denied for {model_id!r} in {region}. Either the IAM principal is "
            f"missing bedrock:InvokeModel, or model access has not been granted — "
            f"Bedrock console -> Model access, in {region} specifically."
        )
    if status == 404:
        return (
            f"Model {model_id!r} not found in {region}. Check availability with:\n"
            f"  aws bedrock list-foundation-models --region {region} "
            f"--query \"modelSummaries[?contains(modelId,'claude')].modelId\"\n"
            f"then set BEDROCK_MODEL_ID to one that is listed."
        )
    if status == 400 and "throughput" in str(exc).lower():
        return (
            f"{model_id!r} must be invoked through a cross-region inference profile, "
            f"not the bare model id. Use the 'us.' prefixed profile, e.g. "
            f"'us.{model_id}' — list them with:\n"
            f"  aws bedrock list-inference-profiles --region {region}"
        )
    return f"Bedrock rejected the request ({status}): {exc}"
