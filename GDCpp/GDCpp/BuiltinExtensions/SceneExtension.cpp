/*
 * GDevelop C++ Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
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
    GetAllExpressions()["Random"].codeExtraInformation.SetFunctionName("GDpriv::CommonInstructions::Random").SetIncludeFile("GDCpp/BuiltinExtensions/CommonInstructionsTools.h");
    GetAllConditions()["DepartScene"].codeExtraInformation.SetFunctionName("SceneJustBegins").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["Scene"].codeExtraInformation.SetFunctionName("ChangeScene").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["Quit"].codeExtraInformation.SetFunctionName("StopGame").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["SceneBackground"].codeExtraInformation.SetFunctionName("ChangeSceneBackground").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
    GetAllActions()["DisableInputWhenFocusIsLost"].codeExtraInformation.SetFunctionName("DisableInputWhenFocusIsLost").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string value1Code;
                {
                    gd::CallbacksForGeneratingExpressionCode callbacks(value1Code, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[0].GetPlainString());
                    if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), codeGenerator.GetLayout(), callbacks) || value1Code.empty()) value1Code = "0";
                }

                std::string value2Code;
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

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        GetAllConditions()["Egal"].codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }
    #endif
}

