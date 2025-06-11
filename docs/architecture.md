# Architecture Overview

This document provides a comprehensive overview of the Push Notification SDK architecture and system components.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android App   │    │   Web Dashboard │    │  Backend API    │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │    SDK    │  │◄──►│  │   React   │  │◄──►│  │  Node.js  │  │
│  │           │  │    │  │    App    │  │    │  │  Express  │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                                              │
         │              ┌─────────────────┐             │
         └─────────────►│ Firebase Cloud  │◄────────────┘
                        │   Messaging     │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │    MongoDB      │
                        │   Database      │
                        └─────────────────┘
```

## Components Overview

### 1. Android SDK (`pushnotificationsdk/`)

The core Android library that integrates into client applications.

**Key Classes:**
- `PushNotificationManager` - Main SDK interface
- `SDKConfiguration` - Configuration management
- `UserInfo` - User data model
- `InterestOption` - Notification category model
- `PushApiService` - API communication
- `NotificationSetupActivity` - User preference UI
- `SettingsActivity` - Settings management UI

**Responsibilities:**
- Firebase Cloud Messaging integration
- User preference management
- API communication with backend
- UI screens for notification setup
- Local data persistence
- Permission handling

### 2. Backend API Service (`backend/`)

Node.js/Express server providing the API for the entire system.

**Key Components:**
- `server.js` - Main server entry point
- `controllers/` - API endpoint handlers
- `models/` - MongoDB data models
- `routes/` - API route definitions
- `middleware/` - Authentication and validation
- `services/` - Business logic services

**API Endpoints:**
- `/api/auth/*` - User authentication
- `/api/applications/*` - Application management
- `/api/devices/*` - Device registration and management
- `/api/notifications/*` - Notification sending and history
- `/api/segments/*` - User segmentation
- `/api/stats/*` - Analytics and statistics

### 3. Web Dashboard (`react-dashboard/`)

React-based web application for managing applications and sending notifications.

**Key Features:**
- Application creation and management
- Firebase service account upload
- Notification composition and sending
- User analytics and statistics
- Scheduled notification management
- User segmentation tools

### 4. Example App (`app/`)

Demo Android application showing SDK integration.

**Purpose:**
- Demonstrate SDK usage
- Test SDK functionality
- Provide integration examples
- Validate new features

## Data Flow

### 1. Application Registration

```
Developer → Web Dashboard → Backend API → MongoDB
    │              │             │
    │              │             └─ Store app config
    │              │
    │              └─ Upload Firebase service account
    │
    └─ Get App ID for SDK integration
```

### 2. Device Registration

```
Android App → SDK → Backend API → MongoDB
     │         │         │           │
     │         │         │           └─ Store device info
     │         │         │
     │         │         └─ Validate app ID
     │         │
     │         └─ Get FCM token
     │
     └─ Initialize with App ID
```

### 3. Notification Flow

```
Web Dashboard → Backend API → Firebase FCM → Android Device
      │              │              │              │
      │              │              │              └─ Display notification
      │              │              │
      │              │              └─ Send to FCM token
      │              │
      │              └─ Process targeting rules
      │
      └─ Compose notification
```

## Database Schema

### Applications Collection

```javascript
{
  _id: ObjectId,
  name: String,
  platform: String,
  user: ObjectId, // Reference to user
  clientId: String, // Firebase project ID
  interests: [String], // Available notification categories
  createdAt: Date,
  updatedAt: Date
}
```

### Devices Collection

```javascript
{
  _id: ObjectId,
  appId: ObjectId, // Reference to application
  fcmToken: String,
  userId: String, // App-specific user ID
  userInfo: {
    gender: String,
    age: Number,
    interests: [String],
    location: {
      latitude: Number,
      longitude: Number
    }
  },
  isActive: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications Collection

```javascript
{
  _id: ObjectId,
  appId: ObjectId,
  title: String,
  body: String,
  imageUrl: String,
  targetingRules: {
    interests: [String],
    gender: String,
    ageRange: { min: Number, max: Number },
    location: { radius: Number, lat: Number, lng: Number }
  },
  scheduledFor: Date,
  status: String, // 'draft', 'scheduled', 'sent', 'failed'
  stats: {
    sent: Number,
    delivered: Number,
    clicked: Number
  },
  createdAt: Date,
  sentAt: Date
}
```

## Security Architecture

### 1. Authentication

- **Web Dashboard**: JWT-based authentication
- **SDK**: App ID validation
- **API**: Bearer token authentication

### 2. Data Protection

- **Firebase Service Accounts**: Stored encrypted in AWS S3
- **API Keys**: Environment variables only
- **User Data**: Minimal collection, encrypted at rest

### 3. Access Control

- **Multi-tenant**: Each app isolated by App ID
- **User Permissions**: Dashboard users can only access their apps
- **API Validation**: All requests validated against app ownership

## Scalability Considerations

### 1. Horizontal Scaling

- **Backend API**: Stateless design allows multiple instances
- **Database**: MongoDB supports sharding
- **CDN**: Static assets served via CDN

### 2. Performance Optimization

- **Caching**: Redis for frequently accessed data
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections

### 3. Monitoring

- **Health Checks**: Endpoint monitoring
- **Error Tracking**: Comprehensive logging
- **Performance Metrics**: Response time monitoring

## Integration Points

### 1. Firebase Integration

- **Cloud Messaging**: Push notification delivery
- **Service Accounts**: Server-to-server authentication
- **Project Management**: Multi-project support

### 2. AWS Integration

- **S3 Storage**: Service account file storage
- **EC2 Hosting**: Backend API hosting
- **CloudWatch**: Monitoring and logging

### 3. Third-party Services

- **MongoDB Atlas**: Database hosting
- **JitPack**: SDK distribution
- **GitHub**: Source code management

## Development Workflow

### 1. SDK Development

```
Code Changes → Local Testing → Example App Testing → JitPack Release
```

### 2. Backend Development

```
Code Changes → Local Testing → Staging Deployment → Production Deployment
```

### 3. Dashboard Development

```
Code Changes → Local Testing → Build → S3 Deployment
```

## Deployment Architecture

### Production Environment

```
Internet → Load Balancer → Backend API Instances → MongoDB Atlas
    │                           │
    │                           └─ AWS S3 (Service Accounts)
    │
    └─ S3 Static Website (Dashboard)
```

### Development Environment

```
Local Machine → Local Backend → Local MongoDB
      │              │
      │              └─ Local S3 (MinIO)
      │
      └─ Local React Dev Server
```

This architecture ensures scalability, security, and maintainability while providing a seamless experience for both developers integrating the SDK and end users receiving notifications.
