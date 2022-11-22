/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/PropertyFunctionGenerator.h"
#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "catch.hpp"

namespace {

gd::EventsBasedBehavior &
CreateBehavior(gd::EventsFunctionsExtension &eventsExtension) {
  auto &eventsBasedBehavior =
      eventsExtension.GetEventsBasedBehaviors().InsertNew(
          "MyEventsBasedBehavior", 0);
  eventsBasedBehavior.SetFullName("My events based behavior");
  eventsBasedBehavior.SetDescription("An events based behavior for test");
  eventsBasedBehavior.SetObjectType("");
  return eventsBasedBehavior;
};
} // namespace

TEST_CASE("PropertyFunctionGenerator", "[common]") {
  SECTION("Can generate functions for a number property") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &behavior = CreateBehavior(extension);

    auto &property =
        behavior.GetPropertyDescriptors().InsertNew("MovementAngle", 0);
    property.SetType("Number")
        .SetLabel("Movement angle")
        .SetDescription("The angle of the trajectory direction.")
        .SetGroup("Movement");

    gd::PropertyFunctionGenerator::GenerateGetterAndSetter(
        project, extension, behavior, property, false);

    REQUIRE(
        behavior.GetEventsFunctions().HasEventsFunctionNamed("MovementAngle"));
    REQUIRE(behavior.GetEventsFunctions().HasEventsFunctionNamed(
        "SetMovementAngle"));
    {
      auto &getter =
          behavior.GetEventsFunctions().GetEventsFunction("MovementAngle");

      REQUIRE(getter.GetFunctionType() ==
              gd::EventsFunction::ExpressionAndCondition);
      REQUIRE(getter.GetExpressionType().GetName() == "expression");
      REQUIRE(getter.GetFullName() == "Movement angle");
      REQUIRE(getter.GetGroup() ==
              "My events based behavior movement configuration");
      REQUIRE(getter.GetDescription() ==
              "the movement angle of the object. The "
              "angle of the trajectory direction.");
      REQUIRE(getter.GetSentence() == "the movement angle");
      // Object and behavior parameters are added automatically.
      REQUIRE(getter.GetParameters().size() == 0);

      REQUIRE(getter.GetEvents().GetEventsCount() == 1);
      REQUIRE(getter.GetEvents().GetEvent(0).GetType() ==
              "BuiltinCommonInstructions::Standard");
      auto &getterEvent =
          dynamic_cast<gd::StandardEvent &>(getter.GetEvents().GetEvent(0));
      REQUIRE(getterEvent.GetConditions().size() == 0);
      REQUIRE(getterEvent.GetActions().size() == 1);
      auto &getterAction = getterEvent.GetActions().at(0);
      REQUIRE(getterAction.GetType() == "SetReturnNumber");
      REQUIRE(getterAction.GetParametersCount() == 1);
      REQUIRE(getterAction.GetParameter(0).GetPlainString() ==
              "Object.Behavior::PropertyMovementAngle()");
    }
    {
      auto &setter =
          behavior.GetEventsFunctions().GetEventsFunction("SetMovementAngle");

      REQUIRE(setter.GetFunctionType() ==
              gd::EventsFunction::ActionWithOperator);
      REQUIRE(setter.GetGetterName() == "MovementAngle");
      // These fields are deducted from the getter.
      REQUIRE(setter.GetFullName() == "");
      REQUIRE(setter.GetGroup() == "");
      REQUIRE(setter.GetDescription() == "");
      REQUIRE(setter.GetSentence() == "");
      // Object and behavior parameters are added automatically.
      REQUIRE(setter.GetParameters().size() == 0);

      REQUIRE(setter.GetEvents().GetEventsCount() == 1);
      REQUIRE(setter.GetEvents().GetEvent(0).GetType() ==
              "BuiltinCommonInstructions::Standard");
      auto &setterEvent =
          dynamic_cast<gd::StandardEvent &>(setter.GetEvents().GetEvent(0));
      REQUIRE(setterEvent.GetConditions().size() == 0);
      REQUIRE(setterEvent.GetActions().size() == 1);
      auto &setterAction = setterEvent.GetActions().at(0);
      REQUIRE(
          setterAction.GetType() ==
          "MyEventsExtension::MyEventsBasedBehavior::SetPropertyMovementAngle");
      REQUIRE(setterAction.GetParametersCount() == 4);
      REQUIRE(setterAction.GetParameter(0).GetPlainString() == "Object");
      REQUIRE(setterAction.GetParameter(1).GetPlainString() == "Behavior");
      REQUIRE(setterAction.GetParameter(2).GetPlainString() == "=");
      REQUIRE(setterAction.GetParameter(3).GetPlainString() ==
              "GetArgumentAsNumber(\"Value\")");
    }
  }

  SECTION("Can generate functions for a choice property") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &behavior = CreateBehavior(extension);

    auto &property =
        behavior.GetPropertyDescriptors().InsertNew("CollisionShape", 0);
    property.SetType("Choice")
        .SetLabel("Collision shape")
        .SetLabel("Dot shape")
        .SetDescription("The shape is used for collision.")
        .SetGroup("Movement");
    property.GetExtraInfo().push_back("Dot shape");
    property.GetExtraInfo().push_back("Bounding disk");

    gd::PropertyFunctionGenerator::GenerateGetterAndSetter(
        project, extension, behavior, property, false);

    REQUIRE(
        behavior.GetEventsFunctions().HasEventsFunctionNamed("CollisionShape"));
    REQUIRE(behavior.GetEventsFunctions().HasEventsFunctionNamed(
        "SetCollisionShape"));

    auto &getter =
        behavior.GetEventsFunctions().GetEventsFunction("CollisionShape");

    REQUIRE(getter.GetFunctionType() ==
            gd::EventsFunction::ExpressionAndCondition);
    REQUIRE(getter.GetExpressionType().GetName() == "stringWithSelector");
    REQUIRE(getter.GetExpressionType().GetExtraInfo() ==
            "[\"Dot shape\",\"Bounding disk\"]");
  }

  SECTION("Can generate functions for a boolean property") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &behavior = CreateBehavior(extension);

    auto &property = behavior.GetPropertyDescriptors().InsertNew("Rotate", 0);
    property.SetType("Boolean")
        .SetLabel("Rotate object")
        .SetDescription(
            "The rotation follows movements done by this behavior only.")
        .SetGroup("Movement");

    gd::PropertyFunctionGenerator::GenerateGetterAndSetter(
        project, extension, behavior, property, false);

    REQUIRE(behavior.GetEventsFunctions().HasEventsFunctionNamed("Rotate"));
    REQUIRE(behavior.GetEventsFunctions().HasEventsFunctionNamed("SetRotate"));
    {
      auto &getter = behavior.GetEventsFunctions().GetEventsFunction("Rotate");
      REQUIRE(getter.GetFunctionType() == gd::EventsFunction::Condition);
      REQUIRE(getter.GetExpressionType().GetName() == "boolean");
      REQUIRE(getter.GetFullName() == "Rotate object");
      REQUIRE(getter.GetGroup() ==
              "My events based behavior movement configuration");
      REQUIRE(getter.GetDescription() ==
              "Check if rotate object. The rotation follows movements done by "
              "this behavior only.");
      REQUIRE(getter.GetSentence() == "_PARAM0_ rotate object");
      // Object and behavior parameters are added automatically.
      REQUIRE(getter.GetParameters().size() == 0);
      // auto &objectParameter = getter.GetParameters().at(0);
      // REQUIRE(objectParameter.GetName() == "Object");
      // REQUIRE(objectParameter.GetType() == "object");
      // auto &behaviorParameter = getter.GetParameters().at(1);
      // REQUIRE(behaviorParameter.GetName() == "Behavior");
      // REQUIRE(behaviorParameter.GetType() == "behavior");
      // REQUIRE(behaviorParameter.GetExtraInfo() ==
      //         "MyEventsExtension::MovementAngle");

      REQUIRE(getter.GetEvents().GetEventsCount() == 1);
      REQUIRE(getter.GetEvents().GetEvent(0).GetType() ==
              "BuiltinCommonInstructions::Standard");
      auto &getterEvent =
          dynamic_cast<gd::StandardEvent &>(getter.GetEvents().GetEvent(0));
      REQUIRE(getterEvent.GetConditions().size() == 1);
      REQUIRE(getterEvent.GetActions().size() == 1);

      auto &getterCondition = getterEvent.GetConditions().at(0);
      REQUIRE(getterCondition.GetType() ==
              "MyEventsExtension::MyEventsBasedBehavior::PropertyRotate");
      REQUIRE(!getterCondition.IsInverted());
      REQUIRE(getterCondition.GetParametersCount() == 2);
      REQUIRE(getterCondition.GetParameter(0).GetPlainString() == "Object");
      REQUIRE(getterCondition.GetParameter(1).GetPlainString() == "Behavior");

      auto &getterAction = getterEvent.GetActions().at(0);
      REQUIRE(getterAction.GetType() == "SetReturnBoolean");
      REQUIRE(getterAction.GetParametersCount() == 1);
      REQUIRE(getterAction.GetParameter(0).GetPlainString() == "True");
    }
    {
      auto &setter =
          behavior.GetEventsFunctions().GetEventsFunction("SetRotate");

      REQUIRE(setter.GetFunctionType() == gd::EventsFunction::Action);
      REQUIRE(setter.GetFullName() == "Rotate object");
      REQUIRE(setter.GetGroup() ==
              "My events based behavior movement configuration");
      REQUIRE(setter.GetDescription() ==
              "Change if rotate object. The rotation follows movements done by "
              "this behavior only.");
      REQUIRE(setter.GetSentence() == "_PARAM0_ rotate object: _PARAM2_");
      // Object and behavior parameters are added automatically.
      REQUIRE(setter.GetParameters().size() == 1);
      // auto &objectParameter = setter.GetParameters().at(0);
      // REQUIRE(objectParameter.GetName() == "Object");
      // REQUIRE(objectParameter.GetType() == "object");
      // auto &behaviorParameter = setter.GetParameters().at(1);
      // REQUIRE(behaviorParameter.GetName() == "Behavior");
      // REQUIRE(behaviorParameter.GetType() == "behavior");
      // REQUIRE(behaviorParameter.GetExtraInfo() ==
      //         "MyEventsExtension::MovementAngle");
      auto &valueParameter = setter.GetParameters().at(0);
      REQUIRE(valueParameter.GetName() == "Value");
      REQUIRE(valueParameter.GetType() == "yesorno");

      REQUIRE(setter.GetEvents().GetEventsCount() == 2);
      REQUIRE(setter.GetEvents().GetEvent(0).GetType() ==
              "BuiltinCommonInstructions::Standard");
      REQUIRE(setter.GetEvents().GetEvent(1).GetType() ==
              "BuiltinCommonInstructions::Standard");

      auto &setterNoEvent =
          dynamic_cast<gd::StandardEvent &>(setter.GetEvents().GetEvent(0));
      REQUIRE(setterNoEvent.GetConditions().size() == 1);
      REQUIRE(setterNoEvent.GetActions().size() == 1);

      auto &setterNoCondition = setterNoEvent.GetConditions().at(0);
      REQUIRE(setterNoCondition.GetType() == "GetArgumentAsBoolean");
      REQUIRE(setterNoCondition.IsInverted());
      REQUIRE(setterNoCondition.GetParametersCount() == 1);
      REQUIRE(setterNoCondition.GetParameter(0).GetPlainString() ==
              "\"Value\"");

      auto &setterNoAction = setterNoEvent.GetActions().at(0);
      REQUIRE(setterNoAction.GetType() ==
              "MyEventsExtension::MyEventsBasedBehavior::SetPropertyRotate");
      REQUIRE(setterNoAction.GetParametersCount() == 3);
      REQUIRE(setterNoAction.GetParameter(0).GetPlainString() == "Object");
      REQUIRE(setterNoAction.GetParameter(1).GetPlainString() == "Behavior");
      REQUIRE(setterNoAction.GetParameter(2).GetPlainString() == "no");

      auto &setterYesEvent =
          dynamic_cast<gd::StandardEvent &>(setter.GetEvents().GetEvent(1));
      REQUIRE(setterYesEvent.GetConditions().size() == 1);
      REQUIRE(setterYesEvent.GetActions().size() == 1);

      auto &setterYesCondition = setterYesEvent.GetConditions().at(0);
      REQUIRE(setterYesCondition.GetType() == "GetArgumentAsBoolean");
      REQUIRE(!setterYesCondition.IsInverted());
      REQUIRE(setterYesCondition.GetParametersCount() == 1);
      REQUIRE(setterYesCondition.GetParameter(0).GetPlainString() ==
              "\"Value\"");

      auto &setterYesAction = setterYesEvent.GetActions().at(0);
      REQUIRE(setterYesAction.GetType() ==
              "MyEventsExtension::MyEventsBasedBehavior::SetPropertyRotate");
      REQUIRE(setterYesAction.GetParametersCount() == 3);
      REQUIRE(setterYesAction.GetParameter(0).GetPlainString() == "Object");
      REQUIRE(setterYesAction.GetParameter(1).GetPlainString() == "Behavior");
      REQUIRE(setterYesAction.GetParameter(2).GetPlainString() == "yes");
    }
  }

  SECTION("Can generate functions for a shared property") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &behavior = CreateBehavior(extension);

    auto &property =
        behavior.GetSharedPropertyDescriptors().InsertNew("MovementAngle", 0);
    property.SetType("Number")
        .SetLabel("Movement angle")
        .SetDescription("The angle of the trajectory direction.")
        .SetGroup("Movement");

    gd::PropertyFunctionGenerator::GenerateGetterAndSetter(
        project, extension, behavior, property, true);

    REQUIRE(
        behavior.GetEventsFunctions().HasEventsFunctionNamed("MovementAngle"));
    REQUIRE(behavior.GetEventsFunctions().HasEventsFunctionNamed(
        "SetMovementAngle"));
    {
      auto &getter =
          behavior.GetEventsFunctions().GetEventsFunction("MovementAngle");
      REQUIRE(getter.GetDescription() ==
              "the movement angle. The angle of the trajectory direction. "
              "While an object is needed, this will apply to all objects using "
              "the behavior.");

      REQUIRE(getter.GetEvents().GetEventsCount() == 1);
      REQUIRE(getter.GetEvents().GetEvent(0).GetType() ==
              "BuiltinCommonInstructions::Standard");
      auto &getterEvent =
          dynamic_cast<gd::StandardEvent &>(getter.GetEvents().GetEvent(0));
      REQUIRE(getterEvent.GetConditions().size() == 0);
      REQUIRE(getterEvent.GetActions().size() == 1);
      auto &getterAction = getterEvent.GetActions().at(0);
      REQUIRE(getterAction.GetType() == "SetReturnNumber");
      REQUIRE(getterAction.GetParametersCount() == 1);
      REQUIRE(getterAction.GetParameter(0).GetPlainString() ==
              "Object.Behavior::SharedPropertyMovementAngle()");
    }
    {
      auto &setter =
          behavior.GetEventsFunctions().GetEventsFunction("SetMovementAngle");

      REQUIRE(setter.GetEvents().GetEventsCount() == 1);
      REQUIRE(setter.GetEvents().GetEvent(0).GetType() ==
              "BuiltinCommonInstructions::Standard");
      auto &setterEvent =
          dynamic_cast<gd::StandardEvent &>(setter.GetEvents().GetEvent(0));
      REQUIRE(setterEvent.GetConditions().size() == 0);
      REQUIRE(setterEvent.GetActions().size() == 1);
      auto &setterAction = setterEvent.GetActions().at(0);
      REQUIRE(setterAction.GetType() ==
              "MyEventsExtension::MyEventsBasedBehavior::"
              "SetSharedPropertyMovementAngle");
    }
  }
}
