package com.example.pushnotificationsdk;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class PushNotificationService extends FirebaseMessagingService {

    private static final String TAG = "PushNotificationService";
    private static final String CHANNEL_ID = "push_notification_channel";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "🚀 PushNotificationService CREATED!");
        Log.e(TAG, "🚀 PushNotificationService CREATED!"); // Also at ERROR level to ensure it appears
        System.out.println("🚀 PushNotificationService CREATED!");
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "🔄 FCM Token refreshed: " + token.substring(0, Math.min(20, token.length())) + "...");
        Log.d(TAG, "📱 Full new token: " + token);
        System.out.println("🔄 FCM Token refreshed: " + token);
        Log.e(TAG, "🔄 FCM Token refreshed: " + token); // Also at ERROR level
        // Here you can send the token to the server if needed
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        long receiveTime = System.currentTimeMillis();
        Log.d(TAG, "🔔 NOTIFICATION RECEIVED!");
        System.out.println("🔔 NOTIFICATION RECEIVED!");
        Log.e(TAG, "🔔 NOTIFICATION RECEIVED!"); // Also at ERROR level to ensure it appears
        Log.d(TAG, "📤 From: " + remoteMessage.getFrom());
        Log.d(TAG, "🕒 Receive timestamp: " + receiveTime);
        Log.d(TAG, "🕒 Server timestamp: " + remoteMessage.getSentTime());
        Log.d(TAG, "⏱️ Delivery delay: " + (receiveTime - remoteMessage.getSentTime()) + "ms");
        Log.d(TAG, "📦 Data payload size: " + remoteMessage.getData().size());
        
        // If there is a Notification message (not just Data)
        if (remoteMessage.getNotification() != null) {
            String title = remoteMessage.getNotification().getTitle();
            String body = remoteMessage.getNotification().getBody();
            Log.d(TAG, "📝 Notification Title: " + title);
            Log.d(TAG, "📄 Notification Body: " + body);
            showNotification(title, body);
        }
        // If there is Data (message without Notification)
        else if (!remoteMessage.getData().isEmpty()) {
            String title = remoteMessage.getData().get("title");
            String body = remoteMessage.getData().get("body");
            Log.d(TAG, "📦 Data Title: " + title);
            Log.d(TAG, "📦 Data Body: " + body);
            showNotification(title, body);
        } else {
            Log.w(TAG, "⚠️ Received message without notification or data payload");
        }
    }

    private void showNotification(String title, String body) {
        Log.d(TAG, "🔔 Showing notification: " + title);
        createNotificationChannel();

        // Intent to open the app when the user clicks on the notification
        Intent intent = new Intent(this, getApplicationContext().getClass());
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);

        // Building the notification with maximum priority settings for immediate delivery
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)  // Small icon for the notification
                .setContentTitle(title != null ? title : "Notification")  // Notification title
                .setContentText(body != null ? body : "")  // Notification body
                .setPriority(NotificationCompat.PRIORITY_MAX)  // Maximum priority for immediate display
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)  // Message category
                .setDefaults(NotificationCompat.DEFAULT_ALL)  // Default sound, vibration, lights
                .setVibrate(new long[]{0, 250, 250, 250})  // Custom vibration pattern
                .setLights(0xFF0000FF, 300, 100)  // Blue light
                .setContentIntent(pendingIntent)  // Button to open the app when clicked on the notification
                .setAutoCancel(true)  // The notification will be dismissed when clicked
                .setOnlyAlertOnce(false)  // Always alert, even for updates
                .setShowWhen(true)  // Show timestamp
                .setWhen(System.currentTimeMillis())  // Set current time
                .setTimeoutAfter(0)  // Never timeout
                .setFullScreenIntent(pendingIntent, false);  // High priority for immediate display

        // Displaying the notification
        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "❌ POST_NOTIFICATIONS permission not granted!");
            return;
        }

        int notificationId = (int) System.currentTimeMillis();
        notificationManager.notify(notificationId, builder.build());
        Log.d(TAG, "✅ Notification displayed with ID: " + notificationId);
    }

    private void createNotificationChannel() {
        // Creating a notification channel for Android 8 and above with maximum priority
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Push Notification Channel";
            String description = "Channel for push notifications";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            // Enable all notification features for immediate delivery
            channel.enableLights(true);
            channel.setLightColor(0xFF0000FF); // Blue light
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 250, 250, 250});
            channel.setShowBadge(true);
            channel.setLockscreenVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true); // Bypass Do Not Disturb
            channel.setSound(android.provider.Settings.System.DEFAULT_NOTIFICATION_URI, null);

            // Enable bubbles and other high-priority features
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                channel.setAllowBubbles(true);
            }

            // Creating the channel in the OS
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
                Log.d(TAG, "✅ High-priority notification channel created");
            }
        }
    }
}
