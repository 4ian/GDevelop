/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include <set>
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#endif
#include "GDL/BuiltinExtensions/CommonInstructionsExtension.h"
#include "GDL/BuiltinExtensions/CommonInstructionsTools.h"
#include "GDL/StandardEvent.h"
#include "GDL/CommentEvent.h"
#include "GDL/ForEachEvent.h"
#include "GDL/WhileEvent.h"
#include "GDL/RepeatEvent.h"
#include "GDL/CppCodeEvent.h"
#include "GDL/LinkEvent.h"
#include "GDL/CommonTools.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDL/ExtensionBase.h"

using namespace std;

CommonInstructionsExtension::CommonInstructionsExtension()
{
    SetExtensionInformation("BuiltinCommonInstructions",
                          _("Standard events"),
                          _("Builtin extension providing standard events."),
                          "Compil Games",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    {
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const gd::Project & project, const gd::Layout & scene, gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                //Conditions code
                std::string conditionsCode;
                std::vector<gd::Instruction> & conditions = instruction.GetSubInstructions();

                //"OR" condition must declare objects list, but without picking the objects from the scene. Lists are either empty or come from a parent event.
                set<string> emptyListsNeeded;
                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    //Each condition inherits the context from the "Or" condition:
                    //For example, two sub conditions using an object called "MyObject" will both have to declare a "MyObject" object list.
                    gd::EventsCodeGenerationContext context;
                    context.InheritsFrom(parentContext);

                    string conditionCode = codeGenerator.GenerateConditionCode(scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", context);

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
                    declarationsCode += "std::vector<RuntimeObject*> "+ManObjListName(*it)+"final;\n";
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
        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("Or",
                   _("Or"),
                   _("Return true if one of the sub conditions is true"),
                   _("If one of these conditions is true :"),
                   _("Advanced"),
                   "res/conditions/or24.png",
                   "res/conditions/or.png")
            .SetCanHaveSubInstructions()
            .cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const gd::Project & project, const gd::Layout & scene, gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                string outputCode;

                outputCode += codeGenerator.GenerateConditionsListCode(scene, instruction.GetSubInstructions(), parentContext);

                std::string ifPredicat = "true";
                for (unsigned int i = 0;i<instruction.GetSubInstructions().size();++i)
                    ifPredicat += " && condition"+ToString(i)+"IsTrue";

                outputCode += "conditionTrue = (" +ifPredicat+ ");\n";

                return outputCode;
            };
        };
        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("And",
                   _("And"),
                   _("Return true if all sub conditions are true"),
                   _("If all of these conditions are true :"),
                   _("Advanced"),
                   "res/conditions/and24.png",
                   "res/conditions/and.png")
            .SetCanHaveSubInstructions()
            .cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(const gd::Project & project, const gd::Layout & scene, gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                std::vector<gd::Instruction> & conditions = instruction.GetSubInstructions();
                string outputCode;

                for (unsigned int i = 0;i<conditions.size();++i)
                    outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    string conditionCode = codeGenerator.GenerateConditionCode(scene, conditions[cId], "condition"+ToString(cId)+"IsTrue", parentContext);

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
        gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("Not",
                   _("No"),
                   _("Return the contrary of the result of the sub conditions"),
                   _("Invert the logical result of these conditions :"),
                   _("Advanced"),
                   "res/conditions/not24.png",
                   "res/conditions/not.png")
            .SetCanHaveSubInstructions()
            .cppCallingInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::CppCallingInformation::CustomCodeGenerator>(codeGenerator));
    }



    AddEvent("Standard",
              _("Standard event"),
              _("Standard event: Actions are run if conditions are fulfilled."),
              "",
              "res/eventaddicon.png",
              boost::shared_ptr<gd::BaseEvent>(new StandardEvent));

    AddEvent("Link",
              _("Link"),
              _("Link to some external events"),
              "",
              "res/lienaddicon.png",
              boost::shared_ptr<gd::BaseEvent>(new LinkEvent));

    AddEvent("Comment",
              _("Comment"),
              _("Event displaying a text in the events editor"),
              "",
              "res/comment.png",
              boost::shared_ptr<gd::BaseEvent>(new CommentEvent));

    AddEvent("While",
              _("While"),
              _("The event is repeated while the conditions are true"),
              "",
              "res/while.png",
              boost::shared_ptr<gd::BaseEvent>(new WhileEvent));

    AddEvent("Repeat",
              _("Repeat"),
              _("Event repeated a number of times"),
              "",
              "res/repeat.png",
              boost::shared_ptr<gd::BaseEvent>(new RepeatEvent));

    AddEvent("ForEach",
              _("For each object"),
              _("Repeat the event for each specified object."),
              "",
              "res/foreach.png",
              boost::shared_ptr<gd::BaseEvent>(new ForEachEvent));

    AddEvent("CppCode",
              _("C++ code ( Experimental )"),
              _("Execute C++ code"),
              "",
              "res/source_cpp16.png",
              boost::shared_ptr<gd::BaseEvent>(new CppCodeEvent));

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

    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libFLAC.so.8"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libfreetype.so.6"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libGLEW.so.1.5"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libGLEW.so.1.8"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libopenal.so.0"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libopenal.so.1"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-audio.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-graphics.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-network.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-system.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsfml-window.so.2"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Linux", "libsndfile.so.1"));

    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "libsfml-audio.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "libsfml-graphics.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "libsfml-network.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "libsfml-system.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "libsfml-window.2.0.dylib"));
    supplementaryRuntimeFiles.push_back(std::pair<std::string, std::string>("Mac", "sndfile"));
    #endif
}

