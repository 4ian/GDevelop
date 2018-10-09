/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AdvancedExtension.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

AdvancedExtension::AdvancedExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsAdvancedExtension(*this);

  GetAllConditions()["Toujours"].SetFunctionName(
      "gdjs.evtTools.common.logicalNegation");

  GetAllActions()["SetReturnNumber"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        gd::String expressionCode;
        {
          gd::CallbacksForGeneratingExpressionCode callbacks(
              expressionCode, codeGenerator, context);
          gd::ExpressionParser parser(
              instruction.GetParameter(0).GetPlainString());
          if (!parser.ParseMathExpression(
                  codeGenerator.GetPlatform(),
                  codeGenerator.GetGlobalObjectsAndGroups(),
                  codeGenerator.GetObjectsAndGroups(),
                  callbacks) ||
              expressionCode.empty())
            expressionCode = "0";
        }

        return "eventsFunctionContext.returnValue = " + expressionCode + ";";
      });

  GetAllActions()["SetReturnString"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        gd::String expressionCode;
        {
          gd::CallbacksForGeneratingExpressionCode callbacks(
              expressionCode, codeGenerator, context);
          gd::ExpressionParser parser(
              instruction.GetParameter(0).GetPlainString());
          if (!parser.ParseStringExpression(
                  codeGenerator.GetPlatform(),
                  codeGenerator.GetGlobalObjectsAndGroups(),
                  codeGenerator.GetObjectsAndGroups(),
                  callbacks) ||
              expressionCode.empty())
            expressionCode = "\"\"";
        }

        return "eventsFunctionContext.returnValue = " + expressionCode + ";";
      });

  GetAllActions()["SetReturnBoolean"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        // This is duplicated from EventsCodeGenerator::GenerateParameterCodes
        gd::String parameter = instruction.GetParameter(0).GetPlainString();
        gd::String booleanCode =
            (parameter == "True" || parameter == "Vrai") ? "true" : "false";

        return "eventsFunctionContext.returnValue = " + booleanCode + ";";
      });

  auto generateParameterNameCode =
      [](const std::vector<gd::Expression>& parameters,
         gd::EventsCodeGenerator& codeGenerator,
         gd::EventsCodeGenerationContext& context) {
        gd::String parameterNameCode;
        {
          gd::CallbacksForGeneratingExpressionCode callbacks(
              parameterNameCode, codeGenerator, context);
          gd::ExpressionParser parser(
              !parameters.empty() ? parameters[0].GetPlainString() : "");
          if (!parser.ParseStringExpression(
                  codeGenerator.GetPlatform(),
                  codeGenerator.GetGlobalObjectsAndGroups(),
                  codeGenerator.GetObjectsAndGroups(),
                  callbacks) ||
              parameterNameCode.empty())
            parameterNameCode = "\"\"";
        }

        return parameterNameCode;
      };

  GetAllExpressions()["GetArgumentAsNumber"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([&generateParameterNameCode](
                                  const std::vector<gd::Expression>& parameters,
                                  gd::EventsCodeGenerator& codeGenerator,
                                  gd::EventsCodeGenerationContext& context) {
        gd::String parameterNameCode =
            generateParameterNameCode(parameters, codeGenerator, context);

        return "(Number(eventsFunctionContext.getArgument(" +
               parameterNameCode + ")) || 0)";
      });

  GetAllExpressions()["GetArgumentAsString"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([&generateParameterNameCode](
                                  const std::vector<gd::Expression>& parameters,
                                  gd::EventsCodeGenerator& codeGenerator,
                                  gd::EventsCodeGenerationContext& context) {
        gd::String parameterNameCode =
            generateParameterNameCode(parameters, codeGenerator, context);

        return "(\"\" + eventsFunctionContext.getArgument(" +
               parameterNameCode + "))";
      });
}

}  // namespace gdjs
