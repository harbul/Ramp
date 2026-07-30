## What to build

Extend the text reconstruction path to multi-page documents containing lists, multiple columns, captions, sidebars, repeated headers and footers, page numbers, and other page furniture. Use provider ordering only as evidence, then apply deterministic containment, overlap, column, repetition, and hierarchy rules. Every final block must have one explicit position, while ambiguous cases become review issues that a reviewer can correct.

An optional language-model classifier may help with ambiguous roles or order only by referring to existing block identifiers and an allowed role vocabulary. It must never modify OCR text. This slice covers user stories 16–18 and 31–33.

## Acceptance criteria

- [ ] The domain model and writer support list and list-item structure in addition to the foundational text roles.
- [ ] Deterministic cases produce stable reading order for one-column, multi-column, caption, sidebar, and multi-page layouts.
- [ ] Repeated headers, footers, page numbers, and decorative page furniture are classified as artifacts when context shows they should not interrupt reading.
- [ ] Every accessible block has exactly one explicit document-order position and valid parent/child placement.
- [ ] Ambiguous roles and ordering produce clearly identified blocking or non-blocking review warnings rather than silent guesses.
- [ ] Reviewers can change supported roles and reorder blocks with keyboard operation and meaningful status announcements.
- [ ] Synchronized page highlighting continues to map reordered and reclassified blocks to their original visible regions.
- [ ] Any language-model classification is schema-constrained to existing block identifiers and allowed decisions and cannot add, delete, paraphrase, or correct text.
- [ ] The writer emits standard list and text structure types in the approved order and excludes approved artifacts from assistive-technology reading.
- [ ] Independent extraction tests verify the saved and reopened order for columns, lists, captions, headers, footers, and page numbers.

## Blocked by

- [Issue 003](./003-review-reconstruct-printed-text-scan.md)
