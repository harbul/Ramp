## What to build

Represent the readable semantics of printed form-like content without synthesizing interactive PDF controls. Printed labels, key/value relationships, and checkbox-like selections must appear in logical order with their current selected or unselected state. Empty entry lines and purely visual control outlines must be artifacts. Reviewers must be able to correct the label, value, and state before writing.

The product must describe this output as accessible for reading and printing, not as an operable digital form. This slice covers user story 23.

## Acceptance criteria

- [ ] The accessible-document model represents form-like labels, values, selection states, source evidence, geometry, confidence, and reviewer revisions without creating AcroForm fields.
- [ ] Printed checkbox, radio-style, and similar selection evidence is exposed as an explicit selected or unselected state in logical reading order.
- [ ] Reviewers can correct recognized label/value text, label-to-value association, and selection state while viewing the matching scanned region.
- [ ] Empty entry lines, control outlines, and other purely visual form furniture are marked as artifacts when they carry no current readable value.
- [ ] The writer produces static accessible structure and text for labels, values, and states without adding interactive controls, tab stops, or a claim that the PDF is fillable.
- [ ] Visible scan appearance remains unchanged after form semantics are added.
- [ ] The browser clearly explains that the reconstructed form is intended for accessible reading and printing rather than keyboard data entry.
- [ ] Independent output tests verify reading order and announced state for checked, unchecked, blank, and reviewer-corrected examples.

## Blocked by

- [Issue 003](./003-review-reconstruct-printed-text-scan.md)
