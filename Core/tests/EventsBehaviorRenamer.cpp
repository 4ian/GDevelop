/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsBehaviorRenamer.h"

#include <algorithm>

#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "catch.hpp"

namespace {

gd::StandardEvent &EnsureStandardEvent(gd::BaseEvent &baseEvent) {
  gd::StandardEvent *standardEvent =
      dynamic_cast<gd::StandardEvent *>(&baseEvent);
  INFO("The inspected event is "
       << (standardEvent ? "a standard event" : "not a standard event"));
  REQUIRE(standardEvent != nullptr);

  return *standardEvent;
}
}  // namespace

TEST_CASE("EventsBehaviorRenamer (expressions)", "[common]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  auto projectScopedContainers =
    gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);

  auto &object1 =
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
  object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
  object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior2");

  // Add an event with an expression using the behaviors.
  gd::StandardEvent event;
  gd::Instruction instruction;
  instruction.SetType("MyExtension::DoSomething");
  instruction.SetParametersCount(1);
  instruction.SetParameter(
      0,
      gd::Expression("4 + "
                     "Object1.MyBehavior::GetBehaviorNumberWith1Param(1) + "
                     "Object1.MyBehavior2::GetBehaviorNumberWith1Param(1)"));
  event.GetActions().Insert(instruction);
  layout1.GetEvents().InsertEvent(event);

  // Rename the first behavior.
  gd::EventsBehaviorRenamer behaviorRenamer(
      platform, "Object1", "MyBehavior", "MyRenamedBehavior");
  behaviorRenamer.Launch(layout1.GetEvents(), projectScopedContainers);

  // Verify the expression were updated.
  REQUIRE(EnsureStandardEvent(layout1.GetEvents().GetEvent(0))
              .GetActions()
              .Get(0)
              .GetParameter(0)
              .GetPlainString() ==
          "4 + Object1.MyRenamedBehavior::GetBehaviorNumberWith1Param(1) + "
          "Object1.MyBehavior2::GetBehaviorNumberWith1Param(1)");
}

TEST_CASE("EventsBehaviorRenamer (instructions)", "[common]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  auto projectScopedContainers =
    gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);

  auto &object1 =
      layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);
  object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
  object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior2");

  // Add an action using MyBehavior.
  {
    gd::StandardEvent event;
    gd::Instruction instruction;
    instruction.SetType("MyExtension::BehaviorDoSomething");
    instruction.SetParametersCount(3);
    instruction.SetParameter(0, gd::Expression("Object1"));
    instruction.SetParameter(1, gd::Expression("MyBehavior"));
    instruction.SetParameter(2, gd::Expression("123"));
    event.GetActions().Insert(instruction);
    layout1.GetEvents().InsertEvent(event);
  }

  // Add an action using MyBehavior2.
  {
    gd::StandardEvent event;
    gd::Instruction instruction;
    instruction.SetType("MyExtension::BehaviorDoSomething");
    instruction.SetParametersCount(3);
    instruction.SetParameter(0, gd::Expression("Object1"));
    instruction.SetParameter(1, gd::Expression("MyBehavior2"));
    instruction.SetParameter(2, gd::Expression("123"));
    event.GetActions().Insert(instruction);
    layout1.GetEvents().InsertEvent(event);
  }

  // Rename MyBehavior.
  gd::EventsBehaviorRenamer behaviorRenamer(
      platform, "Object1", "MyBehavior", "MyRenamedBehavior");
  behaviorRenamer.Launch(layout1.GetEvents(), projectScopedContainers);

  // Ensure the action using MyBehavior has its parameter renamed.
  REQUIRE(EnsureStandardEvent(layout1.GetEvents().GetEvent(0))
              .GetActions()
              .Get(0)
              .GetParameter(0)
              .GetPlainString() == "Object1");
  REQUIRE(EnsureStandardEvent(layout1.GetEvents().GetEvent(0))
              .GetActions()
              .Get(0)
              .GetParameter(1)
              .GetPlainString() == "MyRenamedBehavior");

  // Ensure MyBehavior2 is left untouched
  REQUIRE(EnsureStandardEvent(layout1.GetEvents().GetEvent(1))
              .GetActions()
              .Get(0)
              .GetParameter(0)
              .GetPlainString() == "Object1");
  REQUIRE(EnsureStandardEvent(layout1.GetEvents().GetEvent(1))
              .GetActions()
              .Get(0)
              .GetParameter(1)
              .GetPlainString() == "MyBehavior2");
}
