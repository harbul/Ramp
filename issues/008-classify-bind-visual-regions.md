## What to build

Find non-text visual regions in scanned pages and let the reviewer decide whether each region is a meaningful figure or an artifact. Meaningful logos, photographs, charts, diagrams, signatures, and instructional icons must become candidates; borders, backgrounds, blank lines, and decorative repetitions must not enter reading order. Repeated regions must be reviewed in their page context, and complex charts or diagrams must remain blocking until they have an adequate accessible-equivalent plan.

Bind each approved figure to real marked content, its page, a unique MCID, and its source bounding box without changing the visible pixels. This slice covers user stories 24–28.

## Acceptance criteria

- [ ] Figure segmentation uses OCR text geometry and layout regions so internal chart or diagram labels are not incorrectly inserted into unrelated paragraph flow.
- [ ] Meaningful logos, photographs, icons, signatures, charts, and diagrams become reviewable figure candidates with stable source regions.
- [ ] Borders, backgrounds, blank entry lines, repeated decorations, and other non-meaningful visuals can be classified as artifacts.
- [ ] Repeated regions are evaluated in page context so the same logo can be meaningful in one location and decorative in another.
- [ ] Reviewers can override every meaningful-versus-decorative decision with synchronized page selection and an auditable revision.
- [ ] Any optional model classification is constrained to existing region identifiers and allowed classifications and cannot create or alter source text.
- [ ] Complex charts and diagrams create a blocking requirement for a reviewer-approved adequate alternative or associated textual/data equivalent.
- [ ] Each meaningful figure is written with real marked content, a page reference, a unique MCID, and a bounding box that resolves through the structure and parent trees.
- [ ] The writer may clip or reuse original page pixels for binding but introduces no visible crop seam, overlay, color change, or alternate rendering.
- [ ] Decorative regions are explicitly marked as artifacts, and the full-page scan becomes an artifact only after equivalent text and all meaningful figures are represented.
- [ ] Tests cover meaningful and repeated logos, borders, photographs, icons, diagrams with internal labels, charts, captions, decorative repetitions, and reviewer overrides.

## Blocked by

- [Issue 003](./003-review-reconstruct-printed-text-scan.md)
