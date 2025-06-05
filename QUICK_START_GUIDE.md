# Quick Start Guide - Push Notification SDK

## 🚀 Get Started in 10 Minutes

### Step 1: Firebase Setup (3 minutes)

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Enter project name → Enable Analytics → Create

2. **Add Android App**
   - Click "Add app" → Select Android
   - Enter your package name (e.g., `com.yourcompany.yourapp`)
   - Download `google-services.json`
   - Place file in `app/` directory

3. **Add Firebase to Build Files**

   **Project-level `build.gradle`:**
   ```gradle
   buildscript {
       dependencies {
           classpath 'com.google.gms:google-services:4.4.0'
       }
   }
   ```

   **App-level `build.gradle`:**
   ```gradle
   plugins {
       id 'com.google.gms.google-services'
   }
   
   dependencies {
       implementation platform('com.google.firebase:firebase-bom:33.13.0')
       implementation 'com.google.firebase:firebase-messaging'
   }
   ```

### Step 2: Dashboard Registration (2 minutes)

1. **Sign Up**
   - Visit: [Your Dashboard URL]
   - Create account → Verify email

2. **Create Application**
   - Click "Create New Application"
   - Fill details:
     - **Name**: Your app name
     - **Platform**: Android
     - **Interests**: "news,sports,weather" (example)

3. **Upload Firebase Key**
   - In Firebase Console: Project Settings → Service Accounts
   - Click "Generate new private key" → Download JSON
   - Upload to dashboard

4. **Save Your App ID**
   - Copy the generated App ID (e.g., `6825f0b2f5d70b84cf230fbf`)

### Step 3: Add SDK (2 minutes)

1. **Download AAR**
   - Download `pushnotificationsdk-release.aar`
   - Create `app/libs/` folder
   - Copy AAR file to `libs/`

2. **Update `app/build.gradle`:**
   ```gradle
   dependencies {
       implementation files('libs/pushnotificationsdk-release.aar')
       implementation platform('com.google.firebase:firebase-bom:33.13.0')
       implementation 'com.google.firebase:firebase-messaging'
       implementation 'com.squareup.retrofit2:retrofit:2.9.0'
       implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
   }
   ```

### Step 4: Initialize SDK (3 minutes)

**In your `MainActivity.java`:**

```java
import com.example.pushnotificationsdk.PushNotificationManager;
import com.example.pushnotificationsdk.UserInfo;
import com.example.pushnotificationsdk.SDKConfiguration;
import com.example.pushnotificationsdk.InterestOption;

public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initializeSDK();
    }

    private void initializeSDK() {
        // 1. Initialize with your App ID
        String appId = "YOUR_APP_ID_HERE"; // Replace with your App ID
        notificationManager = PushNotificationManager.initialize(this, appId);

        // 2. Configure categories
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
            .setSignupTitle("Enable Notifications")
            .addInterest(new InterestOption("news", "News", "Breaking news"))
            .addInterest(new InterestOption("sports", "Sports", "Sports updates"))
            .build();
        notificationManager.configure(config);

        // 3. Set user (replace with your user data)
        UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 0.0, 0.0);
        notificationManager.setCurrentUser(user);

        // 4. Start SDK
        notificationManager.start();
    }

    // Add this method to show notification setup
    public void onNotificationSetupClick(View view) {
        notificationManager.launchNotificationSetupScreen(this);
    }
}
```

**Add button to your layout:**
```xml
<Button
    android:layout_width="wrap_content"
    android:layout_height="wrap_content"
    android:text="Setup Notifications"
    android:onClick="onNotificationSetupClick" />
```

## ✅ That's It!

Your app now has:
- ✅ Push notification support
- ✅ User preference management
- ✅ Beautiful setup UI
- ✅ Analytics tracking

## 🧪 Test Your Integration

1. **Run your app**
2. **Click "Setup Notifications"**
3. **Select interests and enable notifications**
4. **Check your dashboard** for user registration

## 🔧 Common Issues

**"SDK not initialized" error?**
→ Make sure you call `initialize()` before other SDK methods

**No notifications received?**
→ Check if POST_NOTIFICATIONS permission is granted (Android 13+)

**Network errors?**
→ Add network security config for HTTP connections

## 📚 Next Steps

- Read [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md) for advanced features
- Customize notification categories for your app
- Enable location-based notifications
- Set up analytics tracking

## 🆘 Need Help?

- **Debug logs**: `adb logcat -s PushSDK`
- **Documentation**: [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md)
- **Support**: support@yourcompany.com

---

**🎉 Congratulations! Your push notification system is ready!**
