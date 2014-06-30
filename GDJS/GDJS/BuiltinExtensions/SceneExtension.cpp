/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "SceneExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Tools/Localization.h"

namespace gdjs
{

SceneExtension::SceneExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsSceneExtension(*this);

    SetExtensionInformation("BuiltinScene",
                          _("Scene management features"),
                          _("Built-in extension allowing to manipulate scenes"),
                          "Florian Rival",
                          "Open source (LGPL)");

    GetAllExpressions()["Random"].codeExtraInformation
        .SetFunctionName("gdjs.random");

    GetAllConditions()["DepartScene"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.sceneJustBegins");
    GetAllActions()["SceneBackground"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.setBackgroundColor");
    GetAllActions()["Scene"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.changeScene");
    GetAllActions()["Quit"].codeExtraInformation
        .SetFunctionName("gdjs.evtTools.runtimeScene.stopGame");

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

                std::string resultingBoolean = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val";

                if ( instruction.GetParameters()[1].GetPlainString() == "=" || instruction.GetParameters()[1].GetPlainString().empty() )
                    return resultingBoolean + " = ("+value1Code+" == "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == ">")
                    return resultingBoolean + " = ("+value1Code+" > "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == "<")
                    return resultingBoolean + " = ("+value1Code+" < "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == "<=")
                    return resultingBoolean + " = ("+value1Code+" <= "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == ">=")
                    return resultingBoolean + " = ("+value1Code+" >= "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == "!=")
                    return resultingBoolean + " = ("+value1Code+" != "+value2Code+");\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator;

        GetAllConditions()["Egal"].codeExtraInformation
            .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    StripUnimplementedInstructionsAndExpressions(); //Unimplemented things are listed here:
        /*

    AddAction("DisableInputWhenFocusIsLost",
                   _("Disable input when focus is lost"),
                   _("Set if the keyboard and mouse buttons must be taken into account even\nif the window is not active."),
                   _("Disable input when focus is lost: _PARAM1_"),
                   _("Scene"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Deactivate input when focus is lost"))
        .codeExtraInformation.SetFunctionName("DisableInputWhenFocusIsLost").SetIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");
        */

}

}
