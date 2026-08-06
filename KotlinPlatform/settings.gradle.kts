pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    // Kotlin/JS registers the Node distribution repository when configuring browser targets.
    repositoriesMode.set(RepositoriesMode.PREFER_PROJECT)
    repositories { mavenCentral() }
}

rootProject.name = "gdevelop-kotlin-prototype"

include(
    ":diagnostics",
    ":project-model",
    ":extension-catalog",
    ":normalized-ir",
    ":runtime-state",
    ":map-runtime",
    ":maptiles-extension",
    ":maplibre-js-host",
    ":maptiles-demo",
    ":example-extension",
    ":jvm-cli",
)
