/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "CommonInstructionsExtension.h"
#include "GDCore/BuiltinExtensions/AllBuiltinExtensions.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/Builtin/StandardEvent.h"
#include "GDCore/Events/Builtin/CommentEvent.h"
#include "GDCore/Events/Builtin/ForEachEvent.h"
#include "GDCore/Events/Builtin/WhileEvent.h"
#include "GDCore/Events/Builtin/RepeatEvent.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/ExpressionsCodeGeneration.h"
#include <set>
#include "GDCore/Tools/Localization.h"
#include "GDJS/JsCodeEvent.h"

using namespace std;
using namespace gd;

namespace gdjs
{

CommonInstructionsExtension::CommonInstructionsExtension()
{
    gd::BuiltinExtensionsImplementer::ImplementsCommonInstructionsExtension(*this);

    SetExtensionInformation("BuiltinCommonInstructions",
                          _("Standard events"),
                          _("Built-in extension providing standard events."),
                          "Florian Rival",
                          "Open source (LGPL)");

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual void Preprocess(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator,
                                    gd::EventsList & eventList, unsigned int indexOfTheEventInThisList)
            {
                gd::LinkEvent & event = dynamic_cast<gd::LinkEvent&>(event_);
                event.ReplaceLinkByLinkedEvents(codeGenerator.GetProject(), eventList, indexOfTheEventInThisList);
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["BuiltinCommonInstructions::Link"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }

    {
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::string outputCode;
                gd::StandardEvent & event = dynamic_cast<gd::StandardEvent&>(event_);

                outputCode += codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);

                std::string ifPredicat = event.GetConditions().empty() ? "" : codeGenerator.GenerateBooleanFullName("condition"+gd::ToString(event.GetConditions().size()-1)+"IsTrue", context)+".val";

                if ( !ifPredicat.empty() ) outputCode += "if (" +ifPredicat+ ") {\n";
                outputCode += codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                if ( event.HasSubEvents() ) //Sub events
                {
                    outputCode += "\n{ //Subevents\n";
                    outputCode += codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                    outputCode += "} //End of subevents\n";
                }

                if ( !ifPredicat.empty() ) outputCode += "}\n";

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["BuiltinCommonInstructions::Standard"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }

    {
        //If we do not add a code generator to the comments, they will be stripped as considered as not implemented by the platform.
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                return "";
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["BuiltinCommonInstructions::Comment"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                std::string codeNamespace = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())+"Code.";

                //Conditions code
                std::string conditionsCode;
                std::vector<gd::Instruction> & conditions = instruction.GetSubInstructions();

                //"OR" condition must declare objects list, but without picking the objects from the scene.
                //Lists are either empty or come from a parent event.
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
                    conditionsCode += "if( "+codeGenerator.GenerateBooleanFullName("condition"+ToString(cId)+"IsTrue", context)+".val ) {\n";
                    conditionsCode += "    "+codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val = true;\n";
                    std::set<std::string> objectsListsToBeDeclared = context.GetAllObjectsToBeDeclared();
                    for ( set<string>::iterator it = objectsListsToBeDeclared.begin() ; it != objectsListsToBeDeclared.end(); ++it )
                    {
                        emptyListsNeeded.insert(*it);
                        std::string objList = codeGenerator.GetObjectListName(*it, context);
                        std::string finalObjList = codeNamespace+ManObjListName(*it)+gd::ToString(parentContext.GetContextDepth())
                            +"_"+gd::ToString(parentContext.GetCurrentConditionDepth())+"final";
                        conditionsCode += "    for(var j = 0, jLen = "+objList+".length;j<jLen;++j) {\n";
                        conditionsCode += "        if ( "+finalObjList+".indexOf("+objList+"[j]) === -1 )\n";
                        conditionsCode += "            "+finalObjList+".push("+objList+"[j]);\n";
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
                    std::string finalObjList = codeNamespace+ManObjListName(*it)+gd::ToString(parentContext.GetContextDepth())+"_"
                        +gd::ToString(parentContext.GetCurrentConditionDepth())+"final";
                    codeGenerator.AddGlobalDeclaration(finalObjList+" = [];\n");
                    declarationsCode += finalObjList+".length = 0;";
                }
                for (unsigned int i = 0;i<conditions.size();++i)
                    declarationsCode += codeGenerator.GenerateBooleanFullName("condition"+ToString(i)+"IsTrue", parentContext) +".val = false;\n";

                //Generate code
                string code;
                code += declarationsCode;
                code += conditionsCode;

                //When condition is finished, "final" objects lists become the "normal" ones.
                code += "{\n";
                for ( set<string>::iterator it = emptyListsNeeded.begin() ; it != emptyListsNeeded.end(); ++it )
                {
                    std::string finalObjList = codeNamespace+ManObjListName(*it)+gd::ToString(parentContext.GetContextDepth())+"_"
                        +gd::ToString(parentContext.GetCurrentConditionDepth())+"final";
                    code += codeGenerator.GetObjectListName(*it, parentContext)+".createFrom("+finalObjList+");\n";
                }
                code += "}\n";

                return code;
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;

        GetAllConditions()["BuiltinCommonInstructions::Or"].codeExtraInformation.optionalCustomCodeGenerator =
            boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen);
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                string outputCode;

                outputCode += codeGenerator.GenerateConditionsListCode(instruction.GetSubInstructions(), parentContext);

                std::string predicat = "true";
                for (unsigned int i = 0;i<instruction.GetSubInstructions().size();++i)
                    predicat += " && "+codeGenerator.GenerateBooleanFullName("condition"+ToString(i)+"IsTrue", parentContext)+".val";

                outputCode += codeGenerator.GenerateBooleanFullName("conditionTrue", parentContext)+".val = "+predicat+";\n";

                return outputCode;
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;

        GetAllConditions()["BuiltinCommonInstructions::And"].codeExtraInformation.optionalCustomCodeGenerator =
            boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen);
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                std::vector<gd::Instruction> & conditions = instruction.GetSubInstructions();
                string outputCode;

                for (unsigned int i = 0;i<conditions.size();++i)
                {
                    outputCode += codeGenerator.GenerateBooleanFullName("condition"+gd::ToString(i)+"IsTrue", context)+".val = true;\n";
                }

                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    if (cId != 0) outputCode += "if ( !"+codeGenerator.GenerateBooleanFullName("condition"+gd::ToString(cId-1)+"IsTrue", context)+".val ) {\n";

                    gd::InstructionMetadata instrInfos = gd::MetadataProvider::GetConditionMetadata(codeGenerator.GetPlatform(), conditions[cId].GetType());

                    string conditionCode = codeGenerator.GenerateConditionCode(conditions[cId], "condition"+gd::ToString(cId)+"IsTrue", context);
                    if ( !conditions[cId].GetType().empty() )
                    {
                        outputCode += "{\n";
                        outputCode += conditionCode;
                        outputCode += "}";
                    }
                }

                for (unsigned int cId =0;cId < conditions.size();++cId)
                {
                    if (cId != 0) outputCode += "}\n";
                }

                if ( !conditions.empty() )
                {
                    outputCode += codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val = !";
                    outputCode += codeGenerator.GenerateBooleanFullName("condition"+gd::ToString(conditions.size()-1)+"IsTrue", context)+".val;\n";
                }

                return outputCode;
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;

        GetAllConditions()["BuiltinCommonInstructions::Not"].codeExtraInformation.optionalCustomCodeGenerator =
            boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen);
    }

    {
        class CodeGenerator : public gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator
        {
            virtual std::string GenerateCode(gd::Instruction & instruction, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & context)
            {
                size_t uniqueId = (size_t)&instruction;
                std::string outputCode = codeGenerator.GenerateBooleanFullName("conditionTrue", context)+".val = ";
                outputCode += "context.triggerOnce("+ToString(uniqueId)+");\n";
                return outputCode;
            };
        };
        gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator * codeGen = new CodeGenerator;

        GetAllConditions()["BuiltinCommonInstructions::Once"].codeExtraInformation.optionalCustomCodeGenerator =
            boost::shared_ptr<gd::InstructionMetadata::ExtraInformation::CustomCodeGenerator>(codeGen);
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

                //Prepare codes
                std::string whileConditionsStr = codeGenerator.GenerateConditionsListCode(event.GetWhileConditions(), context);
                std::string whileIfPredicat = "true";
                if ( !event.GetWhileConditions().empty() )
                    whileIfPredicat = codeGenerator.GenerateBooleanFullName("condition"+ToString(event.GetWhileConditions().size()-1)+"IsTrue", context)+".val";

                std::string conditionsCode = codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);
                std::string actionsCode = codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                std::string ifPredicat = "true";
                if ( !event.GetConditions().empty() )
                    ifPredicat = codeGenerator.GenerateBooleanFullName("condition"+ToString(event.GetConditions().size()-1)+"IsTrue", context)+".val";

                //Write final code
                std::string whileBoolean = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                    +"Code.stopDoWhile"+gd::ToString(context.GetContextDepth());
                codeGenerator.AddGlobalDeclaration(whileBoolean+" = false;\n");
                outputCode += whileBoolean+" = false;\n";
                outputCode += "do {";
                outputCode += codeGenerator.GenerateObjectsDeclarationCode(context);
                outputCode +=  whileConditionsStr;
                outputCode += "if ("+whileIfPredicat+") {\n";
                outputCode += conditionsCode;
                outputCode += "if (" +ifPredicat+ ") {\n";
                outputCode += actionsCode;
                outputCode += "\n{ //Subevents: \n";
                outputCode += codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                outputCode += "} //Subevents end.\n";
                outputCode += "}\n";
                outputCode += "} else "+whileBoolean+" = true; \n";

                outputCode += "} while ( !"+whileBoolean+" );\n";

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["BuiltinCommonInstructions::While"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
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
                std::string ifPredicat = "true";
                if ( !event.GetConditions().empty() )
                    ifPredicat = codeGenerator.GenerateBooleanFullName("condition"+ToString(event.GetConditions().size()-1)+"IsTrue", context)+".val";

                //Prepare object declaration and sub events
                std::string subevents = codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);
                std::string objectDeclaration = codeGenerator.GenerateObjectsDeclarationCode(context)+"\n";

                //Write final code
                std::string repeatCountVar = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                    +"Code.repeatCount"+gd::ToString(context.GetContextDepth());
                codeGenerator.AddGlobalDeclaration(repeatCountVar+" = 0;\n");
                std::string repeatIndexVar = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                    +"Code.repeatIndex"+gd::ToString(context.GetContextDepth());
                codeGenerator.AddGlobalDeclaration(repeatIndexVar+" = 0;\n");
                outputCode += repeatCountVar+" = "+repeatCountCode+";\n";
                outputCode += "for("+repeatIndexVar+" = 0;"+repeatIndexVar+" < "+repeatCountVar+";++"+repeatIndexVar+") {\n";
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

        GetAllEvents()["BuiltinCommonInstructions::Repeat"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
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

                for (unsigned int i = 0;i<realObjects.size();++i)
                    context.ObjectsListNeeded(realObjects[i]);

                //Prepare conditions/actions codes
                std::string conditionsCode = codeGenerator.GenerateConditionsListCode(event.GetConditions(), context);
                std::string actionsCode = codeGenerator.GenerateActionsListCode(event.GetActions(), context);
                std::string ifPredicat = "true";
                if ( !event.GetConditions().empty() )
                    ifPredicat = codeGenerator.GenerateBooleanFullName("condition"+ToString(event.GetConditions().size()-1)+"IsTrue", context)+".val";

                //Prepare object declaration and sub events
                std::string subevents = codeGenerator.GenerateEventsListCode(event.GetSubEvents(), context);

                std::string objectDeclaration = codeGenerator.GenerateObjectsDeclarationCode(context)+"\n";

                std::string forEachTotalCountVar = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                    +"Code.forEachTotalCount"+gd::ToString(context.GetContextDepth());
                codeGenerator.AddGlobalDeclaration(forEachTotalCountVar+" = 0;\n");
                std::string forEachIndexVar = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                    +"Code.forEachIndex"+gd::ToString(context.GetContextDepth());
                codeGenerator.AddGlobalDeclaration(forEachIndexVar+" = 0;\n");
                std::string forEachObjectsList = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                    +"Code.forEachObjects"+gd::ToString(context.GetContextDepth());
                codeGenerator.AddGlobalDeclaration(forEachObjectsList+" = [];\n");


                if ( realObjects.size() != 1) //(We write a slighty more simple ( and optimized ) output code when only one object list is used.)
                {
                    outputCode += forEachTotalCountVar + " = 0;\n";
                    outputCode += forEachObjectsList+".length = 0;\n";
                    for (unsigned int i = 0;i<realObjects.size();++i)
                    {
                        std::string forEachCountVar = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                            +"Code.forEachCount"+gd::ToString(i)+"_"+gd::ToString(context.GetContextDepth());
                        codeGenerator.AddGlobalDeclaration(forEachCountVar+" = 0;\n");

                        outputCode += forEachCountVar+" = "+codeGenerator.GetObjectListName(realObjects[i], parentContext)+".length;\n";
                        outputCode += forEachTotalCountVar + " += " + forEachCountVar+";\n";
                        outputCode += forEachObjectsList + ".push.apply("+forEachObjectsList+","+codeGenerator.GetObjectListName(realObjects[i], parentContext)+");\n";
                    }
                }

                //Write final code :

                //For loop declaration
                if ( realObjects.size() == 1 ) //We write a slighty more simple ( and optimized ) output code when only one object list is used.
                    outputCode += "for("+forEachIndexVar+" = 0;"+forEachIndexVar+" < "+codeGenerator.GetObjectListName(realObjects[0], parentContext)+".length;++"+forEachIndexVar+") {\n";
                else
                    outputCode += "for("+forEachIndexVar+" = 0;"+forEachIndexVar+" < "+forEachTotalCountVar+";++"+forEachIndexVar+") {\n";

                outputCode += objectDeclaration;

                //Clear all concerned objects lists and keep only one object
                if ( realObjects.size() == 1 )
                {
                    std::string temporary = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                        +"Code.forEachTemporary"+gd::ToString(context.GetContextDepth());
                    codeGenerator.AddGlobalDeclaration(temporary+" = null;\n");
                    outputCode += temporary+" = "+codeGenerator.GetObjectListName(realObjects[0], parentContext)+"["+forEachIndexVar+"];\n";
                    outputCode += codeGenerator.GetObjectListName(realObjects[0], context)+".length = 0;\n";
                    outputCode += codeGenerator.GetObjectListName(realObjects[0], context)+".push("+temporary+");\n";
                }
                else
                {
                    //Declare all lists of concerned objects empty
                    for (unsigned int j = 0;j<realObjects.size();++j)
                        outputCode += codeGenerator.GetObjectListName(realObjects[j], context) + ".length = 0;\n";

                    for (unsigned int i = 0;i<realObjects.size();++i) //Pick then only one object
                    {
                        std::string count;
                        for (unsigned int j = 0;j<=i;++j)
                        {
                            std::string forEachCountVar = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(codeGenerator.GetLayout().GetName())
                                +"Code.forEachCount"+gd::ToString(j)+"_"+gd::ToString(context.GetContextDepth());

                            if (j!=0) count+= "+";
                            count += forEachCountVar;
                        }

                        if ( i != 0 ) outputCode += "else ";
                        outputCode += "if ("+forEachIndexVar+" < "+count+") {\n";
                        outputCode += "    "+codeGenerator.GetObjectListName(realObjects[i], context)+".push("+forEachObjectsList+"["+forEachIndexVar+"]);\n";
                        outputCode += "}\n";
                    }
                }

                outputCode += conditionsCode;
                outputCode += "if (" +ifPredicat+ ") {\n";
                outputCode += actionsCode;
                if ( event.HasSubEvents() )
                {
                    outputCode += "\n{ //Subevents: \n";
                    outputCode += subevents;
                    outputCode += "} //Subevents end.\n";
                }
                outputCode += "}\n";

                outputCode += "}\n"; //End of for loop

                return outputCode;
            }
        };
        gd::EventMetadata::CodeGenerator * codeGen = new CodeGen;

        GetAllEvents()["BuiltinCommonInstructions::ForEach"].codeGeneration = boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen);
    }

    {/*
        class CodeGen : public gd::EventMetadata::CodeGenerator
        {
            virtual std::string Generate(gd::BaseEvent & event_, gd::EventsCodeGenerator & codeGenerator, gd::EventsCodeGenerationContext & parentContext)
            {
                CppCodeEvent & event = dynamic_cast<CppCodeEvent&>(event_);

                const gd::Project & project = codeGenerator.GetProject();
                const gd::Layout & scene = codeGenerator.GetLayout();

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

        AddEvent("JsCode",
                  _("Javascript code (Web platform only)"),
                  _("Execute Javascript code"),
                  "",
                  "res/source_cpp16.png",
                  boost::shared_ptr<gd::BaseEvent>(new JsCodeEvent))
                  .SetCodeGenerator(boost::shared_ptr<gd::EventMetadata::CodeGenerator>(codeGen));*/
    }
}

}
