/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionSyntaxColoringHelper.h"

#include <vector>

#include "DummyPlatform.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "catch.hpp"

TEST_CASE("ExpressionSyntaxColoringHelper", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &scene = project.InsertNewLayout("Layout1", 0);
  scene.GetVariables().InsertNew("MySceneVariable");
  auto &object1 = scene.GetObjects().InsertNewObject(
      project, "MyExtension::Sprite", "MyObject", 0);
  object1.GetVariables().InsertNew("MyObjectVariable");

  gd::ProjectScopedContainers projectScopedContainers =
      gd::ProjectScopedContainers::
          MakeNewProjectScopedContainersForProjectAndLayout(project, scene);

  gd::ExpressionParser2 parser;

  auto getColorationsFor = [&](const gd::String &type,
                               const gd::String &expression) {
    auto node = parser.ParseExpression(expression);
    REQUIRE(node != nullptr);
    auto colorations =
        gd::ExpressionSyntaxColoringHelper::GetColorationDescriptionsFor(
            platform, projectScopedContainers, type, *node);
    std::vector<gd::String> colorationsAsString;
    for (const auto &coloration : colorations) {
      colorationsAsString.push_back(coloration.ToString());
    }
    return colorationsAsString;
  };

  SECTION("Can colorize scene variables") {
    // clang-format off
    std::vector<gd::String> expectedCompletions{
        "Variable [0 15[",
    };
    // clang-format on
    REQUIRE(getColorationsFor("number", "MySceneVariable") ==
            expectedCompletions);
  }
  SECTION("Can colorize variable with children") {
    // clang-format off
    std::vector<gd::String> expectedCompletions{
        "Variable [0 31[",
    };
    // clang-format on
    REQUIRE(getColorationsFor("number", "MySceneVariable.MyChild.MyChild") ==
            expectedCompletions);
  }
  SECTION("Can colorize variable with bracket access") {
    // clang-format off
    std::vector<gd::String> expectedCompletions{
        "Variable [0 16[",
        "String [16 25[",
        "Variable [25 26[",
    };
    // clang-format on
    REQUIRE(getColorationsFor("number", "MySceneVariable[\"MyChild\"]") ==
            expectedCompletions);
  }
  SECTION("Can colorize object variables") {
    // clang-format off
    std::vector<gd::String> expectedCompletions{
        "Object [0 8[",
        "Variable [9 25[",
    };
    // clang-format on
    REQUIRE(getColorationsFor("number", "MyObject.MyObjectVariable") ==
            expectedCompletions);
  }
  SECTION("Can colorize object function") {
    // clang-format off
    std::vector<gd::String> expectedCompletions{
        "Object [0 8[",
    };
    // clang-format on
    REQUIRE(getColorationsFor("number", "MyObject.MyFunction()") ==
            expectedCompletions);
  }
  SECTION("Can colorize function parameters") {
    // clang-format off
    std::vector<gd::String> expectedCompletions{
        "String [14 23[",
        "Number [25 26[",
    };
    // clang-format on
    REQUIRE(getColorationsFor("number", "CameraCenterX(\"MyLayer\", 0)") ==
            expectedCompletions);
  }
  SECTION("Can colorize numbers and operators") {
    // clang-format off
    std::vector<gd::String> expectedCompletions{
        "Operator [0 1[",
        "Number [1 4[",
        "Operator [4 7[",
        "Number [7 10[",
        "Operator [10 14[",
        "Number [14 15[",
    };
    // clang-format on
    REQUIRE(getColorationsFor("number", "(123 + 456) * 2") ==
            expectedCompletions);
  }
}
