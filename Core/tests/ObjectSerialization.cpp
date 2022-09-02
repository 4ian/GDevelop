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
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Serialization/Serializer.h"
#include "GDCore/Tools/SystemStats.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

using namespace gd;

namespace {

void SetupProject(gd::Project &project, gd::Platform &platform) {
  SetupProjectWithDummyPlatform(project, platform);

  gd::Layout &layout = project.InsertNewLayout("Scene", 0);
  gd::Object &object =
      layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

  auto &configuration = object.GetConfiguration();
  auto *spriteConfiguration = dynamic_cast<gd::SpriteObject *>(&configuration);
  REQUIRE(spriteConfiguration != nullptr);
  gd::Animation animation;
  animation.SetName("Idle");
  spriteConfiguration->AddAnimation(animation);
};

void CheckSpriteConfiguration(
    SerializerElement &objectContainerElement) {
};

void CheckSpriteConfigurationInElement(SerializerElement &projectElement) {
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

  REQUIRE(objectElement.HasChild("animations"));
  auto &animationsElement = objectElement.GetChild("animations");
  animationsElement.ConsiderAsArrayOf("animation");
  REQUIRE(animationsElement.GetChildrenCount() == 1);
  auto &animationElement = animationsElement.GetChild(0);

  REQUIRE(animationElement.GetStringAttribute("name") ==
          "Idle");
};

void CheckSpriteConfiguration(gd::Project &project) {
  auto &layout = project.GetLayout("Scene");
  auto &object = layout.GetObject("MyObject");
  REQUIRE(object.GetName() == "MyObject");
  REQUIRE(object.GetType() == "MyExtension::Sprite");

  auto &configuration = object.GetConfiguration();
  auto *spriteConfiguration = dynamic_cast<gd::SpriteObject *>(&configuration);
  REQUIRE(spriteConfiguration);
  REQUIRE(spriteConfiguration->GetAnimationsCount() == 1);

  auto &animation = spriteConfiguration->GetAnimation(0);
  REQUIRE(animation.GetName() == "Idle");
};
} // namespace

TEST_CASE("ObjectSerialization", "[common]") {

  SECTION("Save and load a project with a sprite configuration") {
    gd::Platform platform;
    gd::Project writtenProject;
    SetupProject(writtenProject, platform);
    CheckSpriteConfiguration(writtenProject);

    SerializerElement projectElement;
    writtenProject.SerializeTo(projectElement);
    CheckSpriteConfigurationInElement(projectElement);

    gd::Project readProject;
    readProject.AddPlatform(platform);
    readProject.UnserializeFrom(projectElement);
    CheckSpriteConfiguration(readProject);
  }
}