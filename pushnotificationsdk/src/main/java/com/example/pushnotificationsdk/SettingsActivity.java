package com.example.pushnotificationsdk;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk_library.R;

import java.util.ArrayList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SettingsActivity extends AppCompatActivity {

    private TextView textUserId, textGender, textAge, textInterests;
    private Button updateButton, unregisterButton;
    private ImageButton backButton;

    private UserInfo currentUserInfo; // ✅ Saved information

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        textUserId = findViewById(R.id.text_user_id);
        textGender = findViewById(R.id.text_gender);
        textAge = findViewById(R.id.text_age);
        textInterests = findViewById(R.id.text_interests);

        updateButton = findViewById(R.id.button_update_info);
        unregisterButton = findViewById(R.id.button_unregister);
        backButton = findViewById(R.id.button_back);

        loadUserInfo();

        updateButton.setOnClickListener(v -> {
            if (currentUserInfo != null) {
                Intent intent = new Intent(this, NotificationSignupActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                intent.putExtra("mode", "update");
                intent.putExtra("user_name", currentUserInfo.getUserId());
                intent.putExtra("gender", currentUserInfo.getGender());
                intent.putExtra("age", currentUserInfo.getAge());
                intent.putStringArrayListExtra("interests", new ArrayList<>(currentUserInfo.getInterests()));
                startActivity(intent);
            }
        });

        unregisterButton.setOnClickListener(v -> {
            PushNotificationManager.getInstance(this).unregisterDevice();
            finish(); // or add Toast if you want to provide feedback
        });


        backButton.setOnClickListener(v -> finish());
    }

    private void loadUserInfo() {
        PushNotificationManager.getInstance().getToken(new PushNotificationManager.OnTokenReceivedListener() {
            @Override
            public void onTokenReceived(String token) {
                PushApiService service = ApiClient.getService();
                service.getDeviceInfoByToken(token).enqueue(new Callback<UserInfoResponse>() {
                    @Override
                    public void onResponse(Call<UserInfoResponse> call, Response<UserInfoResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            UserInfo info = response.body().getUserInfo();
                            currentUserInfo = info; // ✅ Save information

                            textUserId.setText(info.getUserId());
                            textGender.setText(info.getGender());
                            textAge.setText(String.valueOf(info.getAge()));
                            textInterests.setText(String.join(", ", info.getInterests()));
                        } else {
                            showDefaultValues();
                        }
                    }

                    @Override
                    public void onFailure(Call<UserInfoResponse> call, Throwable t) {
                        showDefaultValues();
                    }
                });
            }

            @Override
            public void onTokenFailed(Exception e) {
                showDefaultValues();
            }
        });
    }

    private void showDefaultValues() {
        textUserId.setText("-");
        textGender.setText("-");
        textAge.setText("-");
        textInterests.setText("-");
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadUserInfo(); // ← Refresh data every time the screen returns to activity
    }

}
