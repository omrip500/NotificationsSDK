package com.example.pushnotificationsdk;

import java.util.List;

/**
 * Response class for getting application interests configuration from server
 */
public class InterestsConfigResponse {
    private List<String> interests;

    public InterestsConfigResponse() {
    }

    public InterestsConfigResponse(List<String> interests) {
        this.interests = interests;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }
}
