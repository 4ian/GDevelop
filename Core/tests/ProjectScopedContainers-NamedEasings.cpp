/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/NamedEasingsContainer.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/ResourcesContainer.h"
#include "GDCore/Project/VariablesContainer.h"
#include "catch.hpp"

TEST_CASE("ProjectScopedContainers named easings", "[common]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);

  gd::Layout &layout = project.InsertNewLayout("Scene", 0);
  project.GetNamedEasings().InsertNewNamedEasing("ProjectEasing", 0);

  gd::EventsFunctionsExtension &extension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
  extension.GetNamedEasings().InsertNewNamedEasing("ExtensionEasing", 0);

  SECTION("ForProjectAndLayout uses project easings and empty extension name") {
    auto projectScopedContainers = gd::ProjectScopedContainers::
        MakeNewProjectScopedContainersForProjectAndLayout(project, layout);

    REQUIRE(&projectScopedContainers.GetNamedEasings() ==
            &project.GetNamedEasings());
    REQUIRE(&projectScopedContainers.GetNamedEasings() !=
            &extension.GetNamedEasings());
    REQUIRE(projectScopedContainers.GetScopeExtensionName() == "");
  }

  SECTION("ForProject uses project easings and empty extension name") {
    auto projectScopedContainers =
        gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProject(
            project);

    REQUIRE(&projectScopedContainers.GetNamedEasings() ==
            &project.GetNamedEasings());
    REQUIRE(projectScopedContainers.GetScopeExtensionName() == "");
  }

  SECTION("ForEventsFunctionsExtension uses extension easings and name") {
    auto projectScopedContainers = gd::ProjectScopedContainers::
        MakeNewProjectScopedContainersForEventsFunctionsExtension(project,
                                                                  extension);

    REQUIRE(&projectScopedContainers.GetNamedEasings() ==
            &extension.GetNamedEasings());
    REQUIRE(&projectScopedContainers.GetNamedEasings() !=
            &project.GetNamedEasings());
    REQUIRE(projectScopedContainers.GetScopeExtensionName() ==
            extension.GetName());
  }

  SECTION("ForFreeEventsFunction uses extension easings and name") {
    gd::EventsFunction &eventsFunction =
        extension.GetEventsFunctions().InsertNewEventsFunction(
            "MyEventsFunction", 0);
    gd::ObjectsContainer parameterObjectsContainer(
        gd::ObjectsContainer::SourceType::Function);
    gd::VariablesContainer parameterVariablesContainer(
        gd::VariablesContainer::SourceType::Parameters);
    gd::ResourcesContainer parameterResourcesContainer(
        gd::ResourcesContainer::SourceType::Parameters);

    auto projectScopedContainers = gd::ProjectScopedContainers::
        MakeNewProjectScopedContainersForFreeEventsFunction(
            project, extension, eventsFunction, parameterObjectsContainer,
            parameterVariablesContainer, parameterResourcesContainer);

    REQUIRE(&projectScopedContainers.GetNamedEasings() ==
            &extension.GetNamedEasings());
    REQUIRE(projectScopedContainers.GetScopeExtensionName() ==
            extension.GetName());
  }

  SECTION("ForBehaviorEventsFunction uses extension easings and name") {
    gd::EventsBasedBehavior &eventsBasedBehavior =
        extension.GetEventsBasedBehaviors().InsertNew("MyBehavior", 0);
    gd::EventsFunction &eventsFunction =
        eventsBasedBehavior.GetEventsFunctions().InsertNewEventsFunction(
            "MyBehaviorFunction", 0);
    gd::ObjectsContainer parameterObjectsContainer(
        gd::ObjectsContainer::SourceType::Function);
    gd::VariablesContainer parameterVariablesContainer(
        gd::VariablesContainer::SourceType::Parameters);
    gd::VariablesContainer propertyVariablesContainer(
        gd::VariablesContainer::SourceType::Properties);
    gd::ResourcesContainer parameterResourcesContainer(
        gd::ResourcesContainer::SourceType::Parameters);
    gd::ResourcesContainer propertyResourcesContainer(
        gd::ResourcesContainer::SourceType::Properties);

    auto projectScopedContainers = gd::ProjectScopedContainers::
        MakeNewProjectScopedContainersForBehaviorEventsFunction(
            project, extension, eventsBasedBehavior, eventsFunction,
            parameterObjectsContainer, parameterVariablesContainer,
            propertyVariablesContainer, parameterResourcesContainer,
            propertyResourcesContainer);

    REQUIRE(&projectScopedContainers.GetNamedEasings() ==
            &extension.GetNamedEasings());
    REQUIRE(projectScopedContainers.GetScopeExtensionName() ==
            extension.GetName());
  }

  SECTION("ForObjectEventsFunction uses extension easings and name") {
    gd::EventsBasedObject &eventsBasedObject =
        extension.GetEventsBasedObjects().InsertNew("MyObject", 0);
    gd::EventsFunction &eventsFunction =
        eventsBasedObject.GetEventsFunctions().InsertNewEventsFunction(
            "MyObjectFunction", 0);
    gd::ObjectsContainer parameterObjectsContainer(
        gd::ObjectsContainer::SourceType::Function);
    gd::VariablesContainer parameterVariablesContainer(
        gd::VariablesContainer::SourceType::Parameters);
    gd::VariablesContainer propertyVariablesContainer(
        gd::VariablesContainer::SourceType::Properties);
    gd::ResourcesContainer parameterResourcesContainer(
        gd::ResourcesContainer::SourceType::Parameters);
    gd::ResourcesContainer propertyResourcesContainer(
        gd::ResourcesContainer::SourceType::Properties);

    auto projectScopedContainers = gd::ProjectScopedContainers::
        MakeNewProjectScopedContainersForObjectEventsFunction(
            project, extension, eventsBasedObject, eventsFunction,
            parameterObjectsContainer, parameterVariablesContainer,
            propertyVariablesContainer, parameterResourcesContainer,
            propertyResourcesContainer);

    REQUIRE(&projectScopedContainers.GetNamedEasings() ==
            &extension.GetNamedEasings());
    REQUIRE(projectScopedContainers.GetScopeExtensionName() ==
            extension.GetName());
  }

  SECTION("ForEventsBasedObject uses extension easings and name") {
    gd::EventsBasedObject &eventsBasedObject =
        extension.GetEventsBasedObjects().InsertNew("MyEventsBasedObject", 0);
    gd::ObjectsContainer outputObjectsContainer(
        gd::ObjectsContainer::SourceType::Function);

    auto projectScopedContainers = gd::ProjectScopedContainers::
        MakeNewProjectScopedContainersForEventsBasedObject(
            project, extension, eventsBasedObject, outputObjectsContainer);

    REQUIRE(&projectScopedContainers.GetNamedEasings() ==
            &extension.GetNamedEasings());
    REQUIRE(projectScopedContainers.GetScopeExtensionName() ==
            extension.GetName());
  }

  SECTION("Default constructed has empty easings") {
    gd::ProjectScopedContainers projectScopedContainers;

    REQUIRE(projectScopedContainers.GetNamedEasings().GetNamedEasingsCount() ==
            0);
  }
}
