plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.hilt) apply false
    alias(libs.plugins.ksp) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.google.services) apply false
}

val googleServicesDest = file("app/google-services.json")
if (!googleServicesDest.exists()) {
    val fromMobile = rootProject.projectDir.resolve("../mobile/google-services.json")
    if (fromMobile.exists()) {
        fromMobile.copyTo(googleServicesDest)
    }
}
