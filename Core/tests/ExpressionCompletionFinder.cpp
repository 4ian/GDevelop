/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionCompletionFinder.h"

#include "DummyPlatform.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/Project.h"
#include "catch.hpp"

TEST_CASE("ExpressionCompletionFinder", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto& layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);

  gd::ObjectsContainersList objectsContainersList = gd::ObjectsContainersList::
      MakeNewObjectsContainersListForProjectAndLayout(project, layout1);

  gd::ExpressionParser2 parser;

  auto getCompletionsFor = [&](const gd::String& type,
                               const gd::String& expression,
                               size_t location) {
    auto node = parser.ParseExpression(expression);
    REQUIRE(node != nullptr);
    return gd::ExpressionCompletionFinder::GetCompletionDescriptionsFor(
        platform, objectsContainersList, type, *node, location);
  };

  const std::vector<gd::ExpressionCompletionDescription>
      expectedEmptyCompletions;

  SECTION("Identifier") {
    SECTION("Object or expression completions when type is string") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject("string", "My", 0, 2),
          gd::ExpressionCompletionDescription::ForExpression(
              "string", "My", 0, 2)};
      REQUIRE(getCompletionsFor("string", "My", 0) == expectedCompletions);
      REQUIRE(getCompletionsFor("string", "My", 1) == expectedCompletions);
      REQUIRE(getCompletionsFor("string", "My", 2) == expectedEmptyCompletions);
    }
    SECTION("Object or expression completions when type is number") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject("number", "My", 0, 2),
          gd::ExpressionCompletionDescription::ForExpression(
              "number", "My", 0, 2)};
      REQUIRE(getCompletionsFor("number", "My", 0) == expectedCompletions);
      REQUIRE(getCompletionsFor("number", "My", 1) == expectedCompletions);
      REQUIRE(getCompletionsFor("number", "My", 2) == expectedEmptyCompletions);
    }
    SECTION("Object or expression completions when type is number|string") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject(
              "number|string", "My", 0, 2),
          gd::ExpressionCompletionDescription::ForExpression(
              "number|string", "My", 0, 2)};
      REQUIRE(getCompletionsFor("number|string", "My", 0) ==
              expectedCompletions);
      REQUIRE(getCompletionsFor("number|string", "My", 1) ==
              expectedCompletions);
      REQUIRE(getCompletionsFor("number|string", "My", 2) ==
              expectedEmptyCompletions);
    }
    SECTION("Object or expression completions in a variable name") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject("string", "My", 0, 2),
          gd::ExpressionCompletionDescription::ForExpression(
              "string", "My", 0, 2)};
      REQUIRE(getCompletionsFor(
                  "number",
                  "MyExtension::GetVariableAsNumber(MyVariable[\"abc\" + My",
                  52) == expectedCompletions);
      REQUIRE(getCompletionsFor(
                  "number",
                  "MyExtension::GetVariableAsNumber(MyVariable[\"abc\" + My",
                  53) == expectedCompletions);
      REQUIRE(getCompletionsFor(
                  "number",
                  "MyExtension::GetVariableAsNumber(MyVariable[\"abc\" + My",
                  54) == expectedEmptyCompletions);
    }
    SECTION("Object or expression completions in a variable index") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject("number", "My", 0, 2),
          gd::ExpressionCompletionDescription::ForExpression(
              "number", "My", 0, 2)};
      REQUIRE(getCompletionsFor(
                  "number",
                  "MyExtension::GetVariableAsNumber(MyVariable[12345 + My",
                  52) == expectedCompletions);
      REQUIRE(getCompletionsFor(
                  "number",
                  "MyExtension::GetVariableAsNumber(MyVariable[12345 + My",
                  53) == expectedCompletions);
      REQUIRE(getCompletionsFor(
                  "number",
                  "MyExtension::GetVariableAsNumber(MyVariable[12345 + My",
                  54) == expectedEmptyCompletions);
    }
    SECTION("Object when type is an object") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject("object", "My", 0, 2)};
      REQUIRE(getCompletionsFor("object", "My", 0) == expectedCompletions);
      REQUIRE(getCompletionsFor("object", "My", 1) == expectedCompletions);
      REQUIRE(getCompletionsFor("object", "My", 2) == expectedEmptyCompletions);
    }

    SECTION("Object when type is an object (alternate type)") {
      // Also test alternate types also considered as objects (but that can
      // result in different code generation):
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject(
              "objectPtr", "My", 0, 2)};
      REQUIRE(getCompletionsFor("objectPtr", "My", 0) == expectedCompletions);
      REQUIRE(getCompletionsFor("objectPtr", "My", 1) == expectedCompletions);
      REQUIRE(getCompletionsFor("objectPtr", "My", 2) ==
              expectedEmptyCompletions);
    }
  }
  SECTION("Operator (number)") {
    REQUIRE(getCompletionsFor("number", "1 + ", 1) == expectedEmptyCompletions);
    REQUIRE(getCompletionsFor("number", "1 + ", 2) == expectedEmptyCompletions);
    REQUIRE(getCompletionsFor("number", "1 + ", 3) == expectedEmptyCompletions);
  }
  SECTION("Operator (string)") {
    REQUIRE(getCompletionsFor("string", "\"a\" + ", 3) ==
            expectedEmptyCompletions);
    REQUIRE(getCompletionsFor("string", "\"a\" + ", 4) ==
            expectedEmptyCompletions);
    REQUIRE(getCompletionsFor("string", "\"a\" + ", 5) ==
            expectedEmptyCompletions);
  }

  SECTION("Free function") {
    SECTION("Test 1") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForExpression(
              "string", "Function", 0, 8)};
      std::vector<gd::ExpressionCompletionDescription> expectedExactCompletions{
          gd::ExpressionCompletionDescription::ForExpression(
              "string", "Function", 0, 8)
              .SetIsExact(true)};
      REQUIRE(getCompletionsFor("string", "Function(", 0) ==
              expectedCompletions);
      REQUIRE(getCompletionsFor("string", "Function(", 1) ==
              expectedCompletions);
      REQUIRE(getCompletionsFor("string", "Function(", 7) ==
              expectedCompletions);
      REQUIRE(getCompletionsFor("string", "Function(", 8) ==
              expectedExactCompletions);
      REQUIRE(getCompletionsFor("string", "Function(", 9) ==
              expectedEmptyCompletions);
      REQUIRE(getCompletionsFor("string", "Function()", 9) ==
              expectedExactCompletions);
    }
    SECTION("Unknown function, test with arguments") {
      REQUIRE(getCompletionsFor("string", "Function(1", 9) ==
              expectedEmptyCompletions);
      REQUIRE(getCompletionsFor("string", "Function(\"", 9) ==
              expectedEmptyCompletions);

      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForObject("unknown", "a", 9, 10),
          gd::ExpressionCompletionDescription::ForExpression(
              "unknown", "a", 9, 10)};
      REQUIRE(getCompletionsFor("string", "Function(a", 9) ==
              expectedCompletions);
    }
    SECTION("Function with a Variable as argument") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForVariable(
              "scenevar", "myVar", 33, 38)};
      REQUIRE(getCompletionsFor("number",
                                "MyExtension::GetVariableAsNumber(myVar",
                                33) == expectedCompletions);
    }
    SECTION("Object function with a Variable as argument") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForVariable(
              "objectvar", "myVar", 35, 40, "MyObject")};
      getCompletionsFor(
          "number", "MyObject.GetObjectVariableAsNumber(myVar", 35);
      REQUIRE(getCompletionsFor("number",
                                "MyObject.GetObjectVariableAsNumber(myVar",
                                35) == expectedCompletions);
    }
    SECTION("Function with a Layer as argument") {
      std::vector<gd::ExpressionCompletionDescription> expectedCompletions{
          gd::ExpressionCompletionDescription::ForText(
              "layer",
              gd::MetadataProvider::GetExpressionMetadata(platform,
                                                          "MyExtension::MouseX")
                  .GetParameter(0),
              "",
              20,
              21,
              false)};
      REQUIRE(getCompletionsFor("number", "MyExtension::MouseX(\"", 20) ==
              expectedCompletions);
    }
  }

  SECTION("Partial object or behavior function") {
    SECTION("Test with string type") {
      std::vector<gd::ExpressionCompletionDescription>
          expectedObjectCompletions{
              gd::ExpressionCompletionDescription::ForObject(
                  "string", "MyObject", 0, 8)};
      std::vector<gd::ExpressionCompletionDescription>
          expectedBehaviorOrFunctionCompletions{
              gd::ExpressionCompletionDescription::ForVariable(
                  "string", "Func", 9, 13, "MyObject"),
              gd::ExpressionCompletionDescription::ForBehavior(
                  "Func", 9, 13, "MyObject"),
              gd::ExpressionCompletionDescription::ForExpression(
                  "string", "Func", 9, 13, "MyObject")};
      REQUIRE(getCompletionsFor("string", "MyObject.Func", 0) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func", 7) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func", 8) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func", 9) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func", 12) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func", 13) ==
              expectedEmptyCompletions);
    }
    SECTION("Test with 'number|string' type") {
      std::vector<gd::ExpressionCompletionDescription>
          expectedObjectCompletions{
              gd::ExpressionCompletionDescription::ForObject(
                  "number|string", "MyObject", 0, 8)};
      std::vector<gd::ExpressionCompletionDescription>
          expectedBehaviorOrFunctionCompletions{
              gd::ExpressionCompletionDescription::ForVariable(
                  "number|string", "Func", 9, 13, "MyObject"),
              gd::ExpressionCompletionDescription::ForBehavior(
                  "Func", 9, 13, "MyObject"),
              gd::ExpressionCompletionDescription::ForExpression(
                  "number|string", "Func", 9, 13, "MyObject")};
      REQUIRE(getCompletionsFor("number|string", "MyObject.Func", 0) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("number|string", "MyObject.Func", 7) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("number|string", "MyObject.Func", 8) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("number|string", "MyObject.Func", 9) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("number|string", "MyObject.Func", 12) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("number|string", "MyObject.Func", 13) ==
              expectedEmptyCompletions);
    }
  }

  SECTION("Object function") {
    SECTION("Test 1") {
      std::vector<gd::ExpressionCompletionDescription>
          expectedObjectCompletions{
              gd::ExpressionCompletionDescription::ForObject(
                  "string", "MyObject", 0, 8)};
      std::vector<gd::ExpressionCompletionDescription>
          expectedBehaviorOrFunctionCompletions{
              gd::ExpressionCompletionDescription::ForBehavior(
                  "Func", 9, 13, "MyObject"),
              gd::ExpressionCompletionDescription::ForExpression(
                  "string", "Func", 9, 13, "MyObject")};
      std::vector<gd::ExpressionCompletionDescription>
          expectedExactFunctionCompletions{
              gd::ExpressionCompletionDescription::ForExpression(
                  "string", "Func", 9, 13, "MyObject")
                  .SetIsExact(true)};
      REQUIRE(getCompletionsFor("string", "MyObject.Func(", 0) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func(", 7) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func(", 8) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func(", 9) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func(", 12) ==
              expectedBehaviorOrFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func(", 13) ==
              expectedExactFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func(", 14) ==
              expectedEmptyCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.Func()", 14) ==
              expectedExactFunctionCompletions);
    }
  }

  SECTION("Partial behavior function") {
    SECTION("Test 1") {
      std::vector<gd::ExpressionCompletionDescription>
          expectedObjectCompletions{
              gd::ExpressionCompletionDescription::ForObject(
                  "string", "MyObject", 0, 8)};
      std::vector<gd::ExpressionCompletionDescription>
          expectedBehaviorCompletions{
              gd::ExpressionCompletionDescription::ForBehavior(
                  "MyBehavior", 9, 19, "MyObject")};
      std::vector<gd::ExpressionCompletionDescription>
          expectedFunctionCompletions{
              gd::ExpressionCompletionDescription::ForExpression(
                  "string", "Func", 21, 25, "MyObject", "MyBehavior")};
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 0) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 7) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 8) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 9) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 18) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 19) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 20) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 21) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func", 23) ==
              expectedFunctionCompletions);
    }
    SECTION("Test 2") {
      std::vector<gd::ExpressionCompletionDescription>
          expectedObjectCompletions{
              gd::ExpressionCompletionDescription::ForObject(
                  "string", "MyObject", 0, 8)};
      std::vector<gd::ExpressionCompletionDescription>
          expectedBehaviorCompletions{
              gd::ExpressionCompletionDescription::ForBehavior(
                  "MyBehavior", 9, 19, "MyObject")};
      std::vector<gd::ExpressionCompletionDescription>
          expectedFunctionCompletions{
              gd::ExpressionCompletionDescription::ForExpression(
                  "string", "", 21, 21, "MyObject", "MyBehavior")};
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::", 0) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::", 7) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::", 8) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::", 9) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::", 18) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::", 19) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::", 20) ==
              expectedFunctionCompletions);
    }
  }

  SECTION("Behavior function") {
    SECTION("Test 1") {
      std::vector<gd::ExpressionCompletionDescription>
          expectedObjectCompletions{
              gd::ExpressionCompletionDescription::ForObject(
                  "string", "MyObject", 0, 8)};
      std::vector<gd::ExpressionCompletionDescription>
          expectedBehaviorCompletions{
              gd::ExpressionCompletionDescription::ForBehavior(
                  "MyBehavior", 9, 19, "MyObject")};
      std::vector<gd::ExpressionCompletionDescription>
          expectedFunctionCompletions{
              gd::ExpressionCompletionDescription::ForExpression(
                  "string", "Func", 21, 25, "MyObject", "MyBehavior")};
      std::vector<gd::ExpressionCompletionDescription>
          expectedExactFunctionCompletions{
              gd::ExpressionCompletionDescription::ForExpression(
                  "string", "Func", 21, 25, "MyObject", "MyBehavior")
                  .SetIsExact(true)};
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 0) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 7) ==
              expectedObjectCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 8) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 9) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 18) ==
              expectedBehaviorCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 19) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 20) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 21) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 22) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 23) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 24) ==
              expectedFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 25) ==
              expectedExactFunctionCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func(", 26) ==
              expectedEmptyCompletions);
      REQUIRE(getCompletionsFor("string", "MyObject.MyBehavior::Func()", 26) ==
              expectedExactFunctionCompletions);
    }
  }
}
