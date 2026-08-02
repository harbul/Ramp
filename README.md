# Ramp

> The on-ramp to accessible, modern, compliant PDFs.

**Ramp** is the one app for the three problems every campus PDF library carries — **accessibility**, **modernization**, and **compliance**. Score any document against WCAG 2.1 AA, one-click modernize its structure and metadata, and review AI-drafted alt text, form labels, and rebuild paths before anything ships. Built for institutions racing the **ADA Title II deadline (April 2026)**.

---

## About

Campuses have thousands of legacy PDFs — flat forms, scanned handouts, untagged annual reports. Under ADA Title II, every one of them must be screen-reader-navigable. Doing this by hand does not scale. Ramp turns the backlog into a workflow:

- **See** where you stand — WCAG 2.1 AA score for every document, department-level roll-ups
- **Fix what's mechanical** — inject structure, set language and title, promote/repair headings, generate bookmarks, declare PDF/UA — in one click
- **Review what the AI drafted** — alt text (or mark a figure decorative), form-field labels, and modernization recommendations, with a human on every suggestion before it ships

Ramp runs against real AWS end to end: **Amazon Bedrock** (Claude vision) drafts alt text and powers OCR fallback, **Amazon Textract** reconstructs scanned documents, and **Amazon S3** + **DynamoDB** persist every PDF and job. Every provider also has a local/stub equivalent for offline dev with zero AWS dependencies — see the [Quick Start Guide](Docs/QUICKSTART.md).

**➡️ New here? Start with the [Quick Start Guide](Docs/QUICKSTART.md)** — AWS setup, backend, frontend, and the full API reference, step by step.

---

## Feature list

- **WCAG 2.1 Level AA scorecard** — 15-rule audit; per-rule severity, WCAG SC reference, and auto-fix action
- **Workbench** — every finding sorted into three sections by how it gets fixed:
  - **Modernization** (one click, no review) — inject structure tree, set `/Lang`, `/Title`, `/MarkInfo`, promote headings from font-size analysis, repair skipped heading levels, generate or repair a bookmark outline (docs over 10 pages), declare PDF/UA-1 metadata
  - **Remediation** (AI drafts, human reviews) — alt text and form-field labels, approved/edited/rejected per item before anything is written
  - **Compliance** (human-only) — findings Ramp can flag but can't safely auto-fix: color contrast, font Unicode mapping, table header rows
- **AI-suggested alt text** — Claude vision on Amazon Bedrock, structured `{alt_text, is_decorative}` via forced tool use
- **Decorative marking** — reviewer can mark a figure decorative instead of writing a description; writes an explicit empty `/Alt` so assistive tech skips it, distinct from a genuinely missing `/Alt`
- **Heading structure repair** — promotes font-size-based heading candidates when a tagged document has none, and renumbers any skipped levels (H1→H3) so navigation never breaks — both are tag-only edits that never touch visible content or formatting
- **Bookmark generation & repair** — builds a navigable outline from the document's heading structure for documents over 10 pages, and detects + rebuilds a bookmark outline whose entries no longer resolve to real pages (not just a missing one)
- **Tag PDF** — wrap image XObjects as `/Figure` structure elements on any untagged PDF
- **Reviewer alt-text editor** — 125-char counter, reject/edit/mark-decorative per figure, server-side length enforcement
- **Form-field label inference** — tier-1 humanize writes `/TU` tooltips for AcroForm fields lacking them (WCAG 4.1.2)
- **OCR reconstruction pipeline** — async Textract with TABLES/FORMS/LAYOUT/SIGNATURES; builds real `StructTreeRoot` with `H1`/`P`/`Figure` for scanned PDFs
- **Fix Issues (safe sandbox)** — Review Queue's per-row **Fix Issues** button clones the document before touching it, opens the clone in the Workbench, and never mutates the original row; the clone carries a `parent_doc_id` back to it
- **Triage engine** — deterministic form classifier (SCANNED / FLAT_NO_FIELDS / WELL_LABELED / NEEDS_REMEDIATION) + Sac State rubric recommendation (remediate / recreate / migrate / OK)
- **Process-signal detection** — flags forms that need a signature, external submission, workflow, or handle sensitive data
- **Review Queue** — filter the inventory by department, recommended action, tag status, and process signals; per-row review decision persisted in browser; CSV export
- **Live Sac State corpus** — 250 real PDFs sampled from the 2026 DubBot campus scan, plus the curated 90-form ABA-forms inventory
- **Dashboard** — estimated staff hours saved, action breakdown bar, department cards, upload-with-triage control
- **Verifiable writes** — every `/Alt` written (including decorative empty strings) is independently read back and compared before release
- **AWS-backed by default** — Amazon Bedrock (Claude vision), Textract, S3, and DynamoDB power the live deployment; every provider also has a local/stub equivalent for zero-dependency offline dev

---

## Application workflow

```
                       ┌─────────────────────────────────────┐
Upload PDF ──────────► │  1. WCAG 2.1 AA scan (15 rules)     │
                       │  2. Triage: classify + recommend    │
                       │  3. Route decision (ALT / OCR /     │
                       │     modernize / unsupported)        │
                       └──────────────────┬──────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              ▼                           ▼                           ▼
      ┌───────────────┐          ┌────────────────┐         ┌──────────────────┐
      │  Modernization│          │  Remediation   │         │  Reconstruct     │
      │  (unattended) │          │  (human review)│         │  (Textract OCR)  │
      │               │          │                │         │                  │
      │ • inject tags │          │ • AI drafts    │         │ • text + layout  │
      │ • set /Lang   │          │   alt text     │         │ • struct tree    │
      │ • set /Title  │          │ • reviewer     │         │ • figures + alt  │
      │ • promote/fix │          │   edits/rejects│         │ • table cells    │
      │   headings    │          │   /marks       │         │                  │
      │ • bookmarks   │          │   decorative   │         │                  │
      │ • PDF/UA-1    │          │ • server-side  │         │                  │
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
- Single-page app with tab-based routing (Dashboard / Review Queue / Workbench)
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

Ramp is built to run against these live — see the [Quick Start Guide](Docs/QUICKSTART.md) for AWS setup, IAM permissions, and every env var.

| Service | Purpose | Adapter |
| --- | --- | --- |
| Amazon Bedrock | Claude vision for alt-text suggestions and Bedrock-vision OCR fallback | `adapters/alt_text_bedrock.py`, `adapters/ocr_bedrock_vision.py` |
| Amazon Textract | Async multi-page OCR with TABLES / FORMS / LAYOUT / SIGNATURES | `adapters/ocr_textract.py` |
| Amazon S3 | Storage for original + remediated PDFs (presigned GET/PUT) | `adapters/storage_s3.py` |
| Amazon DynamoDB | Single-table job store (JOB# / DOC# partitioning) | `adapters/job_store_dynamo.py` |

All AWS adapters live on the [`ExternalIntegration`](../../tree/ExternalIntegration) branch. A local/stub equivalent of every adapter also ships on [`backend`](../../tree/backend), so the same code runs fully offline for dev with zero cloud dependencies — which set is active is a config choice (`PDF_STORAGE_BACKEND`, `PDF_JOB_STORE`, `PDF_ALT_TEXT_PROVIDER`, `PDF_OCR_PROVIDER`), not a code change.

---

## Backend architecture pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│ HTTP layer (FastAPI)                                             │
│  api/app.py         30 routes (upload, triage, jobs, wcag, tag,  │
│                     modernize, clone, infer-labels, ocr-jobs,    │
│                     download)                                    │
│  api/triage.py      classify + recommend + auto-remediate        │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│ Service orchestrator (single entry from API / CLI / Lambda)      │
│  service.RemediationService                                      │
│    register_document / analyze / approve / apply / download      │
│    tag_document / modernize / rescan / infer_labels              │
│    clone_document / create_ocr_job / reconstruct_ocr /           │
│    complete_ocr_review                                           │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────┐
│ Core (pure PDF logic, no I/O, no boto3)                          │
│  core/scan.py           tag status + figure walk + route         │
│  core/apply.py          /Alt write (incl. decorative) +          │
│                          independent read-back                   │
│  core/render.py         figure region → PNG via pypdfium2        │
│  core/context.py        surrounding page text for LLM prompts    │
│  core/inspect.py        image XObject extraction                 │
│  core/wcag.py           15-rule WCAG 2.1 AA scorer                │
│  core/fixers.py         set_language / set_title / one_click     │
│  core/headings.py       promote font-size headings + repair      │
│                          skipped levels (tag-only, content-safe) │
│  core/bookmarks.py      generate/repair outline from headings    │
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
│ AWS adapters        │  │ Local adapters     │  │ Providers       │
│ (default runtime)   │  │ (offline dev)      │  │                 │
│                     │  │                    │  │                 │
│ storage_s3          │  │ storage_local      │  │ alt_text_bedrock│
│ job_store_dynamo    │  │ job_store_json     │  │ alt_text_stub   │
│                     │  │                    │  │ ocr_textract    │
│                     │  │                    │  │ ocr_bedrock_vis │
│                     │  │                    │  │ ocr_stub        │
│                     │  │                    │  │ layout_onnx_yolo│
└─────────────────────┘  └────────────────────┘  └─────────────────┘

Inventory module (deterministic, pure pypdf):
  inventory/src/classify_form.py     categorize a PDF
  inventory/src/recommend.py         Sac State rubric rule engine
  inventory/src/label_infer.py       3-tier missing-label recovery
```

**Design rule:** `service.py` and `core/` never import boto3. Which implementation is used is decided by `PDF_STORAGE_BACKEND`, `PDF_JOB_STORE`, `PDF_ALT_TEXT_PROVIDER`, `PDF_OCR_PROVIDER` env vars — so the same code runs against real AWS or fully offline, with no code change either way. See the [Quick Start Guide](Docs/QUICKSTART.md) for wiring up the AWS side.

---

## Frontend architecture pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│ App.tsx                                                            │
│  • view state ('dashboard' | 'library' | 'remediate' internally,   │
│    labelled Dashboard / Review Queue / Workbench in the UI)        │
│  • fetches persisted uploads from GET /pdf/documents               │
│  • merges uploaded + curated ABA corpus + 250-row DubBot sample    │
│  • accepts a Workbench "target" (docId / sourceUrl / corpus ref)   │
│    so Review Queue's Fix Issues button can hand off a specific doc │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│ components/Banner.tsx     Ramp wordmark (left) · nav (center) ·    │
│                           Sac State name + seal (right)            │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
┌────────────────┐      ┌───────────────────┐    ┌────────────────────┐
│ DashboardPage  │      │ LibraryPage       │    │ RemediateFlow      │
│                │      │ (Review Queue)    │    │ (Workbench)        │
│ • metrics      │      │ • search          │    │ • upload / ingest  │
│ • upload +     │      │ • dropdown filters│    │ • Find Issues →    │
│   auto-triage  │      │   (action / tag / │    │   WcagHeaderStrip  │
│ • action bar   │      │   process signal) │    │ • 3 sectioned      │
│ • dept cards   │      │ • department      │    │   findings cards   │
│                │      │   sidebar         │    │ • decorative       │
│                │      │ • per-row review  │    │   alt-text toggle  │
│                │      │ • Fix Issues      │    │ • PdfPreviewModal  │
│                │      │   (clone → open   │    │ • download         │
│                │      │   in Workbench)   │    │                    │
│                │      │ • CSV export      │    │                    │
└────────────────┘      └───────────────────┘    └─────────┬──────────┘
                                                           │
                                                 ┌─────────▼─────────┐
                                                 │ WorkbenchLayout.  │
                                                 │ tsx               │
                                                 │ • WcagHeaderStrip │
                                                 │   (score, fix-all)│
                                                 │ • IssueSectionCard│
                                                 │   ×3: Moderniza-  │
                                                 │   tion / Remedia- │
                                                 │   tion / Compli-  │
                                                 │   ance            │
                                                 │ • SectionSuccess  │
                                                 │   (post-fix recap)│
                                                 └───────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ lib/api.ts                                                         │
│  Typed client. Vite proxies /pdf and /api to :8000 in dev, so      │
│  same-origin, no CORS. Every backend endpoint has a typed method.  │
│    uploadDocument / ingestFromCorpus / cloneDocument / createJob / │
│    analyze / approve(…, decorative) / apply / wcagCheckUpload /    │
│    wcagCheckDocument / tagDocument / modernizeDocument /           │
│    inferLabels / createOcrJob / reconstructOcr /                  │
│    completeOcrReview                                               │
└────────────────────────────────────────────────────────────────────┘
```

---

## Getting started

**➡️ Full step-by-step instructions — AWS resource setup, backend, frontend, every API route, tests, troubleshooting — live in the [Quick Start Guide](Docs/QUICKSTART.md).** The condensed version:

### AWS-backed (recommended)

```bash
# 1. Deploy storage (one-time) — see Docs/QUICKSTART.md §3 for the full walkthrough
cd infra && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt && cdk bootstrap
APP_NAME=ramp DEPLOY_ENV=prod cdk deploy RampStorage

# 2. Backend
cd ../backend
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # fill in your bucket/table/region — see the file for every var
PYTHONPATH=src python -m uvicorn pdf_remediation.api.app:app --port 8000

# 3. Frontend
cd ../app && npm install && npm run dev   # http://localhost:5173
```

### Offline mode (no AWS account)

```bash
cd backend
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
PYTHONPATH=src PDF_WORK_DIR=/tmp/ramp_work \
  python -m uvicorn pdf_remediation.api.app:app --port 8000
```

No `.env` needed — with none present, defaults ship stub alt-text, local filesystem storage, and a JSON job store.

```bash
cd app && npm install && npm run dev   # http://localhost:5173
```

### Tests

```bash
cd backend && source .venv/bin/activate && PYTHONPATH=src \
  pytest --ignore=tests/test_ocr_textract.py \
         --ignore=tests/test_routing_integration.py \
         --ignore=tests/test_layout_onnx_yolo.py \
         --ignore=tests/test_verify_accessibility.py \
         --ignore=tests/test_verify_layout.py
# 86 passed (offline, no AWS calls, no cost)
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

- **Alt-text engine:** shipped, verified end-to-end with Claude vision on real Bedrock, including decorative marking (explicit empty `/Alt`)
- **WCAG 2.1 AA checker:** 15 rules
- **Modernize + Tag + Infer Labels:** shipped, including heading promotion/repair and bookmark generation/repair
- **Fix Issues (clone-based sandbox):** shipped — Review Queue can open any document in the Workbench without touching the original row
- **Triage:** shipped (classify + recommend + auto-remediate on upload)
- **OCR reconstruction:** backend routes wired; UI branch exposed when scan routes to `OCR_RECONSTRUCTION`
- **AWS storage:** `StorageStack` (S3 + DynamoDB) deployable via CDK — see [Quick Start Guide](Docs/QUICKSTART.md)
- **Backend Lambda:** not deployed yet — the FastAPI service runs locally (or on any host that can reach AWS) against real Bedrock/Textract/S3/DynamoDB

---

## License

MIT — see [LICENSE](LICENSE).

---

Built for the ADA Title II deadline. Sole maintainer: **harbul**.
