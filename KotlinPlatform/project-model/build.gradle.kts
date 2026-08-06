plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
}

kotlin {
    jvmToolchain(21)
    jvm()
    js(IR) { browser() }
    sourceSets.commonMain.dependencies {
        api(project(":diagnostics"))
        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    }
    sourceSets.commonTest.dependencies { implementation(kotlin("test")) }
}
