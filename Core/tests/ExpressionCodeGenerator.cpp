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
  layout1.InsertNewObject(
      project, "MyExtension::Sprite", "MyOtherSpriteObject", 1);
  layout1.InsertNewObject(project,
                          "MyExtension::FakeObjectWithUnsupportedCapability",
                          "MyFakeObjectWithUnsupportedCapability",
                          2);
  auto &group = layout1.GetObjectGroups().InsertNew("AllObjects");
  group.AddObject("MySpriteObject");
  group.AddObject("MyOtherSpriteObject");
  group.AddObject("MyFakeObjectWithUnsupportedCapability");

  gd::ExpressionParser2 parser;

  unsigned int maxDepth = 0;
  gd::EventsCodeGenerationContext context(&maxDepth);
  gd::EventsCodeGenerator codeGenerator(project, layout1, platform);

  SECTION("Valid text generation") {
    {
      auto node = parser.ParseExpression("\"hello world\"");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello world\"");
    }
    {
      auto node = parser.ParseExpression("\"hello\"  +   \"world\" ");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello\" + \"world\"");
    }
    {
      auto node = parser.ParseExpression(
          "\"{\\\"hello\\\": \\\"world \\\\\\\" \\\"}\"");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "\"{\\\"hello\\\": \\\"world \\\\\\\" \\\"}\"");
    }
  }

  SECTION("Valid number generation") {
    {
      auto node = parser.ParseExpression("12.45");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.45");
    }
  }

  SECTION("Invalid operators generation") {
    // TODO: Should any error return directly 0 or ""?
    {
      auto node = parser.ParseExpression("12.45 +");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.45 + 0");
    }
    {
      auto node = parser.ParseExpression("12.45 * *");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.45 * 0");
    }
  }

  SECTION("Valid unary operator generation") {
    {
      auto node = parser.ParseExpression("-12.45");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);
      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "-(12.45)");
    }
    {
      auto node = parser.ParseExpression("12.5 + -2.  /   (.3)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);
      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "12.5 + -(2.) / (0.3)");
    }
  }

  SECTION("Valid function calls") {
    {
      auto node =
          parser.ParseExpression(" 1 /  MyExtension::GetNumber()");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "1 / getNumber()");
    }
    {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith2Params(12, \"hello world\")");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(12, \"hello world\")");
    }
    {
      auto node =
          parser.ParseExpression("MyExtension::GetNumberWith2Params("
                                 "MyExtension::GetNumber(), \"hello world\")");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(getNumber(), \"hello world\")");
    }
    {
      auto node =
          parser.ParseExpression("MySpriteObject.GetObjectNumber()");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "MySpriteObject.getObjectNumber() ?? 0");
    }
    {
      auto node = parser.ParseExpression(
          "MySpriteObject.GetObjectStringWith1Param(MyExtension::GetNumber())");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "MySpriteObject.getObjectStringWith1Param(getNumber()) ?? \"\"");
    }
  }
  SECTION("Valid function calls with optional arguments") {
    {
      auto node =
          parser.ParseExpression("MyExtension::MouseX(\"layer1\",)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getMouseX(\"\", \"layer1\", 0)");
      // (first argument is the currentScene)
    }
    {
      auto node = parser.ParseExpression("MyExtension::MouseX(\"layer1\",2+2)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getMouseX(\"\", \"layer1\", 2 + 2)");
      // (first argument is the currentScene)
    }
  }
  SECTION(
      "Valid function calls (deprecated way of specifying optional "
      "arguments)") {
    {
      auto node = parser.ParseExpression("MyExtension::MouseX(,)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getMouseX(\"\", \"\", 0)");
      // (first argument is the currentScene)
    }
  }
  SECTION("Invalid function calls") {
    {
      auto node =
          parser.ParseExpression("MySpriteObject.GetObjectStringWith3Param("
                                 "MySpriteObject.GetObjectNumber() / 2.3, "
                                 "MySpriteObject.GetObjectStringWith1Param("
                                 "MyExtension::GetNumber()), test)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "MySpriteObject.getObjectStringWith3Param(MySpriteObject."
              "getObjectNumber() ?? 0 / 2.3, "
              "MySpriteObject.getObjectStringWith1Param(getNumber()) ?? \"\", "
              "/* Error during generation, unrecognized identifier type: "
              "unknown with value test */ \"test\") ?? \"\"");
    }
    {
      auto node = parser.ParseExpression(
          "MyExtension::GetNumberWith2Params(MyExtension::GetNumber())");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(getNumber(), /* Error during generation, "
              "parameter not existing in the nodes */ \"\")");
    }
    {
      // Using GenerateExpressionCode, the default value of 0 should be returned
      // as expression is invalid.
      REQUIRE(
          gd::ExpressionCodeGenerator::GenerateExpressionCode(
              codeGenerator,
              context,
              "number",
              "MyExtension::GetNumberWith2Params(MyExtension::GetNumber())") ==
          "0");
    }
    {
      auto node = parser.ParseExpression("MyExtension::Idontexist()");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "/* Error during generation, function not found: "
              "MyExtension::Idontexist */ 0");
    }
    {
      auto node = parser.ParseExpression("MyExtension::GetNumberWith2Params(1, "
                                         "\"2\", MyExtension::GetNumber())");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getNumberWith2Params(1, \"2\")");
    }
  }
  SECTION("Invalid function calls (capabilities)") {
    {
      // Capability is supported, so the expression is valid.
      auto node = parser.ParseExpression(
          "MySpriteObject.GetSomethingRequiringEffectCapability(123)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(
          expressionCodeGenerator.GetOutput() ==
          "MySpriteObject.getSomethingRequiringEffectCapability(123) ?? \"\"");
    }
    {
      // Capability is not supported, so the expression is not even valid.
      auto node =
          parser.ParseExpression("MyFakeObjectWithUnsupportedCapability."
                                 "GetSomethingRequiringEffectCapability(123)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "\"\"");
    }
    {
      // We use a group, capability is supported only by one object of the
      // group. The expression itself is valid, but code generation should skip
      // the objects with unsupported capability.
      auto node = parser.ParseExpression(
          "AllObjects.GetSomethingRequiringEffectCapability(123)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(
          expressionCodeGenerator.GetOutput() ==
          "MyOtherSpriteObject.getSomethingRequiringEffectCapability(123) ?? "
          "MySpriteObject.getSomethingRequiringEffectCapability(123) ?? \"\"");
    }
  }
  SECTION("Invalid variables") {
    {
      // Test an empty expression
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "") == "fakeBadVariable");
    }
    {
      // Test a unary operator
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "-") ==
              "fakeBadVariable");
    }
    {
      // Test an operator
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "globalvar", "/") ==
              "fakeBadVariable");
    }
  }
  SECTION("Invalid variables, using operators") {
    {
      // Test a unary operator
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "-(var1)") ==
              "fakeBadVariable");
    }
    {
      // Test an operator
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "globalvar", "var1+var2") ==
              "fakeBadVariable");
    }
    {
      // Test multiple operators
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "globalvar", "var1/var2/var3/var4") ==
              "fakeBadVariable");
    }
  }
  SECTION("Valid variables") {
    {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable", "")
              == "getLayoutVariable(myVariable)");
    }
    {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable.myChild", "")
              == "getLayoutVariable(myVariable).getChild(\"myChild\")");
    }
    {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "myVariable", "MySpriteObject")
              == "getVariableForObject(MySpriteObject, myVariable)");
    }
  }
  SECTION("Valid function calls with variables") {
    SECTION("Simple access") {
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetVariableAsNumber(myVariable)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() ==
                "returnVariable(getLayoutVariable(myVariable))");
      }
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetGlobalVariableAsNumber(myGlobalVariable)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() ==
                "returnVariable(getProjectVariable(myGlobalVariable))");
      }
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetStringWith2ObjectParamAnd2ObjectVarParam("
            "MySpriteObject, myVariable, MyOtherSpriteObject, myOtherVariable)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() ==
            "getStringWith2ObjectParamAnd2ObjectVarParam(fakeObjectListOf_MySpriteObject, "
            "getVariableForObject(MySpriteObject, myVariable), "
            "fakeObjectListOf_MyOtherSpriteObject, "
            "getVariableForObject(MyOtherSpriteObject, myOtherVariable))");
      }
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetStringWith1ObjectParamAnd2ObjectVarParam("
            "MySpriteObject, myVariable, myOtherVariable)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() ==
            "getStringWith1ObjectParamAnd2ObjectVarParam(fakeObjectListOf_MySpriteObject, "
            "getVariableForObject(MySpriteObject, myVariable), "
            "getVariableForObject(MySpriteObject, myOtherVariable))");
      }
      {
        auto node = parser.ParseExpression(
            "MySpriteObject.GetObjectVariableAsNumber(myVariable)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(
            expressionCodeGenerator.GetOutput() ==
            "MySpriteObject.returnVariable(getVariableForObject("
            "MySpriteObject, myVariable)) ?? 0");
      }
    }
    SECTION("Child access") {
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetVariableAsNumber(myVariable.child1)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() ==
                "returnVariable(getLayoutVariable(myVariable).getChild("
                "\"child1\"))");
      }
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetVariableAsNumber(myVariable.child1.child2)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() ==
                "returnVariable(getLayoutVariable(myVariable).getChild("
                "\"child1\").getChild(\"child2\"))");
      }
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetVariableAsNumber(myVariable[ \"hello\" + "
            "\"world\" ].child2)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() ==
                "returnVariable(getLayoutVariable(myVariable).getChild("
                "\"hello\" + \"world\").getChild(\"child2\"))");
      }
      {
        auto node = parser.ParseExpression(
            "MyExtension::GetVariableAsNumber(myVariable[ \"hello\" + "
            "MySpriteObject.GetObjectStringWith1Param(MyOtherSpriteObject."
            "GetObjectVariableAsNumber(mySecondVariable)) ].child2)");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(
            expressionCodeGenerator.GetOutput() ==
            "returnVariable(getLayoutVariable(myVariable).getChild(\"hello\" + "
            "MySpriteObject.getObjectStringWith1Param(MyOtherSpriteObject."
            "returnVariable"
            "(getVariableForObject(MyOtherSpriteObject, mySecondVariable)) ?? "
            "0) ?? \"\").getChild(\"child2\"))");
      }
    }
  }
  SECTION("Objects") {
    gd::String output = gd::ExpressionCodeGenerator::GenerateExpressionCode(
        codeGenerator,
        context,
        "string",
        "MySpriteObject.GetObjectStringWith2ObjectParam(Object1, Object2)");
    REQUIRE(output ==
            "MySpriteObject.getObjectStringWith2ObjectParam(fakeObjectListOf_"
            "Object1, fakeObjectListOf_Object2) ?? \"\"");
  }
  SECTION("Mixed test (1)") {
    {
      auto node = parser.ParseExpression("-+-MyExtension::MouseX(,)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "-(+(-(getMouseX(\"\", \"\", 0))))");
      // (first argument is the currentScene)
    }
  }
  SECTION("Mixed test (2)") {
    gd::String output = gd::ExpressionCodeGenerator::GenerateExpressionCode(
        codeGenerator,
        context,
        "number",
        "MyExtension::GetVariableAsNumber(myVariable[ \"hello\" + "
        "MySpriteObject.GetObjectStringWith1Param(MyOtherSpriteObject."
        "GetObjectVariableAsNumber(mySecondVariable)) ].child2)");
    REQUIRE(output ==
            "returnVariable(getLayoutVariable(myVariable).getChild(\"hello\" + "
            "MySpriteObject.getObjectStringWith1Param(MyOtherSpriteObject."
            "returnVariable"
            "(getVariableForObject(MyOtherSpriteObject, mySecondVariable)) ?? "
            "0) ?? \"\").getChild(\"child2\"))");
  }
  SECTION("Mixed test (3)") {
    gd::String output = gd::ExpressionCodeGenerator::GenerateExpressionCode(
        codeGenerator,
        context,
        "globalvar",
        "myVariable[ \"My children\" + "
        "MyExtension::ToString(+-MyExtension::GetNumberWith3Params(12, \"hello "
        "world\"))  ].grandChild");
    REQUIRE(output ==
            "getProjectVariable(myVariable).getChild(\"My children\" + "
            "toString(+(-(getNumberWith3Params(12, \"hello world\", "
            "0))))).getChild(\"grandChild\")");
  }
}
