# API Reference

Complete reference for the Push Notification SDK API.

## PushNotificationManager

The main class for interacting with the SDK.

### Static Methods

#### initialize(Context context, String appId)

Initializes the SDK with your application ID.

```java
PushNotificationManager notificationManager = PushNotificationManager.initialize(this, appId);
```

**Parameters:**
- `context` - Application context
- `appId` - Your unique app ID from the dashboard

**Returns:** `PushNotificationManager` instance

**Throws:** `IllegalArgumentException` if appId is null or empty

### Instance Methods

#### start()

Starts the SDK and enables Firebase messaging.

```java
notificationManager.start();
```

**Note:** Call this after `initialize()` and configuration.

#### configure(SDKConfiguration configuration)

Configures the SDK with custom settings.

```java
SDKConfiguration config = notificationManager.getConfigurationBuilder()
    .setSignupTitle("Enable Notifications")
    .addInterest(new InterestOption("news", "News", "Breaking news alerts"))
    .build();

notificationManager.configure(config);
```

#### getConfigurationBuilder()

Returns a configuration builder for easy setup.

```java
SDKConfiguration.Builder builder = notificationManager.getConfigurationBuilder();
```

**Returns:** `SDKConfiguration.Builder`

#### setCurrentUser(UserInfo userInfo)

Sets the current user information.

```java
UserInfo user = new UserInfo("user123", "male", 25, interests, latitude, longitude);
notificationManager.setCurrentUser(user);
```

**Parameters:**
- `userInfo` - User information object

#### registerUser()

Registers the current user to receive notifications.

```java
notificationManager.registerUser();
```

**Note:** User must be set using `setCurrentUser()` first.

#### launchNotificationSetupScreen(Context context)

Launches the notification setup screen for user preferences.

```java
notificationManager.launchNotificationSetupScreen(this);
```

**Parameters:**
- `context` - Activity context

#### launchSettingsScreen(Context context)

Launches the settings screen for managing preferences.

```java
notificationManager.launchSettingsScreen(this);
```

#### requestNotificationPermissions(Activity activity)

Requests notification permissions from the user.

```java
notificationManager.requestNotificationPermissions(this);
```

#### hasNotificationPermissions()

Checks if notification permissions are granted.

```java
boolean hasPermissions = notificationManager.hasNotificationPermissions();
```

**Returns:** `boolean` - true if permissions are granted

#### unregisterUser()

Unregisters the current user from receiving notifications.

```java
notificationManager.unregisterUser();
```

## SDKConfiguration

Configuration class for customizing SDK behavior.

### Builder Methods

#### setSignupTitle(String title)

Sets the title for the signup screen.

```java
builder.setSignupTitle("Enable Notifications");
```

#### setSignupSubtitle(String subtitle)

Sets the subtitle for the signup screen.

```java
builder.setSignupSubtitle("Choose what notifications you'd like to receive");
```

#### addInterest(InterestOption interest)

Adds an interest option for users to select.

```java
InterestOption interest = new InterestOption("news", "News", "Breaking news alerts", true);
builder.addInterest(interest);
```

#### showLocationBasedNotifications(boolean show)

Enables or disables location-based notifications.

```java
builder.showLocationBasedNotifications(true);
```

#### build()

Builds the configuration object.

```java
SDKConfiguration config = builder.build();
```

## InterestOption

Represents a notification category that users can subscribe to.

### Constructor

```java
InterestOption(String id, String name, String description)
InterestOption(String id, String name, String description, boolean defaultSelected)
```

**Parameters:**
- `id` - Unique identifier for the interest
- `name` - Display name for the interest
- `description` - Description of what notifications this includes
- `defaultSelected` - Whether this interest is selected by default

### Example

```java
InterestOption news = new InterestOption(
    "breaking_news", 
    "Breaking News", 
    "Important breaking news alerts", 
    true
);
```

## UserInfo

Contains user information for personalized notifications.

### Constructor

```java
UserInfo(String userId, String gender, int age, List<String> interests, double latitude, double longitude)
```

**Parameters:**
- `userId` - Unique identifier for the user
- `gender` - User's gender ("male", "female", "other")
- `age` - User's age
- `interests` - List of interest IDs the user is subscribed to
- `latitude` - User's latitude (for location-based notifications)
- `longitude` - User's longitude (for location-based notifications)

### Example

```java
List<String> interests = Arrays.asList("news", "sports");
UserInfo user = new UserInfo("user123", "male", 25, interests, 32.0853, 34.7818);
```

## Complete Integration Example

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
        // 1. Initialize with your App ID
        String appId = "6849b32cc94b2490180b8bb4";
        notificationManager = PushNotificationManager.initialize(this, appId);

        // 2. Configure notification categories
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Enable Notifications")
                .setSignupSubtitle("Choose what notifications you'd like to receive")
                .addInterest(new InterestOption("news", "News", "Breaking news alerts", true))
                .addInterest(new InterestOption("sports", "Sports", "Sports updates"))
                .addInterest(new InterestOption("technology", "Technology", "Tech news"))
                .addInterest(new InterestOption("weather", "Weather", "Weather alerts"))
                .showLocationBasedNotifications(true)
                .build();

        notificationManager.configure(config);

        // 3. Set user information
        List<String> userInterests = new ArrayList<>();
        UserInfo user = new UserInfo("user123", "male", 25, userInterests, 0.0, 0.0);
        notificationManager.setCurrentUser(user);

        // 4. Start the SDK
        notificationManager.start();
    }

    // Button click handler
    public void onSetupNotificationsClick(View view) {
        notificationManager.launchNotificationSetupScreen(this);
    }

    public void onSettingsClick(View view) {
        notificationManager.launchSettingsScreen(this);
    }
}
```
