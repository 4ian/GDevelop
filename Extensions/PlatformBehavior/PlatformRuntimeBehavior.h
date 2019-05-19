/**

GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PLATFORMRUNTIMEBEHAVIOR_H
#define PLATFORMRUNTIMEBEHAVIOR_H
#include "GDCpp/Runtime/RuntimeBehavior.h"
#include "GDCpp/Runtime/RuntimeObject.h"
class ScenePlatformObjectsManager;
class RuntimeScene;
namespace gd {
class SerializerElement;
}

/**
 * \brief Behavior that mark object as being a platform for objects using
 * PlatformerObject behavior.
 */
class GD_EXTENSION_API PlatformRuntimeBehavior : public RuntimeBehavior {
 public:
  PlatformRuntimeBehavior(const gd::SerializerElement& behaviorContent);
  virtual ~PlatformRuntimeBehavior();
  virtual RuntimeBehavior* Clone() const { return new PlatformRuntimeBehavior(*this); }

  /**
   * \brief Return the object owning this behavior.
   */
  RuntimeObject* GetObject() const { return object; }

  /**
   * \brief The different types of platforms.
   */
  enum PlatformType { NormalPlatform, Jumpthru, Ladder };

  /**
   * \brief Return the object owning this behavior.
   */
  PlatformType GetPlatformType() const { return platformType; }

  /**
   * \brief Change the platform type
   * \param platformType The new platform type ("Platform", "Jumpthru" or
   * "Ladder").
   */
  void ChangePlatformType(const gd::String& platformType_);

  /**
   * \brief Return true if the platform can be grabbed by platformer objects.
   */
  bool CanBeGrabbed() const { return canBeGrabbed; }

  /**
   * \brief Return the offset applied when testing if an object is at the
   * right position on Y axis to grab the platform ledge.
   */
  double GetYGrabOffset() const { return yGrabOffset; }

 private:
  virtual void OnActivate();
  virtual void OnDeActivate();

  virtual void DoStepPreEvents(RuntimeScene& scene);
  virtual void DoStepPostEvents(RuntimeScene& scene);

  RuntimeScene* parentScene;  ///< The scene the object belongs to.
  ScenePlatformObjectsManager*
      sceneManager;  ///< The platform objects manager associated to the scene.
  bool registeredInManager;  ///< True if the behavior is registered in the list
                             ///< of platforms of the scene.
  PlatformType platformType;
  bool canBeGrabbed;  ///< True if the platform ledges can be grabbed by
                      ///< platformer objects.
  double yGrabOffset;
};

#endif  // PLATFORMRUNTIMEBEHAVIOR_H
