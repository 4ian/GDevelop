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
#include "GDCore/IDE/Events/ExpressionVariableNameFinder.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"

using namespace gd;

namespace gdjs {

VariablesExtension::VariablesExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsVariablesExtension(*this);

  GetAllConditions()["NumberVariable"].SetCustomCodeGenerator(
      [](gd::Instruction &instruction, gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &context) {
        const auto &variableName = instruction.GetParameters()[0].GetPlainString();
        gd::String getterCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "variableOrPropertyOrParameter",
                variableName);
        gd::String op = instruction.GetParameters()[1].GetPlainString();
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "number",
                instruction.GetParameters()[2].GetPlainString());

        gd::String resultingBoolean =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue",
                                                            context);

        const auto variablesContainersList =
            codeGenerator.GetProjectScopedContainers().GetVariablesContainersList();
        const auto& variablesContainer =
            variablesContainersList.GetVariablesContainerFromVariableName(
                variableName);
        const auto sourceType = variablesContainer.GetSourceType();
        if (sourceType != gd::VariablesContainer::SourceType::Properties &&
            sourceType != gd::VariablesContainer::SourceType::Parameters) {
            getterCode += ".getAsNumber()";
        }

        return resultingBoolean + " = " +
               gd::String(instruction.IsInverted() ? "!" : "") + "(" +
               codeGenerator.GenerateRelationalOperation(op, getterCode,
                                                         expressionCode) +
               ");\n";
      });
  GetAllConditions()["StringVariable"].SetCustomCodeGenerator(
      [](gd::Instruction &instruction, gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &context) {
        const auto &variableName = instruction.GetParameters()[0].GetPlainString();
        gd::String getterCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "variableOrPropertyOrParameter",
                instruction.GetParameters()[0].GetPlainString());
        gd::String op = instruction.GetParameters()[1].GetPlainString();
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                instruction.GetParameters()[2].GetPlainString());

        const auto variablesContainersList =
            codeGenerator.GetProjectScopedContainers().GetVariablesContainersList();
        const auto& variablesContainer =
            variablesContainersList.GetVariablesContainerFromVariableName(
                variableName);
        const auto sourceType = variablesContainer.GetSourceType();
        if (sourceType != gd::VariablesContainer::SourceType::Properties &&
            sourceType != gd::VariablesContainer::SourceType::Parameters) {
            getterCode += ".getAsString()";
        }

        gd::String resultingBoolean =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue",
                                                            context);

        return resultingBoolean + " = " +
               gd::String(instruction.IsInverted() ? "!" : "") + "(" +
               codeGenerator.GenerateRelationalOperation(op, getterCode,
                                                         expressionCode) +
               ");\n";
      });
  GetAllConditions()["BooleanVariable"].SetCustomCodeGenerator(
      [](gd::Instruction &instruction, gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &context) {
        const auto &variableName = instruction.GetParameters()[0].GetPlainString();
        gd::String getterCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "variableOrPropertyOrParameter",
                instruction.GetParameters()[0].GetPlainString());
        bool isOperandTrue =
            instruction.GetParameters()[1].GetPlainString() == "True";

        const auto variablesContainersList =
            codeGenerator.GetProjectScopedContainers().GetVariablesContainersList();
        const auto& variablesContainer =
            variablesContainersList.GetVariablesContainerFromVariableName(
                variableName);
        const auto sourceType = variablesContainer.GetSourceType();
        if (sourceType != gd::VariablesContainer::SourceType::Properties &&
            sourceType != gd::VariablesContainer::SourceType::Parameters) {
            getterCode += ".getAsBoolean()";
        }

        gd::String resultingBoolean =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue",
                                                            context);

        return resultingBoolean + " = " +
               gd::String(instruction.IsInverted() == isOperandTrue ? "!"
                                                                    : "") +
               getterCode + ";\n";
      });

  GetAllStrExpressions()["VariableFirstString"].SetFunctionName(
      "gdjs.evtTools.variable.getFirstVariableString");
  GetAllExpressions()["VariableFirstNumber"].SetFunctionName(
      "gdjs.evtTools.variable.getFirstVariableNumber");
  GetAllStrExpressions()["VariableLastString"].SetFunctionName(
      "gdjs.evtTools.variable.getLastVariableString");
  GetAllExpressions()["VariableLastNumber"].SetFunctionName(
      "gdjs.evtTools.variable.getLastVariableNumber");

  GetAllExpressions()["VariableChildCount"].SetCustomCodeGenerator(
      [](const std::vector<gd::Expression> &parameters,
         gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &context) {
        // This expression used to be declared with a scenevar parameter.
        return "gdjs.evtTools.variable.getVariableChildCount(" +
               codeGenerator.GenerateAnyOrSceneVariableGetter(parameters[0],
                                                              context) +
               ")";
      });
  GetAllConditions()["VariableChildCount"].SetFunctionName(
      "gdjs.evtTools.variable.getVariableChildCount");
  GetAllConditions()["VariableChildExists2"].SetFunctionName(
      "gdjs.evtTools.variable.variableChildExists");
  GetAllActions()["RemoveVariableChild"].SetFunctionName(
      "gdjs.evtTools.variable.variableRemoveChild");
  GetAllActions()["ClearVariableChildren"].SetFunctionName(
      "gdjs.evtTools.variable.variableClearChildren");

  GetAllActions()["PushVariable"].SetFunctionName(
      "gdjs.evtTools.variable.variablePushCopy");
  GetAllActions()["PushString"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["PushNumber"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["PushBoolean"].SetFunctionName(
      "gdjs.evtTools.variable.valuePush");
  GetAllActions()["RemoveVariableAt"].SetFunctionName(
      "gdjs.evtTools.variable.variableRemoveAt");

  GetAllActions()["SetBooleanVariable"].SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {

        const auto &variableName = instruction.GetParameters()[0].GetPlainString();
        gd::String getterCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "variableOrProperty",
                variableName);
        gd::String op = instruction.GetParameters()[1].GetPlainString();

        const auto variablesContainersList =
            codeGenerator.GetProjectScopedContainers().GetVariablesContainersList();
        const auto& variablesContainer =
            variablesContainersList.GetVariablesContainerFromVariableName(
                variableName);
        const auto sourceType = variablesContainer.GetSourceType();
        if (sourceType == gd::VariablesContainer::SourceType::Properties) {
            const auto &propertiesContainersList =
                codeGenerator.GetProjectScopedContainers().GetPropertiesContainersList();
            const auto &propertiesContainerAndProperty =
                propertiesContainersList.Get(variableName);

          if (op == "True") {
            return codeGenerator.GeneratePropertySetterWithoutCasting(
                propertiesContainerAndProperty.first,
                propertiesContainerAndProperty.second,
                "true");
          }
          else if (op == "False") {
            return codeGenerator.GeneratePropertySetterWithoutCasting(
                propertiesContainerAndProperty.first,
                propertiesContainerAndProperty.second,
                "false");
          }
          else if (op == "Toggle") {
            return codeGenerator.GeneratePropertySetterWithoutCasting(
                propertiesContainerAndProperty.first,
                propertiesContainerAndProperty.second,
                "!" + getterCode);
          }
          return gd::String("");
        }

        if (op == "True")
          return getterCode + ".setBoolean(true);\n";
        else if (op == "False")
          return getterCode + ".setBoolean(false);\n";
        else if (op == "Toggle")
          return "gdjs.evtTools.variable.toggleVariableBoolean(" + getterCode + ");\n";

        return gd::String("");
      });

  GetAllActions()["SetNumberVariable"].SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {

        const auto &variableName = instruction.GetParameters()[0].GetPlainString();
        gd::String getterCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "variableOrProperty",
                variableName);
        gd::String op = instruction.GetParameters()[1].GetPlainString();
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameters()[2].GetPlainString());

        const auto variablesContainersList =
            codeGenerator.GetProjectScopedContainers().GetVariablesContainersList();
        const auto& variablesContainer =
            variablesContainersList.GetVariablesContainerFromVariableName(
                variableName);
        const auto sourceType = variablesContainer.GetSourceType();
        if (sourceType == gd::VariablesContainer::SourceType::Properties) {
            const auto &propertiesContainersList =
                codeGenerator.GetProjectScopedContainers().GetPropertiesContainersList();
            const auto &propertiesContainerAndProperty =
                propertiesContainersList.Get(variableName);

          if (op == "=") {
            return codeGenerator.GeneratePropertySetterWithoutCasting(
                propertiesContainerAndProperty.first,
                propertiesContainerAndProperty.second,
                expressionCode);
          }
          else {
            return codeGenerator.GeneratePropertySetterWithoutCasting(
                propertiesContainerAndProperty.first,
                propertiesContainerAndProperty.second,
                getterCode + op + expressionCode);
          }
        }

        if (op == "=")
          return getterCode + ".setNumber(" + expressionCode + ");\n";
        else if (op == "+")
          return getterCode + ".add(" + expressionCode + ");\n";
        else if (op == "-")
          return getterCode + ".sub(" + expressionCode + ");\n";
        else if (op == "*")
          return getterCode + ".mul(" + expressionCode + ");\n";
        else if (op == "/")
          return getterCode + ".div(" + expressionCode + ");\n";

        return gd::String("");
      });

  GetAllActions()["SetStringVariable"].SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
  
        const auto &variableName = instruction.GetParameters()[0].GetPlainString();
        gd::String getterCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "variableOrProperty",
                variableName);
        gd::String op = instruction.GetParameters()[1].GetPlainString();
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                instruction.GetParameters()[2].GetPlainString());

        const auto variablesContainersList =
            codeGenerator.GetProjectScopedContainers().GetVariablesContainersList();
        const auto& variablesContainer =
            variablesContainersList.GetVariablesContainerFromVariableName(
                variableName);
        const auto sourceType = variablesContainer.GetSourceType();
        if (sourceType == gd::VariablesContainer::SourceType::Properties) {
            const auto &propertiesContainersList =
                codeGenerator.GetProjectScopedContainers().GetPropertiesContainersList();
            const auto &propertiesContainerAndProperty =
                propertiesContainersList.Get(variableName);

          if (op == "=") {
            return codeGenerator.GeneratePropertySetterWithoutCasting(
                propertiesContainerAndProperty.first,
                propertiesContainerAndProperty.second,
                expressionCode);
          }
          else {
            return codeGenerator.GeneratePropertySetterWithoutCasting(
                propertiesContainerAndProperty.first,
                propertiesContainerAndProperty.second,
                getterCode + op + expressionCode);
          }
        }

        if (op == "=")
          return getterCode + ".setString(" + expressionCode + ");\n";
        else if (op == "+")
          return getterCode + ".concatenateString(" + expressionCode + ");\n";

        return gd::String("");
      });

  // Legacy instructions

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
