package org.gdevelop.kotlin.maplibre

import kotlinx.browser.document
import kotlinx.browser.window
import org.gdevelop.kotlin.map.GeoAnchor
import org.gdevelop.kotlin.map.GeoAnchorVisibility
import org.gdevelop.kotlin.map.MapCameraState
import org.gdevelop.kotlin.map.MapHost
import org.gdevelop.kotlin.map.MapHostResult
import org.gdevelop.kotlin.map.MapInteractionEvent
import org.gdevelop.kotlin.map.MapOverlayId
import org.gdevelop.kotlin.map.ScreenCoordinate
import org.w3c.dom.HTMLCanvasElement
import org.w3c.dom.HTMLElement
import org.w3c.dom.events.Event
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.js.unsafeCast

/** A logical overlay object. Geographic coordinates remain authoritative in [anchor]. */
data class GeoOverlayObject(
    val id: MapOverlayId,
    var anchor: GeoAnchor,
    val width: Double,
    val height: Double,
    val interactive: Boolean = false,
)

data class ProjectedOverlay(
    val id: MapOverlayId,
    val position: ScreenCoordinate,
    val width: Double,
    val height: Double,
    val visible: Boolean,
)

/**
 * Owns the three browser layers. The overlay canvas uses CSS-pixel scene coordinates and a
 * DPR-scaled backing store, which is directly compatible with Pixi's resolution convention.
 */
class LayeredMapContainer(val root: HTMLElement) {
    val mapLayer: HTMLElement = (document.createElement("div") as HTMLElement)
    val overlayCanvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement
    val uiLayer: HTMLElement = document.createElement("div") as HTMLElement

    init {
        root.style.position = "relative"
        root.style.setProperty("overflow", "hidden")
        configureLayer(mapLayer, "0")
        configureLayer(overlayCanvas, "1")
        configureLayer(uiLayer, "2")
        overlayCanvas.style.setProperty("pointer-events", "none")
        uiLayer.style.setProperty("pointer-events", "none")
        root.append(mapLayer, overlayCanvas, uiLayer)
    }

    fun resize(): ViewportMetrics {
        val width = max(0, root.clientWidth)
        val height = max(0, root.clientHeight)
        val dpr = window.devicePixelRatio.takeIf { it.isFinite() && it > 0.0 } ?: 1.0
        val backingWidth = (width * dpr).roundToInt()
        val backingHeight = (height * dpr).roundToInt()
        if (overlayCanvas.width != backingWidth) overlayCanvas.width = backingWidth
        if (overlayCanvas.height != backingHeight) overlayCanvas.height = backingHeight
        overlayCanvas.style.width = "${width}px"
        overlayCanvas.style.height = "${height}px"
        return ViewportMetrics(width.toDouble(), height.toDouble(), dpr)
    }

    fun dispose() {
        mapLayer.remove(); overlayCanvas.remove(); uiLayer.remove()
    }

    private fun configureLayer(element: HTMLElement, zIndex: String) {
        element.style.position = "absolute"
        element.style.setProperty("inset", "0")
        element.style.zIndex = zIndex
    }
}

data class ViewportMetrics(val width: Double, val height: Double, val devicePixelRatio: Double)

/** Narrow declaration because this Kotlin DOM version does not expose PointerEvent. */
external interface OverlayPointerEvent {
    val clientX: Double
    val clientY: Double
    fun preventDefault()
    fun stopPropagation()
}

/**
 * Ordered overlay frame pipeline:
 * map callback -> event-sheet callback -> projection/culling -> animation callback -> render.
 * Calls are serialized by the owner; thus a later map event cannot overtake an active frame.
 */
class MapOverlayAdapter(
    private val host: MapHost,
    private val layers: LayeredMapContainer,
    private val executeEventSheet: suspend (MapInteractionEvent) -> Unit = {},
    private val animate: (List<ProjectedOverlay>) -> Unit = {},
    private val render: (HTMLCanvasElement, List<ProjectedOverlay>, ViewportMetrics) -> Unit,
    private val onOverlayPointer: (MapOverlayId, OverlayPointerEvent) -> Boolean = { _, _ -> false },
) {
    private val objects = linkedMapOf<MapOverlayId, GeoOverlayObject>()
    private var projected = emptyList<ProjectedOverlay>()
    private var metrics = layers.resize()
    private val pointerListener: (Event) -> Unit = { routePointer(it) }

    init { layers.root.addEventListener("pointerdown", pointerListener, true) }

    fun put(value: GeoOverlayObject) { objects[value.id] = value }
    fun remove(id: MapOverlayId) { objects.remove(id) }

    suspend fun onMapEvent(event: MapInteractionEvent) {
        executeEventSheet(event)
        metrics = layers.resize()
        updateProjection(cameraFrom(event))
        animate(projected)
        render(layers.overlayCanvas, projected, metrics)
    }

    /** Call for animation-only render ticks after event-sheet state has been committed. */
    suspend fun renderFrame() {
        metrics = layers.resize()
        updateProjection(null)
        animate(projected)
        render(layers.overlayCanvas, projected, metrics)
    }

    suspend fun resize() {
        renderFrame()
    }

    fun dispose() {
        layers.root.removeEventListener("pointerdown", pointerListener, true)
        objects.clear(); projected = emptyList(); layers.dispose()
    }

    private suspend fun updateProjection(eventCamera: MapCameraState?) {
        val camera = eventCamera ?: (host.cameraState() as? MapHostResult.Success)?.value ?: return
        projected = objects.values.map { value ->
            val zoomVisible = value.anchor.minimumZoom?.let { camera.zoom >= it } ?: true
            val belowMaximum = value.anchor.maximumZoom?.let { camera.zoom <= it } ?: true
            val point = (host.project(value.anchor.coordinate) as? MapHostResult.Success)?.value
            val position = point?.let {
                ScreenCoordinate(it.x + value.anchor.screenOffset.x, it.y + value.anchor.screenOffset.y)
            } ?: ScreenCoordinate(Double.NaN, Double.NaN)
            val inViewport = position.x + value.width / 2 >= 0 && position.y + value.height / 2 >= 0 &&
                position.x - value.width / 2 < metrics.width && position.y - value.height / 2 < metrics.height
            ProjectedOverlay(value.id, position, value.width, value.height,
                value.anchor.visibility == GeoAnchorVisibility.VISIBLE && zoomVisible && belowMaximum && point != null && inViewport)
        }
    }

    private fun routePointer(event: Event) {
        val pointer = event.unsafeCast<OverlayPointerEvent>()
        val bounds = layers.root.getBoundingClientRect()
        val x = pointer.clientX - bounds.left
        val y = pointer.clientY - bounds.top
        val hit = projected.asReversed().firstOrNull {
            it.visible && objects[it.id]?.interactive == true && x >= it.position.x - it.width / 2 &&
                x <= it.position.x + it.width / 2 && y >= it.position.y - it.height / 2 && y <= it.position.y + it.height / 2
        }
        // The canvas itself never captures input. Only a positively handled logical hit prevents
        // the original event from continuing to MapLibre underneath.
        if (hit != null && onOverlayPointer(hit.id, pointer)) {
            pointer.preventDefault(); pointer.stopPropagation()
        }
    }

    private fun cameraFrom(event: MapInteractionEvent): MapCameraState? = when (event) {
        is MapInteractionEvent.Loaded -> event.camera
        is MapInteractionEvent.CameraMoved -> event.camera
        is MapInteractionEvent.CameraIdle -> event.camera
        else -> null
    }
}
