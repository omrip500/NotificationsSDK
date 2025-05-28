package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk.PushNotificationManager;
import com.example.pushnotificationsdk.SDKConfiguration;
import com.example.pushnotificationsdk.InterestOption;
import com.example.pushnotificationsdk.UserInfo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ✨ Configure the SDK ✨
        configureSDK();

        // ✨ Using the SDK ✨
        PushNotificationManager notificationManager = PushNotificationManager.getInstance(this);

        // Initializing Firebase Messaging
        notificationManager.initialize();

        // כפתור פתיחת מסך Setup Notifications (באמצעות SDK)
        Button signupButton = findViewById(R.id.signup_button);
        signupButton.setOnClickListener(v -> {
            PushNotificationManager.getInstance(this).launchNotificationSetupScreen(this);
        });

        // כפתור פתיחת מסך היסטוריה (באמצעות SDK)
        Button historyButton = findViewById(R.id.history_button);
        historyButton.setOnClickListener(v -> {
            PushNotificationManager.getInstance(this).launchNotificationHistoryScreen(this);
        });


    }

    private void configureSDK() {
        // Configure SDK with custom interests and settings
        PushNotificationManager manager = PushNotificationManager.getInstance(this);

        SDKConfiguration config = manager.getConfigurationBuilder()
                .setSignupTitle("Enable Notifications")
                .setSignupSubtitle("Choose what notifications you'd like to receive")
                .addInterest(new InterestOption("breaking_news", "Breaking News", "Important breaking news alerts", true))
                .addInterest(new InterestOption("sports", "Sports", "Sports scores and game updates"))
                .addInterest(new InterestOption("weather", "Weather", "Weather alerts and daily forecasts"))
                .addInterest(new InterestOption("technology", "Technology", "Tech news and product launches"))
                .addInterest(new InterestOption("entertainment", "Entertainment", "Movies, TV shows and celebrity news"))
                .showLocationBasedNotifications(true)
                .build();

        manager.configure(config);

        // Set current user (this would normally come from your app's user management)
        List<String> emptyInterests = new ArrayList<>(); // Interests will be selected in setup screen
        UserInfo currentUser = new UserInfo("omripeer", "male", 24, emptyInterests, 32.0853, 34.7818);
        manager.setCurrentUser(currentUser);

        Log.d("MainActivity", "✅ SDK configured with custom settings and user set");
    }
}
