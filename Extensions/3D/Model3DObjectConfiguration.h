/**

GDevelop - Particle System Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#pragma once

#include "GDCore/Project/ObjectConfiguration.h"
namespace gd {
class InitialInstance;
class Project;
} // namespace gd

class GD_EXTENSION_API Model3DAnimation {
public:
  Model3DAnimation() : shouldLoop(false) {};
  virtual ~Model3DAnimation(){};

  /**
   * \brief Return the name of the animation
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Change the name of the animation
   */
  void SetName(const gd::String &name_) { name = name_; }

  /**
   * \brief Return the name of the animation from the GLB file.
   */
  const gd::String &GetSource() const { return source; }

  /**
   * \brief Change the name of the animation from the GLB file.
   */
  void SetSource(const gd::String &source_) { source = source_; }

  /**
   * \brief Return true if the animation should loop.
   */
  const bool ShouldLoop() const { return shouldLoop; }

  /**
   * \brief Change whether the animation should loop or not.
   */
  void SetShouldLoop(bool shouldLoop_) { shouldLoop = shouldLoop_; }

private:
  gd::String name;
  gd::String source;
  bool shouldLoop;
};

/**
 * \brief Particle Emitter object used for storage and for the IDE.
 */
class GD_EXTENSION_API Model3DObjectConfiguration
    : public gd::ObjectConfiguration {
public:
  Model3DObjectConfiguration();
  virtual ~Model3DObjectConfiguration(){};
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const override {
    return gd::make_unique<Model3DObjectConfiguration>(*this);
  }

  virtual void ExposeResources(gd::ArbitraryResourceWorker &worker) override;

  virtual std::map<gd::String, gd::PropertyDescriptor>
  GetProperties() const override;

  virtual bool UpdateProperty(const gd::String &name,
                              const gd::String &value) override;

  virtual std::map<gd::String, gd::PropertyDescriptor>
  GetInitialInstanceProperties(const gd::InitialInstance &instance,
                               gd::Project &project,
                               gd::Layout &layout) override;

  virtual bool UpdateInitialInstanceProperty(gd::InitialInstance &instance,
                                             const gd::String &name,
                                             const gd::String &value,
                                             gd::Project &project,
                                             gd::Layout &layout) override;

  /** \name Animations
   * Methods related to animations management
   */
  ///@{
  /**
   * \brief Return the animation at the specified index.
   * If the index is out of bound, a "bad animation" object is returned.
   */
  const Model3DAnimation &GetAnimation(std::size_t nb) const;

  /**
   * \brief Return the animation at the specified index.
   * If the index is out of bound, a "bad animation" object is returned.
   */
  Model3DAnimation &GetAnimation(std::size_t nb);

  /**
   * \brief Return the number of animations this object has.
   */
  std::size_t GetAnimationsCount() const { return animations.size(); };

  /**
   * \brief Return true if the animation called "name" exists.
   */
  bool HasAnimationNamed(const gd::String& name) const;

  /**
   * \brief Add an animation at the end of the existing ones.
   */
  void AddAnimation(const Model3DAnimation &animation);

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
  const std::vector<Model3DAnimation> &GetAllAnimations() const {
    return animations;
  }

  ///@}

protected:
  virtual void DoUnserializeFrom(gd::Project &project,
                                 const gd::SerializerElement &element) override;
  virtual void DoSerializeTo(gd::SerializerElement &element) const override;

private:
  double width;
  double height;
  double depth;
  double rotationX;
  double rotationY;
  double rotationZ;

  gd::String modelResourceName;
  gd::String materialType;
  gd::String originLocation;
  gd::String centerLocation;

  bool keepAspectRatio;

  std::vector<Model3DAnimation> animations;
  static Model3DAnimation badAnimation; //< Bad animation when an out of bound
                                        // animation is requested.
};
