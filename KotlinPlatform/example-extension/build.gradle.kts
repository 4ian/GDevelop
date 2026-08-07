plugins { kotlin("multiplatform") }

kotlin {
	jvmToolchain(libs.versions.toolchain.get().toInt())
	jvm()
	sourceSets.commonMain.dependencies {
		api(project(":extension-catalog"))
	}
}
