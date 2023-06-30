/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorObjectTypeRenamer.h"

#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/String.h"
#include <map>
#include <memory>
#include <vector>

namespace gd {

void BehaviorObjectTypeRenamer::DoVisitEventBasedBehavior(
    gd::EventsBasedBehavior &eventsBasedBehavior) {
  if (eventsBasedBehavior.GetObjectType().GetName() == oldObjectType) {
    eventsBasedBehavior.GetObjectType().SetName(newObjectType);
  }
}

BehaviorObjectTypeRenamer::~BehaviorObjectTypeRenamer() {}

} // namespace gd
