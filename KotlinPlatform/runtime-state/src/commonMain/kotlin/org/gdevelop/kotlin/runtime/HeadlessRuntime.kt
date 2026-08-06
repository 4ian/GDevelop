package org.gdevelop.kotlin.runtime

import kotlinx.serialization.Serializable
import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.diagnostics.Severity
import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.extensions.ExtensionContext
import org.gdevelop.kotlin.extensions.ExtensionDescriptor
import org.gdevelop.kotlin.ir.ActionIr
import org.gdevelop.kotlin.ir.ConditionIr
import org.gdevelop.kotlin.ir.EventIr
import org.gdevelop.kotlin.ir.ProgramIr
import org.gdevelop.kotlin.ir.ExtensionHostOperation
import org.gdevelop.kotlin.project.Value

@Serializable
data class TraceRecord(val sequence: Int, val frame: Int, val kind: String, val detail: String)

@Serializable
data class ExecutionReport(
    val schemaVersion: Int = 1,
    val framesExecuted: Int,
    val trace: List<TraceRecord>,
    val globals: Map<String, String>,
    val sceneVariables: Map<String, String>,
    val diagnostics: List<Diagnostic>,
    val resolvedExtensions: List<ExtensionDescriptor>,
)

class HeadlessRuntime(private val catalog: ExtensionCatalog) {
    fun execute(program: ProgramIr, frameLimit: Int): ExecutionReport {
        require(frameLimit in 0..10_000) { "frameLimit must be between 0 and 10000" }
        val scene = program.scenes.first { it.name == program.firstScene }
        val globals = program.globals.toMutableMap()
        val sceneVariables = scene.variables.toMutableMap()
        val trace = mutableListOf<TraceRecord>()
        val diagnostics = mutableListOf<Diagnostic>()
        var currentFrame = -1
        fun emit(kind: String, detail: String) { trace += TraceRecord(trace.size, currentFrame, kind, detail) }
        val context = object : ExtensionContext {
            override fun readNumber(scope: String, name: String): Double? = variableMap(scope, globals, sceneVariables)?.get(name).asNumber()
            override fun writeNumber(scope: String, name: String, value: Double) {
                val variables = variableMap(scope, globals, sceneVariables)
                if (variables == null) {
                    diagnostics += runtimeError("GDKP_RUNTIME_UNKNOWN_SCOPE", "Unknown variable scope: $scope")
                } else variables[name] = Value.NumberValue(value)
            }
            override fun trace(kind: String, detail: String) = emit(kind, detail)
        }

        catalog.lifecycleProviders().forEach { it.runtime.onSceneLoaded(context) }
        emit("lifecycle", "scene-loaded:${scene.name}")
        repeat(frameLimit) { frame ->
            currentFrame = frame
            emit("frame", "start")
            scene.events.forEach { executeEvent(it, globals, sceneVariables, context, diagnostics, ::emit) }
            emit("frame", "end")
        }
        currentFrame = frameLimit
        catalog.lifecycleProviders().asReversed().forEach { it.runtime.onSceneUnloaded(context) }
        emit("lifecycle", "scene-unloaded:${scene.name}")
        return ExecutionReport(
            framesExecuted = frameLimit,
            trace = trace,
            globals = globals.toSortedMap().mapValues { format(it.value) },
            sceneVariables = sceneVariables.toSortedMap().mapValues { format(it.value) },
            diagnostics = diagnostics,
            resolvedExtensions = catalog.descriptors,
        )
    }

    private fun executeEvent(
        event: EventIr,
        globals: MutableMap<String, Value>,
        sceneVariables: MutableMap<String, Value>,
        context: ExtensionContext,
        diagnostics: MutableList<Diagnostic>,
        emit: (String, String) -> Unit,
    ) {
        val passed = event.conditions.all { condition ->
            when (condition) {
                is ConditionIr.HostOperation -> {
                    emit("host-operation", operationTrace(condition.operation))
                    diagnostics += unsupportedCapability(condition.operation)
                    false
                }
                else -> evaluate(condition, globals, sceneVariables)
            }
        }
        emit("event", "${event.origin.jsonPointer}:${if (passed) "passed" else "failed"}")
        if (!passed) return
        event.actions.forEach { action ->
            when (action) {
                is ActionIr.SetNumber -> mutate(action.scope, action.variable, action.value, false, globals, sceneVariables, diagnostics, emit)
                is ActionIr.AddNumber -> mutate(action.scope, action.variable, action.value, true, globals, sceneVariables, diagnostics, emit)
                is ActionIr.ExtensionCall -> {
                    val registered = catalog.resolveAction(action.type)!!
                    if (!registered.runtime.invoke(registered.descriptor.runtimeEntry, action.arguments, context)) {
                        diagnostics += runtimeError("GDKP_RUNTIME_EXTENSION_ENTRY", "Extension rejected entry ${registered.descriptor.runtimeEntry}")
                    }
                    emit("extension-call", action.type)
                }
                is ActionIr.HostOperation -> {
                    emit("host-operation", operationTrace(action.operation))
                    diagnostics += unsupportedCapability(action.operation)
                }
            }
        }
        event.children.forEach { executeEvent(it, globals, sceneVariables, context, diagnostics, emit) }
    }

    private fun evaluate(condition: ConditionIr, globals: Map<String, Value>, sceneVariables: Map<String, Value>): Boolean = when (condition) {
        ConditionIr.Always -> true
        is ConditionIr.CompareNumber -> {
            val actual = variableMap(condition.scope, globals, sceneVariables)?.get(condition.variable).asNumber() ?: return false
            when (condition.operator) {
                "=" -> actual == condition.value
                "!=" -> actual != condition.value
                "<" -> actual < condition.value
                "<=" -> actual <= condition.value
                ">" -> actual > condition.value
                ">=" -> actual >= condition.value
                else -> false
            }
        }
        is ConditionIr.HostOperation -> false
    }

    private fun mutate(scope: String, name: String, operand: Double, add: Boolean, globals: MutableMap<String, Value>, scene: MutableMap<String, Value>, diagnostics: MutableList<Diagnostic>, emit: (String, String) -> Unit) {
        val variables = variableMap(scope, globals, scene)
        if (variables == null) {
            diagnostics += runtimeError("GDKP_RUNTIME_UNKNOWN_SCOPE", "Unknown variable scope: $scope")
            return
        }
        val value = if (add) (variables[name].asNumber() ?: 0.0) + operand else operand
        variables[name] = Value.NumberValue(value)
        emit("variable-write", "$scope:$name=${format(Value.NumberValue(value))}")
    }

    private fun <T : Map<String, Value>> variableMap(scope: String, globals: T, scene: T): T? = when (scope) {
        "global" -> globals
        "scene" -> scene
        else -> null
    }

    private fun Value?.asNumber(): Double? = (this as? Value.NumberValue)?.value
    private fun format(value: Value): String = when (value) {
        is Value.NumberValue -> if (value.value % 1.0 == 0.0) value.value.toLong().toString() else value.value.toString()
        is Value.StringValue -> value.value
        is Value.BooleanValue -> value.value.toString()
    }
    private fun runtimeError(code: String, message: String) = Diagnostic(code, Severity.ERROR, message, SourceLocation("runtime", ""))

    private fun operationTrace(operation: ExtensionHostOperation): String = buildString {
        append("extension=").append(operation.extensionIdentity.namespace).append('@').append(operation.extensionIdentity.version)
        append(";origin=").append(operation.extensionIdentity.origin)
        append(";type=").append(operation.descriptorType)
        append(";entry=").append(operation.runtimeEntry)
        append(";parameters=").append(operation.parameterOrder.zip(operation.arguments).joinToString(",") { "${it.first}=${it.second}" })
        append(";source=").append(operation.origin.sourceId).append(':').append(operation.origin.jsonPointer)
        append(";capabilities=").append(operation.requiredCapabilities.map { it.value }.sorted().joinToString(","))
    }

    private fun unsupportedCapability(operation: ExtensionHostOperation) = Diagnostic(
        "GDKP_RUNTIME_UNSUPPORTED_CAPABILITY", Severity.ERROR,
        "No host installed for ${operation.requiredCapabilities.map { it.value }.sorted().joinToString()}", operation.origin,
    )
}
