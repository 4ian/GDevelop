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
		api(project(":diagnostics"))
//		api("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
		api(libs.kotlinx.serialization.json)
	}
	sourceSets.commonTest.dependencies { implementation(kotlin("test")) }
}
