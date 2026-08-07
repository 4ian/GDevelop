plugins {
	kotlin("multiplatform")
}

kotlin {
	jvmToolchain(libs.versions.toolchain.get().toInt())
	jvm()
	js(IR) {
		browser {
			testTask {
				useKarma {
					useChromiumHeadless()
				}
			}
		}
	}
	sourceSets.commonMain.dependencies {
		api(project(":diagnostics"))
		api(project(":project-model"))
		api(project(":extension-catalog"))
	}
	sourceSets.commonTest.dependencies {
		implementation(kotlin("test"))
		implementation(project(":maptiles-extension"))
	}
}
