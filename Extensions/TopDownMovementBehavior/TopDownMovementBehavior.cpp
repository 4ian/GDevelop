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
#include "GDCpp/Extensions/Builtin/MathematicalTools.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
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
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor>
TopDownMovementBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties[_("Allows diagonals")]
      .SetValue(behaviorContent.GetBoolAttribute("allowDiagonals") ? "true"
                                                                   : "false")
      .SetType("Boolean");
  properties[_("Acceleration")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("acceleration")));
  properties[_("Deceleration")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("deceleration")));
  properties[_("Max. speed")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("maxSpeed")));
  properties[_("Rotate speed")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("angularMaxSpeed")));
  properties[_("Rotate object")]
      .SetValue(behaviorContent.GetBoolAttribute("rotateObject") ? "true"
                                                                 : "false")
      .SetType("Boolean");
  properties[_("Angle offset")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("angleOffset")));
  properties[_("Default controls")]
      .SetValue(behaviorContent.GetBoolAttribute("ignoreDefaultControls")
                    ? "false"
                    : "true")
      .SetType("Boolean");

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
  else
    return false;

  return true;
}

#endif
