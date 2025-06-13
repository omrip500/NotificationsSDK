package com.example.pushnotificationsdk;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Configuration class for the Push Notification SDK
 * Allows clients to customize the SDK behavior and options
 */
public class SDKConfiguration {
    private static SDKConfiguration instance;
    private List<InterestOption> availableInterests;
    private String[] genderOptions;
    private boolean showAgeField;
    private boolean showGenderField;
    private boolean showLocationBasedNotifications;
    private String signupTitle;
    private String signupSubtitle;

    private SDKConfiguration() {
        // Default configuration
        initializeDefaults();
    }

    public static SDKConfiguration getInstance() {
        if (instance == null) {
            instance = new SDKConfiguration();
        }
        return instance;
    }

    private void initializeDefaults() {
        // Default interests
        availableInterests = new ArrayList<>();
        availableInterests.add(new InterestOption("breaking_news", "Breaking News", "Important news alerts", true));
        availableInterests.add(new InterestOption("sports", "Sports", "Sports scores and updates"));
        availableInterests.add(new InterestOption("weather", "Weather", "Weather alerts and forecasts"));

        // Default gender options
        genderOptions = new String[]{"Male", "Female", "Other"};

        // Default field visibility
        showAgeField = false;
        showGenderField = false;
        showLocationBasedNotifications = false;

        // Default titles
        signupTitle = "Enable Notifications";
        signupSubtitle = "Choose what notifications you'd like to receive";
    }

    // Builder pattern for easy configuration
    public static class Builder {
        private SDKConfiguration config;

        public Builder() {
            config = SDKConfiguration.getInstance();
            // Clear existing interests to avoid duplicates
            config.availableInterests = new ArrayList<>();
        }

        public Builder setInterests(List<InterestOption> interests) {
            config.availableInterests = new ArrayList<>(interests);
            return this;
        }

        public Builder addInterest(InterestOption interest) {
            if (config.availableInterests == null) {
                config.availableInterests = new ArrayList<>();
            }
            config.availableInterests.add(interest);
            return this;
        }

        public Builder setGenderOptions(String[] genderOptions) {
            config.genderOptions = genderOptions.clone();
            return this;
        }

        public Builder showAgeField(boolean show) {
            config.showAgeField = show;
            return this;
        }

        public Builder showGenderField(boolean show) {
            config.showGenderField = show;
            return this;
        }

        public Builder setSignupTitle(String title) {
            config.signupTitle = title;
            return this;
        }

        public Builder setSignupSubtitle(String subtitle) {
            config.signupSubtitle = subtitle;
            return this;
        }

        public Builder showLocationBasedNotifications(boolean show) {
            config.showLocationBasedNotifications = show;
            return this;
        }

        public SDKConfiguration build() {
            return config;
        }
    }

    // Getters
    public List<InterestOption> getAvailableInterests() {
        return availableInterests != null ? new ArrayList<>(availableInterests) : new ArrayList<>();
    }

    public String[] getGenderOptions() {
        return genderOptions != null ? genderOptions.clone() : new String[0];
    }

    public boolean isShowAgeField() {
        return showAgeField;
    }

    public boolean isShowGenderField() {
        return showGenderField;
    }

    public String getSignupTitle() {
        return signupTitle;
    }

    public String getSignupSubtitle() {
        return signupSubtitle;
    }

    public boolean isShowLocationBasedNotifications() {
        return showLocationBasedNotifications;
    }

    // Reset to defaults
    public void resetToDefaults() {
        initializeDefaults();
    }
}
