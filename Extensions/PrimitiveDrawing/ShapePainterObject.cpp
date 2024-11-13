/**

GDevelop - Primitive Drawing Extension
Copyright (c) 2008-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ShapePainterObject.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

ShapePainterObjectBase::ShapePainterObjectBase()
    : fillOpacity(255),
      fillColor("255;255;255"),
      outlineSize(1),
      outlineOpacity(255),
      outlineColor("0;0;0"),
      clearBetweenFrames(true),
      absoluteCoordinates(false),
      antialiasing("none") {}

ShapePainterObject::ShapePainterObject() {}

void ShapePainterObjectBase::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  fillOpacity =
      element.GetChild("fillOpacity", 0, "FillOpacity").GetValue().GetInt();
  outlineSize =
      element.GetChild("outlineSize", 0, "OutlineSize").GetValue().GetInt();
  outlineOpacity = element.GetChild("outlineOpacity", 0, "OutlineOpacity")
                       .GetValue()
                       .GetInt();

  const auto& fillColorElement = element.GetChild("fillColor", 0, "FillColor");
  if (fillColorElement.GetValue().IsString()) {
    fillColor = fillColorElement.GetStringValue();
  } else {
    // Compatibility with GD <= 5.4.212
    int fillColorR = fillColorElement.GetIntAttribute("r");
    int fillColorG = fillColorElement.GetIntAttribute("g");
    int fillColorB = fillColorElement.GetIntAttribute("b");
    fillColor = gd::String::From(fillColorR) + ";" +
                gd::String::From(fillColorG) + ";" +
                gd::String::From(fillColorB);
    // end of compatibility code
  }

  const auto& outlineColorElement =
      element.GetChild("outlineColor", 0, "OutlineColor");
  if (outlineColorElement.GetValue().IsString()) {
    outlineColor = outlineColorElement.GetStringValue();
  } else {
    // Compatibility with GD <= 5.4.212
    int outlineColorR = outlineColorElement.GetIntAttribute("r");
    int outlineColorG = outlineColorElement.GetIntAttribute("g");
    int outlineColorB = outlineColorElement.GetIntAttribute("b");
    outlineColor = gd::String::From(outlineColorR) + ";" +
                   gd::String::From(outlineColorG) + ";" +
                   gd::String::From(outlineColorB);
    // end of compatibility code
  }

  absoluteCoordinates =
      element.GetChild("absoluteCoordinates", 0, "AbsoluteCoordinates")
          .GetValue()
          .GetBool();
  clearBetweenFrames =
      element.HasChild("clearBetweenFrames")
          ? element.GetChild("clearBetweenFrames").GetValue().GetBool()
          : true;

  antialiasing = element.HasChild("antialiasing")
                     ? element.GetChild("antialiasing").GetValue().GetString()
                     : "none";
}

void ShapePainterObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  ShapePainterObjectBase::DoUnserializeFrom(project, element);
}

void ShapePainterObjectBase::DoSerializeTo(
    gd::SerializerElement& element) const {
  element.AddChild("fillOpacity").SetValue(fillOpacity);
  element.AddChild("outlineSize").SetValue(outlineSize);
  element.AddChild("outlineOpacity").SetValue(outlineOpacity);
  element.AddChild("absoluteCoordinates").SetValue(absoluteCoordinates);
  element.AddChild("clearBetweenFrames").SetValue(clearBetweenFrames);
  element.AddChild("antialiasing").SetValue(antialiasing);

  {
    auto rgb = fillColor.Split(';');
    auto& fillColorElement = element.AddChild("fillColor");
    if (rgb.size() == 3) {
      // Still serialize the old particle color components for compatibility
      // with GDevelop <= 5.4.212. Remove this in a few releases (or when hex
      // strings are accepted for the color).
      fillColorElement.AddChild("r").SetValue(rgb[0].To<double>());
      fillColorElement.AddChild("g").SetValue(rgb[1].To<double>());
      fillColorElement.AddChild("b").SetValue(rgb[2].To<double>());
      // end of compatibility code
    } else {
      fillColorElement.SetValue(fillColor);
    }
  }
  {
    auto rgb = outlineColor.Split(';');
    auto& outlineColorElement = element.AddChild("outlineColor");
    if (rgb.size() == 3) {
      // Still serialize the old particle color components for compatibility
      // with GDevelop <= 5.4.212. Remove this in a few releases (or when hex
      // strings are accepted for the color).
      outlineColorElement.AddChild("r").SetValue(rgb[0].To<double>());
      outlineColorElement.AddChild("g").SetValue(rgb[1].To<double>());
      outlineColorElement.AddChild("b").SetValue(rgb[2].To<double>());
      // end of compatibility code
    } else {
      outlineColorElement.SetValue(outlineColor);
    }
  }
}

void ShapePainterObject::DoSerializeTo(gd::SerializerElement& element) const {
  ShapePainterObjectBase::DoSerializeTo(element);
}

void ShapePainterObjectBase::SetFillOpacity(double val) {
  if (val > 255)
    val = 255;
  else if (val < 0)
    val = 0;

  fillOpacity = val;
}

void ShapePainterObjectBase::SetOutlineOpacity(double val) {
  if (val > 255)
    val = 255;
  else if (val < 0)
    val = 0;

  outlineOpacity = val;
}

bool ShapePainterObject::UpdateProperty(const gd::String& propertyName,
                                        const gd::String& newValue) {
  if (propertyName == "fillOpacity") {
    SetFillOpacity(newValue.To<double>());
    return true;
  }
  if (propertyName == "fillColor") {
    SetFillColor(newValue);
    return true;
  }
  if (propertyName == "outlineColor") {
    SetOutlineColor(newValue);
    return true;
  }
  if (propertyName == "outlineOpacity") {
    SetOutlineOpacity(newValue.To<double>());
    return true;
  }
  if (propertyName == "outlineSize") {
    SetOutlineSize(newValue.To<double>());
    return true;
  }

  if (propertyName == "absoluteCoordinates") {
    if (newValue == "1")
      SetCoordinatesAbsolute();
    else
      SetCoordinatesRelative();
    return true;
  }

  if (propertyName == "clearBetweenFrames") {
    SetClearBetweenFrames(newValue == "1");
    return true;
  }

  if (propertyName == "antialiasing") {
    SetAntialiasing(newValue);
    return true;
  }

  return false;
}

std::map<gd::String, gd::PropertyDescriptor> ShapePainterObject::GetProperties()
    const {
  std::map<gd::String, gd::PropertyDescriptor> objectProperties;

  objectProperties["fillColor"]
      .SetValue(GetFillColor())
      .SetType("color")
      .SetLabel(_("Fill color"))
      .SetGroup(_("Fill"));

  objectProperties["fillOpacity"]
      .SetValue(gd::String::From(GetFillOpacity()))
      .SetType("number")
      .SetLabel(_("Fill opacity"))
      .SetGroup(_("Fill"));

  objectProperties["outlineColor"]
      .SetValue(GetOutlineColor())
      .SetType("color")
      .SetLabel(_("Outline color"))
      .SetGroup(_("Outline"));

  objectProperties["outlineOpacity"]
      .SetValue(gd::String::From(GetOutlineOpacity()))
      .SetType("number")
      .SetLabel(_("Outline opacity"))
      .SetGroup(_("Outline"));

  objectProperties["outlineSize"]
      .SetValue(gd::String::From(GetOutlineSize()))
      .SetType("number")
      .SetLabel(_("Outline size"))
      .SetGroup(_("Outline"));

  objectProperties["absoluteCoordinates"]
      .SetValue(AreCoordinatesAbsolute() ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Use absolute coordinates"))
      .SetGroup(_("Drawing"));

  objectProperties["clearBetweenFrames"]
      .SetValue(IsClearedBetweenFrames() ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Clear drawing at each frame"))
      .SetGroup(_("Drawing"))
      .SetDescription(_("When activated, clear the previous render at each "
                        "frame. Otherwise, shapes are staying on the screen "
                        "until you clear manually the object in events."));

  objectProperties["antialiasing"]
      .SetValue(GetAntialiasing())
      .SetType("choice")
      .AddExtraInfo("none")
      .AddExtraInfo("low")
      .AddExtraInfo("medium")
      .AddExtraInfo("high")
      .SetGroup(_("Drawing"))
      .SetLabel(_("Antialiasing"))
      .SetDescription(_("Antialiasing mode"));

  return objectProperties;
}
