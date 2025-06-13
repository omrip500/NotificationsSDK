package com.example.pushnotificationsdk;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk.InterestOption;
import com.example.pushnotificationsdk.PushNotificationManager;
import com.example.pushnotificationsdk.SDKConfiguration;
import com.example.pushnotificationsdk.UserInfo;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private PushNotificationManager notificationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main); // ודא שקיים קובץ layout כזה

        // 🟡 אתחול Firebase חובה לפני כל שימוש ב-SDK
        FirebaseApp.initializeApp(this);

        // ✨ אתחול SDK
        initializeSDK();

        // ✨ הגדרת כפתורי הדמו
        setupDemoButtons();
    }

    private void initializeSDK() {
        // מזהה ה-App שלך מה-Dashboard
        String appId = "684b0552a1b58761558f1068";
        notificationManager = PushNotificationManager.initialize(this, appId);

        // טעינת האינטרסים מהשרת במקום הגדרה ידנית
        notificationManager.loadInterestsFromServer(new PushNotificationManager.InterestsLoadCallback() {
            @Override
            public void onInterestsLoaded(List<String> interests) {
                Log.d("MainActivity", "✅ Interests loaded from server: " + interests);
            }

            @Override
            public void onInterestsLoadFailed(String error) {
                Log.w("MainActivity", "⚠️ Failed to load interests from server: " + error);
                Log.d("MainActivity", "🔄 Using default configuration...");
            }
        });

//        List<String> userInterests = new ArrayList<>();
//        userInterests.add("sports");
//        userInterests.add("breaking news");

        // משתמש לדוגמה
        UserInfo currentUser = new UserInfo(
                "user_omri",
                "male",
                24,
                new ArrayList<>(),
                32.0853,
                34.7818
        );

        notificationManager.setCurrentUser(currentUser);

        // הפעלת SDK
        notificationManager.start();

        // 🔥 רישום המכשיר למסד הנתונים עם בקשת הרשאות!
        notificationManager.requestPermissionsAndRegister(this, new PushNotificationManager.NotificationPermissionCallback() {
            @Override
            public void onPermissionGranted() {
                Log.d("MainActivity", "✅ Notification permissions granted and user registered!");
            }

            @Override
            public void onPermissionDenied() {
                Log.w("MainActivity", "⚠️ Notification permissions denied but user registered anyway");
            }
        });

        Log.d("MainActivity", "✅ Push SDK initialized successfully.");
        Log.d("MainActivity", "🚀 Device registration initiated...");

        // הוסף בסוף פונקציית initializeSDK()
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (task.isSuccessful()) {
                    String token = task.getResult();
                    Log.d("MainActivity", "FCM Token: " + token);
                    Log.e("MainActivity", "FCM Token for verification: " + token); // לוג ברמת ERROR לוודא שמופיע
                } else {
                    Log.e("MainActivity", "Failed to get FCM token", task.getException());
                }
            });
    }

    private void setupDemoButtons() {
        Button btnNotificationSetup = findViewById(R.id.btn_notification_setup);
        btnNotificationSetup.setOnClickListener(v -> {
            Log.d("MainActivity", "🔔 Opening Notification Setup Screen");
            notificationManager.launchNotificationSetupScreen(this);
        });

        Button btnSettings = findViewById(R.id.btn_settings);
        btnSettings.setOnClickListener(v -> {
            Log.d("MainActivity", "⚙️ Opening Settings Screen");
            notificationManager.launchSettingsScreen(this);
        });

        Button btnNotificationHistory = findViewById(R.id.btn_notification_history);
        btnNotificationHistory.setOnClickListener(v -> {
            Log.d("MainActivity", "📋 Opening Notification History Screen");
            notificationManager.launchNotificationHistoryScreen(this);
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        // Forward permission results to the SDK
        if (notificationManager != null) {
            notificationManager.onNotificationPermissionResult(requestCode, permissions, grantResults);
        }
    }
}
