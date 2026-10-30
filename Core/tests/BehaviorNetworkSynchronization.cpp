/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering the network synchronization setting of behaviors.
 */
#include "DummyPlatform.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/Events/BehaviorDefaultFlagClearer.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "catch.hpp"

namespace {

gd::Object &AddObjectWithBehaviors(gd::Project &project) {
  gd::Layout &layout = project.InsertNewLayout("Scene", 0);
  gd::Object &object = layout.GetObjects().InsertNewObject(
      project, "MyExtension::Sprite", "MyObject", 0);
  object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
  object.AddNewBehavior(project, "MyExtension::MyInputMapperBehavior",
                        "MyInputMapperBehavior");
  return object;
}

gd::SerializerElement &GetBehaviorElement(gd::SerializerElement &objectElement,
                                          const gd::String &behaviorName) {
  auto &behaviorsElement = objectElement.GetChild("behaviors");
  behaviorsElement.ConsiderAsArrayOf("behavior");
  for (std::size_t i = 0; i < behaviorsElement.GetChildrenCount(); ++i) {
    auto &behaviorElement = behaviorsElement.GetChild(i);
    if (behaviorElement.GetStringAttribute("name") == behaviorName) {
      return behaviorElement;
    }
  }
  FAIL("Behavior not found in the serialized object: " + behaviorName);
  return behaviorsElement;
}

}  // namespace

TEST_CASE("BehaviorNetworkSynchronization", "[common]") {
  SECTION("Behaviors are synchronized by default, unless their metadata says "
          "otherwise") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    gd::Object &object = AddObjectWithBehaviors(project);

    auto &behavior = object.GetBehavior("MyBehavior");
    REQUIRE(behavior.IsSynchronizedOverNetwork() == true);
    REQUIRE(behavior.IsSynchronizedOverNetworkByDefault() == true);

    auto &inputMapperBehavior = object.GetBehavior("MyInputMapperBehavior");
    REQUIRE(inputMapperBehavior.IsSynchronizedOverNetwork() == false);
    REQUIRE(inputMapperBehavior.IsSynchronizedOverNetworkByDefault() == false);
  }

  SECTION("The setting is only serialized when it's different from the "
          "default") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    gd::Object &object = AddObjectWithBehaviors(project);

    {
      gd::SerializerElement objectElement;
      object.SerializeTo(objectElement);
      REQUIRE_FALSE(GetBehaviorElement(objectElement, "MyBehavior")
                        .HasAttribute("isSynchronizedOverNetwork"));
      REQUIRE_FALSE(GetBehaviorElement(objectElement, "MyInputMapperBehavior")
                        .HasAttribute("isSynchronizedOverNetwork"));
    }

    object.GetBehavior("MyBehavior").SetSynchronizedOverNetwork(false);
    object.GetBehavior("MyInputMapperBehavior")
        .SetSynchronizedOverNetwork(true);
    {
      gd::SerializerElement objectElement;
      object.SerializeTo(objectElement);
      auto &behaviorElement = GetBehaviorElement(objectElement, "MyBehavior");
      REQUIRE(behaviorElement.HasAttribute("isSynchronizedOverNetwork"));
      REQUIRE(behaviorElement.GetBoolAttribute("isSynchronizedOverNetwork") ==
              false);
      auto &inputMapperBehaviorElement =
          GetBehaviorElement(objectElement, "MyInputMapperBehavior");
      REQUIRE(
          inputMapperBehaviorElement.HasAttribute("isSynchronizedOverNetwork"));
      REQUIRE(inputMapperBehaviorElement.GetBoolAttribute(
                  "isSynchronizedOverNetwork") == true);
    }

    // Back to the default: nothing is serialized anymore.
    object.GetBehavior("MyBehavior").SetSynchronizedOverNetwork(true);
    {
      gd::SerializerElement objectElement;
      object.SerializeTo(objectElement);
      REQUIRE_FALSE(GetBehaviorElement(objectElement, "MyBehavior")
                        .HasAttribute("isSynchronizedOverNetwork"));
    }
  }

  SECTION("Save and load a project with behaviors with a changed setting") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProjectWithDummyPlatform(writtenProject, platform);
    gd::Object &writtenObject = AddObjectWithBehaviors(writtenProject);
    writtenObject.GetBehavior("MyBehavior").SetSynchronizedOverNetwork(false);
    writtenObject.GetBehavior("MyInputMapperBehavior")
        .SetSynchronizedOverNetwork(true);

    gd::SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);

    auto &readObject = readProject.GetLayout("Scene").GetObjects().GetObject(
        "MyObject");
    REQUIRE(readObject.GetBehavior("MyBehavior").IsSynchronizedOverNetwork() ==
            false);
    REQUIRE(readObject.GetBehavior("MyInputMapperBehavior")
                .IsSynchronizedOverNetwork() == true);

    // Saving again keeps the setting, once.
    gd::SerializerElement objectElement;
    readObject.SerializeTo(objectElement);
    REQUIRE(GetBehaviorElement(objectElement, "MyBehavior")
                .GetBoolAttribute("isSynchronizedOverNetwork") == false);
  }

  SECTION("Copying an object keeps the setting") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    gd::Object &object = AddObjectWithBehaviors(project);
    object.GetBehavior("MyBehavior").SetSynchronizedOverNetwork(false);

    gd::Object copiedObject(object);
    REQUIRE(
        copiedObject.GetBehavior("MyBehavior").IsSynchronizedOverNetwork() ==
        false);
    REQUIRE(copiedObject.GetBehavior("MyInputMapperBehavior")
                .IsSynchronizedOverNetwork() == false);
    REQUIRE(copiedObject.GetBehavior("MyInputMapperBehavior")
                .IsSynchronizedOverNetworkByDefault() == false);
  }

  SECTION("Behaviors not synchronized are always serialized as such for the "
          "Runtime") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    gd::Object &object = AddObjectWithBehaviors(project);

    gd::SerializerElement objectElement;
    gd::BehaviorDefaultFlagClearer::SerializeObjectWithCleanDefaultBehaviorFlags(
        object, objectElement);

    // The Runtime has no metadata: it considers behaviors synchronized
    // unless specified otherwise.
    REQUIRE_FALSE(GetBehaviorElement(objectElement, "MyBehavior")
                      .HasAttribute("isSynchronizedOverNetwork"));
    auto &inputMapperBehaviorElement =
        GetBehaviorElement(objectElement, "MyInputMapperBehavior");
    REQUIRE(
        inputMapperBehaviorElement.HasAttribute("isSynchronizedOverNetwork"));
    REQUIRE(inputMapperBehaviorElement.GetBoolAttribute(
                "isSynchronizedOverNetwork") == false);

    // The object itself is unchanged.
    REQUIRE(object.GetBehavior("MyInputMapperBehavior")
                .IsSynchronizedOverNetworkByDefault() == false);
  }

  SECTION("Events-based behaviors can be not synchronized by default") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);
    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    auto &eventsBasedBehavior =
        eventsExtension.GetEventsBasedBehaviors().InsertNew(
            "MyKeyboardMapper", 0);
    REQUIRE(eventsBasedBehavior.IsSynchronizedOverNetworkByDefault() == true);
    eventsBasedBehavior.SetSynchronizedOverNetworkByDefault(false);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);
    auto *behavior = object.AddNewBehavior(
        project, "MyEventsExtension::MyKeyboardMapper", "MyKeyboardMapper");
    REQUIRE(behavior->IsSynchronizedOverNetwork() == false);
    REQUIRE(behavior->IsSynchronizedOverNetworkByDefault() == false);
  }

  SECTION("The default of events-based behaviors is only serialized when "
          "they are not synchronized by default") {
    gd::Project project;
    gd::EventsBasedBehavior eventsBasedBehavior;
    {
      gd::SerializerElement element;
      eventsBasedBehavior.SerializeTo(element);
      REQUIRE_FALSE(element.HasAttribute("isSynchronizedOverNetworkByDefault"));
    }

    eventsBasedBehavior.SetSynchronizedOverNetworkByDefault(false);
    gd::SerializerElement element;
    eventsBasedBehavior.SerializeTo(element);
    REQUIRE(element.GetBoolAttribute("isSynchronizedOverNetworkByDefault",
                                     true) == false);

    gd::EventsBasedBehavior readEventsBasedBehavior;
    readEventsBasedBehavior.UnserializeFrom(project, element);
    REQUIRE(readEventsBasedBehavior.IsSynchronizedOverNetworkByDefault() ==
            false);
  }
}
