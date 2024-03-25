/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <vector>
#include "GDCore/String.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
namespace gd {
class SerializerElement;
}

namespace gd {

/**
 * \brief Class defining a direction (set of frames) of an Animation.
 *
 * \see SpriteObject
 * \see Animation
 * \see Sprite
 * \ingroup SpriteObjectExtension
 *
 * \todo Support UTF8 (currently convert all loaded strings from UTF8 to the
 * current locale)
 */
class GD_CORE_API Direction {
 public:
  Direction();
  virtual ~Direction();

  /**
   * \brief Return true if sprites looping is activated
   */
  inline bool IsLooping() const { return loop; }

  /**
   * \brief Set if the sprites must be looping or not.
   */
  void SetLoop(bool loop_);

  /**
   * \brief Get the time between each sprite
   */
  inline double GetTimeBetweenFrames() const { return timeBetweenFrame; }

  /**
   * \brief Set the time between each sprite
   *
   * \param time Time between each sprite, in seconds.
   */
  void SetTimeBetweenFrames(double time);

  /**
   * \brief Return a reference to a sprite of the direction.
   *
   * \param nb The index of the sprite to be accessed. Bound checking is not
   * made.
   *
   * \return A reference to the sprite.
   */
  const Sprite& GetSprite(std::size_t nb) const;

  /**
   * \brief Return a reference to a sprite of the direction.
   *
   * \param nb The index of the sprite to be accessed. Bound checking is not
   * made.
   *
   * \return A reference to the sprite.
   */
  Sprite& GetSprite(std::size_t nb);

  /**
   * \brief Return a vector of references to sprite names.
   *
   * \return A vector of all sprite names references.
   */
  const std::vector<gd::String>& GetSpriteNames() const;

  /**
   * \brief Check if the direction contains sprites.
   *
   * \return true if the direction does not have any sprite.
   */
  bool HasNoSprites() const;

  /**
   * \brief Return the number of sprite used in the direction
   *
   * \return The number of sprite used in the direction
   */
  std::size_t GetSpritesCount() const;

  /**
   * \brief Remove the sprite at the specified position.
   *
   * Bound-checking is made.
   */
  void RemoveSprite(std::size_t index);

  /**
   * \brief Clear the direction from all of its sprites
   */
  void RemoveAllSprites();

  /**
   * \brief Add a new sprite at the end of the list.
   */
  void AddSprite(const Sprite& sprite);

  /**
   * \brief Swap the position of two sprites
   */
  void SwapSprites(std::size_t firstSpriteIndex, std::size_t secondSpriteIndex);

  /**
   * \brief Change the position of the specified sprite.
   */
  void MoveSprite(std::size_t oldIndex, std::size_t newIndex);

  /**
   * \brief Set the metadata (any string) associated to the Direction.
   * \note Can be used by external editors to store extra information.
   */
  virtual void SetMetadata(const gd::String& metadata_) { metadata = metadata_; }

  /**
   * \brief Return the (optional) metadata associated to the Direction.
   */
  virtual const gd::String& GetMetadata() const { return metadata; }

  void UnserializeFrom(const gd::SerializerElement& element);
  void SerializeTo(gd::SerializerElement& element) const;

 private:
  bool loop;               ///< true if the animation must loop.
  double timeBetweenFrame;  ///< The time between each sprite of the animation.
  std::vector<Sprite> sprites;  ///< The sprites of the direction.
  gd::String metadata;
};

}  // namespace gd
