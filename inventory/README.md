# PDF Form Inventory Module

## Overview

This module provides form classification and recommendation logic for PDF accessibility triage. It analyzes PDF forms to detect:

- **Form field structure** (interactive AcroForm fields)
- **Field labeling** (missing `/TU` tooltips for accessibility)
- **Text layer presence** (scanned vs. born-digital)
- **Signature fields** (process needs)

## Components

### `classify_form.py`
Inspects a PDF and categorizes it:
- `SCANNED` - No text layer, needs OCR + recreation
- `FLAT_NO_FIELDS` - Has text but no interactive fields
- `WELL_LABELED` - ≤10% fields missing labels (spot-check only)
- `NEEDS_REMEDIATION` - >10% fields missing labels (primary automation target)

**Dependencies:** `pypdf` only (no system dependencies)

### `recommend.py`
Rule engine that generates structured recommendations based on:
- Sacramento State's modernization rubric
- Data sensitivity requirements
- Process needs (signature, workflow, approval, external users)
- Form accessibility category

**Output:** Concrete work items, rationale, platform recommendations

### `label_infer.py`
Three-tier label inference strategy:
1. **Tier 1 (free):** Humanize field names (`DepartmentName` → "Department Name")
2. **Tier 2 (free):** Geometric column-header matching for grids
3. **Tier 3 (costs):** AI vision (Bedrock) for remaining fields

**Result:** 80%+ of missing labels resolved without AI costs

## Integration

### Backend Triage Endpoint

`POST /pdf/triage` orchestrates:

```python
1. Scan PDF structure (tags + images)
2. Classify form fields
3. Generate recommendation
4. Auto-start alt-text job if images present
5. Return full triage result
```

**Key Decision:** Only PDFs with:
- Images missing alt text
- Tagged structure (can write alt text back)

...are auto-remediated. All others are stored for dashboard review.

### Frontend Dashboard

`DashboardPage.tsx` displays:
- Total forms analyzed by category
- Department breakdown
- Recommendation cards (remediate/recreate/migrate/ok)

**MVP Scope:** Dashboard is **display-only**. "Recreate" and "Migrate" recommendations show work items but have no action buttons (future work).

## Data Flow

```
User uploads PDF
    ↓
POST /pdf/triage
    ↓
classify_form.py → FormClassification
    ↓
recommend.py → Recommendation
    ↓
Has images? → Auto-start remediation job
    ↓
Store in library (Document model)
    ↓
Dashboard displays via GET /pdf/documents
```

## Testing

### Sample Forms
`data/sample_forms/` contains 17 real Sacramento State forms for testing:
- Forms with missing labels
- Forms with signature fields
- Grid-based forms
- Well-labeled forms

### Running Classification

```bash
cd inventory/src
python classify_form.py /path/to/form.pdf
```

### Label Inference Report

```bash
cd inventory/src
python label_infer.py --report
```

Shows tier breakdown across all sample forms.

## Future Enhancements

### Post-Camp
1. **Full classification metadata** - Attach FormClassification to Document model
2. **Label auto-fix** - Actually write inferred labels back to PDFs
3. **Platform migration workflows** - UI for "migrate" and "recreate" actions
4. **S3 corpus storage** - Bulk analysis of full 90-form dataset

### Tech Debt
- Dashboard should be React (currently static HTML logic in React component)
- Unified backend API (currently separate alt-text and inventory concerns)

## Dependencies

```txt
pypdf>=4.0.0
pdfplumber>=0.11.0
```

Both are pure-Python and Lambda-safe (no system dependencies like poppler).

## License

Sacramento State University - Office of Web Services
