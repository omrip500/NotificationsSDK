plugins {
    id("com.android.library")
}

android {
    namespace = "com.example.pushnotificationsdk_library"
    compileSdk = 35

    defaultConfig {
        minSdk = 24
        targetSdk = 35

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("com.google.firebase:firebase-messaging:23.4.0")
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.cardview:cardview:1.0.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation(libs.monitor)
    implementation(libs.ext.junit)
    implementation(libs.material)

    // Google Play Services Location for location tracking
    implementation("com.google.android.gms:play-services-location:21.0.1")

    testImplementation ("junit:junit:4.13.2")
}
