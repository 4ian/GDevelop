/**
GDevelop - Sticker3D Behavior Extension
Copyright (c) 2024 GDevelop Team
This project is released under the MIT License.
*/
#include "Sticker3DBehavior.h"

#include <map>

#include "GDCore/CommonTools.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

void Sticker3DBehavior::InitializeContent(gd::SerializerElement& content) {
  content.SetAttribute("followRotation", true);
  content.SetAttribute("destroyWithStuckToObject", false);
  content.SetAttribute("offsetMode", "world");
}

std::map<gd::String, gd::PropertyDescriptor> Sticker3DBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;

  properties["followRotation"]
      .SetValue(behaviorContent.GetBoolAttribute("followRotation") ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Follow rotation"))
      .SetDescription(_("If enabled, the 3D object will also follow the rotation of the stuck-to 3D object."));

  properties["offsetMode"]
      .SetValue(behaviorContent.GetStringAttribute("offsetMode", "world"))
      .SetType("Choice")
      .AddExtraInfo("world")
      .AddExtraInfo("local")
      .SetLabel(_("Offset mode"))
      .SetDescription(_("World space: offset stays fixed in world coordinates. Local space: offset rotates with the stuck-to object around the Z-axis (yaw rotation only), suitable for vehicles and characters on flat surfaces."));

  properties["destroyWithStuckToObject"]
      .SetValue(behaviorContent.GetBoolAttribute("destroyWithStuckToObject") ? "true" : "false")
      .SetType("Boolean")
      .SetLabel(_("Destroy when the 3D object it's stuck on is destroyed"))
      .SetDescription(_("If enabled, this 3D object will be automatically destroyed when the stuck-to 3D object is destroyed."));

  return properties;
}

bool Sticker3DBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                      const gd::String& name,
                                      const gd::String& value) {
  if (name == "followRotation") {
    behaviorContent.SetAttribute("followRotation", value == "1");
    return true;
  }
  if (name == "offsetMode") {
    behaviorContent.SetAttribute("offsetMode", value);
    return true;
  }
  if (name == "destroyWithStuckToObject") {
    behaviorContent.SetAttribute("destroyWithStuckToObject", value == "1");
    return true;
  }

  return false;
}
