package com.example.pushnotificationsdk;

public class ClientIdResponse {
    private String clientId;
    private String appId;

    public ClientIdResponse() {
        // Default constructor for JSON deserialization
    }

    public ClientIdResponse(String clientId, String appId) {
        this.clientId = clientId;
        this.appId = appId;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getAppId() {
        return appId;
    }

    public void setAppId(String appId) {
        this.appId = appId;
    }
}
