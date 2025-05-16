package com.example.pushnotificationsdk;

import java.util.Map;

public class NotificationLog {
    private String title;
    private String body;
    private String type; // "broadcast" or "individual"
    private String token; // רלוונטי רק ל-individual
    private Map<String, Object> filters; // רלוונטי רק ל-broadcast
    private String sentAt;

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
