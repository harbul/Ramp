"""Backend stack: Lambda + API Gateway + S3 + DynamoDB + Bedrock permissions."""

from aws_cdk import (
    Stack,
    Duration,
    RemovalPolicy,
    CfnOutput,
    aws_lambda as lambda_,
    aws_apigatewayv2 as apigw,
    aws_apigatewayv2_integrations as integrations,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    aws_logs as logs,
)
from constructs import Construct


class BackendStack(Stack):
    """
    Backend API and processing infrastructure.

    Resources:
    - S3 bucket for PDF storage
    - DynamoDB table for job tracking
    - Lambda API function (FastAPI)
    - Lambda worker function (async processing)
    - API Gateway HTTP API
    - IAM roles with Bedrock access
    """

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        app_name: str,
        environment: str,
        bedrock_model_id: str = "anthropic.claude-haiku-4-5",
        frontend_domain: str = None,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ===== S3 Bucket for PDF storage =====
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
                    transitions=[
                        s3.Transition(
                            storage_class=s3.StorageClass.INTELLIGENT_TIERING,
                            transition_after=Duration.days(0),
                        )
                    ],
                ),
                s3.LifecycleRule(
                    enabled=True,
                    prefix="figures/",
                    expiration=Duration.days(30),  # Temp extracted figures
                ),
            ],
            cors=[
                s3.CorsRule(
                    allowed_methods=[s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
                    allowed_origins=["*"],  # Restrict to frontend_domain in prod
                    allowed_headers=["*"],
                    max_age=3600,
                )
            ],
        )

        # ===== DynamoDB table for job tracking =====
        jobs_table = dynamodb.Table(
            self,
            "JobsTable",
            table_name=f"{app_name}-jobs-{environment}",
            partition_key=dynamodb.Attribute(
                name="job_id",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.RETAIN,
            point_in_time_recovery=True,
            stream=dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        )

        # GSI for querying by status
        jobs_table.add_global_secondary_index(
            index_name="status-index",
            partition_key=dynamodb.Attribute(
                name="status",
                type=dynamodb.AttributeType.STRING,
            ),
            sort_key=dynamodb.Attribute(
                name="created_at",
                type=dynamodb.AttributeType.STRING,
            ),
        )

        # Common Lambda environment variables
        common_env = {
            "PDF_STORAGE_BACKEND": "s3",
            "PDF_JOB_STORE": "dynamo",
            "PDF_ALT_TEXT_PROVIDER": "bedrock",
            "PDF_S3_BUCKET": pdf_bucket.bucket_name,
            "PDF_DDB_TABLE": jobs_table.table_name,
            "BEDROCK_MODEL_ID": bedrock_model_id,
            "PYTHONPATH": "/var/task/src",
        }

        # ===== Lambda execution role =====
        lambda_role = iam.Role(
            self,
            "LambdaExecutionRole",
            assumed_by=iam.ServicePrincipal("lambda.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "service-role/AWSLambdaBasicExecutionRole"
                ),
            ],
        )

        # Grant S3 permissions
        pdf_bucket.grant_read_write(lambda_role)

        # Grant DynamoDB permissions
        jobs_table.grant_read_write_data(lambda_role)

        # Grant Bedrock permissions
        lambda_role.add_to_policy(
            iam.PolicyStatement(
                actions=["bedrock:InvokeModel"],
                resources=[
                    f"arn:aws:bedrock:{self.region}::foundation-model/{bedrock_model_id}",
                    f"arn:aws:bedrock:{self.region}::foundation-model/anthropic.claude-*",
                ],
            )
        )

        # ===== Lambda Worker Function (async processing) =====
        worker_function = lambda_.Function(
            self,
            "WorkerFunction",
            function_name=f"{app_name}-worker-{environment}",
            runtime=lambda_.Runtime.PYTHON_3_14,
            handler="pdf_remediation.api.worker.handler",
            code=lambda_.Code.from_asset("../backend/src"),
            timeout=Duration.minutes(15),  # Long-running for model calls
            memory_size=2048,
            environment=common_env,
            role=lambda_role,
            log_retention=logs.RetentionDays.ONE_WEEK,
        )

        # ===== Lambda API Function (FastAPI) =====
        api_function = lambda_.Function(
            self,
            "ApiFunction",
            function_name=f"{app_name}-api-{environment}",
            runtime=lambda_.Runtime.PYTHON_3_14,
            handler="pdf_remediation.api.app.handler",
            code=lambda_.Code.from_asset("../backend/src"),
            timeout=Duration.seconds(30),
            memory_size=1024,
            environment={
                **common_env,
                "PDF_WORKER_FUNCTION_NAME": worker_function.function_name,
            },
            role=lambda_role,
            log_retention=logs.RetentionDays.ONE_WEEK,
        )

        # Grant API function permission to invoke worker
        worker_function.grant_invoke(api_function)

        # ===== API Gateway HTTP API =====
        http_api = apigw.HttpApi(
            self,
            "HttpApi",
            api_name=f"{app_name}-api-{environment}",
            description=f"PDF Remediation API ({environment})",
            cors_preflight=apigw.CorsPreflightOptions(
                allow_origins=["*"] if not frontend_domain else [f"https://{frontend_domain}"],
                allow_methods=[
                    apigw.CorsHttpMethod.GET,
                    apigw.CorsHttpMethod.POST,
                    apigw.CorsHttpMethod.PUT,
                    apigw.CorsHttpMethod.DELETE,
                    apigw.CorsHttpMethod.OPTIONS,
                ],
                allow_headers=["Content-Type", "Authorization", "X-Amz-Date"],
                max_age=Duration.hours(1),
            ),
        )

        # Lambda integration
        api_integration = integrations.HttpLambdaIntegration(
            "ApiIntegration",
            api_function,
        )

        # Catch-all route for FastAPI
        http_api.add_routes(
            path="/{proxy+}",
            methods=[apigw.HttpMethod.ANY],
            integration=api_integration,
        )

        # Root path
        http_api.add_routes(
            path="/",
            methods=[apigw.HttpMethod.ANY],
            integration=api_integration,
        )

        # ===== Outputs =====
        CfnOutput(
            self,
            "ApiUrl",
            value=http_api.url,
            description="API Gateway URL",
            export_name=f"{app_name}-api-url-{environment}",
        )

        CfnOutput(
            self,
            "PdfBucketName",
            value=pdf_bucket.bucket_name,
            description="S3 bucket for PDF storage",
        )

        CfnOutput(
            self,
            "JobsTableName",
            value=jobs_table.table_name,
            description="DynamoDB table for job tracking",
        )

        CfnOutput(
            self,
            "ApiFunctionName",
            value=api_function.function_name,
            description="Lambda API function name",
        )

        CfnOutput(
            self,
            "WorkerFunctionName",
            value=worker_function.function_name,
            description="Lambda worker function name",
        )

        # Store for cross-stack reference
        self.api_url = http_api.url
        self.pdf_bucket = pdf_bucket
        self.jobs_table = jobs_table
        self.api_function = api_function
        self.worker_function = worker_function
