/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "FunctionParameterBehaviorTypeRenamer.h"

#include "GDCore/Project/EventsFunction.h"
#include "GDCore/String.h"
#include <map>
#include <memory>
#include <vector>

namespace gd {

void FunctionParameterBehaviorTypeRenamer::DoVisitEventsFunction(
    gd::EventsFunction &eventsFunction) {
  for (auto &&parameter : eventsFunction.GetParameters()) {
    if (gd::ParameterMetadata::IsBehavior(parameter.GetType()) &&
        parameter.GetExtraInfo() == oldBehaviorType) {
      parameter.SetExtraInfo(newBehaviorType);
    }
  }
}

FunctionParameterBehaviorTypeRenamer::~FunctionParameterBehaviorTypeRenamer() {}

} // namespace gd
