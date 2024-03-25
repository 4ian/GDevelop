/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"

namespace gd {
class InitialInstance;
class SerializerElement;
class PropertyDescriptor;
class ArbitraryResourceWorker;
}  // namespace gd

namespace gd {

/**
 * \brief A list of animations, containing directions with images and collision mask.
 * 
 * It's used in the configuration of object that implements image-based animations.
 *
 * \see Animation
 * \see Direction
 * \see Sprite
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API SpriteAnimationList {
 public:
  SpriteAnimationList();
  virtual ~SpriteAnimationList();

  void ExposeResources(gd::ArbitraryResourceWorker& worker);

  /**
   * \brief Return the animation at the specified index.
   * If the index is out of bound, a "bad animation" object is returned.
   */
  const Animation& GetAnimation(std::size_t nb) const;

  /**
   * \brief Return the animation at the specified index.
   * If the index is out of bound, a "bad animation" object is returned.
   */
  Animation& GetAnimation(std::size_t nb);

  /**
   * \brief Return the number of animations this object has.
   */
  std::size_t GetAnimationsCount() const { return animations.size(); };

  /**
   * \brief Add an animation at the end of the existing ones.
   */
  void AddAnimation(const Animation& animation);

  /**
   * \brief Remove an animation.
   */
  bool RemoveAnimation(std::size_t nb);

  /**
   * \brief Remove all animations.
   */
  void RemoveAllAnimations() { animations.clear(); }

  /**
   * \brief Return true if the object hasn't any animation.
   */
  bool HasNoAnimations() const { return animations.empty(); }

  /**
   * \brief Swap the position of two animations
   */
  void SwapAnimations(std::size_t firstIndex, std::size_t secondIndex);

  /**
   * \brief Change the position of the specified animation
   */
  void MoveAnimation(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Return a read-only reference to the vector containing all the
   * animation of the object.
   */
  const std::vector<Animation>& GetAllAnimations() const { return animations; }

  /**
   * @brief Check if the collision mask adapts automatically to the animation.
   */
  bool AdaptCollisionMaskAutomatically() const {
    return adaptCollisionMaskAutomatically;
  }

  /**
   * @brief Set if the collision mask adapts automatically to the animation.
   */
  void SetAdaptCollisionMaskAutomatically(bool enable) {
    adaptCollisionMaskAutomatically = enable;
  }

  void UnserializeFrom(const gd::SerializerElement& element);
  void SerializeTo(gd::SerializerElement& element) const;

 private:

  mutable std::vector<Animation> animations;

  static Animation badAnimation;         //< Bad animation when an out of bound
                                         // animation is requested.
  bool adaptCollisionMaskAutomatically;  ///< If set to true, the collision
                                         ///< mask will be automatically
                                         ///< adapted to the animation of the
                                         ///< object.
};

}  // namespace gd
