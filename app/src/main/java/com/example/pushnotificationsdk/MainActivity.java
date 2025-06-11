package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk.InterestOption;
import com.example.pushnotificationsdk.PushNotificationManager;
import com.example.pushnotificationsdk.SDKConfiguration;
import com.example.pushnotificationsdk.UserInfo;
import com.google.firebase.FirebaseApp;

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
    }

    private void initializeSDK() {
        // מזהה ה-App שלך מה-Dashboard
        String appId = "6849b32cc94b2490180b8bb4";
        notificationManager = PushNotificationManager.initialize(this, appId);

        // קונפיגורציה (סוגי נוטיפיקציות, UI וכו’)
        SDKConfiguration config = notificationManager.getConfigurationBuilder()
                .setSignupTitle("Enable Notifications")
                .setSignupSubtitle("Choose what notifications you'd like to receive")
                .addInterest(new InterestOption("breaking_news", "Breaking News", "Important breaking news alerts", true))
                .addInterest(new InterestOption("sports", "Sports", "Game updates and scores"))
                .addInterest(new InterestOption("weather", "Weather", "Weather alerts"))
                .addInterest(new InterestOption("technology", "Technology", "Tech news and trends"))
                .showLocationBasedNotifications(true) // אם רלוונטי
                .build();

        notificationManager.configure(config);

        // משתמש לדוגמה
        UserInfo currentUser = new UserInfo(
                "user_omri",        // מזהה יוזר שלך
                "male",             // מין
                24,                 // גיל
                new ArrayList<>(),  // תחומי עניין
                32.0853,            // קואורדינטה (אופציונלי)
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
