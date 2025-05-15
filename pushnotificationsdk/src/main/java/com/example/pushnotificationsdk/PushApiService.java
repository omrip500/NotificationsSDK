package com.example.pushnotificationsdk;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface PushApiService {
    @POST("/api/devices/register")
    Call<Void> registerDevice(@Body RegisterDeviceRequest request);
}
