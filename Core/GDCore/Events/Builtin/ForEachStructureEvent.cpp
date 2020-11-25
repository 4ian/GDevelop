/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ForEachStructureEvent.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/TinyXml/tinyxml.h"

using namespace std;

namespace gd {

ForEachStructureEvent::ForEachStructureEvent()
    : BaseEvent(), variable("child"), structure("") {}

vector<gd::InstructionsList*> ForEachStructureEvent::GetAllConditionsVectors() {
  vector<gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<gd::InstructionsList*> ForEachStructureEvent::GetAllActionsVectors() {
  vector<gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<const gd::InstructionsList*>
ForEachStructureEvent::GetAllConditionsVectors() const {
  vector<const gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<const gd::InstructionsList*>
ForEachStructureEvent::GetAllActionsVectors() const {
  vector<const gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

void ForEachStructureEvent::SerializeTo(SerializerElement& element) const {
  element.AddChild("structure").SetValue(structure);
  element.AddChild("variable").SetValue(variable);
  gd::EventsListSerialization::SerializeInstructionsTo(
      conditions, element.AddChild("conditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(
      actions, element.AddChild("actions"));
  gd::EventsListSerialization::SerializeEventsTo(events,
                                                 element.AddChild("events"));
}

void ForEachStructureEvent::UnserializeFrom(gd::Project& project,
                                            const SerializerElement& element) {
  structure = element.GetChild("structure", 0, "").GetValue().GetString();
  variable = element.GetChild("variable", 0, "").GetValue().GetString();
  gd::EventsListSerialization::UnserializeInstructionsFrom(
      project, conditions, element.GetChild("conditions", 0, "Conditions"));
  gd::EventsListSerialization::UnserializeInstructionsFrom(
      project, actions, element.GetChild("actions", 0, "Actions"));
  gd::EventsListSerialization::UnserializeEventsFrom(
      project, events, element.GetChild("events", 0, "Events"));
}

}  // namespace gd
