/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "SceneExtension.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

SceneExtension::SceneExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsSceneExtension(*this);

  GetAllExpressions()["Random"].SetFunctionName("gdjs.random");
  GetAllExpressions()["RandomInRange"].SetFunctionName("gdjs.randomInRange");
  GetAllExpressions()["RandomFloat"].SetFunctionName("gdjs.randomFloat");
  GetAllExpressions()["RandomFloatInRange"].SetFunctionName(
      "gdjs.randomFloatInRange");
  GetAllExpressions()["RandomWithStep"].SetFunctionName("gdjs.randomWithStep");
  GetAllStrExpressions()["CurrentSceneName"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.getSceneName");

  GetAllConditions()["DepartScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.sceneJustBegins");
  GetAllActions()["SceneBackground"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.setBackgroundColor");
  GetAllActions()["Scene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.replaceScene");
  GetAllActions()["PushScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.pushScene");
  GetAllActions()["PopScene"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.popScene");
  GetAllActions()["Quit"].SetFunctionName(
      "gdjs.evtTools.runtimeScene.stopGame");

  GetAllConditions()["Egal"].codeExtraInformation.SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String value1Code =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameters()[0].GetPlainString());

        gd::String value2Code =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameters()[2].GetPlainString());

        gd::String resultingBoolean =
            codeGenerator.GenerateBooleanFullName("conditionTrue", context) +
            ".val";

        if (instruction.GetParameters()[1].GetPlainString() == "=" ||
            instruction.GetParameters()[1].GetPlainString().empty())
          return resultingBoolean + " = (" + value1Code + " == " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == ">")
          return resultingBoolean + " = (" + value1Code + " > " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == "<")
          return resultingBoolean + " = (" + value1Code + " < " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == "<=")
          return resultingBoolean + " = (" + value1Code + " <= " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == ">=")
          return resultingBoolean + " = (" + value1Code + " >= " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == "!=")
          return resultingBoolean + " = (" + value1Code + " != " + value2Code +
                 ");\n";

        return gd::String("");
      });

  StripUnimplementedInstructionsAndExpressions();
}

}  // namespace gdjs
