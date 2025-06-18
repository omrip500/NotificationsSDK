package com.example.pushnotificationsdk;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

/**
 * Activity for app-level settings (different from SDK notification settings)
 */
public class AppSettingsActivity extends AppCompatActivity {

    private Switch autoRefreshSwitch;
    private Switch darkModeSwitch;
    private Switch showBreakingFirstSwitch;
    private TextView versionText;
    private Button clearCacheButton;
    private Button aboutButton;
    private Button sdkSettingsButton;

    private SharedPreferences preferences;
    private static final String PREFS_NAME = "NewsAppPrefs";
    private static final String PREF_AUTO_REFRESH = "auto_refresh";
    private static final String PREF_DARK_MODE = "dark_mode";
    private static final String PREF_BREAKING_FIRST = "breaking_first";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_app_settings);

        setupToolbar();
        initializeViews();
        loadPreferences();
        setupClickListeners();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("App Settings");
        }
    }

    private void initializeViews() {
        autoRefreshSwitch = findViewById(R.id.switch_auto_refresh);
        darkModeSwitch = findViewById(R.id.switch_dark_mode);
        showBreakingFirstSwitch = findViewById(R.id.switch_breaking_first);
        versionText = findViewById(R.id.text_version);
        clearCacheButton = findViewById(R.id.button_clear_cache);
        aboutButton = findViewById(R.id.button_about);
        sdkSettingsButton = findViewById(R.id.button_sdk_settings);

        // Set version info
        versionText.setText("Version 1.0.0 (Demo)");
    }

    private void loadPreferences() {
        preferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        
        autoRefreshSwitch.setChecked(preferences.getBoolean(PREF_AUTO_REFRESH, true));
        darkModeSwitch.setChecked(preferences.getBoolean(PREF_DARK_MODE, false));
        showBreakingFirstSwitch.setChecked(preferences.getBoolean(PREF_BREAKING_FIRST, true));
    }

    private void setupClickListeners() {
        autoRefreshSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            preferences.edit().putBoolean(PREF_AUTO_REFRESH, isChecked).apply();
            Toast.makeText(this, "Auto refresh " + (isChecked ? "enabled" : "disabled"), Toast.LENGTH_SHORT).show();
        });

        darkModeSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            preferences.edit().putBoolean(PREF_DARK_MODE, isChecked).apply();
            Toast.makeText(this, "Dark mode " + (isChecked ? "enabled" : "disabled") + " (restart app to apply)", Toast.LENGTH_LONG).show();
        });

        showBreakingFirstSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            preferences.edit().putBoolean(PREF_BREAKING_FIRST, isChecked).apply();
            Toast.makeText(this, "Breaking news priority " + (isChecked ? "enabled" : "disabled"), Toast.LENGTH_SHORT).show();
        });

        clearCacheButton.setOnClickListener(v -> {
            // Simulate cache clearing
            Toast.makeText(this, "Cache cleared successfully", Toast.LENGTH_SHORT).show();
        });

        aboutButton.setOnClickListener(v -> {
            showAboutDialog();
        });

        sdkSettingsButton.setOnClickListener(v -> {
            // Launch SDK notification setup screen (Enable Notifications)
            PushNotificationManager notificationManager = PushNotificationManager.getInstance();
            if (notificationManager != null) {
                notificationManager.launchNotificationSetupScreen(this);
            } else {
                Toast.makeText(this, "SDK not initialized", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showAboutDialog() {
        androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        builder.setTitle("About News Demo App");
        builder.setMessage("This is a demonstration application for the Push Notifications SDK.\n\n" +
                "Features:\n" +
                "• News article display\n" +
                "• Push notification management\n" +
                "• User preference settings\n" +
                "• Notification history\n\n" +
                "SDK Version: 1.1.6\n" +
                "Developed by: Augment Code");
        builder.setPositiveButton("OK", null);
        builder.show();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == android.R.id.home) {
            onBackPressed();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
