/**

GDevelop - TopDown Obstacle Behavior
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "TopDownObstacleBehavior.h"
#include <memory>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
//#include "SceneTopDownObstaclesManager.h" no native implementation
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <map>
#include "GDCore/Project/PropertyDescriptor.h"
#endif

void TopDownObstacleBehavior::InitializeContent(
    gd::SerializerElement& behaviorContent) {
  behaviorContent.SetAttribute("slidingCornerSize", 0);
  behaviorContent.SetAttribute("viewpoint", "TopDown");
  behaviorContent.SetAttribute("customIsometryAngle", 30);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> TopDownObstacleBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties[_("Sliding corner size")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("slidingCornerSize")));

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
      .SetValue(viewpointStr)
      .SetType("Choice")
      .AddExtraInfo(_("Top-Down"))
      .AddExtraInfo(_("Isometry 2:1 (26.565°)"))
      .AddExtraInfo(_("True Isometry (30°)"))
      .AddExtraInfo(_("Custom Isometry"));
  properties[_("Custom isometry angle")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("customIsometryAngle")));

  return properties;
}

bool TopDownObstacleBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                      const gd::String& name,
                                      const gd::String& value) {
  if (name == _("Sliding corner size"))
    behaviorContent.SetAttribute("slidingCornerSize", value.To<double>());
  else if (name == _("Viewpoint")) {
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

  if (value.To<float>() < 0) return false;

  if (name == _("Custom isometry angle"))
    behaviorContent.SetAttribute("customIsometryAngle", value.To<float>());
  else
    return false;

  return true;
}
#endif
