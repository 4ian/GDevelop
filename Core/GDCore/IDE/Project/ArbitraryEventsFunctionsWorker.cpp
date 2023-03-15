/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ArbitraryEventsFunctionsWorker.h"

#include <iostream>
#include <map>
#include <memory>
#include <vector>

#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/String.h"

using namespace std;

namespace gd {

ArbitraryEventsFunctionsWorker::~ArbitraryEventsFunctionsWorker() {}

void ArbitraryEventsFunctionsWorker::VisitEventsFunctionContainer(
    gd::EventsFunctionsContainer& functions) {
  DoVisitEventsFunctionsContainer(functions);

  for (auto&& function : functions.GetInternalVector()) {
    VisitEventsFunction(*function);
  }
}

void ArbitraryEventsFunctionsWorker::VisitEventsFunction(gd::EventsFunction& eventsFunction) {
  DoVisitEventsFunction(eventsFunction);
}

}  // namespace gd
