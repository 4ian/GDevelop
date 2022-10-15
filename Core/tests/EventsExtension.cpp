/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering events-based extensions
 */
#include "GDCore/IDE/WholeProjectRefactorer.h"

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
#include "GDCore/IDE/UnfilledRequiredBehaviorPropertyProblem.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/ExternalLayout.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "catch.hpp"

namespace {

gd::EventsFunctionsExtension &
SetupProjectWithEventsFunctionExtension(gd::Project &project) {
  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

  // Add an events-based behavior
  {
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyEventsBasedBehavior", 0);
    eventsBasedBehavior.SetFullName("My events based behavior");
    eventsBasedBehavior.SetDescription("An events based behavior for test");

    // Add a property
    eventsBasedBehavior.GetPropertyDescriptors()
        .InsertNew("MyProperty", 0)
        .SetValue("123")
        .SetType("Number");
  }

  return eventsExtension;
}
} // namespace

TEST_CASE("Events-based extension", "[common]") {
  SECTION("Behavior property default value") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension = SetupProjectWithEventsFunctionExtension(project);
    auto &layout1 = project.InsertNewLayout("Layout1", 0);
    auto &object = layout1.InsertNewObject(project, "MyExtension::Sprite", "Object1", 0);

    // Attach a behavior to an object.
    auto *behavior = object.AddNewBehavior(project, "MyEventsExtension::MyEventsBasedBehavior", "MyEventsBasedBehavior");
    behavior->InitializeContent();

    // The behavior has the default value.
    REQUIRE(behavior->GetProperties().size() == 1);
    REQUIRE(behavior->GetProperties().at("MyProperty").GetValue() == "123");
  }
}
