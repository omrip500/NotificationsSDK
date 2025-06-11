# Push Notification SDK - Integration Summary

## Required Dependencies

Add these exact dependencies to your app's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("com.github.omrip500:NotificationsSDK:v1.1.5")
    implementation("com.google.firebase:firebase-messaging:24.1.1")
    implementation(platform("com.google.firebase:firebase-bom:33.15.0"))
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
}
```

Add the Google services plugin:

```kotlin
plugins {
    id("com.google.gms.google-services")
}
```

## Firebase Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Cloud Messaging

### 2. Add Android App
1. Add Android app to Firebase project
2. Download `google-services.json`
3. Place in `app/` directory

### 3. Get Service Account JSON
1. Go to Project Settings → Service Accounts
2. Select **Node.js**
3. Click **"Generate new private key"**
4. Download the JSON file

## Dashboard Registration

### 1. Sign Up
1. Go to [notificationspanel.com](https://notificationspanel.com)
2. Create account
3. Login

### 2. Create Application
1. Click **"New Application"**
2. Enter application name
3. Add interests (comma-separated): `news, sports, technology, weather`
4. Upload Firebase service account JSON
5. Click **"Create Application"**
6. **Copy your App ID**

## Android Integration

### 1. Add Permissions
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 2. Initialize SDK
```java
public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Firebase
        FirebaseApp.initializeApp(this);

        // Initialize SDK with your App ID
        String appId = "6849b32cc94b2490180b8bb4"; // Replace with your App ID
        notificationManager = PushNotificationManager.initialize(this, appId);

        // Configure
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Enable Notifications")
                .setSignupSubtitle("Choose what notifications you'd like to receive")
                .addInterest(new InterestOption("news", "News", "Breaking news alerts", true))
                .addInterest(new InterestOption("sports", "Sports", "Sports updates"))
                .addInterest(new InterestOption("technology", "Technology", "Tech news"))
                .addInterest(new InterestOption("weather", "Weather", "Weather alerts"))
                .build();

        notificationManager.configure(config);

        // Set user
        UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 0.0, 0.0);
        notificationManager.setCurrentUser(user);

        // Start SDK
        notificationManager.start();
    }

    // Launch notification setup when user clicks button
    public void onSetupNotificationsClick(View view) {
        notificationManager.launchNotificationSetupScreen(this);
    }
}
```

## Key Points

1. **Firebase Service Account**: Must be from Project Settings → Service Accounts → Node.js (not google-services.json)
2. **App ID**: Copy exactly from dashboard after creating application
3. **Dependencies**: All listed dependencies are required
4. **Permissions**: POST_NOTIFICATIONS is critical for Android 13+
5. **Initialization Order**: Firebase first, then SDK
6. **User Setup**: Call setCurrentUser() before start()

## Testing

1. Run your app
2. Call `notificationManager.launchNotificationSetupScreen(this)`
3. Select notification preferences
4. Send test notification from dashboard

## Support

- **Documentation**: [GitHub Pages](https://omrip500.github.io/NotificationsSDK/)
- **Repository**: [GitHub](https://github.com/omrip500/NotificationsSDK)
- **Dashboard**: [notificationspanel.com](https://notificationspanel.com)
- **JitPack**: [JitPack.io](https://jitpack.io/#omrip500/NotificationsSDK)
