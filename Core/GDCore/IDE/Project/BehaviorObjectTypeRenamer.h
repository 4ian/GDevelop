/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_BEHAVIOROBJECTTYPERENAMER_H
#define GDCORE_BEHAVIOROBJECTTYPERENAMER_H

#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"

#include "GDCore/String.h"
#include <map>
#include <memory>
#include <vector>
namespace gd {
class BaseEvent;
class Project;
class EventsList;
} // namespace gd

namespace gd {

/**
 * \brief Rename the object type in event-based behaviors.
 *
 * \ingroup IDE
 */
class GD_CORE_API BehaviorObjectTypeRenamer
    : public ArbitraryEventBasedBehaviorsWorker {
public:
  BehaviorObjectTypeRenamer(const gd::String &oldObjectType_,
                            const gd::String &newObjectType_)
      : oldObjectType(oldObjectType_), newObjectType(newObjectType_){};
  virtual ~BehaviorObjectTypeRenamer();

private:
  void DoVisitEventBasedBehavior(gd::EventsBasedBehavior &behavior) override;

  gd::String oldObjectType;
  gd::String newObjectType;
};

} // namespace gd

#endif // GDCORE_BEHAVIOROBJECTTYPERENAMER_H
