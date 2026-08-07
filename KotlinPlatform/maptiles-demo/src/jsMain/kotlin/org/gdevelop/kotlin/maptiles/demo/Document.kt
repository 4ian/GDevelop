package org.gdevelop.kotlin.maptiles.demo

import kotlinx.serialization.Serializable

@Serializable
data class DemoDocument(
	val version: Int = 1,
	val map: MapConfiguration = MapConfiguration(),
	val overlays: List<MarkerDocument> = emptyList(),
	val operations: List<EventOperation> = emptyList(),
)

@Serializable
data class MapConfiguration(
	val styleUrl: String = "",
	val center: List<Double> = listOf(0.0, 20.0),
	val zoom: Double = 1.5,
	val attribution: String = "",
)

@Serializable
data class MarkerDocument(
	val id: String,
	val longitude: Double,
	val latitude: Double,
	val label: String,
	val icon: String = "📍",
	val minimumZoom: Double = 0.0,
	val maximumZoom: Double = 24.0,
	val visible: Boolean = true,
)

@Serializable
data class EventOperation(
	val event: String,
	val action: String,
	val markerId: String? = null,
	val longitude: Double? = null,
	val latitude: Double? = null,
	val durationMs: Int? = null,
)
