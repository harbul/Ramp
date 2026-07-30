# PDF Remediation Backend - ALT text

Detects images missing alternative text in **tagged** campus PDFs, proposes alt
text with an LLM, and writes the reviewer-approved text back into the PDF where
a screen reader will actually read it.

**Status:** Core pipeline + real Bedrock alt text verified (86 offline alt-text/
triage tests + a live check; a recent in-progress OCR merge adds ~19 tests that
currently fail because their async test setup is not wired up yet). A triage endpoint (`POST /pdf/triage`, classify -> recommend -> auto
alt-text) wraps the same service and detects process-need signals, so migrate /
recreate / remediate all fire on live uploads. **S3 + DynamoDB are deployed and
used** (via `backend/.env`), and triage metadata (classification + recommendation
+ remediated-PDF link) is **persisted** on the document, so uploads survive a
reload. Not yet done: deploying the API to Lambda, form-label write-back, and
auth. See `../Docs/status.md`.

## Quick start

```bash
python3 -m venv .venv && source .venv/bin/activate    # Python 3.12+
pip install -r requirements-dev.txt
export PYTHONPATH=src

pytest --ignore=tests/test_ocr_textract.py --ignore=tests/test_routing_integration.py  # 86 tests, no AWS

python -m pdf_remediation.cli scan tests/fixtures/tagged_with_figures.pdf
python -m pdf_remediation.cli analyze tests/fixtures/tagged_with_figures.pdf --out work/
python -m pdf_remediation.cli apply work/report.json --approvals approvals.json
```

`analyze` writes `work/report.json` listing each figure and its suggested alt
text. `apply` takes an approvals file (`{"fig-p1-0": "your alt text"}`) so the
human-in-the-loop step is real even without the UI. Issues absent from the file
are treated as rejected; omit `--approvals` to accept every suggestion.

## Why tagged PDFs only

A screen reader doesn't read alt text off the image. It reads `/Alt` on a
`/Figure` **structure element**, which is bound to the image by a marked-content
id. All four links must exist:

```
Catalog /MarkInfo <</Marked true>>
Catalog /StructTreeRoot
  -> StructElem { /S /Figure, /Alt, /Pg <page>, /K <mcid> }
  -> content stream:  /Figure <</MCID 0>> BDC ... EMC
  -> page /StructParents N -> ParentTree Nums: N -> array indexed by MCID
```

On a **tagged** PDF three of those already exist and `/Alt` is simply empty -
writing it is a small, verifiable edit, and that's the product.

On an **untagged** PDF none of them exist. Creating them means injecting BDC/EMC
into content streams, renumbering MCIDs, rebuilding the ParentTree, and
inferring reading order from visual layout. No Python library does this
reliably, so we don't pretend to: untagged files are **detected, labelled, and
refused**. Writing `/Alt` into an untagged PDF would produce a file that looks
remediated and reads as empty - worse than doing nothing, because it makes a
broken form look compliant.

`TagStatus` drives the library filter:

| Status | Meaning | Remediable |
| --- | --- | --- |
| `TAGGED` | structure tree with figures missing alt | yes |
| `UNTAGGED` | no structure tree | no - needs tagging first |
| `TAGGED_NO_FIGURES` | tagged, nothing to fix | nothing to do |

## Library choices

| Library | Licence | Role |
| --- | --- | --- |
| pikepdf (QPDF) | MPL-2.0 | structure tree read/write - the only lib that can set `/Alt` |
| pdfplumber | MIT | page text for model context; independent tree parser in tests |
| pypdf | BSD | page count / metadata |
| Pillow | MIT-CMU | downscale images to the model's limits |

**PyMuPDF is deliberately absent.** It's the nicest extraction API but it's
AGPL-3.0 or a paid Artifex licence, and AGPL's network clause would attach to a
hosted campus service - that's the university's decision to make, not a default.
It also can't write tags anyway.

## Architecture

```
Local dev:   CLI / FastAPI ──► service ──► LocalStorage + JSON store + stub|bedrock
Cloud (next):  API GW ──► Lambda ──► service ──► S3 + DynamoDB + Bedrock
```

`core/` never imports boto3 and never knows what a Lambda is. Storage, the job
store, and the alt-text provider are protocols in `ports/` with swappable
implementations in `adapters/`, wired in `config.build_service()`. The CLI and
the (future) Lambda handlers are thin adapters over the same `service.py` - which
is why the PoC becomes the deployment instead of being thrown away. The S3,
DynamoDB, and Bedrock adapters are built and tested; wiring them into a deployed
Lambda is the remaining step.

```
src/pdf_remediation/
  models.py     Job / Issue / TagStatus - the contract with the frontend
  errors.py     typed domain errors -> HTTP codes at the edge
  core/
    scan.py     classify + walk the structure tree (no model calls)
    inspect.py  bind each /Figure to its image via content-stream MCIDs
    context.py  page text so alt text describes *this* form
    images.py   extract + downscale
    apply.py    write /Alt, then verify by reading it back
  ports/        storage / job_store / alt_text protocols
  adapters/     local + S3 storage, JSON + DynamoDB store, stub + Bedrock provider
  service.py    create -> analyze -> approve -> apply
  api/app.py    FastAPI (incl. POST /pdf/triage, POST /pdf/documents/from-corpus)
  api/triage.py classify -> recommend -> auto alt-text (uses the inventory module)
  cli.py        local CLI entry point
```

## Tests

```bash
# Alt-text + triage suite (86 tests, offline, no AWS account, no cost):
pytest --ignore=tests/test_ocr_textract.py --ignore=tests/test_routing_integration.py
```

A bare `pytest` is currently red: an in-progress OCR-feature merge added tests in
`test_ocr_textract.py` and `test_routing_integration.py` that fail because their
async test setup is not wired up yet. They are unrelated to the alt-text/triage
path, which is why the command above ignores them.

Fixtures are generated by `tests/fixtures/generate_fixtures.py` (run
automatically if missing) and hand-built with pikepdf so their structure is
known exactly.

The load-bearing ones:

- `test_apply.py::test_alt_text_is_reachable_by_an_independent_parser` -
  pikepdf reading back what pikepdf wrote proves little, so this asserts via
  **pdfplumber**, which resolves MCIDs the way a consumer does.
- `test_apply.py::test_untagged_pdf_is_refused_not_faked` - the honesty gate.
- `test_service.py::test_full_flow_writes_reviewer_text_into_the_pdf` - asserts
  the reviewer's **edited** text is what lands, not the model's suggestion.

## Done

- **Bedrock is real** - `adapters/alt_text_bedrock.py` uses the `AnthropicBedrock`
  client + cross-region inference profile + forced tool use; verified live in
  `us-west-2`.
- **FastAPI** (`api/app.py`) over the same service, plus `POST /pdf/triage`
  (classify -> recommend -> auto alt-text) in `api/triage.py`, with process-need
  signal detection (signature / workflow / external / sensitive data).
- **S3 + DynamoDB deployed and used.** `backend/.env` sets
  `PDF_STORAGE_BACKEND=s3` + `PDF_JOB_STORE=dynamo`; the running service reads/writes
  the deployed bucket (`csus-pdf-assistant-pdfs-prod`) and table
  (`csus-pdf-assistant-jobs-prod`). Adapters are `moto`-tested with a parity test
  against the local/JSON stores.
- **Persistence.** `TriageInfo` (classification + recommendation + signals) and the
  remediated-PDF link are stored on the `Document` and returned by
  `GET /pdf/documents`, so uploads survive a reload.

## Remediate a listed form (no re-upload)

`POST /pdf/documents/from-corpus` (`{department, file}`) fetches a form's bytes
from a read-only corpus bucket and registers it through the same
`register_document` path an upload uses, so the Review Queue can remediate a
listed form directly. It resolves `s3://{PDF_CORPUS_BUCKET}/{PDF_CORPUS_PREFIX}/
{department}/{file}`, guards against path traversal, and returns a clean
`CORPUS_FILE_NOT_FOUND` (404) if the object or bucket is missing. With no
`PDF_CORPUS_BUCKET` set it is a safe no-op (404), so it never fires in production
by accident.

## Configuration

`config.py` loads `backend/.env` (gitignored) via `python-dotenv` in local dev,
so the storage/provider settings above apply automatically when you run uvicorn
from `backend/`. In Lambda the config comes from the function environment instead.

For in-queue remediation, set `PDF_CORPUS_BUCKET` (and optionally
`PDF_CORPUS_PREFIX`, default `data/csus-aba-forms`) to the bucket holding the
90-form corpus. This is gitignored config, so each developer sets it in their own
`.env`.

## What's next

- **Deploy the API to Lambda** - fix the runtime and dependency bundling in
  `../infra` `BackendStack`, refactor it to import the deployed S3/DynamoDB rather
  than recreate them, and move long-running analyze/apply to a worker Lambda
  (202 + poll).
- **Form-label write-back** using the `label_infer` tiers (currently detection-only).
- **AuthN/Z** before any shared/hosted deployment.

Note: real campus PDFs may surface structure the synthetic fixtures don't cover.
