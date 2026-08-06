package org.gdevelop.kotlin.maptiles

import org.gdevelop.kotlin.extensions.ActionDescriptor
import org.gdevelop.kotlin.extensions.ConditionDescriptor
import org.gdevelop.kotlin.extensions.ExtensionContext
import org.gdevelop.kotlin.extensions.ExtensionDescriptor
import org.gdevelop.kotlin.extensions.ExtensionIdentity
import org.gdevelop.kotlin.extensions.ExtensionProvider
import org.gdevelop.kotlin.extensions.ExtensionRuntime
import org.gdevelop.kotlin.extensions.ParameterDescriptor
import org.gdevelop.kotlin.extensions.RuntimeCapabilities

/** Stable descriptor keys shared by lowering and the browser host-operation executor. */
object MapTilesEntries {
    const val SET_CAMERA = "setCamera"
    const val FIT_BOUNDS = "fitBounds"
    const val READ_CAMERA = "readCamera"
    const val PROJECT = "project"
    const val UNPROJECT = "unproject"
    const val ADD_MARKER = "addMarker"
    const val UPDATE_MARKER = "updateMarker"
    const val REMOVE_MARKER = "removeMarker"
    const val SHOW_MARKER = "showMarker"
    const val HIDE_MARKER = "hideMarker"
    const val QUERY_FEATURES = "queryFeatures"
    const val MAP_LOADED = "mapLoaded"
    const val CAMERA_ANIMATING = "cameraAnimating"
    const val MAP_CLICKED = "mapClicked"
    const val CAMERA_IDLE = "cameraIdle"
}

private val mapCapability = setOf(RuntimeCapabilities.BrowserMapRenderingHost)
private fun p(name: String, type: String) = ParameterDescriptor(name, type)
private fun action(type: String, entry: String, vararg parameters: ParameterDescriptor) =
    ActionDescriptor("MapTiles::$type", parameters.toList(), entry, mapCapability)
private fun condition(type: String, entry: String, vararg parameters: ParameterDescriptor) =
    ConditionDescriptor("MapTiles::$type", parameters.toList(), entry, mapCapability)

/** Ordered, reflection-free provider for the first map event-sheet vertical slice. */
object MapTilesExtension : ExtensionProvider {
    override val descriptor = ExtensionDescriptor(
        identity = ExtensionIdentity("MapTiles", "1.0.0", "gdevelop-kotlin"),
        actions = listOf(
            action("SetCamera", MapTilesEntries.SET_CAMERA, p("longitude", "number"), p("latitude", "number"), p("zoom", "number"), p("durationMs", "number")),
            action("FitBounds", MapTilesEntries.FIT_BOUNDS, p("west", "number"), p("south", "number"), p("east", "number"), p("north", "number"), p("padding", "number"), p("durationMs", "number")),
            action("ReadCamera", MapTilesEntries.READ_CAMERA, p("longitudeVariable", "variable"), p("latitudeVariable", "variable"), p("zoomVariable", "variable"), p("bearingVariable", "variable"), p("pitchVariable", "variable")),
            action("Project", MapTilesEntries.PROJECT, p("longitude", "number"), p("latitude", "number"), p("xVariable", "variable"), p("yVariable", "variable")),
            action("Unproject", MapTilesEntries.UNPROJECT, p("x", "number"), p("y", "number"), p("longitudeVariable", "variable"), p("latitudeVariable", "variable")),
            action("AddMarker", MapTilesEntries.ADD_MARKER, p("markerId", "string"), p("longitude", "number"), p("latitude", "number")),
            action("UpdateMarker", MapTilesEntries.UPDATE_MARKER, p("markerId", "string"), p("longitude", "number"), p("latitude", "number")),
            action("RemoveMarker", MapTilesEntries.REMOVE_MARKER, p("markerId", "string")),
            action("ShowMarker", MapTilesEntries.SHOW_MARKER, p("markerId", "string")),
            action("HideMarker", MapTilesEntries.HIDE_MARKER, p("markerId", "string")),
            action("QueryFeatures", MapTilesEntries.QUERY_FEATURES, p("layerId", "layer"), p("x", "number"), p("y", "number"), p("resultVariable", "variable")),
        ),
        conditions = listOf(
            condition("MapLoaded", MapTilesEntries.MAP_LOADED),
            condition("CameraAnimationActive", MapTilesEntries.CAMERA_ANIMATING),
            condition("MapClicked", MapTilesEntries.MAP_CLICKED),
            condition("CameraIdle", MapTilesEntries.CAMERA_IDLE),
        ),
        lifecycleHooks = emptyList(),
    )

    // Host operations are executed by a target binding, never through the generic synchronous SDK.
    override val runtime = object : ExtensionRuntime {
        override fun invoke(entry: String, arguments: List<String>, context: ExtensionContext) = false
    }
}
