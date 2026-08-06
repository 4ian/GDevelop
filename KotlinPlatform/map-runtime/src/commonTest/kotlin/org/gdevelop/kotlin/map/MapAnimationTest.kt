package org.gdevelop.kotlin.map

import kotlin.test.Test
import kotlin.test.assertEquals

class MapAnimationTest {
    @Test
    fun seededGameClockProducesPortableCoordinatesAndCompletion() {
        var gameTime = 100L
        val trace = mutableListOf<MapAnimationTraceRecord>()
        val runtime = MapOverlayAnimationRuntime(MapRuntimeClock { gameTime }, trace::add)
        val id = MapOverlayId("player")

        runtime.start(id, GeoCoordinate(10.0, 20.0), GeoCoordinate(20.0, 40.0), 1000, MapAnimationEasing.LINEAR)
        gameTime = 600
        assertEquals(GeoCoordinate(15.0, 30.0), runtime.advance(id)?.coordinate)
        gameTime = 1100
        assertEquals(MapOverlayAnimationStatus.COMPLETED, runtime.advance(id)?.status)
        assertEquals(GeoCoordinate(20.0, 40.0), runtime.state(id)?.coordinate)
        assertEquals(1, trace.filterIsInstance<MapAnimationTraceRecord.Completed>().size)
    }

    @Test
    fun replacementCancelsExistingOverlayAnimation() {
        val trace = mutableListOf<MapAnimationTraceRecord>()
        val runtime = MapOverlayAnimationRuntime(MapRuntimeClock { 0 }, trace::add)
        val id = MapOverlayId("player")
        runtime.start(id, GeoCoordinate(0.0, 0.0), GeoCoordinate(1.0, 1.0), 100)
        runtime.start(id, GeoCoordinate(2.0, 2.0), GeoCoordinate(3.0, 3.0), 100)

        assertEquals(1, trace.filterIsInstance<MapAnimationTraceRecord.Cancelled>().size)
        assertEquals(GeoCoordinate(2.0, 2.0), runtime.state(id)?.coordinate)
    }
}
