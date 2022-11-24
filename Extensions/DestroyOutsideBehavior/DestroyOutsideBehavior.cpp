/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "DestroyOutsideBehavior.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

void DestroyOutsideBehavior::InitializeContent(gd::SerializerElement& content) {
  content.SetAttribute("extraBorder", 0);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor>
DestroyOutsideBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties["extraBorder"]
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("extraBorder", 0)))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetLabel(_("Margin before deleting the object, in pixels"));

  return properties;
}

bool DestroyOutsideBehavior::UpdateProperty(
    gd::SerializerElement& behaviorContent,
    const gd::String& name,
    const gd::String& value) {
  if (name == "extraBorder")
    behaviorContent.SetAttribute("extraBorder", value.To<double>());
  else
    return false;

  return true;
}
#endif
