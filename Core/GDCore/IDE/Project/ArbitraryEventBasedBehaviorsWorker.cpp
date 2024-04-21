/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ArbitraryEventBasedBehaviorsWorker.h"

#include <iostream>
#include <map>
#include <memory>
#include <vector>

#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/String.h"

using namespace std;

namespace gd {

ArbitraryEventBasedBehaviorsWorker::~ArbitraryEventBasedBehaviorsWorker() {}

void ArbitraryEventBasedBehaviorsWorker::VisitEventBasedBehaviors(gd::SerializableWithNameList<gd::EventsBasedBehavior>& behaviors) {
  DoVisitEventBasedBehaviors(behaviors);

    for (auto&& eventsBasedBehavior : behaviors.GetInternalVector()) {
      VisitEventBasedBehavior(*eventsBasedBehavior);
    }
}

void ArbitraryEventBasedBehaviorsWorker::VisitEventBasedBehavior(gd::EventsBasedBehavior& behavior) {
  DoVisitEventBasedBehavior(behavior);
}

}  // namespace gd
