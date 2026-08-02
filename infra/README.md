# Infrastructure Deployment

AWS CDK infrastructure for Ramp (formerly CSUS PDF Modernization Assistant —
stack/resource names below still use the original `csus-pdf-assistant` app
name by default; pass `APP_NAME=ramp` to `cdk deploy` for a fresh deployment
under the new name). See [`../Docs/QUICKSTART.md`](../Docs/QUICKSTART.md) §3
for the guided walkthrough of deploying storage and wiring it into
`backend/.env`.

## Prerequisites

- AWS CLI configured with credentials
- Node.js 20+ (for CDK CLI)
- Python 3.13+

## Setup

```bash
# Install CDK CLI (one-time)
npm install -g aws-cdk

# Install Python dependencies
cd infra
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Bootstrap CDK (one-time per account/region)
cdk bootstrap
```

## Stacks

Three independent stacks:

1. **CsusPdfAssistantStorage** (`storage_stack.py`): S3 + DynamoDB only.
   **Deployed** (us-west-2). This is the storage the backend actually uses today.
2. **CsusPdfAssistantBackend** (`backend_stack.py`): Lambda + API Gateway + S3 +
   DynamoDB. **Not deployed** - see caveats below.
3. **CsusPdfAssistantFrontend** (`frontend_stack.py`): S3 + CloudFront for the
   React app. **Not deployed.**

## Deployment

### Storage (deployed)

```bash
cdk deploy CsusPdfAssistantStorage
```

Outputs (used by `backend/.env` as `PDF_S3_BUCKET` / `PDF_DDB_TABLE`):
- `PdfBucketName`: `csus-pdf-assistant-pdfs-prod`
- `JobsTableName`: `csus-pdf-assistant-jobs-prod` (partition key `pk`, matching the
  `DynamoJobStore` adapter)

Both resources use `RemovalPolicy.RETAIN`, so `cdk destroy` leaves them in place;
delete them manually when finished.

### Backend (not deployed - needs work first)

`cdk deploy CsusPdfAssistantBackend` is **blocked** as written:
- Its Lambda functions target `Runtime.PYTHON_3_14`, which AWS Lambda does not
  offer (latest is 3.13) - `cdk synth` passes but `deploy` fails on the runtime.
- `Code.from_asset("../backend/src")` ships source **without dependencies**; the
  functions need a real bundling step or a Lambda layer to run.
- It also **recreates** the same-named S3 bucket/table as `StorageStack`; refactor
  it to import them (`Bucket.from_bucket_name` / `Table.from_table_name`) before
  deploying, or the two stacks collide on the physical names.

### Frontend (when ready)

```bash
cdk deploy CsusPdfAssistantFrontend
```
Outputs: `BucketName`, `DistributionId`, `CloudFrontDomain`.

## Connecting the running app to storage

The backend uses the deployed S3 + DynamoDB **today**, run locally: `backend/.env`
sets `PDF_STORAGE_BACKEND=s3`, `PDF_JOB_STORE=dynamo`, and the bucket/table names
above. No API Gateway deployment is required for this.

## GitHub Actions

`.github/workflows/deploy-frontend.yml` automates frontend deployment.

Required secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
