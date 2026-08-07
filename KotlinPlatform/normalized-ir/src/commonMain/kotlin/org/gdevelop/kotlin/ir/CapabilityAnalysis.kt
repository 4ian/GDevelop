package org.gdevelop.kotlin.ir

import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.diagnostics.Severity
import org.gdevelop.kotlin.extensions.*

data class CapabilityAnalysis(val requirements: List<CapabilityRequirement>, val resolved: List<ResolvedCapability>, val diagnostics: List<Diagnostic>)

/** Collects host operations only from scenes reachable through statically named scene transitions. */
object CapabilityAnalyzer {
    fun analyze(program: ProgramIr, manifest: CapabilityManifest): CapabilityAnalysis {
        val scenes = program.scenes.associateBy { it.name }
        val reachable = linkedSetOf<String>()
        fun visit(name: String) {
            if (!reachable.add(name)) return
            scenes[name]?.events.orEmpty().flatMap(::events).flatMap { it.actions }
                .filterIsInstance<ActionIr.ReplaceScene>().forEach { visit(it.sceneName) }
        }
        visit(program.firstScene)
        val operations = reachable.mapNotNull(scenes::get).flatMap { it.events }.flatMap(::events).flatMap { event ->
            event.conditions.filterIsInstance<ConditionIr.HostOperation>().map { it.operation } +
                event.actions.filterIsInstance<ActionIr.HostOperation>().map { it.operation }
        }
        val pairs = operations.flatMap { operation -> operation.capabilityRequirements.map { operation to it } }
        val resolved = pairs.map { (operation, requirement) ->
            val provided = manifest.capabilities.firstOrNull { it.id == requirement.id &&
                (it.scopes.isEmpty() || requirement.scope in it.scopes) }
            ResolvedCapability(requirement, provided?.let { manifest.provider }, provided?.contractVersion)
        }
        val diagnostics = pairs.zip(resolved).mapNotNull { (pair, resolution) ->
            val (operation, requirement) = pair
            if (requirement.use == CapabilityUse.OPTIONAL || resolution.contractVersion?.let { it in requirement.supportedVersions } == true) null
            else if (resolution.contractVersion == null) Diagnostic(
                "GDKP_SEM_MISSING_CAPABILITY", Severity.ERROR,
                "Target ${manifest.provider.deterministicId} does not provide ${requirement.id.value} for ${requirement.scope.value}", operation.origin)
            else Diagnostic(
                "GDKP_SEM_INCOMPATIBLE_CAPABILITY", Severity.ERROR,
                "Target provides ${requirement.id.value} contract ${resolution.contractVersion}; supported range is ${requirement.supportedVersions.minimum}..${requirement.supportedVersions.maximum}", operation.origin)
        }
        return CapabilityAnalysis(pairs.map { it.second }.distinct(), resolved.distinct(), diagnostics)
    }

    private fun events(event: EventIr): List<EventIr> = listOf(event) + event.children.flatMap(::events)
}
