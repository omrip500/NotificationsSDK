package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk.PushNotificationManager;

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

        // כפתור פתיחת מסך Signup (באמצעות SDK)
        Button signupButton = findViewById(R.id.signup_button);
        signupButton.setOnClickListener(v -> {
            PushNotificationManager.getInstance(this).launchSignupScreen(this, "Omri Peer");
        });

        // כפתור פתיחת מסך היסטוריה (באמצעות SDK)
        Button historyButton = findViewById(R.id.history_button);
        historyButton.setOnClickListener(v -> {
            PushNotificationManager.getInstance(this).launchNotificationHistoryScreen(this);
        });
    }
}
