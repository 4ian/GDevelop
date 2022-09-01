/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_SPRITEOBJECT_H
#define GDCORE_SPRITEOBJECT_H
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
#include "GDCore/Project/Object.h"
namespace gd {
class InitialInstance;
class Object;
class Layout;
class Sprite;
class Animation;
class SerializerElement;
class PropertyDescriptor;
}  // namespace gd

namespace gd {

/**
 * \brief Standard sprite object for extensions that implements the standard
 * SpriteExtension (see
 * gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension).
 *
 * A Sprite object is an object composed of animations, containing directions
 * with images.
 *
 * \see Animation
 * \see Direction
 * \see Sprite
 * \see gd::BuiltinExtensionsImplementer::ImplementsSpriteExtension
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API SpriteObject : public gd::ObjectConfiguration {
 public:
  SpriteObject();
  virtual ~SpriteObject();
  std::unique_ptr<gd::ObjectConfiguration> Clone() const override {
    return gd::make_unique<SpriteObject>(*this);
  }

  void ExposeResources(gd::ArbitraryResourceWorker& worker) override;

  std::map<gd::String, gd::PropertyDescriptor> GetProperties() const override;
  bool UpdateProperty(const gd::String& name,
                      const gd::String& value) override;

  std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(
      const gd::InitialInstance& position,
      gd::Project& project,
      gd::Layout& scene) override;
  bool UpdateInitialInstanceProperty(gd::InitialInstance& position,
                                     const gd::String& name,
                                     const gd::String& value,
                                     gd::Project& project,
                                     gd::Layout& scene) override;

  /** \name Animations
   * Methods related to animations management
   */
  ///@{
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
   * \brief Set if the object animation should be played even if the object is hidden
   * or far from the camera.
   */
  void SetUpdateIfNotVisible(bool updateIfNotVisible_) { updateIfNotVisible = updateIfNotVisible_; }

  /**
   * \brief Check if the object animation should be played even if the object is hidden
   * or far from the camera (false by default).
   */
  bool GetUpdateIfNotVisible() const { return updateIfNotVisible; }
  ///@}

 private:
  void DoUnserializeFrom(gd::Project& project,
                         const gd::SerializerElement& element) override;
  void DoSerializeTo(gd::SerializerElement& element) const override;

  mutable std::vector<Animation> animations;
  bool updateIfNotVisible;  ///< If set to true, ask the game engine to play
                            ///< object animation even if hidden or far from the
                            ///< screen.

  static Animation badAnimation;  //< Bad animation when an out of bound
                                  // animation is requested.
};

}  // namespace gd
#endif  // GDCORE_SPRITEOBJECT_H
