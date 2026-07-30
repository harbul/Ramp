# OCR pipeline feature

**Status:** Approved for implementation  
**Date:** July 16, 2026  
**Accessibility target:** WCAG 2.1 Level AA

## Problem Statement

The PDF Remediation Assistant currently works only when a PDF already has a
usable logical structure tree. It can find existing `/Figure` elements, suggest
missing alternative text, obtain reviewer approval, and write `/Alt` back to
those elements. It refuses an untagged PDF because alternative text would not be
reachable by assistive technology without a structure tree.

Many campus forms are distributed as scans. A scanned page is usually one large
page image. It may contain no searchable text, or it may contain an untagged and
unreliable hidden OCR layer added by a scanning application. In either case, a
screen reader does not receive the headings, paragraphs, lists, tables, figures,
form labels, selection states, or intended reading order visible on the page.
The existing ALT-text workflow cannot remediate meaningful visual regions
because no `/Figure` elements exist yet.

The system needs a reconstruction stage between document intake and the existing
ALT-text remediation workflow. OCR must supply recognized text and geometry;
reconstruction must turn that evidence into a searchable, reviewed, logically
structured static PDF without changing the scanned page's visible appearance.
The system must not invent, paraphrase, or silently correct the document's
actual text.

The initial target is a blank or public, English-language form scanned into a
PDF. Completed forms containing private information and automatic conversion to
interactive PDF form fields require separate future implementations.

## Solution

Add an OCR reconstruction workflow for scanned, untagged PDFs. On upload, the
system will classify the document and send only eligible scanned documents into
reconstruction. Already-tagged digital PDFs will continue through the existing
ALT-text workflow without being reconstructed. Unsupported documents will be
preserved and reported clearly rather than partially remediated.

The reconstruction workflow will preserve the original PDF as an immutable
source and use Amazon Textract as the v1 OCR and layout provider. Textract will
run on every eligible scanned page and return recognized words, confidence,
geometry, text type, layout regions, tables, form relationships, selection
elements, signatures, and implied reading order. The provider will sit behind
an application-owned interface so another OCR service can be benchmarked or
substituted later.

If the scan already contains hidden OCR, the system will compare it with the
Textract result as a validation signal. Textract will remain the authoritative
source for reconstructed text and layout. The writer will emit one normalized,
tagged text layer and suppress the old untagged OCR content so text is not read
or extracted twice.

The normalized result will become an internal accessible-document model. It
will represent document and page hierarchy, titles, headings, paragraphs,
lists, tables, form-like key/value content, selection states, figures,
artifacts, reading order, source geometry, source confidence, and review state.
Deterministic geometry and containment rules will make obvious decisions. A
language model may help classify ambiguous roles or ordering, but it must never
rewrite recognized text or create content not supported by the scan.

Before a reconstructed file is written, a reviewer will use a side-by-side
workspace. The scanned page will appear on the left and its ordered semantic
blocks on the right. Reviewers will be able to select matching regions, edit OCR
text, change semantic roles, change reading order, correct simple table cells
and headers, and classify visual regions as meaningful or decorative. Low-
confidence text, handwriting, ambiguous layout, and complex tables will be
highlighted. A document cannot advance while blocking issues remain.

The PDF writer will preserve the original visible scan, add a single normally
invisible searchable text layer, wrap accessible content in marked-content
sequences, assign unique marked-content identifiers, and build the structure
tree and parent tree. The full-page scan will be treated as an artifact after
equivalent text and meaningful visual regions have been represented. Meaningful
visual regions will be associated with real marked content, bounding boxes, and
`/Figure` elements. Decorative content will be explicitly marked as artifact.

The completed reconstruction will pass automated structural, extraction, and
visual-preservation checks, then receive document-level human approval. A saved
validation record will show the checks, warnings, provider version, confidence
summary, reviewer, approval time, and input/output hashes. A dedicated
validation-report page will be available temporarily during development and
testing. Validation failures will block release.

After approval, the reconstructed PDF will enter the existing ALT-text
remediation workflow. Newly created meaningful figures without alternative text
will receive Bedrock suggestions and reviewer approval using the established
flow. The original upload will never be overwritten.

## User Stories

1. As an accessibility reviewer, I want to upload a blank public form that was
   scanned into a PDF, so that I can make its content readable by assistive
   technology.
2. As an accessibility reviewer, I want the system to recognize a scanned PDF
   even when a scanning application already added hidden OCR, so that eligible
   documents are not incorrectly rejected.
3. As an accessibility reviewer, I want already-tagged digital PDFs to continue
   through the existing remediation flow, so that reconstruction does not alter
   documents that already have a usable structure tree.
4. As an accessibility reviewer, I want unsupported born-digital, mixed-content,
   partially tagged, signed, or interactive PDFs to be identified clearly, so
   that I do not mistake an incomplete result for a remediated document.
5. As an accessibility reviewer, I want the original PDF preserved unchanged,
   so that I can recover it or compare it with the reconstructed version.
6. As an accessibility reviewer, I want clear feedback when a document exceeds
   the v1 size or page limit, so that I know why processing did not start.
7. As an accessibility reviewer, I want OCR and layout analysis to run as a
   background job with visible progress, so that the interface remains usable
   while a document is processed.
8. As an accessibility reviewer, I want the system to recognize printed text
   and its page coordinates, so that the resulting text layer matches the scan.
9. As an accessibility reviewer, I want existing OCR compared with the new OCR
   result, so that unexpected disagreements are highlighted for review.
10. As a screen-reader user, I want each visible passage represented only once,
    so that duplicated hidden OCR does not cause repeated announcements.
11. As an accessibility reviewer, I want low-confidence words highlighted, so
    that I can check likely recognition mistakes quickly.
12. As an accessibility reviewer, I want handwriting identified separately from
    printed text, so that uncertain handwriting is never accepted silently.
13. As an accessibility reviewer, I want to edit recognized text without
    changing the visible scan, so that the accessible text accurately reflects
    what the page says.
14. As a screen-reader user, I want headings identified by level, so that I can
    understand and navigate the document hierarchy.
15. As a screen-reader user, I want paragraphs grouped coherently, so that words
    are not announced as unrelated fragments.
16. As a screen-reader user, I want lists and list items represented as lists,
    so that their grouping and count are understandable.
17. As a screen-reader user, I want multi-column pages read in their intended
    order, so that content from different columns is not interleaved.
18. As a screen-reader user, I want repeated headers, footers, page numbers, and
    decorative content excluded when appropriate, so that irrelevant material
    does not interrupt the document.
19. As an accessibility reviewer, I want the system to reconstruct simple
    rectangular tables, so that common form grids do not require complete manual
    tagging.
20. As an accessibility reviewer, I want to edit table cell text and identify
    row or column headers, so that table relationships are accurate.
21. As an accessibility reviewer, I want complex, merged, nested, or ambiguous
    tables flagged as blocking issues, so that the system does not publish a
    misleading table structure.
22. As a screen-reader user, I want table headers associated with their data
    cells, so that I can understand the meaning of each value.
23. As a screen-reader user, I want printed checkboxes and similar selections
    announced with their selected or unselected state, so that their current
    meaning is available even though the PDF remains static.
24. As an accessibility reviewer, I want meaningful logos, photographs, charts,
    diagrams, signatures, and instructional icons detected as figure candidates,
    so that they can receive appropriate alternatives.
25. As an accessibility reviewer, I want borders, backgrounds, blank entry lines,
    and decorative repetitions classified as artifacts, so that screen readers
    skip them.
26. As an accessibility reviewer, I want to override every meaningful-versus-
    decorative decision, so that automated classification does not control the
    final accessible result.
27. As an accessibility reviewer, I want repeated visual regions reviewed in
    context, so that a repeated logo can be treated as decorative unless it has
    distinct meaning in that location.
28. As an accessibility reviewer, I want complex charts and diagrams flagged for
    a human-authored accessible equivalent, so that important information is not
    forced into an inadequate short caption.
29. As an accessibility reviewer, I want the page image and semantic outline
    visible side by side, so that I can compare reconstruction with the source.
30. As an accessibility reviewer, I want selecting a page region to highlight
    its semantic block and vice versa, so that I can locate mistakes quickly.
31. As an accessibility reviewer, I want to change a block's role, so that a
    misclassified heading, paragraph, list, table, or figure can be corrected.
32. As an accessibility reviewer, I want to reorder blocks, so that I can repair
    reading order before approving the document.
33. As an accessibility reviewer, I want blocking and non-blocking warnings
    distinguished clearly, so that I know what prevents approval.
34. As an accessibility reviewer, I want one document-level approval after all
    corrections are complete, so that the reconstruction has accountable human
    sign-off.
35. As an accessibility reviewer, I want the system to refuse approval while a
    blocking uncertainty remains, so that an incomplete structure is not
    released accidentally.
36. As a screen-reader user, I want the PDF's language set to English, so that my
    assistive technology uses the appropriate pronunciation rules.
37. As a screen-reader user, I want the document title available in metadata, so
    that I can identify the file independently of its filename.
38. As a screen-reader user, I want text extraction and reading order to survive
    saving and reopening, so that accessibility is not limited to the review
    session.
39. As an accessibility reviewer, I want a validation report that lists all
    automated checks and unresolved warnings, so that I can understand why a
    document passed or failed.
40. As an accessibility reviewer, I want a temporary dedicated validation page,
    so that I can inspect and test the new pipeline during development.
41. As a project auditor, I want the validation record to include provider and
    model version, confidence summary, reviewer, approval time, and file hashes,
    so that the result is traceable.
42. As an accessibility reviewer, I want validation failure to block download,
    so that a structurally invalid PDF is not mistaken for a finished result.
43. As an accessibility reviewer, I want meaningful figures passed into the
    existing ALT-text review after structural approval, so that reconstruction
    and ALT remediation form one coherent workflow.
44. As an accessibility reviewer, I want concise guidance rather than a hard
    125-character rejection for every figure, so that complex visuals can receive
    a sufficiently complete reviewer-approved alternative.
45. As an accessibility reviewer, I want a newly named reconstructed/remediated
    file to download, so that the source and output cannot be confused.
46. As a project operator, I want failed or retried OCR jobs to be idempotent, so
    that retries do not duplicate content, artifacts, or billable work.
47. As a project operator, I want Textract accessed through the existing AWS
    credential and role conventions, so that credentials are never stored in
    application code.
48. As a project operator, I want a provider interface around Textract, so that
    another OCR service or a future specialized model can be evaluated without
    rewriting the reconstruction workflow.
49. As a developer, I want deterministic OCR fixtures for ordinary tests, so
    that the test suite runs without AWS access, network calls, or cost.
50. As a developer, I want an opt-in live Textract test, so that provider drift
    and account configuration can be checked intentionally.

## Implementation Decisions

- **Pipeline boundary:** OCR reconstruction is a new stage before ALT-text
  remediation. It applies to eligible scanned, untagged PDFs. The existing
  tagged-PDF path continues to scan existing structure elements and remediate
  missing alternative text without reconstruction.
- **Eligibility gate:** v1 accepts blank or public, English-language scans up to
  50 pages and 25 MB. A scan is identified by page-image dominance and missing
  usable logical structure, not merely by the absence of extractable text.
  Existing hidden OCR therefore does not disqualify a scan.
- **Unsupported input:** born-digital untagged PDFs, mixed native/scanned
  documents, partially tagged documents, interactive forms, digitally signed
  PDFs, non-English or mixed-language documents, sensitive completed forms, and
  documents over the v1 limits are routed out of automatic reconstruction with
  a specific reason.
- **Original preservation:** the uploaded source remains immutable. OCR input,
  normalized provider output, review revisions, reconstructed PDF, validation
  report, and final remediated PDF are stored as separate versioned artifacts.
- **OCR provider port:** define an application-owned OCR provider contract. Its
  normalized result contains pages, words, lines, polygons, confidence, printed
  or handwriting classification, layout blocks, relationships, and provider
  metadata. AWS response types do not cross the adapter boundary.
- **Textract configuration:** Amazon Textract is the v1 provider. Document
  analysis requests include text, layout, tables, forms, signatures, and their
  relationships. Multipage documents use the asynchronous document-analysis
  flow. Jobs must be safe to poll, resume, or retry.
- **Authoritative OCR:** Textract output is authoritative for reconstruction.
  Existing OCR is extracted and compared as a quality signal. Old untagged
  hidden text is removed or suppressed before the single normalized tagged text
  layer is written.
- **Coordinate normalization:** provider polygons are converted from normalized
  image coordinates into unrotated PDF user-space coordinates while accounting
  for media box, crop box, page rotation, image placement, and rendering scale.
  The conversion is centralized and round-trip tested.
- **Accessible-document model:** introduce provider-independent domain objects
  for source words, layout blocks, semantic roles, page order, parent/child
  relationships, tables, figures, artifacts, confidence, source evidence, and
  reviewer revisions. Provider output is never written directly into a PDF.
- **Semantic roles:** the initial role vocabulary includes document, title,
  heading levels, paragraph, list, list item, table, table row, table header,
  table data cell, figure, caption, form-like key/value content, selection state,
  and artifact. Roles map to standard PDF structure types at the writer boundary.
- **Reading order:** use Textract's implied order as evidence, then apply
  deterministic column, containment, overlap, and hierarchy rules. Every final
  block has one explicit position in document order. Ambiguity becomes a review
  issue rather than a silent guess.
- **Language-model boundary:** Bedrock may classify ambiguous semantic roles,
  reading-order alternatives, and meaningful-versus-decorative regions. Its
  output must reference existing block identifiers and allowed roles. It cannot
  create, paraphrase, correct, or delete OCR text.
- **Confidence policy:** begin with a 90% Textract confidence warning threshold.
  Handwriting and structural ambiguity are always reviewable. Thresholds are
  configuration, not permanent domain constants, and will be calibrated against
  the campus test corpus.
- **Tables:** simple rectangular tables are reconstructed automatically. The
  reviewer can correct cell text and row/column header roles. Complex merged,
  nested, irregular, or ambiguous tables remain blocking until corrected
  manually or removed from the automatic workflow.
- **Static form semantics:** v1 does not synthesize AcroForm controls. Printed
  labels and current selection states are represented in logical reading order;
  empty entry lines and purely visual control outlines are artifacts. The result
  may be described as accessible for reading and printing, not as an operable
  digital form.
- **Figure segmentation:** OCR text geometry and layout regions are used to find
  non-text visual regions. Text enclosed by a chart or diagram is excluded from
  unrelated paragraph flow. Meaningful regions become figure candidates;
  decorative regions become artifacts. The reviewer has final control.
- **Figure binding:** a figure requires real marked content, a page reference,
  an MCID, and a bounding box. The writer may reuse and clip the original page
  image at the figure region so that the tagged figure corresponds to visible
  pixels without introducing a visibly different crop.
- **Complex visual alternatives:** 125 characters remains guidance for concise
  simple-figure suggestions, not a universal blocking limit. Complex charts and
  diagrams require a reviewer-approved adequate alternative, which may be a
  longer `/Alt` value or an accessible textual/data equivalent associated with
  the figure.
- **Full-page scan treatment:** after equivalent accessible text and meaningful
  figures exist, the original full-page scan is marked as artifact. This prevents
  assistive technology from announcing the page as one meaningless image while
  retaining its visible appearance.
- **Text-layer writing:** write recognized Unicode text at its source geometry
  using normally invisible rendering, embedded font information, and valid
  Unicode mapping. Text is grouped into marked-content sequences according to
  the approved semantic blocks rather than written as an unrelated OCR dump.
- **Structure writing:** create the document hierarchy, marked-content
  sequences, unique MCIDs, structure root, parent tree, page structure-parent
  identifiers, marked-content metadata, document language, and document title.
  Every accessible content item resolves in both directions between page content
  and logical structure.
- **Visual preservation:** the scan's visible appearance must remain unchanged.
  Reconstruction must not clean up, redraw, crop, recolor, or otherwise alter
  the page image presented to a sighted reader.
- **Workflow state:** extend the existing persisted job workflow with explicit
  reconstruction stages for OCR processing, structural review, reconstruction,
  validation, validation failure, structural approval, and readiness for ALT
  remediation. Every long-running stage reaches a terminal or actionable state;
  the browser must never poll indefinitely after an error.
- **Service orchestration:** the existing service layer remains the primary
  application seam. It coordinates storage, job persistence, OCR, optional
  semantic classification, review changes, writing, validation, and transition
  into the ALT workflow through ports rather than cloud-specific imports.
- **API behavior:** the API exposes operations to start reconstruction, inspect
  normalized pages and blocks, submit review revisions, request validation,
  approve structure, view the validation report, and continue to ALT
  remediation. Responses use stable domain identifiers and preserve existing
  API naming conventions.
- **Review workspace:** the structural-review interface displays the page and
  ordered blocks side by side with synchronized selection. It supports OCR text
  edits, role changes, ordering, simple table corrections, visual classification,
  warning resolution, and document approval. Keyboard operation and meaningful
  status announcements are required.
- **Temporary validation page:** add a dedicated validation-report page during
  development. It presents pass/fail checks, blocking issues, warnings, OCR
  confidence summaries, provider metadata, reviewer information, timestamps,
  and file hashes. The report data remains part of the domain even if this page
  is later removed or folded into the review workspace.
- **Validation behavior:** validation is fail-closed. A failed check or unresolved
  blocking review item prevents structural approval, ALT remediation, and final
  download. The original remains available.
- **WCAG target:** product acceptance targets WCAG 2.1 Level AA. PDF/UA checks
  may be used as helpful diagnostics, but the product will not require or claim
  full PDF/UA conformance.
- **Validation record:** persist the original and reconstructed SHA-256 hashes,
  OCR provider/model version, document-level confidence summary, checks and
  outcomes, unresolved warnings, reviewer identity, and approval timestamp.
  Do not store unnecessary recognized text in audit-only logs.
- **ALT integration:** only a structurally approved reconstructed PDF enters the
  current figure-analysis and ALT review flow. The downstream flow operates on
  the newly created `/Figure` elements rather than special-casing scan regions.
- **Naming:** produce a distinct reconstructed/remediated filename and retain the
  original filename as provenance. Never overwrite the uploaded object.
- **Error handling and idempotency:** use stable operation identifiers and
  provider job identifiers. Repeating a callback, poll, review submission,
  validation request, or apply request must not create duplicate OCR layers,
  structure elements, storage artifacts, or provider jobs.
- **Security posture:** use the established AWS credential chain and execution
  roles. No AWS credentials are accepted through the API or stored in jobs.
  Sensitive-document controls are not implied by this public-form v1.

## Testing Decisions

- **Primary seam:** test the feature through the existing service-level workflow,
  which is the highest stable application seam. A test registers a scanned PDF,
  starts reconstruction with a deterministic fake OCR provider, applies reviewer
  corrections, approves structure, validates the written PDF, and advances it to
  ALT remediation. Tests assert observable job states, artifacts, reports, and
  output behavior rather than private helper calls.
- **API seam:** add API integration tests for upload classification,
  reconstruction start, background progress, block retrieval, review revisions,
  validation, approval, failure responses, and transition to ALT remediation.
  These follow the existing pattern of injecting the service and exercising the
  real HTTP contract without AWS calls.
- **Provider contract:** use recorded, minimized Textract response fixtures to
  test normalization of text, polygons, confidence, handwriting, layout blocks,
  tables, key/value relationships, selection elements, figures, signatures,
  pagination, and provider metadata. Unit tests must not depend on the exact
  order or presence of unrelated AWS fields.
- **Independent verification:** write PDFs with the production writer and verify
  them using an independent parser where practical. Confirm extractable Unicode
  text, content order, structure types, MCID resolution, parent-tree entries,
  page associations, language, title, artifact marking, figure bounding boxes,
  and save/reopen stability. This extends the existing practice of independently
  reading back ALT-text changes.
- **Visual regression:** render original and reconstructed pages with the existing
  PDF renderer and compare dimensions and pixels within a documented tolerance.
  Any visible OCR text, crop change, shifted scan, changed color, missing region,
  or figure-overlay seam is a failure.
- **Duplicate-text tests:** cover scans with no OCR, valid hidden OCR, poor hidden
  OCR, duplicated hidden OCR, and partially present OCR. The reconstructed output
  must expose each approved text passage exactly once.
- **Coordinate tests:** cover non-zero crop boxes, rotation at 0/90/180/270
  degrees, scaled or offset page images, portrait and landscape pages, and
  normalized polygons. Assert that highlighted UI geometry and written text map
  back to the same visible region.
- **Reading-order tests:** cover one column, multiple columns, headers, footers,
  page numbers, lists, captions, sidebars, and ambiguous layouts. Deterministic
  cases must produce stable order; ambiguous cases must produce review warnings.
- **Table tests:** cover simple bordered and borderless tables, row and column
  headers, blank cells, selection elements, and reviewer edits. Merged, nested,
  and irregular tables must be blocked unless a corrected structure is supplied.
- **Figure tests:** cover meaningful logos, repeated logos, decorative borders,
  photographs, icons, vector-like diagrams within a scan, charts with internal
  labels, and figure captions. Each meaningful figure must have marked content,
  page binding, bounding box, and a downstream ALT issue; artifacts must not.
- **Handwriting tests:** ensure handwriting is distinguished and highlighted.
  Low-confidence handwriting must never be silently promoted to approved text.
- **Input-gate tests:** cover blank/public scans, tagged digital PDFs, untagged
  born-digital PDFs, mixed native/scanned PDFs, partially tagged PDFs, interactive
  forms, signed files, corrupted files, non-English documents, sensitive-form
  indicators, and files at and beyond size/page limits.
- **State-machine tests:** cover success, provider failure, timeout, retry,
  duplicated provider notification, validation failure, rejected review,
  corrected review, and repeated apply. Every path must reach a documented
  actionable or terminal state without duplicating work.
- **Validation-report tests:** assert that check outcomes, warnings, provider
  version, confidence summary, reviewer, timestamp, and hashes are present and
  consistent with the artifacts. Avoid brittle tests of display formatting.
- **Frontend behavior:** test keyboard-accessible synchronized selection, text
  editing, role changes, reordering, table correction, classification overrides,
  warning resolution, approval gating, failure announcements, validation-report
  rendering, and continuation into the existing ALT review.
- **Offline default:** all ordinary tests use fakes and fixtures and incur no AWS
  cost. A separate opt-in live test may submit a known public sample to Textract
  and verify only the provider contract and required account permissions.
- **Campus corpus:** calibrate confidence and layout rules using at least 20–30
  approved public scans containing rotation, low contrast, skew, columns, tables,
  form labels, checkboxes, logos, repeated elements, and poor OCR. The inspected
  Adobe Scan sample is an initial acceptance document once it is placed in the
  approved test corpus.
- **Manual WCAG review:** automated checks do not prove WCAG conformance. Before
  release, representative outputs receive human reading-order and screen-reader
  review, including keyboard inspection of the review experience itself.

## Out of Scope

- Automatically creating text inputs, checkboxes, radio buttons, signatures, or
  other interactive AcroForm fields from printed form regions.
- Claiming that a static reconstructed form is digitally fillable or keyboard-
  operable. v1 makes the source accessible for reading and printing.
- Processing completed forms containing names, student IDs, signatures, or
  other private information. Sensitive-document support requires campus privacy
  approval, encryption policy, restricted access, retention/deletion rules, and
  audit controls.
- Training or fine-tuning a handwriting model. v1 detects and reviews uncertain
  handwriting; specialized recognition is a future feature.
- Non-English and mixed-language reconstruction in v1.
- Automatic reconstruction of born-digital untagged PDFs, mixed native/scanned
  PDFs, or partially tagged PDFs.
- Modifying or invalidating digitally signed PDFs.
- Automatically resolving complex merged, nested, irregular, or ambiguous
  tables without reviewer correction.
- Treating a short ALT suggestion as sufficient for every complex chart or
  diagram.
- Rewriting, summarizing, translating, correcting, or inventing source text with
  a language model.
- Changing the scan's visible design, cleaning its background, deskewing the
  delivered appearance, redrawing content, or replacing the source page image.
- Full PDF/UA certification or a claim of PDF/UA conformance.
- Bookmark reconstruction, interactive-form repair, batch campus processing,
  and model fine-tuning. If one of these is necessary for a particular document
  to meet WCAG 2.1, validation must block release and route it to another
  remediation process.
- Files over 50 pages or 25 MB until performance, cost, and usability testing
  supports raising the v1 limits.

## Further Notes

- The guiding principle is: **OCR supplies evidence; reconstruction creates the
  accessible document model; a reviewer owns the final meaning and order.**
- The inspected Adobe Scan sample is a representative target: it contains one
  full-page scan and an existing hidden OCR layer but no structure tree,
  marked-content metadata, page structure-parent identifier, or interactive
  fields. It should enter reconstruction rather than be rejected as merely
  untagged.
- Recommended implementation order:
  1. Add scan eligibility and the provider-independent reconstruction model.
  2. Add the Textract adapter, asynchronous orchestration, and deterministic
     fixtures.
  3. Normalize coordinates and compare/suppress existing hidden OCR.
  4. Implement semantic layout rules and review issues.
  5. Implement the PDF text/structure writer and figure binding.
  6. Implement automated validation and persisted validation reports.
  7. Add the side-by-side structural review workspace and temporary validation
     page.
  8. Connect structurally approved outputs to the existing ALT workflow.
  9. Calibrate thresholds and acceptance behavior against the campus corpus.
- The initial 90% warning threshold and 50-page/25-MB limits are product starting
  points, not claims about Textract accuracy or permanent service limits. They
  must be revisited using observed results, latency, and cost.
- The current hard 125-character ALT limit must be separated from the OCR
  reconstruction work before complex reconstructed figures can be considered
  complete. Concision remains desirable, but adequacy and reviewer approval take
  precedence over a universal character count.
- No unresolved product questions remain from the design interview. Changes to
  the approved v1 boundaries should update this PRD before implementation.
