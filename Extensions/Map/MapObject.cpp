/**
 * GDevelop - Map Extension
 * Copyright (c) 2024 GDevelop Community
 * This project is released under the MIT License.
 */

#include "MapObject.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

MapObject::MapObject()
    : defaultWidth(200),
      defaultHeight(200),
      zoom(0.1),
      stayOnScreen(true),
      mode("Minimap"),
      shape("Rectangle"),
      backgroundImage(""),
      frameImage(""),
      backgroundColor("0;0;0"),
      backgroundOpacity(0.7),
      borderColor("255;255;255"),
      borderWidth(2),
      playerMarkerImage(""),
      playerColor("0;255;0"),
      playerSize(12),
      enemyMarkerImage(""),
      enemyColor("255;0;0"),
      enemySize(8),
      itemMarkerImage(""),
      itemColor("255;255;0"),
      itemSize(6),
      showObstacles(true),
      obstacleColor("128;128;128"),
      obstacleOpacity(0.5),
      useObjectShape(true),
      autoDetectBounds(true) {}

std::map<gd::String, gd::PropertyDescriptor> MapObject::GetProperties()
    const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  // Layout (ungrouped, for compact row layout)
  properties["mode"]
      .SetValue(mode)
      .SetType("Choice")
      .AddChoice("Minimap", _("Minimap"))
      .AddChoice("WorldMap", _("WorldMap"))
      .SetLabel(_("Map mode"))
      .SetGroup("");

  properties["shape"]
      .SetValue(shape)
      .SetType("Choice")
      .AddChoice("Rectangle", _("Rectangle"))
      .AddChoice("Circle", _("Circle"))
      .SetLabel(_("Map shape"))
      .SetGroup("");

  properties["width"]
      .SetValue(gd::String::From(defaultWidth))
      .SetType("Number")
      .SetLabel(_("Default width (in pixels)"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup("");

  properties["height"]
      .SetValue(gd::String::From(defaultHeight))
      .SetType("Number")
      .SetLabel(_("Default height (in pixels)"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup("");

  properties["zoom"]
      .SetValue(gd::String::From(zoom))
      .SetType("Number")
      .SetLabel(_("Zoom level"))
      .SetGroup("");

  // Visual
  properties["backgroundImage"]
      .SetValue(backgroundImage)
      .SetType("resource")
      .AddExtraInfo("image")
      .SetLabel(_("Background image"))
      .SetGroup(_("Visual"));

  properties["frameImage"]
      .SetValue(frameImage)
      .SetType("resource")
      .AddExtraInfo("image")
      .SetLabel(_("Frame image"))
      .SetGroup(_("Visual"));

  properties["backgroundColor"]
      .SetValue(backgroundColor)
      .SetType("color")
      .SetLabel(_("Background color"))
      .SetGroup(_("Visual"));

  properties["backgroundOpacity"]
      .SetValue(gd::String::From(backgroundOpacity))
      .SetType("Number")
      .SetLabel(_("Background opacity (0-1)"))
      .SetGroup(_("Visual"));

  properties["borderColor"]
      .SetValue(borderColor)
      .SetType("color")
      .SetLabel(_("Border color"))
      .SetGroup(_("Visual"));

  properties["borderWidth"]
      .SetValue(gd::String::From(borderWidth))
      .SetType("Number")
      .SetLabel(_("Border width"))
      .SetGroup(_("Visual"));

  // Obstacles
  properties["showObstacles"]
      .SetValue(showObstacles ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Show obstacles"))
      .SetGroup(_("Obstacles"));

  properties["useObjectShape"]
      .SetValue(useObjectShape ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Use object shape for obstacles"))
      .SetGroup(_("Obstacles"));

  properties["obstacleOpacity"]
      .SetValue(gd::String::From(obstacleOpacity))
      .SetType("Number")
      .SetLabel(_("Obstacle opacity (0-1)"))
      .SetGroup(_("Obstacles"));

  // Advanced
  properties["autoDetectBounds"]
      .SetValue(autoDetectBounds ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Auto-detect level bounds"))
      .SetGroup("");

  // No update rate field: map updates every frame

  return properties;
}

bool MapObject::UpdateProperty(const gd::String& name,
                                    const gd::String& value) {
  if (name == "mode") {
    mode = value;
    return true;
  }
  if (name == "shape") {
    shape = value;
    return true;
  }
  if (name == "width") {
    defaultWidth = value.To<double>();
    return true;
  }
  if (name == "height") {
    defaultHeight = value.To<double>();
    return true;
  }
  if (name == "zoom") {
    zoom = value.To<double>();
    return true;
  }
  if (name == "stayOnScreen") {
    stayOnScreen = value == "1" || value == "true";
    return true;
  }
  if (name == "backgroundImage") {
    backgroundImage = value;
    return true;
  }
  if (name == "frameImage") {
    frameImage = value;
    return true;
  }
  if (name == "backgroundColor") {
    backgroundColor = value;
    return true;
  }
  if (name == "backgroundOpacity") {
    backgroundOpacity = value.To<double>();
    return true;
  }
  if (name == "borderColor") {
    borderColor = value;
    return true;
  }
  if (name == "borderWidth") {
    borderWidth = value.To<double>();
    return true;
  }
  if (name == "playerMarkerImage") {
    playerMarkerImage = value;
    return true;
  }
  if (name == "playerColor") {
    playerColor = value;
    return true;
  }
  if (name == "playerSize") {
    playerSize = value.To<double>();
    return true;
  }
  if (name == "enemyMarkerImage") {
    enemyMarkerImage = value;
    return true;
  }
  if (name == "enemyColor") {
    enemyColor = value;
    return true;
  }
  if (name == "enemySize") {
    enemySize = value.To<double>();
    return true;
  }
  if (name == "itemMarkerImage") {
    itemMarkerImage = value;
    return true;
  }
  if (name == "itemColor") {
    itemColor = value;
    return true;
  }
  if (name == "itemSize") {
    itemSize = value.To<double>();
    return true;
  }
  if (name == "showObstacles") {
    showObstacles = value == "1" || value == "true";
    return true;
  }
  if (name == "obstacleColor") {
    obstacleColor = value;
    return true;
  }
  if (name == "obstacleOpacity") {
    obstacleOpacity = value.To<double>();
    return true;
  }
  if (name == "useObjectShape") {
    useObjectShape = value == "1" || value == "true";
    return true;
  }
  if (name == "autoDetectBounds") {
    autoDetectBounds = value == "1" || value == "true";
    return true;
  }
  // No update rate property

  return false;
}

void MapObject::DoSerializeTo(gd::SerializerElement& element) const {
  auto& content = element.AddChild("content");
  content.SetAttribute("mode", mode);
  content.SetAttribute("shape", shape);
  content.SetAttribute("width", defaultWidth);
  content.SetAttribute("height", defaultHeight);
  content.SetAttribute("zoom", zoom);
  content.SetAttribute("stayOnScreen", stayOnScreen);
  content.SetAttribute("backgroundImage", backgroundImage);
  content.SetAttribute("frameImage", frameImage);
  content.SetAttribute("backgroundColor", backgroundColor);
  content.SetAttribute("backgroundOpacity", backgroundOpacity);
  content.SetAttribute("borderColor", borderColor);
  content.SetAttribute("borderWidth", borderWidth);
  content.SetAttribute("playerMarkerImage", playerMarkerImage);
  content.SetAttribute("playerColor", playerColor);
  content.SetAttribute("playerSize", playerSize);
  content.SetAttribute("enemyMarkerImage", enemyMarkerImage);
  content.SetAttribute("enemyColor", enemyColor);
  content.SetAttribute("enemySize", enemySize);
  content.SetAttribute("itemMarkerImage", itemMarkerImage);
  content.SetAttribute("itemColor", itemColor);
  content.SetAttribute("itemSize", itemSize);
  content.SetAttribute("showObstacles", showObstacles);
  content.SetAttribute("obstacleColor", obstacleColor);
  content.SetAttribute("obstacleOpacity", obstacleOpacity);
  content.SetAttribute("useObjectShape", useObjectShape);
  content.SetAttribute("autoDetectBounds", autoDetectBounds);
}

void MapObject::DoUnserializeFrom(gd::Project& project,
                                         const gd::SerializerElement& element) {
  auto& content = element.GetChild("content");
  mode = content.GetStringAttribute("mode", "Minimap");
  shape = content.GetStringAttribute("shape", "Rectangle");
  defaultWidth = content.GetDoubleAttribute("width", 200);
  defaultHeight = content.GetDoubleAttribute("height", 200);
  zoom = content.GetDoubleAttribute("zoom", 0.1);
  stayOnScreen = content.GetBoolAttribute("stayOnScreen", true);
  backgroundImage = content.GetStringAttribute("backgroundImage", "");
  frameImage = content.GetStringAttribute("frameImage", "");
  backgroundColor = content.GetStringAttribute("backgroundColor", "0;0;0");
  backgroundOpacity = content.GetDoubleAttribute("backgroundOpacity", 0.7);
  borderColor = content.GetStringAttribute("borderColor", "255;255;255");
  borderWidth = content.GetDoubleAttribute("borderWidth", 2);
  playerMarkerImage = content.GetStringAttribute("playerMarkerImage", "");
  playerColor = content.GetStringAttribute("playerColor", "0;255;0");
  playerSize = content.GetDoubleAttribute("playerSize", 12);
  enemyMarkerImage = content.GetStringAttribute("enemyMarkerImage", "");
  enemyColor = content.GetStringAttribute("enemyColor", "255;0;0");
  enemySize = content.GetDoubleAttribute("enemySize", 8);
  itemMarkerImage = content.GetStringAttribute("itemMarkerImage", "");
  itemColor = content.GetStringAttribute("itemColor", "255;255;0");
  itemSize = content.GetDoubleAttribute("itemSize", 6);
  showObstacles = content.GetBoolAttribute("showObstacles", true);
  obstacleColor = content.GetStringAttribute("obstacleColor", "128;128;128");
  obstacleOpacity = content.GetDoubleAttribute("obstacleOpacity", 0.5);
  useObjectShape = content.GetBoolAttribute("useObjectShape", true);
  autoDetectBounds = content.GetBoolAttribute("autoDetectBounds", true);
}
