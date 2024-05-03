/**
GDevelop - Spine Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#pragma once

#include "GDCore/Project/ObjectConfiguration.h"
namespace gd {
class InitialInstance;
class Project;
} // namespace gd

class GD_EXTENSION_API SpineAnimation {
public:
  SpineAnimation() : shouldLoop(false) {};
  virtual ~SpineAnimation(){};

  /**
   * \brief Return the name of the animation
   */
  const gd::String &GetName() const { return name; }

  /**
   * \brief Change the name of the animation
   */
  void SetName(const gd::String &name_) { name = name_; }

  /**
   * \brief Return the name of the animation from the spine file.
   */
  const gd::String &GetSource() const { return source; }

  /**
   * \brief Change the name of the animation from the spine file.
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
 * \brief Spine object configuration is used for storage and for the IDE.
 */
class GD_EXTENSION_API SpineObjectConfiguration : public gd::ObjectConfiguration {
public:
  SpineObjectConfiguration();
  virtual ~SpineObjectConfiguration(){};
  virtual std::unique_ptr<gd::ObjectConfiguration> Clone() const override {
    return gd::make_unique<SpineObjectConfiguration>(*this);
  }

  virtual void ExposeResources(gd::ArbitraryResourceWorker &worker) override;
  
  virtual std::map<gd::String, gd::PropertyDescriptor>GetProperties() const override;
  
  virtual bool UpdateProperty(const gd::String &name, const gd::String &value) override;

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
  const SpineAnimation &GetAnimation(std::size_t nb) const;

  /**
   * \brief Return the animation at the specified index.
   * If the index is out of bound, a "bad animation" object is returned.
   */
  SpineAnimation &GetAnimation(std::size_t nb);

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
  void AddAnimation(const SpineAnimation &animation);

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
  const std::vector<SpineAnimation> &GetAllAnimations() const {
    return animations;
  }

  ///@}

protected:
  virtual void DoUnserializeFrom(gd::Project &project, const gd::SerializerElement &element) override;
  virtual void DoSerializeTo(gd::SerializerElement &element) const override;

private:
  double scale;

  gd::String spineResourceName;

  std::vector<SpineAnimation> animations;

  static SpineAnimation badAnimation;
};
