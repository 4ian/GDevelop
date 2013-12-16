/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include <set>
#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#endif
#include "GDCpp/BuiltinExtensions/CommonInstructionsExtension.h"
#include "GDCpp/BuiltinExtensions/CommonInstructionsTools.h"
#include "GDCpp/IDE/DependenciesAnalyzer.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCpp/CppCodeEvent.h"
#include "GDCpp/CommonTools.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include "GDCpp/ExtensionBase.h"

using namespace std;

CommonInstructionsExtension::CommonInstructionsExtension()
{
    SetExtensionInformation("BuiltinCommonInstructions",
                          _("Standard events"),
                          _("Built-in extension providing standard events."),
                          "Florian Rival",
                          "Freeware");

    #if defined(GD_IDE_ONLY)
    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
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

                    string conditionCode = codeGenerator.GenerateConditionCode(conditions[cId], "condition"+ToString(cId)+"IsTrue", context);

                    conditionsCode += "{\n";

                    //Create new objects lists and generate condition
                    conditionsCode += codeGenerator.GenerateObjectsDeclarationCode(context);
                    if ( !conditions[cId].GetType().empty() ) conditionsCode += conditionCode;

                    //If the condition is true : merge all objects picked in the final object lists.
                    conditionsCode += "if( condition"+ToString(cId)+"IsTrue ) {\n";
                    conditionsCode += "    conditionTrue = true;\n";
                    std::set<std::string> objectsListsToBeDeclared = context.GetAllObjectsToBeDeclared();
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
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("Or",
                   _("Or"),
                   _("Return true if one of the sub conditions is true"),
                   _("If one of these conditions is true :"),
                   _("Advanced"),
                   "res/conditions/or24.png",
                   "res/conditions/or.png")
            .SetCanHaveSubInstructions()
            .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                string outputCode;

                outputCode += codeGenerator.GenerateConditionsListCode(instruction.GetSubInstructions(), parentContext);

                std::string ifPredicat = "true";
                for (unsigned int i = 0;i<instruction.GetSubInstructions().size();++i)
                    ifPredicat += " && condition"+ToString(i)+"IsTrue";

                outputCode += "conditionTrue = (" +ifPredicat+ ");\n";

                return outputCode;
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("And",
                   _("And"),
                   _("Return true if all sub conditions are true"),
                   _("If all of these conditions are true :"),
                   _("Advanced"),
                   "res/conditions/and24.png",
                   "res/conditions/and.png")
            .SetCanHaveSubInstructions()
            .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                std::vector<gd::Instruction> & conditions = instruction.GetSubInstructions();
                string outputCode;

                for (unsigned int i = 0;i<conditions.size();++i)
                    outputCode += "bool condition"+ToString(i)+"IsTrue = false;\n";

                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    string conditionCode = codeGenerator.GenerateConditionCode(conditions[cId], "condition"+ToString(cId)+"IsTrue", parentContext);

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
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGenerator = new CodeGenerator; //Need for code to compile

        AddCondition("Not",
                   _("No"),
                   _("Return the contrary of the result of the sub conditions"),
                   _("Invert the logical result of these conditions :"),
                   _("Advanced"),
                   "res/conditions/not24.png",
                   "res/conditions/not.png")
            .SetCanHaveSubInstructions()
            .codeExtraInformation.SetCustomCodeGenerator(boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGenerator));
    }


    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string outputCode;
                gd::StandardEvent & event = dynamic_cast<gd::StandardEvent&>(event_);

                outputCode += codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);

                std::string ifPredicat;
                for (unsigned int i = 0;i<event.GetConditions().size();++i)
                {
                    if (i!=0) ifPredicat += " && ";
                    ifPredicat += "condition"+ToString(i)+"IsTrue";
                }

                if ( !ifPredicat.empty() ) outputCode += "if (" +ifPredicat+ ")\n";
                outputCode += "{\n";
                outputCode += codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                if ( event.HasSubEvents() ) //Sub events
                {
                    outputCode += "\n{\n";
                    outputCode += codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                    outputCode += "}\n";
                }

                outputCode += "}\n";

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        AddEvent("Standard",
                  _("Standard event"),
                  _("Standard event: Actions are run if conditions are fulfilled."),
                  "",
                  "res/eventaddicon.png",
                  boost::shared_ptr<gd::BaseEvent>(new gd::StandardEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                gd::LinkEvent & event = dynamic_cast<gd::LinkEvent&>(event_);

                //This function is called only when the link refers to external events compiled separately. ( See LinkEvent::Preprocess )
                //We must generate code to call these external events.
                std::string outputCode;

                std::string functionCall = EventsCodeNameMangler::GetInstance()->GetExternalEventsFunctionMangledName(event.GetTarget())+"(runtimeContext);";
                std::string functionDeclaration = "void "+EventsCodeNameMangler::GetInstance()->GetExternalEventsFunctionMangledName(event.GetTarget())+"(RuntimeContext * context);";
                outputCode += functionCall+"\n";
                codeGenerator.AddGlobalDeclaration(functionDeclaration);

                return outputCode;
            }

            virtual void Preprocess(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator,
                                    std::vector < gd::BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
            {
                gd::LinkEvent & event = dynamic_cast<gd::LinkEvent&>(event_);
                gd::Project & project = codeGenerator.GetProject();
                const gd::Layout & scene = codeGenerator.GetLayout();

                //Find if the link refers to externals events...
                gd::ExternalEvents * linkedExternalEvents = NULL;
                if ( project.HasExternalEventsNamed(event.GetTarget()) )
                    linkedExternalEvents = &project.GetExternalEvents(event.GetTarget());

                //...and  check if the external events can be compiled separately
                DependenciesAnalyzer analyzer(project);
                if (linkedExternalEvents != NULL &&
                    analyzer.ExternalEventsCanBeCompiledForAScene(linkedExternalEvents->GetName()) == scene.GetName()) //Check if the link refers to events
                {                                                                                                      //compiled separately.
                    //There is nothing more to do for now: The code calling the external events will be generated in CodeGen::Generate.
                    return;
                }

                //If the link does not refers to separately compiled external events,
                //just replace it by the linked events.
                event.ReplaceLinkByLinkedEvents(codeGenerator.GetProject(), eventList, indexOfTheEventInThisList);
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        AddEvent("Link",
                  _("Link"),
                  _("Link to some external events"),
                  "",
                  "res/lienaddicon.png",
                  boost::shared_ptr<gd::BaseEvent>(new gd::LinkEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
    }

    {
        AddEvent("Comment",
                  _("Comment"),
                  _("Event displaying a text in the events editor"),
                  "",
                  "res/comment.png",
                  boost::shared_ptr<gd::BaseEvent>(new gd::CommentEvent));
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                std::string outputCode;
                gd::WhileEvent & event = dynamic_cast<gd::WhileEvent&>(event_);

                //Context is "reset" each time the event is repeated ( i.e. objects are picked again )
                gd::EventsCodeGenerationContext context;
                context.InheritsFrom(parentContext);
                if ( event.HasInfiniteLoopWarning() && !codeGenerator.GenerateCodeForRuntime() ) codeGenerator.AddIncludeFile("GDCpp/BuiltinExtensions/RuntimeSceneTools.h");

                //Prepare codes
                std::string whileConditionsStr = codeGenerator.GenerateConditionsListCode(event.GetWhileConditions(), context);
                std::string whileIfPredicat = "true"; for (unsigned int i = 0;i<event.GetWhileConditions().size();++i) whileIfPredicat += " && condition"+ToString(i)+"IsTrue";
                std::string conditionsCode = codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);
                std::string actionsCode = codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                std::string ifPredicat = "true"; for (unsigned int i = 0;i<event.GetConditions().size();++i) ifPredicat += " && condition"+ToString(i)+"IsTrue";

                //Write final code
                outputCode += "bool stopDoWhile = false;";
                if ( event.HasInfiniteLoopWarning() && !codeGenerator.GenerateCodeForRuntime() ) outputCode += "unsigned int loopCount = 0;";
                outputCode += "do";
                outputCode += "{\n";
                outputCode += codeGenerator.GenerateObjectsDeclarationCode(context);
                outputCode +=  whileConditionsStr;
                outputCode += "if ("+whileIfPredicat+")\n";
                outputCode += "{\n";
                if ( event.HasInfiniteLoopWarning() && !codeGenerator.GenerateCodeForRuntime() )
                {
                    outputCode += "if (loopCount == 100000) { if ( WarnAboutInfiniteLoop(*runtimeContext->scene) ) break; }\n";
                    outputCode += "loopCount++;\n\n";
                }
                outputCode += conditionsCode;
                outputCode += "if (" +ifPredicat+ ")\n";
                outputCode += "{\n";
                outputCode += actionsCode;
                outputCode += "\n{ //Subevents: \n";
                outputCode += codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                outputCode += "} //Subevents end.\n";
                outputCode += "}\n";
                outputCode += "} else stopDoWhile = true; \n";

                outputCode += "} while ( !stopDoWhile );\n";

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        AddEvent("While",
                  _("While"),
                  _("The event is repeated while the conditions are true"),
                  "",
                  "res/while.png",
                  boost::shared_ptr<gd::BaseEvent>(new gd::WhileEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                std::string outputCode;
                gd::RepeatEvent & event = dynamic_cast<gd::RepeatEvent&>(event_);

                const gd::Layout & scene = codeGenerator.GetLayout();

                std::string repeatNumberExpression = event.GetRepeatExpression();

                //Prepare expression containing how many times event must be repeated
                std::string repeatCountCode;
                gd::CallbacksForGeneratingExpressionCode callbacks(repeatCountCode, codeGenerator, parentContext);
                gd::ExpressionParser parser(repeatNumberExpression);
                if (!parser.ParseMathExpression(codeGenerator.GetPlatform(), codeGenerator.GetProject(), scene, callbacks) || repeatCountCode.empty()) repeatCountCode = "0";

                //Context is "reset" each time the event is repeated ( i.e. objects are picked again )
                gd::EventsCodeGenerationContext context;
                context.InheritsFrom(parentContext);

                //Prepare conditions/actions codes
                std::string conditionsCode = codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);
                std::string actionsCode = codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                std::string ifPredicat = "true"; for (unsigned int i = 0;i<event.GetConditions().size();++i) ifPredicat += " && condition"+ToString(i)+"IsTrue";

                //Prepare object declaration and sub events
                std::string subevents = codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                std::string objectDeclaration = codeGenerator.GenerateObjectsDeclarationCode(context)+"\n";

                //Write final code
                outputCode += "int repeatCount = "+repeatCountCode+";\n";
                outputCode += "for(unsigned int repeatIndex = 0;repeatIndex < repeatCount;++repeatIndex)\n";
                outputCode += "{\n";
                outputCode += objectDeclaration;
                outputCode += conditionsCode;
                outputCode += "if (" +ifPredicat+ ")\n";
                outputCode += "{\n";
                outputCode += actionsCode;
                if ( event.HasSubEvents() )
                {
                    outputCode += "\n{ //Subevents: \n";
                    outputCode += subevents;
                    outputCode += "} //Subevents end.\n";
                }
                outputCode += "}\n";

                outputCode += "}\n";

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        AddEvent("Repeat",
                  _("Repeat"),
                  _("Event repeated a number of times"),
                  "",
                  "res/repeat.png",
                  boost::shared_ptr<gd::BaseEvent>(new gd::RepeatEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                std::string outputCode;
                gd::ForEachEvent & event = dynamic_cast<gd::ForEachEvent&>(event_);

                const gd::Project & game = codeGenerator.GetProject();
                const gd::Layout & scene = codeGenerator.GetLayout();

                //TODO: Use codeGenerator.ExpandObjectsName?
                //std::vector<std::string> realObjects = codeGenerator.ExpandObjectsName(event.GetObjectToPick(), const gd::EventsCodeGenerationContext &context)
                std::string objectToPick = event.GetObjectToPick();

                vector< gd::ObjectGroup >::const_iterator globalGroup = find_if(game.GetObjectGroups().begin(), game.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectToPick));
                vector< gd::ObjectGroup >::const_iterator sceneGroup = find_if(scene.GetObjectGroups().begin(), scene.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(), objectToPick));

                std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
                if ( globalGroup != game.GetObjectGroups().end() )
                    realObjects = (*globalGroup).GetAllObjectsNames();
                else if ( sceneGroup != scene.GetObjectGroups().end() )
                    realObjects = (*sceneGroup).GetAllObjectsNames();
                else
                    realObjects.push_back(objectToPick);

                //Ensure that all returned objects actually exists.
                for (unsigned int i = 0; i < realObjects.size();)
                {
                    if ( !codeGenerator.GetLayout().HasObjectNamed(realObjects[i]) && !codeGenerator.GetProject().HasObjectNamed(realObjects[i]) )
                        realObjects.erase(realObjects.begin()+i);
                    else
                        ++i;
                }

                if ( realObjects.empty() ) return "";

                for (unsigned int i = 0;i<realObjects.size();++i)
                    parentContext.ObjectsListNeeded(realObjects[i]);

                //Context is "reset" each time the event is repeated ( i.e. objects are picked again )
                gd::EventsCodeGenerationContext context;
                context.InheritsFrom(parentContext);

                //Prepare conditions/actions codes
                std::string conditionsCode = codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);
                std::string actionsCode = codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                std::string ifPredicat = "true";
                for (unsigned int i = 0;i<event.GetConditions().size();++i) ifPredicat += " && condition"+ToString(i)+"IsTrue";

                //Prepare object declaration and sub events
                std::string subevents = codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);

                std::string objectDeclaration = codeGenerator.GenerateObjectsDeclarationCode(context)+"\n";

                if ( realObjects.size() != 1) //(We write a slighty more simple ( and optimized ) output code when only one object list is used.)
                {
                    outputCode += "unsigned int forEachTotalCount = 0;";
                    outputCode += "std::vector<RuntimeObject*> forEachObjects;";
                    for (unsigned int i = 0;i<realObjects.size();++i)
                    {
                        outputCode += "unsigned int forEachCount"+ToString(i)+" = "+ManObjListName(realObjects[i])+".size(); forEachTotalCount += forEachCount"+ToString(i)+";";
                        outputCode += "forEachObjects.insert("+ string(i == 0 ? "forEachObjects.begin()" : "forEachObjects.end()") +", "+ManObjListName(realObjects[i])+".begin(), "+ManObjListName(realObjects[i])+".end());";
                    }
                }

                //Write final code :

                //For loop declaration
                if ( realObjects.size() == 1 ) //We write a slighty more simple ( and optimized ) output code when only one object list is used.
                    outputCode += "for(unsigned int forEachIndex = 0;forEachIndex < "+ManObjListName(realObjects[0])+".size();++forEachIndex)\n";
                else
                    outputCode += "for(unsigned int forEachIndex = 0;forEachIndex < forEachTotalCount;++forEachIndex)\n";

                outputCode += "{\n";

                //Clear all concerned objects lists and keep only one object
                if ( realObjects.size() == 1 )
                {
                    outputCode += "std::vector<RuntimeObject*> temporaryForEachList; temporaryForEachList.push_back("+ManObjListName(realObjects[0])+"[forEachIndex]);";
                    outputCode += "std::vector<RuntimeObject*> "+ManObjListName(realObjects[0])+" = temporaryForEachList;\n";
                }
                else
                {
                    //Declare all lists of concerned objects empty
                    for (unsigned int j = 0;j<realObjects.size();++j)
                        outputCode += "std::vector<RuntimeObject*> "+ManObjListName(realObjects[j])+";\n";

                    for (unsigned int i = 0;i<realObjects.size();++i) //Pick then only one object
                    {
                        std::string count;
                        for (unsigned int j = 0;j<=i;++j)
                        {
                            if (j!=0) count+= "+";
                            count += "forEachCount"+ToString(j);
                        }

                        if ( i != 0 ) outputCode += "else ";
                        outputCode += "if (forEachIndex < "+count+") {\n";
                        outputCode += "    "+ManObjListName(realObjects[i])+".push_back(forEachObjects[forEachIndex]);\n";
                        outputCode += "}\n";
                    }
                }

                outputCode += "{"; //This scope is used as the for loop modified the objects list.
                outputCode += objectDeclaration;

                outputCode += conditionsCode;
                outputCode += "if (" +ifPredicat+ ")\n";
                outputCode += "{\n";
                outputCode += actionsCode;
                if ( event.HasSubEvents() )
                {
                    outputCode += "\n{ //Subevents: \n";
                    outputCode += subevents;
                    outputCode += "} //Subevents end.\n";
                }
                outputCode += "}\n";

                outputCode += "}";

                outputCode += "}\n"; //End of for loop

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        AddEvent("ForEach",
                  _("For each object"),
                  _("Repeat the event for each specified object."),
                  "",
                  "res/foreach.png",
                  boost::shared_ptr<gd::BaseEvent>(new gd::ForEachEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                CppCodeEvent & event = dynamic_cast<CppCodeEvent&>(event_);

                const gd::Project & project = codeGenerator.GetProject();
                const gd::Layout & scene = codeGenerator.GetLayout();

                //Note: The associated source file is compiled separately ( it is recognized as a Source File dependency by
                //DependenciesAnalyzer and compiled by CodeCompilationHelpers);

                //Generate the code to call the associated source file
                std::string functionPrototype = "void "+event.GetFunctionToCall()+"("+ (event.GetPassSceneAsParameter() ? "RuntimeScene & scene" :"")
                                                + ((event.GetPassSceneAsParameter() && event.GetPassObjectListAsParameter()) ? ", ":"")
                                                + (event.GetPassObjectListAsParameter() ? "std::vector<RuntimeObject*> objectsList" :"") + ");";
                codeGenerator.AddGlobalDeclaration(functionPrototype+"\n");

                std::string outputCode;
                outputCode += "{";

                //Prepare objects list if needed
                if ( event.GetPassObjectListAsParameter() )
                {
                    std::string objectToPassAsParameter = event.GetObjectToPassAsParameter();

                    vector< gd::ObjectGroup >::const_iterator globalGroup = find_if(project.GetObjectGroups().begin(),
                                                                                    project.GetObjectGroups().end(),
                                                                                    bind2nd(gd::GroupHasTheSameName(), objectToPassAsParameter));
                    vector< gd::ObjectGroup >::const_iterator sceneGroup = find_if(scene.GetObjectGroups().begin(),
                                                                                   scene.GetObjectGroups().end(), bind2nd(gd::GroupHasTheSameName(),
                                                                                                                          objectToPassAsParameter));

                    std::vector<std::string> realObjects; //With groups, we may have to generate condition for more than one object list.
                    if ( globalGroup != project.GetObjectGroups().end() )
                        realObjects = (*globalGroup).GetAllObjectsNames();
                    else if ( sceneGroup != scene.GetObjectGroups().end() )
                        realObjects = (*sceneGroup).GetAllObjectsNames();
                    else
                        realObjects.push_back(objectToPassAsParameter);

                    //Ensure that all returned objects actually exists.
                    for (unsigned int i = 0; i < realObjects.size();)
                    {
                        if ( !codeGenerator.GetLayout().HasObjectNamed(realObjects[i]) && !codeGenerator.GetProject().HasObjectNamed(realObjects[i]) )
                            realObjects.erase(realObjects.begin()+i);
                        else
                            ++i;
                    }
                    
                    if ( realObjects.empty() ) return "";

                    outputCode += "std::vector<RuntimeObject*> functionObjects;";
                    for (unsigned int i = 0;i<realObjects.size();++i)
                    {
                        parentContext.ObjectsListNeeded(realObjects[i]);
                        outputCode += "functionObjects.insert("+ string(i == 0 ? "functionObjects.begin()" : "functionObjects.end()") +", "+ManObjListName(realObjects[i])+".begin(), "+ManObjListName(realObjects[i])+".end());";
                    }
                }

                std::string functionCall = event.GetFunctionToCall()+"("+ (event.GetPassSceneAsParameter() ? "*runtimeContext->scene" :"")
                                           +((event.GetPassSceneAsParameter() && event.GetPassObjectListAsParameter()) ? ", ":"")
                                           +(event.GetPassObjectListAsParameter() ? "functionObjects" :"") + ");";
                outputCode += ""+functionCall+"\n";

                outputCode += "}";
                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        AddEvent("CppCode",
                  _("C++ code ( Experimental )"),
                  _("Execute C++ code"),
                  "",
                  "res/source_cpp16.png",
                  boost::shared_ptr<gd::BaseEvent>(new CppCodeEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));
    }

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

