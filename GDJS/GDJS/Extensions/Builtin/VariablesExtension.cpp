/*
 * GDevelop JS Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDJS/Extensions/Builtin/VariablesExtension.h"
#include "GDCore/Extensions/Builtin/AllBuiltinExtensions.h"
#include "GDJS/Events/CodeGeneration/VariableParserCallbacks.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Events/CodeGeneration/ExpressionsCodeGeneration.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
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
                          "Open source (MIT License)");

    GetAllConditions()["VarScene"].SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllConditions()["VarSceneTxt"].SetFunctionName("gdjs.evtTools.common.getVariableString");
    GetAllConditions()["VarGlobal"].SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllConditions()["VarGlobalTxt"].SetFunctionName("gdjs.evtTools.common.getVariableString");
    GetAllExpressions()["Variable"].SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllStrExpressions()["VariableString"].SetFunctionName("gdjs.evtTools.common.getVariableString");
    GetAllExpressions()["VariableChildCount"].SetFunctionName("gdjs.evtTools.common.getVariableChildCount");
    GetAllExpressions()["GlobalVariableChildCount"].SetFunctionName("gdjs.evtTools.common.getVariableChildCount");
    GetAllExpressions()["GlobalVariable"].SetFunctionName("gdjs.evtTools.common.getVariableNumber");
    GetAllStrExpressions()["GlobalVariableString"].SetFunctionName("gdjs.evtTools.common.getVariableString");

    GetAllConditions()["VarSceneDef"].SetFunctionName("gdjs.evtTools.common.sceneVariableExists");
    GetAllConditions()["VarGlobalDef"].SetFunctionName("gdjs.evtTools.common.globalVariableExists");

    GetAllConditions()["VariableChildExists"].SetFunctionName("gdjs.evtTools.common.variableChildExists");
    GetAllConditions()["GlobalVariableChildExists"].SetFunctionName("gdjs.evtTools.common.variableChildExists");
    GetAllActions()["VariableRemoveChild"].SetFunctionName("gdjs.evtTools.common.variableRemoveChild");
    GetAllActions()["GlobalVariableRemoveChild"].SetFunctionName("gdjs.evtTools.common.variableRemoveChild");
    GetAllActions()["VariableClearChildren"].SetFunctionName("gdjs.evtTools.common.variableClearChildren");
    GetAllActions()["GlobalVariableClearChildren"].SetFunctionName("gdjs.evtTools.common.variableClearChildren");

    GetAllActions()["ModVarScene"].codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
            gd::String expressionCode;
            {
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "0";
            }
            gd::String varGetter;
            {
                VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::LAYOUT_VARIABLE);
                gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                if ( !parser.Parse(callbacks) )
                    varGetter = "runtimeScene.getVariables().get(\"\")";
            }

            gd::String op = instruction.GetParameters()[1].GetPlainString();
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

            return gd::String("");
        });

    GetAllActions()["ModVarSceneTxt"].codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
            gd::String expressionCode;
            {
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "\"\"";
            }

            gd::String varGetter;
            {
                VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::LAYOUT_VARIABLE);
                gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                if ( !parser.Parse(callbacks) )
                    varGetter = "runtimeScene.getVariables().get(\"\")";
            }

            gd::String op = instruction.GetParameters()[1].GetPlainString();
            if ( op == "=" )
                return varGetter+".setString("+expressionCode+");\n";
            else if ( op == "+" )
                return varGetter+".concatenate("+expressionCode+");\n";

            return gd::String("");
        });

    GetAllActions()["ModVarGlobal"].codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
            gd::String expressionCode;
            {
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "0";
            }
            gd::String varGetter;
            {
                VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::PROJECT_VARIABLE);
                gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                if ( !parser.Parse(callbacks) )
                    varGetter = "runtimeScene.getVariables().get(\"\")";
            }

            gd::String op = instruction.GetParameters()[1].GetPlainString();
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

            return gd::String("");
        });

    GetAllActions()["ModVarGlobalTxt"].codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
            gd::String expressionCode;
            {
                gd::CallbacksForGeneratingExpressionCode callbacks(expressionCode, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                if (!parser.ParseStringExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || expressionCode.empty())
                    expressionCode = "\"\"";
            }

            gd::String varGetter;
            {
                VariableCodeGenerationCallbacks callbacks(varGetter, codeGenerator, context, VariableCodeGenerationCallbacks::PROJECT_VARIABLE);
                gd::VariableParser parser(instruction.GetParameters()[0].GetPlainString());
                if ( !parser.Parse(callbacks) )
                    varGetter = "runtimeScene.getVariables().get(\"\")";
            }

            gd::String op = instruction.GetParameters()[1].GetPlainString();
            if ( op == "=" )
                return varGetter+".setString("+expressionCode+");\n";
            else if ( op == "+" )
                return varGetter+".concatenate("+expressionCode+");\n";

            return gd::String("");
        });
}

}
