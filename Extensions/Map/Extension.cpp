/**
 * GDevelop - Map Extension
 * Copyright (c) 2024 GDevelop Community
 * This project is released under the MIT License.
 */

#include "MapObject.h"
#include "MapMarkerBehavior.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"

void DeclareMapExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "Map",
          _("Map"),
          _("Add a map (minimap/worldmap) to your game with automatic object tracking, "
            "customizable markers, and visual customization support."),
          "GDevelop Community",
          "Open source (MIT License)")
      .SetExtensionHelpPath("/objects/map")
      .SetCategory("User interface")
      .SetTags("map,minimap,worldmap");

  // ===== MAP OBJECT =====
  
  gd::ObjectMetadata& mapObject = extension.AddObject<MapObject>(
      "Map",
      _("Map"),
      _("A map that automatically tracks objects with markers and displays "
        "them on screen."),
      "CppPlatform/Extensions/texticon.png")
      .SetCategory("User interface");

  mapObject
      .AddExpression("ZoomLevel",
                     _("Zoom level"),
                     _("Get the current zoom level."),
                     _("Zoom"),
                     "CppPlatform/Extensions/cameraicon.png")
      .AddParameter("object", _("Map"), "Map")
      .SetFunctionName("getZoomLevel")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js")
      .AddIncludeFile("Extensions/Map/mapruntimeobject-pixi-renderer.js");

  mapObject
      .AddExpression("TrackedCount",
                     _("Tracked objects count"),
                     _("Get the number of tracked objects."),
                     _("Tracking"),
                     "CppPlatform/Extensions/positionicon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("string", _("Marker type (optional)"), "", true)
      .SetDefaultValue("")
      .SetFunctionName("getTrackedCount")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  // Visibility actions
  mapObject
      .AddAction("SetVisible",
                 _("Show/hide map"),
                 _("Set the visibility of the map."),
                 _("Set visibility of _PARAM0_ to _PARAM1_"),
                 _("Map"),
                 "CppPlatform/Extensions/visibleicon.png",
                 "CppPlatform/Extensions/visibleicon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("yesorno", _("Visible"))
      .SetFunctionName("setVisible")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");


  // Zoom actions
  mapObject
      .AddAction("ZoomIn",
                 _("Zoom in"),
                 _("Zoom in the map."),
                 _("Zoom in _PARAM0_"),
                 _("Map"),
                 "CppPlatform/Extensions/cameraicon.png",
                 "CppPlatform/Extensions/cameraicon.png")
      .AddParameter("object", _("Map"), "Map")
      .SetFunctionName("zoomIn")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  mapObject
      .AddAction("ZoomOut",
                 _("Zoom out"),
                 _("Zoom out the map."),
                 _("Zoom out _PARAM0_"),
                 _("Map"),
                 "CppPlatform/Extensions/cameraicon.png",
                 "CppPlatform/Extensions/cameraicon.png")
      .AddParameter("object", _("Map"), "Map")
      .SetFunctionName("zoomOut")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  mapObject
      .AddAction("SetZoom",
                 _("Set zoom level"),
                 _("Set the zoom level of the map."),
                 _("Set zoom level of _PARAM0_ to _PARAM1_"),
                 _("Map"),
                 "CppPlatform/Extensions/cameraicon.png",
                 "CppPlatform/Extensions/cameraicon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("expression", _("Zoom level"))
      .SetFunctionName("setZoom")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  // Position and size actions
  mapObject
      .AddAction("SetPosition",
                 _("Set position"),
                 _("Set the position of the map on screen."),
                 _("Set position of _PARAM0_ to _PARAM1_;_PARAM2_"),
                 _("Map"),
                 "CppPlatform/Extensions/positionicon.png",
                 "CppPlatform/Extensions/positionicon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("expression", _("X position"))
      .AddParameter("expression", _("Y position"))
      .SetFunctionName("setPosition")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  mapObject
      .AddAction("SetSize",
                 _("Set size"),
                 _("Set the size of the map."),
                 _("Set size of _PARAM0_ to _PARAM1_"),
                 _("Map"),
                 "CppPlatform/Extensions/scalewidthicon.png",
                 "CppPlatform/Extensions/scalewidthicon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("expression", _("Size"))
      .SetFunctionName("setSize")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  // Color actions
  mapObject
      .AddAction("SetPlayerColor",
                 _("Set player color"),
                 _("Set the default color used for Player markers."),
                 _("Set player color of _PARAM0_ to _PARAM1_"),
                 _("Map"),
                 "CppPlatform/Extensions/texticon.png",
                 "CppPlatform/Extensions/texticon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("color", _("Color"))
      .SetFunctionName("setPlayerColor")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  mapObject
      .AddAction("SetEnemyColor",
                 _("Set enemy color"),
                 _("Set the default color used for Enemy markers."),
                 _("Set enemy color of _PARAM0_ to _PARAM1_"),
                 _("Map"),
                 "CppPlatform/Extensions/texticon.png",
                 "CppPlatform/Extensions/texticon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("color", _("Color"))
      .SetFunctionName("setEnemyColor")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  mapObject
      .AddAction("SetItemColor",
                 _("Set item color"),
                 _("Set the default color used for Item markers."),
                 _("Set item color of _PARAM0_ to _PARAM1_"),
                 _("Map"),
                 "CppPlatform/Extensions/texticon.png",
                 "CppPlatform/Extensions/texticon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("color", _("Color"))
      .SetFunctionName("setItemColor")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  mapObject
      .AddAction("SetObstacleColor",
                 _("Set obstacle color"),
                 _("Set the default color used for obstacles on the map."),
                 _("Set obstacle color of _PARAM0_ to _PARAM1_"),
                 _("Map"),
                 "CppPlatform/Extensions/texticon.png",
                 "CppPlatform/Extensions/texticon.png")
      .AddParameter("object", _("Map"), "Map")
      .AddParameter("color", _("Color"))
      .SetFunctionName("setObstacleColor")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  // Conditions
  mapObject
      .AddCondition("IsVisible",
                    _("Is visible"),
                    _("Check if the map is visible."),
                    _("_PARAM0_ is visible"),
                    _("Map"),
                    "CppPlatform/Extensions/visibleicon.png",
                    "CppPlatform/Extensions/visibleicon.png")
      .AddParameter("object", _("Map"), "Map")
      .SetFunctionName("isVisible")
      .SetIncludeFile("Extensions/Map/mapruntimeobject.js");

  // ===== MAP MARKER BEHAVIOR =====
  
  gd::BehaviorMetadata& mapMarkerBehavior = extension.AddBehavior(
      "MapMarker",
      _("Map Marker"),
      "MapMarker",
      _("Mark this object to be tracked and displayed on the map."),
      "",
      "CppPlatform/Extensions/draggableicon.png",
      "MapMarker",
      std::make_shared<MapMarkerBehavior>(),
      std::make_shared<gd::BehaviorsSharedData>());

  // Behavior actions
  mapMarkerBehavior
      .AddAction("ShowOnMap",
                 _("Show on map"),
                 _("Show the object on the map."),
                 _("Show _PARAM0_ on map"),
                 _("Map"),
                 "CppPlatform/Extensions/visibleicon.png",
                 "CppPlatform/Extensions/visibleicon.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "MapMarker")
      .SetFunctionName("showOnMap")
      .SetIncludeFile("Extensions/Map/mapmarkerbehavior.js");

  mapMarkerBehavior
      .AddAction("HideOnMap",
                 _("Hide on map"),
                 _("Hide the object from the map."),
                 _("Hide _PARAM0_ from map"),
                 _("Map"),
                 "CppPlatform/Extensions/visibleicon.png",
                 "CppPlatform/Extensions/visibleicon.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "MapMarker")
      .SetFunctionName("hideOnMap")
      .SetIncludeFile("Extensions/Map/mapmarkerbehavior.js");

  mapMarkerBehavior
      .AddAction("SetMarkerType",
                 _("Set marker type"),
                 _("Set the marker type."),
                 _("Set marker type of _PARAM0_ to _PARAM2_"),
                 _("Map"),
                 "CppPlatform/Extensions/texticon.png",
                 "CppPlatform/Extensions/texticon.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "MapMarker")
      .AddParameter("stringWithSelector",
                    _("Marker type"),
                    "[\"Player\", \"Enemy\", \"Ally\", \"Item\", "
                    "\"Obstacle\", \"Custom\"]")
      .SetFunctionName("setMarkerType")
      .SetIncludeFile("Extensions/Map/mapmarkerbehavior.js");

  mapMarkerBehavior
      .AddAction("Flash",
                 _("Flash marker"),
                 _("Make the marker flash to attract attention."),
                 _("Flash marker of _PARAM0_ for _PARAM2_ seconds"),
                 _("Map"),
                 "CppPlatform/Extensions/particlesystemicon.png",
                 "CppPlatform/Extensions/particlesystemicon.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "MapMarker")
      .AddParameter("expression", _("Duration (seconds)"))
      .SetFunctionName("flash")
      .SetIncludeFile("Extensions/Map/mapmarkerbehavior.js");

  // Behavior conditions
  mapMarkerBehavior
      .AddCondition("IsVisibleOnMap",
                    _("Is visible on map"),
                    _("Check if the object is visible on the map."),
                    _("_PARAM0_ is visible on map"),
                    _("Map"),
                    "CppPlatform/Extensions/visibleicon.png",
                    "CppPlatform/Extensions/visibleicon.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "MapMarker")
      .SetFunctionName("isVisibleOnMap")
      .SetIncludeFile("Extensions/Map/mapmarkerbehavior.js");

  mapMarkerBehavior
      .AddCondition("MarkerTypeIs",
                    _("Marker type is"),
                    _("Check the marker type."),
                    _("Marker type of _PARAM0_ is _PARAM2_"),
                    _("Map"),
                    "CppPlatform/Extensions/texticon.png",
                    "CppPlatform/Extensions/texticon.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "MapMarker")
      .AddParameter("stringWithSelector",
                    _("Marker type"),
                    "[\"Player\", \"Enemy\", \"Ally\", \"Item\", "
                    "\"Obstacle\", \"Custom\"]")
      .SetFunctionName("markerTypeIs")
      .SetIncludeFile("Extensions/Map/mapmarkerbehavior.js");
}

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDExtension() {
  return new gd::PlatformExtension;
}

/**
 * Used by GDevelop to declare the extension
 */
extern "C" void GD_EXTENSION_API ExtensionDeclaration(
    gd::PlatformExtension& extension) {
  DeclareMapExtension(extension);
}