plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.mpburton812.motherwatchface"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.mpburton812.motherwatchface"
        minSdk = 36
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        debug {
            isMinifyEnabled = true
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}
