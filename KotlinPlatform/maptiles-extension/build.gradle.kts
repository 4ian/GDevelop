plugins { kotlin("multiplatform") }

kotlin {
    jvmToolchain(21)
    jvm()
    js(IR) { browser() }
    sourceSets.commonMain.dependencies { api(project(":extension-catalog")) }
}
