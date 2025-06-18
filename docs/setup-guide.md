# Complete Setup Guide

This guide provides detailed instructions for setting up the Push Notification SDK in your Android application.

## Prerequisites

- Android Studio 4.0+
- Minimum SDK 24 (Android 7.0)
- Target SDK 35 (Android 15)
- Java 17+
- Google Play Services

## 1. Firebase Project Setup

### 1.1 Create Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter your project name
4. Choose whether to enable Google Analytics (recommended)
5. Select or create a Google Analytics account
6. Click **"Create project"**

### 1.2 Enable Cloud Messaging

1. In your Firebase project, go to **"Build"** → **"Cloud Messaging"**
2. If prompted, enable the Cloud Messaging API
3. Note your **Server key** and **Sender ID** (for reference)

### 1.3 Add Android App to Firebase

1. Click the Android icon to add an Android app
2. Enter your Android package name (e.g., `com.yourcompany.yourapp`)
3. Enter app nickname (optional)
4. Enter SHA-1 certificate fingerprint (optional, but recommended for production)
5. Click **"Register app"**

### 1.4 Download Configuration File

1. Download the `google-services.json` file
2. Place it in your app module directory: `app/google-services.json`
3. **Important**: This file contains sensitive information - do not commit it to public repositories

### 1.5 Get Service Account JSON

1. In Firebase Console, click the **gear icon** → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Select **"Node.js"** from the dropdown
4. Click **"Generate new private key"**
5. Download the JSON file
6. **Keep this file secure** - you'll upload it to the dashboard

## 2. Android Project Configuration

### 2.1 Project-level build.gradle.kts

Add the Google services plugin to your project-level `build.gradle.kts`:

```kotlin
plugins {
    id("com.android.application") version "8.1.4" apply false
    id("org.jetbrains.kotlin.android") version "1.9.0" apply false
    id("com.google.gms.google-services") version "4.4.2" apply false
}
```

### 2.2 App-level build.gradle.kts

Add the plugin and dependencies to your app-level `build.gradle.kts`:

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.yourcompany.yourapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.yourcompany.yourapp"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Push Notification SDK
    implementation("com.github.omrip500:NotificationsSDK:v1.2.0")
    
    // Firebase dependencies
    implementation("com.google.firebase:firebase-messaging:24.1.1")
    implementation(platform("com.google.firebase:firebase-bom:33.15.0"))
    
    // Networking dependencies
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    // Other dependencies...
}
```

### 2.3 Add Required Permissions

Add these permissions to your `AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Required permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">
        
        <!-- Your activities -->
        
    </application>
</manifest>
```

## 3. Dashboard Registration

### 3.1 Create Account

1. Go to [notificationspanel.com](https://notificationspanel.com)
2. Click **"Sign Up"**
3. Fill in your details:
   - Email address
   - Password (minimum 8 characters)
   - Confirm password
4. Click **"Create Account"**
5. Verify your email if required

### 3.2 Login to Dashboard

1. Go to [notificationspanel.com](https://notificationspanel.com)
2. Click **"Login"**
3. Enter your credentials
4. Click **"Sign In"**

### 3.3 Create New Application

1. In the dashboard, click **"New Application"**
2. Fill in the application details:
   - **Application Name**: Your app's name (e.g., "My News App")
   - **Interests**: Comma-separated list of notification categories
     - Example: `news, sports, technology, weather, entertainment`
     - These will be available for users to select

### 3.4 Upload Service Account JSON

1. In the **"Firebase Configuration"** section:
2. Click **"Click to upload service account JSON"**
3. Select the service account JSON file you downloaded from Firebase
4. Wait for the upload to complete
5. The Client ID will be generated automatically from your Firebase project

### 3.5 Create Application

1. Click **"Create Application"**
2. **Important**: Copy your **App ID** from the success message
3. Save this App ID - you'll need it in your Android code

Example App ID: `YOUR_APP_ID_HERE`

## 4. SDK Integration

### 4.1 Initialize in MainActivity

```java
public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Firebase (required)
        FirebaseApp.initializeApp(this);

        // Initialize SDK
        initializeSDK();
    }

    private void initializeSDK() {
        // Replace with your actual App ID from the dashboard
        String appId = "YOUR_APP_ID_HERE";
        notificationManager = PushNotificationManager.initialize(this, appId);

        // Configure the SDK
        configureSDK();

        // Set user information
        setCurrentUser();

        // Start the SDK
        notificationManager.start();
    }
}
```

Continue reading the [API Reference](api-reference.md) for complete integration details.
