/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCpp/BuiltinExtensions/SceneExtension.h"
#include "GDCpp/ExtensionBase.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Project.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/SceneExtension.cpp"
#endif

SceneExtension::SceneExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsSceneExtension(*this);

    #if defined(GD_IDE_ONLY)
    GetAllExpressions()["Random"].SetFunctionName("GDpriv::CommonInstructions::Random").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    GetAllStrExpressions()["CurrentSceneName"].SetFunctionName("GetSceneName").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllConditions()["DepartScene"].SetFunctionName("SceneJustBegins").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["Scene"].SetFunctionName("ReplaceScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["PushScene"].SetFunctionName("PushScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["PopScene"].SetFunctionName("PopScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["Quit"].SetFunctionName("StopGame").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SceneBackground"].SetFunctionName("ChangeSceneBackground").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["DisableInputWhenFocusIsLost"].SetFunctionName("DisableInputWhenFocusIsLost").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    GetAllConditions()["Egal"].codeExtraInformation
        .SetCustomCodeGenerator([](gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context) {
            gd::String value1Code;
            {
                gd::CallbacksForGeneratingExpressionCode callbacks(value1Code, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[0].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || value1Code.empty()) value1Code = "0";
            }

            gd::String value2Code;
            {
                gd::CallbacksForGeneratingExpressionCode callbacks(value2Code, codeGenerator, context);
                gd::ExpressionParser parser(instruction.GetParameters()[2].GetPlainString());
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || value2Code.empty()) value2Code = "0";
            }

            if ( instruction.GetParameters()[1].GetPlainString() == "=" || instruction.GetParameters()[1].GetPlainString().empty() )
                return "conditionTrue = ("+value1Code+" == "+value2Code+");\n";
            else if ( instruction.GetParameters()[1].GetPlainString() == ">")
                return "conditionTrue = ("+value1Code+" > "+value2Code+");\n";
            else if ( instruction.GetParameters()[1].GetPlainString() == "<")
                return "conditionTrue = ("+value1Code+" < "+value2Code+");\n";
            else if ( instruction.GetParameters()[1].GetPlainString() == "<=")
                return "conditionTrue = ("+value1Code+" <= "+value2Code+");\n";
            else if ( instruction.GetParameters()[1].GetPlainString() == ">=")
                return "conditionTrue = ("+value1Code+" >= "+value2Code+");\n";
            else if ( instruction.GetParameters()[1].GetPlainString() == "!=")
                return "conditionTrue = ("+value1Code+" != "+value2Code+");\n";

            return gd::String("");
        });
    #endif
}
