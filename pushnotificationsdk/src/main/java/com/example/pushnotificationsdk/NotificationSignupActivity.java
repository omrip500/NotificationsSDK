package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk_library.R;

import java.util.ArrayList;
import java.util.List;

public class NotificationSignupActivity extends AppCompatActivity {

    private EditText ageInput;
    private Spinner genderSpinner;
    private CheckBox sportsCheck, politicsCheck, techCheck;
    private Button registerButton;

    private String userName; // ✅ הגדרה גלובלית

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification_signup);

        // ✅ קבלת שם המשתמש מתוך Intent
        userName = getIntent().getStringExtra("user_name");
        if (userName == null || userName.isEmpty()) {
            userName = "anonymous"; // ברירת מחדל
        }

        ageInput = findViewById(R.id.age_input);
        genderSpinner = findViewById(R.id.gender_spinner);
        sportsCheck = findViewById(R.id.checkbox_sports);
        politicsCheck = findViewById(R.id.checkbox_politics);
        techCheck = findViewById(R.id.checkbox_tech);
        registerButton = findViewById(R.id.register_button);

        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                this, R.array.gender_options, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        genderSpinner.setAdapter(adapter);

        registerButton.setOnClickListener(v -> {
            String gender = genderSpinner.getSelectedItem().toString().toLowerCase();
            int age = Integer.parseInt(ageInput.getText().toString().trim());

            List<String> interests = new ArrayList<>();
            if (sportsCheck.isChecked()) interests.add("sports");
            if (politicsCheck.isChecked()) interests.add("politics");
            if (techCheck.isChecked()) interests.add("tech");

            // משתמש ב־userName שנקלט מה־Intent
            UserInfo userInfo = new UserInfo(userName, gender, age, interests, 32.0853, 34.7818);

            PushNotificationManager.getInstance(this)
                    .registerToServer("6825f0b2f5d70b84cf230fbf", userInfo);

            Toast.makeText(this, "Registered!", Toast.LENGTH_SHORT).show();
            finish();
        });
    }
}
