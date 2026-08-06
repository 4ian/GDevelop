package org.gdevelop.kotlin.maplibre

import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.gdevelop.kotlin.map.MapHostResult
import org.w3c.dom.HTMLElement
import org.w3c.dom.CanvasRenderingContext2D

private val scope = MainScope()

/** Standalone ownership probe: mount on load, resize with the window, dispose on page teardown. */
fun main() {
    mapLibreStyleSheet
    val container = document.getElementById("map") as? HTMLElement ?: return
    val style = buildJsonObject {
        put("version", 8)
        put("sources", buildJsonObject {})
        put("layers", kotlinx.serialization.json.buildJsonArray {})
    }
    val layers = LayeredMapContainer(container)
    val host = MapLibreMapHost(MapLibreHostOptions(layers.mapLayer, style)) { println("${it.code}: ${it.message}") }
    val frames = Mutex()
    val overlay = MapOverlayAdapter(host, layers, render = { canvas, objects, metrics ->
        val context = canvas.getContext("2d") as CanvasRenderingContext2D
        context.setTransform(metrics.devicePixelRatio, 0.0, 0.0, metrics.devicePixelRatio, 0.0, 0.0)
        context.clearRect(0.0, 0.0, metrics.width, metrics.height)
        context.fillStyle = "#ffcc00"
        objects.filter { it.visible }.forEach { context.fillRect(it.position.x - 4.0, it.position.y - 4.0, 8.0, 8.0) }
    })
    scope.launch {
        val result = host.initialize { event -> scope.launch { frames.withLock { overlay.onMapEvent(event) } } }
        if (result is MapHostResult.Failure) println("${result.code}: ${result.message}")
    }
    window.addEventListener("resize", {
        host.resize()
        scope.launch { frames.withLock { overlay.resize() } }
    })
    window.addEventListener("beforeunload", {
        scope.launch { frames.withLock { host.dispose(); overlay.dispose() } }
    })
}
