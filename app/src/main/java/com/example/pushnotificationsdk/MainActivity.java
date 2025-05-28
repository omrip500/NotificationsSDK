package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk.PushNotificationManager;
import com.example.pushnotificationsdk.SDKConfiguration;
import com.example.pushnotificationsdk.InterestOption;
import com.example.pushnotificationsdk.UserInfo;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // ✨ Initialize and Configure the SDK ✨
        initializeSDK();

        // Setup UI buttons
        setupButtons();
    }

    private void initializeSDK() {
        notificationManager = PushNotificationManager.getInstance(this);

        // Configure SDK with notification types and settings
        configureSDK();

        // Set current user (this simulates a logged-in user in your app)
        setCurrentUser();

        // Initialize Firebase Messaging
        notificationManager.initialize();

        Log.d("MainActivity", "✅ SDK fully initialized and configured");
    }

    private void setupButtons() {
        // Setup Notifications Button
        Button setupButton = findViewById(R.id.signup_button);
        setupButton.setOnClickListener(v -> {
            // Launch notification setup screen
            notificationManager.launchNotificationSetupScreen(this);
        });

        // View History Button
        Button historyButton = findViewById(R.id.history_button);
        historyButton.setOnClickListener(v -> {
            notificationManager.launchNotificationHistoryScreen(this);
        });
    }

    private void configureSDK() {
        // Configure SDK with custom notification types and settings
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Enable Notifications")
                .setSignupSubtitle("Choose what notifications you'd like to receive")
                .addInterest(new InterestOption("breaking_news", "Breaking News", "Important breaking news alerts", true))
                .addInterest(new InterestOption("sports", "Sports", "Sports scores and game updates"))
                .addInterest(new InterestOption("weather", "Weather", "Weather alerts and daily forecasts"))
                .addInterest(new InterestOption("technology", "Technology", "Tech news and product launches"))
                .addInterest(new InterestOption("entertainment", "Entertainment", "Movies, TV shows and celebrity news"))
                .showLocationBasedNotifications(true)
                .build();

        notificationManager.configure(config);
        Log.d("MainActivity", "✅ SDK configured with notification types");
    }

    private void setCurrentUser() {
        // This simulates setting the current logged-in user
        // In a real app, this would come from your user management system
        List<String> emptyInterests = new ArrayList<>(); // Interests will be selected in setup screen
        UserInfo currentUser = new UserInfo(
                "omripeer",           // User ID from your app
                "male",               // Gender from user profile
                24,                   // Age from user profile
                emptyInterests,       // Empty - will be filled in setup screen
                32.0853,              // User's latitude (Tel Aviv)
                34.7818               // User's longitude (Tel Aviv)
        );

        notificationManager.setCurrentUser(currentUser);
        Log.d("MainActivity", "✅ Current user set: " + currentUser.getUserId());
    }
}
