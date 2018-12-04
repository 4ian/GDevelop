/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "DummyPlatform.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "catch.hpp"

TEST_CASE("ExpressionCodeGenerator", "[common][events]") {
  gd::Project project;
  gd::Platform platform;
  SetupProjectWithDummyPlatform(project, platform);
  auto &layout1 = project.InsertNewLayout("Layout1", 0);
  layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);

  gd::ExpressionParser2 parser(platform, project, layout1);

  unsigned int maxDepth = 0;
  gd::EventsCodeGenerationContext context(&maxDepth);
  gd::EventsCodeGenerator codeGenerator(project, layout1, platform);

  SECTION("Valid text generation") {
    {
      auto node = parser.ParseExpression("string", "\"hello world\"");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello world\"");
    }
    {
      auto node = parser.ParseExpression("string", "\"hello\"  +   \"world\" ");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello\" + \"world\"");
    }
  }

  SECTION("Valid number generation") {
    {
      auto node = parser.ParseExpression("number", "12.45");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.45");
    }
    {
      auto node = parser.ParseExpression("number", "12.5 + -2.  /   (.3)");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.5 + -2. / (.3)");
    }
  }

  SECTION("Invalid operators generation") {
    // TODO: Should any error return directly 0 or ""?
    {
      auto node = parser.ParseExpression("number", "12.45 +");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.45 + 0");
    }
    {
      auto node = parser.ParseExpression("number", "12.45 * *");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.45 * 0 * 0");
    }
  }

  SECTION("Valid function calls") {
    {
      auto node =
          parser.ParseExpression("number", " 1 /  MyExtension::GetNumber()");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "1 / getNumber()");
    }
    {
      auto node = parser.ParseExpression(
          "number", "MyExtension::GetNumberWith2Params(12, \"hello world\")");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(12, \"hello world\")");
    }
    {
      auto node =
          parser.ParseExpression("number",
                                 "MyExtension::GetNumberWith2Params("
                                 "MyExtension::GetNumber(), \"hello world\")");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(getNumber(), \"hello world\")");
    }
  }
  SECTION("Invalid function calls") {
    {
      auto node = parser.ParseExpression(
          "number",
          "MyExtension::GetNumberWith2Params(MyExtension::GetNumber())");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(getNumber(), /* Error during generation, "
              "parameter not existing in the nodes */ \"\")");
    }
    {
      auto node = parser.ParseExpression("number", "MyExtension::Idontexist()");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "/* Error during generation, function not found */ 0");
    }
    {
      auto node = parser.ParseExpression(
          "number", "MyExtension::GetNumberWith2Params(1, \"2\", getNumber())");
      gd::ExpressionCodeGenerator expressionCodeGenerator(codeGenerator,
                                                          context);

      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(1, \"2\")");
    }
  }
}
