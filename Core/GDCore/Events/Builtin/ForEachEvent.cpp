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
    : BaseEvent(), objectsToPick("") {}

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

vector<pair<gd::Expression*, gd::ParameterMetadata> >
    ForEachEvent::GetAllExpressionsWithMetadata() {
  vector<pair<gd::Expression*, gd::ParameterMetadata> >
      allExpressionsWithMetadata;
  auto metadata = gd::ParameterMetadata().SetType("object");
  allExpressionsWithMetadata.push_back(
      std::make_pair(&objectsToPick, metadata));

  return allExpressionsWithMetadata;
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

vector<pair<const gd::Expression*, const gd::ParameterMetadata> >
    ForEachEvent::GetAllExpressionsWithMetadata() const {
  vector<pair<const gd::Expression*, const gd::ParameterMetadata> >
      allExpressionsWithMetadata;
  auto metadata = gd::ParameterMetadata().SetType("object");
  allExpressionsWithMetadata.push_back(
      std::make_pair(&objectsToPick, metadata));

  return allExpressionsWithMetadata;
}

void ForEachEvent::SerializeTo(SerializerElement& element) const {
  element.AddChild("object").SetValue(objectsToPick.GetPlainString());
  gd::EventsListSerialization::SerializeInstructionsTo(
      conditions, element.AddChild("conditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(
      actions, element.AddChild("actions"));

  if (!events.IsEmpty())
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

  events.Clear();
  if (element.HasChild("events", "Events")) {
    gd::EventsListSerialization::UnserializeEventsFrom(
        project, events, element.GetChild("events", 0, "Events"));
  }
}

}  // namespace gd
