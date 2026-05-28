plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.mpburton812.motherwatchface.companion"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mpburton812.motherwatchface"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        debug {
            isMinifyEnabled = false
        }
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

dependencies {
    // Standard android support dependencies
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.9.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // Embed the Wear OS watch face inside the phone companion app
    wearApp(project(":watchface"))
}
