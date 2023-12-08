/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering project refactoring
 */
#include <algorithm>
#include <stdexcept>

#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/ForEachChildVariableEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Serialization/Serializer.h"
#include "catch.hpp"

TEST_CASE("WholeProjectRefactorer::ApplyRefactoringForVariablesContainer",
          "[common]") {
  SECTION("Variable renamed (project, layout, object)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(layout1.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    gd::ForEachChildVariableEvent &forEachChildVariableEvent =
        dynamic_cast<gd::ForEachChildVariableEvent &>(
            layout1.GetEvents().InsertNewEvent(
                project, "BuiltinCommonInstructions::ForEachChildVariable"));
    gd::RepeatEvent &repeatEvent =
        dynamic_cast<gd::RepeatEvent &>(layout1.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Repeat"));

    // Declare global variables.
    project.GetVariables().InsertNew("MyGlobalVariable", 0).SetValue(123);
    project.GetVariables().InsertNew("MyGlobalVariable2", 0).SetValue(123);
    project.GetVariables().InsertNew("SharedVariableName", 0).SetValue(123);
    project.GetVariables()
        .InsertNew("MyGlobalStructureVariable", 0)
        .GetChild("MyChild")
        .SetValue(123);
    project.GetVariables()
        .InsertNew("MyGlobalStructureVariable2", 0)
        .GetChild("MyChild")
        .SetValue(123);

    // Declare variables in the scene.
    layout1.GetVariables().InsertNew("MySceneVariable", 0).SetValue(123);
    layout1.GetVariables().InsertNew("MySceneVariable2", 0).SetValue(123);
    layout1.GetVariables().InsertNew("SharedVariableName", 0).SetValue(123);
    layout1.GetVariables()
        .InsertNew("MySceneStructureVariable", 0)
        .GetChild("MyChild")
        .SetValue(123);
    layout1.GetVariables()
        .InsertNew("MySceneStructureVariable2", 0)
        .GetChild("MyChild")
        .SetValue(123);

    // Declare variables in objects.
    auto &object1 =
        layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
    object1.GetVariables().InsertNew("MyObjectVariable");
    object1.GetVariables()
        .InsertNew("MyObjectStructureVariable")
        .GetChild("MyChild")
        .SetValue(123);
    auto &object2 =
        layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);
    object2.GetVariables().InsertNew("MyObjectVariable");
    object2.GetVariables()
        .InsertNew("MyObjectStructureVariable")
        .GetChild("MyChild")
        .SetValue(123);

    // Create an event using the variables.
    // clang-format off
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression(
              "1 + "
              "MySceneVariable + "
              "MySceneVariable2 + "
              "Object1.MyObjectVariable + "
              "Object2.MyObjectVariable + "
              "Object1.MyObjectStructureVariable.MyChild + "
              "Object2.MyObjectStructureVariable.MyChild + "
              "MySceneStructureVariable.MyChild + "
              "MySceneStructureVariable2.MyChild + "
              "MyGlobalVariable + "
              "MyGlobalVariable2 + "
              "MyGlobalStructureVariable.MyChild + "
              "MyGlobalStructureVariable2.MyChild"));
      event.GetActions().Insert(action);
    }
    // Expressions with "old" "scenevar", "globalvar", "objectvar":
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression(
              // "objectvar" (in a free expression):
              "1 + "
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyObjectVariable, Object2, MyObjectVariable) + "
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyObjectStructureVariable.MyChild, Object2, MyObjectStructureVariable.MyChild) + "
              // "objectvar" (using the name of the object being called):
              "Object1.GetObjectVariableAsNumber(MyObjectVariable) + "
              "Object2.GetObjectVariableAsNumber(MyObjectVariable) + "
              "Object1.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild) + "
              "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild) + "
              "Object1.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild) + "
              "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild) + "
              // "globalvar" and "scenevar":
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalVariable) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalVariable2) + "
              "MyExtension::GetGlobalVariableAsNumber(SharedVariableName) + "
              "MyExtension::GetVariableAsNumber(MySceneVariable) + "
              "MyExtension::GetVariableAsNumber(MySceneVariable2) + "
              "MyExtension::GetVariableAsNumber(SharedVariableName) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable.MyChild) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild) + "
              "MyExtension::GetVariableAsNumber(MySceneStructureVariable.MyChild) + "
              "MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable.MyChild.GrandChild) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild.GrandChild) + "
              "MyExtension::GetVariableAsNumber(MySceneStructureVariable.MyChild.GrandChild) + "
              "MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild.GrandChild)"));
      event.GetActions().Insert(action);
    }
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithLegacyPreScopedVariables");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("MySceneVariable"));
      action.SetParameter(1, gd::Expression("MyGlobalVariable"));
      action.SetParameter(2, gd::Expression("Object1"));
      action.SetParameter(3, gd::Expression("MyObjectVariable"));
      event.GetActions().Insert(action);
    }
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithLegacyPreScopedVariables");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("SharedVariableName"));
      action.SetParameter(1, gd::Expression("SharedVariableName"));
      action.SetParameter(2, gd::Expression("Object2"));
      action.SetParameter(3, gd::Expression("MyObjectVariable"));
      event.GetActions().Insert(action);
    }

    forEachChildVariableEvent.SetIterableVariableName("MySceneStructureVariable");
    repeatEvent.SetRepeatExpression("1 + MySceneVariable + Object1.MyObjectVariable + Object2.MyObjectVariable");
    // clang-format on

    // Do a copy of layout1 to ensure other scene is unchanged after the
    // refactoring.
    gd::Layout layout2 = layout1;
    layout2.SetName("Layout2");
    project.InsertLayout(layout2, 1);
    gd::SerializerElement originalSerializedLayout2;
    layout2.SerializeTo(originalSerializedLayout2);

    // Do the changes and launch the refactoring.
    project.GetVariables().ResetPersistentUuid();
    layout1.GetVariables().ResetPersistentUuid();
    object1.ResetPersistentUuid();
    gd::SerializerElement originalSerializedProjectVariables;
    project.GetVariables().SerializeTo(originalSerializedProjectVariables);
    gd::SerializerElement originalSerializedLayoutVariables;
    layout1.GetVariables().SerializeTo(originalSerializedLayoutVariables);
    gd::SerializerElement originalSerializedObject1Variables;
    object1.GetVariables().SerializeTo(originalSerializedObject1Variables);

    project.GetVariables().Rename("MyGlobalVariable",
                                  "MyRenamedGlobalVariable");
    project.GetVariables().Rename("MyGlobalStructureVariable",
                                  "MyRenamedGlobalStructureVariable");
    project.GetVariables().Rename("SharedVariableName",
                                  "RenamedGlobalVariableFromASharedName");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            project,
            originalSerializedProjectVariables,
            project.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, project.GetVariables(), changeset);

    layout1.GetVariables().Rename("MySceneVariable", "MyRenamedSceneVariable");
    layout1.GetVariables().Rename("MySceneStructureVariable",
                                  "MyRenamedSceneStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            project, originalSerializedLayoutVariables, layout1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, layout1.GetVariables(), changeset);

    object1.GetVariables().Rename("MyObjectVariable",
                                  "MyRenamedObjectVariable");
    object1.GetVariables().Rename("MyObjectStructureVariable",
                                  "MyRenamedObjectStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            project,
            originalSerializedObject1Variables,
            object1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object1.GetVariables(), changeset);

    // Check the first layout is updated.
    // clang-format off
    {
      // Updated direct access to variables:
      REQUIRE(event.GetActions()[0].GetParameter(0).GetPlainString() ==
              "1 + "
              "MyRenamedSceneVariable + "
              "MySceneVariable2 + "
              "Object1.MyRenamedObjectVariable + "
              "Object2.MyObjectVariable + "
              "Object1.MyRenamedObjectStructureVariable.MyChild + "
              "Object2.MyObjectStructureVariable.MyChild + "
              "MyRenamedSceneStructureVariable.MyChild + "
              "MySceneStructureVariable2.MyChild + "
              "MyRenamedGlobalVariable + "
              "MyGlobalVariable2 + "
              "MyRenamedGlobalStructureVariable.MyChild + "
              "MyGlobalStructureVariable2.MyChild"
      );

      // Updated access to variables using the legacy "pre-scoped" "scenevar",
      // "globalvar" and "objectvar" parameters in expressions:
      REQUIRE(event.GetActions()[1].GetParameter(0).GetPlainString() ==
              "1 + "
              // Multiple "objectvar" parameters in a free function:
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyRenamedObjectVariable, Object2, MyObjectVariable) + "
              // Multiple "objectvar" parameters in a free function, with child
              // variable:
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyRenamedObjectStructureVariable.MyChild, Object2, MyObjectStructureVariable.MyChild) + "
              // Single "objectvar" from the object being accessed:
              "Object1.GetObjectVariableAsNumber(MyRenamedObjectVariable) + "
              "Object2.GetObjectVariableAsNumber(MyObjectVariable) + "
              // Single "objectvar" from the object being accessed, with child
              // variales:
              "Object1.GetObjectVariableAsNumber(MyRenamedObjectStructureVariable.MyChild) + "
              "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild) + "
              "Object1.GetObjectVariableAsNumber(MyRenamedObjectStructureVariable.MyChild.GrandChild) + "
              "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild) + "
              // "globalvar" and "scenevar" in a free function:
              "MyExtension::GetGlobalVariableAsNumber(MyRenamedGlobalVariable) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalVariable2) + "
              "MyExtension::GetGlobalVariableAsNumber(RenamedGlobalVariableFromASharedName) + "
              "MyExtension::GetVariableAsNumber(MyRenamedSceneVariable) + "
              "MyExtension::GetVariableAsNumber(MySceneVariable2) + "
              "MyExtension::GetVariableAsNumber(SharedVariableName) + "
              // "globalvar" and "scenevar" in a free function, with child
              // variables:
              "MyExtension::GetGlobalVariableAsNumber(MyRenamedGlobalStructureVariable.MyChild) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild) + "
              "MyExtension::GetVariableAsNumber(MyRenamedSceneStructureVariable.MyChild) + "
              "MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild) + "
              // "globalvar" and "scenevar" in a free function, with grand child
              // variables:
              "MyExtension::GetGlobalVariableAsNumber(MyRenamedGlobalStructureVariable.MyChild.GrandChild) + "
              "MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild.GrandChild) + "
              "MyExtension::GetVariableAsNumber(MyRenamedSceneStructureVariable.MyChild.GrandChild) + "
              "MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild.GrandChild)");

      // Updated "scenevar", "globalvar" and "object" parameters of an
      // instruction:
      REQUIRE(event.GetActions()[2].GetParameter(0).GetPlainString() ==
              "MyRenamedSceneVariable");
      REQUIRE(event.GetActions()[2].GetParameter(1).GetPlainString() ==
              "MyRenamedGlobalVariable");
      REQUIRE(event.GetActions()[2].GetParameter(2).GetPlainString() ==
              "Object1");
      REQUIRE(event.GetActions()[2].GetParameter(3).GetPlainString() ==
              "MyRenamedObjectVariable");

      // Updated "scenevar" and "globalvar" parameters of an instruction:
      REQUIRE(event.GetActions()[3].GetParameter(0).GetPlainString() ==
              "SharedVariableName");
      REQUIRE(event.GetActions()[3].GetParameter(1).GetPlainString() ==
              "RenamedGlobalVariableFromASharedName");

      // Unchanged "object" and "objectvar" parameters:
      REQUIRE(event.GetActions()[3].GetParameter(2).GetPlainString() ==
              "Object2");
      REQUIRE(event.GetActions()[3].GetParameter(3).GetPlainString() ==
              "MyObjectVariable");
    }

    REQUIRE(forEachChildVariableEvent.GetIterableVariableName() == "MyRenamedSceneStructureVariable");
    REQUIRE(repeatEvent.GetRepeatExpression() == "1 + MyRenamedSceneVariable + Object1.MyRenamedObjectVariable + Object2.MyObjectVariable");
    // clang-format on

    // Check the other layout is untouched.
    {
      gd::SerializerElement serializedLayout2;
      layout2.SerializeTo(serializedLayout2);
      REQUIRE(gd::Serializer::ToJSON(serializedLayout2) ==
              gd::Serializer::ToJSON(originalSerializedLayout2));
    }
  }

  SECTION("Variable renamed (object group)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(layout1.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    gd::RepeatEvent &repeatEvent =
        dynamic_cast<gd::RepeatEvent &>(layout1.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Repeat"));

    // Declare variables in objects.
    auto &object1 =
        layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
    object1.GetVariables().InsertNew("MyObjectVariable");
    object1.GetVariables()
        .InsertNew("MyObjectStructureVariable")
        .GetChild("MyChild")
        .SetValue(123);
    auto &object2 =
        layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);
    object2.GetVariables().InsertNew("MyObjectVariable");
    object2.GetVariables()
        .InsertNew("MyObjectStructureVariable")
        .GetChild("MyChild")
        .SetValue(123);

    auto& group = layout1.GetObjectGroups().InsertNew("MyObjectGroup");
    group.AddObject("Object1");
    group.AddObject("Object2");

    // Create an event using the variables.
    // clang-format off
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression(
              "1 + "
              "Object1.MyObjectVariable + "
              "Object2.MyObjectVariable + "
              "MyObjectGroup.MyObjectVariable + "
              "Object1.MyObjectStructureVariable.MyChild + "
              "Object2.MyObjectStructureVariable.MyChild + "
              "MyObjectGroup.MyObjectStructureVariable.MyChild"));
      event.GetActions().Insert(action);
    }
    // Expressions with "old" "scenevar", "globalvar", "objectvar":
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(
          0,
          gd::Expression(
              // "objectvar" (in a free expression):
              "1 + "
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyObjectVariable, Object2, MyObjectVariable) + "
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(MyObjectGroup, MyObjectVariable, MyObjectGroup, MyObjectVariable) + "
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyObjectStructureVariable.MyChild, Object2, MyObjectStructureVariable.MyChild) + "
              "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(MyObjectGroup, MyObjectStructureVariable.MyChild, MyObjectGroup, MyObjectStructureVariable.MyChild) + "
              // "objectvar" (using the name of the object being called):
              "Object1.GetObjectVariableAsNumber(MyObjectVariable) + "
              "Object2.GetObjectVariableAsNumber(MyObjectVariable) + "
              "MyObjectGroup.GetObjectVariableAsNumber(MyObjectVariable) + "
              "Object1.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild) + "
              "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild) + "
              "MyObjectGroup.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild) + "
              "Object1.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild) + "
              "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild) + "
              "MyObjectGroup.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild)"));
      event.GetActions().Insert(action);
    }
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithLegacyPreScopedVariables");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("MySceneVariable"));
      action.SetParameter(1, gd::Expression("MyGlobalVariable"));
      action.SetParameter(2, gd::Expression("MyObjectGroup"));
      action.SetParameter(3, gd::Expression("MyObjectVariable"));
      event.GetActions().Insert(action);
    }

    repeatEvent.SetRepeatExpression("1 + Object1.MyObjectVariable + Object2.MyObjectVariable + MyObjectGroup.MyObjectVariable");
    // clang-format on

    // Do a copy of layout1 to ensure other scene is unchanged after the
    // refactoring.
    gd::Layout layout2 = layout1;
    layout2.SetName("Layout2");
    project.InsertLayout(layout2, 1);
    gd::SerializerElement originalSerializedLayout2;
    layout2.SerializeTo(originalSerializedLayout2);

    // Do the changes and launch the refactoring.
    project.GetVariables().ResetPersistentUuid();
    layout1.GetVariables().ResetPersistentUuid();
    object1.ResetPersistentUuid();
    gd::SerializerElement originalSerializedObject1Variables;
    object1.GetVariables().SerializeTo(originalSerializedObject1Variables);

    object1.GetVariables().Rename("MyObjectVariable",
                                  "MyRenamedObjectVariable");
    object1.GetVariables().Rename("MyObjectStructureVariable",
                                  "MyRenamedObjectStructureVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            project,
            originalSerializedObject1Variables,
            object1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object1.GetVariables(), changeset);

    // Check the first layout is updated.
    // clang-format off
    {
      // Updated direct access to variables:
      REQUIRE(event.GetActions()[0].GetParameter(0).GetPlainString() ==
            "1 + "
            "Object1.MyRenamedObjectVariable + "
            "Object2.MyObjectVariable + "
            "MyObjectGroup.MyRenamedObjectVariable + "
            "Object1.MyRenamedObjectStructureVariable.MyChild + "
            "Object2.MyObjectStructureVariable.MyChild + "
            "MyObjectGroup.MyRenamedObjectStructureVariable.MyChild"
      );

      // Updated access to variables using the legacy "pre-scoped" "scenevar",
      // "globalvar" and "objectvar" parameters in expressions:
      REQUIRE(event.GetActions()[1].GetParameter(0).GetPlainString() ==
            "1 + "
            // Multiple "objectvar" parameters in a free function:
            "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyRenamedObjectVariable, Object2, MyObjectVariable) + "
            "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(MyObjectGroup, MyRenamedObjectVariable, MyObjectGroup, MyRenamedObjectVariable) + "
            // Multiple "objectvar" parameters in a free function, with child
            // variable:
            "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyRenamedObjectStructureVariable.MyChild, Object2, MyObjectStructureVariable.MyChild) + "
            "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(MyObjectGroup, MyRenamedObjectStructureVariable.MyChild, MyObjectGroup, MyRenamedObjectStructureVariable.MyChild) + "
            // Single "objectvar" from the object being accessed:
            "Object1.GetObjectVariableAsNumber(MyRenamedObjectVariable) + "
            "Object2.GetObjectVariableAsNumber(MyObjectVariable) + "
            "MyObjectGroup.GetObjectVariableAsNumber(MyRenamedObjectVariable) + "
            // Single "objectvar" from the object being accessed, with child
            // variales:
            "Object1.GetObjectVariableAsNumber(MyRenamedObjectStructureVariable.MyChild) + "
            "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild) + "
            "MyObjectGroup.GetObjectVariableAsNumber(MyRenamedObjectStructureVariable.MyChild) + "
            "Object1.GetObjectVariableAsNumber(MyRenamedObjectStructureVariable.MyChild.GrandChild) + "
            "Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild) + "
            "MyObjectGroup.GetObjectVariableAsNumber(MyRenamedObjectStructureVariable.MyChild.GrandChild)");

      // Updated "objectvar" parameters of an
      // instruction:
      REQUIRE(event.GetActions()[2].GetParameter(2).GetPlainString() ==
              "MyObjectGroup");
      REQUIRE(event.GetActions()[2].GetParameter(3).GetPlainString() ==
              "MyRenamedObjectVariable");
    }

    REQUIRE(repeatEvent.GetRepeatExpression() == "1 + Object1.MyRenamedObjectVariable + Object2.MyObjectVariable + MyObjectGroup.MyRenamedObjectVariable");
    // clang-format on

    // Check the other layout is untouched.
    {
      gd::SerializerElement serializedLayout2;
      layout2.SerializeTo(serializedLayout2);
      REQUIRE(gd::Serializer::ToJSON(serializedLayout2) ==
              gd::Serializer::ToJSON(originalSerializedLayout2));
    }
  }

  SECTION("Variable removed (project, layout, object)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(layout1.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    // Declare global variables.
    project.GetVariables().InsertNew("MyGlobalVariable", 0).SetValue(123);
    project.GetVariables().InsertNew("MyGlobalVariable2", 0).SetValue(123);
    project.GetVariables().InsertNew("SharedVariableName", 0).SetValue(123);
    project.GetVariables()
        .InsertNew("MyGlobalStructureVariable", 0)
        .GetChild("MyChild")
        .SetValue(123);
    project.GetVariables()
        .InsertNew("MyGlobalStructureVariable2", 0)
        .GetChild("MyChild")
        .SetValue(123);

    // Declare variables in the scene.
    layout1.GetVariables().InsertNew("MySceneVariable", 0).SetValue(123);
    layout1.GetVariables().InsertNew("MySceneVariable2", 0).SetValue(123);
    layout1.GetVariables().InsertNew("SharedVariableName", 0).SetValue(123);
    layout1.GetVariables()
        .InsertNew("MySceneStructureVariable", 0)
        .GetChild("MyChild")
        .SetValue(123);
    layout1.GetVariables()
        .InsertNew("MySceneStructureVariable2", 0)
        .GetChild("MyChild")
        .SetValue(123);

    // Declare variables in objects.
    auto &object1 =
        layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
    object1.GetVariables().InsertNew("MyObjectVariable");
    object1.GetVariables()
        .InsertNew("MyObjectStructureVariable")
        .GetChild("MyChild")
        .SetValue(123);
    auto &object2 =
        layout1.InsertNewObject(project, "MyExtension::Sprite", "Object2", 0);
    object2.GetVariables().InsertNew("MyObjectVariable");
    object2.GetVariables()
        .InsertNew("MyObjectStructureVariable")
        .GetChild("MyChild")
        .SetValue(123);

    auto makeTestAction = [](const gd::String &expression) {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomething");
      action.SetParametersCount(1);
      action.SetParameter(0, expression);
      return action;
    };

    // Create an event using the variables.
    // clang-format off
    event.GetActions().Insert(makeTestAction("1 + MySceneVariable"));
    event.GetActions().Insert(makeTestAction("1 + MySceneVariable2"));
    event.GetActions().Insert(makeTestAction("1 + Object1.MyObjectVariable"));
    event.GetActions().Insert(makeTestAction("1 + Object2.MyObjectVariable"));
    event.GetActions().Insert(makeTestAction("1 + Object1.MyObjectStructureVariable.MyChild"));
    event.GetActions().Insert(makeTestAction("1 + Object2.MyObjectStructureVariable.MyChild"));
    event.GetActions().Insert(makeTestAction("1 + MySceneStructureVariable.MyChild"));
    event.GetActions().Insert(makeTestAction("1 + MySceneStructureVariable2.MyChild"));
    event.GetActions().Insert(makeTestAction("1 + MyGlobalVariable"));
    event.GetActions().Insert(makeTestAction("1 + MyGlobalVariable2"));
    event.GetActions().Insert(makeTestAction("1 + MyGlobalStructureVariable.MyChild"));
    event.GetActions().Insert(makeTestAction("1 + MyGlobalStructureVariable2.MyChild"));

    // Expressions with "old" "scenevar", "globalvar", "objectvar":
    // "objectvar" (in a free expression):
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyObjectVariable, Object2, MyObjectVariable)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object2, MyObjectVariable, Object2, MyObjectVariable)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object1, MyObjectStructureVariable.MyChild, Object2, MyObjectStructureVariable.MyChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object2, MyObjectStructureVariable.MyChild, Object2, MyObjectStructureVariable.MyChild)"));
    // "objectvar" (using the name of the object being called):
    event.GetActions().Insert(makeTestAction("1 + Object1.GetObjectVariableAsNumber(MyObjectVariable)"));
    event.GetActions().Insert(makeTestAction("1 + Object2.GetObjectVariableAsNumber(MyObjectVariable)"));
    event.GetActions().Insert(makeTestAction("1 + Object1.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild)"));
    event.GetActions().Insert(makeTestAction("1 + Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild)"));
    event.GetActions().Insert(makeTestAction("1 + Object1.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild)"));
    event.GetActions().Insert(makeTestAction("1 + Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalVariable)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalVariable2)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetGlobalVariableAsNumber(SharedVariableName)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetVariableAsNumber(MySceneVariable)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetVariableAsNumber(MySceneVariable2)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetVariableAsNumber(SharedVariableName)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable.MyChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetVariableAsNumber(MySceneStructureVariable.MyChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable.MyChild.GrandChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild.GrandChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetVariableAsNumber(MySceneStructureVariable.MyChild.GrandChild)"));
    event.GetActions().Insert(makeTestAction("1 + MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild.GrandChild)"));

    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithLegacyPreScopedVariables");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("MySceneVariable")); // To remove
      action.SetParameter(1, gd::Expression("MyGlobalVariable2"));
      action.SetParameter(2, gd::Expression("Object2"));
      action.SetParameter(3, gd::Expression("MyObjectVariable"));
      event.GetActions().Insert(action);
    }
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithLegacyPreScopedVariables");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("MySceneVariable2"));
      action.SetParameter(1, gd::Expression("MyGlobalVariable")); // To remove
      action.SetParameter(2, gd::Expression("Object2"));
      action.SetParameter(3, gd::Expression("MyObjectVariable"));
      event.GetActions().Insert(action);
    }
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithLegacyPreScopedVariables");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("MySceneVariable2"));
      action.SetParameter(1, gd::Expression("MyGlobalVariable2"));
      action.SetParameter(2, gd::Expression("Object1"));
      action.SetParameter(3, gd::Expression("MyObjectVariable")); // To remove
      event.GetActions().Insert(action);
    }
    {
      gd::Instruction action;
      action.SetType("MyExtension::DoSomethingWithLegacyPreScopedVariables");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("MySceneVariable2"));
      action.SetParameter(1, gd::Expression("MyGlobalVariable2"));
      action.SetParameter(2, gd::Expression("Object2"));
      action.SetParameter(3, gd::Expression("MyObjectVariable"));
      event.GetActions().Insert(action);
    }
    // clang-format on

    // Do a copy of layout1 to ensure other scene is unchanged after the
    // refactoring.
    gd::Layout layout2 = layout1;
    layout2.SetName("Layout2");
    project.InsertLayout(layout2, 1);
    gd::SerializerElement originalSerializedLayout2;
    layout2.SerializeTo(originalSerializedLayout2);

    // Do the changes and launch the refactoring.
    project.GetVariables().ResetPersistentUuid();
    layout1.GetVariables().ResetPersistentUuid();
    object1.ResetPersistentUuid();
    gd::SerializerElement originalSerializedProjectVariables;
    project.GetVariables().SerializeTo(originalSerializedProjectVariables);
    gd::SerializerElement originalSerializedLayoutVariables;
    layout1.GetVariables().SerializeTo(originalSerializedLayoutVariables);
    gd::SerializerElement originalSerializedObject1Variables;
    object1.GetVariables().SerializeTo(originalSerializedObject1Variables);

    project.GetVariables().Remove("MyGlobalVariable");
    project.GetVariables().Remove("MyGlobalStructureVariable");
    project.GetVariables().Remove("SharedVariableName");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            project,
            originalSerializedProjectVariables,
            project.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, project.GetVariables(), changeset);

    layout1.GetVariables().Remove("MySceneVariable");
    layout1.GetVariables().Remove("MySceneStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            project, originalSerializedLayoutVariables, layout1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, layout1.GetVariables(), changeset);

    object1.GetVariables().Remove("MyObjectVariable");
    object1.GetVariables().Remove("MyObjectStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            project,
            originalSerializedObject1Variables,
            object1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object1.GetVariables(), changeset);

    // Check the first layout is updated.
    {
      REQUIRE(event.GetActions().GetCount() == 19);

      // clang-format off
      // All the actions using the removed variables are gone.
      REQUIRE(event.GetActions()[0].GetParameter(0).GetPlainString() == "1 + MySceneVariable2");
      REQUIRE(event.GetActions()[1].GetParameter(0).GetPlainString() == "1 + Object2.MyObjectVariable");
      REQUIRE(event.GetActions()[2].GetParameter(0).GetPlainString() == "1 + Object2.MyObjectStructureVariable.MyChild");
      REQUIRE(event.GetActions()[3].GetParameter(0).GetPlainString() == "1 + MySceneStructureVariable2.MyChild");
      REQUIRE(event.GetActions()[4].GetParameter(0).GetPlainString() == "1 + MyGlobalVariable2");
      REQUIRE(event.GetActions()[5].GetParameter(0).GetPlainString() == "1 + MyGlobalStructureVariable2.MyChild");
      REQUIRE(event.GetActions()[6].GetParameter(0).GetPlainString() == "1 + MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object2, MyObjectVariable, Object2, MyObjectVariable)");
      REQUIRE(event.GetActions()[7].GetParameter(0).GetPlainString() == "1 + MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam(Object2, MyObjectStructureVariable.MyChild, Object2, MyObjectStructureVariable.MyChild)");
      REQUIRE(event.GetActions()[8].GetParameter(0).GetPlainString() == "1 + Object2.GetObjectVariableAsNumber(MyObjectVariable)");
      REQUIRE(event.GetActions()[9].GetParameter(0).GetPlainString() == "1 + Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild)");
      REQUIRE(event.GetActions()[10].GetParameter(0).GetPlainString() == "1 + Object2.GetObjectVariableAsNumber(MyObjectStructureVariable.MyChild.GrandChild)");
      REQUIRE(event.GetActions()[11].GetParameter(0).GetPlainString() == "1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalVariable2)");
      REQUIRE(event.GetActions()[12].GetParameter(0).GetPlainString() == "1 + MyExtension::GetVariableAsNumber(MySceneVariable2)");
      REQUIRE(event.GetActions()[13].GetParameter(0).GetPlainString() == "1 + MyExtension::GetVariableAsNumber(SharedVariableName)");
      REQUIRE(event.GetActions()[14].GetParameter(0).GetPlainString() == "1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild)");
      REQUIRE(event.GetActions()[15].GetParameter(0).GetPlainString() == "1 + MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild)");
      REQUIRE(event.GetActions()[16].GetParameter(0).GetPlainString() == "1 + MyExtension::GetGlobalVariableAsNumber(MyGlobalStructureVariable2.MyChild.GrandChild)");
      REQUIRE(event.GetActions()[17].GetParameter(0).GetPlainString() == "1 + MyExtension::GetVariableAsNumber(MySceneStructureVariable2.MyChild.GrandChild)");

      REQUIRE(event.GetActions()[18].GetParameter(0).GetPlainString() == "MySceneVariable2");
      REQUIRE(event.GetActions()[18].GetParameter(1).GetPlainString() == "MyGlobalVariable2");
      REQUIRE(event.GetActions()[18].GetParameter(2).GetPlainString() == "Object2");
      REQUIRE(event.GetActions()[18].GetParameter(3).GetPlainString() == "MyObjectVariable");
      // clang-format on
    }

    // Check the other layout is untouched.
    {
      gd::SerializerElement serializedLayout2;
      layout2.SerializeTo(serializedLayout2);
      REQUIRE(gd::Serializer::ToJSON(serializedLayout2) ==
              gd::Serializer::ToJSON(originalSerializedLayout2));
    }
  }
}
