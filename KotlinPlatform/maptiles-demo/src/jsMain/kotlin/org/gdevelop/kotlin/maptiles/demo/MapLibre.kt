@file:JsModule("maplibre-gl")
@file:JsNonModule

package org.gdevelop.kotlin.maptiles.demo

import org.w3c.dom.HTMLElement

external object MapLibre {
    class Map(options: dynamic) {
        fun on(type: String, listener: (dynamic) -> Unit): Map
        fun addControl(control: dynamic, position: String = definedExternally): Map
        fun getZoom(): Double
        fun zoomIn()
        fun zoomOut()
        fun flyTo(options: dynamic)
        fun setStyle(style: dynamic)
        fun remove()
    }
    class Marker(options: dynamic = definedExternally) {
        fun setLngLat(coordinate: Array<Double>): Marker
        fun addTo(map: Map): Marker
        fun getElement(): HTMLElement
        fun remove()
    }
    class AttributionControl(options: dynamic = definedExternally)
}
