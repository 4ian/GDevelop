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
#include "GDL/CommonTools.h"
#include "GDL/Event.h"
#include "GDL/DynamicExtensionCallerEvent.h"
#include "GDL/EventsCodeGenerator.h"
#include "GDL/EventsCodeGenerationContext.h"

#include "GDL/ExtensionBase.h"

CommonInstructionsExtension::CommonInstructionsExtension()
{
    DECLARE_THE_EXTENSION("BuiltinCommonInstructions",
                          _("Évènements standards"),
                          _("Extension apportant des types d'évènements de base, intégrée en standard."),
                          "Compil Games",
                          "Freeware")



    DECLARE_CONDITION("Or",
                   _("Ou"),
                   _("Renvoie vraie si une seule des sous conditions est vraie"),
                   _("Si une de ces condition est vraie :"),
                   _("Avancé"),
                   "res/conditions/or24.png",
                   "res/conditions/or.png");

        class CodeGenerator : public InstructionInfos::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerationContext & parentContext)
            {
                //Conditions code
                std::string conditionsCode;
                std::vector<Instruction> & conditions = instruction.GetSubInstructions();
                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    //Each condition inherits the context from the "Or" condition:
                    //For example, two sub conditions using an object called "MyObject" will both have to declare a "MyObject" object list.
                    EventsCodeGenerationContext context;
                    context.InheritsFrom(parentContext);

                    string conditionCode = EventsCodeGenerator::GenerateConditionCode(game, scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", context);

                    conditionsCode += "{\n";

                    //Create new objects lists and generate condition
                    conditionsCode += context.GenerateObjectsDeclarationCode();
                    if ( !conditions[cId].GetType().empty() ) conditionsCode += conditionCode;

                    //If the condition is true : merge all objects picked in the final object lists.
                    conditionsCode += "if( condition"+ToString(cId)+"IsTrue ) {\n";
                    conditionsCode += "    conditionTrue = true;\n";
                    for ( set<string>::iterator it = context.objectsToBeDeclared.begin() ; it != context.objectsToBeDeclared.end(); ++it )
                    {
                        conditionsCode += "    for(unsigned int i = 0;i<"+*it+"objects.size();++i)\n";
                        conditionsCode += "    {\n";
                        conditionsCode += "        if ( find("+*it+"finalObjects.begin(), "+*it+"finalObjects.end(), "+*it+"objects[i]) == "+*it+"finalObjects.end())\n";
                        conditionsCode += "            "+*it+"finalObjects.push_back("+*it+"objects[i]);\n";
                        conditionsCode += "    }\n";
                    }
                    conditionsCode += "}\n";

                    conditionsCode += "}\n";

                    //"OR" condition must declare objects list, but without getting the objects from the scene. Lists are either empty or come from a parent event.
                    for ( set<string>::iterator it = context.objectsToBeDeclared.begin() ; it != context.objectsToBeDeclared.end(); ++it )
                        parentContext.EmptyObjectsListNeeded(*it);
                }

                //Declarations code
                std::string declarationsCode;
                for ( set<string>::iterator it = parentContext.objectsListsToBeDeclaredEmpty.begin() ; it != parentContext.objectsListsToBeDeclaredEmpty.end(); ++it )
                {
                    //We need to duplicate the object lists : The "final" ones will be filled with objects by conditions,
                    //but they will have no incidence on further conditions, as conditions use "normal" ones.
                    declarationsCode += "std::vector<Object*> "+*it+"finalObjects = "+*it+"objects;\n";
                }
                for (unsigned int i = 0;i<conditions.size();++i)
                    declarationsCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

                //Generate code
                string code;
                code += declarationsCode;
                code += conditionsCode;

                //When condition is finished, "final" objects lists become the "normal" ones.
                code += "{\n";
                for ( set<string>::iterator it = parentContext.objectsListsToBeDeclaredEmpty.begin() ; it != parentContext.objectsListsToBeDeclaredEmpty.end(); ++it )
                    code += *it+"objects = "+*it+"finalObjects;\n";
                code += "}\n";

                return code;
            };
        };

        InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
        instrInfo.canHaveSubInstructions = true;

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
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerationContext & parentContext)
            {
                string outputCode;

                outputCode += EventsCodeGenerator::GenerateConditionsListCode(game, scene, instruction.GetSubInstructions(), parentContext);

                std::string ifPredicat = "true";
                for (unsigned int i = 0;i<instruction.GetSubInstructions().size();++i)
                    ifPredicat += " && condition"+ToString(i)+"IsTrue";

                outputCode += "conditionTrue = (" +ifPredicat+ ");\n";

                return outputCode;
            };
        };

        InstructionInfos::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile
        instrInfo.cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<InstructionInfos::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
        instrInfo.canHaveSubInstructions = true;

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
            virtual std::string GenerateCode(const Game & game, const Scene & scene, Instruction & instruction, EventsCodeGenerationContext & parentContext)
            {
                std::vector<Instruction> & conditions = instruction.GetSubInstructions();
                string outputCode;

                for (unsigned int i = 0;i<conditions.size();++i)
                    outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    string conditionCode = EventsCodeGenerator::GenerateConditionCode(game, scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", parentContext);

                    outputCode += "{\n";
                    if ( !conditions[cId].GetType().empty() ) outputCode += conditionCode;
                    outputCode += "}\n";
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
        instrInfo.canHaveSubInstructions = true;

    DECLARE_END_CONDITION()

    DECLARE_EVENT("Standard",
                  _("Évènement standard"),
                  "Évènement standard : Actions qui sont lancées si des conditions sont vérifiées",
                  "",
                  "res/eventaddicon.png",
                  StandardEvent)

    DECLARE_END_EVENT()
/*
    DECLARE_EVENT("Link",
                  _("Lien"),
                  "Lien vers des évènements d'une autre scène",
                  "",
                  "res/lienaddicon.png",
                  LinkEvent)

    DECLARE_END_EVENT()*/

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
}
