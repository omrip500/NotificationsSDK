package com.example.pushnotificationsdk;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.pushnotificationsdk_library.R;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NotificationHistoryActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ConstraintLayout rootLayout; // נוסיף גישה לשורש

    private Button backButton; // נוסיף כפתור חזרה אם נדרש
    private static final String TAG = "History";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification_history);

        recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        rootLayout = findViewById(R.id.root_layout);

        backButton = findViewById(R.id.button_back);

        backButton.setOnClickListener(v -> {
            finish(); // סוגר את הפעילות הנוכחית
                });

        PushNotificationManager.getInstance(this).getToken(new PushNotificationManager.OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                checkIfRegistered(token);
            }

            @Override
            public void onTokenFailed(Exception e) {
                Log.e(TAG, "Failed to get token", e);
            }
        });
    }

    private void checkIfRegistered(String token) {
        PushApiService service = ApiClient.getService();
        service.getDeviceInfoByToken(token).enqueue(new Callback<UserInfoResponse>() {
            @Override
            public void onResponse(Call<UserInfoResponse> call, Response<UserInfoResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    fetchHistory(token); // ✅ רשום – טען היסטוריה
                } else {
                    showUnregisteredWarning();
                }
            }

            @Override
            public void onFailure(Call<UserInfoResponse> call, Throwable t) {
                showUnregisteredWarning();
            }
        });
    }

    private void fetchHistory(String token) {
        PushApiService service = ApiClient.getService();
        service.getNotificationHistory(token).enqueue(new Callback<List<NotificationLog>>() {
            @Override
            public void onResponse(Call<List<NotificationLog>> call, Response<List<NotificationLog>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    NotificationLogAdapter adapter = new NotificationLogAdapter(response.body());
                    recyclerView.setAdapter(adapter);
                } else {
                    Log.e(TAG, "Response error: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<NotificationLog>> call, Throwable t) {
                Log.e(TAG, "Request failed", t);
            }
        });
    }

    private void showUnregisteredWarning() {
        TextView warningText = new TextView(this);
        warningText.setText("⚠️ המכשיר שלך אינו רשום לשירות ההתראות.");
        warningText.setTextColor(Color.RED);
        warningText.setTextSize(16);
        warningText.setPadding(32, 24, 32, 0);

        rootLayout.addView(warningText); // ✅ זה כבר ה־ConstraintLayout הנכון
    }

}
