plugins { kotlin("multiplatform") }

kotlin {
    jvmToolchain(21)
    jvm()
    sourceSets.commonMain.dependencies { api(project(":extension-catalog")) }
}
