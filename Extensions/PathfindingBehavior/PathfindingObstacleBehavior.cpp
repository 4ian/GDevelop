/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "PathfindingObstacleBehavior.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"

void PathfindingObstacleBehavior::InitializeContent(
    gd::SerializerElement& behaviorContent) {
  behaviorContent.SetAttribute("impassable", true);
  behaviorContent.SetAttribute("cost", 2);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor>
PathfindingObstacleBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent, gd::Project& project) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Impassable obstacle")]
      .SetValue(behaviorContent.GetBoolAttribute("impassable") ? "true"
                                                               : "false")
      .SetType("Boolean");
  properties[_("Cost (if not impassable)")].SetValue(
      gd::String::From(behaviorContent.GetDoubleAttribute("cost")));

  return properties;
}

bool PathfindingObstacleBehavior::UpdateProperty(
    gd::SerializerElement& behaviorContent,
    const gd::String& name,
    const gd::String& value,
    gd::Project& project) {
  if (name == _("Impassable obstacle")) {
    behaviorContent.SetAttribute("impassable", (value != "0"));
    return true;
  }

  if (value.To<float>() < 0) return false;

  if (name == _("Cost (if not impassable)"))
    behaviorContent.SetAttribute("cost", value.To<float>());
  else
    return false;

  return true;
}

#endif
