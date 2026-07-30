## What to build

Reconstruct simple rectangular tables end to end. Normalize provider table evidence into rows and cells, let reviewers correct cell text and row or column header roles, and write standard table structure with usable header relationships. Complex merged, nested, irregular, or ambiguous tables must become blocking review issues rather than being published with misleading structure.

This slice covers user stories 19–22, 33, and 35.

## Acceptance criteria

- [ ] The accessible-document model represents tables, rows, header cells, data cells, blank cells, source geometry, confidence, and reviewer revisions independently of Textract types.
- [ ] Simple bordered and borderless rectangular tables are reconstructed automatically from normalized evidence.
- [ ] The review workspace presents the table in source order and lets reviewers edit cell text and set or remove row and column header roles.
- [ ] Table selection remains synchronized with the corresponding region on the scanned page.
- [ ] The writer emits standard table, row, header-cell, and data-cell structure with associations that let a consumer determine the applicable headers for each value.
- [ ] Blank cells and selection elements inside otherwise simple tables are represented without collapsing the grid or shifting associations.
- [ ] Merged, nested, irregular, or structurally ambiguous tables create blocking issues until a corrected supported structure is supplied or the document is routed to manual remediation.
- [ ] A complex table cannot be structurally approved through a warning dismissal that leaves its relationships unresolved.
- [ ] Independent read-back tests verify structure roles, cell order, header associations, reviewer edits, and save/reopen stability.
- [ ] Tests cover bordered, borderless, blank-cell, row-header, column-header, edited, merged, nested, and irregular examples.

## Blocked by

- [Issue 003](./003-review-reconstruct-printed-text-scan.md)
