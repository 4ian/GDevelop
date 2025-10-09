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
  content.SetAttribute("extraBorder", 200);
  content.SetAttribute("unseenGraceDistance", 10000);
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
      .SetLabel(_("Deletion margin"))
      .SetDescription(_("Margin before deleting the object, in pixels."));

  properties["unseenGraceDistance"]
      .SetValue(gd::String::From(
          behaviorContent.GetDoubleAttribute("unseenGraceDistance", 0)))
      .SetType("Number")
      .SetMeasurementUnit(gd::MeasurementUnit::GetPixel())
      .SetLabel(_("Unseen object grace distance"))
      .SetDescription(_("If the object hasn't been visible yet, don't delete it until it travels this far beyond the screen (in pixels). Useful to avoid objects being deleted before they are visible when they spawn."));

  return properties;
}

bool DestroyOutsideBehavior::UpdateProperty(
    gd::SerializerElement& behaviorContent,
    const gd::String& name,
    const gd::String& value) {
  if (name == "extraBorder")
    behaviorContent.SetAttribute("extraBorder", value.To<double>());
  else if (name == "unseenGraceDistance")
    behaviorContent.SetAttribute("unseenGraceDistance", value.To<double>());
  else
    return false;

  return true;
}
#endif
