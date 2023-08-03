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
                          "MyExtension::FakeObjectWithDefaultBehavior",
                          "FakeObjectWithDefaultBehavior",
                          2);
  auto &group = layout1.GetObjectGroups().InsertNew("AllObjects");
  group.AddObject("MySpriteObject");
  group.AddObject("MyOtherSpriteObject");
  group.AddObject("FakeObjectWithDefaultBehavior");

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
    SECTION("without parameter") {
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
    SECTION("number and string parameters") {
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
    SECTION("nested function call") {
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
    SECTION("object function") {
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
    SECTION("object function with nested free function") {
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
    SECTION("with optional parameter set") {
      auto node = parser.ParseExpression("MyExtension::MouseX(\"layer1\",2+2)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getCursorX(\"\", \"layer1\", 2 + 2)");
      // (first argument is the currentScene)
    }
    SECTION("with last optional parameter omit") {
      auto node =
          parser.ParseExpression("MyExtension::MouseX(\"layer1\")");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getCursorX(\"\", \"layer1\", 0)");
      // (first argument is the currentScene)
    }
    SECTION("with last optional parameter omit (deprecated way)") {
      auto node =
          parser.ParseExpression("MyExtension::MouseX(\"layer1\",)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getCursorX(\"\", \"layer1\", 0)");
      // (first argument is the currentScene)
    }
    SECTION("with explicit comma (deprecated way)") {
      auto node = parser.ParseExpression("MyExtension::MouseX(,)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "getCursorX(\"\", \"\", 0)");
      // (first argument is the currentScene)
    }
  }

  SECTION("Invalid function calls") {
    SECTION("unknown identifier in parameters") {
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
    SECTION("missing parameter") {
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
    }
    SECTION("unknown function") {
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
    SECTION("too much parameters") {
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
  SECTION("function calls (capabilities)") {
    SECTION("supported capability") {
      // Capability is supported, so the expression is valid.
      auto node = parser.ParseExpression(
          "FakeObjectWithDefaultBehavior.Effect::GetSomethingRequiringEffectCapability(123)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(
          expressionCodeGenerator.GetOutput() ==
          "FakeObjectWithDefaultBehavior::Effect.getSomethingRequiringEffectCapability(123) ?? \"\"");
    }
    SECTION("unsupported capability") {
      // Capability is not supported, so the expression is not even valid.
      auto node =
          parser.ParseExpression("MySpriteObject::Effect."
                                 "GetSomethingRequiringEffectCapability(123)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(
        expressionCodeGenerator.GetOutput() ==
        "/* Error during generation, function not found: GetSomethingRequiringEffectCapability */ \"\"");
    }
    SECTION("group with partial support") {
      // We use a group, capability is supported only by one object of the
      // group. The expression itself is valid, but code generation should skip
      // the objects with unsupported capability.
      auto node = parser.ParseExpression(
          "AllObjects.Effect::GetSomethingRequiringEffectCapability(123)");
      gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() ==
              "FakeObjectWithDefaultBehavior::Effect."
              "getSomethingRequiringEffectCapability(123) ?? "
              "MyOtherSpriteObject::Effect."
              "getSomethingRequiringEffectCapability(123) ?? "
              "MySpriteObject::Effect.getSomethingRequiringEffectCapability("
              "123) ?? \"\"");
    }
  }
  SECTION("Function name") {
    auto node =
        parser.ParseExpression("MySpriteObject.GetObjectNumber");
    gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                        "",
                                                        codeGenerator,
                                                        context);

    REQUIRE(node);
    node->Visit(expressionCodeGenerator);
    REQUIRE(expressionCodeGenerator.GetOutput() == "0");
  }
  SECTION("Invalid variables") {
    SECTION("empty variable") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "") == "fakeBadVariable");
    }
    SECTION("only an unary operator") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "-") ==
              "fakeBadVariable");
    }
    SECTION("only a binary operator") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "globalvar", "/") ==
              "fakeBadVariable");
    }
  }
  SECTION("Invalid variables, using operators") {
    SECTION("unary operation") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "-(var1)") ==
              "fakeBadVariable");
    }
    SECTION("binary operation") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "globalvar", "var1+var2") ==
              "fakeBadVariable");
    }
    SECTION("multiple operation") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "globalvar", "var1/var2/var3/var4") ==
              "fakeBadVariable");
    }
  }
  SECTION("Valid variables") {
    SECTION("simple variable") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable", "")
              == "getLayoutVariable(myVariable)");
    }
    SECTION("child dot accessor") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable.myChild", "")
              == "getLayoutVariable(myVariable).getChild(\"myChild\")");
    }
    SECTION("2 children") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable.child1.child2", "")
              == "getLayoutVariable(myVariable).getChild(\"child1\").getChild(\"child2\")");
    }
    SECTION("bracket access") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[ \"hello\" + "
            "\"world\" ]", "")
              == "getLayoutVariable(myVariable).getChild(\"hello\" + \"world\")");
    }
    SECTION("object variable") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "myVariable", "MySpriteObject")
              == "getVariableForObject(MySpriteObject, myVariable)");
    }
  }
  SECTION("Valid function calls with variables") {
    SECTION("Simple access") {
      SECTION("Scene variable") {
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
      SECTION("Global variable") {
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
      SECTION("Variables on different objects") {
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
      SECTION("Variables on the same object") {
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
      SECTION("Object variable with object function call") {
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
      SECTION("1 child") {
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
      SECTION("2 children") {
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
      SECTION("bracket access") {
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
      SECTION("bracket access with nested variable") {
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
              "-(+(-(getCursorX(\"\", \"\", 0))))");
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
