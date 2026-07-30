#!/usr/bin/env python3
"""CDK app for CSUS PDF Modernization Assistant.

Deploy frontend only:
    cdk deploy CsusPdfAssistantFrontend

Deploy backend only:
    cdk deploy CsusPdfAssistantBackend

Deploy both:
    cdk deploy --all
"""

import os
from aws_cdk import App, Environment, Tags
from stacks import FrontendStack, BackendStack, StorageStack

# Configuration
APP_NAME = os.getenv("APP_NAME", "csus-pdf-assistant")
ENVIRONMENT = os.getenv("DEPLOY_ENV", "prod")
AWS_REGION = os.getenv("AWS_REGION", "us-west-2")
AWS_ACCOUNT = os.getenv("CDK_DEFAULT_ACCOUNT")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-haiku-4-5")

app = App()

# AWS environment
env = Environment(
    account=AWS_ACCOUNT,
    region=AWS_REGION,
)

# Storage stack (independent): S3 + DynamoDB only, deployable without the
# Lambda/API compute. Deploy with: cdk deploy CsusPdfAssistantStorage
storage_stack = StorageStack(
    app,
    f"{APP_NAME.title().replace('-', '')}Storage",
    app_name=APP_NAME,
    environment=ENVIRONMENT,
    env=env,
    description=f"S3 + DynamoDB storage for {APP_NAME} ({ENVIRONMENT})",
)

# Backend stack (independent)
backend_stack = BackendStack(
    app,
    f"{APP_NAME.title().replace('-', '')}Backend",
    app_name=APP_NAME,
    environment=ENVIRONMENT,
    bedrock_model_id=BEDROCK_MODEL_ID,
    env=env,
    description=f"Backend API infrastructure for {APP_NAME} ({ENVIRONMENT})",
)

# Frontend stack (independent)
frontend_stack = FrontendStack(
    app,
    f"{APP_NAME.title().replace('-', '')}Frontend",
    app_name=APP_NAME,
    environment=ENVIRONMENT,
    env=env,
    description=f"Static site hosting for {APP_NAME} ({ENVIRONMENT})",
)

# Tags
for stack in [storage_stack, backend_stack, frontend_stack]:
    Tags.of(stack).add("Project", "CSUS-PDF-Modernization")
    Tags.of(stack).add("Environment", ENVIRONMENT)
    Tags.of(stack).add("ManagedBy", "CDK")

app.synth()
