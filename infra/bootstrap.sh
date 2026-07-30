#!/bin/bash
# Bootstrap script for CDK deployment

set -e

echo "🚀 Setting up CDK infrastructure..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not found"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Run 'aws configure' first"
    exit 1
fi

# Get account ID and region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=${AWS_REGION:-us-west-2}

echo "📍 AWS Account: $ACCOUNT_ID"
echo "📍 Region: $REGION"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source .venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK CLI is not installed. Install it with:"
    echo "   npm install -g aws-cdk"
    exit 1
fi

echo "✅ CDK CLI version: $(cdk --version)"

# Check if account is bootstrapped
echo "🔍 Checking CDK bootstrap status..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION &> /dev/null; then
    echo "⚠️  CDK not bootstrapped in this account/region"
    echo "   Run: cdk bootstrap aws://$ACCOUNT_ID/$REGION"
    read -p "   Bootstrap now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cdk bootstrap aws://$ACCOUNT_ID/$REGION
    else
        echo "❌ Bootstrap required before deployment"
        exit 1
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review the infrastructure: cdk synth"
echo "  2. Preview changes: cdk diff"
echo "  3. Deploy: cdk deploy"
