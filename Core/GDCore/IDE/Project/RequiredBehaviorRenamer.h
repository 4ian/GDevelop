/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_REQUIREDBEHAVIORRENAMER_H
#define GDCORE_REQUIREDBEHAVIORRENAMER_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Project;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief Rename the type of required behavior in event-based behaviors.
 *
 * \ingroup IDE
 */
class GD_CORE_API RequiredBehaviorRenamer : public ArbitraryEventBasedBehaviorsWorker {
 public:
  RequiredBehaviorRenamer(const gd::String& oldBehaviorType_,
                                       const gd::String& newBehaviorType_)
      : oldBehaviorType(oldBehaviorType_), newBehaviorType(newBehaviorType_){};
  virtual ~RequiredBehaviorRenamer();

 private:
  void DoVisitEventBasedBehavior(gd::EventsBasedBehavior& behavior) override;

  gd::String oldBehaviorType;
  gd::String newBehaviorType;
};

}  // namespace gd

#endif  // GDCORE_REQUIREDBEHAVIORRENAMER_H
