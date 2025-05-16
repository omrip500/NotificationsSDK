package com.example.pushnotificationsdk;

import android.content.Context;
import android.content.SharedPreferences;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class NotificationHistoryManager {

    private static final String PREFS_NAME = "NotificationHistoryPrefs";
    private static final String HISTORY_KEY = "notification_history";

    private SharedPreferences sharedPreferences;
    private Gson gson;

    public NotificationHistoryManager(Context context) {
        sharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        gson = new Gson();
    }

    public void addNotification(com.example.pushnotificationssdk.NotificationLog notificationLog) {
        List<com.example.pushnotificationssdk.NotificationLog> history = getHistory();
        history.add(notificationLog);
        saveHistory(history);
    }

    public List<com.example.pushnotificationssdk.NotificationLog> getHistory() {
        String json = sharedPreferences.getString(HISTORY_KEY, null);
        if (json == null) {
            return new ArrayList<>();
        }
        Type type = new TypeToken<List<com.example.pushnotificationssdk.NotificationLog>>(){}.getType();
        return gson.fromJson(json, type);
    }

    private void saveHistory(List<com.example.pushnotificationssdk.NotificationLog> history) {
        String json = gson.toJson(history);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString(HISTORY_KEY, json);
        editor.apply();
    }
}
