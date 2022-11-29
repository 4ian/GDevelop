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

Animation SpriteObject::badAnimation;

SpriteObject::SpriteObject() : updateIfNotVisible(false) {}

SpriteObject::~SpriteObject(){};

void SpriteObject::DoUnserializeFrom(gd::Project& project,
                                     const gd::SerializerElement& element) {
  updateIfNotVisible = element.GetBoolAttribute("updateIfNotVisible", true);

  RemoveAllAnimations();
  const gd::SerializerElement& animationsElement =
      element.GetChild("animations", 0, "Animations");
  animationsElement.ConsiderAsArrayOf("animation", "Animation");
  for (std::size_t i = 0; i < animationsElement.GetChildrenCount(); ++i) {
    const gd::SerializerElement& animationElement =
        animationsElement.GetChild(i);
    Animation newAnimation;

    newAnimation.useMultipleDirections = animationElement.GetBoolAttribute(
        "useMultipleDirections", false, "typeNormal");
    newAnimation.SetName(animationElement.GetStringAttribute("name", ""));

    // Compatibility with GD <= 3.3
    if (animationElement.HasChild("Direction")) {
      for (std::size_t j = 0;
           j < animationElement.GetChildrenCount("Direction");
           ++j) {
        Direction direction;
        direction.UnserializeFrom(animationElement.GetChild("Direction", j));

        newAnimation.SetDirectionsCount(newAnimation.GetDirectionsCount() + 1);
        newAnimation.SetDirection(direction,
                                  newAnimation.GetDirectionsCount() - 1);
      }
    }
    // End of compatibility code
    else {
      const gd::SerializerElement& directionsElement =
          animationElement.GetChild("directions");
      directionsElement.ConsiderAsArrayOf("direction");
      for (std::size_t j = 0; j < directionsElement.GetChildrenCount(); ++j) {
        Direction direction;
        direction.UnserializeFrom(directionsElement.GetChild(j));

        newAnimation.SetDirectionsCount(newAnimation.GetDirectionsCount() + 1);
        newAnimation.SetDirection(direction,
                                  newAnimation.GetDirectionsCount() - 1);
      }
    }

    AddAnimation(newAnimation);
  }
}

void SpriteObject::DoSerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("updateIfNotVisible", updateIfNotVisible);

  // Animations
  gd::SerializerElement& animationsElement = element.AddChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  for (std::size_t k = 0; k < GetAnimationsCount(); k++) {
    gd::SerializerElement& animationElement =
        animationsElement.AddChild("animation");

    animationElement.SetAttribute("useMultipleDirections",
                                  GetAnimation(k).useMultipleDirections);
    animationElement.SetAttribute("name", GetAnimation(k).GetName());

    gd::SerializerElement& directionsElement =
        animationElement.AddChild("directions");
    directionsElement.ConsiderAsArrayOf("direction");
    for (std::size_t l = 0; l < GetAnimation(k).GetDirectionsCount(); l++) {
      GetAnimation(k).GetDirection(l).SerializeTo(
          directionsElement.AddChild("direction"));
    }
  }
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

void SpriteObject::ExposeResources(
    gd::ArbitraryResourceWorker& worker,
    gd::ResourcesManager* resourcesManager) {
  for (std::size_t j = 0; j < GetAnimationsCount(); j++) {
    for (std::size_t k = 0; k < GetAnimation(j).GetDirectionsCount(); k++) {
      for (std::size_t l = 0;
           l < GetAnimation(j).GetDirection(k).GetSpritesCount();
           l++) {
        worker.ExposeImage(
            GetAnimation(j).GetDirection(k).GetSprite(l).GetImageName());
      }
    }
  }
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

const Animation& SpriteObject::GetAnimation(std::size_t nb) const {
  if (nb >= animations.size()) return badAnimation;

  return animations[nb];
}

Animation& SpriteObject::GetAnimation(std::size_t nb) {
  if (nb >= animations.size()) return badAnimation;

  return animations[nb];
}

void SpriteObject::AddAnimation(const Animation& animation) {
  animations.push_back(animation);
}

bool SpriteObject::RemoveAnimation(std::size_t nb) {
  if (nb >= GetAnimationsCount()) return false;

  animations.erase(animations.begin() + nb);
  return true;
}

void SpriteObject::SwapAnimations(std::size_t firstIndex,
                                  std::size_t secondIndex) {
  if (firstIndex < animations.size() && secondIndex < animations.size() &&
      firstIndex != secondIndex)
    std::swap(animations[firstIndex], animations[secondIndex]);
}

void SpriteObject::MoveAnimation(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= animations.size() || newIndex >= animations.size()) return;

  auto animation = animations[oldIndex];
  animations.erase(animations.begin() + oldIndex);
  animations.insert(animations.begin() + newIndex, animation);
}

}  // namespace gd
