/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_BEHAVIOR_H
#define GDCORE_BEHAVIOR_H

#include "GDCore/String.h"
#include "GDCore/Project/BehaviorConfigurationContainer.h"

namespace gd {

/**
 * \brief Base class used to represents a behavior that can be applied to an
 * object. It stores the content (i.e: the properties) of a behavior of an object.
 *
 * \see gd::BehaviorsSharedData
 * \see gd::Object
 * \ingroup PlatformDefinition
 */
class GD_CORE_API Behavior: public BehaviorConfigurationContainer {
 public:

  Behavior(): BehaviorConfigurationContainer() {};
  Behavior(const gd::String& name_, const gd::String& type_)
      : BehaviorConfigurationContainer(name_, type_) {};
  virtual ~Behavior();
  virtual Behavior* Clone() const override { return new Behavior(*this); }
};

}  // namespace gd

#endif  // GDCORE_BEHAVIOR_H
