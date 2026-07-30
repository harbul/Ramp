## What to build

Continue a structurally approved reconstruction through the existing figure-analysis and ALT-text review workflow, then release a clearly named final artifact. The downstream flow must operate on the real `/Figure` elements created during reconstruction rather than on special scan-region data. Concise text remains guidance for simple figures, but 125 characters is no longer a universal rejection rule for reviewer-approved complex visual alternatives.

The original upload, reconstructed candidate, structurally approved PDF, and final remediated PDF remain distinct artifacts. This slice covers user stories 43–45.

## Acceptance criteria

- [ ] Only a structurally approved reconstruction with passing validation can enter ALT-text remediation.
- [ ] Every meaningful reconstructed figure without an adequate alternative appears in the existing ALT review through its real structure element; artifacts do not.
- [ ] The existing tagged-digital-PDF ALT workflow continues to work without reconstruction-specific branching in figure analysis or writing.
- [ ] Simple-figure suggestions continue to encourage concise alternatives without silently truncating reviewer text.
- [ ] A reviewer can approve an adequate alternative longer than 125 characters for a complex chart or diagram when the chosen representation supports it.
- [ ] A complex visual cannot be released merely because it has a short but inadequate caption; its blocking accessible-equivalent requirement must be resolved.
- [ ] The final writer preserves the reconstructed structure and visible scan while applying reviewer-approved figure alternatives.
- [ ] Final validation failure blocks release and leaves the original and prior versioned artifacts available.
- [ ] The browser provides a coherent transition from structural approval into ALT review and enables download only after all required review and validation stages succeed.
- [ ] The download filename clearly distinguishes the reconstructed/remediated result from the original while retaining the original filename as provenance.
- [ ] An end-to-end test covers scanned upload, OCR, structural review and approval, reconstructed figure discovery, ALT review, final validation, and distinct-file download.

## Blocked by

- [Issue 008](./008-classify-bind-visual-regions.md)
- [Issue 010](./010-gate-structural-approval.md)
