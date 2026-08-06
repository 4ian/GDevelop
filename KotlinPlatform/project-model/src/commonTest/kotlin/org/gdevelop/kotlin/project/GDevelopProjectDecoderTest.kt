package org.gdevelop.kotlin.project

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class GDevelopProjectDecoderTest {
    @Test
    fun rejectsUnsupportedObjectsWithSourceLocation() {
        val result = GDevelopProjectDecoder().decode("fixture.json", """
            {"gdVersion":"5","firstLayout":"Main","variables":[],
             "objects":[{"name":"Player"}],
             "layouts":[{"name":"Main","objects":[],"instances":[],"variables":[],"events":[]}]}
        """.trimIndent())

        assertNull(result.value)
        assertEquals("GDKP_UNSUPPORTED_CONSTRUCT", result.diagnostics.single().code)
        assertEquals("/objects", result.diagnostics.single().location.jsonPointer)
    }
}

class MapTilesProjectDecoderTest {
    @Test
    fun cameraDocumentPreservesActionIdentityParameterOrderAndOrigin() {
        val source = """{
          "gdVersion":"5", "firstLayout":"Map", "variables":[],
          "layouts":[{"name":"Map", "variables":[], "events":[{
            "type":"BuiltinCommonInstructions::Standard", "conditions":[],
            "actions":[{"type":{"value":"MapTiles::SetCamera"},"parameters":["12.5","48.25","9","400"]}],
            "events":[]
          }]}]
        }"""
        val result = GDevelopProjectDecoder().decode("camera-fixture.json", source)
        val action = result.value!!.scenes.single().events.single().actions.single()
        assertEquals("MapTiles::SetCamera", action.type)
        assertEquals(listOf("12.5", "48.25", "9", "400"), action.parameters)
        assertEquals("camera-fixture.json", action.location.sourceId)
        assertEquals("/layouts/0/events/0/actions/0", action.location.jsonPointer)
    }
}
