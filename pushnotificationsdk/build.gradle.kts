plugins {
    id("com.android.library")
    id("maven-publish")
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

    publishing {
        singleVariant("release") {
            withSourcesJar()
            withJavadocJar()
        }
    }
}

dependencies {
    implementation ("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.google.firebase:firebase-messaging:24.1.1")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.recyclerview:recyclerview:1.4.0")
    implementation("androidx.cardview:cardview:1.0.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.1")
    implementation("com.google.android.material:material:1.12.0")

    // Google Play Services Location for location tracking
    implementation("com.google.android.gms:play-services-location:21.3.0")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test:monitor:1.7.2")
}

afterEvaluate {
    publishing {
        publications {
            register<MavenPublication>("release") {
                groupId = "com.github.omrip500"
                artifactId = "NotificationsSDK"
                version = findProperty("version")?.toString() ?: "1.0.0"

                from(components["release"])

                pom {
                    name.set("Push Notifications SDK")
                    description.set("Android SDK for push notifications management")
                    url.set("https://github.com/omrip500/NotificationsSDK")

                    licenses {
                        license {
                            name.set("MIT License")
                            url.set("https://opensource.org/licenses/MIT")
                        }
                    }

                    developers {
                        developer {
                            id.set("omrip500")
                            name.set("Omri Peer")
                        }
                    }

                    scm {
                        connection.set("scm:git:git://github.com/omrip500/NotificationsSDK.git")
                        developerConnection.set("scm:git:ssh://github.com/omrip500/NotificationsSDK.git")
                        url.set("https://github.com/omrip500/NotificationsSDK")
                    }
                }
            }
        }
    }
}
