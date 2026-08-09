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
  Model3DAnimation() : shouldLoop(false), shouldUseRootMotion(true) {};
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
   * \brief Return the resource containing the animation.
   *
   * An empty resource name means the object's primary model resource.
   */
  const gd::String &GetSourceModelResourceName() const {
    return sourceModelResourceName;
  }

  /**
   * \brief Return a mutable reference to the resource containing the animation.
   *
   * This is used by resource workers when a resource is renamed.
   */
  gd::String &GetSourceModelResourceName() { return sourceModelResourceName; }

  /**
   * \brief Change the resource containing the animation.
   *
   * An empty resource name means the object's primary model resource.
   */
  void SetSourceModelResourceName(const gd::String &resourceName) {
    sourceModelResourceName = resourceName;
  }

  /**
   * \brief Return true if the animation should loop.
   */
  const bool ShouldLoop() const { return shouldLoop; }

  /**
   * \brief Change whether the animation should loop or not.
   */
  void SetShouldLoop(bool shouldLoop_) { shouldLoop = shouldLoop_; }

  /**
   * \brief Return true if root motion from the animation should be applied.
   */
  const bool ShouldUseRootMotion() const { return shouldUseRootMotion; }

  /**
   * \brief Change whether root motion from the animation should be applied.
   */
  void SetShouldUseRootMotion(bool shouldUseRootMotion_) {
    shouldUseRootMotion = shouldUseRootMotion_;
  }

private:
  gd::String name;
  gd::String source;
  gd::String sourceModelResourceName;
  bool shouldLoop;
  bool shouldUseRootMotion;
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
  GetInitialInstanceProperties(const gd::InitialInstance &instance) override;

  virtual bool UpdateInitialInstanceProperty(gd::InitialInstance &instance,
                                             const gd::String &name,
                                             const gd::String &value) override;

  /** \name Animations
   * Methods related to animations management
   */
  ///@{
  std::size_t GetAnimationsCount() const override { return animations.size(); };

  const gd::String &GetAnimationName(size_t index) const override;

  bool HasAnimationNamed(const gd::String &animationName) const override;

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

  /** \name Shared animation model resources
   * Model resources whose animation clips can be used by this object.
   */
  ///@{
  std::size_t GetSharedAnimationModelResourcesCount() const {
    return sharedAnimationModelResourceNames.size();
  }

  const gd::String &
  GetSharedAnimationModelResourceName(std::size_t index) const;

  bool HasSharedAnimationModelResourceNamed(
      const gd::String &resourceName) const;

  void AddSharedAnimationModelResource(const gd::String &resourceName);

  bool RemoveSharedAnimationModelResource(std::size_t index);

  void RemoveAllSharedAnimationModelResources() {
    sharedAnimationModelResourceNames.clear();
  }
  ///@}

  /** \name Getters
   * Fast access for rendering instances.
   */
  ///@{
  double GetWidth() const { return width; };
  double GetHeight() const { return height; };
  double GetDepth() const { return depth; };
  double GetRotationX() const { return rotationX; };
  double GetRotationY() const { return rotationY; };
  double GetRotationZ() const { return rotationZ; };
  double GetCrossfadeDuration() const { return crossfadeDuration; };

  const gd::String& GetModelResourceName() const { return modelResourceName; };
  const gd::String& GetMaterialType() const { return materialType; };
  const gd::String& GetOriginLocation() const { return originLocation; };
  const gd::String& GetCenterLocation() const { return centerLocation; };

  bool shouldKeepAspectRatio() const { return keepAspectRatio; };
  bool shouldCastShadow() const { return isCastingShadow; };
  bool shouldReceiveShadow() const { return isReceivingShadow; };
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
  double crossfadeDuration;

  gd::String modelResourceName;
  gd::String materialType;
  gd::String originLocation;
  gd::String centerLocation;

  bool keepAspectRatio;
  bool isCastingShadow;
  bool isReceivingShadow;

  std::vector<gd::String> sharedAnimationModelResourceNames;
  std::vector<Model3DAnimation> animations;
  static gd::String badSharedAnimationModelResourceName;
  static Model3DAnimation badAnimation; //< Bad animation when an out of bound
                                        // animation is requested.
};
