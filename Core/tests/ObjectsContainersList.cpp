/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering layout content helper methods.
 */
#include "GDCore/Project/ObjectsContainersList.h"
#include "DummyPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/MakeUnique.h"
#include "catch.hpp"

#include <algorithm>
#include <vector>

using namespace gd;

TEST_CASE("ObjectContainersList (HasObjectOrGroupNamed)", "[common]") {

  SECTION("Can check an object exists") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.HasObjectOrGroupNamed("MyObject"));
    REQUIRE(!objectsContainersList.HasObjectOrGroupNamed("MyWrongObject"));
  }

  SECTION("Can check a group exists") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.HasObjectOrGroupNamed("MyGroup"));
  }
}

TEST_CASE("ObjectContainersList (HasObjectOrGroupWithVariableNamed)", "[common]") {

  SECTION("Can check a variable exists in an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);
    object.GetVariables().InsertNew("MyVariable", 0);

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.HasObjectOrGroupWithVariableNamed("MyObject", "MyVariable"));
    REQUIRE(!objectsContainersList.HasObjectOrGroupWithVariableNamed("MyObject", "MyWrongVariable"));
  }

  SECTION("Can check a variable exists in a group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    object1.GetVariables().InsertNew("MyVariable", 0);
    // This variable is only in one of the 2 objects.
    object1.GetVariables().InsertNew("MyOtherVariable", 0);
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject2", 0);
    object1.GetVariables().InsertNew("MyVariable", 0);

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.HasObjectOrGroupWithVariableNamed("MyGroup", "MyVariable"));
    REQUIRE(!objectsContainersList.HasObjectOrGroupWithVariableNamed("MyGroup", "MyWrongVariable"));
  }
}

TEST_CASE("ObjectContainersList (GetTypeOfObject)", "[common]") {

  SECTION("Find the type of an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfObject("MyObject") == "MyExtension::Sprite");
  }

  SECTION("Find the object type of a group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject2", 0);

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfObject("MyGroup") == "MyExtension::Sprite");
  }

  SECTION("Give an empty type for groups with mixed object types") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "FakeObjectWithDefaultBehavior", "MyObject2", 0);

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfObject("MyGroup") == "");
  }

  SECTION("Give an empty type for an empty group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfObject(
                "MyGroup") == "");
  }
}

TEST_CASE("ObjectContainersList (GetTypeOfBehaviorInObjectOrGroup)",
          "[common]") {

  SECTION("Find the type of a behavior in an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
                "MyObject", "MyBehavior", true) == "MyExtension::MyBehavior");
  }

  SECTION("Give an empty type for an object that doesn't have the behavior") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
                "MyObject", "MyBehavior", true) == "");
  }

  SECTION("Find the type of a behavior in a group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject2", 0);
    object2.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
                "MyGroup", "MyBehavior", true) == "MyExtension::MyBehavior");
  }

  SECTION(
      "Give an empty type for a group with an object missing the behavior") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject2", 0);
    // object2 doesn't have the behavior.

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
                "MyGroup", "MyBehavior", true) == "");
  }

  SECTION("Give an empty type for a group with behaviors of same name but different types") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject2", 0);
    object2.AddNewBehavior(project, "MyExtension::MyOtherBehavior",
                           "MyBehavior");

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
                "MyGroup", "MyBehavior", true) == "");
  }

  SECTION("Give an empty type for an empty group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
                "MyGroup", "MyBehavior", true) == "");
  }
}

TEST_CASE("ObjectContainersList (HasBehaviorInObjectOrGroup)", "[common]") {

  SECTION("Can check a behavior exists in an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.HasBehaviorInObjectOrGroup("MyObject", "MyBehavior"));
    REQUIRE(!objectsContainersList.HasBehaviorInObjectOrGroup("MyObject", "MyWrongBehavior"));
  }

  SECTION("Can check a behavior exists in a group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    // This behavior is only in one of the 2 objects.
    object1.AddNewBehavior(project, "MyExtension::MyOtherBehavior",
                           "MyOtherBehavior");
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject2", 0);
    object2.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    REQUIRE(objectsContainersList.HasBehaviorInObjectOrGroup("MyGroup", "MyBehavior"));
    REQUIRE(!objectsContainersList.HasBehaviorInObjectOrGroup("MyGroup", "MyOtherBehavior"));
  }
}

TEST_CASE("ObjectContainersList (GetBehaviorsOfObject)", "[common]") {

  SECTION("Find the behaviors in an object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    const auto behaviors =
        objectsContainersList.GetBehaviorsOfObject("MyObject", true);
    REQUIRE(behaviors.size() == 1);
    REQUIRE(behaviors[0] == "MyBehavior");
  }

  SECTION("Find the behaviors in a group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    // This behavior is only in one of the 2 objects.
    object1.AddNewBehavior(project, "MyExtension::MyOtherBehavior",
                           "MyOtherBehavior");
    gd::Object &object2 = layout.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MyObject2", 0);
    object2.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    const auto behaviors =
        objectsContainersList.GetBehaviorsOfObject("MyGroup", true);
    REQUIRE(behaviors.size() == 1);
    REQUIRE(behaviors[0] == "MyBehavior");
  }
}

namespace {

gd::SpriteObject BuildSpriteWithAnimations(gd::String animationName1 = "!",
                                           gd::String animationName2 = "!",
                                           gd::String animationName3 = "!") {
  gd::SpriteObject configuration;
  gd::SpriteAnimationList &animations = configuration.GetAnimations();
  if (animationName1 != "!") {
    gd::Animation animation;
    animation.SetName(animationName1);
    animations.AddAnimation(animation);
    if (animationName2 != "!") {
      gd::Animation animation;
      animation.SetName(animationName2);
      animations.AddAnimation(animation);
    }
    if (animationName3 != "!") {
      gd::Animation animation;
      animation.SetName(animationName3);
      animations.AddAnimation(animation);
    }
  }
  return configuration;
}

bool Contains(const std::vector<gd::String> &vector, const gd::String &value) {
    return std::find(vector.begin(), vector.end(), value) !=
            vector.end();
}

} // namespace

TEST_CASE("ObjectContainersList (GetAnimationNamesOfObject)", "[common]") {

  SECTION("Find the animation names in a sprite") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object object("MyObject", "Sprite",
                      gd::make_unique<gd::SpriteObject>(
                          BuildSpriteWithAnimations("Idle", "Run")));
    layout.GetObjects().InsertObject(object, 0);

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    const auto animationNames =
        objectsContainersList.GetAnimationNamesOfObject("MyObject");
    REQUIRE(Contains(animationNames, "Idle"));
    REQUIRE(Contains(animationNames, "Run"));
    REQUIRE(animationNames.size() == 2);
  }

  SECTION("Find the animation names in a group of sprite") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object object1("MyObject1", "Sprite",
                      gd::make_unique<gd::SpriteObject>(
                          BuildSpriteWithAnimations("Idle", "Jump", "Run")));
    layout.GetObjects().InsertObject(object1, 0);
    gd::Object object2("MyObject2", "Sprite",
                      gd::make_unique<gd::SpriteObject>(
                          BuildSpriteWithAnimations("Run", "Idle", "Climb")));
    layout.GetObjects().InsertObject(object2, 0);

    auto &group = layout.GetObjects().GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    auto objectsContainersList = gd::ObjectsContainersList::
        MakeNewObjectsContainersListForProjectAndLayout(project, layout);

    const auto animationNames =
        objectsContainersList.GetAnimationNamesOfObject("MyGroup");
    REQUIRE(Contains(animationNames, "Idle"));
    REQUIRE(Contains(animationNames, "Run"));
    REQUIRE(animationNames.size() == 2);
  }
}
