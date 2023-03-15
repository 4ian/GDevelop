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
 * \brief Rename the type of object parameters in functions.
 *
 * \ingroup IDE
 */
class GD_CORE_API FunctionParameterObjectTypeRenamer
    : public ArbitraryEventsFunctionsWorker {
public:
  FunctionParameterObjectTypeRenamer(const gd::String &oldObjectType_,
                                     const gd::String &newObjectType_)
      : oldObjectType(oldObjectType_), newObjectType(newObjectType_){};
  virtual ~FunctionParameterObjectTypeRenamer();

private:
  virtual void DoVisitEventsFunction(gd::EventsFunction &eventsFunction) override;

  gd::String oldObjectType;
  gd::String newObjectType;
};

} // namespace gd
