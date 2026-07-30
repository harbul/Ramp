"""Typed domain errors. The API edge maps these to status codes in one place;
nothing below the edge should raise HTTP concepts.
"""

from __future__ import annotations


class RemediationError(Exception):
    """Base class. `code` is what the frontend switches on."""

    code = "INTERNAL_ERROR"
    http_status = 500

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

    def to_dict(self) -> dict:
        return {"error": {"code": self.code, "message": self.message}}


class NotTagged(RemediationError):
    """The PDF has no structure tree, so no /Alt we wrote could ever be reached
    by a screen reader. Refuse at the door rather than emit a file that looks
    remediated and isn't."""

    code = "NOT_TAGGED"
    http_status = 422


class PdfUnreadable(RemediationError):
    code = "PDF_UNREADABLE"
    http_status = 422


class JobNotFound(RemediationError):
    code = "JOB_NOT_FOUND"
    http_status = 404


class IssueNotFound(RemediationError):
    code = "ISSUE_NOT_FOUND"
    http_status = 404


class InvalidStateTransition(RemediationError):
    code = "INVALID_STATE"
    http_status = 409


class CorpusFileNotFound(RemediationError):
    """A Review Queue form was requested for remediation, but its PDF is not in
    the configured corpus bucket (or the corpus bucket is not configured)."""

    code = "CORPUS_FILE_NOT_FOUND"
    http_status = 404


class AltTextTooLong(RemediationError):
    code = "ALT_TEXT_TOO_LONG"
    http_status = 422


class VerificationFailed(RemediationError):
    """We wrote /Alt but couldn't read it back. Never ship the file in this case."""

    code = "VERIFICATION_FAILED"
    http_status = 500


class UpstreamError(RemediationError):
    code = "UPSTREAM_ERROR"
    http_status = 502


class OcrProviderError(RemediationError):
    """OCR provider encountered an error during processing."""
    code = "OCR_PROVIDER_ERROR"
    http_status = 502


class OcrJobNotFound(RemediationError):
    """OCR job not found with the provider."""
    code = "OCR_JOB_NOT_FOUND"
    http_status = 404


class OcrJobNotComplete(RemediationError):
    """Attempted to get results from incomplete OCR job."""
    code = "OCR_JOB_NOT_COMPLETE"
    http_status = 409
