package org.gdevelop.kotlin.ir

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.project.EventDeclaration
import org.gdevelop.kotlin.project.OperationDeclaration
import org.gdevelop.kotlin.project.ProjectDocument
import org.gdevelop.kotlin.project.SceneDeclaration

class ProjectLowererTest {
    @Test
    fun rejectsUnknownActionInsteadOfLoweringItAsNoOp() {
        val location = SourceLocation("fixture.json", "/layouts/0/events/0/actions/0")
        val project = ProjectDocument(
            formatVersion = "5",
            firstScene = "Main",
            globalVariables = emptyList(),
            scenes = listOf(SceneDeclaration("Main", emptyList(), listOf(
                EventDeclaration(emptyList(), listOf(OperationDeclaration("Unknown::Action", emptyList(), location)), emptyList(), location),
            ))),
        )

        val result = ProjectLowerer(ExtensionCatalog.of()).lower(project)

        assertNull(result.value)
        assertEquals("GDKP_UNSUPPORTED_OPERATION", result.diagnostics.single().code)
        assertEquals(location, result.diagnostics.single().location)
    }
}
