package com.example.pushnotificationsdk;

public class RegisterDeviceRequest {
    private String token;
    private String appId;
    private UserInfo userInfo;

    public RegisterDeviceRequest(String token, String appId, UserInfo userInfo) {
        this.token = token;
        this.appId = appId;
        this.userInfo = userInfo;
    }

    public String getToken() {
        return token;
    }

    public String getAppId() {
        return appId;
    }

    public UserInfo getUserInfo() {
        return userInfo;
    }
}
