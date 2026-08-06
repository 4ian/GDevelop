plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
}

kotlin {
    jvmToolchain(libs.versions.toolchain.get().toInt())
    jvm()
    sourceSets.jvmMain.dependencies {
        implementation(project(":project-model"))
        implementation(project(":normalized-ir"))
        implementation(project(":runtime-state"))
        implementation(project(":example-extension"))
//        implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
        implementation(libs.kotlinx.serialization.json)
    }
    sourceSets.jvmTest.dependencies { implementation(kotlin("test")) }
}

tasks.register<JavaExec>("run") {
    group = "application"
    description = "Run the headless fixture CLI (use -Pargs='fixture.json --frames 2')"
    val compilation = kotlin.targets.getByName("jvm").compilations.getByName("main")
    classpath = compilation.output.allOutputs + compilation.runtimeDependencyFiles!!
    mainClass.set("org.gdevelop.kotlin.cli.MainKt")
    workingDir = rootProject.projectDir
    val suppliedArgs = providers.gradleProperty("args").orNull
    if (suppliedArgs != null) args(suppliedArgs.split(Regex("\\s+")))
}
