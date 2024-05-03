/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <vector>
#include "GDCore/String.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.h"

namespace gd {

/**
 * \brief Class representing an animation of a SpriteObject.
 *
 * \see SpriteObject
 * \see Direction
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API Animation {
 public:
  Animation();
  virtual ~Animation();

  /**
   * \brief Set the name of the animation
   */
  const gd::String& GetName() const { return name; }

  /**
   * \brief Change the name of the animation
   */
  void SetName(const gd::String& name_) { name = name_; }

  /**
   * \brief Return the n-th direction
   */
  const Direction& GetDirection(std::size_t n) const;

  /**
   * \brief Return the n-th direction
   */
  Direction& GetDirection(std::size_t n);

  /**
   * \brief Change a direction
   */
  void SetDirection(const Direction& direction, std::size_t nb);

  /**
   * \brief Change direction count
   */
  void SetDirectionsCount(std::size_t nb);

  /**
   * \brief Get direction count
   */
  std::size_t GetDirectionsCount() const;

  /**
   * \brief Return true if there isn't any direction in the animation
   */
  bool HasNoDirections() const;

  /**
   * \brief Return true if the animation is composed of more than one direction.
   *
   * By default, an animation is composed of a single direction, and the sprite
   * is rotated.
   */
  bool UseMultipleDirections() const { return useMultipleDirections; }

  /**
   * \brief Set if the animation is using more than one direction.
   *
   * By default, an animation is composed of a single direction, and the sprite
   * is rotated.
   */
  void SetUseMultipleDirections(bool enable) { useMultipleDirections = enable; }

  bool useMultipleDirections;  ///< deprecated This should be moved to class
                               ///< private members

 private:
  std::vector<Direction> directions;
  gd::String name;

  static Direction badDirection;
};

}  // namespace gd
