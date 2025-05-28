# Multi-Client Firebase Support Setup Guide

## Overview

This implementation allows your backend to support multiple clients, each with their own Firebase project, while maintaining a single backend service.

## How It Works

1. **Dynamic Firebase App Loading**: Each client has their own Firebase service account stored in S3
2. **Client Identification**: Every device registration includes a `clientId`
3. **Grouped Notifications**: When sending notifications, devices are grouped by `clientId` and sent using the appropriate Firebase app

## S3 Structure

Your S3 bucket should be organized as follows:

```
firebase-service-accounts-omripeer/
├── clients/
│   ├── client-1.json          # Service account for client-1
│   ├── client-2.json          # Service account for client-2
│   ├── acme-corp.json         # Service account for acme-corp
│   └── another-client.json    # Service account for another-client
```

## Required Changes for Clients

### 1. Device Registration

When registering a device, clients must now include `clientId`:

```javascript
// Before
{
  "token": "fcm_token_here",
  "appId": "app_object_id",
  "userInfo": { ... }
}

// After
{
  "token": "fcm_token_here",
  "appId": "app_object_id",
  "clientId": "your-client-id",  // NEW REQUIRED FIELD
  "userInfo": { ... }
}
```

### 2. Application Creation

When creating applications, include `clientId`:

```javascript
// Before
{
  "name": "My App",
  "platform": "android",
  "interests": ["sports", "news"]
}

// After
{
  "name": "My App",
  "platform": "android",
  "clientId": "your-client-id",  // NEW REQUIRED FIELD
  "interests": ["sports", "news"]
}
```

## Setting Up a New Client

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Cloud Messaging
4. Generate a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### Step 2: Create Application via Web Portal

1. **Login to Web Portal**: Access the notification management portal
2. **Create New Application**: Click "New Application" button
3. **Fill Basic Information**:
   - Application Name
   - Platform (Android/iOS/Web)
   - Interests (comma-separated, optional)
4. **Generate Client ID**: Click "Generate" to create a unique client ID
5. **Upload Service Account**:
   - Drag & drop or click to upload the JSON file from Step 1
   - Wait for upload confirmation
6. **Create Application**: Click "Create Application" (only enabled after successful upload)

### Step 3: Update Client App

1. Replace `google-services.json` in your Android app with the new one from your Firebase project
2. Update your device registration calls to include the `clientId` from Step 2
3. The `clientId` is displayed in the application card and Firebase Settings tab

### Alternative: Manual S3 Upload (Advanced Users)

1. Rename the downloaded file to `{clientId}.json` (e.g., `acme-corp.json`)
2. Upload to S3 bucket: `firebase-service-accounts-omripeer/clients/`
3. Ensure the file has proper permissions

## Managing Existing Applications

### Updating Service Account for Existing Apps

1. **Access Application**: Click on your application card in the dashboard
2. **Go to Firebase Settings**: Click on the "Firebase Settings" tab
3. **Check Current Status**: View current service account status and details
4. **Upload New Service Account**:
   - Use the drag & drop area to select a new JSON file
   - Click "Update Service Account"
   - Wait for confirmation
5. **Verify Update**: The status will refresh automatically showing new details

### Service Account Status Information

The Firebase Settings tab shows:

- **Status**: Active (green) or Missing (red)
- **Project ID**: Firebase project identifier
- **Client Email**: Service account email
- **Last Modified**: When the file was last updated
- **File Size**: Size of the uploaded JSON file

### Troubleshooting

- **"Service account not found"**: Upload a service account file via the Firebase Settings tab
- **"Invalid JSON format"**: Ensure you're uploading a valid Firebase service account JSON file
- **"Missing required fields"**: The JSON file must contain all required Firebase service account fields

## API Changes

### New Endpoints

#### Firebase Service Account Management

- **POST /api/applications/upload-service-account** - Upload service account to S3
- **GET /api/applications/generate-client-id** - Generate unique client ID
- **GET /api/applications/:appId/service-account-status** - Check service account status
- **PUT /api/applications/:appId/service-account** - Update existing service account

### Modified Endpoints

#### Device Registration Endpoint

- **Endpoint**: `POST /api/devices/register`
- **New Required Field**: `clientId`

#### Application Creation Endpoint

- **Endpoint**: `POST /api/applications/create`
- **New Required Field**: `clientId`

## Database Schema Changes

### Device Model

```javascript
{
  token: String,
  appId: ObjectId,
  clientId: String,        // NEW FIELD
  userInfo: { ... }
}
```

### Application Model

```javascript
{
  name: String,
  platform: String,
  user: ObjectId,
  clientId: String,        // NEW FIELD
  interests: [String]
}
```

## Notification Behavior

When sending notifications:

1. **Automatic Grouping**: Devices are automatically grouped by `clientId`
2. **Separate Sending**: Each group is sent using the appropriate Firebase app
3. **Aggregated Results**: Results are combined and returned with client count information

### Example Response

```javascript
{
  "message": "Notification sent to 150 devices across 3 clients",
  "successCount": 150,
  "failures": 0,
  "clientsCount": 3
}
```

## Monitoring & Debugging

### Logs to Watch For

- `🔍 Loading service account for client: {clientId}`
- `🚀 Created new Firebase app for client: {clientId}`
- `✅ Using cached Firebase app for client: {clientId}`
- `📤 Sending to X devices for client: {clientId}`

### Common Issues

1. **Service account not found**: Check S3 bucket and file naming
2. **Invalid service account**: Verify the JSON file is valid and has correct permissions
3. **Missing clientId**: Ensure all device registrations include clientId

## Migration Guide

### For Existing Devices

Existing devices without `clientId` will need to be updated. You can:

1. **Gradual Migration**: Update your SDK to include clientId in new registrations
2. **Bulk Update**: Run a migration script to assign clientIds to existing devices
3. **Default Client**: Temporarily assign a default clientId to existing devices

### Migration Script Example

```javascript
// Update existing devices with a default clientId
await Device.updateMany(
  { clientId: { $exists: false } },
  { $set: { clientId: "default-client" } }
);
```

## Security Considerations

1. **S3 Permissions**: Ensure only your backend can read the service account files
2. **Service Account Permissions**: Each Firebase service account should have minimal required permissions
3. **Client Validation**: Consider implementing clientId validation to prevent unauthorized usage

## Testing

1. **Upload Test Service Account**: Upload a test service account to S3
2. **Register Test Device**: Register a device with the test clientId
3. **Send Test Notification**: Verify notifications are sent using the correct Firebase app
4. **Check Logs**: Monitor logs for proper Firebase app creation and usage
