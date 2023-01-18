/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#ifndef GDCORE_BEHAVIORSSHAREDDATA_H
#define GDCORE_BEHAVIORSSHAREDDATA_H

#include "GDCore/String.h"
#include "GDCore/Project/BehaviorConfigurationContainer.h"

namespace gd {

/**
 * \brief Base class for defining data shared by behaviors having the same type
 * and name.
 *
 * Behaviors can use shared data, as if they were extending the gd::Layout
 * class.
 *
 * \ingroup GameEngine
 */
class GD_CORE_API BehaviorsSharedData: public BehaviorConfigurationContainer {
 public:
  BehaviorsSharedData(): BehaviorConfigurationContainer() {};
  BehaviorsSharedData(const gd::String& name_, const gd::String& type_)
      : BehaviorConfigurationContainer(name_, type_) {};
  virtual ~BehaviorsSharedData();
  virtual BehaviorsSharedData* Clone() const override { return new BehaviorsSharedData(*this); }
};

}  // namespace gd

#endif  // GDCORE_BEHAVIORSSHAREDDATA_H
