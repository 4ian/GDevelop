#include "SceneExtension.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/InstructionMetadata.h"
#include <wx/intl.h>
//Ensure the wxWidgets macro "_" returns a std::string
#if defined(_)
    #undef _
#endif
#define _(s) std::string(wxGetTranslation((s)).mb_str())

SceneExtension::SceneExtension()
{
    SetExtensionInformation("BuiltinScene",
                          _("Scene management features"),
                          _("Builtin extension allowing to manipulate scenes"),
                          "Compil Games",
                          "Freeware");
    CloneExtension("Game Develop C++ platform", "BuiltinScene");

    GetAllExpressions()["Random"].codeExtraInformation
        .SetFunctionName("gdjs.random");

    GetAllConditions()["DepartScene"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.sceneJustBegins");
    GetAllActions()["SceneBackground"].codeExtraInformation
        .SetFunctionName("gdjs.runtimeSceneTools.setBackgroundColor");

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
                    return "conditionTrue.val = ("+value1Code+" == "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == ">")
                    return "conditionTrue.val = ("+value1Code+" > "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == "<")
                    return "conditionTrue.val = ("+value1Code+" < "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == "<=")
                    return "conditionTrue.val = ("+value1Code+" <= "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == ">=")
                    return "conditionTrue.val = ("+value1Code+" >= "+value2Code+");\n";
                else if ( instruction.GetParameters()[1].GetPlainString() == "!=")
                    return "conditionTrue.val = ("+value1Code+" != "+value2Code+");\n";

                return "";
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator;

        GetAllConditions()["Egal"].codeExtraInformation
            .SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

        /*

    AddAction("Scene",
                   _("Go to a scene"),
                   _("Change and start the specified scene."),
                   _("Go to scene _PARAM1_"),
                   _("Scene"),
                   "res/actions/goscene24.png",
                   "res/actions/goscene.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("string", _("Name of the scene"), "",false)
        .codeExtraInformation.SetFunctionName("ChangeScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("Quit",
                   _("Quit the game"),
                   _("Quit the game"),
                   _("Quit the game"),
                   _("Scene"),
                   "res/actions/quit24.png",
                   "res/actions/quit.png")
        .AddCodeOnlyParameter("currentScene", "")
        .codeExtraInformation.SetFunctionName("StopGame").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    AddAction("DisableInputWhenFocusIsLost",
                   _("Disable input when focus is lost"),
                   _("Set if the keyboard and mouse buttons must be taken into account even\nif the window is not active."),
                   _("Disable input when focus is lost: _PARAM1_"),
                   _("Scene"),
                   "res/actions/window24.png",
                   "res/actions/window.png")
        .AddCodeOnlyParameter("currentScene", "")
        .AddParameter("yesorno", _("Deactivate input when focus is lost"))
        .codeExtraInformation.SetFunctionName("DisableInputWhenFocusIsLost").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");
        */

}
