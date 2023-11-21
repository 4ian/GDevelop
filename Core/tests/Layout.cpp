/*
 * GDevelop Core
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering layout content helper methods.
 */
#include "GDCore/Project/Layout.h"
#include "DummyPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

using namespace gd;

TEST_CASE("Layout", "[common]") {

  SECTION("Find the type of a behavior in a object") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
    object.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    REQUIRE(GetTypeOfBehaviorInObjectOrGroup(project, layout, "MyObject",
                                             "MyBehavior", true) ==
            "MyExtension::MyBehavior");
  }

  SECTION("Give an empty type for an object that doesn't have the behavior") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

    REQUIRE(GetTypeOfBehaviorInObjectOrGroup(project, layout, "MyObject",
                                             "MyBehavior", true) == "");
  }

  SECTION("Find the type of a behavior in a group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    gd::Object &object2 =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject2", 0);
    object2.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");

    auto &group = layout.GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    REQUIRE(GetTypeOfBehaviorInObjectOrGroup(project, layout, "MyGroup",
                                             "MyBehavior", true) ==
            "MyExtension::MyBehavior");
  }

  SECTION("Give an empty type for a group with an object missing the behavior") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    gd::Object &object2 =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject2", 0);
    // object2 doesn't have the behavior.

    auto &group = layout.GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    REQUIRE(GetTypeOfBehaviorInObjectOrGroup(project, layout, "MyGroup",
                                             "MyBehavior", true) == "");
  }

  SECTION("Give an empty type for a group with behaviors of same name but different types") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    gd::Object &object1 =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject1", 0);
    object1.AddNewBehavior(project, "MyExtension::MyBehavior", "MyBehavior");
    gd::Object &object2 =
        layout.InsertNewObject(project, "MyExtension::Sprite", "MyObject2", 0);
    object2.AddNewBehavior(project, "MyExtension::MyOtherBehavior",
                           "MyBehavior");

    auto &group = layout.GetObjectGroups().InsertNew("MyGroup", 0);
    group.AddObject(object1.GetName());
    group.AddObject(object2.GetName());

    REQUIRE(GetTypeOfBehaviorInObjectOrGroup(project, layout, "MyGroup",
                                             "MyBehavior", true) == "");
  }

  SECTION("Give an empty type for an empty group") {
    gd::Platform platform;
    gd::Project project;
    SetupProjectWithDummyPlatform(project, platform);

    gd::Layout &layout = project.InsertNewLayout("Scene", 0);
    auto &group = layout.GetObjectGroups().InsertNew("MyGroup", 0);

    REQUIRE(GetTypeOfBehaviorInObjectOrGroup(project, layout, "MyGroup",
                                             "MyBehavior", true) == "");
  }
}