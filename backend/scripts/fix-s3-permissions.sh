#!/bin/bash

# Script to fix S3 permissions for Firebase service accounts

echo "🔧 Fixing S3 permissions for Firebase service accounts..."

# Variables
BUCKET_NAME="firebase-service-accounts-omripeer"
USER_NAME="firebase-service-reader"
POLICY_NAME="FirebaseServiceAccountsFullAccess"
AWS_ACCOUNT_ID="120569621850"

echo "📋 Configuration:"
echo "   Bucket: $BUCKET_NAME"
echo "   User: $USER_NAME"
echo "   Policy: $POLICY_NAME"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if user has AWS credentials configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Create the IAM policy
echo "📝 Creating IAM policy..."

cat > /tmp/firebase-s3-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListBucketAccess",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::$BUCKET_NAME"
        },
        {
            "Sid": "ObjectAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:GetObjectAcl",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

# Create or update the policy
POLICY_ARN="arn:aws:iam::$AWS_ACCOUNT_ID:policy/$POLICY_NAME"

if aws iam get-policy --policy-arn "$POLICY_ARN" &> /dev/null; then
    echo "📝 Policy exists, updating..."
    aws iam create-policy-version \
        --policy-arn "$POLICY_ARN" \
        --policy-document file:///tmp/firebase-s3-policy.json \
        --set-as-default
    
    if [ $? -eq 0 ]; then
        echo "✅ Policy updated successfully"
    else
        echo "❌ Failed to update policy"
        exit 1
    fi
else
    echo "📝 Creating new policy..."
    aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document file:///tmp/firebase-s3-policy.json \
        --description "Full access to Firebase service accounts S3 bucket"
    
    if [ $? -eq 0 ]; then
        echo "✅ Policy created successfully"
    else
        echo "❌ Failed to create policy"
        exit 1
    fi
fi

# Attach policy to user
echo "🔗 Attaching policy to user..."
aws iam attach-user-policy \
    --user-name "$USER_NAME" \
    --policy-arn "$POLICY_ARN"

if [ $? -eq 0 ]; then
    echo "✅ Policy attached to user successfully"
else
    echo "❌ Failed to attach policy to user"
    exit 1
fi

# Test the permissions
echo "🧪 Testing S3 permissions..."

# Test ListBucket
aws s3 ls "s3://$BUCKET_NAME/" &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ ListBucket permission works"
else
    echo "❌ ListBucket permission failed"
fi

# Test PutObject (create a test file)
echo "test" | aws s3 cp - "s3://$BUCKET_NAME/test-permissions.txt" &> /dev/null
if [ $? -eq 0 ]; then
    echo "✅ PutObject permission works"
    
    # Clean up test file
    aws s3 rm "s3://$BUCKET_NAME/test-permissions.txt" &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ DeleteObject permission works"
    else
        echo "⚠️ DeleteObject permission failed (test file may remain)"
    fi
else
    echo "❌ PutObject permission failed"
fi

# Clean up
rm -f /tmp/firebase-s3-policy.json

echo ""
echo "🎉 S3 permissions setup completed!"
echo ""
echo "📋 Summary:"
echo "   ✅ Policy '$POLICY_NAME' created/updated"
echo "   ✅ Policy attached to user '$USER_NAME'"
echo "   ✅ Permissions tested"
echo ""
echo "🚀 You can now upload service accounts via the web portal!"
