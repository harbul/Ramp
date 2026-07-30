# Ramp — External Integrations

AWS-facing adapters and CDK infrastructure for [Ramp](../../tree/main). This branch holds **only the code that talks to external services** — Amazon Bedrock, Textract, S3, and DynamoDB — plus the CDK stacks that provision them. Everything here is opt-in: the main app runs 100% offline without any of this code.

For the offline core see the [`backend`](../../tree/backend) branch. For the React UI see [`frontend`](../../tree/frontend).

---

## What lives here

```
backend/src/pdf_remediation/adapters/
  alt_text_bedrock.py       Claude vision via Anthropic Bedrock SDK, forced tool use
  ocr_textract.py           async StartDocumentAnalysis with TABLES/FORMS/LAYOUT/SIGNATURES
  ocr_bedrock_vision.py     Bedrock-vision OCR fallback (per-page prompt)
  storage_s3.py             S3 with SigV4 presigned GET/PUT
  job_store_dynamo.py       single-table DynamoDB store (JOB# / DOC# partitioning)
  layout_onnx_yolo.py       YOLOv10-DocLayNet ONNX detector for figure bboxes

infra/                      AWS CDK (Python)
  app.py                    entry point
  requirements.txt          aws-cdk-lib
  stacks/
    storage_stack.py        S3 bucket + DynamoDB table (deployed us-west-2)
    backend_stack.py        Lambda + API Gateway (not yet deployed — runtime + bundling fix pending)
    frontend_stack.py       S3 + CloudFront (not yet deployed)
```

---

## Wiring it back

These adapters plug into the port protocols defined in [`backend/src/pdf_remediation/ports/`](../../tree/backend/backend/src/pdf_remediation/ports). Selection happens in `config.build_service()` via env vars:

| Env var | Value | Adapter loaded |
| --- | --- | --- |
| `PDF_STORAGE_BACKEND` | `s3` | `storage_s3.S3Storage` |
| `PDF_JOB_STORE` | `dynamo` | `job_store_dynamo.DynamoJobStore` |
| `PDF_ALT_TEXT_PROVIDER` | `bedrock` | `alt_text_bedrock.BedrockAltTextProvider` |
| `PDF_OCR_PROVIDER` | `textract` | `ocr_textract.TextractOcrProvider` |
| `PDF_OCR_PROVIDER` | `bedrock_vision` | `ocr_bedrock_vision.BedrockVisionOcrProvider` |
| `PDF_LAYOUT_DETECTOR` | `onnx_yolo` | `layout_onnx_yolo.OnnxYoloLayoutDetector` |

Copy each `.py` under `backend/src/pdf_remediation/adapters/` into the `backend` branch's tree (or check out this branch's files on top of `backend`) to enable the AWS path. Nothing in `service.py` or `core/*` changes — `config.build_service` picks up the new adapters automatically.

---

## External APIs

### Amazon Bedrock
- **Model:** `us.anthropic.claude-haiku-4-5-20251001-v1:0` (cross-region inference profile — the `us.` prefix is required; the bare model id will refuse to invoke)
- **Region:** `us-west-2`
- **Client:** `anthropic.AnthropicBedrock` (NOT `boto3.bedrock-runtime.converse` — the classic surface can't reach current Claude vision models)
- **Structured output:** forced tool use with a `describe_image` tool that returns `{alt_text: string, is_decorative: boolean}`

### Amazon Textract
- **API:** async `StartDocumentAnalysis` with `FeatureTypes=["TABLES","FORMS","LAYOUT","SIGNATURES"]`
- **Source:** PDF read from S3 (Textract does not accept multipart uploads for the async path)
- **Polling:** `GetDocumentAnalysis` until `JobStatus=SUCCEEDED`; paginated `NextToken` for multi-page results
- **Confidence:** 90% threshold recommended as v1 default

### Amazon S3
- **Bucket (deployed):** `csus-pdf-assistant-pdfs-prod` (rename for your deployment)
- **Layout:** `originals/{doc_id}/{filename}`, `remediated/{job_id}/{filename}`, `reconstructed/{job_id}/{filename}`, `images/{job_id}/p{page}-i{index}.png`
- **Presigned URLs:** 15-min expiry; browser can PUT originals + GET remediated results directly

### Amazon DynamoDB
- **Table (deployed):** `csus-pdf-assistant-jobs-prod` (rename for your deployment)
- **Key shape:** partition key `pk` = `DOC#{doc_id}` or `JOB#{job_id}`
- **Filterable attributes:** `tagStatus`, `department`, `route` mirrored top-level for scan-with-filter

---

## Infrastructure (CDK)

Deployed today (`us-west-2`):
- **`StorageStack`** — S3 bucket + DynamoDB table, both with `RemovalPolicy.DESTROY` for dev; SSE-S3, versioning on

Not yet deployed:
- **`BackendStack`** — Lambda function + API Gateway; needs (a) Python runtime pinning (currently targets 3.14 which is not a Lambda runtime) and (b) dependency layering (currently uses `Code.from_asset("../backend/src")` which ships source without deps)
- **`FrontendStack`** — S3 bucket + CloudFront distribution for the built `app/dist`; blocked on backend deploy

### Deploy the storage stack

```bash
cd infra
python3.14 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cdk bootstrap aws://<account>/us-west-2   # once per account+region
cdk deploy StorageStack
```

---

## Testing the AWS adapters

`backend/tests/` contains adapter-level tests that use **moto** to simulate S3 and DynamoDB (offline) plus **opt-in live tests** that hit real Bedrock / Textract. These tests belong here because they import the adapters.

```bash
# Offline (moto-mocked):
PYTHONPATH=src pytest tests/test_storage_s3.py tests/test_job_store_dynamo.py

# Live (requires AWS creds + Bedrock model access in us-west-2):
PYTHONPATH=src pytest tests/test_alt_text_bedrock_live.py --run-live
```

---

## Security notes

- **No credentials are ever committed.** AWS SDK resolves them from `~/.aws` (SSO / profile) locally or from the Lambda execution role in prod.
- **PDF bytes never cross Lambda** in the production path — browser PUTs straight to S3 via a presigned URL from `S3Storage.presign_put()`. API Gateway's 6 MB payload cap would otherwise break for large campus PDFs.
- **All adapters are permissively licensed** (Anthropic SDK MIT, boto3 Apache-2.0, pikepdf MPL-2.0). PyMuPDF is deliberately excluded (AGPL-3.0 network clause).

---

Sole maintainer: **harbul**.
