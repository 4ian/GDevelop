package org.gdevelop.kotlin.maplibre

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import org.gdevelop.kotlin.map.*
import org.w3c.dom.HTMLElement
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

@Serializable
enum class MapLibreDiagnosticCode {
	WEBGL_UNAVAILABLE,
	INVALID_STYLE,
	SOURCE_LOAD_FAILED,
	CAPABILITY_UNAVAILABLE,
	INVALID_LIFECYCLE,
	MAPLIBRE_ERROR,
}

@Serializable
data class MapLibreDiagnostic(
	val code: MapLibreDiagnosticCode,
	val message: String,
	val sourceId: MapSourceId? = null,
)

/** Configuration stays in the JS adapter: neither the DOM container nor style reaches common state. */
data class MapLibreHostOptions(
	val container: HTMLElement,
	val style: JsonElement,
	val initialCamera: MapCameraState? = null,
)

class MapLibreMapHost(
	private val options: MapLibreHostOptions,
	private val animationTraceSink: (MapAnimationTraceRecord) -> Unit = {},
	private val diagnosticSink: (MapLibreDiagnostic) -> Unit = {},
) : MapHost {
	override var lifecycle: MapHostLifecycle = MapHostLifecycle.NEW
		private set

	private var map: MapLibreGl.Map? = null
	private val listeners = mutableListOf<Pair<String, (dynamic) -> Unit>>()
	private var eventSink: ((MapInteractionEvent) -> Unit)? = null
	private var nextCommandSequence = 0L
	private var activeCommandSequence: Long? = null

	override suspend fun initialize(eventSink: (MapInteractionEvent) -> Unit): MapHostResult<Unit> {
		if (lifecycle != MapHostLifecycle.NEW) return lifecycleFailure()
		if (!MapLibreGl.supported()) return failure(MapLibreDiagnosticCode.WEBGL_UNAVAILABLE, "WebGL is unavailable")
		lifecycle = MapHostLifecycle.INITIALIZING
		this.eventSink = eventSink

		return suspendCoroutine { continuation ->
			var completed = false
			val created = try {
				MapLibreGl.Map(mapOptions())
			} catch (error: Throwable) {
				lifecycle = MapHostLifecycle.NEW
				continuation.resume(failure(MapLibreDiagnosticCode.INVALID_STYLE, error.message ?: "Invalid map style"))
				return@suspendCoroutine
			}
			map = created

			listen("load") {
				if (!completed) {
					completed = true
					lifecycle = MapHostLifecycle.READY
					emit(MapInteractionEvent.Loaded(readCamera(created)))
					continuation.resume(MapHostResult.Success(Unit))
				}
			}
			listen("error") { event ->
				val sourceId = event.sourceId as? String
				val message = (event.error?.message as? String) ?: "MapLibre reported an error"
				val code =
					if (sourceId != null) MapLibreDiagnosticCode.SOURCE_LOAD_FAILED else MapLibreDiagnosticCode.INVALID_STYLE
				val diagnostic = MapLibreDiagnostic(code, message, sourceId?.let(::MapSourceId))
				diagnosticSink(diagnostic)
				if (!completed) {
					completed = true
					lifecycle = MapHostLifecycle.NEW
					removeMap()
					continuation.resume(MapHostResult.Failure(code.name, message))
				}
			}
			listen("click") { emitPointer(it, clicked = true) }
			listen("mousemove") { emitPointer(it, clicked = false) }
			listen("movestart") { emit(MapInteractionEvent.CameraMoveStarted(activeCommandSequence)) }
			listen("move") {
				val camera = readCamera(created)
				animationTraceSink(MapAnimationTraceRecord.CameraStateObserved(activeCommandSequence, "move", camera))
				emit(MapInteractionEvent.CameraMoved(camera))
			}
			listen("idle") {
				val camera = readCamera(created)
				val completed = activeCommandSequence
				animationTraceSink(MapAnimationTraceRecord.CameraStateObserved(completed, "idle", camera))
				if (completed != null) animationTraceSink(MapAnimationTraceRecord.Completed("camera", sequence = completed))
				activeCommandSequence = null
				emit(MapInteractionEvent.CameraIdle(camera))
			}
		}
	}

	override suspend fun cameraState() = ready { MapHostResult.Success(readCamera(it)) }

	override suspend fun execute(command: MapCameraCommand) = ready { target ->
		val previous = activeCommandSequence
		if (previous != null) {
			val camera = readCamera(target)
			animationTraceSink(MapAnimationTraceRecord.Cancelled("camera", sequence = previous))
			emit(MapInteractionEvent.CameraAnimationCancelled(previous, camera))
			activeCommandSequence = null
			target.stop()
		}
		val sequence = nextCommandSequence++
		animationTraceSink(MapAnimationTraceRecord.CameraRequested(sequence, command))
		when (command) {
			is MapCameraCommand.Jump -> target.jumpTo(cameraOptions(command.camera))
			is MapCameraCommand.Ease -> {
				activeCommandSequence = sequence; target.easeTo(cameraOptions(command.camera, command.durationMillis))
			}

			is MapCameraCommand.Fly -> {
				activeCommandSequence = sequence; target.flyTo(cameraOptions(command.camera, command.durationMillis))
			}

			is MapCameraCommand.FitBounds -> {
				if (command.durationMillis != 0L) activeCommandSequence = sequence
				target.fitBounds(
					arrayOf(command.bounds.southWest.array(), command.bounds.northEast.array()),
					cameraOptions(command.bearing, command.pitch, command.durationMillis, command.padding),
				)
			}

			MapCameraCommand.StopAnimation -> Unit
		}
		MapHostResult.Success(Unit)
	}

	override suspend fun project(coordinate: GeoCoordinate) = ready { target ->
		val point = target.project(coordinate.array())
		MapHostResult.Success(ScreenCoordinate(point.x, point.y))
	}

	override suspend fun unproject(point: ScreenCoordinate) = ready { target ->
		val coordinate = target.unproject(arrayOf(point.x, point.y))
		MapHostResult.Success(GeoCoordinate(coordinate.lng, coordinate.lat))
	}

	override suspend fun projectToWorld(coordinate: GeoCoordinate): MapHostResult<ProjectedPoint> =
		unavailable("MapLibre's public API does not expose renderer-neutral world projection")

	override suspend fun unprojectFromWorld(point: ProjectedPoint): MapHostResult<GeoCoordinate> =
		unavailable("MapLibre's public API does not expose renderer-neutral world unprojection")

	override suspend fun queryFeatures(query: FeatureQuery) = ready { target ->
		val queryOptions =
			jsObject<QueryOptions> { layers = query.layerIds.map { it.value }.toTypedArray().takeIf { it.isNotEmpty() } }
		val records =
			target.queryRenderedFeatures(arrayOf(query.screen.x, query.screen.y), queryOptions).map(::portableFeature)
		MapHostResult.Success(records)
	}

	fun addGeoJsonSource(id: MapSourceId, geoJson: JsonElement): MapHostResult<Unit> = readySync { target ->
		target.addSource(
			id.value,
			jsObject<GeoJsonSourceOptions> { type = "geojson"; data = JSON.parse(geoJson.toString()) })
		MapHostResult.Success(Unit)
	}

	fun addLayer(id: MapLayerId, sourceId: MapSourceId, type: String): MapHostResult<Unit> = readySync { target ->
		target.addLayer(jsObject<LayerOptions> { this.id = id.value; source = sourceId.value; this.type = type })
		MapHostResult.Success(Unit)
	}

	fun removeSource(id: MapSourceId): MapHostResult<Unit> = readySync { target ->
		target.removeSource(id.value)
		MapHostResult.Success(Unit)
	}

	fun removeLayer(id: MapLayerId): MapHostResult<Unit> = readySync { target ->
		target.removeLayer(id.value)
		MapHostResult.Success(Unit)
	}

	override suspend fun setSourceVisible(sourceId: MapSourceId, visible: Boolean): MapHostResult<Unit> =
		unavailable("MapLibre visibility is a layer property; sources have no visibility property")

	override suspend fun setLayerVisible(layerId: MapLayerId, visible: Boolean) = ready { target ->
		target.setLayoutProperty(layerId.value, "visibility", if (visible) "visible" else "none")
		MapHostResult.Success(Unit)
	}

	fun resize(): MapHostResult<Unit> = readySync { it.resize(); MapHostResult.Success(Unit) }

	override suspend fun dispose(): MapHostResult<Unit> {
		if (lifecycle == MapHostLifecycle.DISPOSED) return MapHostResult.Success(Unit)
		activeCommandSequence?.let { animationTraceSink(MapAnimationTraceRecord.Cancelled("camera", sequence = it)) }
		activeCommandSequence = null
		removeMap()
		lifecycle = MapHostLifecycle.DISPOSED
		return MapHostResult.Success(Unit)
	}

	private fun removeMap() {
		val current = map ?: return
		listeners.forEach { (type, listener) -> current.off(type, listener) }
		listeners.clear()
		eventSink = null
		current.remove()
		map = null
	}

	private fun listen(type: String, listener: (dynamic) -> Unit) {
		listeners += type to listener
		map?.on(type, listener)
	}

	private fun emitPointer(event: dynamic, clicked: Boolean) {
		val screen = ScreenCoordinate(event.point.x as Double, event.point.y as Double)
		val coordinate = GeoCoordinate(event.lngLat.lng as Double, event.lngLat.lat as Double)
		emit(
			if (clicked) MapInteractionEvent.Clicked(screen, coordinate) else MapInteractionEvent.PointerMoved(
				screen,
				coordinate
			)
		)
	}

	private fun emit(event: MapInteractionEvent) {
		if (lifecycle != MapHostLifecycle.DISPOSED) eventSink?.invoke(event)
	}

	private fun mapOptions(): MapOptions = jsObject {
		container = options.container
		style = JSON.parse(options.style.toString())
		options.initialCamera?.let { camera ->
			center = camera.center.array(); zoom = camera.zoom; bearing = camera.bearing; pitch = camera.pitch
		}
	}

	private fun portableFeature(feature: RenderedFeature): MapFeatureRecord = MapFeatureRecord(
		id = feature.id?.toString(),
		sourceId = feature.source?.let(::MapSourceId),
		sourceLayer = feature.sourceLayer,
		layerId = (feature.layer?.id as? String)?.let(::MapLayerId),
		geometry = Json.parseToJsonElement(JSON.stringify(feature.geometry)),
		properties = (Json.parseToJsonElement(JSON.stringify(feature.properties ?: js("({})"))) as JsonObject),
	)

	private fun readCamera(target: MapLibreGl.Map): MapCameraState {
		val center = target.getCenter()
		return MapCameraState(
			GeoCoordinate(center.lng, center.lat),
			target.getZoom(),
			target.getBearing(),
			target.getPitch()
		)
	}

	private fun mapOptionsFailure(code: MapLibreDiagnosticCode, message: String): MapHostResult.Failure {
		diagnosticSink(MapLibreDiagnostic(code, message))
		return MapHostResult.Failure(code.name, message)
	}

	private fun failure(code: MapLibreDiagnosticCode, message: String) = mapOptionsFailure(code, message)
	private fun lifecycleFailure() = mapOptionsFailure(MapLibreDiagnosticCode.INVALID_LIFECYCLE, "Map host is $lifecycle")
	private fun <T> unavailable(message: String): MapHostResult<T> =
		mapOptionsFailure(MapLibreDiagnosticCode.CAPABILITY_UNAVAILABLE, message)

	private suspend fun <T> ready(block: (MapLibreGl.Map) -> MapHostResult<T>): MapHostResult<T> = readySync(block)
	private fun <T> readySync(block: (MapLibreGl.Map) -> MapHostResult<T>): MapHostResult<T> =
		if (lifecycle == MapHostLifecycle.READY && map != null) block(map!!) else lifecycleFailure()
}

private fun GeoCoordinate.array() = arrayOf(longitude, latitude)

private fun cameraOptions(camera: MapCameraState, duration: Long? = null): CameraOptions =
	cameraOptions(camera.bearing, camera.pitch, duration, null).also {
		it.center = camera.center.array(); it.zoom = camera.zoom
	}

private fun cameraOptions(bearing: Double?, pitch: Double?, duration: Long?, padding: Double?): CameraOptions =
	jsObject {
		this.bearing = bearing; this.pitch = pitch; this.duration = duration?.toDouble(); this.padding = padding
	}

private inline fun <T> jsObject(block: T.() -> Unit): T = (js("({})") as T).apply(block)
