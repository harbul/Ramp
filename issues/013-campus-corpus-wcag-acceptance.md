## What to build

Prove the completed v1 OCR reconstruction workflow against an approved Sacramento State corpus and complete the manual accessibility acceptance work that automation cannot establish. Use at least 20–30 public, non-sensitive scans covering the difficult conditions listed in the PRD. Record accuracy, confidence, latency, cost, warnings, validation results, and reviewer findings, then calibrate configuration without weakening fail-closed behavior.

This issue adds no new user story. It provides release evidence across user stories 1–50 and the PRD's WCAG 2.1 Level AA target.

## Acceptance criteria

- [ ] The approved corpus contains at least 20–30 public, non-sensitive scans with documented provenance and expected reviewer outcomes.
- [ ] The corpus covers rotation, non-zero crop boxes, portrait and landscape pages, low contrast, skew, columns, lists, simple and complex tables, form labels, selections, handwriting, logos, repeated elements, hidden OCR, and poor OCR.
- [ ] The inspected Adobe Scan sample is included once it is approved for the corpus and exercises the hidden-OCR reconstruction route.
- [ ] Ordinary regression tests use deterministic minimized fixtures derived without retaining unnecessary sensitive or copyrighted content.
- [ ] Live Textract evaluation is explicit and opt-in, records the provider version, and reports expected cost before incurring it.
- [ ] Corpus results report recognition and layout accuracy, warning rates, reviewer correction effort, latency, provider cost, validation failures, and unsupported-routing outcomes.
- [ ] The initial 90% confidence warning threshold and 50-page/25-MB limits are reviewed against observed results; any changed product boundary is reflected in the PRD before release.
- [ ] Representative outputs receive manual screen-reader review for text uniqueness, roles, table relationships, selection states, figure alternatives, and reading order after save/reopen.
- [ ] The review workspace and validation page receive keyboard-only and screen-reader inspection against the WCAG 2.1 Level AA target, including focus order and status announcements.
- [ ] PDF/UA diagnostics may inform findings, but release material does not claim full PDF/UA conformance unless separately established.
- [ ] A release report records pass/fail evidence, unresolved risks, required manual-remediation routes, and the decision for every blocking failure.
- [ ] Any unresolved blocking corpus or accessibility failure prevents v1 release rather than being converted into a non-blocking warning.

## Blocked by

- [Issue 001](./001-route-uploads-to-correct-workflow.md)
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
- [Issue 012](./012-idempotent-recoverable-reconstruction.md)
