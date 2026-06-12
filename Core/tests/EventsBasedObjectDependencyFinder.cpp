/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering dependencies between events-based objects and
 * between the extensions declaring them.
 */
#include "GDCore/IDE/Project/EventsBasedObjectDependencyFinder.h"

#include <vector>

#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

namespace {

gd::EventsBasedObject &
InsertEventsBasedObject(gd::Project &project, const gd::String &extensionName,
                        const gd::String &objectName) {
  auto &extension =
      project.HasEventsFunctionsExtensionNamed(extensionName)
          ? project.GetEventsFunctionsExtension(extensionName)
          : project.InsertNewEventsFunctionsExtension(
                extensionName, project.GetEventsFunctionsExtensionsCount());
  return extension.GetEventsBasedObjects().InsertNew(
      objectName, extension.GetEventsBasedObjects().GetCount());
}

void AddChildObject(gd::Project &project,
                    gd::EventsBasedObject &eventsBasedObject,
                    const gd::String &childObjectType) {
  auto &childObjects = eventsBasedObject.GetObjects();
  childObjects.InsertNewObject(
      project, childObjectType,
      "Child" + gd::String::From(childObjects.GetObjectsCount()),
      childObjects.GetObjectsCount());
}

} // namespace

TEST_CASE("EventsBasedObjectDependencyFinder", "[common]") {

  SECTION("GetExtensionDependencyCycleCreatedByObject") {
    SECTION("Allows an object from the platform") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      InsertEventsBasedObject(project, "A", "ObjectA");

      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  GetExtensionDependencyCycleCreatedByObject(
                      project, "A", "MyExtension::Sprite")
                      .empty());
    }

    SECTION("Allows an object from the same extension") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      InsertEventsBasedObject(project, "A", "ObjectA");
      InsertEventsBasedObject(project, "A", "ObjectA2");

      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  GetExtensionDependencyCycleCreatedByObject(project, "A",
                                                             "A::ObjectA2")
                      .empty());
    }

    SECTION("Allows an object from an extension without dependencies") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      InsertEventsBasedObject(project, "A", "ObjectA");
      InsertEventsBasedObject(project, "B", "ObjectB");

      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  GetExtensionDependencyCycleCreatedByObject(project, "A",
                                                             "B::ObjectB")
                      .empty());
    }

    SECTION("Allows an object creating a one-way dependency") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &objectA = InsertEventsBasedObject(project, "A", "ObjectA");
      auto &objectB = InsertEventsBasedObject(project, "B", "ObjectB");
      InsertEventsBasedObject(project, "C", "ObjectC");

      // B already depends on A.
      AddChildObject(project, objectB, "A::ObjectA");

      // A new dependency of C on A is one-way: no cycle.
      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  GetExtensionDependencyCycleCreatedByObject(project, "C",
                                                             "A::ObjectA")
                      .empty());
    }

    SECTION("Forbids an object creating a direct cycle between 2 extensions") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      InsertEventsBasedObject(project, "A", "ObjectA");
      auto &objectB = InsertEventsBasedObject(project, "B", "ObjectB");

      // B depends on A.
      AddChildObject(project, objectB, "A::ObjectA");

      // Making A depend on B would create a cycle.
      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  GetExtensionDependencyCycleCreatedByObject(project, "A",
                                                             "B::ObjectB") ==
              std::vector<gd::String>({"A", "B", "A"}));
    }

    SECTION(
        "Forbids an object creating a cycle through an intermediate "
        "extension") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      InsertEventsBasedObject(project, "A", "ObjectA");
      auto &objectB = InsertEventsBasedObject(project, "B", "ObjectB");
      auto &objectC = InsertEventsBasedObject(project, "C", "ObjectC");

      // B depends on C, which depends on A.
      AddChildObject(project, objectB, "C::ObjectC");
      AddChildObject(project, objectC, "A::ObjectA");

      // Making A depend on B would create a cycle going through C.
      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  GetExtensionDependencyCycleCreatedByObject(project, "A",
                                                             "B::ObjectB") ==
              std::vector<gd::String>({"A", "B", "C", "A"}));
    }
  }

  SECTION("IsDependentFromEventsBasedObject") {
    SECTION("An object is dependent on itself") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &objectA = InsertEventsBasedObject(project, "A", "ObjectA");

      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  IsDependentFromEventsBasedObject(project, objectA,
                                                   objectA) == true);
    }

    SECTION("An object is dependent on a direct child") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &objectA = InsertEventsBasedObject(project, "A", "ObjectA");
      auto &objectA2 = InsertEventsBasedObject(project, "A", "ObjectA2");
      AddChildObject(project, objectA2, "A::ObjectA");

      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  IsDependentFromEventsBasedObject(project, objectA2,
                                                   objectA) == true);
    }

    SECTION("An object is dependent on an indirect child") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &objectA = InsertEventsBasedObject(project, "A", "ObjectA");
      auto &objectB = InsertEventsBasedObject(project, "B", "ObjectB");
      auto &objectC = InsertEventsBasedObject(project, "C", "ObjectC");
      AddChildObject(project, objectB, "C::ObjectC");
      AddChildObject(project, objectC, "A::ObjectA");

      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  IsDependentFromEventsBasedObject(project, objectB,
                                                   objectA) == true);
    }

    SECTION("An object is not dependent on an object it doesn't contain") {
      gd::Project project;
      gd::Platform platform;
      SetupProjectWithDummyPlatform(project, platform);
      auto &objectA = InsertEventsBasedObject(project, "A", "ObjectA");
      auto &objectB = InsertEventsBasedObject(project, "B", "ObjectB");
      AddChildObject(project, objectB, "A::ObjectA");

      // ObjectB contains ObjectA, but not the reverse.
      REQUIRE(gd::EventsBasedObjectDependencyFinder::
                  IsDependentFromEventsBasedObject(project, objectA,
                                                   objectB) == false);
    }
  }
}
