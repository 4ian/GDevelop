/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "GDCpp/Extensions/Builtin/SceneExtension.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/Project/Project.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/SceneExtension.cpp"
#endif

SceneExtension::SceneExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsSceneExtension(*this);

#if defined(GD_IDE_ONLY)
  GetAllExpressions()["Random"]
      .SetFunctionName("GDpriv::CommonInstructions::Random")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllExpressions()["RandomInRange"]
      .SetFunctionName("GDpriv::CommonInstructions::RandomInRange")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllExpressions()["RandomFloat"]
      .SetFunctionName("GDpriv::CommonInstructions::RandomFloat")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllExpressions()["RandomFloatInRange"]
      .SetFunctionName("GDpriv::CommonInstructions::RandomFloatInRange")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllExpressions()["RandomWithStep"]
      .SetFunctionName("GDpriv::CommonInstructions::RandomWithStep")
      .SetIncludeFile("GDCpp/Extensions/Builtin/CommonInstructionsTools.h");
  GetAllStrExpressions()["CurrentSceneName"]
      .SetFunctionName("GetSceneName")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  GetAllConditions()["DepartScene"]
      .SetFunctionName("SceneJustBegins")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  GetAllActions()["Scene"]
      .SetFunctionName("ReplaceScene")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  GetAllActions()["PushScene"]
      .SetFunctionName("PushScene")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  GetAllActions()["PopScene"]
      .SetFunctionName("PopScene")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  GetAllActions()["Quit"]
      .SetFunctionName("StopGame")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  GetAllActions()["SceneBackground"]
      .SetFunctionName("ChangeSceneBackground")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");
  GetAllActions()["DisableInputWhenFocusIsLost"]
      .SetFunctionName("DisableInputWhenFocusIsLost")
      .SetIncludeFile("GDCpp/Extensions/Builtin/RuntimeSceneTools.h");

  GetAllConditions()["Egal"].codeExtraInformation.SetCustomCodeGenerator(
      [](gd::Instruction& instruction,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String value1Code;
        {
          gd::CallbacksForGeneratingExpressionCode callbacks(
              value1Code, codeGenerator, context);
          gd::ExpressionParser parser(
              instruction.GetParameters()[0].GetPlainString());
          if (!parser.ParseMathExpression(codeGenerator.GetPlatform(),
                                          codeGenerator.GetGlobalObjectsAndGroups(),
                                          codeGenerator.GetObjectsAndGroups(),
                                          callbacks) ||
              value1Code.empty())
            value1Code = "0";
        }

        gd::String value2Code;
        {
          gd::CallbacksForGeneratingExpressionCode callbacks(
              value2Code, codeGenerator, context);
          gd::ExpressionParser parser(
              instruction.GetParameters()[2].GetPlainString());
          if (!parser.ParseMathExpression(codeGenerator.GetPlatform(),
                                          codeGenerator.GetGlobalObjectsAndGroups(),
                                          codeGenerator.GetObjectsAndGroups(),
                                          callbacks) ||
              value2Code.empty())
            value2Code = "0";
        }

        if (instruction.GetParameters()[1].GetPlainString() == "=" ||
            instruction.GetParameters()[1].GetPlainString().empty())
          return "conditionTrue = (" + value1Code + " == " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == ">")
          return "conditionTrue = (" + value1Code + " > " + value2Code + ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == "<")
          return "conditionTrue = (" + value1Code + " < " + value2Code + ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == "<=")
          return "conditionTrue = (" + value1Code + " <= " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == ">=")
          return "conditionTrue = (" + value1Code + " >= " + value2Code +
                 ");\n";
        else if (instruction.GetParameters()[1].GetPlainString() == "!=")
          return "conditionTrue = (" + value1Code + " != " + value2Code +
                 ");\n";

        return gd::String("");
      });
#endif
}
