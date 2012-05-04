/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
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
                          _("Fonctionnalités de manipulation des scènes"),
                          _("Extension permettant de manipuler les scènes, integrée en standard"),
                          "Compil Games",
                          "Freeware")
    #if defined(GD_IDE_ONLY)

    DECLARE_EXPRESSION("Random", _("Valeur aléatoire"), _("Valeur aléatoire"), _("Aléatoire"), "res/actions/position.png")
        instrInfo.AddParameter("expression", _("Valeur maximale"), "", false);

        instrInfo.cppCallingInformation.SetFunctionName("Random").SetIncludeFile("GDL/BuiltinExtensions/CommonInstructionsTools.h");
    DECLARE_END_EXPRESSION()

    DECLARE_CONDITION("DepartScene",
                   _("Au lancement de la scène"),
                   _("Est vrai uniquement quand la scène vient juste d'être lancée."),
                   _("Au lancement de la scène"),
                   _("Scène"),
                   "res/conditions/depart24.png",
                   "res/conditions/depart.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("SceneJustBegins").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_CONDITION()

    DECLARE_ACTION("Scene",
                   _("Aller à une scène"),
                   _("Change et démarre la scène spécifiée."),
                   _("Aller à la scène _PARAM1_"),
                   _("Scène"),
                   "res/actions/goscene24.png",
                   "res/actions/goscene.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("string", _("Nom de la scène"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ChangeScene").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("Quit",
                   _("Quitter le jeu"),
                   _("Quitte le jeu."),
                   _("Quitter le jeu"),
                   _("Scène"),
                   "res/actions/quit24.png",
                   "res/actions/quit.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");

        instrInfo.cppCallingInformation.SetFunctionName("StopGame").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_ACTION("SceneBackground",
                   _("Changer la couleur d'arrière plan"),
                   _("Remplace la couleur d'arrière plan de la scène par celle indiquée."),
                   _("Remplacer la couleur d'arrière plan par _PARAM1_"),
                   _("Scène"),
                   "res/actions/background24.png",
                   "res/actions/background.png");

        instrInfo.AddCodeOnlyParameter("currentScene", "");
        instrInfo.AddParameter("color", _("Couleur"), "",false);

        instrInfo.cppCallingInformation.SetFunctionName("ChangeSceneBackground").SetIncludeFile("GDL/BuiltinExtensions/RuntimeSceneTools.h");

    DECLARE_END_ACTION()

    DECLARE_CONDITION("Egal",
                   _("Comparaisons d'expressions"),
                   _("Teste les deux expressions"),
                   _("_PARAM0_ _PARAM2_ _PARAM1_"),
                   _("Autre"),
                   "res/conditions/egal24.png",
                   "res/conditions/egal.png");

        instrInfo.AddParameter("expression", _("Expression 1"), "",false);
        instrInfo.AddParameter("expression", _("Expression 2"), "",false);
        instrInfo.AddParameter("relationalOperator", _("Signe du test"), "",false);

        class CodeGenerator : public InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & context)
            {
                std::string value1Code;
                {
                    CallbacksForGeneratingExpressionCode callbacks(value1Code, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[0].GetPlainString());
                    if (!parser.ParseMathExpression(game, scene, callbacks) || value1Code.empty()) value1Code = "0";
                }

                std::string value2Code;
                {
                    CallbacksForGeneratingExpressionCode callbacks(value2Code, game, scene, codeGenerator, context);
                    GDExpressionParser parser(instruction.GetParameters()[1].GetPlainString());
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
                else if ( instruction.GetParameters()[2].GetPlainString() == ">")
                    return "conditionTrue = ("+value1Code+" >= "+value2Code+");\n";
                else if ( instruction.GetParameters()[2].GetPlainString() == "!=")
                    return "conditionTrue = ("+value1Code+" != "+value2Code+");\n";

                return "";
            };
        };

        InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));

    DECLARE_END_CONDITION()
    #endif
}
