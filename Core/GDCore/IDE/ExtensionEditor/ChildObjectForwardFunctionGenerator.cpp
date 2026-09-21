/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ChildObjectForwardFunctionGenerator.h"

#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void ChildObjectForwardFunctionGenerator::GenerateChildObjectForwardFunctions(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    gd::EventsBasedObject &eventsBasedObject,
    const gd::String &childObjectName) {
  if (!eventsBasedObject.GetObjects().HasObjectNamed(childObjectName)) {
    return;
  }
  auto &childObject = eventsBasedObject.GetObjects().GetObject(childObjectName);
  if (!project.HasEventsBasedObject(childObject.GetType())) {
    return;
  }
  auto &childEventsBasedObject =
      project.GetEventsBasedObject(childObject.GetType());
  for (auto &childEventsFunction :
       childEventsBasedObject.GetEventsFunctions().GetInternalVector()) {
    if (childEventsFunction->IsPrivate() ||
        childEventsFunction->IsDeprecated() ||
        gd::EventsBasedObject::IsObjectLifecycleEventsFunction(
            childEventsFunction->GetName())) {
      continue;
    }
    ChildObjectForwardFunctionGenerator::GenerateChildObjectForwardFunction(
        project, eventsFunctionsExtension, eventsBasedObject, childObjectName,
        *childEventsFunction);
  }
}

void ChildObjectForwardFunctionGenerator::GenerateChildObjectForwardFunction(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &parentEventsFunctionsExtension,
    gd::EventsBasedObject &parentEventsBasedObject,
    const gd::String &childObjectName,
    const gd::EventsFunction &childEventsFunction) {
  if (!parentEventsBasedObject.GetObjects().HasObjectNamed(childObjectName)) {
    return;
  }
  auto &childObject =
      parentEventsBasedObject.GetObjects().GetObject(childObjectName);
  if (!project.HasEventsBasedObject(childObject.GetType())) {
    return;
  }
  auto &childEventsBasedObject =
      project.GetEventsBasedObject(childObject.GetType());
  auto &functionName = childEventsFunction.GetName();
  if (parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
          functionName)) {
    return;
  }
  auto &parentEventsFunction =
      parentEventsBasedObject.GetEventsFunctions().InsertEventsFunction(
          childEventsFunction, 0);
  parentEventsFunction.GetEvents().Clear();
  parentEventsBasedObject.GetEventsFunctions()
      .AddMissingFunctionsInRootFolder();
  auto &rootFolder =
      parentEventsBasedObject.GetEventsFunctions().GetRootFolder();
  // TODO Handle sub-folders
  auto &folder =
      !childEventsFunction.GetGroup().empty()
          ? rootFolder.GetOrCreateChildFolder(childEventsFunction.GetGroup())
          : rootFolder;
  rootFolder.MoveFunctionFolderOrFunctionToAnotherFolder(
      rootFolder.GetFunctionNamed(parentEventsFunction.GetName()), folder,
      folder.GetChildrenCount());
  gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
      parentEventsFunctionsExtension, parentEventsBasedObject);

  auto childExtensionName =
      gd::PlatformExtension::GetExtensionFromFullObjectType(
          childObject.GetType());
  auto childFunctionType =
      gd::PlatformExtension::GetObjectEventsFunctionFullType(
          childExtensionName, childEventsBasedObject.GetName(), functionName);

  bool hasAnyBooleanParameter = false;
  for (auto &parameter :
       parentEventsFunction.GetParameters().GetInternalVector()) {
    if (parameter->GetValueTypeMetadata().IsBoolean()) {
      hasAnyBooleanParameter = true;
      break;
    }
  }
  if (hasAnyBooleanParameter &&
      parentEventsFunction.GetParameters().GetParametersCount() > 2) {
    auto &event = dynamic_cast<gd::CommentEvent &>(
        parentEventsFunction.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Comment", 0));
    event.SetComment("TODO: Please implement this function manually.");
    return;
  }
  auto &event = dynamic_cast<gd::StandardEvent &>(
      parentEventsFunction.GetEvents().InsertNewEvent(
          project, "BuiltinCommonInstructions::Standard", 0));
  switch (childEventsFunction.GetFunctionType()) {
  case gd::EventsFunction::FunctionType::ActionWithOperator:
  case gd::EventsFunction::FunctionType::Action: {
    if (parentEventsFunction.GetParameters().GetParametersCount() == 2 &&
        hasAnyBooleanParameter) {
      gd::Instruction condition;
      condition.SetType("BooleanVariable");
      condition.AddParameter("Value");
      condition.AddParameter("True");
      condition.AddParameter("");
      event.GetConditions().Insert(condition, 0);

      gd::Instruction action;
      action.SetType(childFunctionType);
      action.AddParameter(childObjectName);
      action.AddParameter("yes");
      event.GetActions().Insert(action, 0);
      {
        auto &event = dynamic_cast<gd::StandardEvent &>(
            parentEventsFunction.GetEvents().InsertNewEvent(
                project, "BuiltinCommonInstructions::Standard", 0));

        gd::Instruction condition;
        condition.SetType("BooleanVariable");
        condition.AddParameter("Value");
        condition.AddParameter("False");
        condition.AddParameter("");
        event.GetConditions().Insert(condition, 0);

        gd::Instruction action;
        action.SetType(childFunctionType);
        action.AddParameter(childObjectName);
        action.AddParameter("no");
        event.GetActions().Insert(action, 0);
      }
    } else {
      gd::Instruction action;
      action.SetType(childFunctionType);
      for (auto &parameter :
           childEventsFunction
               .GetParametersForEvents(
                   parentEventsBasedObject.GetEventsFunctions())
               .GetInternalVector()) {
        if (childEventsFunction.GetFunctionType() ==
                gd::EventsFunction::FunctionType::ActionWithOperator &&
            parameter->GetName() == "Value") {
          action.AddParameter("=");
        }
        action.AddParameter(parameter->GetName());
      }
      action.SetParameter(0, childObjectName);
      event.GetActions().Insert(action, 0);
      if (childEventsFunction.IsAsync()) {
        gd::Instruction action;
        action.SetType("BuiltinAsync::ResolveAsyncEventsFunction");
        event.GetActions().Insert(action, 1);
      }
    }
    break;
  }
  case gd::EventsFunction::FunctionType::Condition: {
    gd::Instruction condition;
    condition.SetType(childFunctionType);
    for (auto &parameter : childEventsFunction
                               .GetParametersForEvents(
                                   parentEventsBasedObject.GetEventsFunctions())
                               .GetInternalVector()) {
      condition.AddParameter(parameter->GetName());
    }
    condition.SetParameter(0, childObjectName);
    event.GetConditions().Insert(condition, 0);

    gd::Instruction action;
    action.SetType("SetReturnBoolean");
    action.AddParameter("True");
    event.GetActions().Insert(action, 0);
    if (childEventsFunction.IsAsync()) {
      gd::Instruction action;
      action.SetType("BuiltinAsync::ResolveAsyncEventsFunction");
      event.GetActions().Insert(action, 1);
    }
    break;
  }
  case gd::EventsFunction::FunctionType::ExpressionAndCondition:
  case gd::EventsFunction::FunctionType::Expression: {
    gd::Instruction action;
    action.SetType(childEventsFunction.GetExpressionType().IsNumber()
                       ? "SetReturnNumber"
                       : "SetReturnString");
    gd::String expression =
        childObjectName + "." + childEventsFunction.GetName() + "(";
    auto &parameters = childEventsFunction.GetParametersForEvents(
        parentEventsBasedObject.GetEventsFunctions());
    for (size_t i = 1; i < parameters.GetParametersCount(); i++) {
      if (i > 1) {
        expression += ", ";
      }
      expression += parameters.GetParameter(i).GetName();
    }
    expression += ")";
    action.AddParameter(expression);
    event.GetActions().Insert(action, 0);
    break;
  }
  default:
    break;
  }
}

bool ChildObjectForwardFunctionGenerator::HasAnyChildCustomObject(
    const gd::Project &project, gd::EventsBasedObject &eventsBasedObject) {
  for (auto &childObject : eventsBasedObject.GetObjects().GetObjects()) {
    if (project.HasEventsBasedObject(childObject->GetType())) {
      return true;
    }
  }
  return false;
}

std::vector<gd::String>
ChildObjectForwardFunctionGenerator::GetChildCustomObjectNames(
    const gd::Project &project, gd::EventsBasedObject &eventsBasedObject) {
  std::vector<gd::String> objectNames;
  for (auto &childObject : eventsBasedObject.GetObjects().GetObjects()) {
    if (project.HasEventsBasedObject(childObject->GetType())) {
      objectNames.push_back(childObject->GetName());
    }
  }
  return objectNames;
}

} // namespace gd
