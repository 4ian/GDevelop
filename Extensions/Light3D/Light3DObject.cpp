/**
 
 GDevelop - Light3D Object Extension
 Copyright (c) 2024 GDevelop Team
 This project is released under the MIT License.
 */

#include "Light3DObject.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Project/MeasurementUnit.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

using namespace std;

Light3DObject::Light3DObject()
    : lightType("Point"),
      enabled(true),
      color("255;255;255"),
      intensity(1.0),
      distance(0),
      decay(2.0),
      angle(45),
      penumbra(0.0),
      castShadow(false),
      shadowMapSize(1024),
      shadowBias(-0.0001),
      shadowNormalBias(0.02),
      shadowRadius(0),
      shadowNear(0.5),
      shadowFar(50),
      shadowFocus(1.0),
      flickerEnabled(false),
      flickerSpeed(1.0),
      z(0) {}

Light3DObject::~Light3DObject() {};

bool Light3DObject::UpdateProperty(const gd::String& propertyName,
                                const gd::String& newValue) {
  // Helper function to convert string to boolean (accepts "true", "false", "1", "0")
  auto toBool = [](const gd::String& value) -> bool {
    return value == "true" || value == "1";
  };

  if (propertyName == "lightType") {
    lightType = newValue;
    return true;
  }
  if (propertyName == "enabled") {
    enabled = toBool(newValue);
    return true;
  }
  if (propertyName == "color") {
    color = newValue;
    return true;
  }
  if (propertyName == "intensity") {
    intensity = newValue.To<double>();
    return true;
  }
  if (propertyName == "distance") {
    distance = newValue.To<double>();
    return true;
  }
  if (propertyName == "decay") {
    decay = newValue.To<double>();
    return true;
  }
  if (propertyName == "angle") {
    angle = newValue.To<double>();
    return true;
  }
  if (propertyName == "penumbra") {
    penumbra = newValue.To<double>();
    return true;
  }
  if (propertyName == "castShadow") {
    castShadow = toBool(newValue);
    return true;
  }
  if (propertyName == "shadowMapSize") {
    shadowMapSize = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowBias") {
    shadowBias = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowNormalBias") {
    shadowNormalBias = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowRadius") {
    shadowRadius = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowNear") {
    shadowNear = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowFar") {
    shadowFar = newValue.To<double>();
    return true;
  }
  if (propertyName == "shadowFocus") {
    shadowFocus = newValue.To<double>();
    return true;
  }
  if (propertyName == "flickerEnabled") {
    flickerEnabled = toBool(newValue);
    return true;
  }
  if (propertyName == "flickerSpeed") {
    flickerSpeed = newValue.To<double>();
    return true;
  }
  if (propertyName == "z") {
    z = newValue.To<double>();
    return true;
  }

  return false;
}

std::map<gd::String, gd::PropertyDescriptor> Light3DObject::GetProperties() const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  // General - Light Type
  properties["lightType"]
      .SetValue(lightType)
      .SetType("choice")
      .AddChoice("Point", _("Point Light"))
      .AddChoice("Spot", _("Spot Light"))
      .SetLabel(_("Light Type"))
      .SetGroup(_("General"));

  // General - Enabled
  properties["enabled"]
      .SetValue(enabled ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Enabled"))
      .SetGroup(_("General"));

  // General - Color
  properties["color"]
      .SetValue(color)
      .SetType("color")
      .SetLabel(_("Color"))
      .SetGroup(_("General"));

  // General - Intensity
  properties["intensity"]
      .SetValue(gd::String::From(intensity))
      .SetType("number")
      .SetLabel(_("Intensity"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("General"));

  // Position - Z Position
  properties["z"]
      .SetValue(gd::String::From(z))
      .SetType("number")
      .SetLabel(_("Z Position"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Position"));

  // Light Settings - Distance
  properties["distance"]
      .SetValue(gd::String::From(distance))
      .SetType("number")
      .SetLabel(_("Distance"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Light Settings"));

  // Light Settings - Decay
  properties["decay"]
      .SetValue(gd::String::From(decay))
      .SetType("number")
      .SetLabel(_("Decay"))
      .SetGroup(_("Light Settings"));

  // Light Settings - Angle (only for Spot Light)
  properties["angle"]
      .SetValue(gd::String::From(angle))
      .SetType("number")
      .SetLabel(_("Angle"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetGroup(_("Light Settings"));

  // Light Settings - Penumbra (only for Spot Light)
  properties["penumbra"]
      .SetValue(gd::String::From(penumbra))
      .SetType("number")
      .SetLabel(_("Penumbra"))
      .SetGroup(_("Light Settings"));

  // Shadows - Cast Shadow
  properties["castShadow"]
      .SetValue(castShadow ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Cast Shadow"))
      .SetGroup(_("Shadows"));

  // Shadows - Shadow Map Size
  properties["shadowMapSize"]
      .SetValue(gd::String::From(shadowMapSize))
      .SetType("number")
      .SetLabel(_("Shadow Map Size"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Shadows"));

  // Shadows - Shadow Bias
  properties["shadowBias"]
      .SetValue(gd::String::From(shadowBias))
      .SetType("number")
      .SetLabel(_("Shadow Bias"))
      .SetGroup(_("Shadows"));

  // Shadows - Shadow Normal Bias
  properties["shadowNormalBias"]
      .SetValue(gd::String::From(shadowNormalBias))
      .SetType("number")
      .SetLabel(_("Shadow Normal Bias"))
      .SetGroup(_("Shadows"));

  // Shadows - Shadow Radius
  properties["shadowRadius"]
      .SetValue(gd::String::From(shadowRadius))
      .SetType("number")
      .SetLabel(_("Shadow Radius"))
      .SetGroup(_("Shadows"));

  // Shadows - Shadow Near
  properties["shadowNear"]
      .SetValue(gd::String::From(shadowNear))
      .SetType("number")
      .SetLabel(_("Shadow Near"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Shadows"));

  // Shadows - Shadow Far
  properties["shadowFar"]
      .SetValue(gd::String::From(shadowFar))
      .SetType("number")
      .SetLabel(_("Shadow Far"))
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetGroup(_("Shadows"));

  // Shadows - Shadow Focus (only for Spot Light)
  properties["shadowFocus"]
      .SetValue(gd::String::From(shadowFocus))
      .SetType("number")
      .SetLabel(_("Shadow Focus"))
      .SetGroup(_("Shadows"));

  // Effects - Flicker Enabled
  properties["flickerEnabled"]
      .SetValue(flickerEnabled ? "true" : "false")
      .SetType("boolean")
      .SetLabel(_("Flicker Enabled"))
      .SetGroup(_("Effects"));

  // Effects - Flicker Speed
  properties["flickerSpeed"]
      .SetValue(gd::String::From(flickerSpeed))
      .SetType("number")
      .SetLabel(_("Flicker Speed"))
      .SetGroup(_("Effects"));

  return properties;
}

void Light3DObject::DoUnserializeFrom(gd::Project& project,
                                   const gd::SerializerElement& element) {
  auto& content = element.GetChild("content");

  SetLightType(content.GetStringAttribute("lightType", "Point"));
  SetEnabled(content.GetBoolAttribute("enabled", true));
  SetColor(content.GetStringAttribute("color", "255;255;255"));
  SetIntensity(content.GetDoubleAttribute("intensity", 1.0));
  SetDistance(content.GetDoubleAttribute("distance", 0));
  SetDecay(content.GetDoubleAttribute("decay", 2.0));
  SetAngle(content.GetDoubleAttribute("angle", 45));
  SetPenumbra(content.GetDoubleAttribute("penumbra", 0.0));
  SetCastShadow(content.GetBoolAttribute("castShadow", false));
  SetShadowMapSize(content.GetDoubleAttribute("shadowMapSize", 1024));
  SetShadowBias(content.GetDoubleAttribute("shadowBias", -0.0001));
  SetShadowNormalBias(content.GetDoubleAttribute("shadowNormalBias", 0.02));
  SetShadowRadius(content.GetDoubleAttribute("shadowRadius", 0));
  SetShadowNear(content.GetDoubleAttribute("shadowNear", 0.5));
  SetShadowFar(content.GetDoubleAttribute("shadowFar", 50));
  SetShadowFocus(content.GetDoubleAttribute("shadowFocus", 1.0));
  SetFlickerEnabled(content.GetBoolAttribute("flickerEnabled", false));
  SetFlickerSpeed(content.GetDoubleAttribute("flickerSpeed", 1.0));
  SetZ(content.GetDoubleAttribute("z", 0));
}

void Light3DObject::DoSerializeTo(gd::SerializerElement& element) const {
  auto& content = element.AddChild("content");
  
  content.SetAttribute("lightType", GetLightType());
  content.SetAttribute("enabled", IsEnabled());
  content.SetAttribute("color", GetColor());
  content.SetAttribute("intensity", GetIntensity());
  content.SetAttribute("distance", GetDistance());
  content.SetAttribute("decay", GetDecay());
  content.SetAttribute("angle", GetAngle());
  content.SetAttribute("penumbra", GetPenumbra());
  content.SetAttribute("castShadow", GetCastShadow());
  content.SetAttribute("shadowMapSize", GetShadowMapSize());
  content.SetAttribute("shadowBias", GetShadowBias());
  content.SetAttribute("shadowNormalBias", GetShadowNormalBias());
  content.SetAttribute("shadowRadius", GetShadowRadius());
  content.SetAttribute("shadowNear", GetShadowNear());
  content.SetAttribute("shadowFar", GetShadowFar());
  content.SetAttribute("shadowFocus", GetShadowFocus());
  content.SetAttribute("flickerEnabled", GetFlickerEnabled());
  content.SetAttribute("flickerSpeed", GetFlickerSpeed());
  content.SetAttribute("z", GetZ());
}
