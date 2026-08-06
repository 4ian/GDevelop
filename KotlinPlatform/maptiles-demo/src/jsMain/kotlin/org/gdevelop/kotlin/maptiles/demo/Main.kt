package org.gdevelop.kotlin.maptiles.demo

import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.await
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.w3c.dom.HTMLButtonElement
import org.w3c.dom.HTMLDivElement
import org.w3c.dom.HTMLInputElement
import org.w3c.dom.HTMLTextAreaElement
import kotlin.math.roundToInt

private val json = Json { prettyPrint = true; ignoreUnknownKeys = false }
private val scope = MainScope()

fun main() {
    mapLibreCss
    demoCss
    val root = document.getElementById("app") as? HTMLDivElement ?: return
    root.className = "app"
    root.innerHTML = layout
    DemoEditor(root).start()
}

private class DemoEditor(private val root: HTMLDivElement) {
    private var model = DemoDocument()
    private var map: MapLibre.Map? = null
    private val rendered = linkedMapOf<String, MapLibre.Marker>()
    private var selectedId: String? = null
    private var layersVisible = true

    fun start() {
        bind("apply-map") { applyMapInputs() }
        bind("zoom-in") { map?.zoomIn() }
        bind("zoom-out") { map?.zoomOut() }
        bind("toggle-layer") { layersVisible = !layersVisible; renderMarkers() }
        bind("fly") { selected()?.let { flyTo(it, 900) } }
        bind("animate") { selected()?.let { animate(it, it.longitude + .02, it.latitude + .01, 1400) } }
        bind("save-marker") { saveSelected() }
        bind("export") { textArea().value = json.encodeToString(model) }
        bind("import") { importDocument(textArea().value, runFlow = false) }
        bind("sample") {
            scope.launch {
                try {
                    val value = window.fetch("demo-document.json").await().text().await()
                    textArea().value = value
                    importDocument(value, runFlow = true)
                } catch (error: Throwable) { status("Could not load sample: ${error.message}", true) }
            }
        }
        createMap()
        updateInputs()
    }

    private fun createMap() {
        map?.remove()
        val options = js("({})")
        options.container = "map"
        options.style = styleValue(model.map.styleUrl)
        options.center = model.map.center.toTypedArray()
        options.zoom = model.map.zoom
        options.attributionControl = false
        map = MapLibre.Map(options).also { created ->
            val attribution = js("({})")
            attribution.customAttribution = model.map.attribution
            created.addControl(MapLibre.AttributionControl(attribution), "bottom-right")
            created.on("click") { event ->
                if (event.originalEvent.defaultPrevented != true) addMarker(event.lngLat.lng as Double, event.lngLat.lat as Double)
            }
            created.on("zoom") { applyZoomVisibility() }
            created.on("load") { renderMarkers(); status("Map ready. Click the map to add a marker.") }
        }
        renderMarkers()
    }

    /** An empty URL intentionally creates a blank style; users must opt into their provider. */
    private fun styleValue(url: String): dynamic = if (url.isBlank()) js("({version: 8, sources: {}, layers: []})") else url

    private fun addMarker(longitude: Double, latitude: Double) {
        val id = "marker-${model.overlays.size + 1}"
        model = model.copy(overlays = model.overlays + MarkerDocument(id, longitude, latitude, "New marker"))
        selectedId = id
        renderMarkers(); updateInputs(); status("Created $id")
    }

    private fun renderMarkers() {
        rendered.values.forEach { it.remove() }
        rendered.clear()
        val target = map ?: return
        model.overlays.forEach { marker ->
            val element = document.createElement("button") as HTMLButtonElement
            element.className = "marker" + if (marker.id == selectedId) " selected" else ""
            element.title = "Select ${marker.label}"
            element.innerHTML = "<b></b><span></span>"
            (element.querySelector("b")!!).textContent = marker.icon
            (element.querySelector("span")!!).textContent = marker.label
            element.onclick = { event ->
                event.preventDefault(); event.stopPropagation()
                selectedId = marker.id; updateInputs(); renderMarkers(); Unit
            }
            val options = js("({})"); options.element = element; options.anchor = "center"
            rendered[marker.id] = MapLibre.Marker(options).setLngLat(arrayOf(marker.longitude, marker.latitude)).addTo(target)
        }
        applyZoomVisibility()
    }

    private fun applyZoomVisibility() {
        val zoom = map?.getZoom() ?: model.map.zoom
        model.overlays.forEach { marker ->
            val show = layersVisible && marker.visible && zoom >= marker.minimumZoom && zoom <= marker.maximumZoom
            rendered[marker.id]?.getElement()?.style?.display = if (show) "grid" else "none"
        }
        input("zoom-readout").value = ((zoom * 10).roundToInt() / 10.0).toString()
    }

    private fun applyMapInputs() {
        val style = input("style-url").value.trim()
        model = model.copy(map = model.map.copy(
            styleUrl = style,
            center = listOf(input("center-lng").value.toDouble(), input("center-lat").value.toDouble()),
            zoom = input("initial-zoom").value.toDouble(),
            attribution = input("attribution").value,
        ))
        createMap(); status(if (style.isBlank()) "Using the blank style. Supply a style or TileJSON-compatible style URL." else "Map configuration applied.")
    }

    private fun saveSelected() {
        val old = selected() ?: return status("Select a marker first.", true)
        val updated = old.copy(
            longitude = input("marker-lng").value.toDouble(), latitude = input("marker-lat").value.toDouble(),
            label = input("marker-label").value, icon = input("marker-icon").value,
            minimumZoom = input("min-zoom").value.toDouble(), maximumZoom = input("max-zoom").value.toDouble(),
            visible = input("marker-visible").checked,
        )
        model = model.copy(overlays = model.overlays.map { if (it.id == old.id) updated else it })
        renderMarkers(); status("Saved ${old.id}")
    }

    private fun importDocument(value: String, runFlow: Boolean) {
        try {
            val imported = json.decodeFromString<DemoDocument>(value)
            require(imported.version == 1) { "Unsupported document version ${imported.version}" }
            require(imported.map.center.size == 2) { "Map center must contain longitude and latitude" }
            model = imported
            selectedId = operation("documentLoaded", "select")?.markerId ?: imported.overlays.firstOrNull()?.id
            updateInputs(); createMap(); status("Imported version ${imported.version} document.")
            if (runFlow) window.setTimeout({ runOperations("runSample") }, 500)
        } catch (error: Throwable) { status("Import rejected: ${error.message}", true) }
    }

    private fun runOperations(event: String) {
        model.operations.filter { it.event == event }.forEach { operation ->
            val marker = model.overlays.firstOrNull { it.id == operation.markerId } ?: return@forEach
            when (operation.action) {
                "select" -> { selectedId = marker.id; updateInputs(); renderMarkers() }
                "flyTo" -> flyTo(marker, operation.durationMs ?: 1000)
                "animateMarker" -> animate(marker, operation.longitude ?: marker.longitude, operation.latitude ?: marker.latitude, operation.durationMs ?: 1000)
                else -> status("Unsupported operation '${operation.action}' ignored.", true)
            }
        }
    }

    private fun flyTo(marker: MarkerDocument, duration: Int) {
        val options = js("({})"); options.center = arrayOf(marker.longitude, marker.latitude); options.zoom = 14; options.duration = duration
        map?.flyTo(options); status("Flying to ${marker.label}")
    }

    private fun animate(marker: MarkerDocument, endLng: Double, endLat: Double, duration: Int) {
        val started = window.performance.now()
        fun frame(now: Double) {
            val progress = ((now - started) / duration).coerceIn(0.0, 1.0)
            val eased = progress * (2 - progress)
            rendered[marker.id]?.setLngLat(arrayOf(marker.longitude + (endLng - marker.longitude) * eased, marker.latitude + (endLat - marker.latitude) * eased))
            if (progress < 1) window.requestAnimationFrame(::frame)
            else {
                model = model.copy(overlays = model.overlays.map { if (it.id == marker.id) it.copy(longitude = endLng, latitude = endLat) else it })
                updateInputs(); status("Animation completed for ${marker.label}")
            }
        }
        window.requestAnimationFrame(::frame)
    }

    private fun updateInputs() {
        input("style-url").value = model.map.styleUrl
        input("center-lng").value = model.map.center.getOrElse(0) { 0.0 }.toString()
        input("center-lat").value = model.map.center.getOrElse(1) { 0.0 }.toString()
        input("initial-zoom").value = model.map.zoom.toString()
        input("attribution").value = model.map.attribution
        val marker = selected()
        root.querySelector("#selection-title")?.textContent = marker?.let { "Selected: ${it.id}" } ?: "No marker selected"
        input("marker-lng").value = marker?.longitude?.toString() ?: ""
        input("marker-lat").value = marker?.latitude?.toString() ?: ""
        input("marker-label").value = marker?.label ?: ""
        input("marker-icon").value = marker?.icon ?: ""
        input("min-zoom").value = marker?.minimumZoom?.toString() ?: ""
        input("max-zoom").value = marker?.maximumZoom?.toString() ?: ""
        input("marker-visible").checked = marker?.visible ?: false
    }

    private fun selected() = model.overlays.firstOrNull { it.id == selectedId }
    private fun operation(event: String, action: String) = model.operations.firstOrNull { it.event == event && it.action == action }
    private fun input(id: String) = root.querySelector("#$id") as HTMLInputElement
    private fun textArea() = root.querySelector("#document") as HTMLTextAreaElement
    private fun bind(id: String, action: () -> Unit) { (root.querySelector("#$id") as HTMLButtonElement).onclick = { action(); Unit } }
    private fun status(message: String, error: Boolean = false) { root.querySelector("#status")?.apply { textContent = message; setAttribute("style", if (error) "color:#ff9da8" else "") } }
}

private val layout = """
    <h1>Map tiles authoring demo</h1>
    <p class="hint">No access token or provider URL is bundled. Paste a style URL and its required attribution, or use the blank map to edit documents.</p>
    <div class="toolbar">
      <label class="style">Map style / TileJSON style URL<input id="style-url" placeholder="https://your-provider.example/style.json"></label>
      <label>Center longitude<input id="center-lng" type="number" step="any"></label>
      <label>Center latitude<input id="center-lat" type="number" step="any"></label>
      <label>Initial zoom<input id="initial-zoom" type="number" step="0.1"></label>
      <label class="style">Provider attribution<input id="attribution" placeholder="Attribution required by your provider"></label>
      <button id="apply-map">Apply map</button>
    </div>
    <div class="toolbar">
      <button id="zoom-out" aria-label="Zoom out">−</button><button id="zoom-in" aria-label="Zoom in">+</button>
      <label>Current zoom<input id="zoom-readout" readonly></label>
      <button id="toggle-layer">Toggle markers</button><button id="fly">Fly to selected</button><button id="animate">Animate selected</button>
      <button id="sample">Load &amp; run sample</button>
    </div>
    <div class="workspace">
      <div id="map" aria-label="Interactive map"></div>
      <aside class="panel">
        <h2 id="selection-title">No marker selected</h2>
        <div class="fields">
          <label>Longitude<input id="marker-lng" type="number" step="any"></label><label>Latitude<input id="marker-lat" type="number" step="any"></label>
          <label class="wide">Label<input id="marker-label"></label><label>Icon / markup<input id="marker-icon"></label>
          <label>Minimum zoom<input id="min-zoom" type="number" step=".1"></label><label>Maximum zoom<input id="max-zoom" type="number" step=".1"></label>
          <label><span>Visible</span><input id="marker-visible" type="checkbox"></label><button id="save-marker">Save marker</button>
        </div>
        <h2>Versioned document</h2>
        <textarea id="document" aria-label="Map document JSON"></textarea>
        <div class="toolbar"><button id="import">Import JSON</button><button id="export">Export JSON</button></div>
      </aside>
    </div>
    <p id="status" class="status" role="status"></p>
""".trimIndent()
