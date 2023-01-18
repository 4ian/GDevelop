/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/Events/EventsVariablesFinder.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "catch.hpp"

namespace {
const void DeclareVariableExtension(gd::Project &project,
                                    gd::Platform &platform) {
  std::shared_ptr<gd::PlatformExtension> extension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  gd::BuiltinExtensionsImplementer::ImplementsVariablesExtension(
      *(extension.get()));
  gd::BuiltinExtensionsImplementer::ImplementsBaseObjectExtension(
      *(extension.get()));
  // Add an instruction to test expressions.
  extension
      ->AddAction("DoSomething", "Do something", "This does something",
                  "Do something please", "", "", "")
      .AddParameter("expression", "Parameter 1 (a number)");
  platform.AddExtension(extension);
  project.AddPlatform(platform);
}

const gd::StandardEvent UseGlobalVariable(const gd::String &name) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("ModVarGlobal");
  instruction.SetParametersCount(2);
  instruction.SetParameter(0, gd::Expression(name));
  instruction.SetParameter(1, gd::Expression("0"));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent UseSceneVariable(const gd::String &name) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("ModVarScene");
  instruction.SetParametersCount(2);
  instruction.SetParameter(0, gd::Expression(name));
  instruction.SetParameter(1, gd::Expression("0"));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent UseObjectVariable(const gd::String &objectName,
                                          const gd::String &variableName) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("ModVarObjet");
  instruction.SetParametersCount(3);
  instruction.SetParameter(0, gd::Expression(objectName));
  instruction.SetParameter(1, gd::Expression(variableName));
  instruction.SetParameter(2, gd::Expression("0"));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent UseGlobalVariableInExpression(const gd::String &name) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("DoSomething");
  instruction.SetParametersCount(1);
  instruction.SetParameter(0,
                           gd::Expression("1 + GlobalVariable(" + name + ")"));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent UseSceneVariableInExpression(const gd::String &name) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("DoSomething");
  instruction.SetParametersCount(1);
  instruction.SetParameter(0, gd::Expression("1 + Variable(" + name + ")"));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent
UseObjectVariableInExpression(const gd::String &objectName,
                              const gd::String &variableName) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("DoSomething");
  instruction.SetParametersCount(1);
  instruction.SetParameter(
      0,
      gd::Expression("1 + " + objectName + ".Variable(" + variableName + ")"));
  event.GetActions().Insert(instruction);
  return event;
}

const void UseExternalEvents(gd::Layout &layout,
                             gd::ExternalEvents &externalEvents) {
  gd::LinkEvent linkEvent;
  linkEvent.SetTarget(externalEvents.GetName());
  layout.GetEvents().InsertEvent(linkEvent);
}
} // namespace

TEST_CASE("EventsVariablesFinder (FindAllGlobalVariables)", "[common]") {
  SECTION("Can find global variables in scenes") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    layout.GetEvents().InsertEvent(UseGlobalVariable("MyGlobalVariable"));

    auto variableNames =
        gd::EventsVariablesFinder::FindAllGlobalVariables(platform, project);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyGlobalVariable");
  }

  SECTION("Can find global variables in scene expressions") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    layout.GetEvents().InsertEvent(
        UseGlobalVariableInExpression("MyGlobalVariable"));

    auto variableNames =
        gd::EventsVariablesFinder::FindAllGlobalVariables(platform, project);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyGlobalVariable");
  }

  SECTION("Can find global variables in external layouts") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.GetEvents().InsertEvent(
        UseGlobalVariable("MyGlobalVariable"));
    UseExternalEvents(layout, externalEvents);

    auto variableNames =
        gd::EventsVariablesFinder::FindAllGlobalVariables(platform, project);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyGlobalVariable");
  }
}

TEST_CASE("EventsVariablesFinder (FindAllLayoutVariables)", "[common]") {
  SECTION("Can find scene variables in scenes") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    layout.GetEvents().InsertEvent(UseSceneVariable("MySceneVariable"));

    auto variableNames = gd::EventsVariablesFinder::FindAllLayoutVariables(
        platform, project, layout);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MySceneVariable");
  }

  SECTION("Can find scene variables in scene expressions") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    layout.GetEvents().InsertEvent(
        UseSceneVariableInExpression("MySceneVariable"));

    auto variableNames = gd::EventsVariablesFinder::FindAllLayoutVariables(
        platform, project, layout);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MySceneVariable");
  }

  SECTION("Can find scene variables in external layouts") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.GetEvents().InsertEvent(UseSceneVariable("MySceneVariable"));
    UseExternalEvents(layout, externalEvents);

    auto variableNames = gd::EventsVariablesFinder::FindAllLayoutVariables(
        platform, project, layout);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MySceneVariable");
  }

  SECTION("Can find scene variables the right scene") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    layout1.GetEvents().InsertEvent(
        UseSceneVariable("MySceneVariableInLayout1"));

    auto &layout2 = project.InsertNewLayout("Layout2", 0);
    layout2.GetEvents().InsertEvent(
        UseSceneVariable("MySceneVariableInLayout2"));

    auto variableNames = gd::EventsVariablesFinder::FindAllLayoutVariables(
        platform, project, layout1);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MySceneVariableInLayout1");
  }

  SECTION("Can find scene variables in the right external layouts") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    auto &externalEvents1 =
        project.InsertNewExternalEvents("ExternalEvents1", 0);
    externalEvents1.GetEvents().InsertEvent(
        UseSceneVariable("MySceneVariableInExternalEvents1"));
    UseExternalEvents(layout1, externalEvents1);

    auto &layout2 = project.InsertNewLayout("Layout2", 0);
    auto &externalEvents2 =
        project.InsertNewExternalEvents("ExternalEvents2", 0);
    externalEvents2.GetEvents().InsertEvent(
        UseSceneVariable("MySceneVariableInExternalEvents2"));
    UseExternalEvents(layout2, externalEvents2);

    auto variableNames = gd::EventsVariablesFinder::FindAllLayoutVariables(
        platform, project, layout1);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MySceneVariableInExternalEvents1");
  }
}

TEST_CASE("EventsVariablesFinder (FindAllObjectVariables)", "[common]") {
  SECTION("Can find object variables in scenes") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object = layout.InsertNewObject(project, "", "MyObject", 0);
    layout.GetEvents().InsertEvent(
        UseObjectVariable("MyObject", "MyObjectVariable"));

    auto variableNames = gd::EventsVariablesFinder::FindAllObjectVariables(
        platform, project, layout, object);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyObjectVariable");
  }

  SECTION("Can find object variables in scene expressions") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object = layout.InsertNewObject(project, "", "MyObject", 0);
    layout.GetEvents().InsertEvent(
        UseObjectVariableInExpression("MyObject", "MyObjectVariable"));

    auto variableNames = gd::EventsVariablesFinder::FindAllObjectVariables(
        platform, project, layout, object);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyObjectVariable");
  }

  SECTION("Can find object variables in external layouts") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object = layout.InsertNewObject(project, "", "MyObject", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.GetEvents().InsertEvent(
        UseObjectVariable("MyObject", "MyObjectVariable"));
    UseExternalEvents(layout, externalEvents);

    auto variableNames = gd::EventsVariablesFinder::FindAllObjectVariables(
        platform, project, layout, object);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyObjectVariable");
  }

  SECTION("Can find object variables in scenes for the right object") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object1 = layout.InsertNewObject(project, "", "MyObject1", 0);
    auto &object2 = layout.InsertNewObject(project, "", "MyObject2", 0);
    layout.GetEvents().InsertEvent(
        UseObjectVariable("MyObject1", "MyObjectVariable1"));
    layout.GetEvents().InsertEvent(
        UseObjectVariable("MyObject2", "MyObjectVariable2"));

    auto variableNames = gd::EventsVariablesFinder::FindAllObjectVariables(
        platform, project, layout, object1);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyObjectVariable1");
  }

  SECTION(
      "Can find object variables in external layouts for the right object") {
    gd::Project project;
    gd::Platform platform;
    DeclareVariableExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object1 = layout.InsertNewObject(project, "", "MyObject1", 0);
    auto &object2 = layout.InsertNewObject(project, "", "MyObject2", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.GetEvents().InsertEvent(
        UseObjectVariable("MyObject1", "MyObjectVariable1"));
    externalEvents.GetEvents().InsertEvent(
        UseObjectVariable("MyObject2", "MyObjectVariable2"));
    UseExternalEvents(layout, externalEvents);

    auto variableNames = gd::EventsVariablesFinder::FindAllObjectVariables(
        platform, project, layout, object1);

    REQUIRE(variableNames.size() == 1);
    REQUIRE(*(variableNames.begin()) == "MyObjectVariable1");
  }
}
