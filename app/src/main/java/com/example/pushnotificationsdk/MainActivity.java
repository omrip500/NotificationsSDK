package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import java.util.Arrays;
import java.util.List;


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

                // 👇 שימוש בפונקציה החדשה:
                List<String> interests = Arrays.asList("sports", "politics");
                UserInfo user = new UserInfo("omripeer", "male", 26, interests, 32.0853, 34.7818); // ת"א
                notificationManager.registerToServer(token, "6825f0b2f5d70b84cf230fbf", user);

            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("FirebaseToken", "Failed to get token", e);
            }
        });
    }
}
