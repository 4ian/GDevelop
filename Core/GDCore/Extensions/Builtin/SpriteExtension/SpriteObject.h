/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteAnimationList.h"
#include "GDCore/Project/Object.h"

namespace gd {
class InitialInstance;
class Object;
class Layout;
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
  bool UpdateProperty(const gd::String& name, const gd::String& value) override;

  std::map<gd::String, gd::PropertyDescriptor> GetInitialInstanceProperties(
      const gd::InitialInstance& position,
      gd::Project& project,
      gd::Layout& scene) override;
  bool UpdateInitialInstanceProperty(gd::InitialInstance& position,
                                     const gd::String& name,
                                     const gd::String& value,
                                     gd::Project& project,
                                     gd::Layout& scene) override;

  /**
   * \brief Return the animation configuration.
   */
  const SpriteAnimationList& GetAnimations() const;

  /**
   * @brief Return the animation configuration.
   */
  SpriteAnimationList& GetAnimations();

  /**
   * \brief Set if the object animation should be played even if the object is
   * hidden or far from the camera.
   */
  void SetUpdateIfNotVisible(bool updateIfNotVisible_) {
    updateIfNotVisible = updateIfNotVisible_;
  }

  /**
   * \brief Check if the object animation should be played even if the object
   * is hidden or far from the camera (false by default).
   */
  bool GetUpdateIfNotVisible() const { return updateIfNotVisible; }

 private:
  void DoUnserializeFrom(gd::Project& project,
                         const gd::SerializerElement& element) override;
  void DoSerializeTo(gd::SerializerElement& element) const override;

  SpriteAnimationList animations;

  bool updateIfNotVisible;  ///< If set to true, ask the game engine to play
                            ///< object animation even if hidden or far from
                            ///< the screen.
};

}  // namespace gd
