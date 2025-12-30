/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/String.h"
#include "GDCore/Project/BehaviorConfigurationContainer.h"
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

  Behavior(): BehaviorConfigurationContainer(), isDefaultBehavior(false) {};
  Behavior(const gd::String& name_, const gd::String& type_)
      : BehaviorConfigurationContainer(name_, type_),
      isDefaultBehavior(false) {};
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

  private:
  bool isDefaultBehavior;
};

}  // namespace gd
