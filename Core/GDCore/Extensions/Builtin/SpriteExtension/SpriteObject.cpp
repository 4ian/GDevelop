/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"

#include <algorithm>

#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

namespace gd {

SpriteObject::SpriteObject()
    : updateIfNotVisible(false) {}

SpriteObject::~SpriteObject(){};

void SpriteObject::DoUnserializeFrom(gd::Project& project,
                                     const gd::SerializerElement& element) {
  updateIfNotVisible = element.GetBoolAttribute("updateIfNotVisible", true);
  animations.UnserializeFrom(element);
}

void SpriteObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("updateIfNotVisible", updateIfNotVisible);
  animations.SerializeTo(element);
}

std::map<gd::String, gd::PropertyDescriptor> SpriteObject::GetProperties()
    const {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties[_("Animate even if hidden or far from the screen")]
      .SetValue(updateIfNotVisible ? "true" : "false")
      .SetType("Boolean");
  properties["PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS"].SetValue("");

  return properties;
}

bool SpriteObject::UpdateProperty(const gd::String& name,
                                  const gd::String& value) {
  if (name == _("Animate even if hidden or far from the screen"))
    updateIfNotVisible = value == "1";

  return true;
}

void SpriteObject::ExposeResources(gd::ArbitraryResourceWorker& worker) {
  animations.ExposeResources(worker);
}

std::map<gd::String, gd::PropertyDescriptor>
SpriteObject::GetInitialInstanceProperties(
    const gd::InitialInstance& initialInstance,
    gd::Project& project,
    gd::Layout& scene) {
  std::map<gd::String, gd::PropertyDescriptor> properties;
  properties["animation"] =
      gd::PropertyDescriptor(
          gd::String::From(initialInstance.GetRawDoubleProperty("animation")))
          .SetLabel(_("Animation"))
          .SetType("number");

  return properties;
}

bool SpriteObject::UpdateInitialInstanceProperty(
    gd::InitialInstance& initialInstance,
    const gd::String& name,
    const gd::String& value,
    gd::Project& project,
    gd::Layout& scene) {
  if (name == "animation") {
    initialInstance.SetRawDoubleProperty(
        "animation", std::max(0, value.empty() ? 0 : value.To<int>()));
  }

  return true;
}

const SpriteAnimationList& SpriteObject::GetAnimations() const {
  return animations;
}

SpriteAnimationList& SpriteObject::GetAnimations() {
  return animations;
}

}  // namespace gd
