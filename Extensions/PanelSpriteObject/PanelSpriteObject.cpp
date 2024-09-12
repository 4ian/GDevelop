/**

GDevelop - Panel Sprite Extension
Copyright (c) 2012-2016 Victor Levasseur (victorlevasseur01@orange.fr)
This project is released under the MIT License.
*/

#include "GDCore/Tools/Localization.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "PanelSpriteObject.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#endif

using namespace std;

PanelSpriteObject::PanelSpriteObject()
    : textureName(""),
      width(32),
      height(32),
      leftMargin(0),
      topMargin(0),
      rightMargin(0),
      bottomMargin(0) {}

PanelSpriteObject::~PanelSpriteObject() {}

bool PanelSpriteObject::UpdateProperty(const gd::String& propertyName,
                                const gd::String& newValue) {
  if (propertyName == "texture") {
    textureName = newValue;
    return true;
  }
  if (propertyName == "width") {
    SetWidth(newValue.To<double>());
    return true;
  }
  if (propertyName == "height") {
    SetHeight(newValue.To<double>());
    return true;
  }
  if (propertyName == "leftMargin") {
    SetLeftMargin(newValue.To<double>());
    return true;
  }
  if (propertyName == "topMargin") {
    SetTopMargin(newValue.To<double>());
    return true;
  }
  if (propertyName == "rightMargin") {
    SetRightMargin(newValue.To<double>());
    return true;
  }
  if (propertyName == "bottomMargin") {
    SetBottomMargin(newValue.To<double>());
    return true;
  }
  if (propertyName == "tiled") {
    SetTiled(newValue == "1");
    return true;
  }

  return false;
}

std::map<gd::String, gd::PropertyDescriptor> PanelSpriteObject::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> objectProperties;

  objectProperties["texture"]
      .SetValue(textureName)
      .SetType("resource")
      .AddExtraInfo("image")
      .SetLabel(_("Texture"));

  objectProperties["width"]
      .SetValue(gd::String::From(width))
      .SetType("number")
      .SetLabel(_("Width"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Default size"));

  objectProperties["height"]
      .SetValue(gd::String::From(height))
      .SetType("number")
      .SetLabel(_("Height"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Default size"));

  objectProperties["leftMargin"]
      .SetValue(gd::String::From(leftMargin))
      .SetType("number")
      .SetLabel(_("Left"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Margins"));

  objectProperties["topMargin"]
      .SetValue(gd::String::From(topMargin))
      .SetType("number")
      .SetLabel(_("Top"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Margins"));

  objectProperties["rightMargin"]
      .SetValue(gd::String::From(rightMargin))
      .SetType("number")
      .SetLabel(_("Right"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Margins"));

  objectProperties["bottomMargin"]
      .SetValue(gd::String::From(bottomMargin))
      .SetType("number")
      .SetLabel(_("Bottom"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Margins"));

  objectProperties["tiled"]
      .SetValue(tiled ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Repeat borders and center textures (instead of stretching them)"));

  return objectProperties;
}
void PanelSpriteObject::DoUnserializeFrom(
    gd::Project& project, const gd::SerializerElement& element) {
  textureName = element.GetStringAttribute("texture");
  width = element.GetIntAttribute("width", 32);
  height = element.GetIntAttribute("height", 32);
  leftMargin = element.GetIntAttribute("leftMargin");
  topMargin = element.GetIntAttribute("topMargin");
  rightMargin = element.GetIntAttribute("rightMargin");
  bottomMargin = element.GetIntAttribute("bottomMargin");
  tiled = element.GetBoolAttribute("tiled");
}

#if defined(GD_IDE_ONLY)
void PanelSpriteObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("texture", textureName);
  element.SetAttribute("width", width);
  element.SetAttribute("height", height);
  element.SetAttribute("leftMargin", leftMargin);
  element.SetAttribute("topMargin", topMargin);
  element.SetAttribute("rightMargin", rightMargin);
  element.SetAttribute("bottomMargin", bottomMargin);
  element.SetAttribute("tiled", tiled);
}

void PanelSpriteObject::ExposeResources(
    gd::ArbitraryResourceWorker& worker) {
  worker.ExposeImage(textureName);
}
#endif
