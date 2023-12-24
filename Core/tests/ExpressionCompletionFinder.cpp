/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionCompletionFinder.h"

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

TEST_CASE("ExpressionCompletionFinder", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto& layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.GetVariables().InsertNew("myVariable");
  auto& object1 =
      layout1.InsertNewObject(project, "MyExtension::Sprite", "MyObject", 0);
  object1.GetVariables().InsertNew("myObjectVariable");

  gd::ProjectScopedContainers projectScopedContainers =
      gd::ProjectScopedContainers::
          MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);

  gd::ExpressionParser2 parser;

  auto getCompletionsFor = [&](const gd::String& type,
                               const gd::String& expression,
                               size_t location) {
    auto node = parser.ParseExpression(expression);
    REQUIRE(node != nullptr);
    auto completions =
        gd::ExpressionCompletionFinder::GetCompletionDescriptionsFor(
            platform, projectScopedContainers, type, *node, location);

    std::vector<gd::String> completionsAsString;
    for (const auto& completion : completions) {
      completionsAsString.push_back(completion.ToString());
    }
    return completionsAsString;
  };

  const std::vector<gd::String> expectedEmptyCompletions;

  SECTION("Identifier") {
    SECTION("Object or expression completions when type is string") {
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 3, no type, 1, no prefix, myVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "My", 0, 2).ToString()
      };
      // clang-format on
      REQUIRE(getCompletionsFor("string", "My", 0) == expectedCompletions);
      REQUIRE(getCompletionsFor("string", "My", 1) == expectedCompletions);
      REQUIRE(getCompletionsFor("string", "My", 2) == expectedEmptyCompletions);
    }
    SECTION("Object or expression completions when type is number") {
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, number, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 3, no type, 1, no prefix, myVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("number", "My", 0, 2).ToString()
      };
      // clang-format on
      REQUIRE(getCompletionsFor("number", "My", 0) == expectedCompletions);
      REQUIRE(getCompletionsFor("number", "My", 1) == expectedCompletions);
      REQUIRE(getCompletionsFor("number", "My", 2) == expectedEmptyCompletions);
    }
    SECTION("Object or expression completions when type is number|string") {
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, number|string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 3, no type, 1, no prefix, myVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("number|string", "My", 0, 2).ToString()
      };
      // clang-format on
      REQUIRE(getCompletionsFor("number|string", "My", 0) ==
              expectedCompletions);
      REQUIRE(getCompletionsFor("number|string", "My", 1) ==
              expectedCompletions);
      REQUIRE(getCompletionsFor("number|string", "My", 2) ==
              expectedEmptyCompletions);
    }
    SECTION("Object or expression completions in a variable name") {
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 3, no type, 1, no prefix, myVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "My", 0, 2).ToString()
      };
      // clang-format on
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
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, number, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 3, no type, 1, no prefix, myVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("number", "My", 0, 2).ToString()
      };
      // clang-format on
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
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, object, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
      };
      // clang-format on
      REQUIRE(getCompletionsFor("object", "My", 0) == expectedCompletions);
      REQUIRE(getCompletionsFor("object", "My", 1) == expectedCompletions);
      REQUIRE(getCompletionsFor("object", "My", 2) == expectedEmptyCompletions);
    }

    SECTION("Object when type is an object (alternate type)") {
      // Also test alternate types also considered as objects (but that can
      // result in different code generation):
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, objectPtr, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
      };
      // clang-format on
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
      std::vector<gd::String> expectedCompletions{
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix(
              "string", "Function", 0, 8)
              .ToString()};
      std::vector<gd::String> expectedExactCompletions{
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix(
              "string", "Function", 0, 8)
              .SetIsExact(true)
              .ToString()};
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

      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 0, unknown, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }",
          "{ 3, no type, 1, no prefix, myVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("unknown", "My", 9, 10).ToString()
      };
      // clang-format on
      REQUIRE(getCompletionsFor("string", "Function(My", 10) ==
              expectedCompletions);
    }
    SECTION("Function with a Variable as argument") {
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 3, no type, 1, no prefix, myVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
      };
      // clang-format on
      REQUIRE(getCompletionsFor("number",
                                "MyExtension::GetVariableAsNumber(myVar",
                                33) == expectedCompletions);
    }
    SECTION("Object function with a Variable as argument") {
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          "{ 3, no type, 1, no prefix, myObjectVariable, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, no object configuration }",
      };
      // clang-format on
      REQUIRE(getCompletionsFor("number",
                                "MyObject.GetObjectVariableAsNumber(myObj",
                                35) == expectedCompletions);
    }
    SECTION("Function with a Layer as argument") {
      // clang-format off
      std::vector<gd::String> expectedCompletions{
          gd::ExpressionCompletionDescription::ForTextWithPrefix(
              "layer",
              gd::MetadataProvider::GetExpressionMetadata(platform, "MyExtension::MouseX").GetParameter(0),
              "",
              20,
              21,
              false)
              .ToString()
      };
      // clang-format on
      REQUIRE(getCompletionsFor("number", "MyExtension::MouseX(\"", 20) ==
              expectedCompletions);
    }
  }

  SECTION("Partial object or behavior function") {
    SECTION("Test with string type") {
      // clang-format off
      std::vector<gd::String> expectedObjectCompletions{
          "{ 0, string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }"
      };
      std::vector<gd::String> expectedBehaviorOrFunctionCompletions{
          gd::ExpressionCompletionDescription::ForBehaviorWithPrefix("Func", 9, 13, "MyObject").ToString(),
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "Func", 9, 13, "MyObject").ToString()
      };
      // clang-format on
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
      // clang-format off
      std::vector<gd::String> expectedObjectCompletions{
          "{ 0, number|string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }"
      };
      std::vector<gd::String> expectedBehaviorOrFunctionCompletions{
          gd::ExpressionCompletionDescription::ForBehaviorWithPrefix("Func", 9, 13, "MyObject").ToString(),
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("number|string", "Func", 9, 13, "MyObject").ToString()
      };
      // clang-format on
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
      // clang-format off
      std::vector<gd::String> expectedObjectCompletions{
          "{ 0, string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }"
      };
      std::vector<gd::String> expectedBehaviorOrFunctionCompletions{
          gd::ExpressionCompletionDescription::ForBehaviorWithPrefix("Func", 9, 13, "MyObject").ToString(),
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "Func", 9, 13, "MyObject").ToString()
      };
      std::vector<gd::String> expectedExactFunctionCompletions{
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "Func", 9, 13, "MyObject").SetIsExact(true).ToString()
      };
      // clang-format on
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
      // clang-format off
      std::vector<gd::String> expectedObjectCompletions{
          "{ 0, string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }"
      };
      std::vector<gd::String> expectedBehaviorCompletions{
          gd::ExpressionCompletionDescription::ForBehaviorWithPrefix("MyBehavior", 9, 19, "MyObject").ToString()};
      std::vector<gd::String> expectedFunctionCompletions{
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "Func", 21, 25, "MyObject", "MyBehavior").ToString()
      };
      // clang-format on
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
      // clang-format off
      std::vector<gd::String> expectedObjectCompletions{
          "{ 0, string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }"
      };
      std::vector<gd::String> expectedBehaviorCompletions{
          gd::ExpressionCompletionDescription::ForBehaviorWithPrefix("MyBehavior", 9, 19, "MyObject").ToString()
      };
      std::vector<gd::String> expectedFunctionCompletions{
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "", 21, 21, "MyObject", "MyBehavior").ToString()
      };
      // clang-format on
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
      // clang-format off
      std::vector<gd::String> expectedObjectCompletions{
          "{ 0, string, 1, no prefix, MyObject, no object name, no behavior name, non-exact, not last parameter, no parameter metadata, with object configuration }"
      };
      std::vector<gd::String> expectedBehaviorCompletions{
          gd::ExpressionCompletionDescription::ForBehaviorWithPrefix("MyBehavior", 9, 19, "MyObject").ToString()
      };
      std::vector<gd::String> expectedFunctionCompletions{
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "Func", 21, 25, "MyObject", "MyBehavior").ToString()
      };
      std::vector<gd::String> expectedExactFunctionCompletions{
          gd::ExpressionCompletionDescription::ForExpressionWithPrefix("string", "Func", 21, 25, "MyObject", "MyBehavior").SetIsExact(true).ToString()
      };
      // clang-format on
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
