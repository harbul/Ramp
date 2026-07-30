## What to build

Extend reconstruction to scanned PDFs that already contain an untagged hidden OCR layer. Extract and align the existing text with Textract as a quality signal, show meaningful disagreements to the reviewer, and ensure the writer exposes each approved passage exactly once. Textract remains the authoritative reconstruction source, while reviewer corrections remain authoritative over Textract.

This slice covers user stories 2 and 9–10.

## Acceptance criteria

- [ ] Existing hidden OCR is extracted without treating its presence as proof that a document is born-digital or already accessible.
- [ ] Comparable passages are aligned and disagreements are recorded as reviewable evidence with stable references to the affected reconstructed blocks.
- [ ] Material OCR disagreements are visible in the review workspace and can be resolved through the normal text-correction workflow.
- [ ] Textract supplies the initial reconstructed text and layout; existing OCR can never silently overwrite it.
- [ ] Old untagged hidden text is removed or suppressed before the normalized tagged text layer is written.
- [ ] Text extraction and assistive-technology order expose every approved passage once, with no duplicated announcements from old OCR content.
- [ ] Reconciliation and suppression do not alter the visible scan or disturb already-tagged digital PDFs on the existing remediation path.
- [ ] Tests cover scans with no OCR, accurate hidden OCR, poor hidden OCR, duplicated hidden OCR, and partially present OCR.
- [ ] Duplicate-text tests independently read the saved output rather than relying only on the production writer's internal representation.

## Blocked by

- [Issue 003](./003-review-reconstruct-printed-text-scan.md)
