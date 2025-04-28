package com.example.pushnotificationsdk;

import android.content.Context;
import com.google.firebase.messaging.FirebaseMessaging;

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

    // Callback interface for receiving the token
    public interface OnTokenReceivedListener {
        void onTokenReceived(String token);
        void onTokenFailed(Exception e);
    }
}
