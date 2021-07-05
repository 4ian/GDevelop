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

  GetAllConditions()["Toujours"].SetFunctionName(
      "gdjs.evtTools.common.logicalNegation");

  GetAllActions()["SetReturnNumber"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "number",
                instruction.GetParameter(0).GetPlainString());

        return "if (typeof eventsFunctionContext !== 'undefined') { "
               "eventsFunctionContext.returnValue = " +
               expressionCode + "; }";
      });

  GetAllActions()["SetReturnString"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        gd::String expressionCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                instruction.GetParameter(0).GetPlainString());

        return "if (typeof eventsFunctionContext !== 'undefined') { "
               "eventsFunctionContext.returnValue = " +
               expressionCode + "; }";
      });

  GetAllActions()["SetReturnBoolean"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        // This is duplicated from EventsCodeGenerator::GenerateParameterCodes
        gd::String parameter = instruction.GetParameter(0).GetPlainString();
        gd::String booleanCode =
            (parameter == "True" || parameter == "Vrai") ? "true" : "false";

        return "if (typeof eventsFunctionContext !== 'undefined') { "
               "eventsFunctionContext.returnValue = " +
               booleanCode + "; }";
      });

  GetAllConditions()["GetArgumentAsBoolean"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](gd::Instruction &instruction,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                instruction.GetParameter(0).GetPlainString());
        gd::String valueCode =
            gd::String(instruction.IsInverted() ? "!" : "") +
            "(typeof eventsFunctionContext !== 'undefined' ? "
            "!!eventsFunctionContext.getArgument(" +
            parameterNameCode + ") : false)";
        gd::String outputCode =
            codeGenerator.GenerateBooleanFullName("conditionTrue", context) +
            ".val = " + valueCode + ";\n";
        return outputCode;
      });

  GetAllExpressions()["GetArgumentAsNumber"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](const std::vector<gd::Expression> &parameters,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                !parameters.empty() ? parameters[0].GetPlainString() : "");

        return "(typeof eventsFunctionContext !== 'undefined' ? "
               "Number(eventsFunctionContext.getArgument(" +
               parameterNameCode + ")) || 0 : 0)";
      });

  GetAllStrExpressions()["GetArgumentAsString"]
      .GetCodeExtraInformation()
      .SetCustomCodeGenerator([](const std::vector<gd::Expression> &parameters,
                                 gd::EventsCodeGenerator &codeGenerator,
                                 gd::EventsCodeGenerationContext &context) {
        gd::String parameterNameCode =
            gd::ExpressionCodeGenerator::GenerateExpressionCode(
                codeGenerator, context, "string",
                !parameters.empty() ? parameters[0].GetPlainString() : "");

        return "(typeof eventsFunctionContext !== 'undefined' ? \"\" + "
               "eventsFunctionContext.getArgument(" +
               parameterNameCode + ") : \"\")";
      });

  GetAllConditions()["CastTo"].GetCodeExtraInformation().SetCustomCodeGenerator(
      [](gd::Instruction &instruction, gd::EventsCodeGenerator &codeGenerator,
         gd::EventsCodeGenerationContext &context) {
        const gd::String &newType =
            instruction.GetParameter(1).GetPlainString();
        context.CastObjectTo(instruction.GetParameter(0).GetPlainString(),
                             newType);

        gd::String conditionCode = "{";

        for (gd::String objectName : codeGenerator.ExpandObjectsName(
                 instruction.GetParameter(0).GetPlainString(), context)) {
          context.SetCurrentObject(objectName);
          context.ObjectsListNeeded(objectName);
          // clang-format off
          gd::String objectListName = codeGenerator.GetObjectListName(objectName, context);

          // If the object has a picked instance of the required type...
          conditionCode += "if (" + objectListName + ".length !== 0 && " + objectListName + "[0] instanceof gdjs.getObjectConstructor(" + codeGenerator.ConvertToStringExplicit(newType) + ")) {\n";
          // Set the return value to true
          conditionCode += "    " + codeGenerator.GenerateBooleanFullName("conditionTrue", context) + ".val = true;\n";
          // Otherwise unpick all objects.
          conditionCode += "} else { " + objectListName + ".length = 0; }\n";

          // clang-format on
          context.SetNoCurrentObject();
        };

        conditionCode += "}";

        return conditionCode;
      });
}

} // namespace gdjs
