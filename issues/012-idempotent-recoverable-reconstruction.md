## What to build

Harden the complete reconstruction lifecycle so retries, duplicated requests, worker restarts, timeouts, and repeated notifications cannot duplicate provider charges, content, structure elements, storage artifacts, review revisions, validation reports, or final files. Every long-running stage must reach a terminal or actionable state, and the browser must recover or stop polling rather than waiting indefinitely.

This slice covers user stories 7 and 46 and verifies the idempotency decisions across the preceding reconstruction slices.

## Acceptance criteria

- [ ] OCR start, provider callback or poll, review submission, reconstruction write, validation request, structural approval, ALT apply, and final apply use stable operation identifiers or equivalent persisted deduplication keys.
- [ ] Repeating any supported operation returns or resumes the same logical result instead of creating duplicate provider jobs or artifact versions.
- [ ] Concurrent or out-of-order worker activity cannot regress a completed state or publish an artifact from stale review data.
- [ ] Retrying after provider failure, timeout, validation failure, or worker interruption resumes safely or presents a documented actionable restart path.
- [ ] Repeated writes never add a second OCR layer, duplicate marked-content sequence, duplicate structure element, duplicate parent-tree entry, or duplicate figure.
- [ ] Original, normalized OCR, review revision, reconstruction, validation, structural approval, and final artifacts retain stable provenance and version relationships.
- [ ] Every long-running state has a success, failure, retryable, or human-action transition; no service error leaves a job permanently polling.
- [ ] The browser handles recoverable and terminal states with accessible status announcements and bounded polling.
- [ ] JSON and DynamoDB persistence implementations exhibit the same state and deduplication behavior.
- [ ] Tests cover provider failure, timeout, duplicate provider notification, repeated review submission, validation failure and rerun, rejected then corrected review, repeated approval, and repeated apply.
- [ ] Operational logs include stable job and operation identifiers without credentials or unnecessary recognized document text.

## Blocked by

- [Issue 002](./002-run-resumable-textract-ocr.md)
- [Issue 003](./003-review-reconstruct-printed-text-scan.md)
- [Issue 004](./004-reconcile-existing-hidden-ocr.md)
- [Issue 005](./005-reconstruct-semantic-roles-reading-order.md)
- [Issue 006](./006-reconstruct-simple-tables.md)
- [Issue 007](./007-represent-static-form-semantics.md)
- [Issue 008](./008-classify-bind-visual-regions.md)
- [Issue 009](./009-validate-persist-reconstruction-report.md)
- [Issue 010](./010-gate-structural-approval.md)
- [Issue 011](./011-continue-through-alt-review-release.md)
