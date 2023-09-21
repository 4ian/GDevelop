/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include <chrono>
#include <numeric>
#include "DummyPlatform.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "catch.hpp"

TEST_CASE("ExpressionParser2 - Benchmarks", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);

  auto projectScopedContainers = gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);

  gd::ExpressionParser2 parser;

  auto parseExpression = [&parser, &platform, &projectScopedContainers](const gd::String &expression) {
    auto parseExpressionWithType = [&parser, &platform, &projectScopedContainers,
                                    &expression](const gd::String &type) {
      auto node = parser.ParseExpression(expression);
      REQUIRE(node != nullptr);
      gd::ExpressionValidator validator(platform, projectScopedContainers, type);
      node->Visit(validator);
    };

    parseExpressionWithType("number");
    parseExpressionWithType("string");
    parseExpressionWithType("scenevar");
    parseExpressionWithType("globalvar");
    parseExpressionWithType("objectvar");
    parseExpressionWithType("object");
    parseExpressionWithType("objectPtr");
    parseExpressionWithType("unknown");
  };

  auto doBenchmark = [](const gd::String &benchmarkName,
                        const size_t runsCount,
                        std::function<void()> func) {
    std::vector<long long> timesInMicroseconds;

    for (size_t i = 0; i < runsCount; i++) {
      auto start = std::chrono::steady_clock::now();
      func();
      auto end = std::chrono::steady_clock::now();

      timesInMicroseconds.push_back(
          std::chrono::duration_cast<std::chrono::microseconds>(end - start)
              .count());
    }

    std::cout << benchmarkName << " benchmark (" << runsCount << " runs): "
              << (float)std::accumulate(timesInMicroseconds.begin(),
                                        timesInMicroseconds.end(),
                                        0) /
                     (float)runsCount
              << " microseconds" << std::endl;
  };

  SECTION("Parse long expression") {
    doBenchmark("Parse long expression", 10, [&]() {
      REQUIRE_NOTHROW(parseExpression(
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+"
          "MySpriteObject.X()+MySpriteObject.X()/"
          "cos(3.123456789)+MySpriteObject.X()+0"));
    });
  }

  SECTION("Parse long expression") {
    doBenchmark("Long identifier", 100, [&]() {
      REQUIRE_NOTHROW(parseExpression(
          "MyLoooooongIdentifierThatNeverStoooooopsAndContinueAgainAndAgainAndA"
          "gainAndAgainAndAgainAndAgainAndAgainAndAgainAndAgainAndAgainAndAgain"
          "AndAgainAndAgainAndAgainAndAgainAndAgainAndAgainAndAgain"));
    });
  }
}
