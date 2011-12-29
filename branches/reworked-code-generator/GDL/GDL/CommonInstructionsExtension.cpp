/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/CommonInstructionsExtension.h"
#include "GDL/CommonInstructions.h"
#include "GDL/StandardEvent.h"
#include "GDL/CommentEvent.h"
#include "GDL/ForEachEvent.h"
#include "GDL/WhileEvent.h"
#include "GDL/RepeatEvent.h"
#include "GDL/LinkEvent.h"
#include "GDL/CommonTools.h"
#include "GDL/Event.h"
#include "GDL/DynamicExtensionCallerEvent.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/EventsCodeGenerationContext.h"
#include "GDL/EventsCodeNameMangler.h"

#include "GDL/ExtensionBase.h"

CommonInstructionsExtension::CommonInstructionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCommonInstructions",
                          _("Évènements standards"),
                          _("Extension apportant des types d'évènements de base, intégrée en standard."),
                          "Compil Games",
                          "Freeware")

    #if defined(GD_IDE_ONLY)
    DECLARE_CONDITION("Or",
                   _("Ou"),
                   _("Renvoie vraie si une seule des sous conditions est vraie"),
                   _("Si une de ces condition est vraie :"),
                   _("Avancé"),
                   "res/conditions/or24.png",
                   "res/conditions/or.png");

        class CodeGenerator : public InstructionInfos::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & parentContext)
            {
                //Conditions code
                std::string conditionsCode;
                std::vector<Instruction> & conditions = instruction.GetSubInstructions();

                //"OR" condition must declare objects list, but without picking the objects from the scene. Lists are either empty or come from a parent event.
                set<string> emptyListsNeeded;
                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    //Each condition inherits the context from the "Or" condition:
                    //For example, two sub conditions using an object called "MyObject" will both have to declare a "MyObject" object list.
                    EventsCodeGenerationContext context;
                    context.InheritsFrom(parentContext);

                    string conditionCode = codeGenerator.GenerateConditionCode(game, scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", context);

                    conditionsCode += "{\n";

                    //Create new objects lists and generate condition
                    conditionsCode += context.GenerateObjectsDeclarationCode();
                    if ( !conditions[cId].GetType().empty() ) conditionsCode += conditionCode;

                    //If the condition is true : merge all objects picked in the final object lists.
                    conditionsCode += "if( condition"+ToString(cId)+"IsTrue ) {\n";
                    conditionsCode += "    conditionTrue = true;\n";
                    std::set<std::string> objectsListsToBeDeclared = context.GetObjectsToBeDeclared();
                    for ( set<string>::iterator it = objectsListsToBeDeclared.begin() ; it != objectsListsToBeDeclared.end(); ++it )
                    {
                        emptyListsNeeded.insert(*it);
                        conditionsCode += "    for(unsigned int i = 0;i<"+ManObjListName(*it)+".size();++i)\n";
                        conditionsCode += "    {\n";
                        conditionsCode += "        if ( find("+ManObjListName(*it)+"final.begin(), "+ManObjListName(*it)+"final.end(), "+ManObjListName(*it)+"[i]) == "+ManObjListName(*it)+"final.end())\n";
                        conditionsCode += "            "+ManObjListName(*it)+"final.push_back("+ManObjListName(*it)+"[i]);\n";
                        conditionsCode += "    }\n";
                    }
                    conditionsCode += "}\n";

                    conditionsCode += "}\n";
                }

                std::string declarationsCode;

                //Declarations code
                for ( set<string>::iterator it = emptyListsNeeded.begin() ; it != emptyListsNeeded.end(); ++it )
                {
                    //"OR" condition must declare objects list, but without getting the objects from the scene. Lists are either empty or come from a parent event.
                    parentContext.EmptyObjectsListNeeded(*it);
                    //We need to duplicate the object lists : The "final" ones will be filled with objects by conditions,
                    //but they will have no incidence on further conditions, as conditions use "normal" ones.
                    declarationsCode += "std::vector<Object*> "+ManObjListName(*it)+"final;\n";
                }
                for (unsigned int i = 0;i<conditions.size();++i)
                    declarationsCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

                //Generate code
                string code;
                code += declarationsCode;
                code += conditionsCode;

                //When condition is finished, "final" objects lists become the "normal" ones.
                code += "{\n";
                for ( set<string>::iterator it = emptyListsNeeded.begin() ; it != emptyListsNeeded.end(); ++it )
                    code += ManObjListName(*it)+" = "+ManObjListName(*it)+"final;\n";
                code += "}\n";

                return code;
            };
        };
        InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
        instrInfo.SetCanHaveSubInstructions();

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("And",
                   _("Et"),
                   _("Renvoie vraie si toutes les sous conditions sont vraies"),
                   _("Si toutes ces conditions sont vraies :"),
                   _("Avancé"),
                   "res/conditions/and24.png",
                   "res/conditions/and.png");

        class CodeGenerator : public InstructionInfos::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & parentContext)
            {
                string outputCode;

                outputCode += codeGenerator.GenerateConditionsListCode(game, scene, instruction.GetSubInstructions(), parentContext);

                std::string ifPredicat = "true";
                for (unsigned int i = 0;i<instruction.GetSubInstructions().size();++i)
                    ifPredicat += " && condition"+ToString(i)+"IsTrue";

                outputCode += "conditionTrue = (" +ifPredicat+ ");\n";

                return outputCode;
            };
        };

        InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
        instrInfo.SetCanHaveSubInstructions();

    DECLARE_END_CONDITION()

    DECLARE_CONDITION("Not",
                   _("Non"),
                   _("Renvoie l'inverse du résultat des sous conditions"),
                   _("Inverser le résultat logique de ces conditions :"),
                   _("Avancé"),
                   "res/conditions/not24.png",
                   "res/conditions/not.png");

        class CodeGenerator : public InstructionInfos::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerator & codeGenerator, EventsCodeGenerationContext & parentContext)
            {
                std::vector<Instruction> & conditions = instruction.GetSubInstructions();
                string outputCode;

                for (unsigned int i = 0;i<conditions.size();++i)
                    outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    string conditionCode = codeGenerator.GenerateConditionCode(game, scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", parentContext);

                    if ( !conditions[cId].GetType().empty() )
                    {
                        for (unsigned int i = 0;i<cId;++i) //Skip conditions if one condition is true. //TODO : Can be optimized
                        {
                            if (i == 0) outputCode += "if ( "; else outputCode += " && ";
                            outputCode += "!condition"+ToString(i)+"IsTrue";
                            if (i == cId-1) outputCode += ") ";
                        }

                        outputCode += "{\n"+conditionCode+"}\n";
                    }
                }

                std::string ifPredicat = "true";
                for (unsigned int i = 0;i<conditions.size();++i)
                    ifPredicat += " && !condition"+ToString(i)+"IsTrue";

                outputCode += "conditionTrue = (" +ifPredicat+ ");\n";

                return outputCode;
            };
        };

        InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
        instrInfo.SetCanHaveSubInstructions();

    DECLARE_END_CONDITION()

    DECLARE_EVENT("Standard",
                  _("Évènement standard"),
                  "Évènement standard : Actions qui sont lancées si des conditions sont vérifiées",
                  "",
                  "res/eventaddicon.png",
                  StandardEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Link",
                  _("Lien"),
                  "Lien vers des évènements d'une autre scène",
                  "",
                  "res/lienaddicon.png",
                  LinkEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Comment",
                  _("Commentaire"),
                  "Un évènement permettant d'ajouter un commentaire dans la liste des évènements",
                  "",
                  "res/comment.png",
                  CommentEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("While",
                  _("Tant que"),
                  "Répète des conditions et actions tant que certaines conditions ne sont pas vérifiées",
                  "",
                  "res/while.png",
                  WhileEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("Repeat",
                  _("Répéter"),
                  "Répète un certain nombre de fois des conditions et actions",
                  "",
                  "res/repeat.png",
                  RepeatEvent)

    DECLARE_END_EVENT()

    DECLARE_EVENT("ForEach",
                  _("Pour chaque objet"),
                  "Répète des conditions et actions en prenant à chaque fois un objet ayant le nom indiqué",
                  "",
                  "res/foreach.png",
                  ForEachEvent)

    DECLARE_END_EVENT()
    /*
    #if !defined(GD_NO_DYNAMIC_EXTENSIONS)
    DECLARE_EVENT("DynamicExtensionCaller",
                  _("Code C++"),
                  "Execute du code C++",
                  "",
                  "res/source_cpp16.png",
                  DynamicExtensionCallerEvent)

    DECLARE_END_EVENT()
    #endif*/

    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "sfml-audio-2.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "sfml-graphics-2.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "sfml-network-2.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "sfml-window-2.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "sfml-system-2.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libsndfile-1.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "openal32.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "mingwm10.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libgcc_s_sjlj-1.dll"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Windows", "libstdc++-6.dll"));

    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libFLAC.so.7"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libfreetype.so.6"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libopenal.so.0"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-audio.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-graphics.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-network.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-system.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-window.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsndfile.so.1"));

    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "libsfml-audio.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "libsfml-graphics.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-network.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-system.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-window.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "sndfile"));
    #endif
}
