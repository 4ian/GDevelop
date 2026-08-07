package org.gdevelop.kotlin.ir

import org.gdevelop.kotlin.diagnostics.SourceLocation
import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.project.EventDeclaration
import org.gdevelop.kotlin.project.OperationDeclaration
import org.gdevelop.kotlin.project.ProjectDocument
import org.gdevelop.kotlin.project.SceneDeclaration
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class ProjectLowererTest {
	@Test
	fun rejectsUnknownActionInsteadOfLoweringItAsNoOp() {
		val location = SourceLocation("fixture.json", "/layouts/0/events/0/actions/0")
		val project = ProjectDocument(
			formatVersion = "5",
			firstScene = "Main",
			globalVariables = emptyList(),
			scenes = listOf(
				SceneDeclaration(
					"Main", emptyList(), listOf(
						EventDeclaration(
							emptyList(),
							listOf(OperationDeclaration("Unknown::Action", emptyList(), location)),
							emptyList(),
							location
						),
					)
				)
			),
		)

		val result = ProjectLowerer(ExtensionCatalog.of()).lower(project)

		assertNull(result.value)
		assertEquals("GDKP_UNSUPPORTED_OPERATION", result.diagnostics.single().code)
		assertEquals(location, result.diagnostics.single().location)
	}
}

private object AliasedExtension : org.gdevelop.kotlin.extensions.ExtensionProvider {
	private val identity = org.gdevelop.kotlin.extensions.ExtensionIdentity("Canonical", "1.0.0", "fixture")
	override val descriptor = org.gdevelop.kotlin.extensions.ExtensionDescriptor(
		identity,
		listOf(
			org.gdevelop.kotlin.extensions.ActionDescriptor(
				"Canonical::Move",
				listOf(
					org.gdevelop.kotlin.extensions.ParameterDescriptor(
						"distance",
						org.gdevelop.kotlin.extensions.ValueTypes.Number
					)
				),
				"move"
			)
		),
		emptyList(),
		aliases = listOf(
			org.gdevelop.kotlin.extensions.CompatibilityAlias(
				"Legacy::Move",
				org.gdevelop.kotlin.extensions.QualifiedMemberId(identity, listOf("Canonical", "Move"))
			)
		),
	)
	override val runtime = object : org.gdevelop.kotlin.extensions.ExtensionRuntime {
		override fun invoke(
			entry: String,
			arguments: List<String>,
			context: org.gdevelop.kotlin.extensions.ExtensionContext
		) = true
	}
}

class ExtensionIdentityLoweringTest {
	@kotlin.test.Test
	fun aliasRetainsSerializedSpellingAndLowersTypedArguments() {
		val origin = SourceLocation("fixture", "/events/0/actions/0")
		val project = ProjectDocument(
			"1",
			"Main",
			emptyList(),
			listOf(
				SceneDeclaration(
					"Main",
					emptyList(),
					listOf(
						EventDeclaration(
							emptyList(),
							listOf(OperationDeclaration("Legacy::Move", listOf("01.50"), origin)),
							emptyList(),
							origin
						)
					)
				)
			)
		)
		val result = ProjectLowerer(ExtensionCatalog.of(AliasedExtension)).lower(project)
		val call = result.value!!.scenes.single().events.single().actions.single() as ActionIr.ExtensionCall
		kotlin.test.assertEquals("Legacy::Move", call.serializedType)
		kotlin.test.assertEquals(listOf("Canonical", "Move"), call.memberId.path)
		kotlin.test.assertEquals(
			org.gdevelop.kotlin.extensions.ResolvedArgument.Number("01.50", 1.5),
			call.arguments.single()
		)
	}
}
