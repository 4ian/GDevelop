/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/BuiltinExtensions/SceneExtension.h"
#include "GDL/ExtensionBase.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/Events/EventsCodeGenerationContext.h"
#include "GDL/Events/EventsCodeNameMangler.h"
#include "GDL/Events/ExpressionsCodeGeneration.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"

SceneExtension::SceneExtension()
{
    DECLARE_THE_EXTENSION("BuiltinScene",
                          _("Scene management features"),
                          _("Builtin extension allowing to manipulate scenes"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_EXPRESSION("Random", _("Random value"), _("Random value"), _("Random"), "res/actions/position.png")
        instrInfo.AddParameter("expression", _("Maximum value"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("GDpriv::CommonInstructions::Random").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_CONDITION("DepartScene",
                   _("At the beginning of the scene"),
                   _("Is true only when scene just begins."),
                   _("At the beginning of the scene"),
                   _("Scene"),
                   "res/conditions/depart24.png",
                   "res/conditions/depart.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("SceneJustBegins").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("Scene",
                   _("Go to a scene"),
                   _("Change and start the specified scene."),
                   _("Go to scene _PARAM1_"),
                   _("Scene"),
                   "res/actions/goscene24.png",
                   "res/actions/goscene.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Name of the scene"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ChangeScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("Quit",
                   _("Quit the game"),
                   _("Quit the game"),
                   _("Quit the game"),
                   _("Scene"),
                   "res/actions/quit24.png",
                   "res/actions/quit.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("StopGame").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SceneBackground",
                   _("Change background color"),
                   _("Change the background color of the scene."),
                   _("Set background color to _PARAM1_"),
                   _("Scene"),
                   "res/actions/background24.png",
                   "res/actions/background.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("color", _("Color"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ChangeSceneBackground").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("DisableInputWhenFocusIsLost",
                   _("Disable input when focus is lost"),
                   _("Set if the keyboard and mouse buttons must be taken into account even\nif the window is not active."),
                   _("Disable input when focus is lost: _PARAM1_"),
                   _("Scene"),
                   "res/actions/window24.png",
                   "res/actions/window.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("yesorno", _("Deactivate input when focus is lost"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("DisableInputWhenFocusIsLost").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_CONDITION("Egal",
                   _("Compare two expressions"),
                   _("Test the two expression"),
                   _("_PARAM0_ _PARAM2_ _PARAM1_"),
                   _("Other"),
                   "res/conditions/egal24.png",
                   "res/conditions/egal.png");

        instrInfo.AddParameter("expression", _("Expression 1"), "",false);
        instrInfo.AddParameter("expression", _("Expression 2"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Sign of the test"), "",false);

        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, gd::Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                std::string value1Code;
                {
                    CallbacksForGeneratingExpressionCode callbacks(value1Code, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[0].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || value1Code.empty()) value1Code = "0";
                }

                std::string value2Code;
                {
                    CallbacksForGeneratingExpressionCode callbacks(value2Code, game, scene, codeGenerator, context);
                    gd::ExpressionParser parser(instruction.GetParameters()[1].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || value2Code.empty()) value2Code = "0";
                }

                if ( instruction.GetParameters()[2].GetPlainString() == "=" || instruction.GetParameters()[2].GetPlainString().empty() )
                    return "conditionTrue = ("+value1Code+" == "+value2Code+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == ">")
                    return "conditionTrue = ("+value1Code+" > "+value2Code+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "<")
                    return "conditionTrue = ("+value1Code+" < "+value2Code+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "<=")
                    return "conditionTrue = ("+value1Code+" <= "+value2Code+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == ">=")
                    return "conditionTrue = ("+value1Code+" >= "+value2Code+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "!=")
                    return "conditionTrue = ("+value1Code+" != "+value2Code+");\n";

                return "";
            };
        };

        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()
    #endif
}

