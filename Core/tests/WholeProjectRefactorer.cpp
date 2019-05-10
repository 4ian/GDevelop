/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering project refactoring
 */
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "DummyPlatform.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "catch.hpp"

namespace {

gd::EventsFunctionsExtension &SetupProjectWithEventsFunctionExtension(
    gd::Project &project) {
  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

  // Add a (free) function and a (free) expression
  eventsExtension.InsertNewEventsFunction("MyEventsFunction", 0);
  eventsExtension.InsertNewEventsFunction("MyEventsFunctionExpression", 1)
      .SetFunctionType(gd::EventsFunction::Expression);

  // Add some usage for them
  {
    auto &layout = project.InsertNewLayout("LayoutWithFreeFunctions", 0);
    auto &externalEvents =
        project.InsertNewExternalEvents("ExternalEventsWithFreeFunctions", 0);
    externalEvents.SetAssociatedLayout("LayoutWithFreeFunctions");

    // Create an event in the layout referring to
    // MyEventsExtension::MyEventsFunction
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyEventsExtension::MyEventsFunction");
      event.GetActions().Insert(instruction);
      layout.GetEvents().InsertEvent(event);
    }

    // Create an event in the external events referring to
    // MyEventsExtension::MyEventsFunctionExpression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression(
              "1 + MyEventsExtension::MyEventsFunctionExpression(123)"));
      event.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(event);
    }
  }

  // Add a events based behavior
  {
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyEventsBasedBehavior", 0);
    eventsBasedBehavior.SetFullName("My events based behavior");
    eventsBasedBehavior.SetDescription("An events based behavior for test");

    auto &behaviorEventsFunctions = eventsBasedBehavior.GetEventsFunctions();
    behaviorEventsFunctions.InsertNewEventsFunction("MyBehaviorEventsFunction",
                                                    0);
    behaviorEventsFunctions
        .InsertNewEventsFunction("MyBehaviorEventsFunctionExpression", 1)
        .SetFunctionType(gd::EventsFunction::Expression);
  }

  // Add some usage in events
  {
    auto &layout = project.InsertNewLayout("LayoutWithBehaviorFunctions", 0);
    auto &externalEvents = project.InsertNewExternalEvents(
        "ExternalEventsWithBehaviorFunctions", 0);
    externalEvents.SetAssociatedLayout("LayoutWithBehaviorFunctions");

    auto &object = layout.InsertNewObject(
        project, "MyExtension::Sprite", "ObjectWithMyBehavior", 0);
    object.AddBehavior(gd::BehaviorContent(
        "MyBehavior", "MyEventsExtension::MyEventsBasedBehavior"));

    auto &globalObject = project.InsertNewObject(
        project, "MyExtension::Sprite", "GlobalObjectWithMyBehavior", 0);
    globalObject.AddBehavior(gd::BehaviorContent(
        "MyBehavior", "MyEventsExtension::MyEventsBasedBehavior"));

    // Create an event in the layout referring to
    // MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunction
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType(
          "MyEventsExtension::MyEventsBasedBehavior::MyBehaviorEventsFunction");
      event.GetActions().Insert(instruction);
      layout.GetEvents().InsertEvent(event);
    }

    // Create an event in ExternalEvents1 referring to
    // MyEventsExtension::MyEventsFunctionExpression
    {
      gd::StandardEvent event;
      gd::Instruction instruction;
      instruction.SetType("MyExtension::DoSomething");
      instruction.SetParametersCount(1);
      instruction.SetParameter(
          0,
          gd::Expression("1 + "
                         "ObjectWithMyBehavior::MyBehavior."
                         "MyBehaviorEventsFunctionExpression(123)"));
      event.GetActions().Insert(instruction);
      externalEvents.GetEvents().InsertEvent(event);
    }
  }

  return eventsExtension;
}
}  // namespace

TEST_CASE("WholeProjectRefactorer", "[common]") {
  SECTION("Object deleted") {
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

      gd::WholeProjectRefactorer::ObjectRemovedInLayout(
          project, layout1, "Object1");
      gd::WholeProjectRefactorer::GlobalObjectRemoved(project, "GlobalObject1");
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

      gd::WholeProjectRefactorer::ObjectRemovedInLayout(
          project, layout1, "Object1");
      gd::WholeProjectRefactorer::GlobalObjectRemoved(project, "GlobalObject1");
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

      gd::WholeProjectRefactorer::ObjectRemovedInLayout(
          project, layout1, "Object1");
      gd::WholeProjectRefactorer::GlobalObjectRemoved(project, "GlobalObject1");
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

  SECTION("Object renamed") {
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

      gd::WholeProjectRefactorer::ObjectRenamedInLayout(
          project, layout1, "Object1", "Object3");
      gd::WholeProjectRefactorer::GlobalObjectRenamed(
          project, "GlobalObject1", "GlobalObject3");
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

      gd::WholeProjectRefactorer::ObjectRenamedInLayout(
          project, layout1, "Object1", "Object3");
      gd::WholeProjectRefactorer::GlobalObjectRenamed(
          project, "GlobalObject1", "GlobalObject3");
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

      gd::WholeProjectRefactorer::ObjectRenamedInLayout(
          project, layout1, "Object1", "Object3");
      gd::WholeProjectRefactorer::GlobalObjectRenamed(
          project, "GlobalObject1", "GlobalObject3");
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
  }
  SECTION("Events extension renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunctionsExtension(
        project, eventsExtension, "MyEventsExtension", "MyRenamedExtension");

    // Check that events function calls in instructions have been renamed
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetLayout("LayoutWithFreeFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetType() == "MyRenamedExtension::MyEventsFunction");

    // Check that events function calls in expressions have been renamed
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetExternalEvents("ExternalEventsWithFreeFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetParameter(0)
                .GetPlainString() ==
            "1 + MyRenamedExtension::MyEventsFunctionExpression(123)");

    // TODO: Check if events based behaviors have been renamed
    // TODO: Check if events based behaviors functions have been renamed
  }
  SECTION("(Free) events function renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);

    gd::WholeProjectRefactorer::RenameEventsFunction(project,
                                                     eventsExtension,
                                                     "MyEventsFunction",
                                                     "MyRenamedEventsFunction");
    gd::WholeProjectRefactorer::RenameEventsFunction(
        project,
        eventsExtension,
        "MyEventsFunctionExpression",
        "MyRenamedFunctionExpression");

    // Check that events function calls in instructions have been renamed
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetLayout("LayoutWithFreeFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetType() == "MyEventsExtension::MyRenamedEventsFunction");

    // Check that events function calls in expressions have been renamed
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetExternalEvents("ExternalEventsWithFreeFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetParameter(0)
                .GetPlainString() ==
            "1 + MyEventsExtension::MyRenamedFunctionExpression(123)");
  }
  SECTION("Events based Behavior type renamed") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().Get("MyEventsBasedBehavior");

    gd::WholeProjectRefactorer::RenameEventsBasedBehavior(
        project,
        eventsExtension,
        "MyEventsBasedBehavior",
        "MyRenamedEventsBasedBehavior");

    // Check that the type of the behavior was changed in the behaviors of
    // objects. Name is *not* changed.
    REQUIRE(project.GetLayout("LayoutWithBehaviorFunctions")
                .GetObject("ObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");
    REQUIRE(project.GetObject("GlobalObjectWithMyBehavior")
                .GetBehavior("MyBehavior")
                .GetTypeName() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior");

    // Check if events based behaviors functions have been renamed in
    // instructions
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetLayout("LayoutWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetType() ==
            "MyEventsExtension::MyRenamedEventsBasedBehavior::"
            "MyBehaviorEventsFunction");

    // Check events based behaviors functions have *not* been renamed in
    // expressions
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetParameter(0)
                .GetPlainString() ==
            "1 + "
            "ObjectWithMyBehavior::MyBehavior."
            "MyBehaviorEventsFunctionExpression(123)");
  }
  SECTION("(Events based Behavior) events function renamed") {
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
        "MyBehaviorEventsFunction",
        "MyRenamedBehaviorEventsFunction");
    gd::WholeProjectRefactorer::RenameBehaviorEventsFunction(
        project,
        eventsExtension,
        eventsBasedBehavior,
        "MyBehaviorEventsFunctionExpression",
        "MyRenamedBehaviorEventsFunctionExpression");

    // Check if events based behaviors functions have been renamed in
    // instructions
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetLayout("LayoutWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetType() ==
            "MyEventsExtension::MyEventsBasedBehavior::"
            "MyRenamedBehaviorEventsFunction");

    // Check events based behaviors functions have been renamed in
    // expressions
    REQUIRE(static_cast<gd::StandardEvent &>(
                project.GetExternalEvents("ExternalEventsWithBehaviorFunctions")
                    .GetEvents()
                    .GetEvent(0))
                .GetActions()
                .Get(0)
                .GetParameter(0)
                .GetPlainString() ==
            "1 + "
            "ObjectWithMyBehavior::MyBehavior."
            "MyRenamedBehaviorEventsFunctionExpression(123)");
  }
}
