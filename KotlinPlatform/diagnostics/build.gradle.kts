plugins {
	kotlin("multiplatform")
	kotlin("plugin.serialization")
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
//		api("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
		api(libs.kotlinx.serialization.json)

	}
}
