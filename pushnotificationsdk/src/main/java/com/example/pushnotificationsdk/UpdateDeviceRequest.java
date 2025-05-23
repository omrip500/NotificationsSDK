package com.example.pushnotificationsdk;

public class UpdateDeviceRequest {
    private String token;
    private UserInfo userInfo;

    public UpdateDeviceRequest(String token, UserInfo userInfo) {
        this.token = token;
        this.userInfo = userInfo;
    }

    public String getToken() {
        return token;
    }

    public UserInfo getUserInfo() {
        return userInfo;
    }
}

