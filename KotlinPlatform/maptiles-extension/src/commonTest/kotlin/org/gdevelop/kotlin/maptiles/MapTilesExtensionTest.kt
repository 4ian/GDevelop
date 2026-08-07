package org.gdevelop.kotlin.maptiles

import org.gdevelop.kotlin.extensions.ExtensionCatalog
import org.gdevelop.kotlin.extensions.RuntimeCapabilities
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertSame

class MapTilesExtensionTest {
	@Test
	fun catalogPreservesStableExtensionIdentityAndRuntimeEntries() {
		val catalog = ExtensionCatalog.of(MapTilesExtension)
		val action = catalog.resolveAction("MapTiles::SetCamera")!!
		val condition = catalog.resolveCondition("MapTiles::MapClicked")!!
		assertEquals(MapTilesExtension.descriptor.identity, action.identity)
		assertEquals(MapTilesExtension.descriptor.identity, condition.identity)
		assertEquals(MapTilesEntries.SET_CAMERA, action.descriptor.runtimeEntry)
		assertEquals(setOf(RuntimeCapabilities.BrowserMapRenderingHost), action.descriptor.requiredCapabilities)
		assertSame(MapTilesExtension.runtime, action.runtime)
	}

	@Test
	fun descriptorParameterOrderIsPartOfTheContract() {
		val parameters = MapTilesExtension.descriptor.actions.single { it.type == "MapTiles::Project" }.parameters
		assertEquals(listOf("longitude", "latitude", "xVariable", "yVariable"), parameters.map { it.name })
		assertEquals(listOf("number", "number", "variable", "variable"), parameters.map { it.type })
	}
}
