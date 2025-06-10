package com.example.pushnotificationsdk;

public class RegisterDeviceRequest {
    private String token;
    private String appId;
    private String clientId;
    private UserInfo userInfo;

    public RegisterDeviceRequest(String token, String appId, String clientId, UserInfo userInfo) {
        this.token = token;
        this.appId = appId;
        this.clientId = clientId;
        this.userInfo = userInfo;
    }

    public String getToken() {
        return token;
    }

    public String getAppId() {
        return appId;
    }

    public String getClientId() {
        return clientId;
    }

    public UserInfo getUserInfo() {
        return userInfo;
    }
}
