/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#include "WhileEvent.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

vector<gd::InstructionsList*> WhileEvent::GetAllConditionsVectors() {
  vector<gd::InstructionsList*> allConditions;
  allConditions.push_back(&whileConditions);
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<gd::InstructionsList*> WhileEvent::GetAllActionsVectors() {
  vector<gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<const gd::InstructionsList*> WhileEvent::GetAllConditionsVectors()
    const {
  vector<const gd::InstructionsList*> allConditions;
  allConditions.push_back(&whileConditions);
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<const gd::InstructionsList*> WhileEvent::GetAllActionsVectors() const {
  vector<const gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

void WhileEvent::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("infiniteLoopWarning", infiniteLoopWarning);
  gd::EventsListSerialization::SerializeInstructionsTo(
      whileConditions, element.AddChild("whileConditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(
      conditions, element.AddChild("conditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(
      actions, element.AddChild("actions"));

  if (!events.IsEmpty())
    gd::EventsListSerialization::SerializeEventsTo(events,
                                                  element.AddChild("events"));
}

void WhileEvent::UnserializeFrom(gd::Project& project,
                                 const SerializerElement& element) {
  justCreatedByTheUser = false;
  infiniteLoopWarning = element.GetBoolAttribute("infiniteLoopWarning");
  gd::EventsListSerialization::UnserializeInstructionsFrom(
      project,
      whileConditions,
      element.GetChild("whileConditions", 0, "WhileConditions"));
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
#endif
