# OCR Reconstruction API Endpoints

This document describes the new API endpoints added for the OCR reconstruction workflow.

## New Endpoints

### Job Creation
- `POST /pdf/ocr-jobs` - Create a new OCR reconstruction job
  - Accepts documents routed as `OCR_RECONSTRUCTION`
  - Can process untagged scanned PDFs (unlike ALT-text jobs)

### Job Management  
- `GET /pdf/ocr-jobs/{job_id}` - Get OCR job status and progress
- `POST /pdf/ocr-jobs/{job_id}/reconstruct` - Start OCR reconstruction process
  - Performs full document reconstruction (text extraction, structure analysis, tagging)
  - Runs asynchronously with 202 response

### Review Process
- `GET /pdf/ocr-jobs/{job_id}/preview` - Get preview of OCR reconstruction results
  - Returns extracted text, detected structures, confidence scores
- `POST /pdf/ocr-jobs/{job_id}/review-complete` - Mark review as complete and finalize

### Download
- `GET /pdf/ocr-jobs/{job_id}/download` - Get presigned download URL
- `GET /pdf/ocr-jobs/{job_id}/reconstructed.pdf` - Stream reconstructed PDF directly

## Workflow Flow

1. Upload document → classified as `OCR_RECONSTRUCTION` route
2. `POST /pdf/ocr-jobs` → create job for OCR processing  
3. `POST /pdf/ocr-jobs/{job_id}/reconstruct` → start reconstruction (async)
4. Poll `GET /pdf/ocr-jobs/{job_id}` until status is `NEEDS_REVIEW`
5. `GET /pdf/ocr-jobs/{job_id}/preview` → review reconstruction results
6. `POST /pdf/ocr-jobs/{job_id}/review-complete` → finalize document
7. `GET /pdf/ocr-jobs/{job_id}/download` → download reconstructed PDF

## Service Methods Added

- `create_ocr_job()` - Validates OCR eligibility and creates job
- `reconstruct_ocr()` - Main OCR processing (placeholder implementation)
- `get_ocr_preview()` - Returns reconstruction preview data
- `complete_ocr_review()` - Finalizes the document after review
- `download_ocr_url()` / `reconstructed_bytes()` - Download functionality

## Key Differences from ALT-text Workflow

- Accepts untagged scanned documents
- Full document reconstruction vs. just alt-text remediation
- Different filename suffix: `-reconstructed.pdf` vs. `-remediated.pdf`
- Review process focuses on OCR accuracy vs. alt-text approval
- Uses `_reconstructed_key()` for storage vs. `_remediated_key()`

## Implementation Status

✅ API endpoints defined and integrated
✅ Service layer methods implemented  
✅ File naming and key generation functions
✅ Job state validation for OCR workflow
⏳ Core OCR processing logic (placeholder - needs implementation)
⏳ Preview data generation (placeholder - needs implementation)

The endpoints are ready for frontend integration and testing. The actual OCR processing logic will be implemented in future iterations.