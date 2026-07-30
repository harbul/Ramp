"""Settings from environment variables.

No credentials are ever read here or hardcoded anywhere: locally the AWS SDK
picks up AWS_PROFILE, and in Lambda it uses the execution role.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

# Local dev convenience: load backend/.env into the environment if present.
# Guarded so it is a no-op in Lambda (where python-dotenv isn't installed and
# config comes from the function's environment) and never a hard dependency.
try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
except ImportError:
    pass


@dataclass
class Settings:
    storage_backend: str = "local"          # local | s3
    job_store: str = "json"                 # json | dynamo
    alt_text_provider: str = "stub"         # stub | bedrock
    ocr_provider: str = "none"             # none | stub | textract | bedrock_vision
    layout_detector: str = "none"          # none | onnx_yolo
    work_dir: Path = Path("./work")

    s3_bucket: str | None = None
    ddb_table: str | None = None
    worker_function_name: str | None = None

    # Read-only source of the analyzed campus corpus (the 90 forms), so the
    # Review Queue can remediate a listed form without a re-upload.
    corpus_bucket: str | None = None
    corpus_prefix: str = "data/csus-aba-forms"

    aws_region: str | None = None
    bedrock_model_id: str = "us.anthropic.claude-opus-4-8"

    @classmethod
    def from_env(cls) -> Settings:
        return cls(
            storage_backend=os.getenv("PDF_STORAGE_BACKEND", "local"),
            job_store=os.getenv("PDF_JOB_STORE", "json"),
            alt_text_provider=os.getenv("PDF_ALT_TEXT_PROVIDER", "stub"),
            ocr_provider=os.getenv("PDF_OCR_PROVIDER", "none"),
            layout_detector=os.getenv("PDF_LAYOUT_DETECTOR", "none"),
            work_dir=Path(os.getenv("PDF_WORK_DIR", "./work")),
            s3_bucket=os.getenv("PDF_S3_BUCKET"),
            ddb_table=os.getenv("PDF_DDB_TABLE"),
            worker_function_name=os.getenv("PDF_WORKER_FUNCTION_NAME"),
            corpus_bucket=os.getenv("PDF_CORPUS_BUCKET"),
            corpus_prefix=os.getenv("PDF_CORPUS_PREFIX", "data/csus-aba-forms"),
            aws_region=os.getenv("AWS_REGION"),
            bedrock_model_id=os.getenv("BEDROCK_MODEL_ID", "us.anthropic.claude-opus-4-8"),
        )


def build_service(settings: Settings | None = None):
    """Wire the ports to the adapters the environment asks for.

    The only place that knows which implementation is in play; everything below
    talks to the protocols.
    """
    from .service import RemediationService

    settings = settings or Settings.from_env()

    if settings.storage_backend == "s3":
        from .adapters.storage_s3 import S3Storage

        storage = S3Storage(bucket=settings.s3_bucket, region=settings.aws_region)
    else:
        from .adapters.storage_local import LocalStorage

        storage = LocalStorage(settings.work_dir)

    if settings.job_store == "dynamo":
        from .adapters.job_store_dynamo import DynamoJobStore

        jobs = DynamoJobStore(table=settings.ddb_table, region=settings.aws_region)
    else:
        from .adapters.job_store_json import JsonJobStore

        jobs = JsonJobStore(settings.work_dir / "state")

    if settings.alt_text_provider == "bedrock":
        from .adapters.alt_text_bedrock import BedrockAltTextProvider

        alt_text = BedrockAltTextProvider(
            region=settings.aws_region, model_id=settings.bedrock_model_id
        )
    else:
        from .adapters.alt_text_stub import StubAltTextProvider

        alt_text = StubAltTextProvider()

    # OCR provider
    ocr = None
    if settings.ocr_provider == "textract":
        from .adapters.ocr_textract import TextractOcrProvider

        if not settings.s3_bucket:
            raise ValueError(
                "TextractOcrProvider requires PDF_S3_BUCKET (Textract reads from S3)."
            )
        ocr = TextractOcrProvider(
            s3_bucket=settings.s3_bucket,
            region=settings.aws_region or "us-west-2",
        )
    elif settings.ocr_provider == "stub":
        from .adapters.ocr_stub import StubOcrProvider

        ocr = StubOcrProvider()
    elif settings.ocr_provider == "bedrock_vision":
        from .adapters.ocr_bedrock_vision import BedrockVisionOcrProvider

        ocr = BedrockVisionOcrProvider(
            profile_name=os.getenv("AWS_PROFILE"),
            region=settings.aws_region or "us-west-2",
            model_id=os.getenv("BEDROCK_OCR_MODEL_ID", "us.anthropic.claude-haiku-4-5-20251001-v1:0"),
        )

    # Layout detector (for accurate figure bounding boxes)
    layout_detector = None
    if settings.layout_detector == "onnx_yolo":
        from .adapters.layout_onnx_yolo import OnnxYoloLayoutDetector

        layout_detector = OnnxYoloLayoutDetector()

    return RemediationService(
        storage=storage, jobs=jobs, alt_text=alt_text, ocr=ocr,
        layout_detector=layout_detector,
    )
