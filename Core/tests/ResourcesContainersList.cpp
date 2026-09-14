/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering gd::ResourcesContainersList.
 */
#include "GDCore/Project/ResourcesContainersList.h"

#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/Project/ResourcesContainer.h"
#include "catch.hpp"

namespace {
void AddResourceProperty(gd::PropertiesContainer &properties,
                         const gd::String &name) {
  properties.InsertNew(name, properties.GetCount())
      .SetType("Resource")
      .AddExtraInfo("image");
}
} // namespace

TEST_CASE("ResourcesContainersList", "[common]") {
  SECTION("Resource properties of a behavior are all found (shared or not)") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    project.GetResourcesManager().AddResource("MyProjectResource", "image.png",
                                              "image");

    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyEventsBasedBehavior", 0);
    auto &eventsFunction =
        eventsBasedBehavior.GetEventsFunctions().InsertNewEventsFunction(
            "MyFunction", 0);
    eventsFunction.GetParameters()
        .InsertNewParameter("MyResourceParameter", 0)
        .SetType("imageResource");

    AddResourceProperty(eventsBasedBehavior.GetPropertyDescriptors(),
                        "MyResourceProperty");
    AddResourceProperty(eventsBasedBehavior.GetSharedPropertyDescriptors(),
                        "MySharedResourceProperty");

    gd::ResourcesContainer parameterResourcesContainer(
        gd::ResourcesContainer::SourceType::Parameters);
    gd::ResourcesContainer propertyResourcesContainer(
        gd::ResourcesContainer::SourceType::Properties);
    auto resourcesContainersList =
        gd::ResourcesContainersList::
            MakeNewResourcesContainersListForBehaviorEventsFunction(
                project, eventsExtension, eventsBasedBehavior, eventsFunction,
                parameterResourcesContainer, propertyResourcesContainer);

    REQUIRE(resourcesContainersList.HasResourceNamed("MyResourceProperty"));
    REQUIRE(
        resourcesContainersList.HasResourceNamed("MySharedResourceProperty"));
    REQUIRE(resourcesContainersList.GetResourcesContainerSourceType(
                "MyResourceProperty") ==
            gd::ResourcesContainer::SourceType::Properties);
    REQUIRE(resourcesContainersList.GetResourcesContainerSourceType(
                "MySharedResourceProperty") ==
            gd::ResourcesContainer::SourceType::Properties);

    REQUIRE(resourcesContainersList.GetResourcesContainerSourceType(
                "MyResourceParameter") ==
            gd::ResourcesContainer::SourceType::Parameters);
    REQUIRE(resourcesContainersList.GetResourcesContainerSourceType(
                "MyProjectResource") ==
            gd::ResourcesContainer::SourceType::Global);
    REQUIRE(resourcesContainersList.GetResourcesContainerSourceType(
                "NotAResource") ==
            gd::ResourcesContainer::SourceType::Unknown);

    // The project resources, the behavior properties and the function
    // parameters.
    REQUIRE(resourcesContainersList.GetResourcesContainersCount() == 3);
  }

  SECTION("Resource properties of a custom object are found") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
        "MyEventsBasedObject", 0);
    auto &eventsFunction =
        eventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MyFunction", 0);

    AddResourceProperty(eventsBasedObject.GetPropertyDescriptors(),
                        "MyResourceProperty");

    gd::ResourcesContainer parameterResourcesContainer(
        gd::ResourcesContainer::SourceType::Parameters);
    gd::ResourcesContainer propertyResourcesContainer(
        gd::ResourcesContainer::SourceType::Properties);
    auto resourcesContainersList =
        gd::ResourcesContainersList::
            MakeNewResourcesContainersListForObjectEventsFunction(
                project, eventsExtension, eventsBasedObject, eventsFunction,
                parameterResourcesContainer, propertyResourcesContainer);

    REQUIRE(resourcesContainersList.HasResourceNamed("MyResourceProperty"));
    REQUIRE(resourcesContainersList.GetResourcesContainerSourceType(
                "MyResourceProperty") ==
            gd::ResourcesContainer::SourceType::Properties);
    REQUIRE(resourcesContainersList.GetResourcesContainersCount() == 3);
  }
}
