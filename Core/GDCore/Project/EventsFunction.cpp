/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsFunction.h"
#include <vector>
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

EventsFunction::EventsFunction() : functionType(Action) {}

void EventsFunction::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);
  element.SetAttribute("description", description);
  element.SetAttribute("sentence", sentence);
  element.SetAttribute("group", group);
  element.SetBoolAttribute("private", isPrivate);
  events.SerializeTo(element.AddChild("events"));

  gd::String functionTypeStr = "Action";
  if (functionType == Condition)
    functionTypeStr = "Condition";
  else if (functionType == Expression)
    functionTypeStr = "Expression";
  else if (functionType == StringExpression)
    functionTypeStr = "StringExpression";
  element.SetAttribute("functionType", functionTypeStr);

  gd::SerializerElement& parametersElement = element.AddChild("parameters");
  parametersElement.ConsiderAsArrayOf("parameter");
  for (const auto& parameter : parameters) {
    parameter.SerializeTo(parametersElement.AddChild("parameter"));
  }

  objectGroups.SerializeTo(element.AddChild("objectGroups"));
}

void EventsFunction::UnserializeFrom(gd::Project& project,
                                     const SerializerElement& element) {
  name = element.GetStringAttribute("name");
  fullName = element.GetStringAttribute("fullName");
  description = element.GetStringAttribute("description");
  sentence = element.GetStringAttribute("sentence");
  group = element.GetStringAttribute("group");
  isPrivate = element.GetBoolAttribute("private");
  events.UnserializeFrom(project, element.GetChild("events"));

  gd::String functionTypeStr = element.GetStringAttribute("functionType");
  if (functionTypeStr == "Condition")
    functionType = Condition;
  else if (functionTypeStr == "Expression")
    functionType = Expression;
  else if (functionTypeStr == "StringExpression")
    functionType = StringExpression;
  else
    functionType = Action;

  const gd::SerializerElement& parametersElement =
      element.GetChild("parameters");
  parameters.clear();
  parametersElement.ConsiderAsArrayOf("parameter");
  for (std::size_t i = 0; i < parametersElement.GetChildrenCount(); ++i) {
    ParameterMetadata parameter;
    parameter.UnserializeFrom(parametersElement.GetChild(i));
    parameters.push_back(parameter);
  }

  objectGroups.UnserializeFrom(element.GetChild("objectGroups"));
}

}  // namespace gd

#endif
