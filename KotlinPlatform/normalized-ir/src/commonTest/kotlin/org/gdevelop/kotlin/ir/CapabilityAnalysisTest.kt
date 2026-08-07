package org.gdevelop.kotlin.ir

import kotlin.test.Test
import kotlin.test.assertEquals
import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.*

class CapabilityAnalysisTest {
    private val id = RuntimeCapabilityId("fixture.rendering")
    private val location = SourceLocation("capability-fixture.json", "/layouts/0/events/0/actions/0")
    private val requirement = CapabilityRequirement(id, CapabilityVersionRange(2, 3), CapabilityUse.REQUIRED,
        CapabilityScope(CapabilityScopeKind.OPERATION, "Fixture::Render"))
    private val operation = ExtensionHostOperation(
        QualifiedMemberId(ExtensionIdentity("Fixture", "1", "test"), listOf("Fixture", "Render")),
        "Fixture::Render", "render", emptyList(), emptyList(), setOf(id), ContractVersions(), location, setOf(requirement))
    private val program = ProgramIr(emptyMap(), listOf(SceneIr("Main", emptyMap(), listOf(
        EventIr(emptyList(), listOf(ActionIr.HostOperation(operation)), emptyList(), location)))), "Main")
    private val provider = CapabilityProviderIdentity("fixture", "fake", "1")

    @Test fun reportsMissingCapabilityAtOperationSource() {
        val result = CapabilityAnalyzer.analyze(program, CapabilityManifest(provider, emptySet()))
        assertEquals("GDKP_SEM_MISSING_CAPABILITY", result.diagnostics.single().code)
        assertEquals(location, result.diagnostics.single().location)
    }

    @Test fun rejectsIncompatibleContractAndRecordsProviderVersion() {
        val result = CapabilityAnalyzer.analyze(program, CapabilityManifest(provider, setOf(ProvidedCapability(id, 1))))
        assertEquals("GDKP_SEM_INCOMPATIBLE_CAPABILITY", result.diagnostics.single().code)
        assertEquals(1, result.resolved.single().contractVersion)
    }

    @Test fun negotiatesSupportedContractDeterministically() {
        val result = CapabilityAnalyzer.analyze(program, CapabilityManifest(provider, setOf(ProvidedCapability(id, 3))))
        assertEquals(emptyList(), result.diagnostics)
        assertEquals(provider, result.resolved.single().provider)
        assertEquals(3, result.resolved.single().contractVersion)
    }
}
