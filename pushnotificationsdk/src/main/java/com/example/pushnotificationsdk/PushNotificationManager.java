package com.example.pushnotificationsdk;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessaging;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PushNotificationManager {

    private static PushNotificationManager instance;
    private final Context context;
    private UserInfo currentUser;
    private LocationManager locationManager;

    private PushNotificationManager(Context context) {
        this.context = context.getApplicationContext();
        this.locationManager = new LocationManager(context);
    }

    public static synchronized PushNotificationManager getInstance(Context context) {
        if (instance == null) {
            instance = new PushNotificationManager(context);
        }
        return instance;
    }

    // Initializing Firebase Messaging
    public void initialize() {
        FirebaseMessaging.getInstance().setAutoInitEnabled(true);
        Log.d("PushSDK", "🚀 SDK initialized");

        // Test server connection
        testServerConnection();
    }

    private void testServerConnection() {
        Log.d("PushSDK", "🌐 Testing server connection...");
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

    // גרסה 1 – פשוטה: לא מקבלת token, שולפת לבד
    public void registerToServer(String appId, UserInfo userInfo) {
        getToken(new OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                registerToServer(token, appId, userInfo);  // ⬅️ קוראת לגרסה השנייה
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("PushSDK", "❌ Failed to get FCM token", e);
            }
        });
    }

    // גרסה 2 – מלאה: מקבלת את ה־token ישירות
    public void registerToServer(String token, String appId, UserInfo userInfo) {
        Log.d("PushSDK", "🚀 Registering device to server...");
        Log.d("PushSDK", "📱 Token: " + token.substring(0, Math.min(20, token.length())) + "...");
        Log.d("PushSDK", "👤 User: " + userInfo.getUserId());
        Log.d("PushSDK", "🎯 Interests: " + userInfo.getInterests());

        RegisterDeviceRequest request = new RegisterDeviceRequest(token, appId, userInfo);
        PushApiService service = ApiClient.getService();

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
    }

    /**
     * Configure the SDK with custom settings
     * @param configuration The SDK configuration
     */
    public void configure(SDKConfiguration configuration) {
        // Configuration is handled by the singleton pattern in SDKConfiguration
        Log.d("PushSDK", "✅ SDK configured successfully");
    }

    /**
     * Get a configuration builder for easy setup
     * @return SDKConfiguration.Builder
     */
    public SDKConfiguration.Builder getConfigurationBuilder() {
        return new SDKConfiguration.Builder();
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

    public void updateUserInfo(String appId, UserInfo userInfo) {
        getToken(new OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
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

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("PushSDK", "❌ Failed to get token for update", e);
            }
        });
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

    // Callback interface for receiving the token
    public interface OnTokenReceivedListener {
        void onTokenReceived(String token);
        void onTokenFailed(Exception e);
    }
}
