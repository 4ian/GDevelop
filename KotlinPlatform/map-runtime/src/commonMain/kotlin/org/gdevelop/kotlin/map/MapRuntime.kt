package org.gdevelop.kotlin.map

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlin.jvm.JvmInline

@Serializable
data class GeoCoordinate(val longitude: Double, val latitude: Double) {
	init {
		require(longitude.isFinite() && longitude in -180.0..180.0) {
			"longitude must be finite and between -180 and 180 degrees"
		}
		require(latitude.isFinite() && latitude in -90.0..90.0) {
			"latitude must be finite and between -90 and 90 degrees"
		}
	}
}

@Serializable
data class ProjectedPoint(val x: Double, val y: Double)

@Serializable
data class ScreenCoordinate(val x: Double, val y: Double)

/** Altitude is retained portably even when a rendering host only supports ground anchors. */
@Serializable
enum class GeoElevationMode { GROUND, ABSOLUTE_METERS }

@Serializable
enum class GeoAnchorVisibility { VISIBLE, HIDDEN }

/** Stable identity for the interpolation used by a portable overlay animation. */
@Serializable
enum class MapAnimationEasing { LINEAR, EASE_IN_QUAD, EASE_OUT_QUAD, EASE_IN_OUT_QUAD }

/**
 * Target-neutral source of truth for an object attached to the map.
 *
 * [coordinate] is never replaced by its projected screen position. Screen offsets and viewport
 * culling use CSS pixels; hosts that cannot render elevation project the longitude/latitude at
 * ground level while preserving [altitudeMeters] for a future capable host.
 */
@Serializable
data class GeoAnchor(
	val coordinate: GeoCoordinate,
	val altitudeMeters: Double = 0.0,
	val elevationMode: GeoElevationMode = GeoElevationMode.GROUND,
	val screenOffset: ScreenCoordinate = ScreenCoordinate(0.0, 0.0),
	val visibility: GeoAnchorVisibility = GeoAnchorVisibility.VISIBLE,
	val minimumZoom: Double? = null,
	val maximumZoom: Double? = null,
)

@Serializable
data class MapCameraState(
	val center: GeoCoordinate,
	val zoom: Double,
	val bearing: Double = 0.0,
	val pitch: Double = 0.0,
)

@Serializable
@JvmInline
value class MapSourceId(val value: String)

@Serializable
@JvmInline
value class MapLayerId(val value: String)

@Serializable
@JvmInline
value class MapOverlayId(val value: String)

@Serializable
data class GeoBounds(val southWest: GeoCoordinate, val northEast: GeoCoordinate)

@Serializable
sealed interface MapCameraCommand {
	@Serializable
	data class Jump(val camera: MapCameraState) : MapCameraCommand

	@Serializable
	data class Ease(val camera: MapCameraState, val durationMillis: Long) : MapCameraCommand

	@Serializable
	data class Fly(val camera: MapCameraState, val durationMillis: Long? = null) : MapCameraCommand

	@Serializable
	data class FitBounds(
		val bounds: GeoBounds,
		val padding: Double = 0.0,
		val bearing: Double? = null,
		val pitch: Double? = null,
		val durationMillis: Long? = null,
	) : MapCameraCommand

	@Serializable
	data object StopAnimation : MapCameraCommand
}

/** Camera commands never queue or blend: a new command replaces the active host animation. */
@Serializable
enum class MapCameraCommandPolicy { REPLACE_ACTIVE }

@Serializable
sealed interface MapInteractionEvent {
	@Serializable
	data class Loaded(val camera: MapCameraState) : MapInteractionEvent

	@Serializable
	data class Clicked(val screen: ScreenCoordinate, val coordinate: GeoCoordinate) : MapInteractionEvent

	@Serializable
	data class PointerMoved(val screen: ScreenCoordinate, val coordinate: GeoCoordinate) : MapInteractionEvent

	/** A host camera transition began. Its intermediate timing and pixels are observations only. */
	@Serializable
	data class CameraMoveStarted(val commandSequence: Long?) : MapInteractionEvent

	@Serializable
	data class CameraMoved(val camera: MapCameraState) : MapInteractionEvent

	@Serializable
	data class CameraAnimationCancelled(val commandSequence: Long, val camera: MapCameraState) : MapInteractionEvent

	@Serializable
	data class CameraIdle(val camera: MapCameraState) : MapInteractionEvent
}

@Serializable
data class FeatureQuery(
	val screen: ScreenCoordinate,
	val layerIds: Set<MapLayerId> = emptySet(),
)

/** A renderer-independent snapshot; properties must not contain target handles. */
@Serializable
data class MapFeatureRecord(
	val id: String? = null,
	val sourceId: MapSourceId? = null,
	val sourceLayer: String? = null,
	val layerId: MapLayerId? = null,
	val geometry: JsonElement,
	val properties: Map<String, JsonElement> = emptyMap(),
)

@Serializable
enum class MapHostLifecycle { NEW, INITIALIZING, READY, DISPOSED }

/** Explicit completion value returned by every asynchronous host operation. */
sealed interface MapHostResult<out T> {
	data class Success<T>(val value: T) : MapHostResult<T>
	data class Failure(val code: String, val message: String) : MapHostResult<Nothing>
}

/**
 * Capability boundary implemented by a target adapter, never by normalized IR.
 *
 * Calls complete asynchronously and must preserve invocation/event order. [initialize] is valid
 * once from NEW. [dispose] is terminal and idempotent; it cancels animation, releases all target
 * handles, and guarantees no later event callbacks. Other calls require READY and return Failure
 * in any invalid state.
 */
interface MapHost {
	val lifecycle: MapHostLifecycle
	val cameraCommandPolicy: MapCameraCommandPolicy get() = MapCameraCommandPolicy.REPLACE_ACTIVE

	suspend fun initialize(eventSink: (MapInteractionEvent) -> Unit): MapHostResult<Unit>
	suspend fun cameraState(): MapHostResult<MapCameraState>
	suspend fun execute(command: MapCameraCommand): MapHostResult<Unit>
	suspend fun project(coordinate: GeoCoordinate): MapHostResult<ScreenCoordinate>
	suspend fun unproject(point: ScreenCoordinate): MapHostResult<GeoCoordinate>
	suspend fun projectToWorld(coordinate: GeoCoordinate): MapHostResult<ProjectedPoint>
	suspend fun unprojectFromWorld(point: ProjectedPoint): MapHostResult<GeoCoordinate>
	suspend fun queryFeatures(query: FeatureQuery): MapHostResult<List<MapFeatureRecord>>
	suspend fun setSourceVisible(sourceId: MapSourceId, visible: Boolean): MapHostResult<Unit>
	suspend fun setLayerVisible(layerId: MapLayerId, visible: Boolean): MapHostResult<Unit>
	suspend fun dispose(): MapHostResult<Unit>
}
