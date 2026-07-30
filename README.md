# Ramp

> The on-ramp to accessible, modern, compliant PDFs.

**Ramp** is the one app for the three problems every campus PDF library carries — **accessibility**, **modernization**, and **compliance**. Score any document against WCAG 2.1 AA, one-click modernize its structure and metadata, and review AI-drafted alt text, form labels, and rebuild paths before anything ships. Built for institutions racing the **ADA Title II deadline (April 2026)**.

---

## About

Campuses have thousands of legacy PDFs — flat forms, scanned handouts, untagged annual reports. Under ADA Title II, every one of them must be screen-reader-navigable. Doing this by hand does not scale. Ramp turns the backlog into a workflow:

- **See** where you stand — WCAG 2.1 AA score for every document, department-level roll-ups
- **Fix what's mechanical** — inject structure, set language and title, declare PDF/UA — in one click
- **Review what the AI drafted** — alt text, form-field labels, and modernization recommendations, with a human on every suggestion before it ships

Runs 100% offline with stub providers; swaps in Amazon Bedrock (Claude vision), Textract, S3, and DynamoDB via environment variables when cloud access is available.

---

## Feature list

- **WCAG 2.1 Level AA scorecard** — 12-rule audit; per-rule severity, WCAG SC reference, and auto-fix action
- **One-click Modernize** — inject structure tree, set `/Lang`, `/Title`, `/MarkInfo`, and PDF/UA-1 metadata in one call
- **Tag PDF** — wrap image XObjects as `/Figure` structure elements on any untagged PDF
- **AI-suggested alt text** — Claude vision on Amazon Bedrock, structured `{alt_text, is_decorative}` via forced tool use
- **Reviewer alt-text editor** — 125-char counter, reject/edit per figure, server-side length enforcement
- **Form-field label inference** — tier-1 humanize writes `/TU` tooltips for AcroForm fields lacking them (WCAG 4.1.2)
- **OCR reconstruction pipeline** — async Textract with TABLES/FORMS/LAYOUT/SIGNATURES; builds real `StructTreeRoot` with `H1`/`P`/`Figure` for scanned PDFs
- **Triage engine** — deterministic form classifier (SCANNED / FLAT_NO_FIELDS / WELL_LABELED / NEEDS_REMEDIATION) + Sac State rubric recommendation (remediate / recreate / migrate / OK)
- **Process-signal detection** — flags forms that need a signature, external submission, workflow, or handle sensitive data
- **Review Queue** — filter 341-row inventory by department, action, tag status, and process signals; per-row review decision persisted in browser; CSV export
- **Live Sac State corpus** — 250 real PDFs sampled from the 2026 DubBot campus scan, plus the curated 90-form ABA-forms inventory
- **Dashboard** — estimated staff hours saved, action breakdown bar, department cards, upload-with-triage control
- **Verifiable writes** — every `/Alt` written is independently read back and compared before release
- **Offline-first** — no `.env` needed; stub alt-text provider + local filesystem storage + JSON job store default

---

## Application workflow

```
                       ┌─────────────────────────────────────┐
Upload PDF ──────────► │  1. WCAG 2.1 AA scan (12 rules)     │
                       │  2. Triage: classify + recommend    │
                       │  3. Route decision (ALT / OCR /     │
                       │     modernize / unsupported)        │
                       └──────────────────┬──────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              ▼                           ▼                           ▼
      ┌───────────────┐          ┌────────────────┐         ┌──────────────────┐
      │  Modernize    │          │  Remediate     │         │  Reconstruct     │
      │  (unattended) │          │  ALT text      │         │  (Textract OCR)  │
      │               │          │  (human review)│         │                  │
      │ • inject tags │          │ • AI drafts    │         │ • text + layout  │
      │ • set /Lang   │          │ • reviewer     │         │ • struct tree    │
      │ • set /Title  │          │   edits/rejects│         │ • figures + alt  │
      │ • PDF/UA-1    │          │ • server-side  │         │ • table cells    │
      │ • /MarkInfo   │          │   125-char cap │         │                  │
      └───────┬───────┘          └────────┬───────┘         └────────┬─────────┘
              │                           │                           │
              └───────────────────────────┼───────────────────────────┘
                                          ▼
                             ┌────────────────────────┐
                             │ Re-score (before→after)│
                             │ Download final PDF     │
                             └────────────────────────┘
```

---

## Tech stack

### Frontend
- **React 18** + **TypeScript 5** + **Vite 5**
- Single-page app with tab-based routing (Dashboard / Review Queue / Remediate)
- Hand-rolled CSS on the Sac State palette — every text pair verified ≥ 4.5:1 contrast
- No CSS framework; no state library beyond React hooks
- localStorage for per-form review decisions

### Backend
- **Python 3.14** + **FastAPI 0.121**
- **Ports/adapters** architecture — the core never imports `boto3` and never knows what a Lambda is
- **pikepdf** (MPL-2.0) — structure tree read/write, the only library that can set `/Alt`
- **pypdfium2** (BSD/Apache) — renders a figure's real page region (composites, vector art)
- **pdfplumber** (MIT) — page text extraction for LLM context and column-header inference
- **pypdf** (BSD) — form-field enumeration for the triage engine
- **Pillow** (MIT) — image downscaling to model input limits
- **Anthropic SDK** — Bedrock client with forced tool use for structured output
- **pytest** — 86 offline tests + opt-in live Bedrock test

### Infrastructure
- **AWS CDK** (Python) — storage stack deployed in `us-west-2`

### Deliberately excluded
- **PyMuPDF** — AGPL-3.0's network clause would attach to a hosted campus service

---

## External APIs

| Service | Purpose | Adapter |
| --- | --- | --- |
| Amazon Bedrock | Claude vision for alt-text suggestions and Bedrock-vision OCR fallback | `adapters/alt_text_bedrock.py`, `adapters/ocr_bedrock_vision.py` |
| Amazon Textract | Async multi-page OCR with TABLES / FORMS / LAYOUT / SIGNATURES | `adapters/ocr_textract.py` |
| Amazon S3 | Storage for original + remediated PDFs (presigned GET/PUT) | `adapters/storage_s3.py` |
| Amazon DynamoDB | Single-table job store (JOB# / DOC# partitioning) | `adapters/job_store_dynamo.py` |

All AWS adapters live on the [`ExternalIntegration`](../../tree/ExternalIntegration) branch; the [`backend`](../../tree/backend) branch ships stub/local equivalents so the app runs with zero cloud dependencies.

---

## Backend architecture pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│ HTTP layer (FastAPI)                                             │
│  api/app.py         21 routes (upload, triage, jobs, wcag, tag,  │
│                     modernize, infer-labels, ocr-jobs, download) │
│  api/triage.py      classify + recommend + auto-remediate        │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│ Service orchestrator (single entry from API / CLI / Lambda)      │
│  service.RemediationService                                      │
│    register_document / analyze / approve / apply / download      │
│    tag_document / modernize / rescan / infer_labels              │
│    create_ocr_job / reconstruct_ocr / complete_ocr_review        │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│ Core (pure PDF logic, no I/O, no boto3)                          │
│  core/scan.py           tag status + figure walk + route         │
│  core/apply.py          /Alt write + independent read-back       │
│  core/render.py         figure region → PNG via pypdfium2        │
│  core/context.py        surrounding page text for LLM prompts    │
│  core/inspect.py        image XObject extraction                 │
│  core/wcag.py           12-rule WCAG 2.1 AA scorer               │
│  core/fixers.py         set_language / set_title / one_click     │
│  core/labels_write.py   AcroForm /TU writeback                   │
│  core/ocr_structure.py  build StructTreeRoot from OCR result     │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│ Ports (protocols)                                                │
│  ports/storage.py       put_bytes / get_bytes / presign_*        │
│  ports/job_store.py     put_document / put_job / list_documents  │
│  ports/alt_text.py      suggest(image_png, context) → Suggestion │
│  ports/ocr.py           start_job / poll / cancel / fetch_result │
│  ports/layout.py        detect(page_png) → [Region]              │
└──────────┬───────────────────────┬────────────────────────┬──────┘
           │                       │                        │
┌──────────▼──────────┐  ┌─────────▼──────────┐  ┌──────────▼──────┐
│ Local adapters      │  │ AWS adapters       │  │ Providers       │
│ (default, offline)  │  │ (opt-in via env)   │  │                 │
│                     │  │                    │  │                 │
│ storage_local       │  │ storage_s3         │  │ alt_text_stub   │
│ job_store_json      │  │ job_store_dynamo   │  │ alt_text_bedrock│
│                     │  │                    │  │ ocr_stub        │
│                     │  │                    │  │ ocr_textract    │
│                     │  │                    │  │ ocr_bedrock_vis │
│                     │  │                    │  │ layout_onnx_yolo│
└─────────────────────┘  └────────────────────┘  └─────────────────┘

Inventory module (deterministic, pure pypdf):
  inventory/src/classify_form.py     categorize a PDF
  inventory/src/recommend.py         Sac State rubric rule engine
  inventory/src/label_infer.py       3-tier missing-label recovery
```

**Design rule:** `service.py` and `core/` never import boto3. Which implementation is used is decided by `PDF_STORAGE_BACKEND`, `PDF_JOB_STORE`, `PDF_ALT_TEXT_PROVIDER`, `PDF_OCR_PROVIDER` env vars — so the same code runs locally against real AWS or fully offline.

---

## Frontend architecture pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│ App.tsx                                                            │
│  • view state ('dashboard' | 'library' | 'remediate')              │
│  • fetches persisted uploads from GET /pdf/documents               │
│  • merges uploaded + curated ABA corpus + 250-row DubBot sample    │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│ components/Banner.tsx           top nav (three-tab switcher)       │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌────────────────┐      ┌───────────────────┐    ┌────────────────────┐
│ DashboardPage  │      │ LibraryPage       │    │ RemediateFlow      │
│                │      │ (Review Queue)    │    │                    │
│ • metrics      │      │ • search          │    │ • upload / ingest  │
│ • upload +     │      │ • action pills    │    │ • WcagScorecard    │
│   auto-triage  │      │ • tag-status pills│    │ • Tag PDF button   │
│ • action bar   │      │ • signal pills    │    │ • Modernize button │
│ • dept cards   │      │ • department      │    │ • Remediate ALT    │
│                │      │   sidebar         │    │ • Infer Labels     │
│                │      │ • per-row review  │    │ • OCR review path  │
│                │      │ • CSV export      │    │ • download         │
└────────────────┘      └───────────────────┘    └─────────┬──────────┘
                                                           │
                                                 ┌─────────▼─────────┐
                                                 │ WcagScorecard.tsx │
                                                 │ • score tile      │
                                                 │ • severity pills  │
                                                 │ • findings by     │
                                                 │   severity        │
                                                 │ • per-rule fix    │
                                                 │   buttons         │
                                                 │ • before/after Δ  │
                                                 └───────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ lib/api.ts                                                         │
│  Typed client. Vite proxies /pdf and /api to :8000 in dev, so      │
│  same-origin, no CORS. Every backend endpoint has a typed method.  │
│    uploadDocument / ingestFromCorpus / createJob / analyze /       │
│    approve / apply / wcagCheckUpload / wcagCheckDocument /         │
│    tagDocument / modernizeDocument / inferLabels /                 │
│    createOcrJob / reconstructOcr / completeOcrReview               │
└────────────────────────────────────────────────────────────────────┘
```

---

## Getting started

### Offline mode (no AWS)

**Backend:**
```bash
cd backend
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
PYTHONPATH=src PDF_WORK_DIR=/tmp/ramp_work \
  python -m uvicorn pdf_remediation.api.app:app --port 8000
```

**Frontend:**
```bash
cd app && npm install && npm run dev   # http://localhost:5173
```

No `.env` needed — defaults ship stub alt-text, local filesystem storage, and JSON job store.

### With AWS (Bedrock + Textract + S3 + DynamoDB)

Create `backend/.env`:
```
PDF_STORAGE_BACKEND=s3
PDF_JOB_STORE=dynamo
PDF_ALT_TEXT_PROVIDER=bedrock
PDF_OCR_PROVIDER=textract
PDF_S3_BUCKET=<your-bucket>
PDF_DDB_TABLE=<your-table>
AWS_REGION=us-west-2
BEDROCK_MODEL_ID=us.anthropic.claude-haiku-4-5-20251001-v1:0
```

Then boot the same commands above. See the [`ExternalIntegration`](../../tree/ExternalIntegration) branch for adapter code and CDK infra.

### Tests

```bash
cd backend && source .venv/bin/activate && PYTHONPATH=src \
  pytest --ignore=tests/test_ocr_textract.py \
         --ignore=tests/test_routing_integration.py \
         --ignore=tests/test_layout_onnx_yolo.py \
         --ignore=tests/test_verify_accessibility.py \
         --ignore=tests/test_verify_layout.py
# 86 passed (offline)
```

---

## Repository layout

Each branch on this repo is a focused view of the codebase:

| Branch | Contents |
| --- | --- |
| [`main`](../../tree/main) | Full monorepo — everything, ready to clone and run |
| [`frontend`](../../tree/frontend) | React/TypeScript app only |
| [`backend`](../../tree/backend) | FastAPI service + inventory module (stub/local providers only) |
| [`ExternalIntegration`](../../tree/ExternalIntegration) | AWS adapters (Bedrock, Textract, S3, DynamoDB) + CDK infrastructure |

---

## Status

- **Alt-text engine:** shipped, verified end-to-end with Claude vision on real Bedrock
- **WCAG 2.1 AA checker:** 12 rules, offline
- **Modernize + Tag + Infer Labels:** shipped
- **Triage:** shipped (classify + recommend + auto-remediate on upload)
- **OCR reconstruction:** backend routes wired; UI branch exposed when scan routes to `OCR_RECONSTRUCTION`
- **Deployed AWS storage:** `StorageStack` (S3 + DynamoDB) in `us-west-2`
- **Backend Lambda:** not deployed yet — runs locally against real AWS or fully offline

---

## License

MIT — see [LICENSE](LICENSE).

---

Built for the ADA Title II deadline. Sole maintainer: **harbul**.
