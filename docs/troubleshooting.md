# Troubleshooting Guide

Common issues and solutions when using the Push Notification SDK.

## Setup Issues

### 1. SDK Initialization Fails

**Problem:** `IllegalArgumentException: App ID cannot be null or empty`

**Solution:**
```java
// Make sure you're using a valid App ID from the dashboard
String appId = "YOUR_APP_ID_HERE"; // Replace with your actual App ID
notificationManager = PushNotificationManager.initialize(this, appId);
```

**Checklist:**
- ✅ App ID copied correctly from dashboard
- ✅ No extra spaces or characters
- ✅ App ID is not null or empty string

### 2. Firebase Initialization Error

**Problem:** `FirebaseApp is not initialized`

**Solution:**
```java
// Always initialize Firebase before SDK
FirebaseApp.initializeApp(this);
notificationManager = PushNotificationManager.initialize(this, appId);
```

**Checklist:**
- ✅ `google-services.json` in `app/` directory
- ✅ Google services plugin applied in `build.gradle.kts`
- ✅ Firebase dependencies added correctly

### 3. Dependency Resolution Issues

**Problem:** Build fails with dependency conflicts

**Solution:**
```kotlin
dependencies {
    // Use exact versions to avoid conflicts
    implementation("com.github.omrip500:NotificationsSDK:v1.2.0")
    implementation("com.google.firebase:firebase-messaging:24.1.1")
    implementation(platform("com.google.firebase:firebase-bom:33.15.0"))
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
}
```

**Checklist:**
- ✅ All required dependencies added
- ✅ Compatible versions used
- ✅ No duplicate dependencies

## Permission Issues

### 1. Notifications Not Appearing

**Problem:** Notifications sent but not displayed on device

**Solution:**
```java
// Check and request permissions
if (!notificationManager.hasNotificationPermissions()) {
    notificationManager.requestNotificationPermissions(this);
}
```

**Checklist:**
- ✅ `POST_NOTIFICATIONS` permission in manifest
- ✅ User granted notification permission
- ✅ App not in battery optimization whitelist
- ✅ Notification channels enabled (Android 8+)



## Dashboard Issues

### 1. Service Account Upload Fails

**Problem:** "Invalid service account JSON" error

**Solution:**
1. Download service account from Firebase Console
2. Go to Project Settings → Service Accounts
3. Select "Node.js" and click "Generate new private key"
4. Upload the downloaded JSON file (not any other Firebase config file)

**Common Mistakes:**
- ❌ Uploading `google-services.json` instead of service account JSON
- ❌ Uploading modified or corrupted JSON file
- ❌ Using service account from wrong Firebase project

### 2. App Creation Fails

**Problem:** "Application with this Firebase project already exists"

**Solution:**
- Each Firebase project can only be used for one application in the dashboard
- Create a new Firebase project for each application
- Or delete the existing application if you want to recreate it

### 3. Can't Send Notifications

**Problem:** "No devices registered" or notifications not sending

**Solution:**
1. Verify devices are registered:
   ```java
   notificationManager.registerUser();
   ```
2. Check device status in dashboard
3. Verify targeting rules don't exclude all users

## API Communication Issues

### 1. Network Connection Errors

**Problem:** SDK can't connect to backend API

**Solution:**
```xml
<!-- Add network security config if needed -->
<application
    android:networkSecurityConfig="@xml/network_security_config">
```

**Checklist:**
- ✅ Device has internet connection
- ✅ API server is running
- ✅ Firewall not blocking requests
- ✅ Correct API endpoint configured

### 2. Registration Fails

**Problem:** Device registration returns error

**Solution:**
```java
// Ensure user is set before registration
UserInfo user = new UserInfo("user123", "male", 25, interests, 0.0, 0.0);
notificationManager.setCurrentUser(user);
notificationManager.registerUser();
```

**Debug Steps:**
1. Check logs for error details
2. Verify App ID is correct
3. Ensure user info is valid
4. Check network connectivity

## Runtime Issues

### 1. Memory Leaks

**Problem:** App crashes with OutOfMemoryError

**Solution:**
```java
// Use application context for SDK initialization
notificationManager = PushNotificationManager.initialize(getApplicationContext(), appId);
```

### 2. UI Thread Blocking

**Problem:** App becomes unresponsive

**Solution:**
```java
// SDK operations are already async, but ensure UI updates on main thread
runOnUiThread(() -> {
    // Update UI here
});
```

### 3. Crash on Configuration Change

**Problem:** App crashes when rotating device

**Solution:**
```java
// Initialize SDK in Application class or use singleton pattern
public class MyApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        FirebaseApp.initializeApp(this);
        // Initialize SDK here
    }
}
```

## Testing Issues

### 1. Notifications Not Received in Debug

**Problem:** Test notifications not appearing during development

**Solution:**
1. Use a physical device (emulator may have issues)
2. Ensure app is in background when testing
3. Check device notification settings
4. Verify FCM token is valid

### 2. Emulator Issues

**Problem:** SDK doesn't work in Android emulator

**Solution:**
- Use emulator with Google Play Services
- Or test on physical device
- Ensure emulator has internet connection

## Production Issues

### 1. High Battery Usage

**Problem:** App drains battery quickly

**Solution:**
```java
// SDK is optimized, but ensure you're not calling APIs excessively
// Use SDK methods as intended, don't poll for updates
```

### 2. Notification Delivery Issues

**Problem:** Some users not receiving notifications

**Checklist:**
- ✅ Users have granted notification permissions
- ✅ App not killed by battery optimization
- ✅ Targeting rules are correct
- ✅ FCM tokens are up to date
- ✅ Users have active internet connection

## Debug Tools

### 1. Enable Debug Logging

```java
// Add to your Application class
if (BuildConfig.DEBUG) {
    // SDK will log debug information
}
```

### 2. Check FCM Token

```java
FirebaseMessaging.getInstance().getToken()
    .addOnCompleteListener(new OnCompleteListener<String>() {
        @Override
        public void onComplete(@NonNull Task<String> task) {
            if (!task.isSuccessful()) {
                Log.w("FCM", "Fetching FCM registration token failed", task.getException());
                return;
            }
            String token = task.getResult();
            Log.d("FCM", "FCM Registration Token: " + token);
        }
    });
```

### 3. Test Notification Manually

Use Firebase Console to send test notifications:
1. Go to Firebase Console → Cloud Messaging
2. Click "Send your first message"
3. Enter your app's FCM token
4. Send test notification

## Getting Help

### 1. Check Logs

Always check Android logs for error details:
```bash
adb logcat | grep -E "(PushSDK|FCM|Firebase)"
```

### 2. Verify Configuration

Double-check all configuration steps:
- Dependencies added correctly
- Permissions granted
- Firebase project configured
- Service account uploaded
- App ID correct

### 3. Contact Support

If issues persist:
- Create GitHub issue with logs and configuration details
- Contact support through dashboard
- Email: support@notificationspanel.com

### 4. Common Log Messages

**Success Messages:**
- `🚀 SDK started with App ID: xxx`
- `✅ Device registered successfully`
- `✅ SDK configured successfully`

**Warning Messages:**
- `⚠️ POST_NOTIFICATIONS permission not granted`
- `⚠️ Current user not set`

**Error Messages:**
- `❌ App ID cannot be null or empty`
- `❌ Current user not set. Call setCurrentUser() first`
- `❌ Failed to register device`
