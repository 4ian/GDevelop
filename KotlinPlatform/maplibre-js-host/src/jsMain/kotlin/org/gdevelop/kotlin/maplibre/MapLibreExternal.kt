@file:JsModule("maplibre-gl")
@file:JsNonModule

package org.gdevelop.kotlin.maplibre

import org.w3c.dom.HTMLElement

internal external object MapLibreGl {
	fun supported(): Boolean
	class Map(options: MapOptions) {
		fun on(type: String, listener: (dynamic) -> Unit): Map
		fun off(type: String, listener: (dynamic) -> Unit): Map
		fun getCenter(): LngLat
		fun getZoom(): Double
		fun getBearing(): Double
		fun getPitch(): Double
		fun jumpTo(options: CameraOptions)
		fun easeTo(options: CameraOptions)
		fun flyTo(options: CameraOptions)
		fun fitBounds(bounds: Array<Array<Double>>, options: CameraOptions)
		fun stop()
		fun project(coordinate: Array<Double>): Point
		fun unproject(point: Array<Double>): LngLat
		fun queryRenderedFeatures(point: Array<Double>, options: QueryOptions = definedExternally): Array<RenderedFeature>
		fun addSource(id: String, source: dynamic)
		fun removeSource(id: String)
		fun addLayer(layer: dynamic)
		fun removeLayer(id: String)
		fun setLayoutProperty(layerId: String, name: String, value: String)
		fun resize()
		fun remove()
	}
}

internal external interface MapOptions {
	var container: HTMLElement
	var style: dynamic
	var center: Array<Double>?
	var zoom: Double?
	var bearing: Double?
	var pitch: Double?
}

internal external interface CameraOptions {
	var center: Array<Double>?
	var zoom: Double?
	var bearing: Double?
	var pitch: Double?
	var duration: Double?
	var padding: Double?
}

internal external interface QueryOptions {
	var layers: Array<String>?
}

internal external interface GeoJsonSourceOptions {
	var type: String;
	var data: dynamic
}

internal external interface LayerOptions {
	var id: String;
	var source: String;
	var type: String
}

internal external interface LngLat {
	var lng: Double;
	var lat: Double
}

internal external interface Point {
	var x: Double;
	var y: Double
}

internal external interface RenderedFeature {
	var id: dynamic
	var source: String?
	var sourceLayer: String?
	var layer: dynamic
	var geometry: dynamic
	var properties: dynamic
}
