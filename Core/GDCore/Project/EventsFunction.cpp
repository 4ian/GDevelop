/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include "EventsFunction.h"
#include <vector>
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/EventsFunctionsContainer.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"

namespace gd {

EventsFunction::EventsFunction() : functionType(Action) {
  expressionType.SetName("expression");
}

const std::vector<gd::ParameterMetadata>& EventsFunction::GetParametersForEvents(
    const gd::EventsFunctionsContainer& functionsContainer) const {
  if (functionType != FunctionType::ActionWithOperator) {
    // For most function types, the parameters are specified in the function.
    return parameters;
  }
  // For ActionWithOperator, the parameters are auto generated.
  actionWithOperationParameters.clear();
  if (!functionsContainer.HasEventsFunctionNamed(getterName)) {
    return actionWithOperationParameters;
  }
  const auto& expression = functionsContainer.GetEventsFunction(getterName);
  const auto& expressionParameters = expression.parameters;
  const auto functionsSource = functionsContainer.GetOwner();
  const int expressionValueParameterIndex =
      functionsSource == gd::EventsFunctionsContainer::FunctionOwner::Behavior ?
      2 : 
      functionsSource == gd::EventsFunctionsContainer::FunctionOwner::Object ?
      1 :
      0;
  
  for (size_t i = 0;
       i < expressionValueParameterIndex && i < expressionParameters.size();
       i++)
  {
    actionWithOperationParameters.push_back(expressionParameters[i]);
  }
  gd::ParameterMetadata parameterMetadata;
  parameterMetadata.SetName("Value").SetValueTypeMetadata(expression.expressionType);
  actionWithOperationParameters.push_back(parameterMetadata);
  for (size_t i = expressionValueParameterIndex;
       i < expressionParameters.size();
       i++)
  {
    actionWithOperationParameters.push_back(expressionParameters[i]);
  }

  return actionWithOperationParameters;
}

void EventsFunction::SerializeTo(SerializerElement& element) const {
  element.SetAttribute("name", name);
  element.SetAttribute("fullName", fullName);
  if (!description.empty()) {
    element.SetAttribute("description", description);
  }
  element.SetAttribute("sentence", sentence);
  if (!group.empty()) {
    element.SetAttribute("group", group);
  }
  if (!getterName.empty()) {
    element.SetAttribute("getterName", getterName);
  }
  if (isPrivate) {
    element.SetBoolAttribute("private", isPrivate);
  }
  if (isAsync) {
    element.SetBoolAttribute("async", isAsync);
  }
  events.SerializeTo(element.AddChild("events"));

  gd::String functionTypeStr = "Action";
  if (functionType == Condition)
    functionTypeStr = "Condition";
  else if (functionType == Expression) {
    functionTypeStr = "Expression";

    // Compatibility code for version 5.1.147 and older.
    // There is no longer distinction between number and string in the function
    // type directly. The expression type is now used for this.
    if (expressionType.IsString()) {
      functionTypeStr = "StringExpression";
    }
  }
  else if (functionType == ExpressionAndCondition) {
    functionTypeStr = "ExpressionAndCondition";
  }
  else if (functionType == ActionWithOperator)
    functionTypeStr = "ActionWithOperator";
  element.SetAttribute("functionType", functionTypeStr);

  if (this->IsExpression()) {
    expressionType.SerializeTo(element.AddChild("expressionType"));
  }
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
  getterName = element.GetStringAttribute("getterName");
  isPrivate = element.GetBoolAttribute("private");
  isAsync = element.GetBoolAttribute("async");
  events.UnserializeFrom(project, element.GetChild("events"));

  gd::String functionTypeStr = element.GetStringAttribute("functionType");

  if (functionTypeStr == "Condition")
    functionType = Condition;
  else if (functionTypeStr == "Expression" || functionTypeStr == "StringExpression") {
    functionType = Expression;
    if (element.HasChild("expressionType")) {
      expressionType.UnserializeFrom(element.GetChild("expressionType"));
    }
    else {
      // Compatibility code for version 5.1.147 and older.
      // There is no longer distinction between number and string in the function
      // type directly. The expression type is now used for this.
      expressionType.SetName(functionTypeStr == "StringExpression" ? "string" : "expression");
    }
  }
  else if (functionTypeStr == "ExpressionAndCondition") {
    functionType = ExpressionAndCondition;
    expressionType.UnserializeFrom(element.GetChild("expressionType"));
  }
  else if (functionTypeStr == "ActionWithOperator")
    functionType = ActionWithOperator;
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
