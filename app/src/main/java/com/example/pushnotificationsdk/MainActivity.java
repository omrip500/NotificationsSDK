package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk.PushNotificationManager;
import com.example.pushnotificationsdk.SDKConfiguration;
import com.example.pushnotificationsdk.InterestOption;

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

        Button settingsButton = findViewById(R.id.settings_button);
        settingsButton.setOnClickListener(v -> {
            notificationManager.launchSettingsScreen(this);
        });
    }

    private void configureSDK() {
        // Configure SDK with custom interests and settings
        PushNotificationManager manager = PushNotificationManager.getInstance(this);

        SDKConfiguration config = manager.getConfigurationBuilder()
                .setSignupTitle("Join Our Community")
                .setSignupSubtitle("Get personalized notifications just for you")
                .addInterest(new InterestOption("sports", "Sports", "Sports news and updates", true))
                .addInterest(new InterestOption("technology", "Technology", "Latest tech news"))
                .addInterest(new InterestOption("politics", "Politics", "Political updates"))
                .addInterest(new InterestOption("entertainment", "Entertainment", "Movies, TV shows and celebrity news"))
                .addInterest(new InterestOption("business", "Business", "Business and finance news"))
                .setGenderOptions(new String[]{"Male", "Female", "Other", "Prefer not to say"})
                .showAgeField(true)
                .showGenderField(true)
                .build();

        manager.configure(config);

        Log.d("MainActivity", "✅ SDK configured with custom settings");
    }
}
