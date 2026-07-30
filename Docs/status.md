# Project Status & Handoff - CSUS PDF Modernization Assistant

**Sacramento State · CSUS PDF Modernization Assistant**
_Last updated: July 17, 2026_

Single source of truth for the project's current state: what it does, what is
built and verified, what is still a prototype, how to run it, and what comes
next. Read this first when picking up the project.

---

## 1. What the project is

A web app that helps Sacramento State scale up PDF accessibility remediation
ahead of the **ADA Title II deadline (April 2026)**. It has **three tabs** over one
campus form inventory, sharing a single FastAPI backend:

1. **Dashboard** (landing) - a campus-wide accessibility overview: key metrics
   (estimated staff time saved, forms in inventory, need remediation, already
   accessible), a recommended-action breakdown, a department summary, and an
   **upload control** that runs the triage pipeline on a new PDF.

2. **Review Queue** - every form (the analyzed 90-form corpus plus live uploads),
   each with its recommended action, filters (search, action, department), an
   expandable detail panel (rationale, work items, migration destination,
   signals), a per-form **review decision** (To review / Approved / Flagged,
   saved in the browser), and CSV export of decisions. Forms whose images can be
   described carry a **Remediate alt text** button that opens the Remediate tab
   on that form.

3. **Remediate** - the interactive alt-text flow: upload a PDF (or arrive from a
   Review Queue form), review each AI-suggested description, edit it, then apply
   and download the remediated file. Of the 90 corpus forms, 10 contain
   extractable images the model can describe; only those show the queue button.

Behind these sit two engines:
- **Triage** (`classify -> recommend`): categorizes a form and recommends an
  action (remediate / recreate / migrate / no action) using the Sacramento State
  governance rubric.
- **Alt-text remediation**: finds images missing alternative text in *tagged*
  PDFs, generates alt text with Claude (vision) on Amazon Bedrock, and writes it
  back where a screen reader can read it. On upload this runs **unattended**
  (auto-approve) for tagged PDFs with images.

---

## 2. User flows

**Upload (Dashboard):**
```
Upload PDF -> classify + recommend -> (if tagged + images) auto alt-text
  -> persisted to S3 + DynamoDB -> appears in the inventory (survives reload)
```

**Review (Review Queue):**
```
Browse all forms -> filter/search -> open a form's detail
  -> record a review decision -> export decisions as CSV
```

**Remediate (interactive):**
```
Remediate tab: upload a PDF          ─┐
Review Queue: click Remediate alt text ┘ (ingested from corpus bucket, no re-upload)
  -> scan -> Claude alt-text suggestions -> edit -> apply -> download remediated PDF
```

Dashboard-upload remediation is **unattended** (the common "tagged PDF, missing
alt text" case is auto-fixed). The **Remediate** tab is the human-in-the-loop
version of the same pipeline (`RemediateFlow.tsx`, now wired): the reviewer sees
and edits each suggestion before applying. The Review Queue's per-form decisions
are separately about the *recommendation*, not per-image text. (`WorkspacePage.tsx`,
the older fixture-driven review mock, remains unwired.)

---

## 3. Repository map

```
app/          React + TypeScript frontend (Vite). Tabs: Dashboard + Review Queue + Remediate.
  src/App.tsx                        three-view app; fetches + merges persisted uploads
  src/components/DashboardPage.tsx    overview metrics + upload/triage control
  src/components/LibraryPage.tsx      the Review Queue (full inventory + decisions + Remediate button)
  src/components/RemediateFlow.tsx    interactive alt-text flow (upload/ingest -> review -> apply -> download)
  src/components/Banner.tsx           top nav (Dashboard / Review Queue / Remediate)
  src/dashboardData.ts                static 90-form corpus results (analyzed data)
  src/lib/inventory.ts                fetch /pdf/documents + map to inventory items
  src/lib/corpusRemediable.ts         the 10 corpus forms with describable images (queue button gate)
  src/lib/useInView.ts                scroll-reveal hook (IntersectionObserver)
  src/styles.css                      design tokens + all component styles
  vite.config.ts                      dev proxy: /pdf and /api -> :8000
  (legacy, in-repo but NOT wired into the app: WorkspacePage,
   CompletePage, Steps, data.ts, lib/remediation.ts, lib/pdf.ts)

backend/      Python FastAPI service (ports/adapters; core never imports boto3)
  src/pdf_remediation/
    models.py        domain types incl. Document + TriageInfo (persisted metadata)
    core/            scan, render, inspect, context, apply, verify (alt-text engine)
    ports/ adapters/ storage (local|s3), job store (json|dynamo), alt-text (stub|bedrock)
    service.py       orchestration: register -> analyze -> approve -> apply
    api/app.py       FastAPI routes (incl. POST /pdf/triage, GET /pdf/documents,
                     POST /pdf/documents/from-corpus for in-queue remediation)
    api/triage.py    triage pipeline + process-need signal detection + persistence
    config.py        Settings.from_env(); loads backend/.env (dev) via python-dotenv
    cli.py           local CLI (scan / analyze / apply)
  .env               local dev config (gitignored): points at deployed S3/DynamoDB
  tests/             86 offline alt-text/triage tests (green) + in-progress OCR
                     tests (currently failing) + 1 opt-in live Bedrock test

inventory/    Deterministic form-classification module (pypdf-only)
  src/classify_form.py   categorize a PDF (SCANNED/FLAT_NO_FIELDS/WELL_LABELED/NEEDS_REMEDIATION)
  src/recommend.py       rule engine -> recommended action + work items (Sac State rubric)
  src/label_infer.py     3-tier missing-label inference (name / geometry / AI)

infra/        AWS CDK
  stacks/storage_stack.py   StorageStack: S3 + DynamoDB (DEPLOYED)
  stacks/backend_stack.py   BackendStack: Lambda + API GW + S3 + DynamoDB (NOT deployed)
  stacks/frontend_stack.py  FrontendStack: S3 + CloudFront (NOT deployed)

.kiro/skills/  Vendored taste-skill design guidance (redesign + minimalist)
Docs/          status.md (this file), challenge_overview.md
```

---

## 4. Architecture

```
Frontend (React + TS)          Backend (Python)              AWS (deployed, us-west-2)
─────────────────────          ────────────────              ────────────────────────
Dashboard + Review Queue   ->  FastAPI  ->  service.py   ->  Bedrock (Claude vision)
upload -> POST /pdf/triage       │  triage.py             ->  S3   (csus-pdf-assistant-pdfs-prod)
fetch  -> GET  /pdf/documents    │  + inventory module        DynamoDB (csus-pdf-assistant-jobs-prod)
                               CLI ┘  (local dev)
```

The design rule that makes this work: **the core (`service.py` + `core/`) never
imports boto3 and never knows what a Lambda is.** Storage, the job store, and the
alt-text provider are interfaces (`ports/`) with swappable implementations
(`adapters/`) - local disk / JSON / stub for offline dev, S3 / DynamoDB / Bedrock
for the cloud. Which set is used is decided by env vars (`backend/.env`), so the
same code runs locally against real AWS.

### How a figure becomes alt text
1. **Scan** the structure tree - classify TAGGED / UNTAGGED / TAGGED_NO_FIGURES,
   count figures missing alt (no model calls). This is why a file with 24,000 raw
   image fragments still yields only its handful of real figures.
2. **Render** each figure's real page region (`/A /BBox`) with pypdfium2 -
   captures composite figures (several image tiles) and vector art, rotation handled.
3. **Suggest** alt text: send the figure image + surrounding page text to Claude,
   which returns structured `{alt_text, is_decorative}` via forced tool use.
4. **Write** `/Alt` onto the `/Figure` with pikepdf, then **verify by reading it
   back** (matched on page + marked-content id, which survives PDF save). If
   verification fails, the file is not released.

### Tech stack
| Concern | Choice | Note |
| --- | --- | --- |
| PDF structure read/write | pikepdf (MPL-2.0) | the only lib that can set `/Alt` |
| Figure rendering | pypdfium2 (BSD/Apache) | renders a figure's real region |
| Page text | pdfplumber (MIT) | context for the LLM |
| Form classification | pypdf (BSD) | fields, `/TU` labels - pure, no system deps |
| Images | Pillow (MIT) | downscale to model limits |
| LLM | Amazon Bedrock - Claude (vision) | Anthropic SDK, forced tool use |
| API | FastAPI (local); Lambda + API Gateway planned | same routes both places |
| Storage / jobs | S3 + DynamoDB (deployed via StorageStack) | one bucket, prefix per job |
| Frontend | React + TypeScript + Vite | |

**PyMuPDF is deliberately excluded** - nicest extraction API but AGPL-3.0 (or paid),
and AGPL's network clause would attach to a hosted campus service. Everything
above is permissively licensed.

---

## 5. What is done and verified

- **Alt-text engine**: scan/classify, figure rendering, Bedrock suggestion,
  `/Alt` write-back with independent read-back verification, untagged-PDF refusal.
- **Bedrock is real**: verified live in `us-west-2` via the `AnthropicBedrock`
  client + cross-region inference profile (`us.` prefix) + forced tool use.
- **Triage pipeline** (`POST /pdf/triage`): scan + classify + recommend, plus
  process-need signal detection (signature / workflow / external / sensitive
  data), so **migrate / recreate / remediate all fire on live uploads** - verified
  (e.g. `missing-receipt-affidavit.pdf` -> migrate to Adobe Acrobat Sign).
- **Auto alt-text on upload**: for tagged PDFs with images, `analyze -> approve
  -> apply` runs unattended and produces a downloadable remediated PDF (verified
  with real Claude alt text written into the file).
- **S3 + DynamoDB deployed and used** (StorageStack, us-west-2). The running app
  writes originals + remediated PDFs to S3 and documents to DynamoDB. Verified
  with a live round-trip.
- **Persistence**: classification + recommendation + signals + remediated-PDF link
  are stored on the `Document` (`TriageInfo`) and returned by `GET /pdf/documents`.
  Uploads **survive a reload** (frontend fetches persisted docs and merges them
  ahead of the static corpus). Verified end to end.
- **Frontend**: three-tab app (Dashboard landing + Review Queue + Remediate) with
  a minimalist editorial redesign on the Sac State palette; builds and typechecks clean.
- **In-queue remediation**: `POST /pdf/documents/from-corpus` fetches a listed
  form from the corpus bucket and runs the same pipeline (no re-upload). Verified
  end to end with real Bedrock (corpus form -> Claude alt text -> applied ->
  downloadable PDF). The frontend gates the button to the 10 forms that actually
  yield extractable images (route `ALT_TEXT_REMEDIATION` alone overcounts, since
  some tagged figures are vector art with no pixels to send the model).
- **Tests (current):** the alt-text/triage suite passes offline (86 tests, no AWS)
  via `pytest --ignore=tests/test_ocr_textract.py --ignore=tests/test_routing_integration.py`.
  A bare `pytest` is currently red: an in-progress OCR-feature merge added ~19
  tests that fail because their async test setup is not wired up yet (they are
  unrelated to the alt-text/triage path). Plus 1 opt-in live Bedrock test.

---

## 6. What is prototype / not yet production

Be blunt so nobody demos a claim the code can't back up:

1. **Backend API is not deployed.** The app runs the FastAPI backend **locally**
   against the deployed S3/DynamoDB/Bedrock. `BackendStack` (Lambda + API Gateway)
   is not deployed - it needs the Lambda runtime fixed (it targets a nonexistent
   Python 3.14 runtime) and real dependency bundling (its `from_asset("../backend/src")`
   ships source without dependencies).
2. **No authentication** on any endpoint.
3. **Form-label remediation is detection-only.** Missing `/TU` labels are reported
   and `label_infer` tiers exist, but nothing writes labels back. Only alt text is
   applied. (This is why a `remediate_in_place` form's actual label fix is still a
   manual/tooling task.)
4. **Untagged PDFs are refused by design** (flagged `recreate_accessible_pdf`) -
   writing `/Alt` into an untagged file would look fixed but read empty to a
   screen reader. This is the gap the cal-poly Textract pipeline would fill.
5. **Triage runs synchronously.** Fine locally; Bedrock vision calls can exceed
   API Gateway's 29s limit under load - a deployed backend should move analyze/apply
   to a worker Lambda (202 + poll).
6. **The 90-form corpus is static** (`app/src/dashboardData.ts`); only live uploads
   come from the backend. Serving the whole inventory from the backend is future work.
7. **Temporary AWS credentials.** Dev uses SSO STS creds in `~/.aws/credentials`;
   when they expire, S3/DynamoDB/Bedrock calls fail until refreshed.
8. **The human-in-the-loop alt-text review UI** (`WorkspacePage`) is not wired into
   the current app; upload-time remediation is unattended.

---

## 7. How to run locally

`backend/.env` (gitignored) already points the backend at the deployed S3 +
DynamoDB + Bedrock and is auto-loaded by `config.py`, so no exports are needed:

```bash
# Backend (from backend/, .env is picked up automatically)
cd backend && PYTHONPATH=src python -m uvicorn pdf_remediation.api.app:app --port 8000

# Frontend
cd app && npm install && npm run dev   # http://localhost:5173 (proxies /pdf, /api to :8000)
```

To run **fully offline** (no AWS), edit `backend/.env`: set
`PDF_ALT_TEXT_PROVIDER=stub`, `PDF_STORAGE_BACKEND=local`, `PDF_JOB_STORE=json`.

**Tests:**
```bash
cd backend && export PYTHONPATH=src
pytest --ignore=tests/test_ocr_textract.py --ignore=tests/test_routing_integration.py  # 86, offline (OCR tests in progress)
cd app && npm run typecheck && npm run build
```

---

## 8. Environment & AWS

Deployed resources (us-west-2, account `<account-id>`, via `StorageStack`):
- S3 bucket: `csus-pdf-assistant-pdfs-prod`
- DynamoDB table: `csus-pdf-assistant-jobs-prod` (partition key `pk`, matching the adapter)

`backend/.env` keys:
| Var | Value (dev) | Purpose |
| --- | --- | --- |
| `PDF_STORAGE_BACKEND` | `s3` | `local` or `s3` |
| `PDF_JOB_STORE` | `dynamo` | `json` or `dynamo` |
| `PDF_S3_BUCKET` | `csus-pdf-assistant-pdfs-prod` | |
| `PDF_DDB_TABLE` | `csus-pdf-assistant-jobs-prod` | |
| `PDF_CORPUS_BUCKET` | `dxhub-camp-2026-csus-pdf-modern-assistant` | source of the 90-form corpus (in-queue remediation) |
| `PDF_CORPUS_PREFIX` | `data/csus-aba-forms` | key prefix under the corpus bucket |
| `PDF_ALT_TEXT_PROVIDER` | `bedrock` | `stub` (offline) or `bedrock` |
| `BEDROCK_MODEL_ID` | `us.anthropic.claude-haiku-4-5-20251001-v1:0` | cross-region profile |
| `AWS_REGION` | `us-west-2` | |
| `AWS_PROFILE` | (SSO profile) | boto3 resolves creds from `~/.aws` |

Bedrock needs Claude model access in `us-west-2` and the cross-region inference
profile (`us.` prefix), not the bare model id. **Never commit credentials.**

---

## 9. Prioritized next steps

1. **Deploy the backend API.** Fix `BackendStack` (real Lambda runtime + dependency
   bundling or a layer; move analyze/apply to a worker Lambda), and refactor it to
   **import** the StorageStack bucket/table rather than recreate them (name collision).
2. **Serve the 90-form inventory from the backend** instead of static data.
3. **Form-label write-back** using the `label_infer` tiers (currently detection-only).
4. **Untagged / recreate path**: evaluate integrating
   `cal-poly-dxhub/pdf-accessibility` (Textract tagging + PDF/UA-2 + VeraPDF).
5. **AuthN/Z** before any shared/hosted deployment.
6. **Frontend deploy** (FrontendStack) once the API is deployed.

---

## 10. Git state

Active branch: `nnguyen/remediate-dxhub-pipeline` (off `origin/main`). The
review-queue / dashboard-landing / minimalist-redesign / StorageStack / persistence
work merged to `main` via PR #13.

This branch adds the **Remediate** tab (recovered `RemediateFlow`, wired to the
backend) and **in-queue remediation** (`POST /pdf/documents/from-corpus`),
committed in two area-grouped commits (backend, frontend). `backend/.env` stays
uncommitted (gitignored); `PDF_CORPUS_BUCKET` must be set there for the queue
Remediate button to work.
