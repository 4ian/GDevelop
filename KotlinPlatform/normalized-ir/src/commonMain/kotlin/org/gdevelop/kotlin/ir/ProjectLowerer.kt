package org.gdevelop.kotlin.ir

import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.diagnostics.ResultWithDiagnostics
import org.gdevelop.kotlin.diagnostics.Severity
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.extensions.ParameterDescriptor
import org.gdevelop.kotlin.project.EventDeclaration
import org.gdevelop.kotlin.project.OperationDeclaration
import org.gdevelop.kotlin.project.ProjectDocument

/** Semantic analysis and lowering consume the source model, never source JSON. */
class ProjectLowerer(private val catalog: ExtensionCatalog) {
    fun lower(project: ProjectDocument): ResultWithDiagnostics<ProgramIr> {
        val diagnostics = mutableListOf<Diagnostic>()
        val scenes = project.scenes.map { scene ->
            SceneIr(scene.name, scene.variables.associate { it.name to it.value }, scene.events.map { lowerEvent(it, diagnostics) })
        }
        if (scenes.none { it.name == project.firstScene }) {
            diagnostics += Diagnostic(
                "GDKP_SEM_UNKNOWN_FIRST_SCENE", Severity.ERROR,
                "Unknown first scene: ${project.firstScene}",
                org.gdevelop.kotlin.diagnostics.SourceLocation("project", "/firstLayout"),
            )
        }
        val ir = ProgramIr(project.globalVariables.associate { it.name to it.value }, scenes, project.firstScene)
        return ResultWithDiagnostics(if (diagnostics.any { it.severity == Severity.ERROR }) null else ir, diagnostics)
    }

    private fun lowerEvent(event: EventDeclaration, diagnostics: MutableList<Diagnostic>): EventIr = EventIr(
        event.conditions.mapNotNull { lowerCondition(it, diagnostics) },
        event.actions.mapNotNull { lowerAction(it, diagnostics) },
        event.children.map { lowerEvent(it, diagnostics) },
        event.location,
    )

    private fun lowerCondition(operation: OperationDeclaration, diagnostics: MutableList<Diagnostic>): ConditionIr? = when (operation.type) {
        "BuiltinCommonInstructions::Always" -> ConditionIr.Always
        "BuiltinCommonInstructions::CompareNumberVariable" -> {
            if (operation.parameters.size != 4) invalidParameters(operation, diagnostics, 4)
            else if (operation.parameters[2] !in setOf("=", "!=", "<", "<=", ">", ">=")) {
                diagnostics += Diagnostic(
                    "GDKP_SEM_INVALID_OPERATOR", Severity.ERROR,
                    "Unsupported numeric comparison operator: ${operation.parameters[2]}", operation.location,
                )
                null
            }
            else operation.parameters[3].toDoubleOrNull()?.let {
                ConditionIr.CompareNumber(operation.parameters[0], operation.parameters[1], operation.parameters[2], it)
            } ?: invalidNumber(operation, diagnostics, 3)
        }
        else -> {
            val condition = catalog.resolveCondition(operation.type)
            if (condition == null) unsupported(operation, diagnostics, "condition")
            else if (!validateParameters(operation, condition.descriptor.parameters, diagnostics)) null
            else ConditionIr.HostOperation(ExtensionHostOperation(
                condition.descriptor.type, condition.descriptor.runtimeEntry, condition.identity,
                operation.parameters, condition.descriptor.parameters.map { it.name },
                condition.descriptor.requiredCapabilities, operation.location,
            ))
        }
    }

    private fun lowerAction(operation: OperationDeclaration, diagnostics: MutableList<Diagnostic>): ActionIr? = when (operation.type) {
        "BuiltinCommonInstructions::SetNumberVariable", "BuiltinCommonInstructions::AddNumberVariable" -> {
            if (operation.parameters.size != 3) invalidParameters(operation, diagnostics, 3)
            else operation.parameters[2].toDoubleOrNull()?.let {
                if (operation.type.endsWith("SetNumberVariable")) ActionIr.SetNumber(operation.parameters[0], operation.parameters[1], it)
                else ActionIr.AddNumber(operation.parameters[0], operation.parameters[1], it)
            } ?: invalidNumber(operation, diagnostics, 2)
        }
        else -> {
            val action = catalog.resolveAction(operation.type)
            if (action == null) unsupported(operation, diagnostics, "action")
            else if (!validateParameters(operation, action.descriptor.parameters, diagnostics)) null
            else if (action.descriptor.requiredCapabilities.isNotEmpty()) ActionIr.HostOperation(ExtensionHostOperation(
                action.descriptor.type, action.descriptor.runtimeEntry, action.identity, operation.parameters,
                action.descriptor.parameters.map { it.name }, action.descriptor.requiredCapabilities, operation.location,
            )) else ActionIr.ExtensionCall(operation.type, operation.parameters)
        }
    }

    private fun validateParameters(
        operation: OperationDeclaration,
        descriptors: List<ParameterDescriptor>,
        diagnostics: MutableList<Diagnostic>,
    ): Boolean {
        if (operation.parameters.size != descriptors.size) {
            invalidParameters(operation, diagnostics, descriptors.size)
            return false
        }
        operation.parameters.zip(descriptors).forEachIndexed { index, (value, descriptor) ->
            val valid = when (descriptor.type) {
                "number" -> value.toDoubleOrNull() != null
                "boolean" -> value == "true" || value == "false"
                "variable", "string", "layer", "identifier" -> value.isNotBlank()
                else -> false
            }
            if (!valid) {
                diagnostics += Diagnostic(
                    "GDKP_SEM_PARAMETER_TYPE", Severity.ERROR,
                    "Parameter $index (${descriptor.name}) must be ${descriptor.type}", operation.location,
                )
                return false
            }
        }
        return true
    }

    private fun unsupported(operation: OperationDeclaration, diagnostics: MutableList<Diagnostic>, kind: String): Nothing? {
        diagnostics += Diagnostic("GDKP_UNSUPPORTED_OPERATION", Severity.ERROR, "Unsupported $kind: ${operation.type}", operation.location)
        return null
    }

    private fun invalidParameters(operation: OperationDeclaration, diagnostics: MutableList<Diagnostic>, expected: Int): Nothing? {
        diagnostics += Diagnostic("GDKP_SEM_PARAMETER_COUNT", Severity.ERROR, "${operation.type} expects $expected parameters", operation.location)
        return null
    }

    private fun invalidNumber(operation: OperationDeclaration, diagnostics: MutableList<Diagnostic>, index: Int): Nothing? {
        diagnostics += Diagnostic("GDKP_SEM_INVALID_NUMBER", Severity.ERROR, "Parameter $index must be a number", operation.location)
        return null
    }
}
