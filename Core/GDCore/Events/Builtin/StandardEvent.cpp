/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "StandardEvent.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

StandardEvent::StandardEvent() : BaseEvent() {}

StandardEvent::~StandardEvent(){};

vector<const gd::InstructionsList*> StandardEvent::GetAllConditionsVectors()
    const {
  vector<const gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<const gd::InstructionsList*> StandardEvent::GetAllActionsVectors()
    const {
  vector<const gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}
vector<gd::InstructionsList*> StandardEvent::GetAllConditionsVectors() {
  vector<gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<gd::InstructionsList*> StandardEvent::GetAllActionsVectors() {
  vector<gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

void StandardEvent::SerializeTo(SerializerElement& element) const {
  gd::EventsListSerialization::SerializeInstructionsTo(
      conditions, element.AddChild("conditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(
      actions, element.AddChild("actions"));

  if (!events.IsEmpty())
    gd::EventsListSerialization::SerializeEventsTo(events,
                                                  element.AddChild("events"));
}

void StandardEvent::UnserializeFrom(gd::Project& project,
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
}

}  // namespace gd
