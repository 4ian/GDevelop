/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteAnimationList.h"

#include <algorithm>

#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Tools/Localization.h"

namespace gd {

Animation SpriteAnimationList::badAnimation;

SpriteAnimationList::SpriteAnimationList()
    : adaptCollisionMaskAutomatically(true) {}

SpriteAnimationList::~SpriteAnimationList(){};

void SpriteAnimationList::UnserializeFrom(const gd::SerializerElement& element) {
  adaptCollisionMaskAutomatically =
      element.GetBoolAttribute("adaptCollisionMaskAutomatically", false);

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

void SpriteAnimationList::SerializeTo(gd::SerializerElement& element) const {
  element.SetAttribute("adaptCollisionMaskAutomatically",
                       adaptCollisionMaskAutomatically);

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

void SpriteAnimationList::ExposeResources(gd::ArbitraryResourceWorker& worker) {
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

const Animation& SpriteAnimationList::GetAnimation(std::size_t nb) const {
  if (nb >= animations.size()) return badAnimation;

  return animations[nb];
}

Animation& SpriteAnimationList::GetAnimation(std::size_t nb) {
  if (nb >= animations.size()) return badAnimation;

  return animations[nb];
}

void SpriteAnimationList::AddAnimation(const Animation& animation) {
  animations.push_back(animation);
}

bool SpriteAnimationList::RemoveAnimation(std::size_t nb) {
  if (nb >= GetAnimationsCount()) return false;

  animations.erase(animations.begin() + nb);
  return true;
}

void SpriteAnimationList::SwapAnimations(std::size_t firstIndex,
                                  std::size_t secondIndex) {
  if (firstIndex < animations.size() && secondIndex < animations.size() &&
      firstIndex != secondIndex)
    std::swap(animations[firstIndex], animations[secondIndex]);
}

void SpriteAnimationList::MoveAnimation(std::size_t oldIndex, std::size_t newIndex) {
  if (oldIndex >= animations.size() || newIndex >= animations.size()) return;

  auto animation = animations[oldIndex];
  animations.erase(animations.begin() + oldIndex);
  animations.insert(animations.begin() + newIndex, animation);
}

}  // namespace gd
