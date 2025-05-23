package com.example.pushnotificationsdk;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    private static final String BASE_URL = "https://ae95-2a06-c701-c055-f900-9840-c5db-e7e8-7a53.ngrok-free.app";
    private static Retrofit retrofit;

    public static PushApiService getService() {
        if (retrofit == null) {
            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit.create(PushApiService.class);
    }
}
