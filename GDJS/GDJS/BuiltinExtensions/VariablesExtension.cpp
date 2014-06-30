/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "GDJS/BuiltinExtensions/VariablesExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDJS/VariableParserCallbacks.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"

using namespace gd;

namespace gdjs
{

VariablesExtension::VariablesExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsVariablesExtension(*this);

    SetExtensionInformation("BuiltinVariables",
                          _("Variable features"),
                          _("Built-in extension allowing to manipulate variables"),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllConditions()["VarScene"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllConditions()["VarSceneTxt"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableString");
    GetAllConditions()["VarGlobal"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllConditions()["VarGlobalTxt"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableString");
    GetAllExpressions()["Variable"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllStrExpressions()["VariableString"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableString");
    GetAllExpressions()["GlobalVariable"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllStrExpressions()["GlobalVariableString"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.getVariableString");

    GetAllConditions()["VarSceneDef"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.sceneVariableExists");
    GetAllConditions()["VarGlobalDef"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.globalVariableExists");

    GetAllConditions()["VariableChildExists"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.variableChildExists");
    GetAllConditions()["GlobalVariableChildExists"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.variableChildExists");
    GetAllActions()["VariableRemoveChild"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.variableRemoveChild");
    GetAllActions()["GlobalVariableRemoveChild"].codeExtraInformation.SetFunctionName("gdjs.evtTools.common.variableRemoveChild");

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                        expressionCode = "0";
                }
                std::string varGetter;
                {
                    VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::LAYOUT_VARIABLE);
                    gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                    if ( !parser.Parse(callbacks) )
                        varGetter = "runtimeScene.getVariables().get(\"\")";
                }

                std::string op = instruction.GetParameters()[1].GetPlainString();
                if ( op == "=" )
                    return varGetter+".setNumber("+expressionCode+");\n";
                else if ( op == "+" )
                    return varGetter+".add("+expressionCode+");\n";
                else if ( op == "-" )
                    return varGetter+".sub("+expressionCode+");\n";
                else if ( op == "*" )
                    return varGetter+".mul("+expressionCode+");\n";
                else if ( op == "/" )
                    return varGetter+".div("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarScene"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                        expressionCode = "\"\"";
                }

                std::string varGetter;
                {
                    VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::LAYOUT_VARIABLE);
                    gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                    if ( !parser.Parse(callbacks) )
                        varGetter = "runtimeScene.getVariables().get(\"\")";
                }

                std::string op = instruction.GetParameters()[1].GetPlainString();
                if ( op == "=" )
                    return varGetter+".setString("+expressionCode+");\n";
                else if ( op == "+" )
                    return varGetter+".concatenate("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarSceneTxt"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                        expressionCode = "0";
                }
                std::string varGetter;
                {
                    VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::PROJECT_VARIABLE);
                    gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                    if ( !parser.Parse(callbacks) )
                        varGetter = "runtimeScene.getVariables().get(\"\")";
                }

                std::string op = instruction.GetParameters()[1].GetPlainString();
                if ( op == "=" )
                    return varGetter+".setNumber("+expressionCode+");\n";
                else if ( op == "+" )
                    return varGetter+".add("+expressionCode+");\n";
                else if ( op == "-" )
                    return varGetter+".sub("+expressionCode+");\n";
                else if ( op == "*" )
                    return varGetter+".mul("+expressionCode+");\n";
                else if ( op == "/" )
                    return varGetter+".div("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarGlobal"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string expressionCode;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                    if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                        expressionCode = "\"\"";
                }

                std::string varGetter;
                {
                    VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::PROJECT_VARIABLE);
                    gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                    if ( !parser.Parse(callbacks) )
                        varGetter = "runtimeScene.getVariables().get(\"\")";
                }

                std::string op = instruction.GetParameters()[1].GetPlainString();
                if ( op == "=" )
                    return varGetter+".setString("+expressionCode+");\n";
                else if ( op == "+" )
                    return varGetter+".concatenate("+expressionCode+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;
        GetAllActions()["ModVarGlobalTxt"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen));
    }
}

}
