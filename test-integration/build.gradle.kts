plugins {
    id("com.android.application")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.example.testintegration"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.testintegration"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Test the new v1.2.0 SDK
    implementation("com.github.omrip500:NotificationsSDK:v1.2.0")
    implementation("com.google.firebase:firebase-messaging:24.1.1")
    implementation(platform("com.google.firebase:firebase-bom:33.15.0"))
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity:1.10.1")
    implementation("androidx.constraintlayout:constraintlayout:2.2.1")
}
