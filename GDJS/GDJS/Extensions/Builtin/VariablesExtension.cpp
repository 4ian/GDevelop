/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/VariablesExtension.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"

using namespace gd;

namespace gdjs {

VariablesExtension::VariablesExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsVariablesExtension(*this);

  GetAllConditions()["VarScene"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableNumber");
  GetAllConditions()["VarSceneTxt"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableString");
  GetAllConditions()["SceneVariableAsBoolean"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableBoolean");
  GetAllConditions()["VarGlobal"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableNumber");
  GetAllConditions()["VarGlobalTxt"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableString");
  GetAllConditions()["GlobalVariableAsBoolean"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableBoolean");

  GetAllExpressions()["VariableChildCount"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableChildCount");
  GetAllExpressions()["GlobalVariableChildCount"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableChildCount");

  GetAllExpressions()["Variable"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableNumber");
  GetAllStrExpressions()["VariableString"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableString");
  GetAllExpressions()["GlobalVariable"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableNumber");
  GetAllStrExpressions()["GlobalVariableString"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableString");

  GetAllStrExpressions()["GlobalVariableFirstString"].SetFunctionName(
      "gdjs.evtTools.variable.getFirstVariableString");
  GetAllExpressions()["GlobalVariableFirstNumber"].SetFunctionName(
      "gdjs.evtTools.variable.getFirstVariableNumber");
  GetAllStrExpressions()["GlobalVariableLastString"].SetFunctionName(
      "gdjs.evtTools.variable.getLastVariableString");
  GetAllExpressions()["GlobalVariableLastNumber"].SetFunctionName(
      "gdjs.evtTools.variable.getLastVariableNumber");
  GetAllStrExpressions()["SceneVariableFirstString"].SetFunctionName(
      "gdjs.evtTools.variable.getFirstVariableString");
  GetAllExpressions()["SceneVariableFirstNumber"].SetFunctionName(
      "gdjs.evtTools.variable.getFirstVariableNumber");
  GetAllStrExpressions()["SceneVariableLastString"].SetFunctionName(
      "gdjs.evtTools.variable.getLastVariableString");
  GetAllExpressions()["SceneVariableLastNumber"].SetFunctionName(
      "gdjs.evtTools.variable.getLastVariableNumber");

  GetAllConditions()["VarSceneDef"].SetFunctionName(
      "gdjs.evtTools.variable.sceneVariableExists");
  GetAllConditions()["VarGlobalDef"].SetFunctionName(
      "gdjs.evtTools.variable.globalVariableExists");
  GetAllConditions()["SceneVariableChildCount"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableChildCount");
  GetAllConditions()["GlobalVariableChildCount"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableChildCount");

  GetAllActions()["SetSceneVariableAsBoolean"].SetFunctionName(
      "gdjs.evtTools.variable.setVariableBoolean");
  GetAllActions()["SetGlobalVariableAsBoolean"].SetFunctionName(
      "gdjs.evtTools.variable.setVariableBoolean");
  GetAllActions()["ToggleSceneVariableAsBoolean"].SetFunctionName(
      "gdjs.evtTools.variable.toggleVariableBoolean");
  GetAllActions()["ToggleGlobalVariableAsBoolean"].SetFunctionName(
      "gdjs.evtTools.variable.toggleVariableBoolean");

  GetAllConditions()["VariableChildExists"].SetFunctionName(
      "gdjs.evtTools.variable.variableChildExists");
  GetAllConditions()["GlobalVariableChildExists"].SetFunctionName(
      "gdjs.evtTools.variable.variableChildExists");
  GetAllActions()["VariableRemoveChild"].SetFunctionName(
      "gdjs.evtTools.variable.variableRemoveChild");
  GetAllActions()["GlobalVariableRemoveChild"].SetFunctionName(
      "gdjs.evtTools.variable.variableRemoveChild");
  GetAllActions()["VariableClearChildren"].SetFunctionName(
      "gdjs.evtTools.variable.variableClearChildren");
  GetAllActions()["GlobalVariableClearChildren"].SetFunctionName(
      "gdjs.evtTools.variable.variableClearChildren");

  GetAllActions()["SceneVariablePush"].SetFunctionName(
      "gdjs.evtTools.variable.variablePushCopy");
  GetAllActions()["SceneVariablePushString"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["SceneVariablePushNumber"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["SceneVariablePushBool"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["SceneVariableRemoveAt"].SetFunctionName(
      "gdjs.evtTools.variable.variableRemoveAt");
  GetAllActions()["GlobalVariablePush"].SetFunctionName(
      "gdjs.evtTools.variable.variablePushCopy");
  GetAllActions()["GlobalVariablePushString"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["GlobalVariablePushNumber"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["GlobalVariablePushBool"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["GlobalVariableRemoveAt"].SetFunctionName(
      "gdjs.evtTools.variable.variableRemoveAt");

  GetAllActions()["ModVarScene"].SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameters()[2].GetPlainString());
        gd::String varGetter =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "scenevar",
                instruction.GetParameters()[0].GetPlainString());

        gd::String op = instruction.GetParameters()[1].GetPlainString();
        if (op == "=")
          return varGetter + ".setNumber(" + expressionCode + ");\n";
        else if (op == "+")
          return varGetter + ".add(" + expressionCode + ");\n";
        else if (op == "-")
          return varGetter + ".sub(" + expressionCode + ");\n";
        else if (op == "*")
          return varGetter + ".mul(" + expressionCode + ");\n";
        else if (op == "/")
          return varGetter + ".div(" + expressionCode + ");\n";

        return gd::String("");
      });

  GetAllActions()["ModVarSceneTxt"].SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                instruction.GetParameters()[2].GetPlainString());
        gd::String varGetter =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "scenevar",
                instruction.GetParameters()[0].GetPlainString());

        gd::String op = instruction.GetParameters()[1].GetPlainString();
        if (op == "=")
          return varGetter + ".setString(" + expressionCode + ");\n";
        else if (op == "+")
          return varGetter + ".concatenateString(" + expressionCode + ");\n";

        return gd::String("");
      });

  GetAllActions()["ModVarGlobal"].SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameters()[2].GetPlainString());
        gd::String varGetter =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "globalvar",
                instruction.GetParameters()[0].GetPlainString());

        gd::String op = instruction.GetParameters()[1].GetPlainString();
        if (op == "=")
          return varGetter + ".setNumber(" + expressionCode + ");\n";
        else if (op == "+")
          return varGetter + ".add(" + expressionCode + ");\n";
        else if (op == "-")
          return varGetter + ".sub(" + expressionCode + ");\n";
        else if (op == "*")
          return varGetter + ".mul(" + expressionCode + ");\n";
        else if (op == "/")
          return varGetter + ".div(" + expressionCode + ");\n";

        return gd::String("");
      });

  GetAllActions()["ModVarGlobalTxt"]
      .SetCustomCodeGenerator(
          [](gd::Instruction& instruction,
             gd::EventsCodeGenerator& codeGenerator,
             gd::EventsCodeGenerationContext& context) {
            gd::String expressionCode =
                gd::ExpressionCodeGenerator::GenerateExpressionCode(
                    codeGenerator,
                    context,
                    "string",
                    instruction.GetParameters()[2].GetPlainString());
            gd::String varGetter =
                gd::ExpressionCodeGenerator::GenerateExpressionCode(
                    codeGenerator,
                    context,
                    "globalvar",
                    instruction.GetParameters()[0].GetPlainString());

            gd::String op = instruction.GetParameters()[1].GetPlainString();
            if (op == "=")
              return varGetter + ".setString(" + expressionCode + ");\n";
            else if (op == "+")
              return varGetter + ".concatenateString(" + expressionCode +
                     ");\n";

            return gd::String("");
          });
}

}  // namespace gdjs
