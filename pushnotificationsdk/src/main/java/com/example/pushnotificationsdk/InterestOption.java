package com.example.pushnotificationsdk;

/**
 * Represents an interest option that can be configured by the SDK client
 */
public class InterestOption {
    private String id;
    private String displayName;
    private String description;
    private boolean isDefault;

    public InterestOption(String id, String displayName) {
        this.id = id;
        this.displayName = displayName;
        this.description = "";
        this.isDefault = false;
    }

    public InterestOption(String id, String displayName, String description) {
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.isDefault = false;
    }

    public InterestOption(String id, String displayName, String description, boolean isDefault) {
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.isDefault = isDefault;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
