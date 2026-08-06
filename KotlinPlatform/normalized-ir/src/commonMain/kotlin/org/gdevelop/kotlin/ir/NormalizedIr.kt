package org.gdevelop.kotlin.ir

import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.project.Value
import org.gdevelop.kotlin.extensions.ExtensionIdentity
import org.gdevelop.kotlin.extensions.RuntimeCapabilityId

data class ProgramIr(
    val globals: Map<String, Value>,
    val scenes: List<SceneIr>,
    val firstScene: String,
)

data class SceneIr(
    val name: String,
    val variables: Map<String, Value>,
    val events: List<EventIr>,
)

data class EventIr(
    val conditions: List<ConditionIr>,
    val actions: List<ActionIr>,
    val children: List<EventIr>,
    val origin: SourceLocation,
)

sealed interface ConditionIr {
    data object Always : ConditionIr
    data class CompareNumber(val scope: String, val variable: String, val operator: String, val value: Double) : ConditionIr
    data class HostOperation(val operation: ExtensionHostOperation) : ConditionIr
}

sealed interface ActionIr {
    data class SetNumber(val scope: String, val variable: String, val value: Double) : ActionIr
    data class AddNumber(val scope: String, val variable: String, val value: Double) : ActionIr
    data class ExtensionCall(val type: String, val arguments: List<String>) : ActionIr
    data class HostOperation(val operation: ExtensionHostOperation) : ActionIr
}

/** Fully resolved operation metadata; execution never dispatches on a user-facing label. */
data class ExtensionHostOperation(
    val descriptorType: String,
    val runtimeEntry: String,
    val extensionIdentity: ExtensionIdentity,
    val arguments: List<String>,
    val parameterOrder: List<String>,
    val requiredCapabilities: Set<RuntimeCapabilityId>,
    val origin: SourceLocation,
)
