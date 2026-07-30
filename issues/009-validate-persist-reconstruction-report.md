## What to build

Validate each reconstructed candidate with independent structural, extraction, duplicate-text, and visual-preservation checks, then persist a traceable validation report. Expose the report through the service and API and add the temporary dedicated validation page described in the PRD. Validation is fail-closed: a failed check places the workflow in a validation-failed state and makes reconstructed or final downloads unavailable.

This slice covers user stories 39–42.

## Acceptance criteria

- [ ] Validation checks extractable Unicode text, approved order, standard structure roles, unique MCIDs, bidirectional marked-content resolution, parent-tree entries, page associations, language, and title.
- [ ] Validation checks artifact treatment, figure page/bounding-box bindings when present, duplicate text exposure, and save/reopen stability.
- [ ] Visual regression compares original and reconstructed page dimensions and rendered pixels within a documented tolerance and fails on visible OCR, crop changes, shifts, color changes, missing regions, or figure seams.
- [ ] Each check records a stable identifier, pass/fail outcome, supporting detail, and whether the result is blocking.
- [ ] The persisted report includes original and reconstructed SHA-256 hashes, OCR provider and model/API version, confidence summary, unresolved warnings, reviewer information when available, timestamps, and approval information when available.
- [ ] Audit-only logs and report indexes do not duplicate unnecessary recognized document text.
- [ ] A validation request, report lookup, and validation-failure response are available through stable service and HTTP operations.
- [ ] The temporary validation page presents check outcomes, blocking issues, warnings, confidence, provider metadata, reviewer data, timestamps, and hashes accessibly without relying on color alone.
- [ ] A failed check or unresolved blocking validation item prevents structural approval, ALT remediation, and reconstructed/final download while leaving the immutable original available.
- [ ] Tests assert report data and gating behavior without brittle assertions on display formatting.

## Blocked by

- [Issue 003](./003-review-reconstruct-printed-text-scan.md)
