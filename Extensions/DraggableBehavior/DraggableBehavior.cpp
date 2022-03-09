/**

GDevelop - Draggable Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "DraggableBehavior.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

DraggableBehavior::DraggableBehavior() {}

void DraggableBehavior::InitializeContent(gd::SerializerElement& content) {
  content.SetAttribute("checkCollisionMask", true);
}

std::map<gd::String, gd::PropertyDescriptor> DraggableBehavior::GetProperties(
    const gd::SerializerElement& behaviorContent) const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["checkCollisionMask"]
      .SetValue(behaviorContent.GetBoolAttribute("checkCollisionMask")
                    ? "true"
                    : "false")
      .SetType("Boolean")
      .SetLabel(_("Do a precision check against the object's collision mask"))
      .SetDescription(
          _("Use the object (custom) collision mask instead of the bounding "
            "box, making the behavior more precise at the cost of "
            "reduced performance"));
  ;

  return properties;
}

bool DraggableBehavior::UpdateProperty(gd::SerializerElement& behaviorContent,
                                       const gd::String& name,
                                       const gd::String& value) {
  if (name == "checkCollisionMask") {
    behaviorContent.SetAttribute("checkCollisionMask", (value != "0"));
    return true;
  }
  return false;
}