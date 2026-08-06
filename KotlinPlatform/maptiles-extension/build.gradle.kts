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
		api(project(":extension-catalog"))
	}
}
