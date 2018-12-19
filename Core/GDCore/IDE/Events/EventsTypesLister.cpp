/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsTypesLister.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

bool EventsTypesLister::DoVisitEvent(gd::BaseEvent& event) {
  allEventsTypes.push_back(event.GetType());

  return false;
}

bool EventsTypesLister::DoVisitInstruction(gd::Instruction& instruction,
                                           bool isCondition) {
  if (isCondition)
    allConditionsTypes.push_back(instruction.GetType());
  else
    allActionsTypes.push_back(instruction.GetType());

  return false;
}

EventsTypesLister::~EventsTypesLister() {}

}  // namespace gd
