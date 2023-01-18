/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering serialization to JSON.
 */
#include "DummyPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

using namespace gd;

namespace {

void AddEventsBasedExtension(gd::Project &project) {
  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);

  auto &eventsBasedBehavior =
      eventsExtension.GetEventsBasedBehaviors().InsertNew(
          "MyEventsBasedBehavior", 0);
  eventsBasedBehavior.SetFullName("My events based behavior");
  eventsBasedBehavior.SetDescription("An events based behavior for test");
  eventsBasedBehavior.SetObjectType("");
  eventsBasedBehavior.GetPropertyDescriptors()
      .InsertNew("MyProperty", 0)
      .SetType("Number");
};

void AddAnotherEventsBasedExtensionWithDependency(gd::Project &project) {
  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyOtherEventsExtension", 0);

  auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
      "MyEventsBasedObject", 0);
  eventsBasedObject.SetFullName("My events based object");
  eventsBasedObject.SetDescription("An events based object for test");

  gd::Object &object = eventsBasedObject.InsertNewObject(
      project, "MyExtension::Sprite", "MyObject", 0);
  gd::Behavior *behavior =
      object.AddNewBehavior(project, "MyEventsExtension::MyEventsBasedBehavior",
                            "MyEventsBasedBehavior");
  behavior->UpdateProperty("MyProperty", "481516");
};

void SetupProject(gd::Project &project, gd::Platform &platform) {
  SetupProjectWithDummyPlatform(project, platform);
  AddEventsBasedExtension(project);

  gd::Layout &layout = project.InsertNewLayout("Scene", 0);
  gd::Object &object =
      layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
  gd::Behavior *behavior =
      object.AddNewBehavior(project, "MyEventsExtension::MyEventsBasedBehavior",
                            "MyEventsBasedBehavior");
  behavior->UpdateProperty("MyProperty", "481516");
};

void CheckBehaviorPropertyInObjectContainerElement(
    SerializerElement &objectContainerElement) {
  REQUIRE(objectContainerElement.HasChild("objects"));

  auto &objectsElement = objectContainerElement.GetChild("objects");
  objectsElement.ConsiderAsArrayOf("object");
  REQUIRE(objectsElement.GetChildrenCount() == 1);
  auto &objectElement = objectsElement.GetChild(0);

  REQUIRE(objectElement.GetStringAttribute("name") == "MyObject");
  REQUIRE(objectElement.GetStringAttribute("type") == "MyExtension::Sprite");
  REQUIRE(objectElement.HasChild("behaviors"));

  auto &behaviorsElement = objectElement.GetChild("behaviors");
  behaviorsElement.ConsiderAsArrayOf("behavior");
  REQUIRE(behaviorsElement.GetChildrenCount() == 1);
  auto &behaviorElement = behaviorsElement.GetChild(0);

  REQUIRE(behaviorElement.GetStringAttribute("name") ==
          "MyEventsBasedBehavior");
  REQUIRE(behaviorElement.GetStringAttribute("type") ==
          "MyEventsExtension::MyEventsBasedBehavior");
  REQUIRE(behaviorElement.GetStringAttribute("MyProperty") == "481516");
};

void CheckBehaviorPropertyInElement(SerializerElement &projectElement) {
  auto &layoutsElement = projectElement.GetChild("layouts");
  layoutsElement.ConsiderAsArrayOf("layout");
  REQUIRE(layoutsElement.GetChildrenCount() == 1);
  auto &layoutElement = layoutsElement.GetChild(0);

  REQUIRE(layoutElement.GetStringAttribute("name") == "Scene");
  CheckBehaviorPropertyInObjectContainerElement(layoutElement);
};

void CheckBehaviorProperty(ObjectsContainer &container) {
  auto &object = container.GetObject("MyObject");
  REQUIRE(object.GetType() == "MyExtension::Sprite");
  REQUIRE(object.HasBehaviorNamed("MyEventsBasedBehavior"));

  auto &behavior = object.GetBehavior("MyEventsBasedBehavior");
  REQUIRE(behavior.GetTypeName() == "MyEventsExtension::MyEventsBasedBehavior");
  REQUIRE(behavior.GetProperties().size() == 1);
  REQUIRE(behavior.GetProperties().at("MyProperty").GetValue() == "481516");
};
} // namespace

// TODO EBO Add similar test cases for events-based objects.
TEST_CASE("BehaviorSerialization", "[common]") {

  SECTION("Save and load a project with a custom behavior property value") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProject(writtenProject, platform);
    CheckBehaviorProperty(writtenProject.GetLayout("Scene"));

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);
    CheckBehaviorPropertyInElement(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);
    CheckBehaviorProperty(readProject.GetLayout("Scene"));
  }

  SECTION("Load a project with a property value on a custom behavior that no longer exists") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProject(writtenProject, platform);

    // Remove the events-based behavior
    writtenProject.RemoveEventsFunctionsExtension("MyEventsExtension");

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);
    CheckBehaviorPropertyInElement(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);

    // Add the events-based behavior back
    AddEventsBasedExtension(readProject);

    CheckBehaviorProperty(readProject.GetLayout("Scene"));
  }

  SECTION("Save and load a project with an event based extension dependency") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProject(writtenProject, platform);
    AddAnotherEventsBasedExtensionWithDependency(writtenProject);

    // It's important that the extension with the dependency is the first one.
    REQUIRE(writtenProject.GetEventsFunctionsExtension(0).GetName() ==
            "MyOtherEventsExtension");
    REQUIRE(writtenProject.GetEventsFunctionsExtension(1).GetName() ==
            "MyEventsExtension");

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);

    auto &extensionsElement =
        projectElement.GetChild("eventsFunctionsExtensions");
    extensionsElement.ConsiderAsArrayOf("eventsFunctionsExtension");
    REQUIRE(extensionsElement.GetChildrenCount() == 2);

    auto &firstExtensionElement = extensionsElement.GetChild(0);
    REQUIRE(firstExtensionElement.GetStringAttribute("name") ==
            "MyOtherEventsExtension");
    auto &eventsBasedObjectsElement =
        firstExtensionElement.GetChild("eventsBasedObjects");
    eventsBasedObjectsElement.ConsiderAsArrayOf("eventsBasedObject");
    auto &eventsBasedObjectElement =
        eventsBasedObjectsElement.GetChild(0);
    CheckBehaviorPropertyInObjectContainerElement(eventsBasedObjectElement);

    auto &secondExtensionElement = extensionsElement.GetChild(1);
    REQUIRE(secondExtensionElement.GetStringAttribute("name") ==
            "MyEventsExtension");

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);

    // The custom behavior is unserialized even though it depends on the other
    // extension.
    REQUIRE(readProject.HasEventsBasedObject(
        "MyOtherEventsExtension::MyEventsBasedObject"));
    CheckBehaviorProperty(readProject.GetEventsBasedObject(
        "MyOtherEventsExtension::MyEventsBasedObject"));
  }
}