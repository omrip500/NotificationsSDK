package com.example.pushnotificationsdk;

import java.util.List;

public class InterestsResponse {
    private List<String> interests;

    public InterestsResponse() {}

    public InterestsResponse(List<String> interests) {
        this.interests = interests;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }
}
