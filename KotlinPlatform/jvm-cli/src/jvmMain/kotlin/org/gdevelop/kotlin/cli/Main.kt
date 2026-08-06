package org.gdevelop.kotlin.cli

import java.io.File
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.example.CounterExtension
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.ir.ProjectLowerer
import org.gdevelop.kotlin.project.GDevelopProjectDecoder
import org.gdevelop.kotlin.runtime.HeadlessRuntime

private val outputJson = Json { encodeDefaults = true; explicitNulls = false; prettyPrint = false }

fun main(args: Array<String>) {
    val parsed = CliArguments.parse(args.toList())
    val decoderResult = GDevelopProjectDecoder().decode(parsed.fixture, File(parsed.fixture).readText())
    if (decoderResult.value == null) fail(decoderResult.diagnostics)

    // Static registration is the prototype's generated-registry equivalent.
    val catalog = ExtensionCatalog.of(CounterExtension)
    val lowerResult = ProjectLowerer(catalog).lower(decoderResult.value!!)
    if (lowerResult.value == null) fail(decoderResult.diagnostics + lowerResult.diagnostics)

    println(outputJson.encodeToString(HeadlessRuntime(catalog).execute(lowerResult.value!!, parsed.frames)))
}

private fun fail(diagnostics: List<Diagnostic>): Nothing {
    System.err.println(outputJson.encodeToString(diagnostics))
    throw IllegalArgumentException("Project rejected with structured diagnostics")
}

private data class CliArguments(val fixture: String, val frames: Int) {
    companion object {
        fun parse(args: List<String>): CliArguments {
            require(args.isNotEmpty()) { "Usage: <fixture.json> [--frames <0..10000>]" }
            var frames = 1
            var index = 1
            while (index < args.size) {
                require(args[index] == "--frames" && index + 1 < args.size) { "Unknown argument: ${args[index]}" }
                frames = args[index + 1].toInt()
                index += 2
            }
            require(frames in 0..10_000) { "--frames must be between 0 and 10000" }
            return CliArguments(args[0], frames)
        }
    }
}
