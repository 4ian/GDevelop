/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ArbitraryFunctionsWorker.h"

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

ArbitraryFunctionsWorker::~ArbitraryFunctionsWorker() {}

void ArbitraryFunctionsWorker::VisitFunctionContainer(
    gd::EventsFunctionsContainer& functions) {
  DoVisitFunctionsContainer(functions);

  for (auto&& function : functions.GetInternalVector()) {
    VisitFunction(*function);
  }
}

void ArbitraryFunctionsWorker::VisitFunction(gd::EventsFunction& eventsFunction) {
  DoVisitFunction(eventsFunction);

  for (auto&& parameter : eventsFunction.GetParameters()) {
    VisitParameter(parameter);
  }
}

void ArbitraryFunctionsWorker::VisitParameter(gd::ParameterMetadata& parameter) {
  DoVisitParameter(parameter);
}

}  // namespace gd
