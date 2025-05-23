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

    private String userName;
    private boolean isUpdate = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification_signup);

        Button backButton = findViewById(R.id.button_back);
        backButton.setOnClickListener(v -> finish());


        userName = getIntent().getStringExtra("user_name");
        if (userName == null || userName.isEmpty()) {
            userName = "anonymous";
        }

        String mode = getIntent().getStringExtra("mode");
        isUpdate = mode != null && mode.equals("update");

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

        // אם במצב עדכון – נמלא את השדות
        if (isUpdate) {
            String genderExtra = getIntent().getStringExtra("gender");
            int ageExtra = getIntent().getIntExtra("age", -1);
            ArrayList<String> interestsExtra = getIntent().getStringArrayListExtra("interests");

            if (genderExtra != null) {
                // הופך ל־"Male" או "Female" לצורך מיקום בספינר
                String capitalized = genderExtra.substring(0, 1).toUpperCase() + genderExtra.substring(1);
                int position = adapter.getPosition(capitalized);
                genderSpinner.setSelection(position);
            }

            if (ageExtra != -1) {
                ageInput.setText(String.valueOf(ageExtra));
            }

            if (interestsExtra != null) {
                if (interestsExtra.contains("sports")) sportsCheck.setChecked(true);
                if (interestsExtra.contains("politics")) politicsCheck.setChecked(true);
                if (interestsExtra.contains("tech")) techCheck.setChecked(true);
            }
        }

        registerButton.setOnClickListener(v -> {
            String gender = genderSpinner.getSelectedItem().toString().toLowerCase();
            int age = Integer.parseInt(ageInput.getText().toString().trim());

            List<String> interests = new ArrayList<>();
            if (sportsCheck.isChecked()) interests.add("sports");
            if (politicsCheck.isChecked()) interests.add("politics");
            if (techCheck.isChecked()) interests.add("tech");

            UserInfo userInfo = new UserInfo(userName, gender, age, interests, 32.0853, 34.7818);

            if (isUpdate) {
                PushNotificationManager.getInstance(this)
                        .updateUserInfo("6825f0b2f5d70b84cf230fbf", userInfo);
                Toast.makeText(this, "Details updated!", Toast.LENGTH_SHORT).show();
            } else {
                PushNotificationManager.getInstance(this)
                        .registerToServer("6825f0b2f5d70b84cf230fbf", userInfo);
                Toast.makeText(this, "Registered!", Toast.LENGTH_SHORT).show();
            }

            finish();
        });

    }
}
