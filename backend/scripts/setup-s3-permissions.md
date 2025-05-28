# Setup S3 Permissions for Firebase Service Accounts

## Problem
The current IAM user `firebase-service-reader` doesn't have sufficient permissions to:
- List bucket contents (`s3:ListBucket`)
- Upload files (`s3:PutObject`)
- Delete files (`s3:DeleteObject`)

## Solution

### Option 1: Update IAM Policy via AWS Console

1. **Go to AWS IAM Console**
   - Navigate to Users → `firebase-service-reader`
   - Go to Permissions tab

2. **Create/Update Policy**
   - Click "Add permissions" → "Attach policies directly"
   - Create new policy with the JSON from `aws-iam-policy.json`
   - Name it: `FirebaseServiceAccountsFullAccess`

3. **Attach Policy**
   - Attach the new policy to the `firebase-service-reader` user

### Option 2: Update via AWS CLI

```bash
# Create the policy
aws iam create-policy \
    --policy-name FirebaseServiceAccountsFullAccess \
    --policy-document file://aws-iam-policy.json

# Attach to user
aws iam attach-user-policy \
    --user-name firebase-service-reader \
    --policy-arn arn:aws:iam::120569621850:policy/FirebaseServiceAccountsFullAccess
```

### Option 3: Create New IAM User (Recommended)

If you prefer to create a new user with proper permissions:

```bash
# Create new user
aws iam create-user --user-name firebase-service-manager

# Create access key
aws iam create-access-key --user-name firebase-service-manager

# Create and attach policy
aws iam create-policy \
    --policy-name FirebaseServiceAccountsFullAccess \
    --policy-document file://aws-iam-policy.json

aws iam attach-user-policy \
    --user-name firebase-service-manager \
    --policy-arn arn:aws:iam::120569621850:policy/FirebaseServiceAccountsFullAccess
```

Then update your `.env` file with the new credentials.

## Required Permissions

The policy grants these permissions on `firebase-service-accounts-omripeer` bucket:

- **s3:ListBucket** - List bucket contents
- **s3:GetObject** - Download service account files
- **s3:PutObject** - Upload service account files
- **s3:DeleteObject** - Delete service account files (for cleanup)
- **s3:GetObjectAcl** - Read object permissions
- **s3:PutObjectAcl** - Set object permissions

## Verification

After updating permissions, test with:

```bash
# Test from backend directory
node -e "
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

s3.listObjects({
  Bucket: 'firebase-service-accounts-omripeer',
  Prefix: 'clients/'
}, (err, data) => {
  if (err) console.error('❌ Error:', err.message);
  else console.log('✅ Success:', data.Contents?.length || 0, 'objects found');
});
"
```

## Security Notes

- The policy is restricted to the specific S3 bucket
- Access is limited to the `clients/` folder
- No access to other AWS services
- Consider using IAM roles instead of users for production
