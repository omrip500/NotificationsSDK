package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;


public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ✨ Using the SDK ✨
        PushNotificationManager notificationManager = PushNotificationManager.getInstance(this);

        // Initializing Firebase Messaging
        notificationManager.initialize();

        // Getting the Firebase token
        notificationManager.getToken(new PushNotificationManager.OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                Log.d("FirebaseToken", "Firebase Token: " + token);
                // Here you can send the token to the server or print it
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("FirebaseToken", "Failed to get token", e);
            }
        });
    }
}
