## What to build

Run OCR and layout analysis for eligible scans as resumable background work behind an application-owned OCR provider contract. The normalized result must contain pages, words, lines, polygons, confidence, printed or handwriting classification, layout regions, relationships, tables, form-like key/value content, selections, figures, signatures, reading-order evidence, and provider metadata. Amazon Textract is the v1 adapter, but AWS response types must not cross the adapter boundary.

Show observable progress and actionable failures in the browser. Persist the OCR input, provider job identity, normalized output, and provider metadata as versioned artifacts. Ordinary development and test runs must remain offline and free of AWS cost. This slice covers user stories 7–8 and 46–50.

## Acceptance criteria

- [ ] The OCR provider contract is independent of Textract and AWS SDK types and can be replaced without changing reconstruction orchestration.
- [ ] Textract document analysis requests all evidence required by the PRD, including text, layout, tables, forms, selections, and signatures, and processes every page of an eligible document.
- [ ] Multipage PDFs use asynchronous analysis with a stable provider job identifier that can be polled, resumed, or retried.
- [ ] Starting or retrying the same OCR operation does not create a second provider job or duplicate normalized artifacts.
- [ ] The persisted normalized result includes provider and model/API version metadata as well as source confidence and geometry.
- [ ] Job responses expose meaningful queued, running, page/progress, complete, failed, and retryable states using stable domain identifiers.
- [ ] The browser remains usable while OCR runs, announces progress accessibly, and stops polling on every actionable or terminal failure.
- [ ] Textract uses the normal AWS credential chain and execution role conventions; the application accepts and stores no AWS credentials.
- [ ] Deterministic fake-provider and minimized Textract fixtures cover normalization without network access or cost.
- [ ] A separately marked, opt-in live test verifies the provider contract and required account permissions against a known public sample.

## Blocked by

- [Issue 001](./001-route-uploads-to-correct-workflow.md)
