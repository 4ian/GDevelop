/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PlatformBehavior.h"
#include <memory>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "ScenePlatformObjectsManager.h"
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <map>
#include "GDCore/Project/PropertyDescriptor.h"
#endif

void PlatformBehavior::InitializeContent(
    gd::SerializerElement& behaviorContent) {
  behaviorContent.SetAttribute("platformType", "NormalPlatform");
  behaviorContent.SetAttribute("canBeGrabbed", true);
  behaviorContent.SetAttribute("yGrabOffset", 0);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> PlatformBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  gd::String platformType = behaviorContent.GetStringAttribute("platformType");
  gd::String platformTypeStr = _("Platform");
  if (platformType == "Ladder")
    platformTypeStr = _("Ladder");
  else if (platformType == "Jumpthru")
    platformTypeStr = _("Jumpthru platform");

  properties[_("Type")]
      .SetValue(platformTypeStr)
      .SetType("Choice")
      .AddExtraInfo(_("Platform"))
      .AddExtraInfo(_("Jumpthru platform"))
      .AddExtraInfo(_("Ladder"));
  properties[_("Ledges can be grabbed")]
      .SetValue(behaviorContent.GetBoolAttribute("canBeGrabbed", true)
                    ? "true"
                    : "false")
      .SetType("Boolean");
  properties[_("Grab offset on Y axis")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("yGrabOffset")));

  return properties;
}

bool PlatformBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                      const gd::String& name,
                                      const gd::String& value) {
  if (name == _("Ledges can be grabbed"))
    behaviorContent.SetAttribute("canBeGrabbed", (value == "1"));
  else if (name == _("Type")) {
    if (value == _("Jumpthru platform"))
      behaviorContent.SetAttribute("platformType", "Jumpthru");
    else if (value == _("Ladder"))
      behaviorContent.SetAttribute("platformType", "Ladder");
    else
      behaviorContent.SetAttribute("platformType", "NormalPlatform");
  } else if (name == _("Grab offset on Y axis"))
    behaviorContent.SetAttribute("yGrabOffset", value.To<double>());
  else
    return false;

  return true;
}
#endif
