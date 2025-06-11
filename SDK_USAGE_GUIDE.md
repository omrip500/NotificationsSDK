# Push Notification SDK - Usage Guide

## Quick Start

### 1. Initialize the SDK

```java
// Initialize the SDK with your App ID (get this from your dashboard)
String appId = "your-app-id-here";
PushNotificationManager notificationManager = PushNotificationManager.initialize(this, appId);
```

### 2. Configure the SDK (Optional)

```java
// Configure notification types and settings
SDKConfiguration config = notificationManager.getConfigurationBuilder()
    .setSignupTitle("Enable Notifications")
    .setSignupSubtitle("Choose what notifications you'd like to receive")
    .addInterest(new InterestOption("breaking_news", "Breaking News", "Important breaking news alerts", true))
    .addInterest(new InterestOption("sports", "Sports", "Sports scores and game updates"))
    .addInterest(new InterestOption("weather", "Weather", "Weather alerts and daily forecasts"))
    .showLocationBasedNotifications(true)
    .build();

notificationManager.configure(config);
```

### 3. Set Current User

```java
// Set the current logged-in user (call this when user logs in)
List<String> emptyInterests = new ArrayList<>(); // Interests will be selected in setup screen
UserInfo currentUser = new UserInfo(
    "user123",           // User ID from your app
    "male",              // Gender from user profile
    25,                  // Age from user profile
    emptyInterests,      // Empty - will be filled in setup screen
    32.0853,             // User's latitude
    34.7818              // User's longitude
);

notificationManager.setCurrentUser(currentUser);
```

### 4. Start the SDK

```java
// Start Firebase Messaging
notificationManager.start();
```

### 5. Launch Notification Setup Screen

```java
// Launch the notification setup screen for the user
notificationManager.launchNotificationSetupScreen(this);
```

## API Reference

### Core Methods

#### `initialize(Context context, String appId)`

- **Purpose**: Initialize the SDK with your app ID
- **Parameters**:
  - `context`: Application context
  - `appId`: Your unique app ID from the dashboard
- **Returns**: PushNotificationManager instance
- **Example**: `PushNotificationManager.initialize(this, "your-app-id")`

#### `getInstance()`

- **Purpose**: Get the current SDK instance (must call initialize first)
- **Returns**: PushNotificationManager instance
- **Throws**: IllegalStateException if SDK was not initialized

#### `start()`

- **Purpose**: Start Firebase Messaging and activate the SDK
- **Call after**: initialize() and configuration

#### `setCurrentUser(UserInfo userInfo)`

- **Purpose**: Set the current logged-in user information
- **Parameters**: UserInfo object with user details
- **Required before**: launching setup screen or registering user

#### `registerUser()`

- **Purpose**: Register the current user to receive notifications
- **Requires**: Current user must be set first

#### `registerUser(UserInfo userInfo)`

- **Purpose**: Register specific user to receive notifications
- **Parameters**: UserInfo object to register
- **Note**: Checks notification permissions and warns if not granted

#### `requestPermissionsAndRegister(Activity activity, NotificationPermissionCallback callback)`

- **Purpose**: Request notification permissions and register current user automatically (RECOMMENDED)
- **Parameters**: Activity for permission request, callback for results
- **Best Practice**: Use this instead of registerUser() for better UX

#### `requestPermissionsAndRegister(Activity activity, UserInfo userInfo, NotificationPermissionCallback callback)`

- **Purpose**: Request notification permissions and register specific user automatically
- **Parameters**: Activity, UserInfo, callback for results

#### `updateUser(UserInfo userInfo)`

- **Purpose**: Update user information on the server
- **Parameters**: Updated UserInfo object

### UI Methods

#### `launchNotificationSetupScreen(Context context)`

- **Purpose**: Launch the notification preferences screen
- **Requires**: Current user must be set first

#### `launchNotificationHistoryScreen(Context context)`

- **Purpose**: Launch the notification history screen

#### `launchSettingsScreen(Context context)`

- **Purpose**: Launch the settings screen

### Location Methods

#### `requestLocationPermissions(Activity activity, LocationPermissionCallback callback)`

- **Purpose**: Request location permissions from user
- **Parameters**: Activity and callback for results

#### `startLocationTracking()`

- **Purpose**: Start location tracking (if permissions granted)

#### `stopLocationTracking()`

- **Purpose**: Stop location tracking

#### `hasLocationPermissions()`

- **Purpose**: Check if location permissions are granted
- **Returns**: boolean

## Migration from Old API

### Old Way (Deprecated)

```java
// Old initialization
PushNotificationManager manager = PushNotificationManager.getInstance(context);
manager.initialize();

// Old registration
manager.registerToServer(appId, userInfo);

// Old update
manager.updateUserInfo(appId, userInfo);
```

### New Way (Recommended)

```java
// New initialization
PushNotificationManager manager = PushNotificationManager.initialize(context, appId);
manager.start();

// New registration (RECOMMENDED - with permission handling)
manager.setCurrentUser(userInfo);
manager.requestPermissionsAndRegister(this, new PushNotificationManager.NotificationPermissionCallback() {
    @Override
    public void onPermissionGranted() {
        Log.d("MyApp", "✅ Notifications enabled!");
    }

    @Override
    public void onPermissionDenied() {
        Log.w("MyApp", "⚠️ Notifications may not work properly");
    }
});

// Alternative: Simple registration (checks permissions but doesn't request them)
manager.setCurrentUser(userInfo);
manager.registerUser();

// New update
manager.updateUser(userInfo);
```

## Complete Example

```java
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
        String appId = "6825f0b2f5d70b84cf230fbf"; // Your app ID from the dashboard
        notificationManager = PushNotificationManager.initialize(this, appId);

        // 2. Configure (optional)
        configureSDK();

        // 3. Set current user
        setCurrentUser();

        // 4. Start the SDK
        notificationManager.start();
    }

    private void configureSDK() {
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
            .addInterest(new InterestOption("news", "News", "Breaking news alerts"))
            .addInterest(new InterestOption("sports", "Sports", "Sports updates"))
            .showLocationBasedNotifications(true)
            .build();

        notificationManager.configure(config);
    }

    private void setCurrentUser() {
        UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 32.0853, 34.7818);
        notificationManager.setCurrentUser(user);
    }

    // Launch notification setup when user clicks a button
    private void onNotificationSetupClick() {
        notificationManager.launchNotificationSetupScreen(this);
    }
}
```

## Benefits of New API

1. **Cleaner**: App ID is set once during initialization
2. **Safer**: Prevents forgetting to pass app ID
3. **Simpler**: Fewer parameters in method calls
4. **Better Error Handling**: Clear error messages if SDK not initialized
5. **Backward Compatible**: Old methods still work but are deprecated
