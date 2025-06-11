package com.example.pushnotificationsdk;

import java.util.List;

public class UpdateInterestsRequest {
    private List<String> interests;

    public UpdateInterestsRequest(List<String> interests) {
        this.interests = interests;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }
}
