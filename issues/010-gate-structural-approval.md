## What to build

Add accountable document-level structural approval after all reconstruction corrections and validation are complete. Review revisions and warning resolutions must be persisted, blocking and non-blocking items must be clearly distinguished, and approval must fail while any blocking uncertainty or failed validation remains. A successful approval records the reviewer and approval time and makes the reconstructed artifact ready for the existing ALT-text workflow, not directly downloadable as a finished result.

This slice covers user stories 33–35 and 42.

## Acceptance criteria

- [ ] OCR text edits, role changes, ordering changes, table corrections, visual classifications, and warning resolutions are persisted as review revisions with stable block or region references.
- [ ] The review workspace distinguishes blocking issues from non-blocking warnings in text and accessible status, not color alone.
- [ ] Handwriting uncertainty, ambiguous reading order, unsupported table structure, unresolved complex visuals, and failed validation can all participate in the same approval gate.
- [ ] The API exposes a single document-level structural approval operation rather than per-page release decisions.
- [ ] Approval is refused with actionable reasons while any blocking review item or failed validation check remains.
- [ ] Correcting an item and rerunning validation can move the workflow back to an approvable state without losing prior review history.
- [ ] Successful approval records reviewer identity, approval timestamp, the approved reconstruction version, and the validation report it approved.
- [ ] The browser announces successful or refused approval and moves an approved document to readiness for ALT remediation.
- [ ] Structural approval alone does not make an incomplete final download available.
- [ ] State-machine, service, API, persistence, and browser tests cover refused, corrected, approved, and repeated approval attempts.

## Blocked by

- [Issue 004](./004-reconcile-existing-hidden-ocr.md)
- [Issue 005](./005-reconstruct-semantic-roles-reading-order.md)
- [Issue 006](./006-reconstruct-simple-tables.md)
- [Issue 007](./007-represent-static-form-semantics.md)
- [Issue 008](./008-classify-bind-visual-regions.md)
- [Issue 009](./009-validate-persist-reconstruction-report.md)
