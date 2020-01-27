/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "ForEachEvent.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/TinyXml/tinyxml.h"

using namespace std;

namespace gd {

ForEachEvent::ForEachEvent()
    : BaseEvent(), objectsToPick(""), objectsToPickSelected(false) {}

vector<gd::InstructionsList*> ForEachEvent::GetAllConditionsVectors() {
  vector<gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<gd::InstructionsList*> ForEachEvent::GetAllActionsVectors() {
  vector<gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<gd::Expression*> ForEachEvent::GetAllExpressions() {
  vector<gd::Expression*> allExpressions;
  allExpressions.push_back(&objectsToPick);

  return allExpressions;
}
vector<const gd::InstructionsList*> ForEachEvent::GetAllConditionsVectors()
    const {
  vector<const gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<const gd::InstructionsList*> ForEachEvent::GetAllActionsVectors() const {
  vector<const gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<const gd::Expression*> ForEachEvent::GetAllExpressions() const {
  vector<const gd::Expression*> allExpressions;
  allExpressions.push_back(&objectsToPick);

  return allExpressions;
}

void ForEachEvent::SerializeTo(SerializerElement& element) const {
  element.AddChild("object").SetValue(objectsToPick.GetPlainString());
  gd::EventsListSerialization::SerializeInstructionsTo(
      conditions, element.AddChild("conditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(
      actions, element.AddChild("actions"));
  gd::EventsListSerialization::SerializeEventsTo(events,
                                                 element.AddChild("events"));
}

void ForEachEvent::UnserializeFrom(gd::Project& project,
                                   const SerializerElement& element) {
  objectsToPick = gd::Expression(
      element.GetChild("object", 0, "Object").GetValue().GetString());
  gd::EventsListSerialization::UnserializeInstructionsFrom(
      project, conditions, element.GetChild("conditions", 0, "Conditions"));
  gd::EventsListSerialization::UnserializeInstructionsFrom(
      project, actions, element.GetChild("actions", 0, "Actions"));
  gd::EventsListSerialization::UnserializeEventsFrom(
      project, events, element.GetChild("events", 0, "Events"));
}

}  // namespace gd
