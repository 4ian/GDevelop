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
#include "GDCore/Events/Builtin/LinkEvent.h"
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

TEST_CASE("WholeProjectRefactorer::RenameVariable", "[common]") {
  SECTION(
      "Variable, object variables and object structure variable renamed (in "
      "layout)") {
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
    gd::Instruction action;
    action.SetType("MyExtension::DoSomething");
    action.SetParametersCount(1);
    action.SetParameter(
        0,
        gd::Expression("1 + MySceneVariable + MySceneVariable2 + "
                       "Object1.MyObjectVariable + Object2.MyObjectVariable + "
                       "Object1.MyObjectStructureVariable.MyChild + "
                       "Object2.MyObjectStructureVariable.MyChild + "
                       "MySceneStructureVariable.MyChild + "
                       "MySceneStructureVariable2.MyChild + "
                       "MyGlobalVariable + "
                       "MyGlobalVariable2 + "
                       "MyGlobalStructureVariable.MyChild + "
                       "MyGlobalStructureVariable2.MyChild"));
    event.GetActions().Insert(action);

    // Do a copy of layout1 to ensure other scene is unchanged after the
    // refactoring.
    gd::Layout layout2 = layout1;
    layout2.SetName("Layout2");
    project.InsertLayout(layout2, 1);
    gd::SerializerElement originalSerializedLayout2;
    layout2.SerializeTo(originalSerializedLayout2);

    // Launch the refactoring.
    gd::WholeProjectRefactorer::RenameVariable(project,
                                               layout1.GetVariables(),
                                               "MySceneVariable",
                                               "MyRenamedSceneVariable");
    gd::WholeProjectRefactorer::RenameVariable(
        project,
        layout1.GetVariables(),
        "MySceneStructureVariable",
        "MyRenamedSceneStructureVariable");
    gd::WholeProjectRefactorer::RenameVariable(project,
                                               object1.GetVariables(),
                                               "MyObjectVariable",
                                               "MyRenamedObjectVariable");
    gd::WholeProjectRefactorer::RenameVariable(
        project,
        object1.GetVariables(),
        "MyObjectStructureVariable",
        "MyRenamedObjectStructureVariable");
    gd::WholeProjectRefactorer::RenameVariable(project,
                                               project.GetVariables(),
                                               "MyGlobalVariable",
                                               "MyRenamedGlobalVariable");
    gd::WholeProjectRefactorer::RenameVariable(
        project,
        project.GetVariables(),
        "MyGlobalStructureVariable",
        "MyRenamedGlobalStructureVariable");

    // Check the first layout is updated.
    {
      gd::SerializerElement serializedEvents;
      layout1.GetEvents().SerializeTo(serializedEvents);
      REQUIRE(
          gd::Serializer::ToJSON(serializedEvents) ==
          "[{\"type\":\"BuiltinCommonInstructions::Standard\",\"conditions\":[]"
          ",\"actions\":[{\"type\":{\"value\":\"MyExtension::DoSomething\"},"
          "\"parameters\":[\"1 + MyRenamedSceneVariable + MySceneVariable2 + "
          "Object1.MyRenamedObjectVariable + Object2.MyObjectVariable + "
          "Object1.MyRenamedObjectStructureVariable.MyChild + "
          "Object2.MyObjectStructureVariable.MyChild + "
          "MyRenamedSceneStructureVariable.MyChild + "
          "MySceneStructureVariable2.MyChild + "
          "MyRenamedGlobalVariable + "
          "MyGlobalVariable2 + "
          "MyRenamedGlobalStructureVariable.MyChild + "
          "MyGlobalStructureVariable2.MyChild"
          "\"]}]}]");
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
