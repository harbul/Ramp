"""Domain types. This module is the contract between the core, the API, and the
frontend — keep it free of PDF-library and AWS types.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from enum import StrEnum


def utc_now() -> str:
    """ISO 8601 UTC. The backend emits machine values; the frontend formats them."""
    return datetime.now(UTC).isoformat(timespec="seconds").replace("+00:00", "Z")


# StrEnum members *are* str, so json.dumps serialises them without a hook and
# the wire format is the plain value the frontend expects.
class TagStatus(StrEnum):
    TAGGED = "TAGGED"                        # structure tree with /Figure -> remediable
    UNTAGGED = "UNTAGGED"                    # no StructTreeRoot -> needs tagging first
    TAGGED_NO_FIGURES = "TAGGED_NO_FIGURES"  # tagged, nothing to fix


class DocumentRoute(StrEnum):
    """The workflow path a document should follow based on its characteristics."""
    ALT_TEXT_REMEDIATION = "ALT_TEXT_REMEDIATION"    # Tagged PDF with figures missing alt text
    OCR_RECONSTRUCTION = "OCR_RECONSTRUCTION"        # Eligible scanned PDF for full reconstruction
    UNSUPPORTED = "UNSUPPORTED"                      # Cannot be processed, see reason


class UnsupportedReason(StrEnum):
    """Specific reasons why a document cannot be processed."""
    # Born-digital issues
    BORN_DIGITAL_UNTAGGED = "BORN_DIGITAL_UNTAGGED"          # Needs manual tagging first
    PARTIALLY_TAGGED = "PARTIALLY_TAGGED"                     # Mixed tagged/untagged content
    INTERACTIVE_FORMS = "INTERACTIVE_FORMS"                   # Has fillable form fields
    DIGITALLY_SIGNED = "DIGITALLY_SIGNED"                     # Has digital signatures
    
    # Scanned document issues  
    MIXED_NATIVE_SCANNED = "MIXED_NATIVE_SCANNED"            # Mix of native and scanned content
    NON_ENGLISH_LANGUAGE = "NON_ENGLISH_LANGUAGE"            # Not English or mixed languages
    SENSITIVE_COMPLETED_FORM = "SENSITIVE_COMPLETED_FORM"     # Contains filled personal information
    
    # Technical limitations
    FILE_TOO_LARGE = "FILE_TOO_LARGE"                        # Exceeds 25MB limit
    TOO_MANY_PAGES = "TOO_MANY_PAGES"                        # Exceeds 50 page limit
    CORRUPT_PDF = "CORRUPT_PDF"                               # Cannot be parsed
    ENCRYPTED_PDF = "ENCRYPTED_PDF"                           # Password protected
    
    # Content issues
    NO_PROCESSABLE_CONTENT = "NO_PROCESSABLE_CONTENT"        # No figures or text to process


class JobStatus(StrEnum):
    UPLOADED = "UPLOADED"
    ANALYZING = "ANALYZING"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    APPLYING = "APPLYING"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


class IssueStatus(StrEnum):
    DETECTED = "DETECTED"
    SUGGESTED = "SUGGESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    APPLIED = "APPLIED"


# WCAG guidance: alt text should stay short enough for assistive tech to read
# comfortably. Mirrors ALT_LIMIT in the frontend's IssueCard.
ALT_TEXT_MAX_CHARS = 125

# Document limits for OCR reconstruction eligibility (from issue 001)
OCR_MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024  # 500 MB (effectively unlimited)
OCR_MAX_PAGES = 500


@dataclass
class FigureRef:
    """A /Figure structure element located in a tagged PDF.

    `struct_elem_ref` is the PDF object generation ("12,0") of the StructElem —
    the write target for /Alt, and stable across a read/modify/write cycle.
    """

    struct_elem_ref: str
    page_number: int          # 1-indexed, matching the frontend
    index_on_page: int
    mcid: int | None
    alt_text: str | None      # existing /Alt, if any
    # Layout bounding box from /A /BBox, in unrotated user space. Present on
    # PDF/UA figures; lets us render the whole figure region (composites, vector
    # art) instead of one image XObject. None -> fall back to XObject extraction.
    bbox: tuple[float, float, float, float] | None = None

    @property
    def has_alt_text(self) -> bool:
        return bool(self.alt_text and self.alt_text.strip())


@dataclass
class DocScan:
    """Cheap catalog-level triage. No image extraction, no model calls."""

    tag_status: TagStatus
    page_count: int
    figure_count: int
    figures_missing_alt: int
    image_count: int
    # Routing decision - which workflow this document should follow
    route: DocumentRoute
    # If unsupported, the specific reason why
    unsupported_reason: UnsupportedReason | None = None
    # File size in bytes for limit checking
    size_bytes: int = 0
    # Whether document appears to be primarily scanned content
    is_scan_dominant: bool = False

    @property
    def is_remediable(self) -> bool:
        return self.tag_status is TagStatus.TAGGED and self.figures_missing_alt > 0

    @property
    def is_supported(self) -> bool:
        return self.route != DocumentRoute.UNSUPPORTED


@dataclass
class Issue:
    issue_id: str             # "fig-p2-0" — stable across re-analysis
    page_number: int
    image_index: int
    struct_elem_ref: str      # non-optional: no /Figure, no issue
    has_alt_text: bool
    image_location: str | None = None
    severity: str = "High"
    suggested_alt_text: str | None = None
    approved_alt_text: str | None = None
    status: IssueStatus = IssueStatus.DETECTED

    @property
    def is_approved(self) -> bool:
        return self.status is IssueStatus.APPROVED


@dataclass
class TriageInfo:
    """Classification + recommendation computed at upload, persisted on the
    document so the dashboard/review-queue survive a reload with full data.

    Fields mirror the inventory record the frontend renders (FormInventoryItem);
    snake_case here becomes camelCase at the API edge via camelise()."""

    category: str                       # WELL_LABELED / NEEDS_REMEDIATION / ...
    pages: int
    field_count: int
    missing_label_count: int
    has_signature_field: bool
    recommended_action: str             # remediate_in_place / migrate / ...
    work_items: list[str] = field(default_factory=list)
    rationale: str = ""
    platforms: list[str] = field(default_factory=list)
    platform_caveats: list[str] = field(default_factory=list)
    platform_migration_required: bool = False
    signals: list[str] = field(default_factory=list)


@dataclass
class Document:
    """A library row."""

    doc_id: str
    filename: str
    department: str
    tag_status: TagStatus
    figures_missing_alt: int
    size_bytes: int
    updated_at: str
    # Routing information  
    route: DocumentRoute
    unsupported_reason: UnsupportedReason | None = None
    is_scan_dominant: bool = False
    # Triage metadata (classification + recommendation), persisted so uploads
    # survive a reload. None for documents registered before triage ran.
    triage: TriageInfo | None = None
    # S3 key / location of the remediated PDF, when one was produced.
    remediated_pdf_key: str | None = None
    # True once Ramp has applied at least one fix (tag/modernize/labels/alt).
    # Used by the Review Queue's "Fixed by Ramp" filter and by the Fix Issues
    # button state ("Issues Fixed ✓" once true on a clone).
    fixed_by_ramp: bool = False
    # If this doc was created by /pdf/documents/{id}/clone, points to the
    # original doc_id it was cloned from. None for uploads and corpus ingests.
    # The frontend hides docs with a parent_doc_id from the main Review Queue
    # so clones don't clutter the list.
    parent_doc_id: str | None = None


@dataclass
class Job:
    job_id: str
    doc_id: str
    original_pdf_location: str
    status: JobStatus
    issues: list[Issue] = field(default_factory=list)
    remediated_pdf_location: str | None = None
    created_at: str = field(default_factory=utc_now)
    updated_at: str = field(default_factory=utc_now)
    error_message: str | None = None

    def issue(self, issue_id: str) -> Issue | None:
        return next((i for i in self.issues if i.issue_id == issue_id), None)

    def to_dict(self) -> dict:
        return asdict(self)


# OCR-related enums and models for Issue 002

class OcrJobStatus(StrEnum):
    """Status of an OCR job with the provider."""
    QUEUED = "QUEUED"              # Job accepted but not started
    RUNNING = "RUNNING"            # OCR processing in progress 
    COMPLETE = "COMPLETE"          # OCR finished successfully
    FAILED = "FAILED"              # OCR failed with error
    CANCELLED = "CANCELLED"        # Job was cancelled


class OcrConfidenceLevel(StrEnum):
    """OCR confidence categorization for review prioritization."""
    HIGH = "HIGH"           # >= 90% confidence, likely accurate
    MEDIUM = "MEDIUM"       # 70-89% confidence, should review
    LOW = "LOW"             # < 70% confidence, needs review


class TextType(StrEnum):
    """Classification of recognized text content."""
    PRINTED = "PRINTED"     # Machine-printed text
    HANDWRITTEN = "HANDWRITTEN"  # Handwritten text
    MIXED = "MIXED"         # Both printed and handwritten


@dataclass
class OcrWord:
    """A single word recognized by OCR with position and confidence."""
    text: str
    confidence: float           # 0.0 to 1.0
    bbox: tuple[float, float, float, float]  # x0, y0, x1, y1 in page coordinates
    text_type: TextType = TextType.PRINTED

    @property
    def confidence_level(self) -> OcrConfidenceLevel:
        if self.confidence >= 0.9:
            return OcrConfidenceLevel.HIGH
        elif self.confidence >= 0.7:
            return OcrConfidenceLevel.MEDIUM
        else:
            return OcrConfidenceLevel.LOW


@dataclass
class OcrLine:
    """A line of text with constituent words."""
    text: str
    confidence: float
    bbox: tuple[float, float, float, float]
    words: list[OcrWord] = field(default_factory=list)
    text_type: TextType = TextType.PRINTED

    @property
    def confidence_level(self) -> OcrConfidenceLevel:
        if self.confidence >= 0.9:
            return OcrConfidenceLevel.HIGH
        elif self.confidence >= 0.7:
            return OcrConfidenceLevel.MEDIUM
        else:
            return OcrConfidenceLevel.LOW


@dataclass
class OcrBlock:
    """A logical block of text (paragraph, heading, etc.)."""
    text: str
    confidence: float
    bbox: tuple[float, float, float, float]
    lines: list[OcrLine] = field(default_factory=list)
    block_type: str = "TEXT"     # TEXT, TITLE, HEADING, etc.
    text_type: TextType = TextType.PRINTED


@dataclass
class OcrTable:
    """A table detected in the document."""
    bbox: tuple[float, float, float, float]
    confidence: float
    rows: int
    columns: int
    cells: list[dict] = field(default_factory=list)  # Cell content and positions


@dataclass
class OcrKeyValue:
    """Key-value pairs detected in forms."""
    key: str
    value: str
    key_bbox: tuple[float, float, float, float]
    value_bbox: tuple[float, float, float, float]
    confidence: float


@dataclass
class OcrSelection:
    """Selection marks (checkboxes, radio buttons) detected."""
    bbox: tuple[float, float, float, float]
    confidence: float
    selection_status: str  # SELECTED, NOT_SELECTED, INDETERMINATE


@dataclass
class OcrPage:
    """OCR results for a single page."""
    page_number: int         # 1-indexed
    width: float            # Page dimensions
    height: float
    blocks: list[OcrBlock] = field(default_factory=list)
    tables: list[OcrTable] = field(default_factory=list) 
    key_values: list[OcrKeyValue] = field(default_factory=list)
    selections: list[OcrSelection] = field(default_factory=list)


@dataclass
class OcrProviderMetadata:
    """Provider-specific metadata about the OCR process."""
    provider_name: str
    model_version: str | None = None
    api_version: str | None = None
    processing_time_seconds: float | None = None
    job_id: str | None = None


@dataclass 
class OcrResult:
    """Complete normalized OCR result for a document."""
    pages: list[OcrPage] = field(default_factory=list)
    document_language: str = "en"
    provider_metadata: OcrProviderMetadata | None = None
    created_at: str = field(default_factory=utc_now)

    @property
    def page_count(self) -> int:
        return len(self.pages)

    @property
    def total_blocks(self) -> int:
        return sum(len(page.blocks) for page in self.pages)


@dataclass
class OcrJob:
    """Tracks an OCR job through its lifecycle."""
    job_id: str                    # Application job ID
    provider_job_id: str | None    # Provider's job identifier
    status: OcrJobStatus
    progress_percent: int = 0      # 0-100
    pages_processed: int = 0
    total_pages: int = 0
    error_message: str | None = None
    created_at: str = field(default_factory=utc_now)
    updated_at: str = field(default_factory=utc_now)

    @property
    def is_terminal(self) -> bool:
        """True if job has reached a final state."""
        return self.status in (OcrJobStatus.COMPLETE, OcrJobStatus.FAILED, OcrJobStatus.CANCELLED)

    @property
    def is_complete(self) -> bool:
        return self.status == OcrJobStatus.COMPLETE
