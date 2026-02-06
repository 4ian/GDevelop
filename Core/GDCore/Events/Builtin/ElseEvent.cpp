/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ElseEvent.h"

#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

ElseEvent::ElseEvent()
    : BaseEvent(), variables(gd::VariablesContainer::SourceType::Local) {}

ElseEvent::~ElseEvent(){};

vector<const gd::InstructionsList*> ElseEvent::GetAllConditionsVectors() const {
  vector<const gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<const gd::InstructionsList*> ElseEvent::GetAllActionsVectors() const {
  vector<const gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<gd::InstructionsList*> ElseEvent::GetAllConditionsVectors() {
  vector<gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<gd::InstructionsList*> ElseEvent::GetAllActionsVectors() {
  vector<gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

void ElseEvent::SerializeTo(SerializerElement& element) const {
  gd::EventsListSerialization::SerializeInstructionsTo(
      conditions, element.AddChild("conditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(actions,
                                                      element.AddChild("actions"));

  if (!events.IsEmpty())
    gd::EventsListSerialization::SerializeEventsTo(events,
                                                  element.AddChild("events"));
  if (HasVariables()) {
    variables.SerializeTo(element.AddChild("variables"));
  }
}

void ElseEvent::UnserializeFrom(gd::Project& project,
                                const SerializerElement& element) {
  gd::EventsListSerialization::UnserializeInstructionsFrom(
      project, conditions, element.GetChild("conditions", 0, "Conditions"));
  gd::EventsListSerialization::UnserializeInstructionsFrom(
      project, actions, element.GetChild("actions", 0, "Actions"));

  events.Clear();
  if (element.HasChild("events", "Events")) {
    gd::EventsListSerialization::UnserializeEventsFrom(
        project, events, element.GetChild("events", 0, "Events"));
  }

  variables.Clear();
  if (element.HasChild("variables")) {
    variables.UnserializeFrom(element.GetChild("variables"));
  }
}

}  // namespace gd
