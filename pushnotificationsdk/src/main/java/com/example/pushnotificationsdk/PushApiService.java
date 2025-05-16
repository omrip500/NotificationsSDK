package com.example.pushnotificationsdk;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface PushApiService {
    @POST("/api/devices/register")
    Call<Void> registerDevice(@Body RegisterDeviceRequest request);

    @GET("/api/notifications/history/{token}")
    Call<List<com.example.pushnotificationsdk.NotificationLog>> getNotificationHistory(@Path("token") String token);

}
