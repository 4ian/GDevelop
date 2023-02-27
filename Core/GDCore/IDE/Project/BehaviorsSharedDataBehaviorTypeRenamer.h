/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Project/ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/String.h"

namespace gd {
class BaseEvent;
class Project;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief Rename the behavior type of shared data.
 *
 * \ingroup IDE
 */
class GD_CORE_API BehaviorsSharedDataBehaviorTypeRenamer : public ArbitraryBehaviorSharedDataWorker {
 public:
  BehaviorsSharedDataBehaviorTypeRenamer(const gd::String& oldBehaviorType_,
                                       const gd::String& newBehaviorType_)
      : oldBehaviorType(oldBehaviorType_), newBehaviorType(newBehaviorType_){};
  virtual ~BehaviorsSharedDataBehaviorTypeRenamer();

 private:
  void DoVisitSharedData(gd::BehaviorsSharedData& behavior) override;

  gd::String oldBehaviorType;
  gd::String newBehaviorType;
};

}  // namespace gd
