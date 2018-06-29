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
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#endif

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor> ScenePhysicsDatas::GetProperties(
    gd::Project& project) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Gravity on X axis (in m/s²)")].SetValue(
      gd::String::From(gravityX));
  properties[_("Gravity on Y axis (in m/s²)")].SetValue(
      gd::String::From(gravityY));
  properties[_("X Scale: number of pixels for 1 meter")].SetValue(
      gd::String::From(scaleX));
  properties[_("Y Scale: number of pixels for 1 meter")].SetValue(
      gd::String::From(scaleY));

  return properties;
}

bool ScenePhysicsDatas::UpdateProperty(const gd::String& name,
                                       const gd::String& value,
                                       gd::Project& project) {
  if (name == _("Gravity on X axis (in m/s²)")) {
    gravityX = value.To<float>();
  }
  if (name == _("Gravity on Y axis (in m/s²)")) {
    gravityY = value.To<float>();
  }
  if (name == _("X scale: number of pixels for 1 meter")) {
    scaleX = value.To<float>();
  }
  if (name == _("Y scale: number of pixels for 1 meter")) {
    scaleY = value.To<float>();
  }

  return true;
}

void ScenePhysicsDatas::SerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("gravityX", gravityX);
  element.SetAttribute("gravityY", gravityY);
  element.SetAttribute("scaleX", scaleX);
  element.SetAttribute("scaleY", scaleY);
}

#endif

void ScenePhysicsDatas::UnserializeFrom(const gd::SerializerElement& element) {
  gravityX = element.GetDoubleAttribute("gravityX");
  gravityY = element.GetDoubleAttribute("gravityY");
  scaleX = element.GetDoubleAttribute("scaleX");
  scaleY = element.GetDoubleAttribute("scaleY");
}
