"""Storage stack: S3 (PDF storage) + DynamoDB (job/document store).

Deployed independently of the Lambda/API compute so the persistence layer can
exist and be validated before the backend is ready to ship. The bucket and
table names match what the backend expects (PDF_S3_BUCKET / PDF_DDB_TABLE), so
when the service is pointed at them (PDF_STORAGE_BACKEND=s3, PDF_JOB_STORE=dynamo)
it uses these resources directly.

Note: BackendStack currently also *creates* a bucket/table with these same
names. Before deploying BackendStack, refactor it to IMPORT these resources
(Bucket.from_bucket_name / Table.from_table_name) rather than recreate them, or
the two stacks will collide on the physical names.
"""

from aws_cdk import (
    Stack,
    Duration,
    RemovalPolicy,
    CfnOutput,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
)
from constructs import Construct


class StorageStack(Stack):
    """S3 bucket for PDFs + DynamoDB table for jobs/documents."""

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        app_name: str,
        environment: str,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ===== S3 bucket for PDF storage =====
        pdf_bucket = s3.Bucket(
            self,
            "PdfBucket",
            bucket_name=f"{app_name}-pdfs-{environment}",
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.RETAIN,
            auto_delete_objects=False,
            versioned=True,
            lifecycle_rules=[
                s3.LifecycleRule(
                    enabled=True,
                    prefix="jobs/",
                    transitions=[
                        s3.Transition(
                            storage_class=s3.StorageClass.INTELLIGENT_TIERING,
                            transition_after=Duration.days(0),
                        )
                    ],
                ),
            ],
            cors=[
                s3.CorsRule(
                    allowed_methods=[
                        s3.HttpMethods.GET,
                        s3.HttpMethods.PUT,
                        s3.HttpMethods.POST,
                    ],
                    allowed_origins=["*"],  # Restrict to the frontend domain in prod
                    allowed_headers=["*"],
                    max_age=3600,
                )
            ],
        )

        # ===== DynamoDB table for job/document tracking =====
        # Single-key design matching the DynamoJobStore adapter: one partition
        # key `pk` holding `JOB#<id>` or `DOC#<id>`. Documents are listed with a
        # Scan filtered on a `type` attribute, so no GSI is needed (a campus
        # corpus is hundreds of items, not millions).
        jobs_table = dynamodb.Table(
            self,
            "JobsTable",
            table_name=f"{app_name}-jobs-{environment}",
            partition_key=dynamodb.Attribute(
                name="pk",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.RETAIN,
            point_in_time_recovery=True,
        )

        # ===== Outputs =====
        CfnOutput(
            self,
            "PdfBucketName",
            value=pdf_bucket.bucket_name,
            description="S3 bucket for PDF storage (set as PDF_S3_BUCKET)",
        )
        CfnOutput(
            self,
            "JobsTableName",
            value=jobs_table.table_name,
            description="DynamoDB table for jobs/documents (set as PDF_DDB_TABLE)",
        )

        # For cross-stack reference once BackendStack imports instead of creates.
        self.pdf_bucket = pdf_bucket
        self.jobs_table = jobs_table
