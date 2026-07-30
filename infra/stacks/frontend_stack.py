"""Frontend stack: S3 + CloudFront for React app hosting."""

from aws_cdk import (
    Stack,
    RemovalPolicy,
    Duration,
    CfnOutput,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_iam as iam,
)
from constructs import Construct


class FrontendStack(Stack):
    """
    Static site hosting for the React frontend.

    Resources:
    - S3 bucket for build artifacts
    - CloudFront distribution with OAC
    - Proper cache policies for SPA
    """

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        app_name: str,
        environment: str,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # S3 bucket for the static site
        site_bucket = s3.Bucket(
            self,
            "SiteBucket",
            bucket_name=f"{app_name}-frontend-{environment}",
            encryption=s3.BucketEncryption.S3_MANAGED,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.RETAIN,
            auto_delete_objects=False,
            versioned=True,
            lifecycle_rules=[
                s3.LifecycleRule(
                    enabled=True,
                    noncurrent_version_expiration=Duration.days(30),
                )
            ],
        )

        # Origin Access Control for CloudFront -> S3 (recommended over OAI)
        oac = cloudfront.CfnOriginAccessControl(
            self,
            "OAC",
            origin_access_control_config=cloudfront.CfnOriginAccessControl.OriginAccessControlConfigProperty(
                name=f"{app_name}-oac-{environment}",
                origin_access_control_origin_type="s3",
                signing_behavior="always",
                signing_protocol="sigv4",
            ),
        )

        # Cache policy for hashed assets (long cache)
        asset_cache_policy = cloudfront.CachePolicy(
            self,
            "AssetCachePolicy",
            cache_policy_name=f"{app_name}-assets-{environment}",
            comment="Long cache for hashed assets",
            default_ttl=Duration.days(365),
            max_ttl=Duration.days(365),
            min_ttl=Duration.days(365),
            enable_accept_encoding_gzip=True,
            enable_accept_encoding_brotli=True,
        )

        # Cache policy for entry points (no cache)
        entry_cache_policy = cloudfront.CachePolicy(
            self,
            "EntryCachePolicy",
            cache_policy_name=f"{app_name}-entry-{environment}",
            comment="No cache for index.html",
            default_ttl=Duration.seconds(0),
            max_ttl=Duration.seconds(0),
            min_ttl=Duration.seconds(0),
        )

        # CloudFront distribution
        distribution = cloudfront.Distribution(
            self,
            "Distribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.S3BucketOrigin(site_bucket),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cache_policy=entry_cache_policy,
                allowed_methods=cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                compress=True,
            ),
            additional_behaviors={
                "/assets/*": cloudfront.BehaviorOptions(
                    origin=origins.S3BucketOrigin(site_bucket),
                    viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cache_policy=asset_cache_policy,
                    compress=True,
                ),
            },
            default_root_object="index.html",
            error_responses=[
                cloudfront.ErrorResponse(
                    http_status=404,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
                cloudfront.ErrorResponse(
                    http_status=403,
                    response_http_status=200,
                    response_page_path="/index.html",
                    ttl=Duration.seconds(0),
                ),
            ],
            comment=f"{app_name} frontend ({environment})",
            price_class=cloudfront.PriceClass.PRICE_CLASS_100,  # US/EU only
        )

        # Wire up OAC manually (CDK doesn't have L2 construct yet)
        cfn_distribution = distribution.node.default_child
        cfn_distribution.add_property_override(
            "DistributionConfig.Origins.0.OriginAccessControlId",
            oac.attr_id,
        )
        cfn_distribution.add_property_override(
            "DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity",
            "",
        )

        # Grant CloudFront access to S3
        site_bucket.add_to_resource_policy(
            iam.PolicyStatement(
                actions=["s3:GetObject"],
                resources=[site_bucket.arn_for_objects("*")],
                principals=[iam.ServicePrincipal("cloudfront.amazonaws.com")],
                conditions={
                    "StringEquals": {
                        "AWS:SourceArn": f"arn:aws:cloudfront::{self.account}:distribution/{distribution.distribution_id}"
                    }
                },
            )
        )

        # Outputs
        CfnOutput(
            self,
            "BucketName",
            value=site_bucket.bucket_name,
            description="S3 bucket for frontend assets",
        )

        CfnOutput(
            self,
            "DistributionId",
            value=distribution.distribution_id,
            description="CloudFront distribution ID",
        )

        CfnOutput(
            self,
            "CloudFrontDomain",
            value=f"https://{distribution.distribution_domain_name}",
            description="CloudFront URL",
        )

        CfnOutput(
            self,
            "DistributionDomainName",
            value=distribution.distribution_domain_name,
            description="CloudFront domain name (for DNS setup)",
        )

        # Store for cross-stack reference
        self.site_bucket = site_bucket
        self.distribution = distribution
