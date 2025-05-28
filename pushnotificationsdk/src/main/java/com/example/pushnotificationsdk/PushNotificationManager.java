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

    private PushNotificationManager(Context context) {
        this.context = context.getApplicationContext();
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
    }

    // Getting Firebase token for later use
    public void getToken(OnTokenReceivedListener listener) {
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && task.getResult() != null) {
                        listener.onTokenReceived(task.getResult());
                    } else {
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
        RegisterDeviceRequest request = new RegisterDeviceRequest(token, appId, userInfo);
        PushApiService service = ApiClient.getService();

        service.registerDevice(request).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.d("PushSDK", "✅ Device registered successfully");
                } else {
                    Log.e("PushSDK", "❌ Server error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("PushSDK", "❌ Network failure", t);
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









    // Callback interface for receiving the token
    public interface OnTokenReceivedListener {
        void onTokenReceived(String token);
        void onTokenFailed(Exception e);
    }
}
