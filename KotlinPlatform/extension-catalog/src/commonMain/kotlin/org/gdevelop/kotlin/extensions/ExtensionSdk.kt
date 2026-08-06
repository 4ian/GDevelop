package org.gdevelop.kotlin.extensions

import kotlinx.serialization.Serializable
import kotlin.jvm.JvmInline

@Serializable
data class ExtensionIdentity(val namespace: String, val version: String, val origin: String)

@Serializable
data class ParameterDescriptor(val name: String, val type: String)

/** A stable identifier for a facility that must be supplied by a runtime host. */
@Serializable
@JvmInline
value class RuntimeCapabilityId(val value: String)

object RuntimeCapabilities {
    val BrowserMapRenderingHost = RuntimeCapabilityId("org.gdevelop.runtime.browser-map-rendering-host.v1")
}

@Serializable
data class ActionDescriptor(
    val type: String,
    val parameters: List<ParameterDescriptor>,
    val runtimeEntry: String,
    val requiredCapabilities: Set<RuntimeCapabilityId> = emptySet(),
)

@Serializable
data class ConditionDescriptor(
    val type: String,
    val parameters: List<ParameterDescriptor>,
    val runtimeEntry: String,
    val requiredCapabilities: Set<RuntimeCapabilityId> = emptySet(),
)

@Serializable
data class ExtensionDescriptor(
    val identity: ExtensionIdentity,
    val actions: List<ActionDescriptor>,
    val lifecycleHooks: List<String>,
    val conditions: List<ConditionDescriptor> = emptyList(),
)

/** The deliberately small, reflection-free SDK surface used by the prototype. */
interface ExtensionProvider {
    val descriptor: ExtensionDescriptor
    val runtime: ExtensionRuntime
}

interface ExtensionRuntime {
    fun invoke(entry: String, arguments: List<String>, context: ExtensionContext): Boolean
    fun onSceneLoaded(context: ExtensionContext) = Unit
    fun onSceneUnloaded(context: ExtensionContext) = Unit
}

interface ExtensionContext {
    fun readNumber(scope: String, name: String): Double?
    fun writeNumber(scope: String, name: String, value: Double)
    fun trace(kind: String, detail: String)
}

class ExtensionCatalog private constructor(
    val descriptors: List<ExtensionDescriptor>,
    private val actions: Map<String, RegisteredAction>,
    private val conditions: Map<String, RegisteredCondition>,
    private val providers: List<ExtensionProvider>,
) {
    fun resolveAction(type: String): RegisteredAction? = actions[type]
    fun resolveCondition(type: String): RegisteredCondition? = conditions[type]
    fun lifecycleProviders(): List<ExtensionProvider> = providers

    companion object {
        fun of(vararg providers: ExtensionProvider): ExtensionCatalog {
            val sorted = providers.sortedWith(compareBy({ it.descriptor.identity.namespace }, { it.descriptor.identity.version }))
            val registrations = sorted.flatMap { provider ->
                provider.descriptor.actions.map { it.type to RegisteredAction(provider.descriptor.identity, it, provider.runtime) }
            }
            val conditionRegistrations = sorted.flatMap { provider ->
                provider.descriptor.conditions.map { it.type to RegisteredCondition(provider.descriptor.identity, it, provider.runtime) }
            }
            require(registrations.map { it.first }.distinct().size == registrations.size) { "Duplicate extension action type" }
            require(conditionRegistrations.map { it.first }.distinct().size == conditionRegistrations.size) { "Duplicate extension condition type" }
            return ExtensionCatalog(sorted.map { it.descriptor }, registrations.toMap(), conditionRegistrations.toMap(), sorted)
        }
    }
}

data class RegisteredAction(val identity: ExtensionIdentity, val descriptor: ActionDescriptor, val runtime: ExtensionRuntime)
data class RegisteredCondition(val identity: ExtensionIdentity, val descriptor: ConditionDescriptor, val runtime: ExtensionRuntime)
