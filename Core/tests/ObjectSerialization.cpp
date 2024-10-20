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
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/CustomObjectConfiguration.h"
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

void SetupSpriteConfiguration(gd::ObjectConfiguration &configuration) {
  auto *spriteConfiguration = dynamic_cast<gd::SpriteObject *>(&configuration);
  REQUIRE(spriteConfiguration != nullptr);
  gd::Animation animation;
  animation.SetName("Idle");
  spriteConfiguration->GetAnimations().AddAnimation(animation);
};

gd::Object &SetupProjectWithSprite(gd::Project &project,
                                   gd::Platform &platform) {
  SetupProjectWithDummyPlatform(project, platform);

  gd::Layout &layout = project.InsertNewLayout("Scene", 0);
  gd::Object &object = layout.GetObjects().InsertNewObject(
      project, "MyExtension::Sprite", "MyObject", 0);
  SetupSpriteConfiguration(object.GetConfiguration());

  return object;
};

void CheckSpriteConfigurationInObjectElement(SerializerElement &objectElement) {
  REQUIRE(objectElement.HasChild("animations"));
  auto &animationsElement = objectElement.GetChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  REQUIRE(animationsElement.GetChildrenCount() == 1);
  auto &animationElement = animationsElement.GetChild(0);

  REQUIRE(animationElement.GetStringAttribute("name") == "Idle");
};

void CheckSpriteConfigurationInProjectElement(
    SerializerElement &projectElement) {
  auto &layoutsElement = projectElement.GetChild("layouts");
  layoutsElement.ConsiderAsArrayOf("layout");
  REQUIRE(layoutsElement.GetChildrenCount() == 1);
  auto &layoutElement = layoutsElement.GetChild(0);

  REQUIRE(layoutElement.GetStringAttribute("name") == "Scene");
  REQUIRE(layoutElement.HasChild("objects"));

  auto &objectsElement = layoutElement.GetChild("objects");
  objectsElement.ConsiderAsArrayOf("object");
  REQUIRE(objectsElement.GetChildrenCount() == 1);
  auto &objectElement = objectsElement.GetChild(0);

  REQUIRE(objectElement.GetStringAttribute("name") == "MyObject");
  REQUIRE(objectElement.GetStringAttribute("type") == "MyExtension::Sprite");
  CheckSpriteConfigurationInObjectElement(objectElement);
};

void CheckSpriteConfiguration(gd::ObjectConfiguration &configuration) {
  auto *spriteConfiguration = dynamic_cast<gd::SpriteObject *>(&configuration);
  REQUIRE(spriteConfiguration);
  REQUIRE(spriteConfiguration->GetAnimations().GetAnimationsCount() == 1);

  auto &animation = spriteConfiguration->GetAnimations().GetAnimation(0);
  REQUIRE(animation.GetName() == "Idle");
};

void CheckSpriteConfiguration(gd::Object &object) {
  REQUIRE(object.GetName() == "MyObject");
  REQUIRE(object.GetType() == "MyExtension::Sprite");

  CheckSpriteConfiguration(object.GetConfiguration());
};

void CheckSpriteConfiguration(gd::Project &project) {
  auto &layout = project.GetLayout("Scene");
  auto &object = layout.GetObjects().GetObject("MyObject");
  CheckSpriteConfiguration(object);
};

gd::Object &SetupProjectWithCustomObject(gd::Project &project,
                                         gd::Platform &platform) {
  SetupProjectWithDummyPlatform(project, platform);

  auto &eventsExtension =
      project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
  auto &eventsBasedObject = eventsExtension.GetEventsBasedObjects().InsertNew(
      "MyEventsBasedObject", 0);
  eventsBasedObject.SetFullName("My events based object");
  eventsBasedObject.SetDescription("An events based object for test");
  eventsBasedObject.GetObjects().InsertNewObject(
      project, "MyExtension::Sprite", "MyChild", 0);

  gd::Layout &layout = project.InsertNewLayout("Scene", 0);
  gd::Object &object = layout.GetObjects().InsertNewObject(
      project, "MyEventsExtension::MyEventsBasedObject", "MyObject", 0);
  auto &configuration = object.GetConfiguration();
  auto *customObjectConfiguration =
      dynamic_cast<gd::CustomObjectConfiguration *>(&configuration);
  auto &spriteConfiguration =
      customObjectConfiguration->GetChildObjectConfiguration("MyChild");
  SetupSpriteConfiguration(spriteConfiguration);

  return object;
};

void CheckCustomObjectConfigurationInProjectElement(
    SerializerElement &projectElement) {
  auto &layoutsElement = projectElement.GetChild("layouts");
  layoutsElement.ConsiderAsArrayOf("layout");
  REQUIRE(layoutsElement.GetChildrenCount() == 1);
  auto &layoutElement = layoutsElement.GetChild(0);

  REQUIRE(layoutElement.GetStringAttribute("name") == "Scene");
  REQUIRE(layoutElement.HasChild("objects"));

  auto &objectsElement = layoutElement.GetChild("objects");
  objectsElement.ConsiderAsArrayOf("object");
  REQUIRE(objectsElement.GetChildrenCount() == 1);
  auto &objectElement = objectsElement.GetChild(0);

  REQUIRE(objectElement.GetStringAttribute("name") == "MyObject");
  REQUIRE(objectElement.GetStringAttribute("type") ==
          "MyEventsExtension::MyEventsBasedObject");
  auto &childrenContentElement = objectElement.GetChild("childrenContent");

  REQUIRE(childrenContentElement.HasChild("MyChild"));
  auto &childElement = childrenContentElement.GetChild("MyChild");
  CheckSpriteConfigurationInObjectElement(childElement);
};

void CheckCustomObjectConfiguration(gd::Object &object) {
  REQUIRE(object.GetName() == "MyObject");
  REQUIRE(object.GetType() == "MyEventsExtension::MyEventsBasedObject");

  auto &configuration = object.GetConfiguration();
  auto *customObjectConfiguration =
      dynamic_cast<gd::CustomObjectConfiguration *>(&configuration);
  auto &spriteConfiguration =
      customObjectConfiguration->GetChildObjectConfiguration("MyChild");
  CheckSpriteConfiguration(spriteConfiguration);
};

void CheckCustomObjectConfiguration(gd::Project &project) {
  auto &layout = project.GetLayout("Scene");
  auto &object = layout.GetObjects().GetObject("MyObject");
  CheckCustomObjectConfiguration(object);
};
} // namespace

TEST_CASE("ObjectSerialization", "[common]") {

  SECTION("Save and load a project with a sprite configuration") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProjectWithSprite(writtenProject, platform);
    CheckSpriteConfiguration(writtenProject);

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);
    CheckSpriteConfigurationInProjectElement(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);
    CheckSpriteConfiguration(readProject);
  }

  SECTION("Clone a sprite object") {
    gd::Platform platform;
    gd::Project project;
    auto &object = SetupProjectWithSprite(project, platform);
    CheckSpriteConfiguration(object);

    auto clonedObject = object.Clone();
    CheckSpriteConfiguration(*(clonedObject.get()));
  }

  SECTION("Save and load a project with a custom object configuration") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProjectWithCustomObject(writtenProject, platform);
    CheckCustomObjectConfiguration(writtenProject);

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);
    CheckCustomObjectConfigurationInProjectElement(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);
    CheckCustomObjectConfiguration(readProject);
  }

  SECTION("Clone a custom object") {
    gd::Platform platform;
    gd::Project project;
    auto &object = SetupProjectWithCustomObject(project, platform);
    CheckCustomObjectConfiguration(object);

    auto clonedObject = object.Clone();
    CheckCustomObjectConfiguration(*(clonedObject.get()));
  }

  SECTION("Exclude default behaviors from serialization") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::FakeObjectWithDefaultBehavior", "MyObject", 0);
    REQUIRE(object.HasBehaviorNamed("Effect"));

    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    REQUIRE(object.HasBehaviorNamed("MyBehavior"));

    SerializerElement projectElement;
    project.SerializeTo(projectElement);

    // Check serialized behaviors.
    auto &layoutsElement = projectElement.GetChild("layouts");
    layoutsElement.ConsiderAsArrayOf("layout");
    REQUIRE(layoutsElement.GetChildrenCount() == 1);
    auto &layoutElement = layoutsElement.GetChild(0);

    REQUIRE(layoutElement.GetStringAttribute("name") == "Scene");
    REQUIRE(layoutElement.HasChild("objects"));

    auto &objectsElement = layoutElement.GetChild("objects");
    objectsElement.ConsiderAsArrayOf("object");
    REQUIRE(objectsElement.GetChildrenCount() == 1);
    auto &objectElement = objectsElement.GetChild(0);

    auto &behaviorsElement = objectElement.GetChild("behaviors");
    behaviorsElement.ConsiderAsArrayOf("behavior");
    REQUIRE(behaviorsElement.GetChildrenCount() == 1);
    auto &behaviorElement = behaviorsElement.GetChild(0);
    REQUIRE(behaviorElement.GetStringAttribute("name") == "MyBehavior");
  }

  // Event-based object dependency cycles are not tested because they are forbidden by the editor.
  SECTION("Save and load a project with custom object dependencies from different extensions") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProjectWithDummyPlatform(writtenProject, platform);

    {
      // The extension with the dependency is added first to make the
      // implementation change the order in which extensions are loaded.
      auto &eventsExtensionWithDependency =
          writtenProject.InsertNewEventsFunctionsExtension(
              "MyEventsExtensionWithDependency", 0);
      auto &eventsExtension = writtenProject.InsertNewEventsFunctionsExtension(
          "MyEventsExtension", 1);
      {
        auto &eventsBasedObject =
            eventsExtension.GetEventsBasedObjects().InsertNew(
                "MyEventsBasedObject", 0);
        auto &childObject = eventsBasedObject.GetObjects().InsertNewObject(
            writtenProject, "MyExtension::Sprite", "MyChildSprite", 0);
      }
      // An event-based object with a custom object child that overrides its
      // configuration.
      {
        auto &eventsBasedObject =
            eventsExtensionWithDependency.GetEventsBasedObjects().InsertNew(
                "MyEventsBasedObjectWithDependency", 0);
        auto &childObject = eventsBasedObject.GetObjects().InsertNewObject(
            writtenProject, "MyEventsExtension::MyEventsBasedObject",
            "MyChildCustomObject", 0);
        auto *customObjectConfiguration =
            dynamic_cast<gd::CustomObjectConfiguration *>(
                &childObject.GetConfiguration());
        auto &spriteConfiguration =
            customObjectConfiguration->GetChildObjectConfiguration(
                "MyChildSprite");
        SetupSpriteConfiguration(spriteConfiguration);
      }
    }

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);

    REQUIRE(readProject.GetEventsFunctionsExtensionsCount() == 2);
    auto &eventsExtensionWithDependency =
        readProject.GetEventsFunctionsExtension(0);
    REQUIRE(eventsExtensionWithDependency.GetEventsBasedObjects().GetCount() ==
            1);
    auto &eventsBasedObject =
        eventsExtensionWithDependency.GetEventsBasedObjects().Get(0);
    REQUIRE(eventsBasedObject.GetObjects().GetObjectsCount() == 1);
    auto &childObject = eventsBasedObject.GetObjects().GetObject(0);
    REQUIRE(childObject.GetName() == "MyChildCustomObject");
    REQUIRE(childObject.GetType() == "MyEventsExtension::MyEventsBasedObject");
    auto *customObjectConfiguration =
        dynamic_cast<gd::CustomObjectConfiguration *>(
            &childObject.GetConfiguration());
    REQUIRE(customObjectConfiguration != nullptr);
    auto &spriteConfiguration =
        customObjectConfiguration->GetChildObjectConfiguration("MyChildSprite");
    CheckSpriteConfiguration(spriteConfiguration);
  }

  SECTION("Save and load a project with custom object dependencies inside an extension") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProjectWithDummyPlatform(writtenProject, platform);

    {
      auto &eventsExtension = writtenProject.InsertNewEventsFunctionsExtension(
          "MyEventsExtension", 0);
      {
        auto &eventsBasedObject =
            eventsExtension.GetEventsBasedObjects().InsertNew(
                "MyEventsBasedObject", 0);
        auto &childObject = eventsBasedObject.GetObjects().InsertNewObject(
            writtenProject, "MyExtension::Sprite", "MyChildSprite", 0);
      }
      // An event-based object with a custom object child that overrides its
      // configuration.
      // The extension with the dependency is added first to make the
      // implementation change the order in which extensions are loaded.
      {
        auto &eventsBasedObject =
            eventsExtension.GetEventsBasedObjects().InsertNew(
                "MyEventsBasedObjectWithDependency", 0);
        auto &childObject = eventsBasedObject.GetObjects().InsertNewObject(
            writtenProject, "MyEventsExtension::MyEventsBasedObject",
            "MyChildCustomObject", 0);
        auto *customObjectConfiguration =
            dynamic_cast<gd::CustomObjectConfiguration *>(
                &childObject.GetConfiguration());
        auto &spriteConfiguration =
            customObjectConfiguration->GetChildObjectConfiguration(
                "MyChildSprite");
        SetupSpriteConfiguration(spriteConfiguration);
      }
    }

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);

    REQUIRE(readProject.GetEventsFunctionsExtensionsCount() == 1);
    auto &eventsExtension =
        readProject.GetEventsFunctionsExtension(0);
    REQUIRE(eventsExtension.GetEventsBasedObjects().GetCount() == 2);
    auto &eventsBasedObject =
        eventsExtension.GetEventsBasedObjects().Get(0);
    REQUIRE(eventsBasedObject.GetObjects().GetObjectsCount() == 1);
    auto &childObject = eventsBasedObject.GetObjects().GetObject(0);
    REQUIRE(childObject.GetName() == "MyChildCustomObject");
    REQUIRE(childObject.GetType() == "MyEventsExtension::MyEventsBasedObject");
    auto *customObjectConfiguration =
        dynamic_cast<gd::CustomObjectConfiguration *>(
            &childObject.GetConfiguration());
    REQUIRE(customObjectConfiguration != nullptr);
    auto &spriteConfiguration =
        customObjectConfiguration->GetChildObjectConfiguration("MyChildSprite");
    CheckSpriteConfiguration(spriteConfiguration);
  }

  SECTION("Can unserialize over an existing extension without duplicating its event-based objects") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    auto &eventsExtension =
        project.InsertNewEventsFunctionsExtension("MyEventsExtension", 0);
    {
      auto &eventsBasedObject =
          eventsExtension.GetEventsBasedObjects().InsertNew(
              "MyEventsBasedObject", 0);
    }

    SerializerElement extensionElement;
    eventsExtension.SerializeTo(extensionElement);
    eventsExtension.UnserializeFrom(project, extensionElement);

    REQUIRE(eventsExtension.GetEventsBasedObjects().GetCount() == 1);
  }
}
