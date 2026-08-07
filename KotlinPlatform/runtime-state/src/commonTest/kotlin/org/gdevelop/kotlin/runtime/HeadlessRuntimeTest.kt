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

private class SyntheticHost : OrderedRuntimeHost() {
    override val capabilities = setOf(HostCapability(org.gdevelop.kotlin.extensions.RuntimeCapabilityId("fixture.synthetic.v1"), 1))
    val inputs = mutableListOf<String?>(); val completions = mutableListOf<(HostOperationResult) -> Unit>(); var initialized = false; var disposed = false
    override fun onInitialize() { initialized = true }
    override fun onBeginFrame(frame: Int, input: HostTransientInput) { inputs += input.values["pulse"] }
    override fun evaluate(invocation: HostInvocation) = HostOperationResult.Success("true")
    override fun invoke(invocation: HostInvocation) = HostOperationResult.Failure("SYNC", "not used")
    override fun invoke(invocation: HostInvocation, completion: (HostOperationResult) -> Unit) { completions += completion }
    override fun onDispose() { disposed = true }
}

class RuntimeHostContractTest {
    @Test fun syntheticCapabilityHasStableIdentityAndOrderedCompletions() {
        val capability = org.gdevelop.kotlin.extensions.RuntimeCapabilityId("fixture.synthetic.v1")
        val location = SourceLocation("synthetic.json", "/events/0")
        fun operation(argument: String) = org.gdevelop.kotlin.ir.ExtensionHostOperation("Synthetic::Record", "record", ExtensionIdentity("Synthetic", "1", "fixture"), listOf(argument), listOf("value"), setOf(capability), location)
        val host = SyntheticHost(); host.initialize(); host.beginFrame(0, HostTransientInput(mapOf("pulse" to "down")))
        assertEquals(HostOperationResult.Success("true"), host.evaluateCondition(HostInvocation(HostInvocationId("frame:0:operation:0"), operation("condition"))))
        host.invokeAction(HostInvocation(HostInvocationId("frame:0:operation:1"), operation("first")))
        host.invokeAction(HostInvocation(HostInvocationId("frame:0:operation:2"), operation("second")))
        val completed = mutableListOf<HostCompletion>()
        host.completions[1](HostOperationResult.Success("second")); host.deliverCompletions(completed::add)
        assertTrue(completed.isEmpty())
        host.completions[0](HostOperationResult.Success("first")); host.deliverCompletions(completed::add); host.dispose()
        assertEquals(listOf("frame:0:operation:1", "frame:0:operation:2"), completed.map { it.invocation.id.value })
        assertEquals(listOf<String?>("down"), host.inputs); assertTrue(host.initialized); assertTrue(host.disposed)
        assertEquals(listOf(0L, 1L, 2L, 3L, 4L), host.trace.map { it.sequence })
    }
}
