/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering project refactoring
 */
#include "GDCore/IDE/WholeProjectRefactorer.h"

#include <algorithm>
#include <stdexcept>

#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/UnfilledRequiredBehaviorPropertyProblem.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "catch.hpp"

namespace {

const gd::StandardEvent &EnsureStandardEvent(const gd::BaseEvent &baseEvent) {
  const gd::StandardEvent *standardEvent =
      dynamic_cast<const gd::StandardEvent *>(&baseEvent);
  INFO("The inspected event is "
       << (standardEvent ? "a standard event" : "not a standard event"));
  REQUIRE(standardEvent != nullptr);

  return *standardEvent;
}

const gd::String &
GetEventFirstActionFirstParameterString(const gd::BaseEvent &event) {
  auto &actions = EnsureStandardEvent(event).GetActions();
  REQUIRE(actions.IsEmpty() == false);
  REQUIRE(actions.Get(0).GetParametersCount() != 0);

  return actions.Get(0).GetParameter(0).GetPlainString();
}

const gd::String &GetEventFirstConditionType(const gd::BaseEvent &event) {
  auto &conditions = EnsureStandardEvent(event).GetConditions();
  REQUIRE(conditions.IsEmpty() == false);

  return conditions.Get(0).GetType();
}

const gd::String &GetEventFirstActionType(const gd::BaseEvent &event) {
  auto &actions = EnsureStandardEvent(event).GetActions();
  REQUIRE(actions.IsEmpty() == false);

  return actions.Get(0).GetType();
}

enum TestEvent {
  FreeFunctionAction,
  FreeFunctionWithExpression,
  FreeConditionFromExpressionAndCondition,
  FreeExpressionFromExpressionAndCondition,
  FreeFunctionWithObjects,
  FreeFunctionWithObjectExpression,

  BehaviorAction,
  BehaviorPropertyAction,
  BehaviorPropertyCondition,
  BehaviorPropertyExpression,
  BehaviorExpression,
  IllNamedBehaviorExpression,
  NoParameterBehaviorExpression,
  NoParameterIllNamedBehaviorExpression,
  BehaviorConditionFromExpressionAndCondition,
  BehaviorExpressionFromExpressionAndCondition,

  ObjectAction,
  ObjectPropertyAction,
  ObjectPropertyCondition,
  ObjectPropertyExpression,
  ObjectExpression,
  IllNamedObjectExpression,
  NoParameterObjectExpression,
  NoParameterIllNamedObjectExpression,
  ObjectConditionFromExpressionAndCondition,
  ObjectExpressionFromExpressionAndCondition,
};

const std::vector<const gd::EventsList *> GetEventsLists(gd::Project &project) {
  std::vector<const gd::EventsList *> eventLists;
  auto &scene = project.GetLayout("Scene").GetEvents();
  auto &externalEvents =
      project.GetExternalEvents("ExternalEvents").GetEvents();
  auto &objectFunctionEvents =
      project.GetEventsFunctionsExtension("MyEventsExtension")
          .GetEventsBasedObjects()
          .Get("MyOtherEventsBasedObject")
          .GetEventsFunctions()
          .GetEventsFunction("MyObjectEventsFunction")
          .GetEvents();
  eventLists.push_back(&scene);
  eventLists.push_back(&externalEvents);
  eventLists.push_back(&objectFunctionEvents);
  return eventLists;
}

const void SetupEvents(gd::EventsList &eventList) {

  // Add some free functions usages in events
  {
    if (eventList.GetEventsCount() != FreeFunctionAction) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsFunction
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyEventsExtension::MyEventsFunction");
      instruction.SetParametersCount(4);
      instruction.SetParameter(0, gd::Expression("scene"));
      instruction.SetParameter(1, gd::Expression("First parameter"));
      instruction.SetParameter(2, gd::Expression("Second parameter"));
      instruction.SetParameter(3, gd::Expression("Third parameter"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != FreeFunctionWithExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsFunctionExpression
    {
      gd::StandardEvent event;
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression(
              "1 + MyEventsExtension::MyEventsFunctionExpression(123, 456)"));
      event.GetActions().Insert(action);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != FreeConditionFromExpressionAndCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsFunctionExpressionAndCondition
    // as a condition.
    {
      gd::StandardEvent event;
      gd::Instruction condition;
      condition.SetType("MyEventsExtension::MyEventsFunctionExpressionAndCondition");
      condition.SetParametersCount(5);
      condition.SetParameter(
          0,
          gd::Expression("scene"));
      condition.SetParameter(
          1,
          gd::Expression(">"));
      condition.SetParameter(
          2,
          gd::Expression("2"));
      condition.SetParameter(
          3,
          gd::Expression("111"));
      condition.SetParameter(
          4,
          gd::Expression("222"));
      event.GetConditions().Insert(condition);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != FreeExpressionFromExpressionAndCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsFunctionExpressionAndCondition
    // as an expression.
    {
      gd::StandardEvent event;
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression(
              "2 + MyEventsExtension::MyEventsFunctionExpressionAndCondition(111, 222)"));
      event.GetActions().Insert(action);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != FreeFunctionWithObjects) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to objects
    {
      gd::StandardEvent event;
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithObjects");
      action.SetParametersCount(2);
      action.SetParameter(0, gd::Expression("ObjectWithMyBehavior"));
      action.SetParameter(1, gd::Expression("MyCustomObject"));
      event.GetActions().Insert(action);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != FreeFunctionWithObjectExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to objects in an expression
    {
      gd::StandardEvent event;
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression(
              "ObjectWithMyBehavior.GetObjectNumber()"));
      event.GetActions().Insert(action);
      eventList.InsertEvent(event);
    }
  }

  // Add some events based behavior usages in events
  {
    if (eventList.GetEventsCount() != BehaviorAction) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunction
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunction");
      instruction.SetParametersCount(5);
      instruction.SetParameter(0, gd::Expression("ObjectWithMyBehavior"));
      instruction.SetParameter(1, gd::Expression("MyBehavior"));
      instruction.SetParameter(2, gd::Expression("First parameter"));
      instruction.SetParameter(3, gd::Expression("Second parameter"));
      instruction.SetParameter(4, gd::Expression("Third parameter"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != BehaviorPropertyAction) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout using "MyProperty" action
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedBehavior::" +
          gd::EventsBasedBehavior::GetPropertyActionName("MyProperty"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != BehaviorPropertyCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout using "MyProperty" condition
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedBehavior::" +
          gd::EventsBasedBehavior::GetPropertyConditionName("MyProperty"));
      event.GetConditions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != BehaviorPropertyExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout using "MyProperty" expression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("ObjectWithMyBehavior.MyBehavior::" +
                            gd::EventsBasedBehavior::GetPropertyExpressionName(
                                "MyProperty") +
                            "()"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != BehaviorExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression("1 + "
                         "ObjectWithMyBehavior.MyBehavior::"
                         "MyBehaviorEventsFunctionExpression(123, 456, 789)"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != IllNamedBehaviorExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event **wrongly** referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    // (it's ill-named).
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression("2 + "
                         "ObjectWithMyBehavior::MyBehavior."
                         "MyBehaviorEventsFunctionExpression(123, 456, 789)"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != NoParameterBehaviorExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    // function name without calling the function.
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("3 + "
                            "ObjectWithMyBehavior.MyBehavior::"
                            "MyBehaviorEventsFunctionExpression"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != NoParameterIllNamedBehaviorExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event **wrongly** referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpression
    // function name without calling the function (it's ill-named).
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("4 + "
                            "ObjectWithMyBehavior::MyBehavior."
                            "MyBehaviorEventsFunctionExpression"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != BehaviorConditionFromExpressionAndCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the external events referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpressionAndCondition
    // as a condition.
    {
      gd::StandardEvent event;
      gd::Instruction condition;
      condition.SetType("MyEventsExtension::MyEventsBasedBehavior::"
          "MyBehaviorEventsFunctionExpressionAndCondition");
      condition.SetParametersCount(6);
      condition.SetParameter(
          0,
          gd::Expression("ObjectWithMyBehavior"));
      condition.SetParameter(
          1,
          gd::Expression("MyBehavior"));
      condition.SetParameter(
          2,
          gd::Expression(">"));
      condition.SetParameter(
          3,
          gd::Expression("5"));
      condition.SetParameter(
          4,
          gd::Expression("111"));
      condition.SetParameter(
          5,
          gd::Expression("222"));
      event.GetConditions().Insert(condition);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != BehaviorExpressionFromExpressionAndCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the external events referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunctionExpressionAndCondition
    // as an expression.
    {
      gd::StandardEvent event;
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression("5 + "
                          "ObjectWithMyBehavior.MyBehavior::"
                          "MyBehaviorEventsFunctionExpressionAndCondition(111, 222)"));
      event.GetActions().Insert(action);
      eventList.InsertEvent(event);
    }
  }

  // Add some events based object usages in events
  {
    if (eventList.GetEventsCount() != ObjectAction) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout referring to
    // MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunction
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunction");
      instruction.SetParametersCount(4);
      instruction.SetParameter(0, gd::Expression("MyCustomObject"));
      instruction.SetParameter(1, gd::Expression("First parameter"));
      instruction.SetParameter(2, gd::Expression("Second parameter"));
      instruction.SetParameter(3, gd::Expression("Third parameter"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != ObjectPropertyAction) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout using "MyProperty" action
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedObject::" +
          gd::EventsBasedObject::GetPropertyActionName("MyProperty"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != ObjectPropertyCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout using "MyProperty" condition
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedObject::" +
          gd::EventsBasedObject::GetPropertyConditionName("MyProperty"));
      event.GetConditions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != ObjectPropertyExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the layout using "MyProperty" expression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("MyCustomObject." +
                            gd::EventsBasedObject::GetPropertyExpressionName(
                                "MyProperty") +
                            "()"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != ObjectExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunctionExpression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("1 + "
                            "MyCustomObject."
                            "MyObjectEventsFunctionExpression(123, 456, 789)"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != IllNamedObjectExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event **wrongly** referring to
    // MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunctionExpression
    // (it's ill-named).
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("2 + "
                            "MyCustomObject::"
                            "MyObjectEventsFunctionExpression(123, 456, 789)"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != NoParameterObjectExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event referring to
    // MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunctionExpression
    // function name without calling the function.
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("3 + "
                            "MyCustomObject."
                            "MyObjectEventsFunctionExpression"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != NoParameterIllNamedObjectExpression) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event **wrongly** referring to
    // MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunctionExpression
    // function name without calling the function (it's ill-named).
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0, gd::Expression("4 + "
                            "MyCustomObject::"
                            "MyObjectEventsFunctionExpression"));
      event.GetActions().Insert(instruction);
      eventList.InsertEvent(event);
    }
    if (eventList.GetEventsCount() != ObjectConditionFromExpressionAndCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the external events referring to
    // MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunctionExpressionAndCondition
    // as a condition.
    {
      gd::StandardEvent event;
      gd::Instruction condition;
      condition.SetType("MyEventsExtension::MyEventsBasedObject::"
          "MyObjectEventsFunctionExpressionAndCondition");
      condition.SetParametersCount(5);
      condition.SetParameter(
          0,
          gd::Expression("MyCustomObject"));
      condition.SetParameter(
          1,
          gd::Expression(">"));
      condition.SetParameter(
          2,
          gd::Expression("5"));
      condition.SetParameter(
          3,
          gd::Expression("111"));
      condition.SetParameter(
          4,
          gd::Expression("222"));
      event.GetConditions().Insert(condition);
      eventList.InsertEvent(event);
    }

    if (eventList.GetEventsCount() != ObjectExpressionFromExpressionAndCondition) {
      throw std::logic_error("Invalid events setup: " + std::to_string(eventList.GetEventsCount()));
    }
    // Create an event in the external events referring to
    // MyEventsExtension::MyEventsBasedObject::MyObjectEventsFunctionExpressionAndCondition
    // as an expression.
    {
      gd::StandardEvent event;
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression("5 + "
                          "MyCustomObject."
                          "MyObjectEventsFunctionExpressionAndCondition(111, 222)"));
      event.GetActions().Insert(action);
      eventList.InsertEvent(event);
    }
  }
}

gd::EventsFunctionsExtension &
SetupProjectWithEventsFunctionExtension(gd::Project &project) {
  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

  // Add a events based behavior
  {
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyEventsBasedBehavior", 0);
    eventsBasedBehavior.SetFullName("My events based behavior");
    eventsBasedBehavior.SetDescription("An events based behavior for test");
    eventsBasedBehavior.SetObjectType("MyEventsExtension::MyEventsBasedObject");

    // Add functions, and parameters that should be there by convention.
    auto &behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();
    auto &behaviorAction = behaviorEventsFunctions.InsertNewEventsFunction(
        "MyBehaviorEventsFunction", 0);
    behaviorAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Object")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedObject"));
    behaviorAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Behavior")
            .SetType("behavior")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedBehavior"));
    behaviorAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("OtherObject")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedObject"));
    behaviorAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("OtherBehavior")
            .SetType("behavior")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedBehavior"));

    auto &behaviorExpression =
        behaviorEventsFunctions
            .InsertNewEventsFunction("MyBehaviorEventsFunctionExpression", 1)
            .SetFunctionType(gd::EventsFunction::Expression);
    behaviorExpression.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Object")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedObject"));
    behaviorExpression.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Behavior")
            .SetType("behavior")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedBehavior"));

    auto &behaviorExpressionAndCondition =
        behaviorEventsFunctions
            .InsertNewEventsFunction("MyBehaviorEventsFunctionExpressionAndCondition", 2)
            .SetFunctionType(gd::EventsFunction::ExpressionAndCondition);
    behaviorExpressionAndCondition.GetParameters().push_back(
        gd::ParameterMetadata().SetName("Object").SetType("object"));
    behaviorExpressionAndCondition.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Behavior")
            .SetType("behavior")
            .SetExtraInfo("MyExtension::MyEventsBasedBehavior"));
    behaviorExpressionAndCondition.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Value1")
            .SetType("expression"));
    behaviorExpressionAndCondition.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Value2")
            .SetType("expression"));

    // Add property
    eventsBasedBehavior.GetPropertyDescriptors()
        .InsertNew("MyProperty", 0)
        .SetType("Number");
  }

  // Add a events based object
  {
    auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
        "MyEventsBasedObject", 0);
    eventsBasedObject.SetFullName("My events based object");
    eventsBasedObject.SetDescription("An events based object for test");

    // Add functions and parameters that should be there by convention.
    auto &objectEventsFunctions = eventsBasedObject.GetEventsFunctions();
    auto &objectAction = objectEventsFunctions.InsertNewEventsFunction(
        "MyObjectEventsFunction", 0);
    objectAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Object")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedObject"));
    objectAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("OtherObject")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedObject"));
    objectAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("OtherBehavior")
            .SetType("behavior")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedBehavior"));

    auto &objectExpression =
        objectEventsFunctions
            .InsertNewEventsFunction("MyObjectEventsFunctionExpression", 1)
            .SetFunctionType(gd::EventsFunction::Expression);
    objectExpression.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Object")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedObject"));

    auto &objectExpressionAndCondition =
        objectEventsFunctions
            .InsertNewEventsFunction("MyObjectEventsFunctionExpressionAndCondition", 2)
            .SetFunctionType(gd::EventsFunction::ExpressionAndCondition);
    objectExpressionAndCondition.GetParameters().push_back(
        gd::ParameterMetadata().SetName("Object").SetType("object"));
    objectExpressionAndCondition.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Value1")
            .SetType("expression"));
    objectExpressionAndCondition.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Value2")
            .SetType("expression"));

    // Add a property
    eventsBasedObject.GetPropertyDescriptors()
        .InsertNew("MyProperty", 0)
        .SetType("Number");
  }

  // Add an other events based object that uses previously defined events based
  // object and behavior.
  {
    auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
        "MyOtherEventsBasedObject", 0);
    eventsBasedObject.SetFullName("My events based object");
    eventsBasedObject.SetDescription("An events based object for test");

    // Add functions and parameters that should be there by convention.
    auto &objectEventsFunctions = eventsBasedObject.GetEventsFunctions();
    auto &objectAction = objectEventsFunctions.InsertNewEventsFunction(
        "MyObjectEventsFunction", 0);
    objectAction.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Object")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyOtherEventsBasedObject"));

    // Add a child-object with the same names the one from the scene
    // to be able to use the same events list.
    auto &childObject = eventsBasedObject.InsertNewObject(
        project, "MyExtension::Sprite", "ObjectWithMyBehavior", 0);
    childObject.AddNewBehavior(project, "MyEventsExtension::MyEventsBasedBehavior", "MyBehavior");

    eventsBasedObject.InsertNewObject(
        project, "MyEventsExtension::MyEventsBasedObject", "MyCustomObject", 1);
  }

  // Add (free) functions and a (free) expression
  {
    auto &action =
        eventsExtension.InsertNewEventsFunction("MyEventsFunction", 0);
    action.GetParameters().push_back(gd::ParameterMetadata()
                                         .SetName("currentScene")
                                         .SetType("")
                                         .SetCodeOnly(true));
    action.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Object")
            .SetType("object")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedObject"));
    action.GetParameters().push_back(
        gd::ParameterMetadata()
            .SetName("Behavior")
            .SetType("behavior")
            .SetExtraInfo("MyEventsExtension::MyEventsBasedBehavior"));

    auto &expression =
        eventsExtension.InsertNewEventsFunction("MyEventsFunctionExpression", 1)
            .SetFunctionType(gd::EventsFunction::Expression);
    expression.GetParameters().push_back(gd::ParameterMetadata()
                                             .SetName("currentScene")
                                             .SetType("")
                                             .SetCodeOnly(true));

    eventsExtension.InsertNewEventsFunction("MyEventsFunctionExpressionAndCondition", 2)
        .SetFunctionType(gd::EventsFunction::ExpressionAndCondition);
  }

  // Add some usages in events
  {
    auto &layout = project.InsertNewLayout("Scene", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.SetAssociatedLayout("Scene");

    // Objects with event based behaviors
    auto &object = layout.InsertNewObject(project, "MyExtension::Sprite",
                                          "ObjectWithMyBehavior", 0);
    object.AddNewBehavior(project, "MyEventsExtension::MyEventsBasedBehavior", "MyBehavior");

    auto &globalObject = project.InsertNewObject(
        project, "MyExtension::Sprite", "GlobalObjectWithMyBehavior", 0);
    globalObject.AddNewBehavior(project, "MyEventsExtension::MyEventsBasedBehavior", "MyBehavior");

    // Custom objects
    layout.InsertNewObject(project, "MyEventsExtension::MyEventsBasedObject",
                           "MyCustomObject", 1);

    project.InsertNewObject(project, "MyEventsExtension::MyEventsBasedObject",
                            "MyGlobalCustomObject", 1);

    SetupEvents(layout.GetEvents());
    SetupEvents(externalEvents.GetEvents());
    SetupEvents(eventsExtension.GetEventsBasedObjects()
                    .Get("MyOtherEventsBasedObject")
                    .GetEventsFunctions()
                    .GetEventsFunction("MyObjectEventsFunction")
                    .GetEvents());
  }

  return eventsExtension;
}
} // namespace

TEST_CASE("WholeProjectRefactorer", "[common]") {
  SECTION("Object deleted (in layout)") {
    SECTION("Groups") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      gd::ObjectGroup group1;
      group1.AddObject("Object1");
      group1.AddObject("Object2");
      group1.AddObject("NotExistingObject");
      group1.AddObject("GlobalObject1");
      layout1.GetObjectGroups().Insert(group1);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
          project, layout1, "Object1", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
          project, "GlobalObject1", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object1") == false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object2") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("NotExistingObject") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject1") == false);
    }

    SECTION("Initial instances") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      layout1.GetInitialInstances().InsertInitialInstance(instance1);
      layout1.GetInitialInstances().InsertInitialInstance(instance2);
      layout1.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
          project, layout1, "Object1", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
          project, "GlobalObject1", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object1") ==
              false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object2") ==
              true);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
    }

    SECTION("Initial instances in associated external layouts") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);
      auto &layout2 = project.InsertNewLayout("Layout2", 0);
      auto &externalLayout1 =
          project.InsertNewExternalLayout("ExternalLayout1", 0);
      auto &externalLayout2 =
          project.InsertNewExternalLayout("ExternalLayout2", 0);

      externalLayout1.SetAssociatedLayout("Layout1");
      externalLayout2.SetAssociatedLayout("Layout2");

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance3);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRemovedInLayout(
          project, layout1, "Object1", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRemoved(
          project, "GlobalObject1", /* isObjectGroup =*/false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
    }
  }

  SECTION("Object renamed (in layout)") {
    SECTION("Groups") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      gd::ObjectGroup group1;
      group1.AddObject("Object1");
      group1.AddObject("Object2");
      group1.AddObject("NotExistingObject");
      group1.AddObject("GlobalObject1");
      layout1.GetObjectGroups().Insert(group1);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
          project, layout1, "Object1", "Object3", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
          project, "GlobalObject1", "GlobalObject3", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object1") == false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object2") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("Object3") == true);
      REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject1") == false);
      REQUIRE(layout1.GetObjectGroups()[0].Find("GlobalObject3") == true);
    }

    SECTION("Initial instances") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      layout1.GetInitialInstances().InsertInitialInstance(instance1);
      layout1.GetInitialInstances().InsertInitialInstance(instance2);
      layout1.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
          project, layout1, "Object1", "Object3", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
          project, "GlobalObject1", "GlobalObject3", /* isObjectGroup =*/false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object1") ==
              false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject("Object3") ==
              true);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(layout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject3") == true);
    }

    SECTION("Initial instances in associated external layouts") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &layout1 = project.InsertNewLayout("Layout1", 0);
      auto &layout2 = project.InsertNewLayout("Layout2", 0);
      auto &externalLayout1 =
          project.InsertNewExternalLayout("ExternalLayout1", 0);
      auto &externalLayout2 =
          project.InsertNewExternalLayout("ExternalLayout2", 0);

      externalLayout1.SetAssociatedLayout("Layout1");
      externalLayout2.SetAssociatedLayout("Layout2");

      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);

      gd::InitialInstance instance1;
      instance1.SetObjectName("Object1");
      gd::InitialInstance instance2;
      instance2.SetObjectName("Object2");
      gd::InitialInstance instance3;
      instance3.SetObjectName("GlobalObject1");
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout1.GetInitialInstances().InsertInitialInstance(instance3);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance1);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance2);
      externalLayout2.GetInitialInstances().InsertInitialInstance(instance3);

      gd::WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
          project, layout1, "Object1", "Object3", /* isObjectGroup =*/false);
      gd::WholeProjectRefactorer::GlobalObjectOrGroupRenamed(
          project, "GlobalObject1", "GlobalObject3", /* isObjectGroup =*/false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "Object3") == true);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(externalLayout1.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject3") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object1") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object2") == true);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "Object3") == false);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject1") == false);
      REQUIRE(externalLayout2.GetInitialInstances().HasInstancesOfObject(
                  "GlobalObject3") == true);
    }
    
    SECTION("Events") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

      auto &layout = project.GetLayout("Scene");

      // Trigger the refactoring after the renaming of an object
      gd::WholeProjectRefactorer::ObjectOrGroupRenamedInLayout(
          project, layout, "ObjectWithMyBehavior", "RenamedObjectWithMyBehavior",
          /* isObjectGroup=*/false);

      // Check object name has been renamed in action parameters.
      REQUIRE(GetEventFirstActionFirstParameterString(
                  layout.GetEvents().GetEvent(FreeFunctionWithObjects)) ==
              "RenamedObjectWithMyBehavior");

      // Check object name has been renamed in expressions.
      REQUIRE(GetEventFirstActionFirstParameterString(
                  layout.GetEvents().GetEvent(FreeFunctionWithObjectExpression)) ==
                "RenamedObjectWithMyBehavior.GetObjectNumber()");
    }
  }

  SECTION("Object renamed (in events function)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

    // Add a (free) function with an object group
    gd::EventsFunction &eventsFunction =
        eventsExtension.InsertNewEventsFunction("MyEventsFunction", 0);
    gd::ObjectGroup &objectGroup =
        eventsFunction.GetObjectGroups().InsertNew("MyGroup", 0);
    objectGroup.AddObject("Object1");
    objectGroup.AddObject("Object2");
    // In theory, we would add the object parameters, but we're not testing
    // events in this test.

    // Create the objects container for the events function
    gd::ObjectsContainer globalObjectsContainer;
    gd::ObjectsContainer objectsContainer;
    gd::ParameterMetadataTools::ParametersToObjectsContainer(
        project, eventsFunction.GetParameters(), objectsContainer);
    // (this is strictly not necessary because we're not testing events in this
    // test)

    // Trigger the refactoring after the renaming of an object
    gd::WholeProjectRefactorer::ObjectOrGroupRenamedInEventsFunction(
        project, eventsFunction, globalObjectsContainer, objectsContainer,
        "Object1", "RenamedObject1",
        /* isObjectGroup=*/false);

    REQUIRE(objectGroup.Find("Object1") == false);
    REQUIRE(objectGroup.Find("RenamedObject1") == true);
    REQUIRE(objectGroup.Find("Object2") == true);

    // Events are not tested
  }

  SECTION("Object renamed (in events-based object)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    auto &eventsBasedObject =
        project.GetEventsFunctionsExtension("MyEventsExtension")
               .GetEventsBasedObjects()
               .Get("MyOtherEventsBasedObject");

    // Create the objects container for the events function
    gd::ObjectsContainer globalObjectsContainer;

    // Trigger the refactoring after the renaming of an object
    gd::WholeProjectRefactorer::ObjectOrGroupRenamedInEventsBasedObject(
        project, globalObjectsContainer, eventsBasedObject,
        "ObjectWithMyBehavior", "RenamedObjectWithMyBehavior",
        /* isObjectGroup=*/false);

    auto &objectFunctionEvents =
        eventsBasedObject
            .GetEventsFunctions()
            .GetEventsFunction("MyObjectEventsFunction")
            .GetEvents();

    // Check object name has been renamed in action parameters.
    REQUIRE(GetEventFirstActionFirstParameterString(
                objectFunctionEvents.GetEvent(FreeFunctionWithObjects)) ==
            "RenamedObjectWithMyBehavior");

    // Check object name has been renamed in expressions.
    REQUIRE(GetEventFirstActionFirstParameterString(
                objectFunctionEvents.GetEvent(FreeFunctionWithObjectExpression)) ==
              "RenamedObjectWithMyBehavior.GetObjectNumber()");
  }

  SECTION("Object deleted (in events function)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

    // Add a (free) function with an object group
    gd::EventsFunction &eventsFunction =
        eventsExtension.InsertNewEventsFunction("MyEventsFunction", 0);
    gd::ObjectGroup &objectGroup =
        eventsFunction.GetObjectGroups().InsertNew("MyGroup", 0);
    objectGroup.AddObject("Object1");
    objectGroup.AddObject("Object2");
    // In theory, we would add the object parameters, but we're not testing
    // events in this test.

    // Create the objects container for the events function
    gd::ObjectsContainer globalObjectsContainer;
    gd::ObjectsContainer objectsContainer;
    gd::ParameterMetadataTools::ParametersToObjectsContainer(
        project, eventsFunction.GetParameters(), objectsContainer);
    // (this is strictly not necessary because we're not testing events in this
    // test)

    // Trigger the refactoring after the renaming of an object
    gd::WholeProjectRefactorer::ObjectOrGroupRemovedInEventsFunction(
        project, eventsFunction, globalObjectsContainer, objectsContainer,
        "Object1",
        /* isObjectGroup=*/false);

    REQUIRE(objectGroup.Find("Object1") == false);
    REQUIRE(objectGroup.Find("Object2") == true);

    // Events are not tested
  }

  SECTION("Events extension renamed in instructions") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunctionsExtension(
        project, eventsExtension, "MyEventsExtension", "MyRenamedExtension");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check that events function calls in instructions have been renamed
      REQUIRE(
          GetEventFirstActionType(eventsList->GetEvent(FreeFunctionAction)) ==
          "MyRenamedExtension::MyEventsFunction");

      // Check that events function calls in expressions have been renamed
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(FreeFunctionWithExpression)) ==
              "1 + MyRenamedExtension::MyEventsFunctionExpression(123, 456)");

      // Check that events function calls from an ExpressionAndCondition have
      // been renamed.
      REQUIRE(GetEventFirstConditionType(
                    eventsList->GetEvent(FreeConditionFromExpressionAndCondition)) ==
              "MyRenamedExtension::MyEventsFunctionExpressionAndCondition");
      REQUIRE(GetEventFirstActionFirstParameterString(
                    eventsList->GetEvent(FreeExpressionFromExpressionAndCondition)) ==
              "2 + MyRenamedExtension::MyEventsFunctionExpressionAndCondition(111, 222)");

      // Check that the type of the behavior was changed in the behaviors of
      // objects. Name is *not* changed.
      REQUIRE(project.GetLayout("Scene")
                  .GetObject("ObjectWithMyBehavior")
                  .GetBehavior("MyBehavior")
                  .GetTypeName() ==
              "MyRenamedExtension::MyEventsBasedBehavior");
      REQUIRE(project.GetObject("GlobalObjectWithMyBehavior")
                  .GetBehavior("MyBehavior")
                  .GetTypeName() ==
              "MyRenamedExtension::MyEventsBasedBehavior");
      REQUIRE(project.GetEventsFunctionsExtension("MyEventsExtension")
                  .GetEventsBasedObjects()
                  .Get("MyOtherEventsBasedObject")
                  .GetObject("ObjectWithMyBehavior")
                  .GetBehavior("MyBehavior")
                  .GetTypeName() ==
              "MyRenamedExtension::MyEventsBasedBehavior");

      // Check that the type of the object was changed. Name is *not* changed.
      REQUIRE(
          project.GetLayout("Scene").GetObject("MyCustomObject").GetType() ==
          "MyRenamedExtension::MyEventsBasedObject");
      REQUIRE(project.GetObject("MyGlobalCustomObject").GetType() ==
              "MyRenamedExtension::MyEventsBasedObject");
      REQUIRE(project.GetEventsFunctionsExtension("MyEventsExtension")
                  .GetEventsBasedObjects()
                  .Get("MyOtherEventsBasedObject")
                  .GetObject("MyCustomObject")
                  .GetType() == "MyRenamedExtension::MyEventsBasedObject");

      // Check if events-based behavior methods have been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(eventsList->GetEvent(BehaviorAction)) ==
              "MyRenamedExtension::MyEventsBasedBehavior::"
              "MyBehaviorEventsFunction");
      REQUIRE(
          GetEventFirstConditionType(
                    eventsList->GetEvent(BehaviorConditionFromExpressionAndCondition)) ==
          "MyRenamedExtension::MyEventsBasedBehavior::"
          "MyBehaviorEventsFunctionExpressionAndCondition");
      
      // Check if events-based behaviors properties have been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(
                  eventsList->GetEvent(BehaviorPropertyAction)) ==
              "MyRenamedExtension::MyEventsBasedBehavior::"
              "SetPropertyMyProperty");

      // Check events-based behavior methods have *not* been renamed in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpression)) ==
              "1 + ObjectWithMyBehavior.MyBehavior::"
              "MyBehaviorEventsFunctionExpression(123, 456, 789)");

      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(NoParameterBehaviorExpression)) ==
              "3 + ObjectWithMyBehavior.MyBehavior::"
              "MyBehaviorEventsFunctionExpression");

      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpressionFromExpressionAndCondition)) ==
              "5 + ObjectWithMyBehavior.MyBehavior::"
              "MyBehaviorEventsFunctionExpressionAndCondition(111, 222)");

      // Check that the type of the object was changed in the custom
      // objects. Name is *not* changed.
      REQUIRE(
          project.GetLayout("Scene").GetObject("MyCustomObject").GetType() ==
          "MyRenamedExtension::MyEventsBasedObject");
      REQUIRE(project.GetObject("MyGlobalCustomObject").GetType() ==
              "MyRenamedExtension::MyEventsBasedObject");

      // Check if events-based object methods have been renamed in
      // instructions
      REQUIRE(
          GetEventFirstActionType(eventsList->GetEvent(ObjectAction)) ==
          "MyRenamedExtension::MyEventsBasedObject::MyObjectEventsFunction");
      REQUIRE(
          GetEventFirstConditionType(
                    eventsList->GetEvent(ObjectConditionFromExpressionAndCondition)) ==
          "MyRenamedExtension::MyEventsBasedObject::"
          "MyObjectEventsFunctionExpressionAndCondition");

      // Check if events-based object properties have been renamed in
      // instructions
      REQUIRE(
          GetEventFirstActionType(eventsList->GetEvent(ObjectPropertyAction)) ==
          "MyRenamedExtension::MyEventsBasedObject::SetPropertyMyProperty");

      // Check events-based object methods have *not* been renamed in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(ObjectExpression)) ==
              "1 + MyCustomObject."
              "MyObjectEventsFunctionExpression(123, 456, 789)");

      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(NoParameterObjectExpression)) ==
              "3 + MyCustomObject.MyObjectEventsFunctionExpression");

      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(ObjectExpressionFromExpressionAndCondition)) ==
              "5 + MyCustomObject."
              "MyObjectEventsFunctionExpressionAndCondition(111, 222)");
    }
  }

  SECTION("Events extension renamed in parameters") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunctionsExtension(
        project, eventsExtension, "MyEventsExtension", "MyRenamedExtension");

    // Free function
    auto &myEventsFunction =
        project.GetEventsFunctionsExtension("MyEventsExtension")
            .GetEventsFunction("MyEventsFunction");
    REQUIRE(myEventsFunction.GetParameters().at(1).GetExtraInfo() ==
            "MyRenamedExtension::MyEventsBasedObject");
    REQUIRE(myEventsFunction.GetParameters().at(2).GetExtraInfo() ==
            "MyRenamedExtension::MyEventsBasedBehavior");

    // Behavior function
    {
      auto &myBehaviorEventsFunction =
          project.GetEventsFunctionsExtension("MyEventsExtension")
              .GetEventsBasedBehaviors()
              .Get("MyEventsBasedBehavior")
              .GetEventsFunctions()
              .GetEventsFunction("MyBehaviorEventsFunction");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(2).GetExtraInfo() ==
              "MyRenamedExtension::MyEventsBasedObject");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(3).GetExtraInfo() ==
              "MyRenamedExtension::MyEventsBasedBehavior");
    }

    // Object function
    {
      auto &myBehaviorEventsFunction =
          project.GetEventsFunctionsExtension("MyEventsExtension")
              .GetEventsBasedObjects()
              .Get("MyEventsBasedObject")
              .GetEventsFunctions()
              .GetEventsFunction("MyObjectEventsFunction");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(1).GetExtraInfo() ==
              "MyRenamedExtension::MyEventsBasedObject");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(2).GetExtraInfo() ==
              "MyRenamedExtension::MyEventsBasedBehavior");
    }
  }

  SECTION("Events extension renamed in behavior object type") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunctionsExtension(
        project, eventsExtension, "MyEventsExtension", "MyRenamedExtension");

    REQUIRE(project.GetEventsFunctionsExtension("MyEventsExtension")
                .GetEventsBasedBehaviors()
                .Get("MyEventsBasedBehavior")
                .GetObjectType() == "MyRenamedExtension::MyEventsBasedObject");
  }

  SECTION("(Free) events action renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunction(project, eventsExtension,
                                                     "MyEventsFunction",
                                                     "MyRenamedEventsFunction");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check that events function calls in instructions have been renamed
      REQUIRE(
          GetEventFirstActionType(eventsList->GetEvent(FreeFunctionAction)) ==
          "MyEventsExtension::MyRenamedEventsFunction");
    }
  }

  SECTION("(Free) events expression renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunction(
        project, eventsExtension, "MyEventsFunctionExpression",
        "MyRenamedFunctionExpression");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check that events function calls in expressions have been renamed
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(FreeFunctionWithExpression)) ==
              "1 + MyEventsExtension::MyRenamedFunctionExpression(123, 456)");
    }
  }

  SECTION("(Free) events expression and condition renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunction(
        project,
        eventsExtension,
        "MyEventsFunctionExpressionAndCondition",
        "MyRenamedFunctionExpressionAndCondition");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check that events function calls in expressions have been renamed
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(FreeExpressionFromExpressionAndCondition)) ==
              "2 + MyEventsExtension::MyRenamedFunctionExpressionAndCondition(111, 222)");

      // Check that events function calls in instructions have been renamed
      REQUIRE(GetEventFirstConditionType(
                  eventsList->GetEvent(FreeConditionFromExpressionAndCondition)) ==
              "MyEventsExtension::MyRenamedFunctionExpressionAndCondition");
    }
  }

  SECTION("(Free) events action parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::MoveEventsFunctionParameter(
        project, eventsExtension, "MyEventsFunction", 1, 3);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check that events function calls in instructions have been updated
      auto &action = static_cast<const gd::StandardEvent &>(
                         eventsList->GetEvent(FreeFunctionAction))
                         .GetActions()
                         .Get(0);
      REQUIRE(action.GetParameter(0).GetPlainString() == "scene");
      REQUIRE(action.GetParameter(1).GetPlainString() == "Second parameter");
      REQUIRE(action.GetParameter(2).GetPlainString() == "Third parameter");
      REQUIRE(action.GetParameter(3).GetPlainString() == "First parameter");
    }
  }

  SECTION("(Free) events expression parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    // The index 0 is reserved for the RuntimeScene.
    gd::WholeProjectRefactorer::MoveEventsFunctionParameter(
        project, eventsExtension, "MyEventsFunctionExpression", 1, 2);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check that events function calls in expressions have been updated
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(FreeFunctionWithExpression)) ==
              "1 + MyEventsExtension::MyEventsFunctionExpression(456, 123)");
    }
  }

  SECTION("(Free) events expression and condition parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    // The index 0 is reserved for the RuntimeScene.
    gd::WholeProjectRefactorer::MoveEventsFunctionParameter(
        project, eventsExtension, "MyEventsFunctionExpressionAndCondition", 1, 2);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check that events function calls in expressions have been updated
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(FreeExpressionFromExpressionAndCondition)) ==
              "2 + MyEventsExtension::MyEventsFunctionExpressionAndCondition(222, 111)");

      // Check that events function calls in instructions have been updated
      auto &condition = static_cast<const gd::StandardEvent &>(
                        eventsList->GetEvent(FreeConditionFromExpressionAndCondition))
                        .GetConditions()
                        .Get(0);
      REQUIRE(condition.GetParameter(0).GetPlainString() == "scene");
      REQUIRE(condition.GetParameter(1).GetPlainString() == ">");
      REQUIRE(condition.GetParameter(2).GetPlainString() == "2");
      REQUIRE(condition.GetParameter(3).GetPlainString() == "222");
      REQUIRE(condition.GetParameter(4).GetPlainString() == "111");
    }
  }

  SECTION("Events based behavior renamed (instructions update)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameEventsBasedBehavior(
        project, eventsExtension, "MyEventsBasedBehavior",
        "MyRenamedEventsBasedBehavior");

    // Check that the type of the behavior was changed in the behaviors of
    // objects. Name is *not* changed.
    REQUIRE(project.GetLayout("Scene")
                .GetObject("ObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");
    REQUIRE(project.GetObject("GlobalObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");
    REQUIRE(project.GetEventsFunctionsExtension("MyEventsExtension")
                .GetEventsBasedObjects()
                .Get("MyOtherEventsBasedObject")
                .GetObject("ObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if events-based behavior methods have been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(eventsList->GetEvent(BehaviorAction)) ==
              "MyEventsExtension::MyRenamedEventsBasedBehavior::"
              "MyBehaviorEventsFunction");
      REQUIRE(GetEventFirstConditionType(
                  eventsList->GetEvent(BehaviorConditionFromExpressionAndCondition)) ==
          "MyEventsExtension::MyRenamedEventsBasedBehavior::"
          "MyBehaviorEventsFunctionExpressionAndCondition");

      // Check if events-based behaviors properties have been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(
                  eventsList->GetEvent(BehaviorPropertyAction)) ==
              "MyEventsExtension::MyRenamedEventsBasedBehavior::"
              "SetPropertyMyProperty");

      // Check events-based behavior methods have *not* been renamed in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpression)) ==
              "1 + ObjectWithMyBehavior.MyBehavior::"
              "MyBehaviorEventsFunctionExpression(123, 456, 789)");
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpressionFromExpressionAndCondition)) ==
              "5 + ObjectWithMyBehavior.MyBehavior::"
              "MyBehaviorEventsFunctionExpressionAndCondition(111, 222)");
    }
  }

  SECTION("Events based behavior renamed (in parameters)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameEventsBasedBehavior(
        project, eventsExtension, "MyEventsBasedBehavior",
        "MyRenamedEventsBasedBehavior");

    // Free function
    auto &myEventsFunction =
        project.GetEventsFunctionsExtension("MyEventsExtension")
            .GetEventsFunction("MyEventsFunction");
    REQUIRE(myEventsFunction.GetParameters().at(2).GetExtraInfo() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");

    // Behavior function
    {
      auto &myBehaviorEventsFunction =
          project.GetEventsFunctionsExtension("MyEventsExtension")
              .GetEventsBasedBehaviors()
              .Get("MyEventsBasedBehavior")
              .GetEventsFunctions()
              .GetEventsFunction("MyBehaviorEventsFunction");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(3).GetExtraInfo() ==
              "MyEventsExtension::MyRenamedEventsBasedBehavior");
    }

    // Object function
    {
      auto &myBehaviorEventsFunction =
          project.GetEventsFunctionsExtension("MyEventsExtension")
              .GetEventsBasedObjects()
              .Get("MyEventsBasedObject")
              .GetEventsFunctions()
              .GetEventsFunction("MyObjectEventsFunction");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(2).GetExtraInfo() ==
              "MyEventsExtension::MyRenamedEventsBasedBehavior");
    }
  }

  SECTION("Events based object renamed (instructions update)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    gd::WholeProjectRefactorer::RenameEventsBasedObject(
        project, eventsExtension, "MyEventsBasedObject",
        "MyRenamedEventsBasedObject");

    // Check that the type of the object was changed. Name is *not* changed.
    REQUIRE(project.GetLayout("Scene").GetObject("MyCustomObject").GetType() ==
            "MyEventsExtension::MyRenamedEventsBasedObject");
    REQUIRE(project.GetObject("MyGlobalCustomObject").GetType() ==
            "MyEventsExtension::MyRenamedEventsBasedObject");
    REQUIRE(project.GetEventsFunctionsExtension("MyEventsExtension")
                .GetEventsBasedObjects()
                .Get("MyOtherEventsBasedObject")
                .GetObject("MyCustomObject")
                .GetType() == "MyEventsExtension::MyRenamedEventsBasedObject");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if events-based object methods have been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(eventsList->GetEvent(ObjectAction)) ==
              "MyEventsExtension::MyRenamedEventsBasedObject::"
              "MyObjectEventsFunction");
      REQUIRE(GetEventFirstConditionType(
                  eventsList->GetEvent(ObjectConditionFromExpressionAndCondition)) ==
          "MyEventsExtension::MyRenamedEventsBasedObject::"
          "MyObjectEventsFunctionExpressionAndCondition");

      // Check if events-based object properties have been renamed in
      // instructions
      REQUIRE(
          GetEventFirstActionType(eventsList->GetEvent(ObjectPropertyAction)) ==
          "MyEventsExtension::MyRenamedEventsBasedObject::"
          "SetPropertyMyProperty");

      // Check events-based object methods have *not* been renamed in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(ObjectExpression)) ==
              "1 + MyCustomObject."
              "MyObjectEventsFunctionExpression(123, 456, 789)");
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(ObjectExpressionFromExpressionAndCondition)) ==
              "5 + MyCustomObject."
              "MyObjectEventsFunctionExpressionAndCondition(111, 222)");
    }
  }

  SECTION("Events based object renamed (in parameters)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    gd::WholeProjectRefactorer::RenameEventsBasedObject(
        project, eventsExtension, "MyEventsBasedObject",
        "MyRenamedEventsBasedObject");

    // Free function
    auto &myEventsFunction =
        project.GetEventsFunctionsExtension("MyEventsExtension")
            .GetEventsFunction("MyEventsFunction");
    REQUIRE(myEventsFunction.GetParameters().at(1).GetExtraInfo() ==
            "MyEventsExtension::MyRenamedEventsBasedObject");

    // Behavior function
    {
      auto &myBehaviorEventsFunction =
          project.GetEventsFunctionsExtension("MyEventsExtension")
              .GetEventsBasedBehaviors()
              .Get("MyEventsBasedBehavior")
              .GetEventsFunctions()
              .GetEventsFunction("MyBehaviorEventsFunction");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(2).GetExtraInfo() ==
              "MyEventsExtension::MyRenamedEventsBasedObject");
    }

    // Object function
    {
      auto &myBehaviorEventsFunction =
          project.GetEventsFunctionsExtension("MyEventsExtension")
              .GetEventsBasedObjects()
              .Get("MyEventsBasedObject")
              .GetEventsFunctions()
              .GetEventsFunction("MyObjectEventsFunction");
      REQUIRE(myBehaviorEventsFunction.GetParameters().at(1).GetExtraInfo() ==
              "MyEventsExtension::MyRenamedEventsBasedObject");
    }
  }

  SECTION("Events based object renamed (in behavior object type)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    gd::WholeProjectRefactorer::RenameEventsBasedObject(
        project, eventsExtension, "MyEventsBasedObject",
        "MyRenamedEventsBasedObject");

    REQUIRE(project.GetEventsFunctionsExtension("MyEventsExtension")
                .GetEventsBasedBehaviors()
                .Get("MyEventsBasedBehavior")
                .GetObjectType() ==
            "MyEventsExtension::MyRenamedEventsBasedObject");
  }
  // TODO: Check that this works when behaviors are attached to a child-object.
  SECTION("Events based behavior renamed (other behaviors properties update)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    // Set up another events based behavior having a "required behavior"
    // property referring to the behavior.
    auto &otherEventsExtension =
        project.InsertNewEventsFunctionsExtension("MyOtherEventsExtension", 0);
    auto &otherEventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyOtherEventsBasedBehavior");
    auto &otherEventsBasedBehaviorFirstProperty =
        otherEventsBasedBehavior.GetPropertyDescriptors()
            .InsertNew("SomeRequiredBehavior")
            .SetType("Behavior")
            .AddExtraInfo("MyEventsExtension::MyEventsBasedBehavior");

    // Also add another "required behavior" property referring to another
    // unrelated behavior.
    auto &otherEventsBasedBehaviorSecondProperty =
        otherEventsBasedBehavior.GetPropertyDescriptors()
            .InsertNew("SomeRequiredBehavior")
            .SetType("Behavior")
            .AddExtraInfo("SomeOtherExtension::SomeOtherBehavior");

    gd::WholeProjectRefactorer::RenameEventsBasedBehavior(
        project, eventsExtension, "MyEventsBasedBehavior",
        "MyRenamedEventsBasedBehavior");

    // Check the other events-based behavior has its property updated.
    REQUIRE(otherEventsBasedBehaviorFirstProperty.GetExtraInfo().size() == 1);
    REQUIRE(otherEventsBasedBehaviorFirstProperty.GetExtraInfo().at(0) ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");

    // Check the other events-based behavior has its other property left
    // untouched.
    REQUIRE(otherEventsBasedBehaviorSecondProperty.GetExtraInfo().size() == 1);
    REQUIRE(otherEventsBasedBehaviorSecondProperty.GetExtraInfo().at(0) ==
            "SomeOtherExtension::SomeOtherBehavior");
  }

  SECTION("(Events based behavior) events action renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameBehaviorEventsFunction(
        project, eventsExtension, eventsBasedBehavior,
        "MyBehaviorEventsFunction", "MyRenamedBehaviorEventsFunction");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if events-based behavior methods have been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(eventsList->GetEvent(BehaviorAction)) ==
              "MyEventsExtension::MyEventsBasedBehavior::"
              "MyRenamedBehaviorEventsFunction");
    }
  }

  SECTION("(Events based object) events action renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    gd::WholeProjectRefactorer::RenameObjectEventsFunction(
        project, eventsExtension, eventsBasedObject, "MyObjectEventsFunction",
        "MyRenamedObjectEventsFunction");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if events-based object methods have been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(eventsList->GetEvent(ObjectAction)) ==
              "MyEventsExtension::MyEventsBasedObject::"
              "MyRenamedObjectEventsFunction");
    }
  }

  SECTION("(Events based behavior) events expression renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameBehaviorEventsFunction(
        project, eventsExtension, eventsBasedBehavior,
        "MyBehaviorEventsFunctionExpression",
        "MyRenamedBehaviorEventsFunctionExpression");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check events-based behavior methods have been renamed in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpression)) ==
              "1 + "
              "ObjectWithMyBehavior.MyBehavior::"
              "MyRenamedBehaviorEventsFunctionExpression(123, 456, 789)");

      // Check that a ill-named function that looks a bit like a behavior method
      // (but which is actually an object function) is *not* renamed.
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(IllNamedBehaviorExpression)) ==
              "2 + "
              "ObjectWithMyBehavior::MyBehavior."
              "MyBehaviorEventsFunctionExpression(123, 456, 789)");

      // Check events based behaviors functions have been renamed in
      // expressions referring to the function with just its name
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(NoParameterBehaviorExpression)) ==
              "3 + "
              "ObjectWithMyBehavior.MyBehavior::"
              "MyRenamedBehaviorEventsFunctionExpression");

      // Check that a ill-named function that looks a bit like a behavior method
      // (but which is actually an object function) is *not* renamed.
      REQUIRE(GetEventFirstActionFirstParameterString(eventsList->GetEvent(
                  NoParameterIllNamedBehaviorExpression)) ==
              "4 + "
              "ObjectWithMyBehavior::MyBehavior."
              "MyBehaviorEventsFunctionExpression");
    }
  }

  SECTION("(Events based behavior) events expression and condition renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameBehaviorEventsFunction(
        project,
        eventsExtension,
        eventsBasedBehavior,
        "MyBehaviorEventsFunctionExpressionAndCondition",
        "MyRenamedBehaviorEventsFunctionExpressionAndCondition");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check events-based behavior methods have been renamed in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpressionFromExpressionAndCondition)) ==
              "5 + ObjectWithMyBehavior.MyBehavior::"
              "MyRenamedBehaviorEventsFunctionExpressionAndCondition(111, 222)");

      // Check if events-based behavior methods have been renamed in
      // instructions
      REQUIRE(GetEventFirstConditionType(
                  eventsList->GetEvent(BehaviorConditionFromExpressionAndCondition)) ==
          "MyEventsExtension::MyEventsBasedBehavior::"
          "MyRenamedBehaviorEventsFunctionExpressionAndCondition");
    }
  }

  SECTION("(Events based object) events expression and condition renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    gd::WholeProjectRefactorer::RenameObjectEventsFunction(
        project,
        eventsExtension,
        eventsBasedObject,
        "MyObjectEventsFunctionExpressionAndCondition",
        "MyRenamedObjectEventsFunctionExpressionAndCondition");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check events-based behavior methods have been renamed in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(ObjectExpressionFromExpressionAndCondition)) ==
              "5 + MyCustomObject."
              "MyRenamedObjectEventsFunctionExpressionAndCondition(111, 222)");

      // Check if events-based behavior methods have been renamed in
      // instructions
      REQUIRE(GetEventFirstConditionType(
                  eventsList->GetEvent(ObjectConditionFromExpressionAndCondition)) ==
          "MyEventsExtension::MyEventsBasedObject::"
          "MyRenamedObjectEventsFunctionExpressionAndCondition");
    }
  }

  SECTION("(Events based behavior) events action parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::MoveBehaviorEventsFunctionParameter(
        project, eventsExtension, eventsBasedBehavior,
        "MyBehaviorEventsFunction", 2, 4);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if parameters of events-based behavior methods have been moved in
      // instructions
      auto &action = static_cast<const gd::StandardEvent &>(
                         eventsList->GetEvent(BehaviorAction))
                         .GetActions()
                         .Get(0);
      REQUIRE(action.GetParameter(0).GetPlainString() ==
              "ObjectWithMyBehavior");
      REQUIRE(action.GetParameter(1).GetPlainString() == "MyBehavior");
      REQUIRE(action.GetParameter(2).GetPlainString() == "Second parameter");
      REQUIRE(action.GetParameter(3).GetPlainString() == "Third parameter");
      REQUIRE(action.GetParameter(4).GetPlainString() == "First parameter");
    }
  }

  SECTION("(Events based object) events action parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    gd::WholeProjectRefactorer::MoveObjectEventsFunctionParameter(
        project, eventsExtension, eventsBasedObject, "MyObjectEventsFunction",
        1, 3);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if parameters of events-based object methods have been moved in
      // instructions.
      auto &action = static_cast<const gd::StandardEvent &>(
                         eventsList->GetEvent(ObjectAction))
                         .GetActions()
                         .Get(0);
      REQUIRE(action.GetParameter(0).GetPlainString() == "MyCustomObject");
      REQUIRE(action.GetParameter(1).GetPlainString() == "Second parameter");
      REQUIRE(action.GetParameter(2).GetPlainString() == "Third parameter");
      REQUIRE(action.GetParameter(3).GetPlainString() == "First parameter");
    }
  }

  SECTION("(Events based behavior) events expression parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    // The first 2 parameters are reserved for the object and behavior.
    gd::WholeProjectRefactorer::MoveBehaviorEventsFunctionParameter(
        project, eventsExtension, eventsBasedBehavior,
        "MyBehaviorEventsFunctionExpression", 2, 4);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check parameters of events-based behavior methods have been moved in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpression)) ==
              "1 + "
              "ObjectWithMyBehavior.MyBehavior::"
              "MyBehaviorEventsFunctionExpression(456, 789, 123)");

      // Check that a ill-named function that looks a bit like a behavior method
      // (but which is actually a free function) has its parameter *not* moved.
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(IllNamedBehaviorExpression)) ==
              "2 + "
              "ObjectWithMyBehavior::MyBehavior."
              "MyBehaviorEventsFunctionExpression(123, 456, 789)");
    }
  }

  SECTION("(Events based object) events expression parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    // The first parameter is reserved for the object.
    gd::WholeProjectRefactorer::MoveObjectEventsFunctionParameter(
        project, eventsExtension, eventsBasedObject,
        "MyObjectEventsFunctionExpression", 1, 3);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check parameters of events-based object methods have been moved in
      // expressions.
      REQUIRE(
          GetEventFirstActionFirstParameterString(
              eventsList->GetEvent(ObjectExpression)) ==
          "1 + MyCustomObject.MyObjectEventsFunctionExpression(456, 789, 123)");

      // Check that a ill-named function that looks a bit like an object method
      // (but which is actually a free function) has its parameter *not* moved.
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(IllNamedObjectExpression)) ==
              "2 + MyCustomObject::MyObjectEventsFunctionExpression(123, 456, "
              "789)");
    }
  }

  SECTION("(Events based behavior) events expression and condition parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    // The first 2 parameters are reserved for the object and behavior.
    gd::WholeProjectRefactorer::MoveBehaviorEventsFunctionParameter(
        project,
        eventsExtension,
        eventsBasedBehavior,
        "MyBehaviorEventsFunctionExpressionAndCondition",
        2,
        3);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check parameters of events-based behavior methods have been moved in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorExpressionFromExpressionAndCondition)) ==
              "5 + ObjectWithMyBehavior.MyBehavior::"
              "MyBehaviorEventsFunctionExpressionAndCondition(222, 111)");
      // Check if parameters of events-based behavior methods have been moved in
      // instructions
      auto &action = static_cast<const gd::StandardEvent &>(
                  eventsList->GetEvent(BehaviorConditionFromExpressionAndCondition))
                        .GetConditions()
                        .Get(0);
      REQUIRE(action.GetParameter(0).GetPlainString() == "ObjectWithMyBehavior");
      REQUIRE(action.GetParameter(1).GetPlainString() == "MyBehavior");
      REQUIRE(action.GetParameter(2).GetPlainString() == ">");
      REQUIRE(action.GetParameter(3).GetPlainString() == "5");
      REQUIRE(action.GetParameter(4).GetPlainString() == "222");
      REQUIRE(action.GetParameter(5).GetPlainString() == "111");
    }
  }

  SECTION("(Events based object) events expression and condition parameter moved") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    // The first 2 parameters are reserved for the object and behavior.
    gd::WholeProjectRefactorer::MoveObjectEventsFunctionParameter(
        project,
        eventsExtension,
        eventsBasedObject,
        "MyObjectEventsFunctionExpressionAndCondition",
        1,
        2);

    for (auto *eventsList : GetEventsLists(project)) {
      // Check parameters of events-based behavior methods have been moved in
      // expressions
      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(ObjectExpressionFromExpressionAndCondition)) ==
              "5 + MyCustomObject."
              "MyObjectEventsFunctionExpressionAndCondition(222, 111)");
      // Check if parameters of events-based behavior methods have been moved in
      // instructions
      auto &action = static_cast<const gd::StandardEvent &>(
                  eventsList->GetEvent(ObjectConditionFromExpressionAndCondition))
                        .GetConditions()
                        .Get(0);
      REQUIRE(action.GetParameter(0).GetPlainString() == "MyCustomObject");
      REQUIRE(action.GetParameter(1).GetPlainString() == ">");
      REQUIRE(action.GetParameter(2).GetPlainString() == "5");
      REQUIRE(action.GetParameter(3).GetPlainString() == "222");
      REQUIRE(action.GetParameter(4).GetPlainString() == "111");
    }
  }

  SECTION(
      "(Events based behavior) property renamed (not a required behavior)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameEventsBasedBehaviorProperty(
        project, eventsExtension, eventsBasedBehavior, "MyProperty",
        "MyRenamedProperty");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if events-based behaviors property has been renamed in
      // instructions
      REQUIRE(GetEventFirstActionType(
                  eventsList->GetEvent(BehaviorPropertyAction)) ==
              "MyEventsExtension::MyEventsBasedBehavior::"
              "SetPropertyMyRenamedProperty");

      REQUIRE(GetEventFirstConditionType(
                  eventsList->GetEvent(BehaviorPropertyCondition)) ==
              "MyEventsExtension::MyEventsBasedBehavior::"
              "PropertyMyRenamedProperty");

      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(BehaviorPropertyExpression)) ==
              "ObjectWithMyBehavior.MyBehavior::PropertyMyRenamedProperty()");
    }
  }

  SECTION("(Events based object) property renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get("MyEventsBasedObject");

    gd::WholeProjectRefactorer::RenameEventsBasedObjectProperty(
        project, eventsExtension, eventsBasedObject, "MyProperty",
        "MyRenamedProperty");

    for (auto *eventsList : GetEventsLists(project)) {
      // Check if events-based object property has been renamed in instructions.
      REQUIRE(
          GetEventFirstActionType(eventsList->GetEvent(ObjectPropertyAction)) ==
          "MyEventsExtension::MyEventsBasedObject::"
          "SetPropertyMyRenamedProperty");

      REQUIRE(GetEventFirstConditionType(
                  eventsList->GetEvent(ObjectPropertyCondition)) ==
              "MyEventsExtension::MyEventsBasedObject::"
              "PropertyMyRenamedProperty");

      REQUIRE(GetEventFirstActionFirstParameterString(
                  eventsList->GetEvent(ObjectPropertyExpression)) ==
              "MyCustomObject.PropertyMyRenamedProperty()");
    }
  }
}
// TODO: Check that this works when behaviors are attached to a child-object.
TEST_CASE("WholeProjectRefactorer (FindInvalidRequiredBehaviorProperties)",
          "[common]") {
  SECTION("Find nothing if there are no missing required behavior") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
        gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
            project);
    REQUIRE(problems.size() == 0);
  }
  SECTION("Find unfilled required behavior properties") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Insert an object using a behavior requiring another behavior.
    // But don't fill the property, which is a problem.
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project,
                          "MyExtension::BehaviorWithRequiredBehaviorProperty",
                          "MyBehaviorWithRequiredBehaviorProperty");

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
        gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
            project);
    REQUIRE(problems.size() == 1);
    REQUIRE(problems[0].GetSourceObject().GetName() == "MyObject");
    REQUIRE(problems[0].GetSourceBehaviorContent().GetName() ==
            "MyBehaviorWithRequiredBehaviorProperty");
    REQUIRE(problems[0].GetSourcePropertyName() == "requiredBehaviorProperty");
    REQUIRE(problems[0].GetExpectedBehaviorTypeName() ==
            "MyExtension::MyBehavior");
  }
  SECTION("Find nothing if the required behavior properties are filled") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Insert an object using a behavior requiring another behavior.
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project,
                          "MyExtension::BehaviorWithRequiredBehaviorProperty",
                          "MyBehaviorWithRequiredBehaviorProperty");
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    // Fill the required behavior property on the object.
    gd::Behavior &behavior =
        object.GetBehavior("MyBehaviorWithRequiredBehaviorProperty");
    REQUIRE(behavior.UpdateProperty("requiredBehaviorProperty", "MyBehavior") ==
            true);

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
        gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
            project);
    REQUIRE(problems.size() == 0);
  }
  SECTION("Find wrongly filled (wrong type) required behavior properties") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Insert an object using a behavior requiring another behavior.
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project,
                          "MyExtension::BehaviorWithRequiredBehaviorProperty",
                          "MyBehaviorWithRequiredBehaviorProperty");
    object.AddNewBehavior(project, "MyExtension::MyOtherBehavior",
                          "MyOtherBehavior");

    // Fill the required behavior property on the object with the wrong behavior
    // name
    gd::Behavior &behavior =
        object.GetBehavior("MyBehaviorWithRequiredBehaviorProperty");
    REQUIRE(behavior.UpdateProperty("requiredBehaviorProperty",
                                    "MyOtherBehavior") == true);

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
        gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
            project);
    REQUIRE(problems.size() == 1);
    REQUIRE(problems[0].GetSourceObject().GetName() == "MyObject");
    REQUIRE(problems[0].GetSourceBehaviorContent().GetName() ==
            "MyBehaviorWithRequiredBehaviorProperty");
    REQUIRE(problems[0].GetSourcePropertyName() == "requiredBehaviorProperty");
    REQUIRE(problems[0].GetExpectedBehaviorTypeName() ==
            "MyExtension::MyBehavior");
  }
  SECTION("Find wrongly filled (not existing) required behavior properties") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Insert an object using a behavior requiring another behavior.
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project,
                          "MyExtension::BehaviorWithRequiredBehaviorProperty",
                          "MyBehaviorWithRequiredBehaviorProperty");

    // Fill the required behavior property on the object with the wrong behavior
    // name
    gd::Behavior &behavior =
        object.GetBehavior("MyBehaviorWithRequiredBehaviorProperty");
    REQUIRE(behavior.UpdateProperty("requiredBehaviorProperty",
                                    "MyNotExistingBehavior") == true);

    std::vector<gd::UnfilledRequiredBehaviorPropertyProblem> problems =
        gd::WholeProjectRefactorer::FindInvalidRequiredBehaviorProperties(
            project);
    REQUIRE(problems.size() == 1);
    REQUIRE(problems[0].GetSourceObject().GetName() == "MyObject");
    REQUIRE(problems[0].GetSourceBehaviorContent().GetName() ==
            "MyBehaviorWithRequiredBehaviorProperty");
    REQUIRE(problems[0].GetSourcePropertyName() == "requiredBehaviorProperty");
    REQUIRE(problems[0].GetExpectedBehaviorTypeName() ==
            "MyExtension::MyBehavior");
  }
}

TEST_CASE("WholeProjectRefactorer (FixInvalidRequiredBehaviorProperties)",
          "[common]") {
  // TODO: Add a cases for required behaviors that were removed.
  // - add a required behavior "B" property to an event-based behavior "A"
  // - remove the event-based behavior "B"
  // - add the behavior "A" to an object
  // Check that no behavior is added on the object for it and that there is no
  // crash.
  
  SECTION("Fix nothing if there are no missing required behavior") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    REQUIRE(gd::WholeProjectRefactorer::FixInvalidRequiredBehaviorProperties(
                project) == false);
  }
  SECTION("Fix unfilled required behavior properties by adding a behavior if "
          "necessary") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Insert an object using a behavior requiring another behavior.
    // But don't fill the property, which is a problem.
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project,
                          "MyExtension::BehaviorWithRequiredBehaviorProperty",
                          "MyBehaviorWithRequiredBehaviorProperty");

    REQUIRE(gd::WholeProjectRefactorer::FixInvalidRequiredBehaviorProperties(
                project) == true);

    // Check the behavior is still there.
    REQUIRE(object.HasBehaviorNamed("MyBehaviorWithRequiredBehaviorProperty"));

    // Check that the property was filled with the newly added behavior.
    REQUIRE(object.GetBehavior("MyBehaviorWithRequiredBehaviorProperty")
                .GetContent()
                .HasAttribute("requiredBehaviorProperty"));
    REQUIRE(object.GetBehavior("MyBehaviorWithRequiredBehaviorProperty")
                .GetContent()
                .GetStringAttribute("requiredBehaviorProperty") ==
            "MyBehavior");

    // And also the new behavior that was missing (inserted using its default
    // name).
    REQUIRE(object.GetAllBehaviorNames().size() == 2);
    REQUIRE(object.HasBehaviorNamed("MyBehavior"));
    REQUIRE(object.GetBehavior("MyBehavior").GetTypeName() ==
            "MyExtension::MyBehavior");

    // Check there is no other fix to do.
    REQUIRE(gd::WholeProjectRefactorer::FixInvalidRequiredBehaviorProperties(
                project) == false);
  }

  SECTION("Fix wrongly filled required behavior properties without adding a "
          "behavior, if not necessary") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Insert an object using a behavior requiring another behavior.
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project,
                          "MyExtension::BehaviorWithRequiredBehaviorProperty",
                          "MyBehaviorWithRequiredBehaviorProperty");
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    // Wrongly fill the required behavior property on the object.
    gd::Behavior &behavior =
        object.GetBehavior("MyBehaviorWithRequiredBehaviorProperty");
    REQUIRE(behavior.UpdateProperty("requiredBehaviorProperty",
                                    "ThisIsInvalid") == true);

    // Check a fix is done
    REQUIRE(gd::WholeProjectRefactorer::FixInvalidRequiredBehaviorProperties(
                project) == true);

    REQUIRE(object.HasBehaviorNamed("MyBehaviorWithRequiredBehaviorProperty"));

    // Check that the property was filled with the existing behavior.
    REQUIRE(
        behavior.GetProperties().at("requiredBehaviorProperty").GetValue() ==
        "MyBehavior");

    // Check that the existing behavior is unchanged.
    REQUIRE(object.GetAllBehaviorNames().size() == 2);
    REQUIRE(object.HasBehaviorNamed("MyBehavior"));
    REQUIRE(object.GetBehavior("MyBehavior").GetTypeName() ==
            "MyExtension::MyBehavior");

    // Check there is no other fix to do.
    REQUIRE(gd::WholeProjectRefactorer::FixInvalidRequiredBehaviorProperties(
                project) == false);
  }
}
TEST_CASE("WholeProjectRefactorer (AddBehaviorAndRequiredBehaviors)",
          "[common]") {
  SECTION(
      "Does not add anything else if the newly added behavior has no required "
      "behavior properties") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

    // Add a simple behavior.
    gd::WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
        project, object, "MyExtension::MyBehavior", "MyBehavior");

    REQUIRE(object.HasBehaviorNamed("MyBehavior"));
    REQUIRE(object.GetAllBehaviorNames().size() == 1);
  }

  SECTION("Does not crash if the newly added behavior is unknown") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

    // Add an unknown behavior.
    gd::WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
        project, object, "MyExtension::MyNotExistingBehavior",
        "MyNotExistingBehavior");

    // Still add the behavior because it's safer.
    REQUIRE(object.GetAllBehaviorNames().size() == 1);
  }

  SECTION("Add a behavior and its required behaviors on an object") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

    // Add the behavior that requires a behavior.
    gd::WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
        project, object,
        "MyExtension::"
        "BehaviorWithRequiredBehaviorProperty",
        "BehaviorWithRequiredBehaviorProperty");

    // Required behavior are added.
    REQUIRE(object.HasBehaviorNamed("MyBehavior"));
    REQUIRE(object.HasBehaviorNamed("BehaviorWithRequiredBehaviorProperty"));

    // Check that required behavior properties were filled properly too.
    const auto &metadata1 = gd::MetadataProvider::GetBehaviorMetadata(
        platform, "MyExtension::"
                  "BehaviorWithRequiredBehaviorProperty");
    REQUIRE(!gd::MetadataProvider::IsBadBehaviorMetadata(metadata1));
    REQUIRE(object.GetBehavior("BehaviorWithRequiredBehaviorProperty")
                .GetProperties()
                .at("requiredBehaviorProperty")
                .GetValue() == "MyBehavior");
  }

  SECTION(
      "Add a behavior and its required behaviors on an object (transitively)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

    // Add the behavior that requires a behavior that requires another.
    gd::WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
        project, object,
        "MyExtension::"
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior",
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior");

    // Required behavior are added transitively.
    REQUIRE(object.HasBehaviorNamed("MyBehavior"));
    REQUIRE(object.HasBehaviorNamed("BehaviorWithRequiredBehaviorProperty"));
    REQUIRE(object.HasBehaviorNamed(
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior"));

    // Check that required behavior properties were filled properly too.
    const auto &metadata1 = gd::MetadataProvider::GetBehaviorMetadata(
        platform,
        "MyExtension::"
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior");
    const auto &metadata2 = gd::MetadataProvider::GetBehaviorMetadata(
        platform, "MyExtension::BehaviorWithRequiredBehaviorProperty");
    REQUIRE(!gd::MetadataProvider::IsBadBehaviorMetadata(metadata1));
    REQUIRE(!gd::MetadataProvider::IsBadBehaviorMetadata(metadata2));
    REQUIRE(
        object
            .GetBehavior(
                "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior")
            .GetProperties()
            .at("requiredBehaviorProperty")
            .GetValue() == "BehaviorWithRequiredBehaviorProperty");
    REQUIRE(object.GetBehavior("BehaviorWithRequiredBehaviorProperty")
                .GetProperties()
                .at("requiredBehaviorProperty")
                .GetValue() == "MyBehavior");
  }
}
TEST_CASE("WholeProjectRefactorer (FindDependentBehaviorNames)", "[common]") {
  SECTION("Find behaviors that are dependent on another") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

    // Add the behavior that requires a behavior that requires another.
    gd::WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
        project, object,
        "MyExtension::"
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior",
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior");

    // Required behavior are added transitively.
    REQUIRE(object.HasBehaviorNamed("MyBehavior"));
    REQUIRE(object.HasBehaviorNamed("BehaviorWithRequiredBehaviorProperty"));
    REQUIRE(object.HasBehaviorNamed(
        "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior"));

    // Find dependent behaviors
    {
      const auto &behaviorNames =
          gd::WholeProjectRefactorer::FindDependentBehaviorNames(
              project, object, "MyBehavior");

      REQUIRE(behaviorNames.size() == 2);
      REQUIRE(std::find(behaviorNames.begin(), behaviorNames.end(),
                        "BehaviorWithRequiredBehaviorProperty") !=
              behaviorNames.end());
      REQUIRE(
          std::find(
              behaviorNames.begin(), behaviorNames.end(),
              "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior") !=
          behaviorNames.end());
    }
    {
      const auto &behaviorNames =
          gd::WholeProjectRefactorer::FindDependentBehaviorNames(
              project, object, "BehaviorWithRequiredBehaviorProperty");

      REQUIRE(behaviorNames.size() == 1);
      REQUIRE(
          std::find(
              behaviorNames.begin(), behaviorNames.end(),
              "BehaviorWithRequiredBehaviorPropertyRequiringAnotherBehavior") !=
          behaviorNames.end());
    }
  }
}
TEST_CASE("WholeProjectRefactorer (FindDependentBehaviorNames failing cases)",
          "[common]") {
  SECTION("Handle non existing behaviors") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &object =
        project.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

    // Add the behavior that requires a behavior that requires another.
    gd::WholeProjectRefactorer::AddBehaviorAndRequiredBehaviors(
        project, object,
        "MyExtension::"
        "BehaviorWithRequiredBehaviorProperty",
        "BehaviorWithRequiredBehaviorProperty");

    // Required behavior are added transitively.
    REQUIRE(object.HasBehaviorNamed("MyBehavior"));
    REQUIRE(object.HasBehaviorNamed("BehaviorWithRequiredBehaviorProperty"));

    object.AddNewBehavior(project, "MyUnknownExtension::MyUnknownBehavior", "MyUnknownBehavior");

    // Find dependent behaviors and ignore the unknown one.
    {
      const auto &behaviorNames =
          gd::WholeProjectRefactorer::FindDependentBehaviorNames(
              project, object, "MyBehavior");

      REQUIRE(behaviorNames.size() == 1);
      REQUIRE(std::find(behaviorNames.begin(), behaviorNames.end(),
                        "BehaviorWithRequiredBehaviorProperty") !=
              behaviorNames.end());
    }
  }
}
