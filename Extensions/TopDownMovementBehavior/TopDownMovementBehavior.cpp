/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-present Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "TopDownMovementBehavior.h"

#include <algorithm>
#include <cmath>
#include <iostream>
#include <map>
#include <memory>
#include <set>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/MeasurementUnit.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

void TopDownMovementBehavior::InitializeContent(
    gd::SerializerElement& behaviorContent) {
  behaviorContent.SetAttribute("allowDiagonals", true);
  behaviorContent.SetAttribute("acceleration", 400);
  behaviorContent.SetAttribute("deceleration", 800);
  behaviorContent.SetAttribute("maxSpeed", 200);
  behaviorContent.SetAttribute("angularMaxSpeed", 180);
  behaviorContent.SetAttribute("rotateObject", true);
  behaviorContent.SetAttribute("angleOffset", 0);
  behaviorContent.SetAttribute("ignoreDefaultControls", false);
  behaviorContent.SetAttribute("viewpoint", "TopDown");
  behaviorContent.SetAttribute("customIsometryAngle", 30);
  behaviorContent.SetAttribute("movementAngleOffset", 0);
}

std::map<gd::String, gd::PropertyDescriptor>
TopDownMovementBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties["AllowDiagonals"]
      .SetLabel(_("Allow diagonals"))
      .SetGroup(_("Movement"))
      .SetValue(behaviorContent.GetBoolAttribute("allowDiagonals") ? "true"
                                                                   : "false")
      .SetType("Boolean");
  properties["Acceleration"]
      .SetLabel(_("Acceleration"))
      .SetGroup(_("Movement"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("acceleration")));
  properties["Deceleration"]
      .SetLabel(_("Deceleration"))
      .SetGroup(_("Movement"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelAcceleration())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("deceleration")));
  properties["MaxSpeed"]
      .SetLabel(_("Max. speed"))
      .SetGroup(_("Movement"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixelSpeed())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("maxSpeed")));
  properties["AngularMaxSpeed"]
      .SetLabel(_("Rotation speed"))
      .SetGroup(_("Rotation"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetAngularSpeed())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("angularMaxSpeed")));
  properties["RotateObject"]
      .SetLabel(_("Rotate object"))
      .SetGroup(_("Rotation"))
      .SetValue(behaviorContent.GetBoolAttribute("rotateObject") ? "true"
                                                                 : "false")
      .SetType("Boolean");
  properties["AngleOffset"]
      .SetLabel(_("Angle offset"))
      .SetGroup(_("Rotation"))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetValue(
          gd::String::From(behaviorContent.GetDoubleAttribute("angleOffset")));
  properties["IgnoreDefaultControls"]
      .SetLabel(_("Default controls"))
      .SetValue(behaviorContent.GetBoolAttribute("ignoreDefaultControls")
                    ? "false"
                    : "true")
      .SetType("Boolean");

  gd::String viewpoint = behaviorContent.GetStringAttribute("viewpoint");
  gd::String viewpointStr = _("Top-Down");
  if (viewpoint == "TopDown")
    viewpointStr = _("Top-Down");
  else if (viewpoint == "PixelIsometry")
    viewpointStr = _("Isometry 2:1 (26.565°)");
  else if (viewpoint == "TrueIsometry")
    viewpointStr = _("True Isometry (30°)");
  else if (viewpoint == "CustomIsometry")
    viewpointStr = _("Custom Isometry");
  properties["Viewpoint"]
      .SetLabel(_("Viewpoint"))
      .SetGroup(_("Viewpoint"))
      .SetAdvanced()
      .SetValue(viewpointStr)
      .SetType("Choice")
      .AddExtraInfo(_("Top-Down"))
      .AddExtraInfo(_("Isometry 2:1 (26.565°)"))
      .AddExtraInfo(_("True Isometry (30°)"))
      .AddExtraInfo(_("Custom Isometry"));
  properties["CustomIsometryAngle"]
      .SetLabel(_("Custom isometry angle (between 1deg and 44deg)"))
      .SetGroup(_("Viewpoint"))
      .SetAdvanced()
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("customIsometryAngle")))
      .SetDescription(_("If you choose \"Custom Isometry\", this allows to "
                        "specify the angle of your isometry projection."));
  properties["MovementAngleOffset"]
      .SetLabel(_("Movement angle offset"))
      .SetGroup(_("Viewpoint"))
      .SetAdvanced()
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetDegreeAngle())
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("movementAngleOffset")))
      .SetDescription(_(
          "Usually 0, unless you choose an *Isometry* viewpoint in which case "
          "-45 is recommended."));

  return properties;
}

bool TopDownMovementBehavior::UpdateProperty(
    gd::SerializerElement& behaviorContent,
    const gd::String& name,
    const gd::String& value) {
  if (name == "IgnoreDefaultControls") {
    behaviorContent.SetAttribute("ignoreDefaultControls", (value == "0"));
    return true;
  }
  if (name == "AllowDiagonals") {
    behaviorContent.SetAttribute("allowDiagonals", (value != "0"));
    return true;
  }
  if (name == "RotateObject") {
    behaviorContent.SetAttribute("rotateObject", (value != "0"));
    return true;
  }
  if (name == "Viewpoint") {
    // Fix the offset angle when switching between top-down and isometry
    const gd::String& oldValue =
        behaviorContent.GetStringAttribute("viewpoint", "TopDown", "");
    if (value == _("Top-Down") && oldValue != "TopDown") {
      behaviorContent.SetAttribute(
          "movementAngleOffset",
          behaviorContent.GetDoubleAttribute("movementAngleOffset", 0, "") +
              45);
    } else if (value != _("Top-Down") && oldValue == "TopDown") {
      behaviorContent.SetAttribute(
          "movementAngleOffset",
          behaviorContent.GetDoubleAttribute("movementAngleOffset", 45, "") -
              45);
    }

    if (value == _("Isometry 2:1 (26.565°)"))
      behaviorContent.SetAttribute("viewpoint", "PixelIsometry");
    else if (value == _("True Isometry (30°)"))
      behaviorContent.SetAttribute("viewpoint", "TrueIsometry");
    else if (value == _("Custom Isometry"))
      behaviorContent.SetAttribute("viewpoint", "CustomIsometry");
    else
      behaviorContent.SetAttribute("viewpoint", "TopDown");
    return true;
  }
  if (name == "MovementAngleOffset") {
    behaviorContent.SetAttribute("movementAngleOffset", value.To<float>());
  }

  if (value.To<float>() < 0) return false;

  if (name == "Acceleration")
    behaviorContent.SetAttribute("acceleration", value.To<float>());
  else if (name == "Deceleration")
    behaviorContent.SetAttribute("deceleration", value.To<float>());
  else if (name == "MaxSpeed")
    behaviorContent.SetAttribute("maxSpeed", value.To<float>());
  else if (name == "AngularMaxSpeed")
    behaviorContent.SetAttribute("angularMaxSpeed", value.To<float>());
  else if (name == "AngleOffset")
    behaviorContent.SetAttribute("angleOffset", value.To<float>());
  else if (name == "CustomIsometryAngle") {
    if (value.To<float>() < 1 || value.To<float>() > 44) return false;
    behaviorContent.SetAttribute("customIsometryAngle", value.To<float>());
  } else
    return false;

  return true;
}
