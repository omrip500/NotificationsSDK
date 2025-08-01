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

    public String getUserId() {
        return userId;
    }

    public String getGender() {
        return gender;
    }

    public int getAge() {
        return age;
    }

    public List<String> getInterests() {
        return interests;
    }

    public double getLat() {
        return lat;
    }

    public double getLng() {
        return lng;
    }



    // Getters and setters (or use Gson if you don't need them manually)
}
