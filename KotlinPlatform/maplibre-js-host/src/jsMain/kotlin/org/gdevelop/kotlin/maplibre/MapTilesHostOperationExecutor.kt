package org.gdevelop.kotlin.maplibre

import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import org.gdevelop.kotlin.diagnostics.Diagnostic
import org.gdevelop.kotlin.diagnostics.Severity
import org.gdevelop.kotlin.ir.ExtensionHostOperation
import org.gdevelop.kotlin.map.FeatureQuery
import org.gdevelop.kotlin.map.GeoAnchor
import org.gdevelop.kotlin.map.GeoBounds
import org.gdevelop.kotlin.map.GeoCoordinate
import org.gdevelop.kotlin.map.GeoAnchorVisibility
import org.gdevelop.kotlin.map.MapCameraCommand
import org.gdevelop.kotlin.map.MapHost
import org.gdevelop.kotlin.map.MapHostLifecycle
import org.gdevelop.kotlin.map.MapHostResult
import org.gdevelop.kotlin.map.MapInteractionEvent
import org.gdevelop.kotlin.map.MapFeatureRecord
import org.gdevelop.kotlin.map.MapLayerId
import org.gdevelop.kotlin.map.MapOverlayId
import org.gdevelop.kotlin.map.ScreenCoordinate
import org.gdevelop.kotlin.maptiles.MapTilesEntries
import org.gdevelop.kotlin.extensions.RuntimeCapabilities
import org.gdevelop.kotlin.runtime.*

interface MapOperationVariables {
    fun writeNumber(name: String, value: Double)
    fun writeFeatureRecords(name: String, value: List<MapFeatureRecord>)
}

/** Executes resolved host-operation nodes; descriptor display text is never consulted. */
class MapTilesHostOperationExecutor(
    private val host: MapHost?,
    private val overlay: MapOverlayAdapter?,
    private val variables: MapOperationVariables,
    private val diagnosticSink: (Diagnostic) -> Unit,
    private val traceSink: (ExtensionHostOperation) -> Unit = {},
) : OrderedRuntimeHost() {
    override val capabilities = if (host == null) emptySet() else setOf(HostCapability(RuntimeCapabilities.BrowserMapRenderingHost, 1))
    private val scope = MainScope()
    private val markers = linkedMapOf<MapOverlayId, GeoOverlayObject>()
    private var loaded = false
    private var cameraAnimating = false
    private var clicked = false
    private var cameraIdle = false

    fun acceptEvent(event: MapInteractionEvent) {
        when (event) {
            is MapInteractionEvent.Loaded -> loaded = true
            is MapInteractionEvent.Clicked -> clicked = true
            is MapInteractionEvent.CameraMoved -> cameraIdle = false
            is MapInteractionEvent.CameraIdle -> { cameraAnimating = false; cameraIdle = true }
            is MapInteractionEvent.CameraAnimationCancelled -> cameraAnimating = false
            else -> Unit
        }
    }

    /** Clears one event-sheet tick's edge-triggered click/idle conditions. */
    fun clearTransientEvents() { clicked = false; cameraIdle = false }

    override fun onBeginFrame(frame: Int, input: HostTransientInput) = clearTransientEvents()
    override fun evaluate(invocation: HostInvocation): HostOperationResult =
        if (evaluateCondition(invocation.operation)) HostOperationResult.Success("true") else HostOperationResult.Success("false")
    override fun invoke(invocation: HostInvocation) = HostOperationResult.Failure(
        "GDKP_RUNTIME_HOST_ASYNC_REQUIRED", "Map operations must use asynchronous dispatch")
    override fun invoke(invocation: HostInvocation, completion: (HostOperationResult) -> Unit) {
        scope.launch {
            completion(if (executeAction(invocation.operation)) HostOperationResult.Success()
            else HostOperationResult.Failure("GDKP_RUNTIME_MAP_HOST_OPERATION", "Map operation failed"))
        }
    }
    override fun onDispose() { scope.launch { host?.dispose() } }

    fun evaluateCondition(operation: ExtensionHostOperation): Boolean {
        traceSink(operation)
        if (!available(operation)) return false
        return when (operation.runtimeEntry) {
            MapTilesEntries.MAP_LOADED -> loaded
            MapTilesEntries.CAMERA_ANIMATING -> cameraAnimating
            MapTilesEntries.MAP_CLICKED -> clicked
            MapTilesEntries.CAMERA_IDLE -> cameraIdle
            else -> reject(operation, "Unknown map condition entry ${operation.runtimeEntry}")
        }
    }

    suspend fun executeAction(operation: ExtensionHostOperation): Boolean {
        traceSink(operation)
        val target = host ?: return unavailable(operation)
        if (!available(operation)) return false
        val a = operation.arguments.map { it.source }
        val result: MapHostResult<*> = when (operation.runtimeEntry) {
            MapTilesEntries.SET_CAMERA -> {
                val camera = target.cameraState().valueOrReport(operation) ?: return false
                val requested = camera.copy(center = GeoCoordinate(a.number(0), a.number(1)), zoom = a.number(2))
                val duration = a.number(3).toLong()
                cameraAnimating = duration > 0
                target.execute(if (duration > 0) MapCameraCommand.Ease(requested, duration) else MapCameraCommand.Jump(requested))
            }
            MapTilesEntries.FIT_BOUNDS -> {
                val duration = a.number(5).toLong()
                cameraAnimating = duration > 0
                target.execute(MapCameraCommand.FitBounds(
                    GeoBounds(GeoCoordinate(a.number(0), a.number(1)), GeoCoordinate(a.number(2), a.number(3))),
                    padding = a.number(4), durationMillis = duration,
                ))
            }
            MapTilesEntries.READ_CAMERA -> target.cameraState().also { result ->
                result.valueOrNull()?.let { camera ->
                    variables.writeNumber(a[0], camera.center.longitude); variables.writeNumber(a[1], camera.center.latitude)
                    variables.writeNumber(a[2], camera.zoom); variables.writeNumber(a[3], camera.bearing); variables.writeNumber(a[4], camera.pitch)
                }
            }
            MapTilesEntries.PROJECT -> target.project(GeoCoordinate(a.number(0), a.number(1))).also { result ->
                result.valueOrNull()?.let { variables.writeNumber(a[2], it.x); variables.writeNumber(a[3], it.y) }
            }
            MapTilesEntries.UNPROJECT -> target.unproject(ScreenCoordinate(a.number(0), a.number(1))).also { result ->
                result.valueOrNull()?.let { variables.writeNumber(a[2], it.longitude); variables.writeNumber(a[3], it.latitude) }
            }
            MapTilesEntries.ADD_MARKER, MapTilesEntries.UPDATE_MARKER -> marker(operation, a)
            MapTilesEntries.REMOVE_MARKER -> markerRemove(a)
            MapTilesEntries.SHOW_MARKER -> markerVisibility(a, true)
            MapTilesEntries.HIDE_MARKER -> markerVisibility(a, false)
            MapTilesEntries.QUERY_FEATURES -> target.queryFeatures(FeatureQuery(
                ScreenCoordinate(a.number(1), a.number(2)), setOf(MapLayerId(a[0])),
            )).also { result ->
                result.valueOrNull()?.let { records -> variables.writeFeatureRecords(a[3], records) }
            }
            else -> return reject(operation, "Unknown map action entry ${operation.runtimeEntry}")
        }
        if (result is MapHostResult.Failure) reportFailure(operation, result)
        return result is MapHostResult.Success
    }

    private fun marker(operation: ExtensionHostOperation, arguments: List<String>): MapHostResult<Unit> {
        val target = overlay ?: return MapHostResult.Failure("OVERLAY_UNAVAILABLE", "Map overlay is not installed")
        val id = MapOverlayId(arguments[0])
        val previous = markers[id]
        val value = GeoOverlayObject(id, GeoAnchor(
            coordinate = GeoCoordinate(arguments.number(1), arguments.number(2)),
            visibility = previous?.anchor?.visibility ?: GeoAnchorVisibility.VISIBLE,
        ), previous?.width ?: 16.0, previous?.height ?: 16.0, previous?.interactive ?: true)
        markers[id] = value; target.put(value)
        return MapHostResult.Success(Unit)
    }

    private fun markerRemove(arguments: List<String>): MapHostResult<Unit> {
        val id = MapOverlayId(arguments[0]); markers.remove(id); overlay?.remove(id)
        return MapHostResult.Success(Unit)
    }

    private fun markerVisibility(arguments: List<String>, visible: Boolean): MapHostResult<Unit> {
        val id = MapOverlayId(arguments[0])
        val marker = markers[id] ?: return MapHostResult.Failure("UNKNOWN_MARKER", "Unknown marker ${id.value}")
        marker.anchor = marker.anchor.copy(visibility = if (visible) GeoAnchorVisibility.VISIBLE else GeoAnchorVisibility.HIDDEN)
        overlay?.put(marker)
        return MapHostResult.Success(Unit)
    }

    private fun available(operation: ExtensionHostOperation): Boolean =
        if (host == null || host.lifecycle == MapHostLifecycle.DISPOSED) unavailable(operation) else true

    private fun unavailable(operation: ExtensionHostOperation): Boolean {
        diagnosticSink(Diagnostic("GDKP_RUNTIME_UNSUPPORTED_CAPABILITY", Severity.ERROR,
            "No map host installed for ${operation.requiredCapabilities.joinToString { it.value }}", operation.origin))
        return false
    }

    private fun reject(operation: ExtensionHostOperation, message: String): Boolean {
        diagnosticSink(Diagnostic("GDKP_RUNTIME_HOST_OPERATION", Severity.ERROR, message, operation.origin)); return false
    }

    private fun reportFailure(operation: ExtensionHostOperation, failure: MapHostResult.Failure) {
        diagnosticSink(Diagnostic("GDKP_RUNTIME_MAP_HOST_${failure.code}", Severity.ERROR, failure.message, operation.origin))
    }

    private fun List<String>.number(index: Int) = this[index].toDouble()
    private fun <T> MapHostResult<T>.valueOrNull(): T? = (this as? MapHostResult.Success)?.value
    private fun <T> MapHostResult<T>.valueOrReport(operation: ExtensionHostOperation): T? {
        if (this is MapHostResult.Failure) reportFailure(operation, this)
        return valueOrNull()
    }
}
