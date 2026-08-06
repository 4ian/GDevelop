plugins {
    kotlin("multiplatform")
}

kotlin {
    jvmToolchain(21)
    jvm()
    js(IR) { browser() }
    sourceSets.commonMain.dependencies {
        api(project(":diagnostics"))
        api(project(":project-model"))
        api(project(":extension-catalog"))
    }
    sourceSets.commonTest.dependencies { implementation(kotlin("test")) }
}
