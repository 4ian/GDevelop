package org.gdevelop.kotlin.maplibre

import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.gdevelop.kotlin.map.MapHostResult
import org.w3c.dom.HTMLElement

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
    val host = MapLibreMapHost(MapLibreHostOptions(container, style)) { println("${it.code}: ${it.message}") }
    scope.launch {
        val result = host.initialize {}
        if (result is MapHostResult.Failure) println("${result.code}: ${result.message}")
    }
    window.addEventListener("resize", { host.resize() })
    window.addEventListener("beforeunload", { scope.launch { host.dispose() } })
}
