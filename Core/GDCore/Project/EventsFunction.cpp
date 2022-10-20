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

EventsFunction::EventsFunction() : functionType(Action) {}

const std::vector<gd::ParameterMetadata>& EventsFunction::GetParametersForEvents(
    const gd::EventsFunctionsContainer& functionsContainer) const {
  if (functionType != FunctionType::ActionWithOperator) {
    return parameters;
  }
  actionWithOperationParameters.clear();
  if (!functionsContainer.HasEventsFunctionNamed(getterName)) {
    return actionWithOperationParameters;
  }
  const auto& expression = functionsContainer.GetEventsFunction(getterName);
  const auto& expressionParameters = expression.parameters;
  const auto functionsSource = functionsContainer.GetSource();
  const int expressionValueParameterIndex =
      functionsSource == gd::EventsFunctionsContainer::FunctionSource::Behavior ?
      2 : 
      functionsSource == gd::EventsFunctionsContainer::FunctionSource::Object ?
      1 :
      0;
  
  for (size_t i = 0;
       i < expressionValueParameterIndex && i < expressionParameters.size();
       i++)
  {
    actionWithOperationParameters.push_back(expressionParameters[i]);
  }
  gd::ParameterMetadata parameterMetadata;
  parameterMetadata.SetName("Value")
                   .SetType(expression.IsStringExpression() ? "string" : "expression");
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
  element.SetAttribute("description", description);
  element.SetAttribute("sentence", sentence);
  element.SetAttribute("group", group);
  element.SetAttribute("getterName", getterName);
  element.SetBoolAttribute("private", isPrivate);
  events.SerializeTo(element.AddChild("events"));

  gd::String functionTypeStr = "Action";
  if (functionType == Condition)
    functionTypeStr = "Condition";
  else if (functionType == Expression)
    functionTypeStr = "Expression";
  else if (functionType == StringExpression)
    functionTypeStr = "StringExpression";
  else if (functionType == ExpressionAndCondition)
    functionTypeStr = "ExpressionAndCondition";
  else if (functionType == StringExpressionAndCondition)
    functionTypeStr = "StringExpressionAndCondition";
  else if (functionType == ActionWithOperator)
    functionTypeStr = "ActionWithOperator";
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
  getterName = element.GetStringAttribute("getterName");
  isPrivate = element.GetBoolAttribute("private");
  events.UnserializeFrom(project, element.GetChild("events"));

  gd::String functionTypeStr = element.GetStringAttribute("functionType");
  if (functionTypeStr == "Condition")
    functionType = Condition;
  else if (functionTypeStr == "Expression")
    functionType = Expression;
  else if (functionTypeStr == "StringExpression")
    functionType = StringExpression;
  else if (functionTypeStr == "ExpressionAndCondition")
    functionType = ExpressionAndCondition;
  else if (functionTypeStr == "StringExpressionAndCondition")
    functionType = StringExpressionAndCondition;
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
