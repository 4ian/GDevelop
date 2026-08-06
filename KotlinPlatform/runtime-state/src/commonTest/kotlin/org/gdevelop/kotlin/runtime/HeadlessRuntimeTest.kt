package org.gdevelop.kotlin.runtime

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.extensions.ExtensionContext
import org.gdevelop.kotlin.extensions.ExtensionDescriptor
import org.gdevelop.kotlin.extensions.ExtensionIdentity
import org.gdevelop.kotlin.extensions.ExtensionProvider
import org.gdevelop.kotlin.extensions.ExtensionRuntime
import org.gdevelop.kotlin.extensions.ActionDescriptor
import org.gdevelop.kotlin.extensions.ParameterDescriptor
import org.gdevelop.kotlin.ir.ActionIr
import org.gdevelop.kotlin.ir.ConditionIr
import org.gdevelop.kotlin.ir.EventIr
import org.gdevelop.kotlin.ir.ProgramIr
import org.gdevelop.kotlin.ir.SceneIr
import org.gdevelop.kotlin.project.Value

class HeadlessRuntimeTest {
    @Test
    fun invokesStaticallyRegisteredExtensionAndLifecycleInStableOrder() {
        val provider = RecordingExtension
        val program = ProgramIr(
            globals = mapOf("score" to Value.NumberValue(0.0)),
            scenes = listOf(SceneIr("Main", emptyMap(), listOf(EventIr(
                conditions = listOf(ConditionIr.Always),
                actions = listOf(ActionIr.ExtensionCall("Test::Increment", listOf("global", "score", "3"))),
                children = emptyList(),
                origin = SourceLocation("fixture", "/layouts/0/events/0"),
            )))),
            firstScene = "Main",
        )

        val report = HeadlessRuntime(ExtensionCatalog.of(provider)).execute(program, 2)

        assertEquals("6", report.globals["score"])
        assertEquals("Test", report.resolvedExtensions.single().identity.namespace)
        assertEquals(2, report.trace.count { it.kind == "extension-call" })
        assertEquals("loaded", report.trace.first().detail)
        assertEquals("unloaded", report.trace.last { it.kind == "extension-lifecycle" }.detail)
        assertTrue(report.diagnostics.isEmpty())
    }
}

private object RecordingExtension : ExtensionProvider {
    override val descriptor = ExtensionDescriptor(
        ExtensionIdentity("Test", "1", "test"),
        listOf(ActionDescriptor("Test::Increment", listOf(
            ParameterDescriptor("scope", "string"),
            ParameterDescriptor("name", "variable"),
            ParameterDescriptor("amount", "number"),
        ), "increment")),
        listOf("sceneLoaded", "sceneUnloaded"),
    )
    override val runtime = object : ExtensionRuntime {
        override fun invoke(entry: String, arguments: List<String>, context: ExtensionContext): Boolean {
            val next = (context.readNumber(arguments[0], arguments[1]) ?: 0.0) + arguments[2].toDouble()
            context.writeNumber(arguments[0], arguments[1], next)
            return entry == "increment"
        }
        override fun onSceneLoaded(context: ExtensionContext) = context.trace("extension-lifecycle", "loaded")
        override fun onSceneUnloaded(context: ExtensionContext) = context.trace("extension-lifecycle", "unloaded")
    }
}
