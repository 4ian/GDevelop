/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
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
 * \brief Rename the type of behavior parameters in functions.
 *
 * \ingroup IDE
 */
class GD_CORE_API FunctionParameterBehaviorTypeRenamer
    : public ArbitraryEventsFunctionsWorker {
public:
  FunctionParameterBehaviorTypeRenamer(const gd::String &oldBehaviorType_,
                                       const gd::String &newBehaviorType_)
      : oldBehaviorType(oldBehaviorType_), newBehaviorType(newBehaviorType_){};
  virtual ~FunctionParameterBehaviorTypeRenamer();

private:
  virtual void DoVisitEventsFunction(gd::EventsFunction &eventsFunction) override;

  gd::String oldBehaviorType;
  gd::String newBehaviorType;
};

} // namespace gd
