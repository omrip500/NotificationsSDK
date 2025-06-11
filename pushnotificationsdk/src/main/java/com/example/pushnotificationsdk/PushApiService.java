package com.example.pushnotificationsdk;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface PushApiService {
    @POST("/api/devices/register")
    Call<Void> registerDevice(@Body RegisterDeviceRequest request);

    @GET("/api/notifications/history/{token}")
    Call<List<com.example.pushnotificationsdk.NotificationLog>> getNotificationHistory(@Path("token") String token);

    @GET("/api/devices/me/{token}")
    Call<UserInfoResponse> getDeviceInfoByToken(@Path("token") String token);

    @PUT("/api/devices/update")
    Call<Void> updateDeviceInfo(@Body UpdateDeviceRequest request);

    @PUT("/api/devices/update-location")
    Call<Void> updateDeviceLocation(@Body UpdateLocationRequest request);

    @DELETE("/api/devices/unregister/{token}")
    Call<Void> unregisterDevice(@Path("token") String token);

    @GET("/api/applications/{appId}/client-id")
    Call<ClientIdResponse> getClientIdByAppId(@Path("appId") String appId);

    @PUT("/api/applications/{appId}/interests")
    Call<Void> updateApplicationInterests(@Path("appId") String appId, @Body UpdateInterestsRequest request);

    @GET("/api/applications/{appId}/interests")
    Call<InterestsResponse> getApplicationInterests(@Path("appId") String appId);

    @DELETE("/api/notifications/{id}")
    Call<Void> deleteNotification(@Path("id") String notificationId);





}
