package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.pushnotificationsdk_library.R;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NotificationHistoryActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private com.example.pushnotificationsdk.NotificationLogAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification_history);

        recyclerView = findViewById(R.id.history_recycler);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        PushNotificationManager.getInstance(this).getToken(new PushNotificationManager.OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                fetchHistory(token);
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e("History", "Failed to get token", e);
            }
        });
    }

    private void fetchHistory(String token) {
        PushApiService service = ApiClient.getService();
        service.getNotificationHistory(token).enqueue(new Callback<List<com.example.pushnotificationssdk.NotificationLog>>() {
            @Override
            public void onResponse(Call<List<com.example.pushnotificationssdk.NotificationLog>> call, Response<List<com.example.pushnotificationssdk.NotificationLog>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    adapter = new com.example.pushnotificationsdk.NotificationLogAdapter(response.body());
                    recyclerView.setAdapter(adapter);
                } else {
                    Log.e("History", "Response error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<com.example.pushnotificationssdk.NotificationLog>> call, Throwable t) {
                Log.e("History", "Request failed", t);
            }
        });
    }
}