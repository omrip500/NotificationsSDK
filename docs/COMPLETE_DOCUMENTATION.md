# Push Notification SDK - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Firebase Setup](#firebase-setup)
4. [Dashboard Registration](#dashboard-registration)
5. [Android Integration](#android-integration)
6. [API Reference](#api-reference)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)
9. [Architecture](#architecture)

## Overview

The Push Notification SDK is a comprehensive Android library that provides seamless integration with Firebase Cloud Messaging (FCM) and includes a powerful backend service for managing notifications across multiple applications.

### Key Features

- ✅ **Firebase Cloud Messaging** integration
- ✅ **Customizable notification categories**
- ✅ **User preference management**
- ✅ **Material Design UI**
- ✅ **Analytics and reporting**
- ✅ **Multi-application support**
- ✅ **Real-time user segmentation**
- ✅ **Scheduled notifications**

### System Components

1. **Android SDK** - The main library for Android applications
2. **Backend API** - Node.js service for notification management
3. **Web Dashboard** - React-based management interface
4. **Example App** - Demo application showing integration

## Requirements

- **Minimum SDK**: 24 (Android 7.0)
- **Target SDK**: 35 (Android 15)
- **Java**: 17+
- **Google Play Services** required
- **Firebase project** with Cloud Messaging enabled

## Firebase Setup

### Step 1: Create Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter your project name
4. Choose whether to enable Google Analytics (recommended)
5. Select or create a Google Analytics account
6. Click **"Create project"**

### Step 2: Enable Cloud Messaging

1. In your Firebase project, go to **"Build"** → **"Cloud Messaging"**
2. If prompted, enable the Cloud Messaging API

### Step 3: Add Android App to Firebase

1. Click the Android icon to add an Android app
2. Enter your Android package name (e.g., `com.yourcompany.yourapp`)
3. Enter app nickname (optional)
4. Enter SHA-1 certificate fingerprint (optional, but recommended for production)
5. Click **"Register app"**

### Step 4: Download Configuration File

1. Download the `google-services.json` file
2. Place it in your app module directory: `app/google-services.json`
3. **Important**: This file contains sensitive information - do not commit it to public repositories

### Step 5: Get Service Account JSON

1. In Firebase Console, click the **gear icon** → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Select **"Node.js"** from the dropdown
4. Click **"Generate new private key"**
5. Download the JSON file
6. **Keep this file secure** - you'll upload it to the dashboard

## Dashboard Registration

### Step 1: Create Account

1. Go to [notificationspanel.com](https://notificationspanel.com)
2. Click **"Sign Up"**
3. Fill in your details:
   - Email address
   - Password (minimum 8 characters)
   - Confirm password
4. Click **"Create Account"**
5. Verify your email if required

### Step 2: Login to Dashboard

1. Go to [notificationspanel.com](https://notificationspanel.com)
2. Click **"Login"**
3. Enter your credentials
4. Click **"Sign In"**

### Step 3: Create New Application

1. In the dashboard, click **"New Application"**
2. Fill in the application details:
   - **Application Name**: Your app's name (e.g., "My News App")
   - **Interests**: Comma-separated list of notification categories
     - Example: `news, sports, technology, weather, entertainment`
     - These will be available for users to select

### Step 4: Upload Service Account JSON

1. In the **"Firebase Configuration"** section:
2. Click **"Click to upload service account JSON"**
3. Select the service account JSON file you downloaded from Firebase
4. Wait for the upload to complete
5. The Client ID will be generated automatically from your Firebase project

### Step 5: Create Application

1. Click **"Create Application"**
2. **Important**: Copy your **App ID** from the success message
3. Save this App ID - you'll need it in your Android code

Example App ID: `6849b32cc94b2490180b8bb4`

## Android Integration

### Step 1: Add Dependencies

Add these dependencies to your app's `build.gradle.kts` file:

```kotlin
dependencies {
    implementation("com.github.omrip500:NotificationsSDK:v1.1.5")
    implementation("com.google.firebase:firebase-messaging:24.1.1")
    implementation(platform("com.google.firebase:firebase-bom:33.15.0"))
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
}
```

Add the Google services plugin to your app's `build.gradle.kts`:

```kotlin
plugins {
    id("com.google.gms.google-services")
}
```

Add to your project-level `build.gradle.kts`:

```kotlin
plugins {
    id("com.google.gms.google-services") version "4.4.2" apply false
}
```

### Step 2: Add Permissions

Add these permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### Step 3: Initialize SDK

Add this code to your `MainActivity.java`:

```java
public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Firebase
        FirebaseApp.initializeApp(this);

        // Initialize SDK
        initializeSDK();
    }

    private void initializeSDK() {
        // Replace with your App ID from the dashboard
        String appId = "6849b32cc94b2490180b8bb4";
        notificationManager = PushNotificationManager.initialize(this, appId);

        // Configure notification categories
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Enable Notifications")
                .setSignupSubtitle("Choose what notifications you'd like to receive")
                .addInterest(new InterestOption("news", "News", "Breaking news alerts", true))
                .addInterest(new InterestOption("sports", "Sports", "Sports updates"))
                .addInterest(new InterestOption("technology", "Technology", "Tech news"))
                .addInterest(new InterestOption("weather", "Weather", "Weather alerts"))
                .build();

        notificationManager.configure(config);

        // Set user information
        UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 0.0, 0.0);
        notificationManager.setCurrentUser(user);

        // Start the SDK
        notificationManager.start();
    }

    // Launch notification setup screen
    public void onSetupNotificationsClick(View view) {
        notificationManager.launchNotificationSetupScreen(this);
    }
}
```

## API Reference

### PushNotificationManager

The main class for interacting with the SDK.

#### Static Methods

**initialize(Context context, String appId)**
- Initializes the SDK with your application ID
- Parameters: context (Application context), appId (Your unique app ID from dashboard)
- Returns: PushNotificationManager instance

#### Instance Methods

**start()**
- Starts the SDK and enables Firebase messaging
- Call this after initialize() and configuration

**configure(SDKConfiguration configuration)**
- Configures the SDK with custom settings

**setCurrentUser(UserInfo userInfo)**
- Sets the current user information

**registerUser()**
- Registers the current user to receive notifications

**launchNotificationSetupScreen(Context context)**
- Launches the notification setup screen for user preferences

**launchSettingsScreen(Context context)**
- Launches the settings screen for managing preferences

### SDKConfiguration

Configuration class for customizing SDK behavior.

#### Builder Methods

**setSignupTitle(String title)** - Sets the title for the signup screen
**setSignupSubtitle(String subtitle)** - Sets the subtitle for the signup screen
**addInterest(InterestOption interest)** - Adds an interest option for users to select
**showLocationBasedNotifications(boolean show)** - Enables or disables location-based notifications
**build()** - Builds the configuration object

### InterestOption

Represents a notification category that users can subscribe to.

**Constructor**: `InterestOption(String id, String name, String description, boolean defaultSelected)`

### UserInfo

Contains user information for personalized notifications.

**Constructor**: `UserInfo(String userId, String gender, int age, List<String> interests, double latitude, double longitude)`

This documentation provides everything needed to successfully integrate and use the Push Notification SDK in your Android application.
