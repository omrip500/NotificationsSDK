package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk_library.R;

import java.util.ArrayList;
import java.util.List;

public class NotificationSignupActivity extends AppCompatActivity {

    private EditText ageInput;
    private Spinner genderSpinner;
    private LinearLayout interestsContainer;
    private Button registerButton;
    private TextView titleText, subtitleText;
    private List<CheckBox> interestCheckboxes;

    private String userName;
    private boolean isUpdate = false;
    private SDKConfiguration config;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification_signup);

        // Get configuration
        config = SDKConfiguration.getInstance();

        // Initialize views
        initializeViews();

        // Setup data
        setupUserData();

        // Setup UI based on configuration
        setupUIFromConfiguration();

        // Setup click listeners
        setupClickListeners();
    }

    private void initializeViews() {
        ImageButton backButton = findViewById(R.id.button_back);
        backButton.setOnClickListener(v -> finish());

        titleText = findViewById(R.id.text_title);
        subtitleText = findViewById(R.id.text_subtitle);
        ageInput = findViewById(R.id.age_input);
        genderSpinner = findViewById(R.id.gender_spinner);
        interestsContainer = findViewById(R.id.interests_container);
        registerButton = findViewById(R.id.register_button);
        interestCheckboxes = new ArrayList<>();
    }

    private void setupUserData() {
        userName = getIntent().getStringExtra("user_name");
        if (userName == null || userName.isEmpty()) {
            userName = "anonymous";
        }

        String mode = getIntent().getStringExtra("mode");
        isUpdate = mode != null && mode.equals("update");
    }

    private void setupUIFromConfiguration() {
        // Set titles
        titleText.setText(config.getSignupTitle());
        subtitleText.setText(config.getSignupSubtitle());

        // Setup age field visibility
        View ageLayout = findViewById(R.id.age_input_layout);
        if (ageLayout != null) {
            ageLayout.setVisibility(config.isShowAgeField() ? View.VISIBLE : View.GONE);
        }

        // Setup gender field visibility and options
        View genderLayout = findViewById(R.id.gender_layout);
        if (genderLayout != null) {
            genderLayout.setVisibility(config.isShowGenderField() ? View.VISIBLE : View.GONE);
        }

        if (config.isShowGenderField()) {
            setupGenderSpinner();
        }

        // Setup dynamic interests
        setupInterests();
    }

    private void setupGenderSpinner() {
        String[] genderOptions = config.getGenderOptions();
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, genderOptions);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        genderSpinner.setAdapter(adapter);
    }

    private void setupInterests() {
        // Clear existing checkboxes
        interestsContainer.removeAllViews();
        interestCheckboxes.clear();

        List<InterestOption> interests = config.getAvailableInterests();
        for (InterestOption interest : interests) {
            CheckBox checkBox = new CheckBox(this);
            checkBox.setText(interest.getDisplayName());
            checkBox.setTag(interest.getId());
            checkBox.setChecked(interest.isDefault());
            checkBox.setTextSize(16);
            checkBox.setTextColor(getResources().getColor(android.R.color.black));
            checkBox.setPadding(16, 12, 16, 12);

            // Add icon based on interest type
            int iconRes = getIconForInterest(interest.getId());
            if (iconRes != 0) {
                checkBox.setCompoundDrawablesWithIntrinsicBounds(iconRes, 0, 0, 0);
                checkBox.setCompoundDrawablePadding(16);
            }

            // Add description as subtitle if available
            if (!interest.getDescription().isEmpty()) {
                checkBox.setText(interest.getDisplayName() + "\n" + interest.getDescription());
            }

            interestCheckboxes.add(checkBox);
            interestsContainer.addView(checkBox);
        }
    }

    private int getIconForInterest(String interestId) {
        switch (interestId) {
            case "breaking_news":
                return R.drawable.ic_breaking_news;
            case "sports":
                return R.drawable.ic_sports;
            case "weather":
                return R.drawable.ic_weather;
            case "technology":
                return R.drawable.ic_tech;
            case "entertainment":
                return R.drawable.ic_entertainment;
            default:
                return R.drawable.ic_notifications;
        }
    }

    private void setupClickListeners() {
        registerButton.setOnClickListener(v -> handleRegistration());
    }

    private void loadExistingData() {
        // אם במצב עדכון – נמלא את השדות
        if (isUpdate) {
            String genderExtra = getIntent().getStringExtra("gender");
            int ageExtra = getIntent().getIntExtra("age", -1);
            ArrayList<String> interestsExtra = getIntent().getStringArrayListExtra("interests");

            if (genderExtra != null && config.isShowGenderField()) {
                String[] genderArray = config.getGenderOptions();
                for (int i = 0; i < genderArray.length; i++) {
                    if (genderArray[i].toLowerCase().equals(genderExtra)) {
                        genderSpinner.setSelection(i);
                        break;
                    }
                }
            }

            if (ageExtra != -1 && config.isShowAgeField()) {
                ageInput.setText(String.valueOf(ageExtra));
            }

            if (interestsExtra != null) {
                for (CheckBox checkBox : interestCheckboxes) {
                    String interestId = (String) checkBox.getTag();
                    if (interestsExtra.contains(interestId)) {
                        checkBox.setChecked(true);
                    }
                }
            }
        }
    }

    private void handleRegistration() {
        try {
            String gender = "";
            int age = 0;

            // Get gender if field is visible
            if (config.isShowGenderField() && genderSpinner.getSelectedItem() != null) {
                gender = genderSpinner.getSelectedItem().toString().toLowerCase();
            }

            // Get age if field is visible
            if (config.isShowAgeField() && !ageInput.getText().toString().trim().isEmpty()) {
                age = Integer.parseInt(ageInput.getText().toString().trim());
            }

            // Get selected interests
            List<String> interests = new ArrayList<>();
            for (CheckBox checkBox : interestCheckboxes) {
                if (checkBox.isChecked()) {
                    interests.add((String) checkBox.getTag());
                }
            }

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
        } catch (Exception e) {
            Toast.makeText(this, "Please fill all required fields", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadExistingData();
    }
}
