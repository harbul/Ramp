"""S3-backed storage. Same interface as LocalStorage, so the service doesn't
change when we move to the cloud.

Layout (one bucket, prefix per job — keeps a job's artifacts together and makes
lifecycle/IAM a single rule):

    s3://{bucket}/jobs/{jobId}/original/{filename}.pdf
                             /images/p{page}-f{index}.png
                             /remediated/{basename}-remediated.pdf

The browser uploads and downloads via presigned URLs — PDF bytes never pass
through Lambda (payload limits, cost).
"""

from __future__ import annotations

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from ..errors import RemediationError


class StorageError(RemediationError):
    code = "STORAGE_ERROR"
    http_status = 502


class S3Storage:
    def __init__(self, *, bucket: str | None, region: str | None = None, client=None):
        if not bucket:
            raise ValueError("S3Storage needs a bucket (set PDF_S3_BUCKET).")
        self.bucket = bucket
        # SigV4 + regional endpoint so presigned URLs are valid in every region.
        self._s3 = client or boto3.client(
            "s3",
            region_name=region,
            config=Config(signature_version="s3v4"),
        )

    def get_bytes(self, key: str) -> bytes:
        try:
            return self._s3.get_object(Bucket=self.bucket, Key=key)["Body"].read()
        except ClientError as exc:
            raise StorageError(f"Could not read s3://{self.bucket}/{key}: {_msg(exc)}") from exc

    def put_bytes(
        self, key: str, data: bytes, content_type: str = "application/octet-stream"
    ) -> str:
        try:
            self._s3.put_object(Bucket=self.bucket, Key=key, Body=data, ContentType=content_type)
        except ClientError as exc:
            raise StorageError(f"Could not write s3://{self.bucket}/{key}: {_msg(exc)}") from exc
        return f"s3://{self.bucket}/{key}"

    def presign_get(self, key: str, expires_in: int = 900) -> str:
        return self._presign("get_object", key, expires_in)

    def presign_put(self, key: str, expires_in: int = 900) -> str:
        return self._presign("put_object", key, expires_in)

    def exists(self, key: str) -> bool:
        try:
            self._s3.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as exc:
            if exc.response.get("Error", {}).get("Code") in ("404", "NoSuchKey", "NotFound"):
                return False
            raise StorageError(f"Could not stat s3://{self.bucket}/{key}: {_msg(exc)}") from exc

    def _presign(self, op: str, key: str, expires_in: int) -> str:
        params = {"Bucket": self.bucket, "Key": key}
        if op == "put_object":
            params["ContentType"] = "application/pdf"
        try:
            return self._s3.generate_presigned_url(op, Params=params, ExpiresIn=expires_in)
        except ClientError as exc:
            raise StorageError(f"Could not presign {op} for {key}: {_msg(exc)}") from exc


def _msg(exc: ClientError) -> str:
    return exc.response.get("Error", {}).get("Message", str(exc))
