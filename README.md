# Push Notification SDK

[![](https://jitpack.io/v/omrip500/NotificationsSDK.svg)](https://jitpack.io/#omrip500/NotificationsSDK)

A comprehensive Android SDK for push notifications with Firebase Cloud Messaging and user preference management.

## Quick Start

### 1. Setup Firebase
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add your Android app to the project
3. Download `google-services.json` and place it in your `app/` directory
4. Add Firebase dependencies to your `build.gradle`

### 2. Register Your App
1. Sign up at [notificationspanel.com](https://notificationspanel.com)
2. Create a new application
3. Upload your Firebase service account JSON (from Project Settings → Service Accounts → Generate new private key)
4. Get your unique App ID

### 3. Add SDK to Your Project

#### Option A: JitPack (Recommended)

Add JitPack repository to your `settings.gradle.kts`:

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

Add to your `app/build.gradle.kts`:

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

#### Option B: Manual AAR File

```gradle
dependencies {
    implementation files('libs/pushnotificationsdk-release.aar')
    implementation platform('com.google.firebase:firebase-bom:33.13.0')
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
}
```

### 4. Initialize SDK

```java
public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Firebase first
        FirebaseApp.initializeApp(this);

        // Initialize SDK
        String appId = "6849b32cc94b2490180b8bb4"; // Replace with your App ID from dashboard
        notificationManager = PushNotificationManager.initialize(this, appId);

        // Configure notification categories
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
            .addInterest(new InterestOption("news", "News", "Breaking news alerts"))
            .addInterest(new InterestOption("sports", "Sports", "Sports updates"))
            .build();
        notificationManager.configure(config);

        // Set user information
        UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 0.0, 0.0);
        notificationManager.setCurrentUser(user);

        // Start SDK
        notificationManager.start();
    }

    // Show notification setup screen
    public void onSetupNotificationsClick(View view) {
        notificationManager.launchNotificationSetupScreen(this);
    }
}
```

## Features

- ✅ **Firebase Cloud Messaging** integration
- ✅ **Customizable notification categories**
- ✅ **User preference management**
- ✅ **Material Design UI**
- ✅ **Analytics and reporting**
- ✅ **Easy 4-step integration**

## Requirements

- **Minimum SDK**: 24 (Android 7.0)
- **Target SDK**: 35 (Android 15)
- **Java**: 17+
- **Google Play Services** required

## 📚 Documentation

Complete documentation is available in the `docs/` folder:

- **[Quick Start Guide](docs/quick-start.md)** - Get up and running in 5 minutes
- **[Complete Setup Guide](docs/setup-guide.md)** - Detailed setup instructions
- **[API Reference](docs/api-reference.md)** - Complete API documentation
- **[Usage Examples](docs/usage-examples.md)** - Code examples and best practices
- **[Architecture Overview](docs/architecture.md)** - System architecture and components
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

📖 **[View Full Documentation](docs/README.md)** | 🌐 **[Online Documentation](https://omrip500.github.io/NotificationsSDK/)**

## API Reference

### Core Methods

```java
// Initialize SDK
PushNotificationManager.initialize(Context context, String appId)

// Configure SDK
notificationManager.configure(SDKConfiguration config)

// Set user
notificationManager.setCurrentUser(UserInfo userInfo)

// Start SDK
notificationManager.start()

// Launch UI screens
notificationManager.launchNotificationSetupScreen(Context context)
notificationManager.launchNotificationHistoryScreen(Context context)
notificationManager.launchSettingsScreen(Context context)
```

## Support

- **Documentation**: [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md)
- **Debug Logs**: `adb logcat -s PushSDK`
- **Email Support**: support@yourcompany.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
