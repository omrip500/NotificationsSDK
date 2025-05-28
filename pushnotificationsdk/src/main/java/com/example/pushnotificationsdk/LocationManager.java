package com.example.pushnotificationsdk;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnSuccessListener;

/**
 * Manages location permissions and tracking for the SDK
 */
public class LocationManager {
    private static final String TAG = "LocationManager";
    private static final int LOCATION_PERMISSION_REQUEST_CODE = 1001;
    private static final int BACKGROUND_LOCATION_PERMISSION_REQUEST_CODE = 1002;

    private Context context;
    private FusedLocationProviderClient fusedLocationClient;
    private LocationPermissionCallback permissionCallback;

    public interface LocationPermissionCallback {
        void onPermissionGranted();
        void onPermissionDenied();
    }

    public interface LocationUpdateCallback {
        void onLocationUpdated(double latitude, double longitude);
        void onLocationError(String error);
    }

    public LocationManager(Context context) {
        this.context = context.getApplicationContext();
        this.fusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
    }

    /**
     * Check if location permissions are granted
     */
    public boolean hasLocationPermissions() {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) 
                == PackageManager.PERMISSION_GRANTED &&
               ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) 
                == PackageManager.PERMISSION_GRANTED;
    }

    /**
     * Check if background location permission is granted (Android 10+)
     */
    public boolean hasBackgroundLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_BACKGROUND_LOCATION) 
                    == PackageManager.PERMISSION_GRANTED;
        }
        return true; // Not needed for older versions
    }

    /**
     * Request location permissions
     */
    public void requestLocationPermissions(Activity activity, LocationPermissionCallback callback) {
        this.permissionCallback = callback;

        if (hasLocationPermissions()) {
            // If we have basic location permissions, check for background permission
            if (hasBackgroundLocationPermission()) {
                callback.onPermissionGranted();
            } else {
                requestBackgroundLocationPermission(activity);
            }
        } else {
            // Request basic location permissions first
            ActivityCompat.requestPermissions(activity,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    },
                    LOCATION_PERMISSION_REQUEST_CODE);
        }
    }

    /**
     * Request background location permission (Android 10+)
     */
    private void requestBackgroundLocationPermission(Activity activity) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ActivityCompat.requestPermissions(activity,
                    new String[]{Manifest.permission.ACCESS_BACKGROUND_LOCATION},
                    BACKGROUND_LOCATION_PERMISSION_REQUEST_CODE);
        } else {
            permissionCallback.onPermissionGranted();
        }
    }

    /**
     * Handle permission request results
     */
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (permissionCallback == null) return;

        switch (requestCode) {
            case LOCATION_PERMISSION_REQUEST_CODE:
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Log.d(TAG, "✅ Basic location permissions granted");
                    // Now request background permission if needed
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        requestBackgroundLocationPermission((Activity) context);
                    } else {
                        permissionCallback.onPermissionGranted();
                    }
                } else {
                    Log.e(TAG, "❌ Basic location permissions denied");
                    permissionCallback.onPermissionDenied();
                }
                break;

            case BACKGROUND_LOCATION_PERMISSION_REQUEST_CODE:
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Log.d(TAG, "✅ Background location permission granted");
                    permissionCallback.onPermissionGranted();
                } else {
                    Log.w(TAG, "⚠️ Background location permission denied - continuing with foreground only");
                    // Still proceed even if background permission is denied
                    permissionCallback.onPermissionGranted();
                }
                break;
        }
    }

    /**
     * Get current location
     */
    public void getCurrentLocation(LocationUpdateCallback callback) {
        if (!hasLocationPermissions()) {
            callback.onLocationError("Location permissions not granted");
            return;
        }

        try {
            fusedLocationClient.getLastLocation()
                    .addOnSuccessListener(new OnSuccessListener<Location>() {
                        @Override
                        public void onSuccess(Location location) {
                            if (location != null) {
                                Log.d(TAG, "✅ Location obtained: " + location.getLatitude() + ", " + location.getLongitude());
                                callback.onLocationUpdated(location.getLatitude(), location.getLongitude());
                            } else {
                                Log.w(TAG, "⚠️ Location is null");
                                callback.onLocationError("Unable to get current location");
                            }
                        }
                    })
                    .addOnFailureListener(e -> {
                        Log.e(TAG, "❌ Failed to get location", e);
                        callback.onLocationError("Failed to get location: " + e.getMessage());
                    });
        } catch (SecurityException e) {
            Log.e(TAG, "❌ Security exception when getting location", e);
            callback.onLocationError("Security exception: " + e.getMessage());
        }
    }

    /**
     * Start location tracking service
     */
    public void startLocationTracking() {
        if (!hasLocationPermissions()) {
            Log.e(TAG, "❌ Cannot start location tracking - permissions not granted");
            return;
        }

        Intent serviceIntent = new Intent(context, LocationTrackingService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
        Log.d(TAG, "✅ Location tracking service started");
    }

    /**
     * Stop location tracking service
     */
    public void stopLocationTracking() {
        Intent serviceIntent = new Intent(context, LocationTrackingService.class);
        context.stopService(serviceIntent);
        Log.d(TAG, "🛑 Location tracking service stopped");
    }
}
