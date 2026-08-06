plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
}

kotlin {
    jvmToolchain(21)
    jvm()
    sourceSets.commonMain.dependencies {
        api(project(":extension-catalog"))
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    }
}
