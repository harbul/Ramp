# Ramp — Quick Start Guide

Everything you need to get Ramp running end to end: AWS resources, backend,
frontend, and the full API surface. This guide assumes you have (or can get)
AWS account access and are wiring Ramp up against real Amazon Bedrock,
Textract, S3, and DynamoDB — that's the intended, fully-featured way to run
it. If you just want to click around locally with no AWS account, skip to
[Offline mode](#offline-mode-no-aws-account) at the end.

---

## 1. Prerequisites

| Tool | Version | Used for |
| --- | --- | --- |
| Python | 3.13+ (3.14 recommended) | Backend (FastAPI service) |
| Node.js | 20+ | Frontend (Vite + React) |
| npm | bundled with Node | Frontend package management |
| AWS CLI v2 | latest | Deploying storage, configuring credentials |
| AWS CDK CLI | latest (`npm install -g aws-cdk`) | Deploying the S3 + DynamoDB storage stack |
| An AWS account | — | Bedrock, Textract, S3, DynamoDB |
| git | any recent | Cloning the repo |

You'll also need:
- **Bedrock model access** for Claude (vision) enabled in your target region
  (defaults below assume `us-west-2`). Request access in the Bedrock console
  under *Model access* if you haven't already — it's a one-time, per-account
  approval and is usually instant for Anthropic models.
- **AWS credentials** available locally, either via `aws configure` (access
  key + secret) or an SSO profile (`aws configure sso`). Ramp's backend never
  reads or stores credentials itself — it hands everything to the AWS SDK's
  standard credential chain.

---

## 2. Clone the repo

Ramp's GitHub repo is split into four branches, each a focused view of the
codebase:

| Branch | Contents | Use it when |
| --- | --- | --- |
| `main` | Full monorepo (frontend + backend + AWS adapters + CDK infra) | You want everything in one clone (this guide assumes `main`) |
| `frontend` | React/TypeScript app only | You only touch the UI |
| `backend` | FastAPI service + inventory module, stub/local providers only | You only touch backend logic and don't need AWS adapter code in your working tree |
| `ExternalIntegration` | AWS adapters (Bedrock, Textract, S3, DynamoDB) + CDK infra | You only touch cloud integration code |

```bash
git clone <your-fork-or-origin-url> ramp
cd ramp
```

The rest of this guide assumes you're on `main`.

---

## 3. Set up AWS resources

Ramp needs three things from AWS: an S3 bucket (PDF storage), a DynamoDB
table (job/document state), and Bedrock model access (alt-text + OCR). The
repo ships CDK for the first two.

### 3.1 Bootstrap CDK (one-time per AWS account + region)

```bash
cd infra
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cdk bootstrap
```

### 3.2 Deploy the storage stack

```bash
APP_NAME=ramp DEPLOY_ENV=prod AWS_REGION=us-west-2 cdk deploy RampStorage
```

This creates:
- an **S3 bucket** (`ramp-pdfs-prod`) — encrypted, versioned, all-public-access
  blocked, with a lifecycle rule moving job assets to Intelligent-Tiering
- a **DynamoDB table** (`ramp-jobs-prod`) — on-demand billing, point-in-time
  recovery on, single partition key `pk` (the adapter stores `JOB#<id>` and
  `DOC#<id>` rows in one table)

Both resources use `RemovalPolicy.RETAIN`, so `cdk destroy` won't delete your
data — remove them manually via the console/CLI when you're done.

Note the bucket and table names from the stack output (or the pattern
`{APP_NAME}-pdfs-{DEPLOY_ENV}` / `{APP_NAME}-jobs-{DEPLOY_ENV}`) — you'll need
them for `backend/.env` in step 4.

### 3.3 Enable Bedrock model access

In the AWS Console: **Bedrock → Model access → Manage model access**, enable
the Anthropic Claude models in your region. Ramp calls Bedrock through the
Anthropic SDK's Bedrock client using a **cross-region inference profile**
(the `us.` prefix on the model id, e.g. `us.anthropic.claude-opus-4-8`) — the
bare model id is rejected by the inference API, so don't drop the prefix.

### 3.4 IAM permissions

Whatever credentials the backend runs with (a local profile for dev, an
execution role once it's deployed) need:

```
s3:GetObject, s3:PutObject, s3:DeleteObject   on arn:aws:s3:::ramp-pdfs-prod/*
s3:ListBucket                                  on arn:aws:s3:::ramp-pdfs-prod
dynamodb:GetItem, PutItem, UpdateItem,
  DeleteItem, Query, Scan                      on the ramp-jobs-prod table
bedrock:InvokeModel                            on the Claude model / inference profile
textract:StartDocumentAnalysis,
  textract:GetDocumentAnalysis                 (only if using Textract OCR)
```

The `PDF_CORPUS_BUCKET` feature (remediating a listed form without
re-uploading it) additionally needs read-only `s3:GetObject` on that bucket —
leave it unset if you don't have a corpus bucket; the endpoint safely 404s.

---

## 4. Backend setup

```bash
cd backend
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

cp .env.example .env
# edit .env: fill in your bucket/table names from step 3, region, and
# (optionally) a named AWS profile if you use SSO
```

`backend/.env.example` is checked in as the reference template — every
variable it lists is explained inline. The important ones:

| Variable | Set to | Purpose |
| --- | --- | --- |
| `PDF_STORAGE_BACKEND` | `s3` | Store PDFs in the S3 bucket from step 3 |
| `PDF_JOB_STORE` | `dynamo` | Store job/document state in DynamoDB |
| `PDF_ALT_TEXT_PROVIDER` | `bedrock` | Claude vision drafts alt text |
| `PDF_OCR_PROVIDER` | `textract` | Async multi-page OCR for scanned PDFs |
| `PDF_S3_BUCKET` | your bucket name | e.g. `ramp-pdfs-prod` |
| `PDF_DDB_TABLE` | your table name | e.g. `ramp-jobs-prod` |
| `AWS_REGION` | your region | e.g. `us-west-2` |
| `BEDROCK_MODEL_ID` | cross-region profile id | e.g. `us.anthropic.claude-opus-4-8` |

Run the API:

```bash
PYTHONPATH=src python -m uvicorn pdf_remediation.api.app:app --port 8000
```

Confirm it's up:

```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

`config.py` auto-loads `backend/.env` via `python-dotenv` when you run
uvicorn from `backend/` — no manual `export` needed.

---

## 5. Frontend setup

```bash
cd app
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxies `/pdf/*` and `/api/*` to the
backend on `:8000` (see `vite.config.ts`), so it's same-origin in dev — no
CORS configuration needed.

Other frontend commands:

```bash
npm run typecheck   # tsc --noEmit
npm run build        # production build (tsc -b && vite build)
```

---

## 6. Verify the whole pipeline

1. Open the app, go to **Dashboard**, click **Analyze new PDF**, and upload
   any PDF. This runs the full triage pipeline (classify → recommend →
   auto-remediate) and, if the PDF is tagged with images, drafts real alt
   text with Bedrock.
2. Go to **Review Queue**, find the row you just uploaded, click the eye icon
   to preview it, or **Fix Issues** to open it in the **Workbench**.
3. In the Workbench, click **Find Issues** to run the WCAG 2.1 AA scan.
   You'll see three sections:
   - **Modernization** — one-click deterministic fixes (tag structure,
     `/Lang`, `/Title`, PDF/UA metadata, heading promotion/repair, bookmarks)
   - **Remediation** — AI-drafted alt text, reviewed and edited per figure
     before it's applied (or marked **decorative**, which writes an explicit
     empty `/Alt` so screen readers skip it)
   - **Compliance** — findings that need a human decision Ramp can't automate
     (color contrast, font encoding, table headers without a header row)
4. Apply fixes, then **Download PDF** and confirm the fixes landed.

If step 1 fails with a Bedrock error, double check model access is enabled
in the right region (step 3.3) and your credentials can reach it
(`aws bedrock list-foundation-models --region us-west-2` is a quick sanity
check independent of Ramp).

---

## 7. Full API reference

All routes are under the FastAPI app in `backend/src/pdf_remediation/api/app.py`.
The frontend's typed client (`app/src/lib/api.ts`) wraps every one of these.
Request/response bodies are camelCase on the wire; the backend converts to/from
Python's snake_case at the edge.

### Documents & triage

| Method & path | Body | Returns | What it does |
| --- | --- | --- | --- |
| `GET /pdf/documents` | — (query: `tagStatus`, `department`, `q`, `route`) | `{ documents: [...] }` | List/filter the document inventory |
| `GET /api/dashboard/stats` | — | rollup counts + estimated hours saved | Dashboard summary numbers |
| `POST /pdf/documents` | multipart: `file`, `department` | `{ document, scan }` | Upload + scan a PDF (no triage) |
| `POST /pdf/documents/from-corpus` | `{ department, file }` | `{ document, scan }` | Register a listed corpus form by fetching it from S3, no re-upload |
| `POST /pdf/triage` | multipart: `file`, `department` | triage result (classification + recommendation + signals + auto-remediation) | The main upload path: classify → recommend → auto-fix alt text if eligible |
| `POST /pdf/documents/{docId}/clone` | — | `{ document, scan }` | Copy a document to a new id so the Workbench can fix it without mutating the original row (used by Review Queue's **Fix Issues**) |
| `GET /pdf/documents/{docId}/original.pdf` | — (query: `download=1` forces attachment) | PDF bytes | Stream the current stored bytes (post-fix if fixed); default `inline` so it renders in a preview `<iframe>` |
| `GET /pdf/routes` | — | `{ routes, unsupportedReasons }` | Enum values for frontend filters |
| `GET /health` | — | `{ status: "ok" }` | Liveness check |

### Alt-text jobs (Remediation)

| Method & path | Body | Returns | What it does |
| --- | --- | --- | --- |
| `POST /pdf/jobs` | `{ docId }` | `{ job }` | Create a job; 422s `NOT_TAGGED` up front if the PDF has no structure tree |
| `GET /pdf/jobs/{jobId}` | — | `{ job }` | Poll while `status` is `ANALYZING` or `APPLYING` |
| `POST /pdf/jobs/{jobId}/analyze` | — | `{ job }` (202) | Kicks off Bedrock alt-text drafting in the background |
| `POST /pdf/jobs/{jobId}/alt-text/{issueId}/approve` | `{ approved, altText?, decorative? }` | `{ issue }` | Reviewer approves/edits/rejects one figure's alt text, or marks it decorative (writes an explicit empty `/Alt`) |
| `POST /pdf/jobs/{jobId}/apply` | — | `{ job }` (202) | Writes every approved `/Alt` into the PDF, then independently reads each one back to verify it survived the save |
| `GET /pdf/jobs/{jobId}/issues/{issueId}/image` | — | PNG bytes | The rendered figure, so the reviewer sees what the AI saw |
| `GET /pdf/jobs/{jobId}/remediated.pdf` | — | PDF bytes (attachment) | Stream the finished file directly |
| `GET /pdf/jobs/{jobId}/download` | — | `{ downloadUrl, filename, expiresIn }` | Presigned S3 URL (efficient path when storage backend is `s3`) |

### OCR reconstruction jobs (scanned PDFs)

| Method & path | Body | Returns | What it does |
| --- | --- | --- | --- |
| `POST /pdf/ocr-jobs` | `{ docId }` | `{ job }` | Create an OCR job — unlike alt-text jobs, this accepts untagged scanned PDFs |
| `GET /pdf/ocr-jobs/{jobId}` | — | `{ job }` | Poll job status/progress |
| `POST /pdf/ocr-jobs/{jobId}/reconstruct` | — | `{ job }` (202) | Runs Textract (TABLES/FORMS/LAYOUT/SIGNATURES), builds a real `StructTreeRoot` with `H1`/`P`/`Figure` elements |
| `GET /pdf/ocr-jobs/{jobId}/preview` | — | `{ preview }` | Extracted text regions + detected images, for reviewer sign-off before finalizing |
| `POST /pdf/ocr-jobs/{jobId}/review-complete` | — | `{ job }` (202) | Marks the reconstruction reviewed and finalizes the document |
| `GET /pdf/ocr-jobs/{jobId}/images/{imageId}` | — | PNG bytes | A detected image for review |
| `GET /pdf/ocr-jobs/{jobId}/reconstructed.pdf` | — | PDF bytes (attachment) | Stream the reconstructed file directly |
| `GET /pdf/ocr-jobs/{jobId}/download` | — | `{ downloadUrl, filename, expiresIn }` | Presigned S3 URL |

### WCAG scoring & one-click fixes

| Method & path | Body | Returns | What it does |
| --- | --- | --- | --- |
| `POST /pdf/wcag/check` | multipart: `file` | `WcagReport` | Score an uploaded PDF without persisting it |
| `GET /pdf/documents/{docId}/wcag` | — | `WcagReport` | Score a registered document's current stored bytes (15-rule WCAG 2.1 AA audit — see [README](../README.md#feature-list) for the rule catalog) |
| `POST /pdf/documents/{docId}/tag` | — | `{ scan, message }` | Inject a structure tree into an untagged PDF (wraps images as `/Figure`, sets `/MarkInfo`) |
| `POST /pdf/documents/{docId}/modernize` | — | `{ actions, before, after, scan }` | One-click **Modernization**: tag (if needed), `/Lang`, `/Title`, promote/repair headings, generate/repair bookmarks (docs > 10 pages), declare PDF/UA-1 — all deterministic, no AI, no content changes |
| `POST /pdf/documents/{docId}/infer-labels` | — | `{ labelsWritten, writes: [...] }` | Writes `/TU` tooltip labels onto AcroForm fields that are missing one (WCAG 4.1.2), via deterministic field-name humanization |

---

## 8. Running the test suite

```bash
cd backend && source .venv/bin/activate && export PYTHONPATH=src

pytest --ignore=tests/test_layout_onnx_yolo.py \
       --ignore=tests/test_verify_accessibility.py \
       --ignore=tests/test_verify_layout.py \
       --ignore=tests/test_ocr_textract.py \
       --ignore=tests/test_routing_integration.py
# 86 passed — offline, no AWS calls, no cost
```

The ignored files are either optional-dependency tests (layout detector
ONNX model, accessibility/layout verification scripts) or have known,
pre-existing async-fixture setup gaps unrelated to any of the core
remediation/modernization/triage logic — they fail the same way on a clean
checkout of `main`.

```bash
cd app
npm run typecheck && npm run build
```

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `AccessDeniedException` calling Bedrock | Model access not enabled, or wrong region | Enable Claude model access in **Bedrock → Model access** for the region in `AWS_REGION` |
| `ValidationException: model id ... not supported` | Using the bare model id instead of the cross-region inference profile | Prefix with `us.` (or your partition's region prefix) — see `BEDROCK_MODEL_ID` in `.env.example` |
| Frontend shows `Not Found` for routes that used to work | Vite's dev proxy drops its connection when `uvicorn --reload` restarts the backend | Restart the backend **without** `--reload`, or restart both `npm run dev` and uvicorn together |
| `TextractOcrProvider requires PDF_S3_BUCKET` on startup | `PDF_OCR_PROVIDER=textract` but `PDF_STORAGE_BACKEND` isn't `s3` | Textract reads the source PDF from S3 — set `PDF_STORAGE_BACKEND=s3` and `PDF_S3_BUCKET` |
| `NOT_TAGGED` (422) from `POST /pdf/jobs` | The PDF has no structure tree | Run **Tag PDF** (`POST /pdf/documents/{docId}/tag`) or **Modernize** first, then create the job |
| A PDF with a signature/AcroForm field routes to `UNSUPPORTED` | `core/scan.py` checks for form fields before figures — any AcroForm field routes the document away from the alt-text job pipeline, even if it also has taggable figures | Known limitation — use **Find Issues** in the Workbench (it bypasses routing) to still see and fix the WCAG findings on such a file |
| Temporary AWS credentials expire mid-session | SSO/STS tokens are time-limited | Re-run `aws sso login` (or refresh your profile) and restart the backend |

---

## Offline mode (no AWS account)

If you want to run Ramp with zero cloud dependencies — no Bedrock, no S3, no
DynamoDB — every provider has a local/stub equivalent:

```bash
cd backend
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
PYTHONPATH=src PDF_WORK_DIR=/tmp/ramp_work \
  python -m uvicorn pdf_remediation.api.app:app --port 8000
```

With no `backend/.env` at all, `Settings.from_env()` defaults to
`PDF_STORAGE_BACKEND=local`, `PDF_JOB_STORE=json`, `PDF_ALT_TEXT_PROVIDER=stub`,
`PDF_OCR_PROVIDER=none` — PDFs land on local disk under `PDF_WORK_DIR`, job
state is JSON files, and alt-text suggestions are deterministic placeholder
strings instead of real Claude output. Every route above behaves identically;
only where the bytes end up and who drafts the alt text changes.

```bash
cd app && npm install && npm run dev   # http://localhost:5173
```

---

## Where to go next

- [README.md](../README.md) — feature list, architecture, tech stack
- [backend/README.md](../backend/README.md) — backend internals, why tagged-PDFs-only, library choices
- [app/README.md](../app/README.md) — frontend structure, design notes
- [infra/README.md](../infra/README.md) — CDK stacks in depth, GitHub Actions deploy
