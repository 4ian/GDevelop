plugins {
	kotlin("multiplatform")
	kotlin("plugin.serialization")
}

kotlin {
	js(IR) {
		browser {
			testTask {
				useKarma {
					useChromiumHeadless()
				}
			}
		}
		binaries.executable()
	}
	sourceSets.jsMain.dependencies {
		implementation(libs.kotlinx.serialization.json)
		implementation(libs.kotlinx.coroutines.core)
		implementation(npm("maplibre-gl", "5.6.2"))
		implementation(devNpm("css-loader", "7.1.2"))
		implementation(devNpm("style-loader", "4.0.0"))
	}
}
