plugins { kotlin("multiplatform") }

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
	sourceSets.commonMain.dependencies { api(project(":extension-catalog")) }
}
