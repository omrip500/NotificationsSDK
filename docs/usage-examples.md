# Usage Examples

Practical examples and best practices for using the Push Notification SDK.

## Basic Integration

### Simple Setup

```java
public class MainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Firebase
        FirebaseApp.initializeApp(this);

        // Simple SDK initialization
        String appId = "6849b32cc94b2490180b8bb4";
        notificationManager = PushNotificationManager.initialize(this, appId);
        
        // Set user and start
        UserInfo user = new UserInfo("user123", "male", 25, new ArrayList<>(), 0.0, 0.0);
        notificationManager.setCurrentUser(user);
        notificationManager.start();
    }
}
```

## Advanced Configuration

### News App Example

```java
public class NewsMainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        FirebaseApp.initializeApp(this);
        setupNewsNotifications();
    }

    private void setupNewsNotifications() {
        String appId = "your-news-app-id";
        notificationManager = PushNotificationManager.initialize(this, appId);

        // Configure for news app
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Stay Updated")
                .setSignupSubtitle("Get the latest news that matters to you")
                .addInterest(new InterestOption("breaking_news", "Breaking News", 
                    "Urgent breaking news alerts", true))
                .addInterest(new InterestOption("politics", "Politics", 
                    "Political news and updates"))
                .addInterest(new InterestOption("business", "Business", 
                    "Business and financial news"))
                .addInterest(new InterestOption("technology", "Technology", 
                    "Tech industry news and trends"))
                .addInterest(new InterestOption("sports", "Sports", 
                    "Sports news and scores"))
                .addInterest(new InterestOption("entertainment", "Entertainment", 
                    "Celebrity news and entertainment"))
                .showLocationBasedNotifications(false)
                .build();

        notificationManager.configure(config);

        // Set user with preferences
        setUserWithPreferences();
        notificationManager.start();
    }

    private void setUserWithPreferences() {
        // Get user preferences from your app's user management
        String userId = getCurrentUserId();
        String gender = getUserGender();
        int age = getUserAge();
        List<String> existingInterests = getUserInterests();
        
        UserInfo user = new UserInfo(userId, gender, age, existingInterests, 0.0, 0.0);
        notificationManager.setCurrentUser(user);
    }

    // Button handlers
    public void onNotificationSetupClick(View view) {
        notificationManager.launchNotificationSetupScreen(this);
    }

    public void onNotificationSettingsClick(View view) {
        notificationManager.launchSettingsScreen(this);
    }
}
```

### E-commerce App Example

```java
public class ShoppingMainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    private void setupShoppingNotifications() {
        String appId = "your-shopping-app-id";
        notificationManager = PushNotificationManager.initialize(this, appId);

        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Never Miss a Deal")
                .setSignupSubtitle("Get notified about sales, new arrivals, and order updates")
                .addInterest(new InterestOption("flash_sales", "Flash Sales", 
                    "Limited time flash sales and deals", true))
                .addInterest(new InterestOption("new_arrivals", "New Arrivals", 
                    "Latest products and collections"))
                .addInterest(new InterestOption("price_drops", "Price Drops", 
                    "Price reductions on your wishlist items"))
                .addInterest(new InterestOption("order_updates", "Order Updates", 
                    "Shipping and delivery notifications", true))
                .addInterest(new InterestOption("recommendations", "Recommendations", 
                    "Personalized product suggestions"))
                .showLocationBasedNotifications(false) // Not needed for e-commerce
                .build();

        notificationManager.configure(config);

        // Set customer information
        UserInfo customer = new UserInfo(
            getCustomerId(), 
            getCustomerGender(), 
            getCustomerAge(), 
            getCustomerInterests(),
            0.0, 0.0
        );
        notificationManager.setCurrentUser(customer);
        notificationManager.start();
    }
}
```

## User Management

### Dynamic User Updates

```java
public class UserProfileActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    private void updateUserProfile() {
        // Get updated user information
        String userId = getCurrentUserId();
        String gender = getSelectedGender();
        int age = getEnteredAge();
        List<String> interests = getSelectedInterests();
        
        // Update location if available
        double latitude = 0.0;
        double longitude = 0.0;
        if (hasLocationPermission()) {
            Location location = getCurrentLocation();
            if (location != null) {
                latitude = location.getLatitude();
                longitude = location.getLongitude();
            }
        }

        // Create updated user info
        UserInfo updatedUser = new UserInfo(userId, gender, age, interests, latitude, longitude);
        
        // Update in SDK
        notificationManager.setCurrentUser(updatedUser);
        
        // Re-register to sync with server
        notificationManager.registerUser();
    }
}
```

### Handling User Logout

```java
public class AuthActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    private void handleUserLogout() {
        // Unregister current user
        notificationManager.unregisterUser();
        
        // Clear user session in your app
        clearUserSession();
        
        // Redirect to login
        startActivity(new Intent(this, LoginActivity.class));
        finish();
    }

    private void handleUserLogin(String newUserId) {
        // Set new user after login
        UserInfo newUser = new UserInfo(newUserId, "", 0, new ArrayList<>(), 0.0, 0.0);
        notificationManager.setCurrentUser(newUser);
        notificationManager.registerUser();
    }
}
```

## Permission Handling

### Request Permissions Gracefully

```java
public class PermissionActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;
    private static final int NOTIFICATION_PERMISSION_REQUEST = 1001;

    private void setupNotificationsWithPermissions() {
        // Check if permissions are already granted
        if (notificationManager.hasNotificationPermissions()) {
            // Permissions granted, proceed with setup
            proceedWithNotificationSetup();
        } else {
            // Show explanation dialog first
            showPermissionExplanationDialog();
        }
    }

    private void showPermissionExplanationDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Enable Notifications")
                .setMessage("We'd like to send you notifications about important updates and news. You can customize what notifications you receive.")
                .setPositiveButton("Enable", (dialog, which) -> {
                    requestNotificationPermissions();
                })
                .setNegativeButton("Not Now", (dialog, which) -> {
                    // User declined, but still initialize SDK
                    proceedWithNotificationSetup();
                })
                .show();
    }

    private void requestNotificationPermissions() {
        notificationManager.requestNotificationPermissions(this);
    }

    private void proceedWithNotificationSetup() {
        // Continue with SDK setup regardless of permission status
        notificationManager.start();
        
        // Optionally show setup screen
        notificationManager.launchNotificationSetupScreen(this);
    }
}
```

## Error Handling

### Robust Initialization

```java
public class RobustMainActivity extends AppCompatActivity {
    private PushNotificationManager notificationManager;

    private void initializeSDKSafely() {
        try {
            // Validate app ID
            String appId = getAppIdFromConfig();
            if (appId == null || appId.trim().isEmpty()) {
                Log.e("NotificationSDK", "App ID not configured");
                return;
            }

            // Initialize Firebase first
            if (FirebaseApp.getApps(this).isEmpty()) {
                FirebaseApp.initializeApp(this);
            }

            // Initialize SDK
            notificationManager = PushNotificationManager.initialize(this, appId);

            // Configure with error handling
            configureSDKSafely();

            // Set user with validation
            setUserSafely();

            // Start SDK
            notificationManager.start();

        } catch (Exception e) {
            Log.e("NotificationSDK", "Failed to initialize SDK", e);
            // Handle gracefully - app should still work without notifications
        }
    }

    private void configureSDKSafely() {
        try {
            SDKConfiguration config = notificationManager.getConfigurationBuilder()
                    .setSignupTitle("Enable Notifications")
                    .setSignupSubtitle("Stay updated with the latest news")
                    .addInterest(new InterestOption("general", "General", "General notifications", true))
                    .build();

            notificationManager.configure(config);
        } catch (Exception e) {
            Log.e("NotificationSDK", "Failed to configure SDK", e);
        }
    }

    private void setUserSafely() {
        try {
            String userId = getCurrentUserId();
            if (userId != null) {
                UserInfo user = new UserInfo(userId, "", 0, new ArrayList<>(), 0.0, 0.0);
                notificationManager.setCurrentUser(user);
            }
        } catch (Exception e) {
            Log.e("NotificationSDK", "Failed to set user", e);
        }
    }
}
```

## Best Practices

### 1. Initialize Early
```java
// Initialize in Application class or MainActivity onCreate
FirebaseApp.initializeApp(this);
notificationManager = PushNotificationManager.initialize(this, appId);
```

### 2. Handle Permissions Gracefully
```java
// Always check permissions before assuming they're granted
if (!notificationManager.hasNotificationPermissions()) {
    // Show explanation and request permissions
}
```

### 3. Update User Information
```java
// Update user info when it changes in your app
notificationManager.setCurrentUser(updatedUserInfo);
notificationManager.registerUser(); // Sync with server
```

### 4. Provide Easy Access to Settings
```java
// Add a settings button in your app's menu
public void onNotificationSettingsClick(View view) {
    notificationManager.launchSettingsScreen(this);
}
```
