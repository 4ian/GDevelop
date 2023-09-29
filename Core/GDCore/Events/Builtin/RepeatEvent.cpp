/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "RepeatEvent.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Serialization/SerializerElement.h"

using namespace std;

namespace gd {

RepeatEvent::RepeatEvent()
    : BaseEvent(),
      repeatNumberExpression(""),
      repeatNumberExpressionSelected(false) {}

vector<gd::InstructionsList*> RepeatEvent::GetAllConditionsVectors() {
  vector<gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<gd::InstructionsList*> RepeatEvent::GetAllActionsVectors() {
  vector<gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<pair<gd::Expression*, gd::ParameterMetadata> >
    RepeatEvent::GetAllExpressionsWithMetadata() {
  vector<pair<gd::Expression*, gd::ParameterMetadata> >
      allExpressionsWithMetadata;
  auto metadata = gd::ParameterMetadata().SetType("number");
  allExpressionsWithMetadata.push_back(
      std::make_pair(&repeatNumberExpression, metadata));

  return allExpressionsWithMetadata;
}

vector<const gd::InstructionsList*> RepeatEvent::GetAllConditionsVectors()
    const {
  vector<const gd::InstructionsList*> allConditions;
  allConditions.push_back(&conditions);

  return allConditions;
}

vector<const gd::InstructionsList*> RepeatEvent::GetAllActionsVectors() const {
  vector<const gd::InstructionsList*> allActions;
  allActions.push_back(&actions);

  return allActions;
}

vector<pair<const gd::Expression*, const gd::ParameterMetadata> >
    RepeatEvent::GetAllExpressionsWithMetadata() const {
  vector<pair<const gd::Expression*, const gd::ParameterMetadata> >
      allExpressionsWithMetadata;
  auto metadata = gd::ParameterMetadata().SetType("number");
  allExpressionsWithMetadata.push_back(
      std::make_pair(&repeatNumberExpression, metadata));

  return allExpressionsWithMetadata;
}

void RepeatEvent::SerializeTo(SerializerElement& element) const {
  element.AddChild("repeatExpression")
      .SetValue(repeatNumberExpression.GetPlainString());
  gd::EventsListSerialization::SerializeInstructionsTo(
      conditions, element.AddChild("conditions"));
  gd::EventsListSerialization::SerializeInstructionsTo(
      actions, element.AddChild("actions"));

  if (!events.IsEmpty())
    gd::EventsListSerialization::SerializeEventsTo(events,
                                                  element.AddChild("events"));
}

void RepeatEvent::UnserializeFrom(gd::Project& project,
                                  const SerializerElement& element) {
  repeatNumberExpression =
      gd::Expression(element.GetChild("repeatExpression", 0, "RepeatExpression")
                         .GetValue()
                         .GetString());
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
