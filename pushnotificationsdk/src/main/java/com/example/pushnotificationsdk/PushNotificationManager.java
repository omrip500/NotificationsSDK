package com.example.pushnotificationsdk;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.firebase.messaging.FirebaseMessaging;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PushNotificationManager {

    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 1001;

    private static PushNotificationManager instance;
    private final Context context;
    private UserInfo currentUser;
    private LocationManager locationManager;
    private String appId;
    private NotificationPermissionCallback notificationPermissionCallback;

    private PushNotificationManager(Context context, String appId) {
        this.context = context.getApplicationContext();
        this.locationManager = new LocationManager(context);
        this.appId = appId;
    }

    /**
     * Initialize the SDK with your app ID
     * @param context Application context
     * @param appId Your unique app ID from the dashboard
     * @return PushNotificationManager instance
     */
    public static synchronized PushNotificationManager initialize(Context context, String appId) {
        if (appId == null || appId.trim().isEmpty()) {
            throw new IllegalArgumentException("App ID cannot be null or empty");
        }
        instance = new PushNotificationManager(context, appId);
        return instance;
    }

    /**
     * Get the current SDK instance (must call initialize first)
     * @return PushNotificationManager instance
     * @throws IllegalStateException if SDK was not initialized
     */
    public static synchronized PushNotificationManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("SDK not initialized. Call PushNotificationManager.initialize(context, appId) first.");
        }
        return instance;
    }

    /**
     * @deprecated Use initialize(Context, String) instead
     */
    @Deprecated
    public static synchronized PushNotificationManager getInstance(Context context) {
        if (instance == null) {
            throw new IllegalStateException("SDK not initialized. Call PushNotificationManager.initialize(context, appId) first.");
        }
        return instance;
    }

    /**
     * Initialize Firebase Messaging and start the SDK
     * Call this after initialize(context, appId)
     */
    public void start() {
        FirebaseMessaging.getInstance().setAutoInitEnabled(true);
        Log.d("PushSDK", "🚀 SDK started with App ID: " + appId);

        // Test server connection
        testServerConnection();
    }

    /**
     * @deprecated Use start() instead
     */
    @Deprecated
    public void initialize() {
        start();
    }

    private void testServerConnection() {
        Log.d("PushSDK", "🌐 Testing server connection to: http://10.0.2.2:8000");
        // We'll test the connection when we actually register a device
        // For now, just log that we're ready to connect
        Log.d("PushSDK", "🔧 Server connection will be tested during device registration");
    }

    // Getting Firebase token for later use
    public void getToken(OnTokenReceivedListener listener) {
        Log.d("PushSDK", "🔄 Requesting FCM token...");
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && task.getResult() != null) {
                        String token = task.getResult();
                        Log.d("PushSDK", "✅ FCM Token received: " + token.substring(0, Math.min(20, token.length())) + "...");
                        Log.d("PushSDK", "📱 Full token: " + token);
                        listener.onTokenReceived(token);
                    } else {
                        Log.e("PushSDK", "❌ Failed to get FCM token", task.getException());
                        listener.onTokenFailed(task.getException());
                    }
                });
    }

    /**
     * @deprecated Use registerUser(UserInfo) instead
     */
    @Deprecated
    public void registerToServer(String appId, UserInfo userInfo) {
        registerUser(userInfo);
    }

    /**
     * @deprecated Use registerUser(UserInfo) instead
     */
    @Deprecated
    public void registerToServer(String token, String appId, UserInfo userInfo) {
        registerToServerInternal(token, userInfo);
    }

    /**
     * Register the current user to receive notifications
     * The user must be set using setCurrentUser() before calling this method
     * Note: This will check notification permissions and warn if not granted
     */
    public void registerUser() {
        if (currentUser == null) {
            Log.e("PushSDK", "❌ Current user not set. Call setCurrentUser() first.");
            return;
        }

        // Check notification permissions before registering
        if (!hasNotificationPermissions()) {
            Log.w("PushSDK", "⚠️ POST_NOTIFICATIONS permission not granted! Notifications may not appear.");
            Log.w("PushSDK", "💡 Consider calling requestNotificationPermissions() first or use launchNotificationSetupScreen()");
        }

        getToken(new OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                registerToServerInternal(token, currentUser);
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("PushSDK", "❌ Failed to get FCM token", e);
            }
        });
    }

    /**
     * Register user with specific UserInfo
     * @param userInfo User information to register
     * Note: This will check notification permissions and warn if not granted
     */
    public void registerUser(UserInfo userInfo) {
        // Check notification permissions before registering
        if (!hasNotificationPermissions()) {
            Log.w("PushSDK", "⚠️ POST_NOTIFICATIONS permission not granted! Notifications may not appear.");
            Log.w("PushSDK", "💡 Consider calling requestNotificationPermissions() first or use launchNotificationSetupScreen()");
        }

        // Update current user with the new information
        this.currentUser = userInfo;
        Log.d("PushSDK", "✅ Current user updated during registration: " + userInfo.getUserId());

        getToken(new OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                registerToServerInternal(token, userInfo);
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("PushSDK", "❌ Failed to get FCM token", e);
            }
        });
    }

    /**
     * Request notification permissions and register user automatically
     * This is the recommended way to register users programmatically
     * @param activity The activity to request permissions from
     * @param userInfo User information to register (optional - uses current user if null)
     * @param callback Callback for registration results
     */
    public void requestPermissionsAndRegister(Activity activity, UserInfo userInfo, NotificationPermissionCallback callback) {
        requestNotificationPermissions(activity, new NotificationPermissionCallback() {
            @Override
            public void onPermissionGranted() {
                Log.d("PushSDK", "✅ Notification permissions granted - proceeding with registration");
                if (userInfo != null) {
                    registerUser(userInfo);
                } else {
                    registerUser();
                }
                if (callback != null) callback.onPermissionGranted();
            }

            @Override
            public void onPermissionDenied() {
                Log.w("PushSDK", "⚠️ Notification permissions denied - registering anyway");
                if (userInfo != null) {
                    registerUser(userInfo);
                } else {
                    registerUser();
                }
                if (callback != null) callback.onPermissionDenied();
            }
        });
    }

    /**
     * Request notification permissions and register current user automatically
     * @param activity The activity to request permissions from
     * @param callback Callback for registration results (optional)
     */
    public void requestPermissionsAndRegister(Activity activity, NotificationPermissionCallback callback) {
        requestPermissionsAndRegister(activity, null, callback);
    }

    /**
     * Update user information on the server
     * @param userInfo Updated user information
     */
    public void updateUser(UserInfo userInfo) {
        // Update current user with the new information
        this.currentUser = userInfo;
        Log.d("PushSDK", "✅ Current user updated during update: " + userInfo.getUserId());

        getToken(new OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                updateUserInfoInternal(token, userInfo);
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("PushSDK", "❌ Failed to get FCM token", e);
            }
        });
    }

    // Internal method for server registration
    private void registerToServerInternal(String token, UserInfo userInfo) {
        Log.d("PushSDK", "🚀 Registering device to server...");
        Log.d("PushSDK", "📱 Token: " + token.substring(0, Math.min(20, token.length())) + "...");
        Log.d("PushSDK", "👤 User: " + userInfo.getUserId());
        Log.d("PushSDK", "🎯 Interests: " + userInfo.getInterests());
        Log.d("PushSDK", "🆔 App ID: " + appId);

        // קודם נקבל את ה-clientId מהשרת
        PushApiService service = ApiClient.getService();
        Log.d("PushSDK", "🔍 Requesting Client ID for App ID: " + appId);
        service.getClientIdByAppId(appId).enqueue(new Callback<ClientIdResponse>() {
            @Override
            public void onResponse(Call<ClientIdResponse> call, Response<ClientIdResponse> response) {
                Log.d("PushSDK", "📡 Client ID response received. Code: " + response.code());
                if (response.isSuccessful() && response.body() != null) {
                    String clientId = response.body().getClientId();
                    Log.d("PushSDK", "✅ Retrieved Client ID: " + clientId);

                    // עכשיו נרשום את המכשיר עם ה-clientId
                    Log.d("PushSDK", "📝 Creating RegisterDeviceRequest with:");
                    Log.d("PushSDK", "   Token: " + token.substring(0, Math.min(10, token.length())) + "...");
                    Log.d("PushSDK", "   AppId: " + appId);
                    Log.d("PushSDK", "   ClientId: " + clientId);
                    Log.d("PushSDK", "   UserInfo: " + (userInfo != null ? userInfo.getUserId() : "null"));

                    RegisterDeviceRequest request = new RegisterDeviceRequest(token, appId, clientId, userInfo);
                    service.registerDevice(request).enqueue(new Callback<Void>() {
                        @Override
                        public void onResponse(Call<Void> call, Response<Void> response) {
                            if (response.isSuccessful()) {
                                Log.d("PushSDK", "✅ Device registered successfully to server");
                                Log.d("PushSDK", "🎉 Ready to receive notifications!");
                            } else {
                                Log.e("PushSDK", "❌ Server registration failed with code: " + response.code());
                                try {
                                    String errorBody = response.errorBody() != null ? response.errorBody().string() : "No error body";
                                    Log.e("PushSDK", "❌ Error details: " + errorBody);
                                } catch (Exception e) {
                                    Log.e("PushSDK", "❌ Could not read error body", e);
                                }
                            }
                        }

                        @Override
                        public void onFailure(Call<Void> call, Throwable t) {
                            Log.e("PushSDK", "❌ Network failure during registration", t);
                            Log.e("PushSDK", "🌐 Check internet connection and server availability");
                        }
                    });
                } else {
                    Log.e("PushSDK", "❌ Failed to get Client ID. Response code: " + response.code());
                    try {
                        String errorBody = response.errorBody() != null ? response.errorBody().string() : "No error body";
                        Log.e("PushSDK", "❌ Error details: " + errorBody);
                    } catch (Exception e) {
                        Log.e("PushSDK", "❌ Could not read error body", e);
                    }
                }
            }

            @Override
            public void onFailure(Call<ClientIdResponse> call, Throwable t) {
                Log.e("PushSDK", "❌ Network failure while getting Client ID", t);
                Log.e("PushSDK", "🌐 Check internet connection and server availability");
            }
        });
    }

    // Internal method for updating user info
    private void updateUserInfoInternal(String token, UserInfo userInfo) {
        PushApiService service = ApiClient.getService();
        UpdateDeviceRequest request = new UpdateDeviceRequest(token, userInfo);

        service.updateDeviceInfo(request).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.d("PushSDK", "✅ Device info updated successfully");
                } else {
                    Log.e("PushSDK", "❌ Update failed: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("PushSDK", "❌ Network error during update", t);
            }
        });
    }

    /**
     * Configure the SDK with custom settings
     * @param configuration The SDK configuration
     */
    public void configure(SDKConfiguration configuration) {
        // Configuration is handled by the singleton pattern in SDKConfiguration
        Log.d("PushSDK", "✅ SDK configured successfully");

        // שליחת האינטרסים לשרת
        updateApplicationInterests(configuration);
    }

    /**
     * Get a configuration builder for easy setup
     * @return SDKConfiguration.Builder
     */
    public SDKConfiguration.Builder getConfigurationBuilder() {
        return new SDKConfiguration.Builder();
    }

    /**
     * Load interests configuration from server and configure SDK automatically
     * @param callback Callback to handle success/failure
     */
    public void loadInterestsFromServer(InterestsLoadCallback callback) {
        Log.d("PushSDK", "🔄 Loading interests configuration from server for app: " + appId);

        PushApiService service = ApiClient.getService();
        service.getApplicationInterestsConfig(appId).enqueue(new Callback<InterestsConfigResponse>() {
            @Override
            public void onResponse(Call<InterestsConfigResponse> call, Response<InterestsConfigResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<String> serverInterests = response.body().getInterests();
                    Log.d("PushSDK", "✅ Successfully loaded interests from server: " + serverInterests);

                    // Create configuration with server interests
                    SDKConfiguration.Builder configBuilder = getConfigurationBuilder()
                            .setSignupTitle("Enable Notifications")
                            .setSignupSubtitle("Choose what notifications you'd like to receive")
                            .showLocationBasedNotifications(false);

                    // Add interests from server
                    for (String interestId : serverInterests) {
                        // Create InterestOption with basic info (can be enhanced later)
                        InterestOption interest = new InterestOption(interestId,
                                capitalizeFirst(interestId.replace("_", " ")),
                                "Notifications about " + interestId.replace("_", " "));
                        configBuilder.addInterest(interest);
                    }

                    SDKConfiguration config = configBuilder.build();
                    configure(config);

                    if (callback != null) {
                        callback.onInterestsLoaded(serverInterests);
                    }
                } else {
                    Log.w("PushSDK", "⚠️ Failed to load interests from server. Response code: " + response.code());
                    if (callback != null) {
                        callback.onInterestsLoadFailed("Server returned error: " + response.code());
                    }
                }
            }

            @Override
            public void onFailure(Call<InterestsConfigResponse> call, Throwable t) {
                Log.e("PushSDK", "❌ Error loading interests from server: " + t.getMessage());
                if (callback != null) {
                    callback.onInterestsLoadFailed("Network error: " + t.getMessage());
                }
            }
        });
    }

    /**
     * Helper method to capitalize first letter of a string
     */
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    /**
     * Callback interface for interests loading
     */
    public interface InterestsLoadCallback {
        void onInterestsLoaded(List<String> interests);
        void onInterestsLoadFailed(String error);
    }

    /**
     * שליחת האינטרסים לשרת לעדכון האפליקציה
     * @param configuration הקונפיגורציה עם האינטרסים
     */
    private void updateApplicationInterests(SDKConfiguration configuration) {
        if (configuration == null || configuration.getAvailableInterests() == null) {
            Log.d("PushSDK", "⚠️ No interests to update");
            return;
        }

        // המרת האינטרסים לרשימת מחרוזות
        List<String> interestIds = new ArrayList<>();
        for (InterestOption interest : configuration.getAvailableInterests()) {
            interestIds.add(interest.getId());
        }

        if (interestIds.isEmpty()) {
            Log.d("PushSDK", "⚠️ No interests configured");
            return;
        }

        Log.d("PushSDK", "📤 Updating application interests: " + interestIds);

        // שליחת האינטרסים לשרת
        PushApiService service = ApiClient.getService();
        UpdateInterestsRequest request = new UpdateInterestsRequest(interestIds);

        service.updateApplicationInterests(appId, request).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.d("PushSDK", "✅ Successfully updated application interests");
                } else {
                    Log.w("PushSDK", "⚠️ Failed to update interests. Response code: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("PushSDK", "❌ Error updating application interests: " + t.getMessage());
            }
        });
    }

    /**
     * Set the current user information for the SDK
     * This should be called by the client app when a user is logged in
     * @param userInfo The user information (without interests - those will be selected in the setup screen)
     */
    public void setCurrentUser(UserInfo userInfo) {
        this.currentUser = userInfo;
        Log.d("PushSDK", "✅ Current user set: " + userInfo.getUserId());
    }

    /**
     * Get the current user information
     * @return Current user info or null if not set
     */
    public UserInfo getCurrentUser() {
        return currentUser;
    }

    /**
     * Launch the notification setup screen
     * The current user must be set before calling this method
     * @param context The context to launch from
     */
    public void launchNotificationSetupScreen(Context context) {
        if (currentUser == null) {
            Log.e("PushSDK", "❌ Current user not set. Call setCurrentUser() first.");
            return;
        }

        Intent intent = new Intent(context, NotificationSignupActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    @Deprecated
    public void launchSignupScreen(Context context, String userName) {
        launchNotificationSetupScreen(context);
    }

    /**
     * Check if notification permissions are granted (Android 13+)
     * @return true if permissions are granted or not needed (Android < 13)
     */
    public boolean hasNotificationPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                    == PackageManager.PERMISSION_GRANTED;
        }
        return true; // Not needed for older versions
    }

    /**
     * Request notification permissions (Android 13+)
     * @param activity The activity to request permissions from
     * @param callback Callback for permission results
     */
    public void requestNotificationPermissions(Activity activity, NotificationPermissionCallback callback) {
        this.notificationPermissionCallback = callback;

        if (hasNotificationPermissions()) {
            Log.d("PushSDK", "✅ Notification permissions already granted");
            callback.onPermissionGranted();
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                Log.d("PushSDK", "🔔 Requesting POST_NOTIFICATIONS permission...");
                ActivityCompat.requestPermissions(activity,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS},
                        NOTIFICATION_PERMISSION_REQUEST_CODE);
            } else {
                // For older Android versions, no permission needed
                Log.d("PushSDK", "✅ Notification permissions not required for this Android version");
                callback.onPermissionGranted();
            }
        }
    }

    /**
     * Handle notification permission request results
     * Call this from your Activity's onRequestPermissionsResult method
     */
    public void onNotificationPermissionResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == NOTIFICATION_PERMISSION_REQUEST_CODE && notificationPermissionCallback != null) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.d("PushSDK", "✅ POST_NOTIFICATIONS permission granted");
                notificationPermissionCallback.onPermissionGranted();
            } else {
                Log.w("PushSDK", "⚠️ POST_NOTIFICATIONS permission denied");
                notificationPermissionCallback.onPermissionDenied();
            }
            notificationPermissionCallback = null; // Clear callback
        }
    }

    /**
     * Get the location manager instance
     * @return LocationManager instance
     */
    public LocationManager getLocationManager() {
        return locationManager;
    }

    /**
     * Request location permissions and start tracking
     * @param activity The activity to request permissions from
     * @param callback Callback for permission results
     */
    public void requestLocationPermissions(android.app.Activity activity, LocationManager.LocationPermissionCallback callback) {
        locationManager.requestLocationPermissions(activity, new LocationManager.LocationPermissionCallback() {
            @Override
            public void onPermissionGranted() {
                Log.d("PushSDK", "✅ Location permissions granted - starting location tracking");
                locationManager.startLocationTracking();
                callback.onPermissionGranted();
            }

            @Override
            public void onPermissionDenied() {
                Log.w("PushSDK", "⚠️ Location permissions denied");
                callback.onPermissionDenied();
            }
        });
    }

    /**
     * Check if location permissions are granted
     * @return true if permissions are granted
     */
    public boolean hasLocationPermissions() {
        return locationManager.hasLocationPermissions();
    }

    /**
     * Start location tracking (if permissions are granted)
     */
    public void startLocationTracking() {
        if (hasLocationPermissions()) {
            locationManager.startLocationTracking();
            Log.d("PushSDK", "✅ Location tracking started");
        } else {
            Log.w("PushSDK", "⚠️ Cannot start location tracking - permissions not granted");
        }
    }

    /**
     * Stop location tracking
     */
    public void stopLocationTracking() {
        locationManager.stopLocationTracking();
        Log.d("PushSDK", "🛑 Location tracking stopped");
    }

    public void launchNotificationHistoryScreen(Context context) {
        Intent intent = new Intent(context, NotificationHistoryActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    public void launchSettingsScreen(Context context) {
        Intent intent = new Intent(context, SettingsActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    /**
     * @deprecated Use updateUser(UserInfo) instead
     */
    @Deprecated
    public void updateUserInfo(String appId, UserInfo userInfo) {
        updateUser(userInfo);
    }

    public void unregisterDevice() {
        getToken(new OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                PushApiService service = ApiClient.getService();
                service.unregisterDevice(token).enqueue(new Callback<Void>() {
                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {
                        if (response.isSuccessful()) {
                            Log.d("PushSDK", "✅ Device unregistered successfully");
                        } else {
                            Log.e("PushSDK", "❌ Failed to unregister device. Code: " + response.code());
                        }
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        Log.e("PushSDK", "❌ Network error during unregister", t);
                    }
                });
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("PushSDK", "❌ Could not get token for unregister", e);
            }
        });
    }

    /**
     * Update user location in the database
     * @param token Device token
     * @param userInfo Updated user info with new location
     */
    public void updateUserLocation(String token, UserInfo userInfo) {
        updateUserLocation(token, userInfo.getLat(), userInfo.getLng());
        // Update current user with new location
        currentUser = userInfo;
    }

    /**
     * Update user location in the database (more efficient - location only)
     * @param token Device token
     * @param lat Latitude
     * @param lng Longitude
     */
    public void updateUserLocation(String token, double lat, double lng) {
        PushApiService apiService = ApiClient.getService();
        UpdateLocationRequest request = new UpdateLocationRequest(token, lat, lng);
        Call<Void> call = apiService.updateDeviceLocation(request);

        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.d("PushSDK", "✅ Location updated in database: " + lat + ", " + lng);
                    // Update current user location if available
                    if (currentUser != null) {
                        currentUser = new UserInfo(
                                currentUser.getUserId(),
                                currentUser.getGender(),
                                currentUser.getAge(),
                                currentUser.getInterests(),
                                lat,
                                lng
                        );
                    }
                } else {
                    Log.e("PushSDK", "❌ Failed to update location: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("PushSDK", "❌ Network error updating location", t);
            }
        });
    }

    // Callback interface for notification permission results
    public interface NotificationPermissionCallback {
        void onPermissionGranted();
        void onPermissionDenied();
    }

    // Callback interface for receiving the token
    public interface OnTokenReceivedListener {
        void onTokenReceived(String token);
        void onTokenFailed(Exception e);
    }
}
