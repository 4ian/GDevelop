plugins {
    kotlin("multiplatform") version "2.2.21" apply false
    kotlin("plugin.serialization") version "2.2.21" apply false
}

allprojects {
    group = "org.gdevelop.kotlinprototype"
    version = "0.1.0-SNAPSHOT"
}

// The root Kotlin plugin declares this task, but IDE importers request it on each module.
// Keep matching no-op synchronization targets until those importers stop using the legacy API.
subprojects {
    tasks.register("prepareKotlinBuildScriptModel") {
        group = "ide"
        description = "Compatibility target used by IDE Kotlin build-script model importers."
    }
}
