/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "PathfindingObstacleBehavior.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Serialization/SerializerElement.h"

void PathfindingObstacleBehavior::InitializeContent(
    gd::SerializerElement& behaviorContent) {
  behaviorContent.SetAttribute("impassable", true);
  behaviorContent.SetAttribute("cost", 2);
}

#if defined(GD_IDE_ONLY)
std::map<gd::String, gd::PropertyDescriptor>
PathfindingObstacleBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["Impassable"]
      .SetLabel(_("Impassable obstacle"))
      .SetValue(behaviorContent.GetBoolAttribute("impassable") ? "true"
                                                               : "false")
      .SetType("Boolean");
  properties["Cost"]
      .SetLabel(_("Cost (if not impassable)"))
      .SetValue(gd::String::From(behaviorContent.GetDoubleAttribute("cost")));

  return properties;
}

bool PathfindingObstacleBehavior::UpdateProperty(
    gd::SerializerElement& behaviorContent,
    const gd::String& name,
    const gd::String& value) {
  if (name == "Impassable") {
    behaviorContent.SetAttribute("impassable", (value != "0"));
    return true;
  }

  if (value.To<float>() < 0) return false;

  if (name == "Cost")
    behaviorContent.SetAttribute("cost", value.To<float>());
  else
    return false;

  return true;
}

#endif
