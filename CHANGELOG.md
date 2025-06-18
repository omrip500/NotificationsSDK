# Changelog - NotificationManager API Improvements

## Version 1.2.0 - Production API Endpoint

### 🚀 Major Changes

#### Updated Base URL
- **Updated**: API base URL changed from local development to production
- **New URL**: `https://api.notificationspanel.com`
- **Impact**: All API calls now go to production server

#### Documentation Updates
- Updated all documentation to reflect production URLs
- Removed references to AAR files - JitPack only
- Removed location-based notification references
- Updated all App ID examples to generic placeholders
- Updated support email addresses to production domains

### 📋 Breaking Changes
- **Base URL**: If you were using a custom base URL, update to production
- **Dependencies**: Update to `v1.2.0` in your build.gradle

### 🔄 Migration Guide
Update your dependency version:
```kotlin
dependencies {
    implementation("com.github.omrip500:NotificationsSDK:v1.2.0")
}
```

---

## Version 2.0.0 - API Redesign

### 🚀 Major Changes

#### New Initialization Pattern
- **Before**: `PushNotificationManager.getInstance(context).initialize()`
- **After**: `PushNotificationManager.initialize(context, appId).start()`

#### App ID Management
- App ID is now passed once during initialization instead of every method call
- Cleaner API with fewer parameters
- Better error handling for missing app ID

#### Simplified Method Names
- `registerUser()` - Register current user (must call setCurrentUser first)
- `registerUser(UserInfo)` - Register specific user
- `updateUser(UserInfo)` - Update user information
- `start()` - Start the SDK (replaces initialize())

### 📋 Detailed Changes

#### PushNotificationManager Class

**New Methods:**
- `initialize(Context context, String appId)` - Initialize SDK with app ID
- `getInstance()` - Get instance (no context needed after initialization)
- `start()` - Start Firebase messaging
- `registerUser()` - Register current user
- `registerUser(UserInfo userInfo)` - Register specific user
- `updateUser(UserInfo userInfo)` - Update user information

**Deprecated Methods:**
- `getInstance(Context context)` - Use `initialize()` then `getInstance()`
- `initialize()` - Use `start()` instead
- `registerToServer(String appId, UserInfo userInfo)` - Use `registerUser(UserInfo)`
- `registerToServer(String token, String appId, UserInfo userInfo)` - Use `registerUser(UserInfo)`
- `updateUserInfo(String appId, UserInfo userInfo)` - Use `updateUser(UserInfo)`

**Internal Changes:**
- Added `appId` field to store app ID
- Refactored internal methods to use stored app ID
- Better error messages and validation

### 🔄 Migration Guide

#### Old Code:
```java
// Old way
PushNotificationManager manager = PushNotificationManager.getInstance(this);
manager.initialize();
manager.registerToServer("your-app-id", userInfo);
manager.updateUserInfo("your-app-id", updatedUserInfo);
```

#### New Code:
```java
// New way
PushNotificationManager manager = PushNotificationManager.initialize(this, "your-app-id");
manager.start();
manager.setCurrentUser(userInfo);
manager.registerUser();
// or
manager.registerUser(userInfo);
manager.updateUser(updatedUserInfo);
```

### ✅ Benefits

1. **Cleaner API**: App ID set once, not repeated in every call
2. **Better Error Handling**: Clear error messages if SDK not initialized
3. **Safer**: Prevents forgetting to pass app ID
4. **Simpler**: Fewer parameters in method calls
5. **Backward Compatible**: Old methods still work but are deprecated

### 🔧 Technical Details

#### MainActivity Changes
- Updated to use new initialization pattern
- App ID now set once during SDK initialization
- Cleaner code structure

#### NotificationSignupActivity Changes
- Updated to use new API methods
- Simplified method calls

#### SettingsActivity Changes
- Updated to use new getInstance() without context

### 📚 Documentation

- Updated `SDK_USAGE_GUIDE.md` with new API examples
- Added migration guide for existing users
- Comprehensive API reference with all new methods

### 🧪 Testing

- All existing functionality preserved
- New API tested and working
- Backward compatibility maintained
- Build successful with no breaking changes

### 🎯 Example Usage

```java
public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize SDK with your App ID
        String appId = "6825f0b2f5d70b84cf230fbf";
        notificationManager = PushNotificationManager.initialize(this, appId);

        // Configure SDK (optional)
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
            .addInterest(new InterestOption("news", "News", "Breaking news alerts"))
            .addInterest(new InterestOption("sports", "Sports", "Sports updates"))
            .build();
        notificationManager.configure(config);

        // Set current user
        UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 32.0853, 34.7818);
        notificationManager.setCurrentUser(user);

        // Start the SDK
        notificationManager.start();
    }

    private void onNotificationSetupClick() {
        // Launch notification setup
        notificationManager.launchNotificationSetupScreen(this);
    }
}
```

This update makes the SDK much more developer-friendly while maintaining full backward compatibility.
