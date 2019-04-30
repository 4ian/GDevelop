/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef RUNTIMEBEHAVIOR_H
#define RUNTIMEBEHAVIOR_H
#include <map>
#include "GDCore/String.h"
namespace gd {
class SerializerElement;
}  // namespace gd
class RuntimeObject;
class RuntimeScene;

/**
 * \brief Base class used to represents a behavior that can be applied to an
 * object during runtime.
 *
 * \ingroup PlatformDefinition
 */
class GD_CORE_API RuntimeBehavior {
 public:
  RuntimeBehavior(const gd::SerializerElement& behaviorContent)
      : activated(true){
        };
  virtual ~RuntimeBehavior();
  virtual RuntimeBehavior* Clone() const { return new RuntimeBehavior(*this); }

  /**
   * \brief Change the name identifying the behavior.
   */
  virtual void SetName(const gd::String& name_) { name = name_; };

  /**
   * \brief Return the name identifying the behavior
   */
  virtual const gd::String& GetName() const { return name; }

  /**
   * Set the object owning this behavior
   */
  void SetOwner(RuntimeObject* owner_) {
    object = owner_;
    OnOwnerChanged();
  };

  /**
   * Called at each frame before events. Call DoStepPreEvents.
   */
  inline void StepPreEvents(RuntimeScene& scene) {
    if (activated) DoStepPreEvents(scene);
  };

  /**
   * Called at each frame after events. Call DoStepPostEvents.
   */
  inline void StepPostEvents(RuntimeScene& scene) {
    if (activated) DoStepPostEvents(scene);
  };

  /**
   * De/Activate the behavior
   */
  inline void Activate(bool enable = true) {
    if (!activated && enable) {
      activated = true;
      OnActivate();
    } else if (activated && !enable) {
      activated = false;
      OnDeActivate();
    }
  };

  /**
   * Return true if the behavior is activated
   */
  inline bool Activated() const { return activated; };

  /**
   * Reimplement this method to do extra work when the behavior is activated
   */
  virtual void OnActivate(){};
  /**
   * Reimplement this method to do extra work when the behavior is deactivated
   */
  virtual void OnDeActivate(){};

 protected:
  /**
   * Called at each frame before events
   */
  virtual void DoStepPreEvents(RuntimeScene& scene){};

  /**
   * Called at each frame after events
   */
  virtual void DoStepPostEvents(RuntimeScene& scene){};

  /**
   * Redefine this method so as to do special works when owner is set.
   */
  virtual void OnOwnerChanged(){};

  gd::String name;        ///< Name of the behavior
  RuntimeObject* object;  ///< Object owning the behavior
  bool activated;         ///< True if behavior is running
};

#endif  // RUNTIMEBEHAVIOR_H
