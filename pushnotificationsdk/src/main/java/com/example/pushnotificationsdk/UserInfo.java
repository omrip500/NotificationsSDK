package com.example.pushnotificationsdk;

import java.util.List;

public class UserInfo {
    private String userId;
    private String gender;
    private int age;
    private List<String> interests;
    private double lat;
    private double lng;

    public UserInfo(String userId, String gender, int age, List<String> interests, double lat, double lng) {
        this.userId = userId;
        this.gender = gender;
        this.age = age;
        this.interests = interests;
        this.lat = lat;
        this.lng = lng;
    }

    // Getters and setters (או השתמש ב־Gson אם אתה לא צריך אותם ידנית)
}
