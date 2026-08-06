package org.gdevelop.kotlin.ir

import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.extensions.RuntimeCapabilities
import org.gdevelop.kotlin.maptiles.MapTilesEntries
import org.gdevelop.kotlin.maptiles.MapTilesExtension
import org.gdevelop.kotlin.project.EventDeclaration
import org.gdevelop.kotlin.project.OperationDeclaration
import org.gdevelop.kotlin.project.ProjectDocument
import org.gdevelop.kotlin.project.SceneDeclaration
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class MapTilesLoweringTest {
    private val origin = SourceLocation("fixture", "/layouts/0/events/0")
    private fun lower(action: OperationDeclaration) = ProjectLowerer(ExtensionCatalog.of(MapTilesExtension)).lower(
        ProjectDocument("5", "Map", emptyList(), listOf(SceneDeclaration("Map", emptyList(), listOf(EventDeclaration(emptyList(), listOf(action), emptyList(), origin)))))
    )

    @Test fun cameraActionLowersToResolvedHostOperation() {
        val result = lower(OperationDeclaration("MapTiles::SetCamera", listOf("12.5", "48.25", "9", "400"), origin))
        val operation = ((result.value!!.scenes.single().events.single().actions.single()) as ActionIr.HostOperation).operation
        assertEquals(MapTilesEntries.SET_CAMERA, operation.runtimeEntry)
        assertEquals(MapTilesExtension.descriptor.identity, operation.extensionIdentity)
        assertEquals(listOf("longitude", "latitude", "zoom", "durationMs"), operation.parameterOrder)
        assertEquals(setOf(RuntimeCapabilities.BrowserMapRenderingHost), operation.requiredCapabilities)
    }

    @Test fun malformedCoordinateAndUnknownActionHaveLocatedDiagnostics() {
        val malformed = lower(OperationDeclaration("MapTiles::Project", listOf("east", "91", "x", "y"), origin))
        assertNull(malformed.value)
        assertEquals("GDKP_SEM_PARAMETER_TYPE", malformed.diagnostics.single().code)
        assertEquals(origin, malformed.diagnostics.single().location)

        val unknown = lower(OperationDeclaration("MapTiles::Teleport", listOf("0", "0"), origin))
        assertNull(unknown.value)
        assertEquals("GDKP_UNSUPPORTED_OPERATION", unknown.diagnostics.single().code)
        assertTrue(unknown.diagnostics.single().message.contains("MapTiles::Teleport"))
    }

    @Test fun parameterCountIsValidatedBeforeHostDispatch() {
        val result = lower(OperationDeclaration("MapTiles::SetCamera", listOf("0", "0", "1"), origin))
        assertNull(result.value)
        assertEquals("GDKP_SEM_PARAMETER_COUNT", result.diagnostics.single().code)
    }

    @Test fun latitudeOutsideMapBoundsIsRejectedDuringLowering() {
        val result = lower(OperationDeclaration("MapTiles::Project", listOf("0", "90.0001", "x", "y"), origin))
        assertNull(result.value)
        assertEquals("GDKP_SEM_COORDINATE_RANGE", result.diagnostics.single().code)
    }
}
