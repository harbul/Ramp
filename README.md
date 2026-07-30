# Ramp — Backend

Python + FastAPI service for [Ramp](../../tree/main). This branch holds **only the backend code with the offline (stub / local / json) providers** — no AWS dependencies at all. For the AWS adapters (Bedrock, Textract, S3, DynamoDB) and CDK infra see the [`ExternalIntegration`](../../tree/ExternalIntegration) branch. For the React app see [`frontend`](../../tree/frontend).

---

## What lives here

```
backend/
  requirements.txt          runtime deps (pikepdf, pdfplumber, pypdf, Pillow, anthropic[bedrock], fastapi, mangum)
  requirements-dev.txt      pytest, ruff, python-dotenv, boto3, moto, uvicorn, httpx
  requirements-ml.txt       onnxruntime + numpy (only needed for the ONNX layout detector)
  demo/
    sample_inaccessible.pdf         a tagged Sac State-style PDF with 2 unlabelled figures
    make_sample_pdf.py              regenerate the sample
  src/pdf_remediation/
    api/app.py              FastAPI routes (21 endpoints)
    api/triage.py           unified upload → classify → recommend → auto-remediate
    service.py              RemediationService orchestrator (single entry from API/CLI/Lambda)
    models.py               domain dataclasses + StrEnum wire types
    config.py               Settings.from_env + build_service DI
    errors.py               RemediationError hierarchy with http_status + stable code
    cli.py                  scan / analyze / apply local commands
    core/                   pure PDF logic (no I/O, no boto3)
      scan.py               tag status + figure walk + route classification
      apply.py              /Alt write + independent read-back verification
      render.py             figure region → PNG via pypdfium2
      context.py            surrounding page text for LLM prompts
      inspect.py            image XObject enumeration
      wcag.py               12-rule WCAG 2.1 AA scorer
      fixers.py             set_language / set_title / set_pdfua_metadata / one_click_modernize
      labels_write.py       AcroForm /TU tooltip writer
      ocr_structure.py      build StructTreeRoot from OCR result
    ports/                  abstract protocols
      storage.py            put_bytes / get_bytes / presign
      job_store.py          put_document / put_job / list_documents
      alt_text.py           suggest(image_png, context) → AltTextSuggestion
      ocr.py                start_job / poll / cancel / fetch_result
      layout.py             detect(page_png) → [Region]
    adapters/               only offline implementations ship on this branch
      storage_local.py      filesystem storage
      job_store_json.py     one JSON file per doc/job
      alt_text_stub.py      deterministic placeholder alt text
      ocr_stub.py           deterministic OCR placeholder
  tests/                    86 offline pytest tests

inventory/                  deterministic form-classification module (pypdf only)
  src/classify_form.py      categorize a PDF (SCANNED / FLAT_NO_FIELDS / WELL_LABELED / NEEDS_REMEDIATION)
  src/recommend.py          Sac State rubric rule engine → action + work items
  src/label_infer.py        3-tier missing-label recovery (tier 1 wired; tiers 2/3 exist)
```

**Not on this branch (see `ExternalIntegration`):**
`adapters/alt_text_bedrock.py`, `adapters/ocr_textract.py`, `adapters/ocr_bedrock_vision.py`, `adapters/storage_s3.py`, `adapters/job_store_dynamo.py`, `adapters/layout_onnx_yolo.py`, and the entire `infra/` CDK tree.

---

## Run (offline, no AWS)

```bash
cd backend
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
PYTHONPATH=src PDF_WORK_DIR=/tmp/ramp_work \
  python -m uvicorn pdf_remediation.api.app:app --port 8000 --reload
# GET http://localhost:8000/health
```

Defaults (no `.env` needed):
- `PDF_STORAGE_BACKEND=local`
- `PDF_JOB_STORE=json`
- `PDF_ALT_TEXT_PROVIDER=stub`
- `PDF_OCR_PROVIDER=none`

---

## Tests

```bash
PYTHONPATH=src pytest \
  --ignore=tests/test_ocr_textract.py \
  --ignore=tests/test_routing_integration.py \
  --ignore=tests/test_layout_onnx_yolo.py \
  --ignore=tests/test_verify_accessibility.py \
  --ignore=tests/test_verify_layout.py
# 86 passed
```

The ignored files exercise AWS adapters / the ONNX detector and belong on the `ExternalIntegration` branch.

---

## HTTP surface (21 routes)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | health check |
| GET | `/pdf/routes` | enum of routes + unsupported reasons for frontend filters |
| GET | `/pdf/documents` | list persisted documents (with filter query params) |
| GET | `/api/dashboard/stats` | rich rollups: byAction, byDepartment, bySignal, estimatedHoursSaved |
| POST | `/pdf/documents` (multipart) | register + scan a PDF (no triage) |
| POST | `/pdf/documents/from-corpus` | ingest a listed corpus form (needs `PDF_CORPUS_BUCKET`) |
| POST | `/pdf/triage` (multipart) | classify + recommend + auto-remediate on upload |
| GET | `/pdf/documents/{id}/original.pdf` | stream current stored bytes (post-fix if fixed) |
| GET | `/pdf/documents/{id}/wcag` | WCAG 2.1 AA report on current bytes |
| POST | `/pdf/documents/{id}/tag` | inject structure tree into untagged PDF |
| POST | `/pdf/documents/{id}/modernize` | one-click: tag + language + title + PDF/UA + MarkInfo; returns before/after |
| POST | `/pdf/documents/{id}/infer-labels` | write `/TU` tooltips for AcroForm fields |
| POST | `/pdf/wcag/check` (multipart) | WCAG check on an uploaded PDF (no persistence) |
| POST | `/pdf/jobs` / `.../analyze` / `.../apply` | alt-text job lifecycle |
| POST | `/pdf/jobs/{id}/alt-text/{issue}/approve` | reviewer approves / rejects a suggestion |
| GET | `/pdf/jobs/{id}` / `.../issues/{id}/image` / `.../remediated.pdf` / `.../download` | poll + assets |
| POST | `/pdf/ocr-jobs` / `.../reconstruct` / `.../review-complete` | OCR reconstruction lifecycle |
| GET | `/pdf/ocr-jobs/{id}` / `.../preview` / `.../images/{id}` / `.../reconstructed.pdf` / `.../download` | OCR polling + assets |

---

## Design rule

`service.py` and `core/*` never import `boto3` and never know what a Lambda is. Storage, the job store, the alt-text provider, and the OCR provider are all `ports/*` protocols; adapters are wired in `config.build_service()` by env vars. That is why swapping in cloud implementations from `ExternalIntegration` is a one-line env change, not a rewrite.

---

Sole maintainer: **harbul**.
