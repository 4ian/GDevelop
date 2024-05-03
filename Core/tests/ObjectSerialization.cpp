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
  gd::Object &object =
      layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
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
  auto &object = layout.GetObject("MyObject");
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
  eventsBasedObject.InsertNewObject(project, "MyExtension::Sprite", "MyChild",
                                    0);

  gd::Layout &layout = project.InsertNewLayout("Scene", 0);
  gd::Object &object = layout.InsertNewObject(
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
  auto &object = layout.GetObject("MyObject");
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
    gd::Object &object = layout.InsertNewObject(
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
}