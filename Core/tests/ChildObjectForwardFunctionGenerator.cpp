/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/ExtensionEditor/ChildObjectForwardFunctionGenerator.h"
#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "catch.hpp"

TEST_CASE("ChildObjectForwardFunctionGenerator", "[common]") {
  SECTION("Can generate a function to forward an action") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &parentEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyParentEventsBasedObject", 0);
    auto &childEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyChildEventsBasedObject", 0);
    parentEventsBasedObject.GetObjects().InsertNewObject(
        project, "MyEventsExtension::MyChildEventsBasedObject", "MyChildObject",
        0);

    auto &childFunction =
        childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MyFunction", 0);
    childFunction.SetFunctionType(gd::EventsFunction::FunctionType::Action);
    childFunction.SetFullName("My function");
    gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
        extension, childEventsBasedObject);
    {
      auto &parameter =
          childFunction.GetParameters().AddNewParameter("MyStringParameter");
      parameter.SetType("string");
    }
    {
      auto &parameter =
          childFunction.GetParameters().AddNewParameter("MyNumberParameter");
      parameter.SetType("number");
    }

    gd::ChildObjectForwardFunctionGenerator::
        GenerateChildObjectForwardFunctions(
            project, extension, parentEventsBasedObject, "MyChildObject");

    REQUIRE(parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
        "MyFunction"));
    auto &parentFunction =
        parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
            "MyFunction");

    REQUIRE(parentFunction.GetFullName() == "My function");
    REQUIRE(parentFunction.GetParameters().GetParametersCount() == 3);
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
            "object");
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
            "MyEventsExtension::MyParentEventsBasedObject");
    REQUIRE(parentFunction.GetParameters().GetParameter(1).GetType() ==
            "string");
    REQUIRE(parentFunction.GetParameters().GetParameter(2).GetType() ==
            "number");

    REQUIRE(parentFunction.GetEvents().GetEventsCount() == 1);
    auto &event = parentFunction.GetEvents().GetEvent(0);
    REQUIRE(event.GetInstructionList("conditions")->GetCount() == 0);
    REQUIRE(event.GetInstructionList("actions")->GetCount() == 1);
    auto &action = event.GetInstructionList("actions")->Get(0);
    REQUIRE(action.GetType() ==
            "MyEventsExtension::MyChildEventsBasedObject::MyFunction");
    REQUIRE(action.GetParametersCount() == 3);
    REQUIRE(action.GetParameter(0).GetPlainString() == "MyChildObject");
    REQUIRE(action.GetParameter(1).GetPlainString() == "MyStringParameter");
    REQUIRE(action.GetParameter(2).GetPlainString() == "MyNumberParameter");
  }

  SECTION("Can generate a function to forward a condition") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &parentEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyParentEventsBasedObject", 0);
    auto &childEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyChildEventsBasedObject", 0);

    parentEventsBasedObject.GetObjects().InsertNewObject(
        project, "MyEventsExtension::MyChildEventsBasedObject", "MyChildObject",
        0);
    auto &childFunction =
        childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MyFunction", 0);
    childFunction.SetFunctionType(gd::EventsFunction::FunctionType::Condition);
    childFunction.SetFullName("My function");
    gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
        extension, childEventsBasedObject);
    {
      auto &parameter =
          childFunction.GetParameters().AddNewParameter("MyStringParameter");
      parameter.SetType("string");
    }
    {
      auto &parameter =
          childFunction.GetParameters().AddNewParameter("MyNumberParameter");
      parameter.SetType("number");
    }

    gd::ChildObjectForwardFunctionGenerator::
        GenerateChildObjectForwardFunctions(
            project, extension, parentEventsBasedObject, "MyChildObject");

    REQUIRE(parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
        "MyFunction"));
    auto &parentFunction =
        parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
            "MyFunction");

    REQUIRE(parentFunction.GetFullName() == "My function");
    REQUIRE(parentFunction.GetParameters().GetParametersCount() == 3);
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
            "object");
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
            "MyEventsExtension::MyParentEventsBasedObject");
    REQUIRE(parentFunction.GetParameters().GetParameter(1).GetType() ==
            "string");
    REQUIRE(parentFunction.GetParameters().GetParameter(2).GetType() ==
            "number");

    REQUIRE(parentFunction.GetEvents().GetEventsCount() == 1);
    auto &event = parentFunction.GetEvents().GetEvent(0);
    REQUIRE(event.GetInstructionList("conditions")->GetCount() == 1);
    auto &condition = event.GetInstructionList("conditions")->Get(0);
    REQUIRE(condition.GetType() ==
            "MyEventsExtension::MyChildEventsBasedObject::MyFunction");
    REQUIRE(condition.GetParametersCount() == 3);
    REQUIRE(condition.GetParameter(0).GetPlainString() == "MyChildObject");
    REQUIRE(condition.GetParameter(1).GetPlainString() == "MyStringParameter");
    REQUIRE(condition.GetParameter(2).GetPlainString() == "MyNumberParameter");

    REQUIRE(event.GetInstructionList("actions")->GetCount() == 1);
    auto &action = event.GetInstructionList("actions")->Get(0);
    REQUIRE(action.GetType() == "SetReturnBoolean");
    REQUIRE(action.GetParametersCount() == 1);
    REQUIRE(action.GetParameter(0).GetPlainString() == "True");
  }

  SECTION("Can generate a function to forward an expression") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &parentEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyParentEventsBasedObject", 0);
    auto &childEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyChildEventsBasedObject", 0);

    parentEventsBasedObject.GetObjects().InsertNewObject(
        project, "MyEventsExtension::MyChildEventsBasedObject", "MyChildObject",
        0);
    auto &childFunction =
        childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MyFunction", 0);
    childFunction.SetFunctionType(gd::EventsFunction::FunctionType::Expression);
    childFunction.SetFullName("My function");
    gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
        extension, childEventsBasedObject);
    {
      auto &parameter =
          childFunction.GetParameters().AddNewParameter("MyStringParameter");
      parameter.SetType("string");
    }
    {
      auto &parameter =
          childFunction.GetParameters().AddNewParameter("MyNumberParameter");
      parameter.SetType("number");
    }

    gd::ChildObjectForwardFunctionGenerator::
        GenerateChildObjectForwardFunctions(
            project, extension, parentEventsBasedObject, "MyChildObject");

    REQUIRE(parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
        "MyFunction"));
    auto &parentFunction =
        parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
            "MyFunction");

    REQUIRE(parentFunction.GetFullName() == "My function");
    REQUIRE(parentFunction.GetFunctionType() ==
            gd::EventsFunction::FunctionType::Expression);
    REQUIRE(parentFunction.GetExpressionType().IsNumber());
    REQUIRE(parentFunction.GetParameters().GetParametersCount() == 3);
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
            "object");
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
            "MyEventsExtension::MyParentEventsBasedObject");
    REQUIRE(parentFunction.GetParameters().GetParameter(1).GetType() ==
            "string");
    REQUIRE(parentFunction.GetParameters().GetParameter(2).GetType() ==
            "number");

    REQUIRE(parentFunction.GetEvents().GetEventsCount() == 1);
    auto &event = parentFunction.GetEvents().GetEvent(0);
    REQUIRE(event.GetInstructionList("conditions")->GetCount() == 0);
    REQUIRE(event.GetInstructionList("actions")->GetCount() == 1);
    auto &action = event.GetInstructionList("actions")->Get(0);
    REQUIRE(action.GetType() == "SetReturnNumber");
    REQUIRE(action.GetParametersCount() == 1);
    REQUIRE(action.GetParameter(0).GetPlainString() ==
            "MyChildObject.MyFunction(MyStringParameter, MyNumberParameter)");
  }

  SECTION("Can generate a function to forward a getter and setter") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &parentEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyParentEventsBasedObject", 0);
    auto &childEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyChildEventsBasedObject", 0);

    parentEventsBasedObject.GetObjects().InsertNewObject(
        project, "MyEventsExtension::MyChildEventsBasedObject", "MyChildObject",
        0);
    {
      auto &childFunction =
          childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
              "MyGetterFunction", 0);
      childFunction.SetFunctionType(
          gd::EventsFunction::FunctionType::ExpressionAndCondition);
      childFunction.GetExpressionType().SetName("number");
      gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
          extension, childEventsBasedObject);
    }
    {
      auto &childFunction =
          childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
              "MySetterFunction", 1);
      childFunction.SetFunctionType(
          gd::EventsFunction::FunctionType::ActionWithOperator);
      childFunction.SetGetterName("MyGetterFunction");
      gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
          extension, childEventsBasedObject);
    }

    gd::ChildObjectForwardFunctionGenerator::
        GenerateChildObjectForwardFunctions(
            project, extension, parentEventsBasedObject, "MyChildObject");

    {
      REQUIRE(
          parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
              "MyGetterFunction"));
      auto &parentFunction =
          parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
              "MyGetterFunction");
      REQUIRE(parentFunction.GetFunctionType() ==
              gd::EventsFunction::FunctionType::ExpressionAndCondition);
      REQUIRE(parentFunction.GetExpressionType().IsNumber());
      REQUIRE(parentFunction.GetParameters().GetParametersCount() == 1);
      REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
              "object");
      REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
              "MyEventsExtension::MyParentEventsBasedObject");

      REQUIRE(parentFunction.GetEvents().GetEventsCount() == 1);
      auto &event = parentFunction.GetEvents().GetEvent(0);
      REQUIRE(event.GetInstructionList("conditions")->GetCount() == 0);

      REQUIRE(event.GetInstructionList("actions")->GetCount() == 1);
      auto &action = event.GetInstructionList("actions")->Get(0);
      REQUIRE(action.GetType() == "SetReturnNumber");
      REQUIRE(action.GetParametersCount() == 1);
      REQUIRE(action.GetParameter(0).GetPlainString() ==
              "MyChildObject.MyGetterFunction()");
    }
    {
      REQUIRE(
          parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
              "MySetterFunction"));
      auto &parentFunction =
          parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
              "MySetterFunction");
      REQUIRE(parentFunction.GetFunctionType() ==
              gd::EventsFunction::FunctionType::ActionWithOperator);
      REQUIRE(parentFunction.GetGetterName() == "MyGetterFunction");
      REQUIRE(parentFunction.GetParameters().GetParametersCount() == 1);
      REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
              "object");
      REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
              "MyEventsExtension::MyParentEventsBasedObject");

      REQUIRE(parentFunction.GetEvents().GetEventsCount() == 1);
      auto &event = parentFunction.GetEvents().GetEvent(0);
      REQUIRE(event.GetInstructionList("conditions")->GetCount() == 0);

      REQUIRE(event.GetInstructionList("actions")->GetCount() == 1);
      auto &action = event.GetInstructionList("actions")->Get(0);
      REQUIRE(action.GetType() ==
              "MyEventsExtension::MyChildEventsBasedObject::MySetterFunction");
      REQUIRE(action.GetParametersCount() == 3);
      REQUIRE(action.GetParameter(0).GetPlainString() == "MyChildObject");
      REQUIRE(action.GetParameter(1).GetPlainString() == "=");
      REQUIRE(action.GetParameter(2).GetPlainString() == "Value");
    }
  }

  SECTION("Can generate a function to forward a boolean setter") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &parentEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyParentEventsBasedObject", 0);
    auto &childEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyChildEventsBasedObject", 0);

    parentEventsBasedObject.GetObjects().InsertNewObject(
        project, "MyEventsExtension::MyChildEventsBasedObject", "MyChildObject",
        0);

    auto &childFunction =
        childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MySetterFunction", 1);
    childFunction.SetFunctionType(gd::EventsFunction::FunctionType::Action);
    gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
        extension, childEventsBasedObject);
    {
      auto &parameter = childFunction.GetParameters().AddNewParameter("Value");
      parameter.SetType("yesorno");
    }

    gd::ChildObjectForwardFunctionGenerator::
        GenerateChildObjectForwardFunctions(
            project, extension, parentEventsBasedObject, "MyChildObject");

    REQUIRE(parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
        "MySetterFunction"));
    auto &parentFunction =
        parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
            "MySetterFunction");
    REQUIRE(parentFunction.GetFunctionType() ==
            gd::EventsFunction::FunctionType::Action);
    REQUIRE(parentFunction.GetParameters().GetParametersCount() == 2);
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
            "object");
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
            "MyEventsExtension::MyParentEventsBasedObject");
    REQUIRE(parentFunction.GetParameters().GetParameter(1).GetType() ==
            "yesorno");

    REQUIRE(parentFunction.GetEvents().GetEventsCount() == 2);
    {
      auto &event = parentFunction.GetEvents().GetEvent(0);
      REQUIRE(event.GetInstructionList("conditions")->GetCount() == 1);
      auto &condition = event.GetInstructionList("conditions")->Get(0);
      REQUIRE(condition.GetType() == "BooleanVariable");
      REQUIRE(condition.GetParametersCount() == 3);
      REQUIRE(condition.GetParameter(0).GetPlainString() == "Value");
      REQUIRE(condition.GetParameter(1).GetPlainString() == "False");
      REQUIRE(condition.GetParameter(2).GetPlainString() == "");

      REQUIRE(event.GetInstructionList("actions")->GetCount() == 1);
      auto &action = event.GetInstructionList("actions")->Get(0);
      REQUIRE(action.GetType() ==
              "MyEventsExtension::MyChildEventsBasedObject::MySetterFunction");
      REQUIRE(action.GetParametersCount() == 2);
      REQUIRE(action.GetParameter(0).GetPlainString() == "MyChildObject");
      REQUIRE(action.GetParameter(1).GetPlainString() == "no");
    }
    {
      auto &event = parentFunction.GetEvents().GetEvent(1);
      REQUIRE(event.GetInstructionList("conditions")->GetCount() == 1);
      auto &condition = event.GetInstructionList("conditions")->Get(0);
      REQUIRE(condition.GetType() == "BooleanVariable");
      REQUIRE(condition.GetParametersCount() == 3);
      REQUIRE(condition.GetParameter(0).GetPlainString() == "Value");
      REQUIRE(condition.GetParameter(1).GetPlainString() == "True");
      REQUIRE(condition.GetParameter(2).GetPlainString() == "");

      REQUIRE(event.GetInstructionList("actions")->GetCount() == 1);
      auto &action = event.GetInstructionList("actions")->Get(0);
      REQUIRE(action.GetType() ==
              "MyEventsExtension::MyChildEventsBasedObject::MySetterFunction");
      REQUIRE(action.GetParametersCount() == 2);
      REQUIRE(action.GetParameter(0).GetPlainString() == "MyChildObject");
      REQUIRE(action.GetParameter(1).GetPlainString() == "yes");
    }
  }

  SECTION("Can generate a todo comment for function with boolean parameters") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &parentEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyParentEventsBasedObject", 0);
    auto &childEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyChildEventsBasedObject", 0);

    parentEventsBasedObject.GetObjects().InsertNewObject(
        project, "MyEventsExtension::MyChildEventsBasedObject", "MyChildObject",
        0);

    auto &childFunction =
        childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MySetterFunction", 1);
    childFunction.SetFunctionType(gd::EventsFunction::FunctionType::Action);
    gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
        extension, childEventsBasedObject);
    {
      auto &parameter = childFunction.GetParameters().AddNewParameter("Value");
      parameter.SetType("yesorno");
    }
    {
      auto &parameter =
          childFunction.GetParameters().AddNewParameter("MyNumberParameter");
      parameter.SetType("number");
    }

    gd::ChildObjectForwardFunctionGenerator::
        GenerateChildObjectForwardFunctions(
            project, extension, parentEventsBasedObject, "MyChildObject");

    REQUIRE(parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
        "MySetterFunction"));
    auto &parentFunction =
        parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
            "MySetterFunction");
    REQUIRE(parentFunction.GetFunctionType() ==
            gd::EventsFunction::FunctionType::Action);
    REQUIRE(parentFunction.GetParameters().GetParametersCount() == 3);
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
            "object");
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
            "MyEventsExtension::MyParentEventsBasedObject");
    REQUIRE(parentFunction.GetParameters().GetParameter(1).GetType() ==
            "yesorno");
    REQUIRE(parentFunction.GetParameters().GetParameter(2).GetType() ==
            "number");

    REQUIRE(parentFunction.GetEvents().GetEventsCount() == 1);
    {
      auto &event = parentFunction.GetEvents().GetEvent(0);
      REQUIRE(event.GetInstructionList("conditions")->GetCount() == 0);
      REQUIRE(event.GetInstructionList("actions")->GetCount() == 0);
      auto &comment = dynamic_cast<gd::CommentEvent &>(event);
      REQUIRE(comment.GetComment() ==
              "TODO: Please implement this function manually.");
    }
  }

  SECTION("Can generate a function to forward an asynchronous action") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &extension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &parentEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyParentEventsBasedObject", 0);
    auto &childEventsBasedObject = extension.GetEventsBasedObjects().InsertNew(
        "MyChildEventsBasedObject", 0);
    parentEventsBasedObject.GetObjects().InsertNewObject(
        project, "MyEventsExtension::MyChildEventsBasedObject", "MyChildObject",
        0);

    auto &childFunction =
        childEventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MyFunction", 0);
    childFunction.SetFunctionType(gd::EventsFunction::FunctionType::Action);
    childFunction.SetAsync(true);
    gd::WholeProjectRefactorer::EnsureObjectEventsFunctionsProperParameters(
        extension, childEventsBasedObject);

    gd::ChildObjectForwardFunctionGenerator::
        GenerateChildObjectForwardFunctions(
            project, extension, parentEventsBasedObject, "MyChildObject");

    REQUIRE(parentEventsBasedObject.GetEventsFunctions().HasEventsFunctionNamed(
        "MyFunction"));
    auto &parentFunction =
        parentEventsBasedObject.GetEventsFunctions().GetEventsFunction(
            "MyFunction");
    REQUIRE(parentFunction.GetFunctionType() ==
            gd::EventsFunction::FunctionType::Action);
    REQUIRE(parentFunction.IsAsync());
    REQUIRE(parentFunction.GetParameters().GetParametersCount() == 1);
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetType() ==
            "object");
    REQUIRE(parentFunction.GetParameters().GetParameter(0).GetExtraInfo() ==
            "MyEventsExtension::MyParentEventsBasedObject");

    REQUIRE(parentFunction.GetEvents().GetEventsCount() == 1);
    auto &event = parentFunction.GetEvents().GetEvent(0);
    REQUIRE(event.GetInstructionList("conditions")->GetCount() == 0);
    REQUIRE(event.GetInstructionList("actions")->GetCount() == 2);
    {
      auto &action = event.GetInstructionList("actions")->Get(0);
      REQUIRE(action.GetType() ==
              "MyEventsExtension::MyChildEventsBasedObject::MyFunction");
      REQUIRE(action.GetParametersCount() == 1);
      REQUIRE(action.GetParameter(0).GetPlainString() == "MyChildObject");
    }
    {
      auto &action = event.GetInstructionList("actions")->Get(1);
      REQUIRE(action.GetType() == "BuiltinAsync::ResolveAsyncEventsFunction");
      REQUIRE(action.GetParametersCount() == 0);
    }
  }
}
