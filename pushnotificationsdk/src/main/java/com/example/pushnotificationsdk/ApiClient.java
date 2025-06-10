package com.example.pushnotificationsdk;

import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    private static final String BASE_URL = "http://sdk-backend-env-1.eba-rjkps84i.us-east-1.elasticbeanstalk.com"; // Remote server
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
