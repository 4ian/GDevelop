package org.gdevelop.kotlin.extensions

import kotlinx.serialization.Serializable
import kotlin.jvm.JvmInline

/** Stable, target-neutral identity for a runtime contract. */
@Serializable @JvmInline value class RuntimeCapabilityId(val value: String)

@Serializable data class CapabilityVersionRange(val minimum: Int, val maximum: Int) {
    init { require(minimum > 0 && maximum >= minimum) }
    operator fun contains(version: Int) = version in minimum..maximum
    companion object { fun exact(version: Int) = CapabilityVersionRange(version, version) }
}

@Serializable enum class CapabilityUse { REQUIRED, OPTIONAL }
@Serializable enum class CapabilityScopeKind { OPERATION, EXTENSION }
@Serializable data class CapabilityScope(val kind: CapabilityScopeKind, val value: String)

/** A catalog/NIR declaration of the contract an operation intends to use. */
@Serializable data class CapabilityRequirement(
    val id: RuntimeCapabilityId,
    val supportedVersions: CapabilityVersionRange,
    val use: CapabilityUse = CapabilityUse.REQUIRED,
    val scope: CapabilityScope,
)

/** Provider identity is data, rather than object identity or discovery order. */
@Serializable data class CapabilityProviderIdentity(
    val target: String,
    val adapter: String,
    val implementationVersion: String,
) { val deterministicId: String get() = "$target:$adapter:$implementationVersion" }

@Serializable data class ProvidedCapability(
    val id: RuntimeCapabilityId,
    val contractVersion: Int,
    /** Empty means every scope for this capability. */
    val scopes: Set<CapabilityScope> = emptySet(),
) { init { require(contractVersion > 0) } }

@Serializable data class CapabilityManifest(
    val provider: CapabilityProviderIdentity,
    val capabilities: Set<ProvidedCapability>,
    /** Explicit negative claims make target reports auditable. */
    val unavailableCapabilities: Set<RuntimeCapabilityId> = emptySet(),
)

@Serializable data class ResolvedCapability(
    val requirement: CapabilityRequirement,
    val provider: CapabilityProviderIdentity?,
    val contractVersion: Int?,
)

/** Shared payload embedded by exporters in their artifact manifest/report. */
@Serializable data class ArtifactCapabilityReport(
    val host: CapabilityManifest,
    val resolvedCapabilities: List<ResolvedCapability>,
)

object RuntimeCapabilities {
    val BrowserMapRenderingHost = RuntimeCapabilityId("org.gdevelop.runtime.browser-map-rendering-host")
    val Rendering = RuntimeCapabilityId("org.gdevelop.runtime.rendering")
    val DeterministicHeadlessExecution = RuntimeCapabilityId("org.gdevelop.runtime.deterministic-headless-execution")
}

fun RuntimeCapabilityId.requiredByOperation(operation: String, minimum: Int = 1, maximum: Int = minimum) =
    CapabilityRequirement(this, CapabilityVersionRange(minimum, maximum), CapabilityUse.REQUIRED,
        CapabilityScope(CapabilityScopeKind.OPERATION, operation))
