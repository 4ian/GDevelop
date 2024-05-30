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
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Tools/Log.h"


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
            originalSerializedProjectVariables,
            project.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, project.GetVariables(), changeset, originalSerializedProjectVariables);

    layout1.GetVariables().Rename("MySceneVariable", "MyRenamedSceneVariable");
    layout1.GetVariables().Rename("MySceneStructureVariable",
                                  "MyRenamedSceneStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedLayoutVariables, layout1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, layout1.GetVariables(), changeset, originalSerializedLayoutVariables);

    object1.GetVariables().Rename("MyObjectVariable",
                                  "MyRenamedObjectVariable");
    object1.GetVariables().Rename("MyObjectStructureVariable",
                                  "MyRenamedObjectStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedObject1Variables,
            object1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object1.GetVariables(), changeset, originalSerializedObject1Variables);

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
            originalSerializedObject1Variables,
            object1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object1.GetVariables(), changeset, originalSerializedObject1Variables);

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
            originalSerializedProjectVariables,
            project.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, project.GetVariables(), changeset, originalSerializedProjectVariables);

    layout1.GetVariables().Remove("MySceneVariable");
    layout1.GetVariables().Remove("MySceneStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedLayoutVariables, layout1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, layout1.GetVariables(), changeset, originalSerializedLayoutVariables);

    object1.GetVariables().Remove("MyObjectVariable");
    object1.GetVariables().Remove("MyObjectStructureVariable");
    changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedObject1Variables,
            object1.GetVariables());
    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object1.GetVariables(), changeset, originalSerializedObject1Variables);

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

  SECTION("Can rename a global variable") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Add a global variable.
    project.GetVariables().InsertNew("MyVariable").SetValue(123);

    // Add a scene that uses the global variable.
    auto &scene = project.InsertNewLayout("Scene", 0);
    gd::StandardEvent &sceneEvent =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      sceneEvent.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    project.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    project.GetVariables().SerializeTo(originalSerializedVariables);

    project.GetVariables().Rename("MyVariable", "MyRenamedVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, project.GetVariables());

    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable") !=
            changeset.oldToNewVariableNames.end());
    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable")->second ==
            "MyRenamedVariable");

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, project.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(sceneEvent.GetActions()[0].GetParameter(0).GetPlainString() == "MyRenamedVariable");
  }

  SECTION("Can rename a scene variable") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    scene.GetVariables().InsertNew("MyVariable").SetValue(123);
    gd::StandardEvent &sceneEvent =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      sceneEvent.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    scene.GetVariables().Rename("MyVariable", "MyRenamedVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable") !=
            changeset.oldToNewVariableNames.end());
    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable")->second ==
            "MyRenamedVariable");

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(sceneEvent.GetActions()[0].GetParameter(0).GetPlainString() == "MyRenamedVariable");
  }

  SECTION("Can rename a scene child variable") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    scene.GetVariables()
        .InsertNew("MyVariable")
        .GetChild("MyChild")
        .SetValue(123);
    gd::StandardEvent &sceneEvent =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyVariable.MyChild"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      sceneEvent.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    scene.GetVariables()
        .Get("MyVariable")
        .RenameChild("MyChild", "MyRenamedChild");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    REQUIRE(changeset.modifiedVariables.find("MyVariable") !=
            changeset.modifiedVariables.end());
    auto oldToNewChildVariableNames =
        changeset.modifiedVariables.find("MyVariable")
            ->second->oldToNewVariableNames;
    REQUIRE(oldToNewChildVariableNames.find("MyChild") !=
            oldToNewChildVariableNames.end());
    REQUIRE(oldToNewChildVariableNames.find("MyChild")->second ==
            "MyRenamedChild");

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(sceneEvent.GetActions()[0].GetParameter(0).GetPlainString() ==
            "MyVariable.MyRenamedChild");
  }

  SECTION("Can rename a scene child child variable") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    scene.GetVariables()
        .InsertNew("MyVariable")
        .GetChild("MyChild")
        .GetChild("MyGranChild")
        .SetValue(123);
    gd::StandardEvent &sceneEvent =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyVariable.MyChild.MyGranChild"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      sceneEvent.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    scene.GetVariables()
        .Get("MyVariable")
        .GetChild("MyChild")
        .RenameChild("MyGranChild", "MyRenamedChild");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(sceneEvent.GetActions()[0].GetParameter(0).GetPlainString() ==
            "MyVariable.MyChild.MyRenamedChild");
  }

  SECTION("Can rename all the children of a structure variable") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    auto& variable = scene.GetVariables().InsertNew("MyVariable");
    variable.GetChild("MyChildA").GetChild("MyGranChildA1").SetValue(123);
    variable.GetChild("MyChildA").GetChild("MyGranChildA2").SetValue(123);
    variable.GetChild("MyChildB").GetChild("MyGranChildB1").SetValue(123);
    variable.GetChild("MyChildB").GetChild("MyGranChildB2").SetValue(123);
    gd::StandardEvent &sceneEvent =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0,
                          gd::Expression("MyVariable.MyChildA.MyGranChildA1 + "
                                         "MyVariable.MyChildA.MyGranChildA2 + "
                                         "MyVariable.MyChildB.MyGranChildB1 + "
                                         "MyVariable.MyChildB.MyGranChildB2"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      sceneEvent.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    variable.GetChild("MyChildA").RenameChild("MyGranChildA1", "MyRenamedGranChildA1");
    variable.GetChild("MyChildA").RenameChild("MyGranChildA2", "MyRenamedGranChildA2");
    variable.GetChild("MyChildB").RenameChild("MyGranChildB1", "MyRenamedGranChildB1");
    variable.GetChild("MyChildB").RenameChild("MyGranChildB2", "MyRenamedGranChildB2");
    variable.RenameChild("MyChildA", "MyRenamedChildA");
    variable.RenameChild("MyChildB", "MyRenamedChildB");
    scene.GetVariables().Rename("MyVariable", "MyRenamedVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    REQUIRE(changeset.modifiedVariables.find("MyVariable") !=
            changeset.modifiedVariables.end());
    REQUIRE(changeset.modifiedVariables.find("MyVariable")
            ->second->oldToNewVariableNames.size() == 2);
    REQUIRE(changeset.modifiedVariables.find("MyVariable")
            ->second->modifiedVariables.size() == 2);

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(sceneEvent.GetActions()[0].GetParameter(0).GetPlainString() ==
            "MyRenamedVariable.MyRenamedChildA.MyRenamedGranChildA1 + "
            "MyRenamedVariable.MyRenamedChildA.MyRenamedGranChildA2 + "
            "MyRenamedVariable.MyRenamedChildB.MyRenamedGranChildB1 + "
            "MyRenamedVariable.MyRenamedChildB.MyRenamedGranChildB2");
  }

  SECTION("Can rename a global variable without replacing occurrences of scene variables") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    // Add a global variable.
    project.GetVariables().InsertNew("MyVariable").SetValue(123);

    // Add a scene that uses the global variable.
    auto &scene = project.InsertNewLayout("Scene", 0);
    gd::StandardEvent &sceneEvent =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      sceneEvent.GetActions().Insert(action);
    }

    // Add another scene with a variable of the name.
    auto &scene2 = project.InsertNewLayout("Scene2", 1);
    scene2.GetVariables().InsertNew("MyVariable").SetValue(456);
    gd::StandardEvent &scene2Event =
        dynamic_cast<gd::StandardEvent &>(scene2.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      scene2Event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    project.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    project.GetVariables().SerializeTo(originalSerializedVariables);

    project.GetVariables().Rename("MyVariable", "MyRenamedVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, project.GetVariables());

    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable") !=
            changeset.oldToNewVariableNames.end());
    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable")->second ==
            "MyRenamedVariable");

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, project.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(sceneEvent.GetActions()[0].GetParameter(0).GetPlainString() == "MyRenamedVariable");
    REQUIRE(scene2Event.GetActions()[0].GetParameter(0).GetPlainString() == "MyVariable");
  }

  SECTION("Can change the instruction type of variable occurrences (scene)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    scene.GetVariables().InsertNew("MySceneVariable").SetValue(123);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MySceneVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    scene.GetVariables().Get("MySceneVariable").SetString("Hello");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    REQUIRE(changeset.typeChangedVariableNames.find("MySceneVariable") !=
            changeset.typeChangedVariableNames.end());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    // Check the the action has changed to follow the variable type.
    REQUIRE(event.GetActions()[0].GetType() == "SetStringVariable");
  }

  SECTION("Can rename and change the type of a scene variable at the same time") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    scene.GetVariables().InsertNew("MyVariable").SetValue(123);
    gd::StandardEvent &sceneEvent =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      sceneEvent.GetActions().Insert(action);
    }

  auto projectScopedContainers =
    gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, scene);
    REQUIRE(&projectScopedContainers.GetVariablesContainersList()
                   .GetVariablesContainerFromVariableName("MyVariable") == &scene.GetVariables());

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    scene.GetVariables().Get("MyVariable").SetString("Hello");
    scene.GetVariables().Rename("MyVariable", "MyRenamedVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable") !=
            changeset.oldToNewVariableNames.end());
    REQUIRE(changeset.oldToNewVariableNames.find("MyVariable")->second ==
            "MyRenamedVariable");
    REQUIRE(changeset.typeChangedVariableNames.find("MyRenamedVariable") !=
            changeset.typeChangedVariableNames.end());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(sceneEvent.GetActions()[0].GetParameter(0).GetPlainString() == "MyRenamedVariable");
    // Check the the action has changed to follow the variable type.
    REQUIRE(sceneEvent.GetActions()[0].GetType() == "SetStringVariable");
  }

  SECTION("Can rename a local variable") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    event.GetVariables().InsertNew("MyLocalVariable").SetValue(123);

    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyLocalVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    event.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    event.GetVariables().SerializeTo(originalSerializedVariables);

    event.GetVariables().Rename("MyLocalVariable", "MyRenamedLocalVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, event.GetVariables());

    REQUIRE(changeset.oldToNewVariableNames.find("MyLocalVariable") !=
            changeset.oldToNewVariableNames.end());
    REQUIRE(changeset.oldToNewVariableNames.find("MyLocalVariable")->second ==
            "MyRenamedLocalVariable");

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, event.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(event.GetActions()[0].GetParameter(0).GetPlainString() == "MyRenamedLocalVariable");
  }

  SECTION("Can rename a local variable in sub-events") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    event.GetVariables().InsertNew("MyLocalVariable").SetValue(123);

    gd::StandardEvent &subEvent =
        dynamic_cast<gd::StandardEvent &>(event.GetSubEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyLocalVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      subEvent.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    event.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    event.GetVariables().SerializeTo(originalSerializedVariables);

    event.GetVariables().Rename("MyLocalVariable", "MyRenamedLocalVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, event.GetVariables());

    REQUIRE(changeset.oldToNewVariableNames.find("MyLocalVariable")->second ==
            "MyRenamedLocalVariable");

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, event.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(subEvent.GetActions()[0].GetParameter(0).GetPlainString() == "MyRenamedLocalVariable");
  }

  SECTION("Can rename a local variable without replacing occurrences of smaller scopes") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    event.GetVariables().InsertNew("MyLocalVariable").SetValue(123);
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyLocalVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Add a sub-event with a variable of the name.
    gd::StandardEvent &subEvent =
        dynamic_cast<gd::StandardEvent &>(event.GetSubEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));
    subEvent.GetVariables().InsertNew("MyLocalVariable").SetValue(456);
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MyLocalVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      subEvent.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    event.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    event.GetVariables().SerializeTo(originalSerializedVariables);

    event.GetVariables().Rename("MyLocalVariable", "MyRenamedLocalVariable");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, event.GetVariables());

    REQUIRE(changeset.oldToNewVariableNames.find("MyLocalVariable") !=
            changeset.oldToNewVariableNames.end());
    REQUIRE(changeset.oldToNewVariableNames.find("MyLocalVariable")->second ==
            "MyRenamedLocalVariable");

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, event.GetVariables(), changeset, originalSerializedVariables);

    REQUIRE(event.GetActions()[0].GetParameter(0).GetPlainString() == "MyRenamedLocalVariable");
    REQUIRE(subEvent.GetActions()[0].GetParameter(0).GetPlainString() == "MyLocalVariable");
  }

  SECTION("Can change the instruction type of variable occurrences (function)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &extension = project.InsertNewEventsFunctionsExtension("Extension", 0);
    extension.GetSceneVariables().InsertNew("MySceneVariable").SetValue(123);

    auto &function = extension.InsertNewEventsFunction("MyFunction", 0);
    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(function.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MySceneVariable"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    extension.GetSceneVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    extension.GetSceneVariables().SerializeTo(originalSerializedVariables);

    extension.GetSceneVariables().Get("MySceneVariable").SetString("Hello");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, extension.GetSceneVariables());

    REQUIRE(changeset.typeChangedVariableNames.find("MySceneVariable") !=
            changeset.typeChangedVariableNames.end());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, extension.GetSceneVariables(), changeset, originalSerializedVariables);

    // Check the the action has changed to follow the variable type.
    REQUIRE(event.GetActions()[0].GetType() == "SetStringVariable");
  }

  SECTION("Can change the instruction type of child-variable occurrences (scene)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    scene.GetVariables()
        .InsertNew("MySceneVariable")
        .GetChild("MyChild")
        .SetValue(123);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MySceneVariable.MyChild"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    scene.GetVariables().Get("MySceneVariable").GetChild("MyChild").SetString("Hello");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    REQUIRE(changeset.typeChangedVariableNames.find("MySceneVariable") !=
            changeset.typeChangedVariableNames.end());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    // Check the the action has changed to follow the variable type.
    REQUIRE(event.GetActions()[0].GetType() == "SetStringVariable");
  }

  SECTION("Can change the instruction type of child-variable occurrences with a literal brackets accessor (scene)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    auto &variable = scene.GetVariables().InsertNew("MySceneVariable");
    auto &childVariable = variable.GetChild("MyChild");
    childVariable.GetChild("Key A").SetValue(123);
    childVariable.GetChild("Key B").SetValue(123);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MySceneVariable.MyChild[\"Key A\"]"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      event.GetActions().Insert(action);
    }
    {
      gd::Instruction action;
      action.SetType("SetNumberVariable");
      action.SetParametersCount(3);
      action.SetParameter(0, gd::Expression("MySceneVariable.MyChild[\"Key B\"]"));
      action.SetParameter(1, gd::Expression("="));
      action.SetParameter(2, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    scene.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    scene.GetVariables().SerializeTo(originalSerializedVariables);

    scene.GetVariables().Get("MySceneVariable").GetChild("MyChild").GetChild("Key A").SetString("Hello");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, scene.GetVariables());

    REQUIRE(changeset.typeChangedVariableNames.find("MySceneVariable") !=
            changeset.typeChangedVariableNames.end());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, scene.GetVariables(), changeset, originalSerializedVariables);

    // Check the the action has changed to follow the variable type.
    REQUIRE(event.GetActions()[0].GetType() == "SetStringVariable");
    REQUIRE(event.GetActions()[1].GetType() == "SetNumberVariable");
  }

  SECTION("Can change the instruction type of variable occurrences (object)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    auto &object =
        scene.InsertNewObject(project, "MyExtension::Sprite", "Object", 0);
    object.GetVariables().InsertNew("MyObjectVariable").SetValue(123);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    {
      gd::Instruction action;
      action.SetType("SetNumberObjectVariable");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("Object"));
      action.SetParameter(1, gd::Expression("MyObjectVariable"));
      action.SetParameter(2, gd::Expression("="));
      action.SetParameter(3, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    object.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    object.GetVariables().SerializeTo(originalSerializedVariables);

    object.GetVariables().Get("MyObjectVariable").SetString("Hello");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, object.GetVariables());

    REQUIRE(changeset.typeChangedVariableNames.find("MyObjectVariable") !=
            changeset.typeChangedVariableNames.end());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object.GetVariables(), changeset, originalSerializedVariables);

    // Check the the action has changed to follow the variable type.
    REQUIRE(event.GetActions()[0].GetType() == "SetStringObjectVariable");
  }

  SECTION("Can change the instruction type of child-variable occurrences (object)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &scene = project.InsertNewLayout("Scene", 0);
    auto &object =
        scene.InsertNewObject(project, "MyExtension::Sprite", "Object", 0);
    object.GetVariables()
        .InsertNew("MyObjectVariable")
        .GetChild("MyChild")
        .SetValue(123);

    gd::StandardEvent &event =
        dynamic_cast<gd::StandardEvent &>(scene.GetEvents().InsertNewEvent(
            project, "BuiltinCommonInstructions::Standard"));

    {
      gd::Instruction action;
      action.SetType("SetNumberObjectVariable");
      action.SetParametersCount(4);
      action.SetParameter(0, gd::Expression("Object"));
      action.SetParameter(1, gd::Expression("MyObjectVariable.MyChild"));
      action.SetParameter(2, gd::Expression("="));
      action.SetParameter(3, gd::Expression("123"));
      event.GetActions().Insert(action);
    }

    // Do the changes and launch the refactoring.
    object.GetVariables().ResetPersistentUuid();
    gd::SerializerElement originalSerializedVariables;
    object.GetVariables().SerializeTo(originalSerializedVariables);

    object.GetVariables()
        .Get("MyObjectVariable")
        .GetChild("MyChild")
        .SetString("Hello");
    auto changeset =
        gd::WholeProjectRefactorer::ComputeChangesetForVariablesContainer(
            originalSerializedVariables, object.GetVariables());

    REQUIRE(changeset.typeChangedVariableNames.find("MyObjectVariable") !=
            changeset.typeChangedVariableNames.end());

    gd::WholeProjectRefactorer::ApplyRefactoringForVariablesContainer(
        project, object.GetVariables(), changeset, originalSerializedVariables);

    // Check the the action has changed to follow the variable type.
    REQUIRE(event.GetActions()[0].GetType() == "SetStringObjectVariable");
  }
}
