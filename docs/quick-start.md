# Quick Start Guide

Get your Android app sending push notifications in 5 minutes!

## Step 1: Add Dependencies

Add these dependencies to your app's `build.gradle.kts` file:

```kotlin
dependencies {
    implementation("com.github.omrip500:NotificationsSDK:v1.2.0")
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

## Step 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard
4. Enable Cloud Messaging in your project

### 2.2 Add Android App
1. Click "Add app" → Android
2. Enter your package name (e.g., `com.example.myapp`)
3. Download `google-services.json`
4. Place it in your `app/` directory

### 2.3 Get Service Account JSON
1. In Firebase Console, go to Project Settings (gear icon)
2. Go to "Service accounts" tab
3. Select "Node.js" 
4. Click "Generate new private key"
5. Download the JSON file

## Step 3: Register Your App

### 3.1 Sign Up
1. Go to [notificationspanel.com](https://notificationspanel.com)
2. Click "Sign Up"
3. Create your account
4. Log in to the dashboard

### 3.2 Create Application
1. Click "New Application"
2. Enter your application name
3. Add interests (comma-separated): `news, sports, technology, weather`
4. Upload your Firebase service account JSON file
5. Click "Create Application"
6. **Copy your App ID** - you'll need this!

## Step 4: Initialize SDK

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
        String appId = "YOUR_APP_ID_HERE";
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

## Step 5: Add Permissions

Add these permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

## 🎉 You're Done!

Your app is now ready to receive push notifications! 

### Next Steps:
- [Complete Setup Guide](setup-guide.md) for advanced configuration
- [API Reference](api-reference.md) for all available methods
- [Usage Examples](usage-examples.md) for more code examples

### Test Your Integration:
1. Run your app
2. Call `notificationManager.launchNotificationSetupScreen(this)`
3. Select notification preferences
4. Send a test notification from the web dashboard
