plugins {
	kotlin("multiplatform")
}

kotlin {
	jvmToolchain(21)
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
	sourceSets.commonTest.dependencies { implementation(kotlin("test")) }
}
