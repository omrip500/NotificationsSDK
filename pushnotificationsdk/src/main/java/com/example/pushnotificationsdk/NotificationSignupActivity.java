package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.view.View;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

import com.example.pushnotificationsdk_library.R;

import java.util.ArrayList;
import java.util.List;

public class NotificationSignupActivity extends AppCompatActivity {

    private LinearLayout interestsContainer;
    private Button registerButton;
    private TextView titleText, subtitleText;
    private List<CheckBox> interestCheckboxes;
    private CheckBox locationBasedCheckbox;

    private boolean isUpdate = false;
    private SDKConfiguration config;
    private UserInfo currentUser;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notification_signup);

        // Get configuration and current user
        config = SDKConfiguration.getInstance();
        currentUser = PushNotificationManager.getInstance(this).getCurrentUser();

        if (currentUser == null) {
            Toast.makeText(this, "User not set. Please contact app developer.", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

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
        interestsContainer = findViewById(R.id.interests_container);
        registerButton = findViewById(R.id.register_button);
        interestCheckboxes = new ArrayList<>();
    }

    private void setupUserData() {
        String mode = getIntent().getStringExtra("mode");
        isUpdate = mode != null && mode.equals("update");
    }

    private void setupUIFromConfiguration() {
        // Set titles
        titleText.setText(config.getSignupTitle());
        subtitleText.setText(config.getSignupSubtitle());

        // Hide age and gender fields (they're not needed anymore)
        View ageLayout = findViewById(R.id.age_input_layout);
        if (ageLayout != null) {
            ageLayout.setVisibility(View.GONE);
        }

        View genderLayout = findViewById(R.id.gender_layout);
        if (genderLayout != null) {
            genderLayout.setVisibility(View.GONE);
        }

        // Setup location-based notifications
        setupLocationBasedNotifications();

        // Setup dynamic interests
        setupInterests();
    }

    private void setupLocationBasedNotifications() {
        if (!config.isShowLocationBasedNotifications()) {
            return;
        }

        // Add location-based checkbox at the beginning of interests container
        locationBasedCheckbox = new CheckBox(this);
        locationBasedCheckbox.setText("Receive location-based notifications");
        locationBasedCheckbox.setTextSize(16);
        locationBasedCheckbox.setTextColor(getResources().getColor(android.R.color.black));
        locationBasedCheckbox.setPadding(16, 12, 16, 12);
        locationBasedCheckbox.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_location, 0, 0, 0);
        locationBasedCheckbox.setCompoundDrawablePadding(16);

        // Add some spacing
        View spacer = new View(this);
        spacer.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 24));

        interestsContainer.addView(locationBasedCheckbox);
        interestsContainer.addView(spacer);
    }

    private void setupInterests() {
        // Setup location-based notifications first
        setupLocationBasedNotifications();

        // Clear existing interest checkboxes
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
            ArrayList<String> interestsExtra = getIntent().getStringArrayListExtra("interests");

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
            // Get selected interests
            List<String> interests = new ArrayList<>();
            for (CheckBox checkBox : interestCheckboxes) {
                if (checkBox.isChecked()) {
                    interests.add((String) checkBox.getTag());
                }
            }

            // Check if location-based notifications are enabled
            boolean locationBased = locationBasedCheckbox != null && locationBasedCheckbox.isChecked();

            // Create updated user info with current user data + selected interests
            UserInfo userInfo = new UserInfo(
                    currentUser.getUserId(),
                    currentUser.getGender(),
                    currentUser.getAge(),
                    interests,
                    currentUser.getLat(),
                    currentUser.getLng()
            );

            // If location-based notifications are requested, ask for permissions
            if (locationBased) {
                requestLocationPermissionsAndRegister(userInfo);
            } else {
                // Register without location tracking
                completeRegistration(userInfo);
            }

        } catch (Exception e) {
            Toast.makeText(this, "Please select at least one notification type", Toast.LENGTH_SHORT).show();
        }
    }

    private void requestLocationPermissionsAndRegister(UserInfo userInfo) {
        PushNotificationManager manager = PushNotificationManager.getInstance(this);

        manager.requestLocationPermissions(this, new LocationManager.LocationPermissionCallback() {
            @Override
            public void onPermissionGranted() {
                Toast.makeText(NotificationSignupActivity.this, "Location permissions granted!", Toast.LENGTH_SHORT).show();
                completeRegistration(userInfo);
            }

            @Override
            public void onPermissionDenied() {
                Toast.makeText(NotificationSignupActivity.this, "Location permissions denied. Continuing without location-based notifications.", Toast.LENGTH_LONG).show();
                completeRegistration(userInfo);
            }
        });
    }

    private void completeRegistration(UserInfo userInfo) {
        if (isUpdate) {
            PushNotificationManager.getInstance(this)
                    .updateUserInfo("6825f0b2f5d70b84cf230fbf", userInfo);
            Toast.makeText(this, "Notification preferences updated!", Toast.LENGTH_SHORT).show();
        } else {
            PushNotificationManager.getInstance(this)
                    .registerToServer("6825f0b2f5d70b84cf230fbf", userInfo);
            Toast.makeText(this, "Notifications enabled!", Toast.LENGTH_SHORT).show();
        }

        finish();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        // Forward permission results to LocationManager
        PushNotificationManager.getInstance(this)
                .getLocationManager()
                .onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadExistingData();
    }
}
