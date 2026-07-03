/*
 * GDevelop Core
 * Copyright 2008-2026 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
/**
 * @file Tests covering common features of GDevelop Core.
 */
#include "GDCore/IDE/Project/ResourcesRenamer.h"

#include "DummyPlatform.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/Events/UsedExtensionsFinder.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("UsedExtensionsFinder", "[common]") {
  SECTION("It only finds the base extension in an empty project") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);

    auto &results = gd::UsedExtensionsFinder::ScanProject(project);
    auto &usedExtensionsSet = results.GetUsedExtensions();

    std::vector<gd::String> usedExtensions;
    usedExtensions.assign(usedExtensionsSet.begin(), usedExtensionsSet.end());

    REQUIRE(usedExtensions.size() == 1);
    REQUIRE(usedExtensions[0] == "BuiltinObject");
  }

  SECTION("It can find an extension usage from an action") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &scene = project.InsertNewLayout("MyScene", 0);

    gd::StandardEvent event;
    gd::Instruction instruction;
    instruction.SetType("MyExtension::DoSomething");
    instruction.SetParametersCount(1);
    instruction.SetParameter(0, gd::Expression("0"));
    event.GetActions().Insert(instruction);
    scene.GetEvents().InsertEvent(event);

    auto &results = gd::UsedExtensionsFinder::ScanProject(project);
    auto &usedExtensionsSet = results.GetUsedExtensions();

    std::vector<gd::String> usedExtensions;
    usedExtensions.assign(usedExtensionsSet.begin(), usedExtensionsSet.end());

    REQUIRE(usedExtensions.size() == 2);
    REQUIRE(usedExtensions[0] == "BuiltinObject");
    REQUIRE(usedExtensions[1] == "MyExtension");
  }

  SECTION("It can find an extension usage from an object") {
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &scene = project.InsertNewLayout("MyScene", 0);
    auto &object = scene.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MySprite", 0);

    auto &results = gd::UsedExtensionsFinder::ScanProject(project);
    auto &usedExtensionsSet = results.GetUsedExtensions();

    std::vector<gd::String> usedExtensions;
    usedExtensions.assign(usedExtensionsSet.begin(), usedExtensionsSet.end());

    REQUIRE(usedExtensions.size() == 2);
    REQUIRE(usedExtensions[0] == "BuiltinObject");
    REQUIRE(usedExtensions[1] == "MyExtension");
  }

  // clang-format off
  SECTION("It doesn't return empty extension name when an object variable is used in an expression") {
    // clang-format on
    gd::Project project;
    gd::Platform platform;
    SetupProjectWithDummyPlatform(project, platform);
    auto &scene = project.InsertNewLayout("MyScene", 0);
    auto &object = scene.GetObjects().InsertNewObject(
        project, "MyExtension::Sprite", "MySprite", 0);
    object.GetVariables().InsertNew("MyVariable", 0);

    gd::StandardEvent event;
    gd::Instruction instruction;
    instruction.SetType("MyExtension::DoSomething");
    instruction.SetParametersCount(1);
    instruction.SetParameter(0, gd::Expression("MySprite.MyVariable"));
    event.GetActions().Insert(instruction);
    scene.GetEvents().InsertEvent(event);

    auto &results = gd::UsedExtensionsFinder::ScanProject(project);
    auto &usedExtensionsSet = results.GetUsedExtensions();

    std::vector<gd::String> usedExtensions;
    usedExtensions.assign(usedExtensionsSet.begin(), usedExtensionsSet.end());

    REQUIRE(usedExtensions.size() == 2);
    REQUIRE(usedExtensions[0] == "BuiltinObject");
    REQUIRE(usedExtensions[1] == "MyExtension");
  }
}