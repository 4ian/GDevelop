/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-present Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "TopDownMovementBehavior.h"

#include <algorithm>
#include <cmath>
#include <iostream>
#include <memory>
#include <set>

#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Serialization/SerializerElement.h"
#if defined(GD_IDE_ONLY)
#include <map>

#include "GDCore/Project/PropertyDescriptor.h"
#endif

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

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor>
TopDownMovementBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties[_("Allows diagonals")].SetGroup(_("Movement"))
      .SetValue(behaviorContent.GetBoolAttribute("allowDiagonals") ? "true"
                                                                   : "false")
      .SetType("Boolean");
  properties[_("Acceleration")].SetGroup(_("Movement")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("acceleration")));
  properties[_("Deceleration")].SetGroup(_("Movement")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("deceleration")));
  properties[_("Max. speed")].SetGroup(_("Movement")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("maxSpeed")));
  properties[_("Rotate speed")].SetGroup(_("Rotation")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("angularMaxSpeed")));
  properties[_("Rotate object")]
      .SetGroup(_("Rotation"))
      .SetValue(behaviorContent.GetBoolAttribute("rotateObject") ? "true"
                                                                 : "false")
      .SetType("Boolean");
  properties[_("Angle offset")].SetGroup(_("Rotation")).SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("angleOffset")));
  properties[_("Default controls")]
      .SetValue(behaviorContent.GetBoolAttribute("ignoreDefaultControls")
                    ? "false"
                    : "true")
      .SetType("Boolean");

  gd::String viewpoint = behaviorContent.GetStringAttribute("viewpoint");
  gd::String viewpointStr = _("Viewpoint");
  if (viewpoint == "TopDown")
    viewpointStr = _("Top-Down");
  else if (viewpoint == "PixelIsometry")
    viewpointStr = _("Isometry 2:1 (26.565°)");
  else if (viewpoint == "TrueIsometry")
    viewpointStr = _("True Isometry (30°)");
  else if (viewpoint == "CustomIsometry")
    viewpointStr = _("Custom Isometry");
  properties[_("Viewpoint")]
      .SetGroup(_("Viewpoint"))
      .SetValue(viewpointStr)
      .SetType("Choice")
      .AddExtraInfo(_("Top-Down"))
      .AddExtraInfo(_("Isometry 2:1 (26.565°)"))
      .AddExtraInfo(_("True Isometry (30°)"))
      .AddExtraInfo(_("Custom Isometry"));
  properties[_("Custom isometry angle")]
      .SetGroup(_("Viewpoint"))
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("customIsometryAngle")))
      .SetDescription(_("If you choose \"Custom Isometry\", this allows to "
                        "specify the angle of your isometry projection."));
  properties[_("Movement angle offset")]
      .SetGroup(_("Viewpoint"))
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
  if (name == _("Default controls")) {
    behaviorContent.SetAttribute("ignoreDefaultControls", (value == "0"));
    return true;
  }
  if (name == _("Allows diagonals")) {
    behaviorContent.SetAttribute("allowDiagonals", (value != "0"));
    return true;
  }
  if (name == _("Rotate object")) {
    behaviorContent.SetAttribute("rotateObject", (value != "0"));
    return true;
  }
  if (name == _("Viewpoint")) {
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
  if (name == _("Movement angle offset")) {
    behaviorContent.SetAttribute("movementAngleOffset", value.To<float>());
  }

  if (value.To<float>() < 0) return false;

  if (name == _("Acceleration"))
    behaviorContent.SetAttribute("acceleration", value.To<float>());
  else if (name == _("Deceleration"))
    behaviorContent.SetAttribute("deceleration", value.To<float>());
  else if (name == _("Max. speed"))
    behaviorContent.SetAttribute("maxSpeed", value.To<float>());
  else if (name == _("Rotate speed"))
    behaviorContent.SetAttribute("angularMaxSpeed", value.To<float>());
  else if (name == _("Angle offset"))
    behaviorContent.SetAttribute("angleOffset", value.To<float>());
  else if (name == _("Custom isometry angle")) {
    if (value.To<float>() < 1 || value.To<float>() > 44) return false;
    behaviorContent.SetAttribute("customIsometryAngle", value.To<float>());
  } else
    return false;

  return true;
}

#endif
