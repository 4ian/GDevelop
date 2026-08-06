pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
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
    ":example-extension",
    ":jvm-cli",
)
