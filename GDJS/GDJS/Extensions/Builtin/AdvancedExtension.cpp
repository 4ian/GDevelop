/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "AdvancedExtension.h"

#include "GDCore/CommonTools.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/ExpressionCodeGenerator.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs {

AdvancedExtension::AdvancedExtension() {
  gd::BuiltinExtensionsImplementer::ImplementsAdvancedExtension(*this);

  GetAllActions()["SetReturnNumber"]
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("");
        }
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "number",
                instruction.GetParameter(0).GetPlainString());

        return "eventsFunctionContext.returnValue = " + expressionCode + ";";
      });

  GetAllActions()["SetReturnString"]
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("");
        }
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                instruction.GetParameter(0).GetPlainString());

        return "eventsFunctionContext.returnValue = " + expressionCode + ";";
      });

  GetAllActions()["SetReturnBoolean"]
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("");
        }
        // This is duplicated from EventsCodeGenerator::GenerateParameterCodes
        gd::String parameter = instruction.GetParameter(0).GetPlainString();
        gd::String booleanCode =
            (parameter == "True" || parameter == "Vrai") ? "true" : "false";

        return "eventsFunctionContext.returnValue = " + booleanCode + ";";
      });

  GetAllActions()["CopyArgumentToVariable"]
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("");
        }
        // This is duplicated from EventsCodeGenerator::GenerateParameterCodes
        gd::String parameter = instruction.GetParameter(0).GetPlainString();
        gd::String variable =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "scenevar", instruction.GetParameter(1),
                "");

        return "gdjs.Variable.copy(eventsFunctionContext.getArgument(" +
               parameter + "), " + variable + ", false);\n";
      });

  GetAllActions()["CopyArgumentToVariable2"]
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("");
        }
        // This is duplicated from EventsCodeGenerator::GenerateParameterCodes
        gd::String parameter = instruction.GetParameter(0).GetPlainString();
        gd::String variable =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "variable", instruction.GetParameter(1),
                "");

        return "gdjs.Variable.copy(eventsFunctionContext.getArgument(" +
               parameter + "), " + variable + ", false);\n";
      });

  GetAllActions()["CopyVariableToArgument"]
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("");
        }
        // This is duplicated from EventsCodeGenerator::GenerateParameterCodes
        gd::String parameter = instruction.GetParameter(0).GetPlainString();
        gd::String variable =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "scenevar", instruction.GetParameter(1),
                "");

        return "gdjs.Variable.copy(" + variable +
               ", eventsFunctionContext.getArgument(" + parameter +
               "), false);\n";
      });

  GetAllActions()["CopyVariableToArgument2"]
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("");
        }
        // This is duplicated from EventsCodeGenerator::GenerateParameterCodes
        gd::String parameter = instruction.GetParameter(0).GetPlainString();
        gd::String variable =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "variable", instruction.GetParameter(1),
                "");

        return "gdjs.Variable.copy(" + variable +
               ", eventsFunctionContext.getArgument(" + parameter +
               "), false);\n";
      });

  GetAllConditions()["GetArgumentAsBoolean"]
      .SetCustomCodeGenerator([](gd::Instruction& instruction,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("false");
        }
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                instruction.GetParameter(0).GetPlainString());
        gd::String valueCode =
            gd::String(instruction.IsInverted() ? "!" : "!!") +
            "eventsFunctionContext.getArgument(" + parameterNameCode + ")";
        gd::String outputCode =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue", context) +
            " = " + valueCode + ";\n";
        return outputCode;
      });

  GetAllExpressions()["GetArgumentAsNumber"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](const std::vector<gd::Expression>& parameters,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("0");
        }
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                !parameters.empty() ? parameters[0].GetPlainString() : "");

        return "(Number(eventsFunctionContext.getArgument(" + parameterNameCode +
               ")) || 0)";
      });

  GetAllStrExpressions()["GetArgumentAsString"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](const std::vector<gd::Expression>& parameters,
                                 gd::EventsCodeGenerator& codeGenerator,
                                 gd::EventsCodeGenerationContext& context) {
        if (codeGenerator.HasProjectAndLayout()) {
            return gd::String("\"\"");
        }
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator,
                context,
                "string",
                !parameters.empty() ? parameters[0].GetPlainString() : "");

        return "\"\" + eventsFunctionContext.getArgument(" + parameterNameCode +
               ")";
      });

  GetAllConditions()["CompareArgumentAsNumber"]
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                instruction.GetParameter(0).GetPlainString());

        gd::String operatorString = instruction.GetParameter(1).GetPlainString();

        gd::String operandCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "number",
                instruction.GetParameter(2).GetPlainString());

        gd::String resultingBoolean =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue", context);

        return resultingBoolean + " = " +
               gd::String(instruction.IsInverted() ? "!" : "") + "(" +
               codeGenerator.GenerateRelationalOperation(
                   operatorString,
                   codeGenerator.HasProjectAndLayout()
                       ? "0"
                       : "(Number(eventsFunctionContext.getArgument(" +
                             parameterNameCode + ")) || 0)",
                   operandCode) +
               ");\n";
      });

  GetAllConditions()["CompareArgumentAsString"]
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                instruction.GetParameter(0).GetPlainString());

        gd::String operatorString = instruction.GetParameter(1).GetPlainString();

        gd::String operandCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                instruction.GetParameter(2).GetPlainString());

        gd::String resultingBoolean =
            codeGenerator.GenerateUpperScopeBooleanFullName("isConditionTrue", context);

        return resultingBoolean + " = " +
               gd::String(instruction.IsInverted() ? "!" : "") + "(" +
               codeGenerator.GenerateRelationalOperation(
                   operatorString,
                   codeGenerator.HasProjectAndLayout()
                       ? "\"\""
                       : "(\"\" + eventsFunctionContext.getArgument(" +
                             parameterNameCode + "))",
                   operandCode) +
               ");\n";
      });
}

} // namespace gdjs
