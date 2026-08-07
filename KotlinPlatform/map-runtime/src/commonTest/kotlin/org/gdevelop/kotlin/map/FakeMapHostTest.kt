package org.gdevelop.kotlin.map

import kotlinx.serialization.json.JsonObject
import kotlin.coroutines.Continuation
import kotlin.coroutines.EmptyCoroutineContext
import kotlin.coroutines.startCoroutine
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertIs

/** Deterministic common-test host. Browser adapter behavior is tested in maplibre-js-host. */
private class FakeMapHost : MapHost {
	override var lifecycle = MapHostLifecycle.NEW
	private var sink: ((MapInteractionEvent) -> Unit)? = null
	val commands = mutableListOf<MapCameraCommand>()
	var camera = MapCameraState(GeoCoordinate(0.0, 0.0), 1.0)

	override suspend fun initialize(eventSink: (MapInteractionEvent) -> Unit): MapHostResult<Unit> {
		if (lifecycle != MapHostLifecycle.NEW) return MapHostResult.Failure("INVALID_LIFECYCLE", lifecycle.name)
		lifecycle = MapHostLifecycle.READY
		sink = eventSink
		eventSink(MapInteractionEvent.Loaded(camera))
		return MapHostResult.Success(Unit)
	}

	fun click(screen: ScreenCoordinate, coordinate: GeoCoordinate) =
		sink?.invoke(MapInteractionEvent.Clicked(screen, coordinate))

	override suspend fun cameraState() = ready(camera)
	override suspend fun execute(command: MapCameraCommand): MapHostResult<Unit> {
		if (lifecycle != MapHostLifecycle.READY) return failure()
		commands += command
		return MapHostResult.Success(Unit)
	}

	override suspend fun project(coordinate: GeoCoordinate) =
		ready(ScreenCoordinate(coordinate.longitude * 100 + 20, coordinate.latitude * 100 + 10))

	override suspend fun unproject(point: ScreenCoordinate) =
		ready(GeoCoordinate((point.x - 20) / 100, (point.y - 10) / 100))

	override suspend fun projectToWorld(coordinate: GeoCoordinate) =
		ready(ProjectedPoint(coordinate.longitude / 360 + .5, .5 - coordinate.latitude / 180))

	override suspend fun unprojectFromWorld(point: ProjectedPoint) =
		ready(GeoCoordinate((point.x - .5) * 360, (.5 - point.y) * 180))

	override suspend fun queryFeatures(query: FeatureQuery) =
		ready(listOf(MapFeatureRecord("fixture", geometry = JsonObject(emptyMap()))))

	override suspend fun setSourceVisible(sourceId: MapSourceId, visible: Boolean) = ready(Unit)
	override suspend fun setLayerVisible(layerId: MapLayerId, visible: Boolean) = ready(Unit)
	override suspend fun dispose(): MapHostResult<Unit> {
		sink = null
		lifecycle = MapHostLifecycle.DISPOSED
		return MapHostResult.Success(Unit)
	}

	private fun failure() = MapHostResult.Failure("INVALID_LIFECYCLE", lifecycle.name)
	private fun <T> ready(value: T): MapHostResult<T> =
		if (lifecycle == MapHostLifecycle.READY) MapHostResult.Success(value) else failure()
}

private fun <T> runSuspend(block: suspend () -> T): T {
	var completed: Result<T>? = null
	block.startCoroutine(object : Continuation<T> {
		override val context = EmptyCoroutineContext
		override fun resumeWith(result: Result<T>) {
			completed = result
		}
	})
	return completed!!.getOrThrow()
}

class FakeMapHostTest {
	@Test
	fun projectionIsDeterministicAndRoundTrips() {
		val host = FakeMapHost()
		runSuspend { host.initialize {} }
		val projected =
			assertIs<MapHostResult.Success<ScreenCoordinate>>(runSuspend { host.project(GeoCoordinate(10.0, 20.0)) }).value
		assertEquals(ScreenCoordinate(1020.0, 2010.0), projected)
		assertEquals(
			GeoCoordinate(10.0, 20.0),
			assertIs<MapHostResult.Success<GeoCoordinate>>(runSuspend { host.unproject(projected) }).value
		)
	}

	@Test
	fun clickTracePreservesHostOrderAndDisposeStopsCallbacks() {
		val host = FakeMapHost()
		val trace = mutableListOf<String>()
		runSuspend { host.initialize { trace += it::class.simpleName!! } }
		host.click(ScreenCoordinate(1.0, 2.0), GeoCoordinate(3.0, 4.0))
		runSuspend { host.dispose() }
		host.click(ScreenCoordinate(5.0, 6.0), GeoCoordinate(7.0, 8.0))
		assertEquals(listOf("Loaded", "Clicked"), trace)
		assertEquals(MapHostLifecycle.DISPOSED, host.lifecycle)
		assertIs<MapHostResult.Success<Unit>>(runSuspend { host.dispose() })
		assertIs<MapHostResult.Failure>(runSuspend { host.execute(MapCameraCommand.StopAnimation) })
	}

	@Test
	fun cameraCommandsRetainInvocationOrder() {
		val host = FakeMapHost(); runSuspend { host.initialize {} }
		val jump = MapCameraCommand.Jump(MapCameraState(GeoCoordinate(1.0, 2.0), 3.0))
		val ease = MapCameraCommand.Ease(MapCameraState(GeoCoordinate(4.0, 5.0), 6.0), 250)
		runSuspend { host.execute(jump); host.execute(ease) }
		assertEquals(listOf(jump, ease), host.commands)
		assertEquals(MapCameraCommandPolicy.REPLACE_ACTIVE, host.cameraCommandPolicy)
	}

	@Test
	fun geographicBoundariesAreExplicit() {
		assertEquals(-180.0, GeoCoordinate(-180.0, -90.0).longitude)
		assertEquals(90.0, GeoCoordinate(180.0, 90.0).latitude)
		assertFailsWith<IllegalArgumentException> { GeoCoordinate(0.0, 90.0001) }
		assertFailsWith<IllegalArgumentException> { GeoCoordinate(Double.NaN, 0.0) }
	}
}
