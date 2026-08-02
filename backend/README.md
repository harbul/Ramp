# Ramp Backend

FastAPI service behind Ramp's WCAG 2.1 AA scorecard, one-click Modernization,
AI-reviewed Remediation (alt text + form labels), and Textract-based OCR
reconstruction for scanned PDFs. Runs against real **Amazon Bedrock**
(Claude vision alt text), **Amazon Textract** (OCR), **Amazon S3** (PDF
storage), and **Amazon DynamoDB** (job/document store) by default — every
provider also has a local/stub equivalent for offline dev. See
[`../Docs/QUICKSTART.md`](../Docs/QUICKSTART.md) for full setup (AWS
resources, `.env`, every API route) or jump to [Quick start](#quick-start)
below for the offline CLI.

**Status:** Core alt-text pipeline + real Bedrock alt text verified (86
offline tests + a live check). Modernization now also promotes/repairs
heading structure and generates/repairs bookmark outlines
(`core/headings.py`, `core/bookmarks.py`) — both tag-only edits that never
touch visible content or formatting. Reviewers can mark a figure
**decorative** instead of writing alt text, which writes an explicit empty
`/Alt` (verified end to end, including the post-write independent
read-back). A triage endpoint (`POST /pdf/triage`, classify → recommend →
auto alt-text) wraps the same service and detects process-need signals, so
migrate / recreate / remediate all fire on live uploads. **S3 + DynamoDB are
the default storage** (via `backend/.env`), and triage metadata
(classification + recommendation + remediated-PDF link) is **persisted** on
the document, so uploads survive a reload. Form-field label write-back
(tier 1, deterministic humanize) is wired and writes real `/TU` labels;
tiers 2/3 (geometric header match, Bedrock fallback) exist in
`label_infer.py` but aren't invoked yet. Not yet done: deploying the API to
Lambda, and auth. See `../Docs/status.md` for the fuller historical handoff.

## Quick start

The full guide (AWS resources, `.env`, running `uvicorn`, every API route)
is [`../Docs/QUICKSTART.md`](../Docs/QUICKSTART.md). This is the offline,
no-AWS CLI path — useful for exercising the alt-text engine directly without
the API or a cloud account:

```bash
python3 -m venv .venv && source .venv/bin/activate    # Python 3.13+
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
Today:      CLI / FastAPI (run anywhere) ──► service ──► S3 + DynamoDB + Bedrock
Offline dev: CLI / FastAPI (no .env)      ──► service ──► LocalStorage + JSON store + stub
Next:        API GW ──► Lambda ──► service ──► S3 + DynamoDB + Bedrock
```

`core/` never imports boto3 and never knows what a Lambda is. Storage, the job
store, and the alt-text provider are protocols in `ports/` with swappable
implementations in `adapters/`, wired in `config.build_service()`. The CLI and
FastAPI are thin adapters over the same `service.py`, and a (future) Lambda
handler would be another one — which is why the PoC becomes the deployment
instead of being thrown away. The S3, DynamoDB, and Bedrock adapters are
built, tested, and are what the app talks to today; wiring them into a
deployed Lambda (instead of a locally-run FastAPI process) is the remaining
step.

```
src/pdf_remediation/
  models.py       Job / Issue / TagStatus - the contract with the frontend
  errors.py       typed domain errors -> HTTP codes at the edge
  core/
    scan.py       classify + walk the structure tree (no model calls)
    inspect.py    bind each /Figure to its image via content-stream MCIDs
    context.py    page text so alt text describes *this* form
    images.py     extract + downscale
    apply.py      write /Alt (incl. decorative empty string), verify by reading it back
    wcag.py       15-rule WCAG 2.1 AA scorer
    fixers.py     set_language / set_title / one_click_modernize
    headings.py   promote font-size heading candidates + repair skipped levels
    bookmarks.py  generate/repair a bookmark outline from the heading structure
    labels_write.py  AcroForm /TU writeback (tier-1 humanize)
    ocr_structure.py build StructTreeRoot from an OCR result
  ports/          storage / job_store / alt_text / ocr / layout protocols
  adapters/       local + S3 storage, JSON + DynamoDB store, stub + Bedrock alt-text,
                  stub + Textract + Bedrock-vision OCR
  service.py      create -> analyze -> approve -> apply, plus clone_document,
                  modernize, tag_document, infer_labels, OCR job lifecycle
  api/app.py      FastAPI, 30 routes (incl. POST /pdf/triage, POST /pdf/documents/
                  from-corpus, POST /pdf/documents/{id}/clone, /modernize, /tag)
  api/triage.py   classify -> recommend -> auto alt-text (uses the inventory module)
  cli.py          local CLI entry point
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
- **Decorative alt text.** A reviewer can mark a figure decorative instead of
  writing a description (`ApproveRequest.decorative`); `service.approve()` and
  `service.apply()` write an explicit empty `/Alt`, and `core/apply.py`'s
  post-write verification correctly distinguishes that from a genuinely
  missing `/Alt` (a truthy check would have conflated the two).
- **Heading structure repair** (`core/headings.py`). When a tagged document has
  no headings, promotes `/P` elements to `/H1`-`/H3` based on font-size ratio
  against the body-text median. Separately, renumbers any existing headings so
  levels never skip (`H1 -> H3` becomes `H1 -> H2`). Both are struct-tree-tag
  edits only - no content stream, visible text, or layout is touched.
- **Bookmark generation & repair** (`core/bookmarks.py`). Builds a flat
  `/Outlines` entry per heading for documents over 10 pages, with real text
  labels pulled from the heading's marked-content span. `outline_is_valid()`
  detects not just a missing outline but a **broken** one (entries pointing at
  pages that don't resolve in this document), so both cases get one fix path.
- **FastAPI** (`api/app.py`, 30 routes) over the same service, plus
  `POST /pdf/triage` (classify -> recommend -> auto alt-text) in
  `api/triage.py`, with process-need signal detection (signature / workflow /
  external / sensitive data), and `POST /pdf/documents/{id}/clone` so the
  frontend's Fix Issues flow can sandbox fixes onto a copy.
- **S3 + DynamoDB are the default storage.** `backend/.env` sets
  `PDF_STORAGE_BACKEND=s3` + `PDF_JOB_STORE=dynamo`; the running service reads/writes
  the configured bucket and table (see [`../Docs/QUICKSTART.md`](../Docs/QUICKSTART.md)
  for deploying your own via CDK). Adapters are `moto`-tested with a parity test
  against the local/JSON stores.
- **Persistence.** `TriageInfo` (classification + recommendation + signals) and the
  remediated-PDF link are stored on the `Document` and returned by
  `GET /pdf/documents`, so uploads survive a reload.
- **Form-label write-back, tier 1.** `core/labels_write.py` wraps
  `label_infer.tier1_humanize` and writes real `/TU` tooltips for AcroForm
  fields that lack one, via `POST /pdf/documents/{id}/infer-labels`. Tiers 2
  (geometric header match) and 3 (Bedrock fallback) exist in `label_infer.py`
  but aren't wired into the write path yet.

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
- **Wire up label-inference tiers 2/3** - `label_infer.py` has geometric
  column-header matching and a Bedrock LLM fallback implemented; only tier 1
  (deterministic humanize) is invoked by `infer-labels` today.
- **AuthN/Z** before any shared/hosted deployment.

Note: real campus PDFs may surface structure the synthetic fixtures don't cover.
