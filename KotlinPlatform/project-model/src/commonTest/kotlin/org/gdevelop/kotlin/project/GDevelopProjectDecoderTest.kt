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
