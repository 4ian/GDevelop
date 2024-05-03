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

  // Add some variables and objects:
  project.GetVariables().InsertNew("MyGlobalNumberVariable").SetValue(1234);
  project.GetVariables().InsertNew("MyGlobalStringVariable").SetString("TestGlobal");
  layout1.GetVariables().InsertNew("MySceneVariable").SetValue(123);
  layout1.GetVariables().InsertNew("MySceneVariable2").SetValue(123);
  layout1.GetVariables().InsertNew("MySceneStringVariable").SetString("MyString");
  layout1.GetVariables().InsertNew("MySceneBooleanVariable").SetBool(true);
  layout1.GetVariables().InsertNew("MySceneStructureVariable").GetChild("MyChild");
  layout1.GetVariables().InsertNew("MySceneStructureVariable2").GetChild("MyChild");
  layout1.GetVariables().InsertNew("MySceneEmptyArrayVariable").CastTo(gd::Variable::Type::Array);
  {
    auto& variable = layout1.GetVariables().InsertNew("MySceneNumberArrayVariable");
    variable.CastTo(gd::Variable::Type::Array);
    variable.PushNew().SetValue(1);
    variable.PushNew().SetValue(2);
    variable.PushNew().SetValue(3);
  }
  {
    auto& variable = layout1.GetVariables().InsertNew("MySceneStringArrayVariable");
    variable.CastTo(gd::Variable::Type::Array);
    variable.PushNew().SetString("1");
    variable.PushNew().SetString("2");
    variable.PushNew().SetString("3");
  }

  auto &mySpriteObject = layout1.InsertNewObject(project, "MyExtension::Sprite", "MySpriteObject", 0);
  mySpriteObject.GetVariables().InsertNew("MyNumberVariable").SetValue(123);
  mySpriteObject.GetVariables().InsertNew("MyStringVariable").SetString("Test");
  mySpriteObject.GetVariables().InsertNew("MyStructureVariable").GetChild("MyStringChild").SetString("Test");
  layout1.InsertNewObject(
      project, "MyExtension::Sprite", "MyOtherSpriteObject", 1);
  layout1.InsertNewObject(project,
                          "MyExtension::FakeObjectWithDefaultBehavior",
                          "FakeObjectWithDefaultBehavior",
                          2);

  // Also insert a variable having the same name as an object:
  layout1.InsertNewObject(project, "MyExtension::Sprite", "ObjectWithNameReused", 3);
  layout1.GetVariables().InsertNew("ObjectWithNameReused", 3).GetChild("MyChild");

  // Also insert a global variable having the same name as a scene variable:
  layout1.GetVariables().InsertNew("SceneVariableWithNameReused", 4);
  project.GetVariables().InsertNew("SceneVariableWithNameReused", 0);

  auto &group = layout1.GetObjectGroups().InsertNew("AllObjects");
  group.AddObject("MySpriteObject");
  group.AddObject("MyOtherSpriteObject");
  group.AddObject("FakeObjectWithDefaultBehavior");

  auto &spriteGroup = layout1.GetObjectGroups().InsertNew("MySpriteObjects");
  spriteGroup.AddObject("MySpriteObject");
  spriteGroup.AddObject("MyOtherSpriteObject");

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
                                 "MyExtension::GetNumber()), UnknownObject.Unknown)");
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
              "0) ?? \"\"");
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
  SECTION("Properties (1 level)") {
    gd::PropertiesContainer propertiesContainer(gd::EventsFunctionsContainer::Extension);

    auto projectScopedContainersWithProperties = gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);
    projectScopedContainersWithProperties.AddPropertiesContainer(propertiesContainer);

    propertiesContainer.InsertNew("MyProperty");
    propertiesContainer.InsertNew("MyProperty2");

    gd::EventsCodeGenerator codeGeneratorWithProperties(platform, projectScopedContainersWithProperties);

    {
      auto node =
        parser.ParseExpression("MyProperty + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getPropertyMyPropertyAsnumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MyProperty + MyProperty2");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getPropertyMyPropertyAsnumber() + getPropertyMyProperty2Asnumber()");
    }
  }
  SECTION("Properties (1 level, number|string)") {
    gd::PropertiesContainer propertiesContainer(gd::EventsFunctionsContainer::Extension);

    auto projectScopedContainersWithProperties = gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);
    projectScopedContainersWithProperties.AddPropertiesContainer(propertiesContainer);

    propertiesContainer.InsertNew("MyNumberProperty").SetType("Number");
    propertiesContainer.InsertNew("MyStringProperty").SetType("String");
    propertiesContainer.InsertNew("MyBooleanProperty").SetType("Boolean");

    gd::EventsCodeGenerator codeGeneratorWithProperties(platform, projectScopedContainersWithProperties);

    {
      auto node =
        parser.ParseExpression("MyNumberProperty");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number|string",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getPropertyMyNumberPropertyAsnumber()");
    }
    {
      auto node =
        parser.ParseExpression("MyStringProperty");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number|string",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getPropertyMyStringPropertyAsstring()");
    }
    {
      auto node =
        parser.ParseExpression("MyBooleanProperty");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number|string",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getPropertyMyBooleanPropertyAsnumber|string()");
    }
  }
  SECTION("Parameters (1 level)") {
    std::vector<gd::ParameterMetadata> parameters;
    gd::ParameterMetadata param1;
    param1.SetName("MyParameter1");
    param1.SetType("number");
    gd::ParameterMetadata param2;
    param2.SetName("MyParameter2");
    param2.SetType("string");
    parameters.push_back(param1);
    parameters.push_back(param2);

    auto projectScopedContainersWithParameters = gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);
    projectScopedContainersWithParameters.AddParameters(parameters);

    gd::EventsCodeGenerator codeGeneratorWithProperties(platform, projectScopedContainersWithParameters);

    {
      auto node =
        parser.ParseExpression("MyParameter1 + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getParameterMyParameter1Asnumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MyParameter1 + MyParameter2");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getParameterMyParameter1Asnumber() + getParameterMyParameter2Asnumber()");
    }
  }
  SECTION("Parameters (1 level, number|string)") {
    std::vector<gd::ParameterMetadata> parameters;
    gd::ParameterMetadata param1;
    param1.SetName("MyNumberParameter");
    param1.SetType("number");
    gd::ParameterMetadata param2;
    param2.SetName("MyStringParameter");
    param2.SetType("string");
    gd::ParameterMetadata param3;
    param3.SetName("MyBooleanParameter");
    param3.SetType("yesorno");
    parameters.push_back(param1);
    parameters.push_back(param2);
    parameters.push_back(param3);

    auto projectScopedContainersWithParameters = gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout1);
    projectScopedContainersWithParameters.AddParameters(parameters);

    gd::EventsCodeGenerator codeGeneratorWithProperties(platform, projectScopedContainersWithParameters);

    {
      auto node =
        parser.ParseExpression("MyNumberParameter");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number|string",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getParameterMyNumberParameterAsnumber()");
    }
    {
      auto node =
        parser.ParseExpression("MyStringParameter");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number|string",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getParameterMyStringParameterAsstring()");
    }
    {
      auto node =
        parser.ParseExpression("MyBooleanParameter");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number|string",
                                                          "",
                                                          codeGeneratorWithProperties,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getParameterMyBooleanParameterAsnumber|string()");
    }
  }
  SECTION("Scene variables (1 level)") {
    {
      auto node =
        parser.ParseExpression("MySceneVariable + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneVariable).getAsNumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MySceneVariable + MySceneVariable2");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneVariable).getAsNumber() + getLayoutVariable(MySceneVariable2).getAsNumber()");
    }
  }
  SECTION("Scene variables (conflict with a global variable)") {
    {
      auto node =
        parser.ParseExpression("SceneVariableWithNameReused + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(SceneVariableWithNameReused).getAsNumber() + 1");
    }
  }
  SECTION("Scene variables (2 levels)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable.MyChild + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getAsNumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable.MyChild + MySceneStructureVariable2.MyChild");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getAsNumber() + getLayoutVariable(MySceneStructureVariable2).getChild(\"MyChild\").getAsNumber()");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, string)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[\"MyChild\"] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getAsNumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[\"MyChild\"] + MySceneStructureVariable2[\"MyChild\"]");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getAsNumber() + getLayoutVariable(MySceneStructureVariable2).getChild(\"MyChild\").getAsNumber()");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, number)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[3] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(3).getAsNumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[3] + MySceneStructureVariable2[3]");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(3).getAsNumber() + getLayoutVariable(MySceneStructureVariable2).getChild(3).getAsNumber()");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a number variable as index)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[MySceneVariable] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(getLayoutVariable(MySceneVariable).getAsNumber()).getAsNumber() + 1");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a string variable as index)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[MySceneStringVariable] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(getLayoutVariable(MySceneStringVariable).getAsString()).getAsNumber() + 1");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a non string/number variable as index)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[MySceneBooleanVariable] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(getLayoutVariable(MySceneBooleanVariable).getAsNumberOrString()).getAsNumber() + 1");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a unknown variable type as index)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[MySceneStructureVariable.MyChild.CantKnownTheTypeSoStayGeneric] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getChild(\"CantKnownTheTypeSoStayGeneric\").getAsNumberOrString()).getAsNumber() + 1");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a unknown variable type and an operator with a number as index)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[MySceneStructureVariable.MyChild.CantKnownTheTypeSoStayGeneric + 2] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getChild(\"CantKnownTheTypeSoStayGeneric\").getAsNumber() + 2).getAsNumber() + 1");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a unknown variable type and an operator with a string as index)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[MySceneStructureVariable.MyChild.CantKnownTheTypeSoStayGeneric + \"Test\"] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getChild(\"CantKnownTheTypeSoStayGeneric\").getAsString() + \"Test\").getAsNumber() + 1");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a unknown variable type as index) (expression type: number|string)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[MySceneStructureVariable.MyChild.CantKnownTheTypeSoStayGeneric]");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number|string",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getChild(\"CantKnownTheTypeSoStayGeneric\").getAsNumberOrString()).getAsNumberOrString()");
    }
  }
  SECTION("Scene variables (2 levels with bracket accessor, using a number variable casted to string as index)") {
    {
      auto node =
        parser.ParseExpression("MySceneStructureVariable[\"\" + MySceneVariable] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStructureVariable).getChild(\"\" + getLayoutVariable(MySceneVariable).getAsString()).getAsNumber() + 1");
    }
  }
  SECTION("Object variable with non existing object (invalid)") {
    auto node =
        parser.ParseExpression("MyNonExistingSpriteObject.MyVariable");
    gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                        "",
                                                        codeGenerator,
                                                        context);

    REQUIRE(node);
    node->Visit(expressionCodeGenerator);
    REQUIRE(expressionCodeGenerator.GetOutput() == "0");
  }
  SECTION("Object variables (1 level)") {
    {
      auto node =
        parser.ParseExpression("MySpriteObject.MyVariable + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObject, MyVariable).getAsNumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MySpriteObject.MyVariable + MySpriteObject.MyVariable2");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObject, MyVariable).getAsNumber() + getVariableForObject(MySpriteObject, MyVariable2).getAsNumber()");
    }
  }
  SECTION("Object variables (1 level, object group)") {
    {
      auto node =
        parser.ParseExpression("MySpriteObjects.MyVariable + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObjects, MyVariable).getAsNumber() + 1");
    }
  }
  SECTION("Object variables (conflict with a scene variable)") {
    {
      auto node =
        parser.ParseExpression("ObjectWithNameReused.MyVariable + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(ObjectWithNameReused, MyVariable).getAsNumber() + 1");
    }
  }
  SECTION("Object variables (1 level with bracket accessor) (invalid)") {
    {
      auto node =
        parser.ParseExpression("MySpriteObject[\"BracketNotationCantBeUsedHere\"] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "fakeBadVariable.getAsNumber() + 1");
    }
    {
      auto node =
        parser.ParseExpression("MySpriteObject.MyVariable + MySpriteObject.MyVariable2");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObject, MyVariable).getAsNumber() + getVariableForObject(MySpriteObject, MyVariable2).getAsNumber()");
    }
  }
  SECTION("Object variables (2 levels)") {
    {
      auto node =
          parser.ParseExpression("MySpriteObject.MyVariable.MyChildVariable + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObject, MyVariable).getChild(\"MyChildVariable\").getAsNumber() + 1");
    }
    {
      auto node =
          parser.ParseExpression("MySpriteObject.MyVariable.MyChildVariable + MySpriteObject.MyVariable2.MyChildVariable");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObject, MyVariable).getChild(\"MyChildVariable\").getAsNumber() + getVariableForObject(MySpriteObject, MyVariable2).getChild(\"MyChildVariable\").getAsNumber()");
    }
  }
  SECTION("Object variables (2 levels with bracket accessor)") {
    {
      auto node =
          parser.ParseExpression("MySpriteObject.MyVariable[\"MyChildVariable\"] + 1");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObject, MyVariable).getChild(\"MyChildVariable\").getAsNumber() + 1");
    }
    {
      auto node =
          parser.ParseExpression("MySpriteObject.MyVariable[\"MyChildVariable\"] + MySpriteObject.MyVariable2[\"MyChildVariable\"]");
      gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                          "",
                                                          codeGenerator,
                                                          context);

      REQUIRE(node);
      node->Visit(expressionCodeGenerator);
      REQUIRE(expressionCodeGenerator.GetOutput() == "getVariableForObject(MySpriteObject, MyVariable).getChild(\"MyChildVariable\").getAsNumber() + getVariableForObject(MySpriteObject, MyVariable2).getChild(\"MyChildVariable\").getAsNumber()");
    }
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
  SECTION("Valid variables (upcoming, new 'variable' type working for any variable)") {
    // When implemented, copy the test cases from the next section, like this:
    // SECTION("simple variable") {
    //   REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
    //               codeGenerator, context, "variable", "MySceneVariable", "")
    //           == "getLayoutVariable(MySceneVariable)");
    // }
    // SECTION("simple (global) variable") {
    //   REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
    //               codeGenerator, context, "variable", "MyGlobalNumberVariable", "")
    //           == "getProjectVariable(MyGlobalNumberVariable)");
    // }
  }
  SECTION("Valid variables (legacy, pre-scoped variables)") {
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
    SECTION("bracket access (using a string object variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MySpriteObject.MyStringVariable]", "")
              == "getLayoutVariable(myVariable).getChild(getVariableForObject(MySpriteObject, MyStringVariable).getAsString())");
    }
    SECTION("bracket access (using a number object variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MySpriteObject.MyNumberVariable]", "")
              == "getLayoutVariable(myVariable).getChild(getVariableForObject(MySpriteObject, MyNumberVariable).getAsNumber())");
    }
    SECTION("bracket access (using a string variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MySceneStringVariable]", "")
              == "getLayoutVariable(myVariable).getChild(getLayoutVariable(MySceneStringVariable).getAsString())");
    }
    SECTION("bracket access (using a number variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MySceneVariable]", "")
              == "getLayoutVariable(myVariable).getChild(getLayoutVariable(MySceneVariable).getAsNumber())");
    }
    SECTION("bracket access (using a string global variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MyGlobalStringVariable]", "")
              == "getLayoutVariable(myVariable).getChild(getProjectVariable(MyGlobalStringVariable).getAsString())");
    }
    SECTION("bracket access (using a number global variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MyGlobalNumberVariable]", "")
              == "getLayoutVariable(myVariable).getChild(getProjectVariable(MyGlobalNumberVariable).getAsNumber())");
    }
    SECTION("bracket access (using a boolean variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MySceneBooleanVariable]", "")
              == "getLayoutVariable(myVariable).getChild(getLayoutVariable(MySceneBooleanVariable).getAsNumberOrString())");
    }
    SECTION("bracket access (using a structure variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "scenevar", "myVariable[MySceneStructureVariable.MyChild.SubChild]", "")
              == "getLayoutVariable(myVariable).getChild(getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getChild(\"SubChild\").getAsNumberOrString())");
    }
    SECTION("object variable") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "myVariable", "MySpriteObject")
              == "getVariableForObject(MySpriteObject, myVariable)");
    }
    SECTION("object variable with bracket access (using a structure variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "myVariable[MySceneStringVariable]", "MySpriteObject")
              == "getVariableForObject(MySpriteObject, myVariable).getChild(getLayoutVariable(MySceneStringVariable).getAsString())");
    }
    SECTION("object variable with bracket access (using an object variable inside)") {
      REQUIRE(gd::ExpressionCodeGenerator::GenerateExpressionCode(
                  codeGenerator, context, "objectvar", "myVariable[MySpriteObject.MyStructureVariable.MyChild]", "MySpriteObject")
              == "getVariableForObject(MySpriteObject, myVariable).getChild(getVariableForObject(MySpriteObject, MyStructureVariable).getChild(\"MyChild\").getAsNumberOrString())");
    }
  }
  SECTION("Valid function calls with variables (legacy, pre-scoped)") {
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
  SECTION("Edge cases (variables with object name in objectvar parameter)") {
    SECTION("Simple case") {
      gd::String output = gd::ExpressionCodeGenerator::GenerateExpressionCode(
          codeGenerator,
          context,
          "objectvar", // We suppose we generate an "objectvar" parameter.
          "MyOtherSpriteObject", // This "variable name" is the same as an object name (but this is valid).
          "MySpriteObject" // The object owning the variable: MySpriteObject.
          );

      // This seems "obvious", but we had cases where MyOtherSpriteObject could have been interpreted as an object
      // when the code generation is not properly recognizing "objectvar".
      REQUIRE(output == "getVariableForObject(MySpriteObject, MyOtherSpriteObject)");
    }

    SECTION("With child variable") {
      gd::String output = gd::ExpressionCodeGenerator::GenerateExpressionCode(
          codeGenerator,
          context,
          "objectvar", // We suppose we generate an "objectvar" parameter.
          "MyOtherSpriteObject.Child", // This "variable name" is the same as an object name (but this is valid).
          "MySpriteObject" // The object owning the variable: MySpriteObject.
          );

      // This seems "obvious", but we had cases where MyOtherSpriteObject could have been interpreted as an object
      // when the code generation is not properly recognizing "objectvar".
      REQUIRE(output == "getVariableForObject(MySpriteObject, MyOtherSpriteObject).getChild(\"Child\")");
    }

    SECTION("With child and grandchild variable") {
      gd::String output = gd::ExpressionCodeGenerator::GenerateExpressionCode(
          codeGenerator,
          context,
          "objectvar", // We suppose we generate an "objectvar" parameter.
          "MyOtherSpriteObject.Child.Grandchild", // This "variable name" is the same as an object name (but this is valid).
          "MySpriteObject" // The object owning the variable: MySpriteObject.
          );

      // This seems "obvious", but we had cases where MyOtherSpriteObject could have been interpreted as an object
      // when the code generation is not properly recognizing "objectvar".
      REQUIRE(output == "getVariableForObject(MySpriteObject, MyOtherSpriteObject).getChild(\"Child\").getChild(\"Grandchild\")");
    }
  }
  SECTION("Type conversions (valid operators with variables having different types than the expression)") {
    SECTION("Expression/parent type is 'string'") {
      {
        auto node =
          parser.ParseExpression("\"You have \" + MySceneVariable + \" points\"");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "\"You have \" + getLayoutVariable(MySceneVariable).getAsString() + \" points\"");
      }
      {
        auto node =
          parser.ParseExpression("MySceneVariable + MySceneStringVariable");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneVariable).getAsString() + getLayoutVariable(MySceneStringVariable).getAsString()");
      }
    }
    SECTION("Expression/parent type is 'string' (with an unknown variable)") {
      {
        auto node =
          parser.ParseExpression("\"You have \" + MySceneStructureVariable.MyChild.CantKnownTheTypeSoStayGeneric + \" points\"");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "\"You have \" + getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getChild(\"CantKnownTheTypeSoStayGeneric\").getAsString() + \" points\"");
      }
    }
    SECTION("Expression/parent type is 'string' (2 number variables)") {
      {
        auto node =
          parser.ParseExpression("MySceneVariable + MySceneVariable2 + \"world\"");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneVariable).getAsString() + getLayoutVariable(MySceneVariable2).getAsString() + \"world\"");
      }
      {
        auto node =
          parser.ParseExpression("MySceneVariable + MySceneVariable2 + MySceneStringVariable");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneVariable).getAsString() + getLayoutVariable(MySceneVariable2).getAsString() + getLayoutVariable(MySceneStringVariable).getAsString()");
      }
    }
    SECTION("Expression/parent type is 'string' (array variable)") {
      {
        auto node =
          parser.ParseExpression("\"hello\" + MySceneNumberArrayVariable[2] + \"world\"");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello\" + getLayoutVariable(MySceneNumberArrayVariable).getChild(2).getAsString() + \"world\"");
      }
      {
        auto node =
          parser.ParseExpression("\"hello\" + MySceneEmptyArrayVariable[2] + \"world\"");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello\" + getLayoutVariable(MySceneEmptyArrayVariable).getChild(2).getAsString() + \"world\"");
      }
    }

    SECTION("Expression/parent type is 'number'") {
      {
        auto node =
          parser.ParseExpression("123 + MySceneVariable + 456");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "123 + getLayoutVariable(MySceneVariable).getAsNumber() + 456");
      }
      {
        auto node =
          parser.ParseExpression("MySceneStringVariable + MySceneVariable");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStringVariable).getAsNumber() + getLayoutVariable(MySceneVariable).getAsNumber()");
      }
    }
    SECTION("Expression/parent type is 'string' (with an unknown variable)") {
      {
        auto node =
          parser.ParseExpression("123 + MySceneStructureVariable.MyChild.CantKnownTheTypeSoStayGeneric + 456");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "123 + getLayoutVariable(MySceneStructureVariable).getChild(\"MyChild\").getChild(\"CantKnownTheTypeSoStayGeneric\").getAsNumber() + 456");
      }
    }
    SECTION("Expression/parent type is 'number' (2 string variables)") {
      {
        auto node =
          parser.ParseExpression("MySceneStringVariable + MySceneStringVariable + 456");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStringVariable).getAsNumber() + getLayoutVariable(MySceneStringVariable).getAsNumber() + 456");
      }
      {
        auto node =
          parser.ParseExpression("MySceneStringVariable + MySceneStringVariable + MySceneVariable");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "getLayoutVariable(MySceneStringVariable).getAsNumber() + getLayoutVariable(MySceneStringVariable).getAsNumber() + getLayoutVariable(MySceneVariable).getAsNumber()");
      }
    }
    SECTION("Expression/parent type is 'number' (array variable)") {
      {
        auto node =
          parser.ParseExpression("123 + MySceneNumberArrayVariable[2] + 456");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "123 + getLayoutVariable(MySceneNumberArrayVariable).getChild(2).getAsNumber() + 456");
      }
      {
        auto node =
          parser.ParseExpression("123 + MySceneEmptyArrayVariable[2] + 456");
        gd::ExpressionCodeGenerator expressionCodeGenerator("number",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "123 + getLayoutVariable(MySceneEmptyArrayVariable).getChild(2).getAsNumber() + 456");
      }
    }


    SECTION("Multiple type conversions in sub expressions or same expression") {
      {
        auto node =
          parser.ParseExpression("\"hello\" + MySceneNumberArrayVariable[2 + MySceneStringVariable] + \"world\" + MySceneVariable + \"world 2\"");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello\" + getLayoutVariable(MySceneNumberArrayVariable).getChild(2 + getLayoutVariable(MySceneStringVariable).getAsNumber()).getAsString() + \"world\" + getLayoutVariable(MySceneVariable).getAsString() + \"world 2\"");
      }
      {
        auto node =
          parser.ParseExpression("\"hello\" + MySceneNumberArrayVariable[\"foo\" + MySceneVariable + \"bar\"] + \"world\" + MySceneVariable + \"world 2\"");
        gd::ExpressionCodeGenerator expressionCodeGenerator("string",
                                                            "",
                                                            codeGenerator,
                                                            context);

        REQUIRE(node);
        node->Visit(expressionCodeGenerator);
        REQUIRE(expressionCodeGenerator.GetOutput() == "\"hello\" + getLayoutVariable(MySceneNumberArrayVariable).getChild(\"foo\" + getLayoutVariable(MySceneVariable).getAsString() + \"bar\").getAsString() + \"world\" + getLayoutVariable(MySceneVariable).getAsString() + \"world 2\"");
      }
    }
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
