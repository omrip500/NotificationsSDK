# PushNotificationsSDK - JitPack Integration

[![](https://jitpack.io/v/omrip500/NotificationsSDK.svg)](https://jitpack.io/#omrip500/NotificationsSDK)

## Overview

The PushNotificationsSDK is now available via JitPack, making it easy to integrate into any Android project without manual SDK file management.

## Integration Steps

### Step 1: Add JitPack Repository

Add the JitPack repository to your project's `settings.gradle.kts` file:

```kotlin
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}
```

### Step 2: Add SDK Dependency

Add the SDK dependency to your app's `build.gradle.kts` file:

```kotlin
dependencies {
    implementation("com.github.omrip500:NotificationsSDK:v1.2.0")

    // Required dependencies
    implementation("com.google.firebase:firebase-messaging:24.1.1")
    implementation(platform("com.google.firebase:firebase-bom:33.15.0"))
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
}
```

### Step 3: Apply Google Services Plugin

In your app's `build.gradle.kts`, apply the Google Services plugin:

```kotlin
plugins {
    id("com.android.application")
    id("com.google.gms.google-services")
}
```

And in your project's root `build.gradle.kts`:

```kotlin
plugins {
    id("com.google.gms.google-services") version "4.4.2" apply false
}
```

## Usage

### Initialize the SDK

```java
import com.example.pushnotificationsdk.PushNotificationManager;

public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        // Initialize with your app ID
        String appId = "YOUR_APP_ID_HERE";
        notificationManager = PushNotificationManager.initialize(this, appId);
    }
}
```

### Launch Notification Setup Screen

```java
// Launch notification setup screen
notificationManager.launchNotificationSetupScreen(this);
```

### Set User Information

```java
// Set user information
UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 0.0, 0.0);
notificationManager.setCurrentUser(user);
notificationManager.start();
```

## Available Versions

- `v1.2.0` - Latest stable release with production API endpoint
- `main-SNAPSHOT` - Latest development version (not recommended for production)

## Requirements

- Android API 24 (Android 7.0) or higher
- Firebase project with FCM enabled
- `google-services.json` file in your app module

## Support

For issues and questions:
- GitHub Issues: [https://github.com/omrip500/NotificationsSDK/issues](https://github.com/omrip500/NotificationsSDK/issues)
- Documentation: See `DEVELOPER_DOCUMENTATION.md` in the repository

## License

This SDK is available under the terms specified in the repository license.
