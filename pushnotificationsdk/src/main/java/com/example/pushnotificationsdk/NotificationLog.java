package com.example.pushnotificationsdk;

import com.google.gson.annotations.SerializedName;
import java.util.Map;

public class NotificationLog {

    @SerializedName("_id")
    private String id;

    private String title;
    private String body;
    private String type;
    private String token;
    private Map<String, Object> filters;
    private String sentAt;

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getType() {
        return type;
    }

    public String getToken() {
        return token;
    }

    public Map<String, Object> getFilters() {
        return filters;
    }

    public String getSentAt() {
        return sentAt;
    }
}
