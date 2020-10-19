/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "ScenePhysicsDatas.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"
#if defined(GD_IDE_ONLY)
#include <map>
#include "GDCore/CommonTools.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#endif

void ScenePhysicsDatas::InitializeContent(
    gd::SerializerElement& behaviorSharedDataContent) {
  behaviorSharedDataContent.SetAttribute("gravityX", 0);
  behaviorSharedDataContent.SetAttribute("gravityY", 9);
  behaviorSharedDataContent.SetAttribute("scaleX", 100);
  behaviorSharedDataContent.SetAttribute("scaleY", 100);
};

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> ScenePhysicsDatas::GetProperties(
    const gd::SerializerElement& behaviorSharedDataContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Gravity on X axis (in m/s²)")].SetValue(gd::String::From(
      behaviorSharedDataContent.GetDoubleAttribute("gravityX")));
  properties[_("Gravity on Y axis (in m/s²)")].SetValue(gd::String::From(
      behaviorSharedDataContent.GetDoubleAttribute("gravityY")));
  properties[_("X Scale: number of pixels for 1 meter")].SetValue(
      gd::String::From(behaviorSharedDataContent.GetDoubleAttribute("scaleX")));
  properties[_("Y Scale: number of pixels for 1 meter")].SetValue(
      gd::String::From(behaviorSharedDataContent.GetDoubleAttribute("scaleY")));

  return properties;
}

bool ScenePhysicsDatas::UpdateProperty(
    gd::SerializerElement& behaviorSharedDataContent,
    const gd::String& name,
    const gd::String& value) {
  if (name == _("Gravity on X axis (in m/s²)")) {
    behaviorSharedDataContent.SetAttribute("gravityX", value.To<float>());
  }
  if (name == _("Gravity on Y axis (in m/s²)")) {
    behaviorSharedDataContent.SetAttribute("gravityY", value.To<float>());
  }
  if (name == _("X scale: number of pixels for 1 meter")) {
    behaviorSharedDataContent.SetAttribute("scaleX", value.To<float>());
  }
  if (name == _("Y scale: number of pixels for 1 meter")) {
    behaviorSharedDataContent.SetAttribute("scaleY", value.To<float>());
  }

  return true;
}
#endif
