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
        availableInterests.add(new InterestOption("sports", "Sports", "Sports news and updates"));
        availableInterests.add(new InterestOption("politics", "Politics", "Political news and updates"));
        availableInterests.add(new InterestOption("technology", "Technology", "Tech news and updates"));

        // Default gender options
        genderOptions = new String[]{"Male", "Female", "Other"};

        // Default field visibility
        showAgeField = true;
        showGenderField = true;

        // Default titles
        signupTitle = "Join Notifications";
        signupSubtitle = "Personalize your notification experience";
    }

    // Builder pattern for easy configuration
    public static class Builder {
        private SDKConfiguration config;

        public Builder() {
            config = SDKConfiguration.getInstance();
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

    // Reset to defaults
    public void resetToDefaults() {
        initializeDefaults();
    }
}
