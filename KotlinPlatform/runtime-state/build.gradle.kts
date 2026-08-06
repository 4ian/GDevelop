plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
}

kotlin {
    jvmToolchain(21)
    jvm()
    sourceSets.commonMain.dependencies {
        api(project(":diagnostics"))
        api(project(":normalized-ir"))
        api(project(":extension-catalog"))
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    }
    sourceSets.commonTest.dependencies { implementation(kotlin("test")) }
}
