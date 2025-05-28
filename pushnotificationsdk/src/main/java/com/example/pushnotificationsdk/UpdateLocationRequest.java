package com.example.pushnotificationsdk;

/**
 * Request class for updating device location
 */
public class UpdateLocationRequest {
    private String token;
    private double lat;
    private double lng;

    public UpdateLocationRequest(String token, double lat, double lng) {
        this.token = token;
        this.lat = lat;
        this.lng = lng;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }
}
