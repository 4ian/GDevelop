/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/Events/EventsIdentifiersFinder.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

namespace {
const void DeclareTimerExtension(gd::Project &project, gd::Platform &platform) {
  std::shared_ptr<gd::PlatformExtension> extension =
      std::shared_ptr<gd::PlatformExtension>(new gd::PlatformExtension);
  gd::BuiltinExtensionsImplementer::ImplementsTimeExtension(*(extension.get()));
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

const gd::StandardEvent UseSceneTimer(const gd::String &name) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("ResetTimer");
  instruction.SetParametersCount(2);
  instruction.SetParameter(0, gd::Expression("scene"));
  instruction.SetParameter(1, gd::Expression("\"" + name + "\""));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent UseObjectTimer(const gd::String &objectName,
                                       const gd::String &timerName) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("ResetObjectTimer");
  instruction.SetParametersCount(2);
  instruction.SetParameter(0, gd::Expression(objectName));
  instruction.SetParameter(1, gd::Expression("\"" + timerName + "\""));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent UseSceneTimerInExpression(const gd::String &name) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("DoSomething");
  instruction.SetParametersCount(1);
  instruction.SetParameter(
      0, gd::Expression("1 + TimerElapsedTime(\"" + name + "\")"));
  event.GetActions().Insert(instruction);
  return event;
}

const gd::StandardEvent
UseObjectTimerInExpression(const gd::String &objectName,
                           const gd::String &timerName) {
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("DoSomething");
  instruction.SetParametersCount(1);
  instruction.SetParameter(0, gd::Expression("1 + " + objectName +
                                             ".ObjectTimerElapsedTime(\"" + timerName +
                                             "\")"));
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

TEST_CASE("EventsIdentifiersFinder (scene timers)", "[common]") {
  SECTION("Can find scene timers in scenes") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    layout.GetEvents().InsertEvent(UseSceneTimer("MySceneTimer"));

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "sceneTimer");

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MySceneTimer\"");
  }

  SECTION("Can find scene timers in scene expressions") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    layout.GetEvents().InsertEvent(UseSceneTimerInExpression("MySceneTimer"));

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "sceneTimer");

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MySceneTimer\"");
  }

  SECTION("Can find scene timers in external layouts") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.GetEvents().InsertEvent(UseSceneTimer("MySceneTimer"));
    UseExternalEvents(layout, externalEvents);

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "sceneTimer");

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MySceneTimer\"");
  }

  SECTION("Can find scene timers the right scene") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    layout1.GetEvents().InsertEvent(UseSceneTimer("MySceneTimerInLayout1"));

    auto &layout2 = project.InsertNewLayout("Layout2", 0);
    layout2.GetEvents().InsertEvent(UseSceneTimer("MySceneTimerInLayout2"));

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout1, "sceneTimer");

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MySceneTimerInLayout1\"");
  }

  SECTION("Can find scene timers in the right external layouts") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    auto &externalEvents1 =
        project.InsertNewExternalEvents("ExternalEvents1", 0);
    externalEvents1.GetEvents().InsertEvent(
        UseSceneTimer("MySceneTimerInExternalEvents1"));
    UseExternalEvents(layout1, externalEvents1);

    auto &layout2 = project.InsertNewLayout("Layout2", 0);
    auto &externalEvents2 =
        project.InsertNewExternalEvents("ExternalEvents2", 0);
    externalEvents2.GetEvents().InsertEvent(
        UseSceneTimer("MySceneTimerInExternalEvents2"));
    UseExternalEvents(layout2, externalEvents2);

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout1, "sceneTimer");

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) ==
            "\"MySceneTimerInExternalEvents1\"");
  }
}

TEST_CASE("EventsIdentifiersFinder (object timers)", "[common]") {
  SECTION("Can find object timers in scenes") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object = layout.InsertNewObject(project, "", "MyObject", 0);
    layout.GetEvents().InsertEvent(UseObjectTimer("MyObject", "MyObjectTimer"));

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "objectTimer", object.GetName());

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MyObjectTimer\"");
  }

  SECTION("Can find object timers in scene expression") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object = layout.InsertNewObject(project, "", "MyObject", 0);
    layout.GetEvents().InsertEvent(UseObjectTimerInExpression("MyObject", "MyObjectTimer"));

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "objectTimer", object.GetName());

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MyObjectTimer\"");
  }

  SECTION("Can find object timers in external layouts") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object = layout.InsertNewObject(project, "", "MyObject", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.GetEvents().InsertEvent(
        UseObjectTimer("MyObject", "MyObjectTimer"));
    UseExternalEvents(layout, externalEvents);

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "objectTimer", object.GetName());

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MyObjectTimer\"");
  }

  SECTION("Can find object timers in scenes for the right object") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object1 = layout.InsertNewObject(project, "", "MyObject1", 0);
    auto &object2 = layout.InsertNewObject(project, "", "MyObject2", 0);
    layout.GetEvents().InsertEvent(
        UseObjectTimer("MyObject1", "MyObjectTimer1"));
    layout.GetEvents().InsertEvent(
        UseObjectTimer("MyObject2", "MyObjectTimer2"));

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "objectTimer", object1.GetName());

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MyObjectTimer1\"");
  }

  SECTION("Can find object timers in external layouts for the right object") {
    gd::Project project;
    gd::Platform platform;
    DeclareTimerExtension(project, platform);

    auto &layout = project.InsertNewLayout("Layout1", 0);
    auto &object1 = layout.InsertNewObject(project, "", "MyObject1", 0);
    auto &object2 = layout.InsertNewObject(project, "", "MyObject2", 0);
    auto &externalEvents = project.InsertNewExternalEvents("ExternalEvents", 0);
    externalEvents.GetEvents().InsertEvent(
        UseObjectTimer("MyObject1", "MyObjectTimer1"));
    externalEvents.GetEvents().InsertEvent(
        UseObjectTimer("MyObject2", "MyObjectTimer2"));
    UseExternalEvents(layout, externalEvents);

    auto identifierExpressions =
        gd::EventsIdentifiersFinder::FindAllIdentifierExpressions(
            platform, project, layout, "objectTimer", object1.GetName());

    REQUIRE(identifierExpressions.size() == 1);
    REQUIRE(*(identifierExpressions.begin()) == "\"MyObjectTimer1\"");
  }
}
