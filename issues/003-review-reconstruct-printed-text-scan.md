## What to build

Deliver the foundational reconstruction tracer bullet for a one-page, single-column, printed-text scan without existing OCR. Convert normalized OCR evidence into a provider-independent accessible-document model, let a reviewer compare and correct it beside the scanned page, and write a separate tagged reconstruction candidate whose visible appearance is unchanged.

The initial semantic path must support document, title, heading, and paragraph roles. It must establish the coordinate conversion, review revisions, invisible Unicode text, marked content, structure tree, parent tree, document language, and title mechanisms that later slices can extend. This slice covers user stories 8, 11–15, 29–31, and 36–38.

## Acceptance criteria

- [ ] The accessible-document model represents source words, semantic blocks, parent/child relationships, explicit order, geometry, confidence, source evidence, and reviewer revisions without provider-specific types.
- [ ] Provider polygons are converted centrally into unrotated PDF user-space coordinates while accounting for media box, crop box, rotation, image placement, and rendering scale.
- [ ] The review workspace displays the scanned page and ordered semantic blocks side by side and supports synchronized selection in both directions.
- [ ] Reviewers can edit recognized text and change title, heading-level, and paragraph roles without changing the visible scan.
- [ ] Text below the configurable initial 90% confidence threshold is highlighted, and handwriting is always identified as reviewable rather than silently approved.
- [ ] No language-model operation can create, paraphrase, silently correct, or delete recognized text.
- [ ] The writer emits one normally invisible Unicode text layer at source geometry with embedded font information and valid Unicode mapping.
- [ ] Approved blocks are wrapped in marked-content sequences with unique MCIDs and resolve through a structure root, parent tree, page structure-parent identifier, and standard structure types.
- [ ] The output sets English as the document language, carries a reviewer-confirmed document title, and treats the full-page scan as an artifact for this text-only case.
- [ ] Independent read-back tests confirm Unicode extraction, semantic order, bidirectional MCID resolution, language, title, and save/reopen stability.
- [ ] Pixel or render comparison proves that reconstruction does not expose OCR text or visibly crop, move, recolor, clean, or redraw the scanned page.
- [ ] A service-level and API/browser integration test exercises upload, OCR, synchronized review, a reviewer text correction, reconstruction writing, and inspection of the resulting candidate artifact.

## Blocked by

- [Issue 002](./002-run-resumable-textract-ocr.md)
