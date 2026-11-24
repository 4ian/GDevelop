/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"
#include "GDCore/Project/BehaviorConfigurationContainer.h"
#include "GDCore/Project/MemoryTrackedRegistry.h"
#include "GDCore/Tools/MakeUnique.h"

namespace gd {

/**
 * \brief Base class used to represents a behavior that can be applied to an
 * object. It stores the content (i.e: the properties) of a behavior of an object
 * and forward the properties related functions to Javascript with Emscripten.
 *
 * \see gd::BehaviorsSharedData
 * \see gd::Object
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Behavior: public BehaviorConfigurationContainer {
 public:

  Behavior()
      : BehaviorConfigurationContainer(),
        isDefaultBehavior(false),
        isSynchronizedOverNetwork(true),
        isSynchronizedOverNetworkByDefault(true) {};
  Behavior(const gd::String& name_, const gd::String& type_)
      : BehaviorConfigurationContainer(name_, type_),
        isDefaultBehavior(false),
        isSynchronizedOverNetwork(true),
        isSynchronizedOverNetworkByDefault(true) {};
  Behavior(const Behavior& other)
      : BehaviorConfigurationContainer(other),
        isDefaultBehavior(other.isDefaultBehavior),
        isSynchronizedOverNetwork(other.isSynchronizedOverNetwork),
        isSynchronizedOverNetworkByDefault(
            other.isSynchronizedOverNetworkByDefault) {};
  Behavior& operator=(const Behavior& other) {
    if (this != &other) {
      BehaviorConfigurationContainer::operator=(other);
      isDefaultBehavior = other.isDefaultBehavior;
      isSynchronizedOverNetwork = other.isSynchronizedOverNetwork;
      isSynchronizedOverNetworkByDefault =
          other.isSynchronizedOverNetworkByDefault;
    }
    return *this;
  }
  virtual ~Behavior();
  virtual std::unique_ptr<gd::Behavior> Clone() const {
    return gd::make_unique<gd::Behavior>(*this);
  }

  bool IsDefaultBehavior() const {
    return isDefaultBehavior;
  }

  void SetDefaultBehavior(bool isDefaultBehavior_) {
    isDefaultBehavior = isDefaultBehavior_;
  }

  /**
   * \brief Check if the behavior state is synchronized with other players,
   * when its object is synchronized over the network (multiplayer).
   *
   * When not synchronized, the behavior only runs as decided by the game of
   * the player owning the object (useful for behaviors reacting to the inputs
   * of the player).
   */
  bool IsSynchronizedOverNetwork() const { return isSynchronizedOverNetwork; }

  void SetSynchronizedOverNetwork(bool isSynchronizedOverNetwork_) {
    isSynchronizedOverNetwork = isSynchronizedOverNetwork_;
  }

  /**
   * \brief Check if the behavior is synchronized over the network when not
   * specified otherwise. This comes from the behavior metadata, and is not
   * serialized: `IsSynchronizedOverNetwork` is only serialized when it's
   * different from this.
   */
  bool IsSynchronizedOverNetworkByDefault() const {
    return isSynchronizedOverNetworkByDefault;
  }

  void SetSynchronizedOverNetworkByDefault(
      bool isSynchronizedOverNetworkByDefault_) {
    isSynchronizedOverNetworkByDefault = isSynchronizedOverNetworkByDefault_;
  }

  private:
  gd::MemoryTracked _memoryTracked{this, "Behavior"};
  bool isDefaultBehavior;
  bool isSynchronizedOverNetwork;
  bool isSynchronizedOverNetworkByDefault;
};

}  // namespace gd
