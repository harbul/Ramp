## What to build

Extend document intake so every uploaded PDF is routed to exactly one safe next step: OCR reconstruction for an eligible scanned public form, the existing ALT-text remediation flow for an already-tagged digital PDF, or an unsupported result with a specific reason. Eligibility must be based on page-image dominance and the absence of a usable logical structure, so a scan with hidden OCR remains eligible. Preserve the uploaded PDF as an immutable source artifact and never start partial reconstruction for unsupported input.

This slice covers user stories 1–6.

## Acceptance criteria

- [ ] Blank or public, English-language scanned PDFs at or below 50 pages and 25 MB are identified as eligible for reconstruction.
- [ ] Hidden, untagged OCR does not disqualify an otherwise eligible scan.
- [ ] Already-tagged digital PDFs continue through the existing ALT-text remediation flow without reconstruction or behavior regressions.
- [ ] Born-digital untagged, mixed native/scanned, partially tagged, interactive, digitally signed, non-English or mixed-language, sensitive completed, corrupt, oversized, and over-page-limit PDFs receive distinct unsupported reasons.
- [ ] The original upload is stored unchanged with stable provenance; later artifacts cannot overwrite it.
- [ ] The service and HTTP responses expose a stable route and reason that the browser can render without interpreting PDF-library details.
- [ ] The upload interface clearly presents the selected route, applicable limits, and the next available action; unsupported input is never presented as remediated.
- [ ] Service and API integration tests cover every supported and unsupported input class, including boundary values for page count and file size.
- [ ] Existing tagged-PDF service, API, and browser behavior remains covered by regression tests.

## Blocked by

None - can start immediately
