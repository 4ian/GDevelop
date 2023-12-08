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

gd::EventsBasedObject &
CreateObject(gd::EventsFunctionsExtension &eventsExtension) {
  auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
      "MyEventsBasedObject", 0);
  eventsBasedObject.SetFullName("My events based object");
  eventsBasedObject.SetDescription("An events based object for test");
  return eventsBasedObject;
};

} // namespace

TEST_CASE("PropertyFunctionGenerator", "[common]") {
  SECTION("Can generate functions for a number property in a behavior") {
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

    gd::PropertyFunctionGenerator::GenerateBehaviorGetterAndSetter(
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
      REQUIRE(getterAction.GetParameter(0).GetPlainString() == "MovementAngle");
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
      REQUIRE(setterAction.GetParameter(3).GetPlainString() == "Value");
    }
  }

  SECTION("Can generate functions for a choice property in a behavior") {
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

    gd::PropertyFunctionGenerator::GenerateBehaviorGetterAndSetter(
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

  SECTION("Can generate functions for a boolean property in a behavior") {
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

    gd::PropertyFunctionGenerator::GenerateBehaviorGetterAndSetter(
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
      // To generate the value parameter, object and behavior parameters has to
      // be declared too.
      REQUIRE(setter.GetParameters().size() == 3);
      auto &objectParameter = setter.GetParameters().at(0);
      REQUIRE(objectParameter.GetName() == "Object");
      REQUIRE(objectParameter.GetType() == "object");
      auto &behaviorParameter = setter.GetParameters().at(1);
      REQUIRE(behaviorParameter.GetName() == "Behavior");
      REQUIRE(behaviorParameter.GetType() == "behavior");
      REQUIRE(behaviorParameter.GetExtraInfo() ==
              "MyEventsExtension::MyEventsBasedBehavior");
      auto &valueParameter = setter.GetParameters().at(2);
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
  SECTION("Can generate functions for a number property in an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &object = CreateObject(extension);

    auto &property =
        object.GetPropertyDescriptors().InsertNew("MovementAngle", 0);
    property.SetType("Number")
        .SetLabel("Movement angle")
        .SetDescription("The angle of the trajectory direction.")
        .SetGroup("Movement");

    gd::PropertyFunctionGenerator::GenerateObjectGetterAndSetter(
        project, extension, object, property);

    REQUIRE(
        object.GetEventsFunctions().HasEventsFunctionNamed("MovementAngle"));
    REQUIRE(
        object.GetEventsFunctions().HasEventsFunctionNamed("SetMovementAngle"));
    {
      auto &getter =
          object.GetEventsFunctions().GetEventsFunction("MovementAngle");

      REQUIRE(getter.GetFunctionType() ==
              gd::EventsFunction::ExpressionAndCondition);
      REQUIRE(getter.GetExpressionType().GetName() == "expression");
      REQUIRE(getter.GetFullName() == "Movement angle");
      REQUIRE(getter.GetGroup() ==
              "My events based object movement configuration");
      REQUIRE(getter.GetDescription() ==
              "the movement angle of the object. The "
              "angle of the trajectory direction.");
      REQUIRE(getter.GetSentence() == "the movement angle");
      // Object parameter is added automatically.
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
      REQUIRE(getterAction.GetParameter(0).GetPlainString() == "MovementAngle");
    }
    {
      auto &setter =
          object.GetEventsFunctions().GetEventsFunction("SetMovementAngle");

      REQUIRE(setter.GetFunctionType() ==
              gd::EventsFunction::ActionWithOperator);
      REQUIRE(setter.GetGetterName() == "MovementAngle");
      // These fields are deducted from the getter.
      REQUIRE(setter.GetFullName() == "");
      REQUIRE(setter.GetGroup() == "");
      REQUIRE(setter.GetDescription() == "");
      REQUIRE(setter.GetSentence() == "");
      // Object parameter is added automatically.
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
          "MyEventsExtension::MyEventsBasedObject::SetPropertyMovementAngle");
      REQUIRE(setterAction.GetParametersCount() == 3);
      REQUIRE(setterAction.GetParameter(0).GetPlainString() == "Object");
      REQUIRE(setterAction.GetParameter(1).GetPlainString() == "=");
      REQUIRE(setterAction.GetParameter(2).GetPlainString() == "Value");
    }
  }

  SECTION("Can generate functions for a choice property in an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &object = CreateObject(extension);

    auto &property =
        object.GetPropertyDescriptors().InsertNew("CollisionShape", 0);
    property.SetType("Choice")
        .SetLabel("Collision shape")
        .SetLabel("Dot shape")
        .SetDescription("The shape is used for collision.")
        .SetGroup("Movement");
    property.GetExtraInfo().push_back("Dot shape");
    property.GetExtraInfo().push_back("Bounding disk");

    gd::PropertyFunctionGenerator::GenerateObjectGetterAndSetter(
        project, extension, object, property);

    REQUIRE(
        object.GetEventsFunctions().HasEventsFunctionNamed("CollisionShape"));
    REQUIRE(object.GetEventsFunctions().HasEventsFunctionNamed(
        "SetCollisionShape"));

    auto &getter =
        object.GetEventsFunctions().GetEventsFunction("CollisionShape");

    REQUIRE(getter.GetFunctionType() ==
            gd::EventsFunction::ExpressionAndCondition);
    REQUIRE(getter.GetExpressionType().GetName() == "stringWithSelector");
    REQUIRE(getter.GetExpressionType().GetExtraInfo() ==
            "[\"Dot shape\",\"Bounding disk\"]");
  }

  SECTION("Can generate functions for a boolean property in an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &object = CreateObject(extension);

    auto &property = object.GetPropertyDescriptors().InsertNew("Rotate", 0);
    property.SetType("Boolean")
        .SetLabel("Rotate object")
        .SetDescription("The rotation follows movements done by this object.")
        .SetGroup("Movement");

    gd::PropertyFunctionGenerator::GenerateObjectGetterAndSetter(
        project, extension, object, property);

    REQUIRE(object.GetEventsFunctions().HasEventsFunctionNamed("Rotate"));
    REQUIRE(object.GetEventsFunctions().HasEventsFunctionNamed("SetRotate"));
    {
      auto &getter = object.GetEventsFunctions().GetEventsFunction("Rotate");
      REQUIRE(getter.GetFunctionType() == gd::EventsFunction::Condition);
      REQUIRE(getter.GetExpressionType().GetName() == "boolean");
      REQUIRE(getter.GetFullName() == "Rotate object");
      REQUIRE(getter.GetGroup() ==
              "My events based object movement configuration");
      REQUIRE(getter.GetDescription() ==
              "Check if rotate object. The rotation follows movements done by "
              "this object.");
      REQUIRE(getter.GetSentence() == "_PARAM0_ rotate object");
      // The Object parameter is added automatically.
      REQUIRE(getter.GetParameters().size() == 0);

      REQUIRE(getter.GetEvents().GetEventsCount() == 1);
      REQUIRE(getter.GetEvents().GetEvent(0).GetType() ==
              "BuiltinCommonInstructions::Standard");
      auto &getterEvent =
          dynamic_cast<gd::StandardEvent &>(getter.GetEvents().GetEvent(0));
      REQUIRE(getterEvent.GetConditions().size() == 1);
      REQUIRE(getterEvent.GetActions().size() == 1);

      auto &getterCondition = getterEvent.GetConditions().at(0);
      REQUIRE(getterCondition.GetType() ==
              "MyEventsExtension::MyEventsBasedObject::PropertyRotate");
      REQUIRE(!getterCondition.IsInverted());
      REQUIRE(getterCondition.GetParametersCount() == 1);
      REQUIRE(getterCondition.GetParameter(0).GetPlainString() == "Object");

      auto &getterAction = getterEvent.GetActions().at(0);
      REQUIRE(getterAction.GetType() == "SetReturnBoolean");
      REQUIRE(getterAction.GetParametersCount() == 1);
      REQUIRE(getterAction.GetParameter(0).GetPlainString() == "True");
    }
    {
      auto &setter = object.GetEventsFunctions().GetEventsFunction("SetRotate");

      REQUIRE(setter.GetFunctionType() == gd::EventsFunction::Action);
      REQUIRE(setter.GetFullName() == "Rotate object");
      REQUIRE(setter.GetGroup() ==
              "My events based object movement configuration");
      REQUIRE(setter.GetDescription() ==
              "Change if rotate object. The rotation follows movements done by "
              "this object.");
      REQUIRE(setter.GetSentence() == "_PARAM0_ rotate object: _PARAM1_");
      // To generate the value parameter, the object parameter has to
      // be declared too.
      REQUIRE(setter.GetParameters().size() == 2);
      auto &objectParameter = setter.GetParameters().at(0);
      REQUIRE(objectParameter.GetName() == "Object");
      REQUIRE(objectParameter.GetType() == "object");
      REQUIRE(objectParameter.GetExtraInfo() ==
              "MyEventsExtension::MyEventsBasedObject");
      auto &valueParameter = setter.GetParameters().at(1);
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
              "MyEventsExtension::MyEventsBasedObject::SetPropertyRotate");
      REQUIRE(setterNoAction.GetParametersCount() == 2);
      REQUIRE(setterNoAction.GetParameter(0).GetPlainString() == "Object");
      REQUIRE(setterNoAction.GetParameter(1).GetPlainString() == "no");

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
              "MyEventsExtension::MyEventsBasedObject::SetPropertyRotate");
      REQUIRE(setterYesAction.GetParametersCount() == 2);
      REQUIRE(setterYesAction.GetParameter(0).GetPlainString() == "Object");
      REQUIRE(setterYesAction.GetParameter(1).GetPlainString() == "yes");
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

    gd::PropertyFunctionGenerator::GenerateBehaviorGetterAndSetter(
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
      REQUIRE(getterAction.GetParameter(0).GetPlainString() == "MovementAngle");
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

  SECTION("Allow functions generation when there is no setter") {
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

    REQUIRE(gd::PropertyFunctionGenerator::CanGenerateGetterAndSetter(
        behavior, property));
  }

  SECTION("Forbid functions generation when a getter exists") {
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

    behavior.GetEventsFunctions().InsertNewEventsFunction("MovementAngle", 0);

    REQUIRE(!gd::PropertyFunctionGenerator::CanGenerateGetterAndSetter(
        behavior, property));
  }

  SECTION("Forbid functions generation when a setter exists") {
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

    behavior.GetEventsFunctions().InsertNewEventsFunction("SetMovementAngle",
                                                          0);

    REQUIRE(!gd::PropertyFunctionGenerator::CanGenerateGetterAndSetter(
        behavior, property));
  }

  SECTION("Forbid functions generation when both setter and getter exist") {
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

    behavior.GetEventsFunctions().InsertNewEventsFunction("MovementAngle", 0);
    behavior.GetEventsFunctions().InsertNewEventsFunction("SetMovementAngle",
                                                          0);

    REQUIRE(!gd::PropertyFunctionGenerator::CanGenerateGetterAndSetter(
        behavior, property));
  }

  SECTION("Forbid functions generation for required behavior properties") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &behavior = CreateBehavior(extension);

    auto &property =
        behavior.GetPropertyDescriptors().InsertNew("MovementAngle", 0);
    property.SetType("Behavior")
        .SetLabel("Pathfinding behavior")
        .SetDescription("A required behavior.")
        .SetGroup("Movement")
        .GetExtraInfo()
        .push_back("PlatformBehavior::PlatformerObjectBehavior");

    REQUIRE(!gd::PropertyFunctionGenerator::CanGenerateGetterAndSetter(
        behavior, property));
  }

  SECTION("Can generate functions when only the property name is filled") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &behavior = CreateBehavior(extension);

    auto &property =
        behavior.GetPropertyDescriptors().InsertNew("MovementAngle", 0);
    property.SetType("Number");

    gd::PropertyFunctionGenerator::GenerateBehaviorGetterAndSetter(
        project, extension, behavior, property, false);

    REQUIRE(
        behavior.GetEventsFunctions().HasEventsFunctionNamed("MovementAngle"));
    REQUIRE(behavior.GetEventsFunctions().HasEventsFunctionNamed(
        "SetMovementAngle"));

    auto &getter =
        behavior.GetEventsFunctions().GetEventsFunction("MovementAngle");

    REQUIRE(getter.GetFunctionType() ==
            gd::EventsFunction::ExpressionAndCondition);
    REQUIRE(getter.GetExpressionType().GetName() == "expression");
    REQUIRE(getter.GetFullName() == "MovementAngle");
    REQUIRE(getter.GetGroup() == "My events based behavior configuration");
    REQUIRE(getter.GetDescription() == "the movementAngle of the object.");
    REQUIRE(getter.GetSentence() == "the movementAngle");
  }
}
