plugins {
	kotlin("multiplatform")
}

kotlin {
	js(IR) {
		browser {
			testTask {
				useKarma {
					useChromiumHeadless()
				}
			}
			binaries.executable()
		}
	}
	sourceSets.jsMain.dependencies {
		implementation(project(":map-runtime"))
		implementation(project(":normalized-ir"))
		implementation(project(":maptiles-extension"))
//		implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
//		implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
		implementation(libs.kotlinx.serialization.json)
		implementation(libs.kotlinx.coroutines.core)
		implementation(npm("maplibre-gl", "5.6.2"))
		implementation(devNpm("css-loader", "7.1.2"))
		implementation(devNpm("style-loader", "4.0.0"))
	}
}
