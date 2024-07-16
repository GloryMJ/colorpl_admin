plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.jetbrains.kotlin.android)
    alias(libs.plugins.hilt.gradle.plugin)
    alias(libs.plugins.kotlin.kapt)
}

android {
    namespace = "com.colorpl.data"
    compileSdk = 34

    defaultConfig {
        minSdk = 24

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        consumerProguardFiles("consumer-rules.pro")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    // Permission
    implementation(libs.ted.permission.normal)
    implementation(libs.ted.permission.coroutine)

    // Log
    implementation(libs.timber)

    // Glide
    implementation(libs.glide)

    // Coroutine
    implementation(libs.coroutines.android)
    implementation(libs.coroutines.core)

    // DI
    implementation(libs.hilt.android)
    androidTestImplementation(libs.hilt.android.testing)
    kapt(libs.hilt.compiler)
    kaptAndroidTest(libs.hilt.compiler)

    // Network
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.retrofit.converter.kotlinxSerialization)
    implementation(libs.okhttp)
    implementation(platform(libs.okhttp.bom))
    implementation(libs.okhttp.loggingInterceptor)
    implementation(libs.kotlinx.serialization.core)
    implementation(libs.kotlinx.serialization.json)
}