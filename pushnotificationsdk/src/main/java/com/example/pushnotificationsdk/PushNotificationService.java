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
        Log.e(TAG, "🚀 PushNotificationService CREATED!"); // גם ברמת ERROR לוודא שמופיע
        System.out.println("🚀 PushNotificationService CREATED!");
    }

    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "🔄 FCM Token refreshed: " + token.substring(0, Math.min(20, token.length())) + "...");
        Log.d(TAG, "📱 Full new token: " + token);
        System.out.println("🔄 FCM Token refreshed: " + token);
        Log.e(TAG, "🔄 FCM Token refreshed: " + token); // גם ברמת ERROR
        // Here you can send the token to the server if needed
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Log.d(TAG, "🔔 NOTIFICATION RECEIVED!");
        System.out.println("🔔 NOTIFICATION RECEIVED!");
        Log.e(TAG, "🔔 NOTIFICATION RECEIVED!"); // גם ברמת ERROR כדי שיופיע בוודאות
        Log.d(TAG, "📤 From: " + remoteMessage.getFrom());
        Log.d(TAG, "🕒 Timestamp: " + System.currentTimeMillis());
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

        // Building the notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)  // Small icon for the notification
                .setContentTitle(title != null ? title : "Notification")  // Notification title
                .setContentText(body != null ? body : "")  // Notification body
                .setPriority(NotificationCompat.PRIORITY_HIGH)  // High priority
                .setContentIntent(pendingIntent)  // Button to open the app when clicked on the notification
                .setAutoCancel(true);  // The notification will be dismissed when clicked

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
        // Creating a notification channel for Android 8 and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Push Notification Channel";
            String description = "Channel for push notifications";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            // Creating the channel in the OS
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}
