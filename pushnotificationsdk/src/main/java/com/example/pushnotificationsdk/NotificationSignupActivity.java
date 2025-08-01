package com.example.pushnotificationsdk;

import android.os.Bundle;
import android.util.Log;
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
        currentUser = PushNotificationManager.getInstance().getCurrentUser();

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
        // Clear existing checkboxes and container
        interestCheckboxes.clear();
        interestsContainer.removeAllViews();

        // Setup location-based notifications first if enabled
        if (config.isShowLocationBasedNotifications()) {
            setupLocationBasedNotifications();
        }

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

        // Load existing user interests after creating checkboxes
        Log.d("NotificationSignup", "🔄 setupInterests completed, calling loadExistingData...");
        loadExistingData();
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
        Log.d("NotificationSignup", "🔄 Loading existing data...");

        // Load existing user interests
        if (currentUser != null && currentUser.getInterests() != null) {
            List<String> userInterests = currentUser.getInterests();
            Log.d("NotificationSignup", "✅ User interests found: " + userInterests);

            for (CheckBox checkBox : interestCheckboxes) {
                String interestId = (String) checkBox.getTag();
                if (userInterests.contains(interestId)) {
                    Log.d("NotificationSignup", "✅ Checking interest: " + interestId);
                    checkBox.setChecked(true);
                } else {
                    Log.d("NotificationSignup", "⚪ Interest not selected: " + interestId);
                }
            }
        } else {
            Log.w("NotificationSignup", "⚠️ No current user or interests found");
            if (currentUser == null) {
                Log.w("NotificationSignup", "❌ currentUser is null");
            } else if (currentUser.getInterests() == null) {
                Log.w("NotificationSignup", "❌ currentUser.getInterests() is null");
            }
        }

        // If in update mode - also fill from intent (higher priority)
        if (isUpdate) {
            ArrayList<String> interestsExtra = getIntent().getStringArrayListExtra("interests");

            if (interestsExtra != null) {
                // First clear all selections
                for (CheckBox checkBox : interestCheckboxes) {
                    checkBox.setChecked(false);
                }

                // Mark interests from intent
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

            Log.d("NotificationSignup", "🎯 Selected interests: " + interests);

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

            Log.d("NotificationSignup", "📝 Created UserInfo with interests: " + userInfo.getInterests());

            // First, always request notification permissions (Android 13+)
            requestNotificationPermissionsAndContinue(userInfo, locationBased);

        } catch (Exception e) {
            Log.e("NotificationSignup", "❌ Error in handleRegistration", e);
            Toast.makeText(this, "Please select at least one notification type", Toast.LENGTH_SHORT).show();
        }
    }

    private void requestNotificationPermissionsAndContinue(UserInfo userInfo, boolean locationBased) {
        PushNotificationManager manager = PushNotificationManager.getInstance();

        manager.requestNotificationPermissions(this, new PushNotificationManager.NotificationPermissionCallback() {
            @Override
            public void onPermissionGranted() {
                Toast.makeText(NotificationSignupActivity.this, "Notification permissions granted!", Toast.LENGTH_SHORT).show();

                // Now check if we need location permissions
                if (locationBased) {
                    requestLocationPermissionsAndRegister(userInfo);
                } else {
                    completeRegistration(userInfo);
                }
            }

            @Override
            public void onPermissionDenied() {
                Toast.makeText(NotificationSignupActivity.this, "Notification permissions denied. Notifications may not work properly.", Toast.LENGTH_LONG).show();

                // Continue anyway - maybe user will grant permission later
                if (locationBased) {
                    requestLocationPermissionsAndRegister(userInfo);
                } else {
                    completeRegistration(userInfo);
                }
            }
        });
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
        Log.d("NotificationSignup", "🚀 Completing registration with interests: " + userInfo.getInterests());

        if (isUpdate) {
            Log.d("NotificationSignup", "🔄 Updating user...");
            PushNotificationManager.getInstance()
                    .updateUser(userInfo);
            Toast.makeText(this, "Notification preferences updated!", Toast.LENGTH_SHORT).show();
        } else {
            Log.d("NotificationSignup", "📝 Registering new user...");
            PushNotificationManager.getInstance()
                    .registerUser(userInfo);
            Toast.makeText(this, "Notifications enabled!", Toast.LENGTH_SHORT).show();
        }

        Log.d("NotificationSignup", "✅ Registration completed, finishing activity");
        finish();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        PushNotificationManager manager = PushNotificationManager.getInstance();

        // Handle notification permission results
        manager.onNotificationPermissionResult(requestCode, permissions, grantResults);

        // Forward location permission results to LocationManager
        manager.getLocationManager()
                .onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadExistingData();
    }
}
