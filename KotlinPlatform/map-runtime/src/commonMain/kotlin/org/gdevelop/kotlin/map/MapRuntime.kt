package org.gdevelop.kotlin.map

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement

@Serializable
data class GeoCoordinate(val longitude: Double, val latitude: Double)

@Serializable
data class ProjectedPoint(val x: Double, val y: Double)

@Serializable
data class ScreenCoordinate(val x: Double, val y: Double)

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

@Serializable
sealed interface MapInteractionEvent {
    @Serializable
    data class Loaded(val camera: MapCameraState) : MapInteractionEvent

    @Serializable
    data class Clicked(val screen: ScreenCoordinate, val coordinate: GeoCoordinate) : MapInteractionEvent

    @Serializable
    data class PointerMoved(val screen: ScreenCoordinate, val coordinate: GeoCoordinate) : MapInteractionEvent

    @Serializable
    data class CameraMoved(val camera: MapCameraState) : MapInteractionEvent

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
