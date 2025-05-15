package com.example.pushnotificationsdk;

import android.content.Context;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessaging;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PushNotificationManager {

    private static PushNotificationManager instance;
    private final Context context;

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




    // Callback interface for receiving the token
    public interface OnTokenReceivedListener {
        void onTokenReceived(String token);
        void onTokenFailed(Exception e);
    }
}
