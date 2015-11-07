/*
 * GDevelop JS Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <algorithm>
#include "GDCore/Events/CodeGeneration/EventsCodeGenerationContext.h"
#include "GDCore/Extensions/Metadata/EventMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Events/Tools/EventsCodeNameMangler.h"
#include "GDCore/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDJS/Extensions/JsPlatform.h"
#include "GDJS/Events/CodeGeneration/EventsCodeGenerator.h"
#include "GDJS/Events/CodeGeneration/VariableParserCallbacks.h"

using namespace std;

namespace gdjs
{

gd::String EventsCodeGenerator::GenerateSceneEventsCompleteCode(gd::Project & project,
                                                                 gd::Layout & scene,
                                                                 gd::EventsList & events,
                                                                 std::set < gd::String > & includeFiles,
                                                                 bool compilationForRuntime)
{
    gd::String output = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"Code = {};\n";

    //Prepare the global context
    unsigned int maxDepthLevelReached = 0;
    gd::EventsCodeGenerationContext context(&maxDepthLevelReached);
    EventsCodeGenerator codeGenerator(project, scene);
    codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);
    codeGenerator.PreprocessEventList(events);

    //Generate whole events code
    gd::String wholeEventsCode = codeGenerator.GenerateEventsListCode(events, context);

    //Extra declarations needed by events
    for ( set<gd::String>::iterator declaration = codeGenerator.GetCustomGlobalDeclaration().begin() ;
        declaration != codeGenerator.GetCustomGlobalDeclaration().end(); ++declaration )
        output += *declaration+"\n";

    //Global objects lists
    auto generateDeclarations = [&project, &scene, &codeGenerator](gd::Object & object, unsigned int maxDepth,
        gd::String & globalObjectLists, gd::String & globalObjectListsReset) {

        gd::String type = gd::GetTypeOfObject(project, scene, object.GetName());
        const gd::ObjectMetadata & metadata = gd::MetadataProvider::GetObjectMetadata(JsPlatform::Get(), type);
        codeGenerator.AddIncludeFiles(metadata.includeFiles);

        //Ensure needed files are included.
        std::vector<gd::String> behaviors = object.GetAllBehaviorNames();
        for (std::size_t j = 0;j<behaviors.size();++j)
        {
            const gd::BehaviorMetadata & metadata = gd::MetadataProvider::GetBehaviorMetadata(JsPlatform::Get(),
                                                                                                  object.GetBehavior(behaviors[j]).GetTypeName());
            codeGenerator.AddIncludeFiles(metadata.includeFiles);
        }

        //Generate declarations for the objects lists
        for (unsigned int j = 1;j<=maxDepth;++j)
        {
            globalObjectLists += codeGenerator.GetCodeNamespace()
                + ManObjListName(object.GetName()) + gd::String::From(j) + "= [];\n";
            globalObjectListsReset += codeGenerator.GetCodeNamespace()
                + ManObjListName(object.GetName()) + gd::String::From(j) + ".length = 0;\n";
        }
    };

    gd::String globalObjectLists;
    gd::String globalObjectListsReset;
    for (std::size_t i = 0;i<project.GetObjectsCount();++i)
        generateDeclarations(project.GetObject(i), maxDepthLevelReached, globalObjectLists, globalObjectListsReset);

    for (std::size_t i = 0;i<scene.GetObjectsCount();++i)
        generateDeclarations(scene.GetObject(i), maxDepthLevelReached, globalObjectLists, globalObjectListsReset);

    //Condition global booleans
    gd::String globalConditionsBooleans;
    for (unsigned int i = 0;i<=codeGenerator.GetMaxCustomConditionsDepth();++i)
    {
        globalConditionsBooleans += codeGenerator.GetCodeNamespace()+"conditionTrue_"+gd::String::From(i)+" = {val:false};\n";
        for (std::size_t j = 0;j<=codeGenerator.GetMaxConditionsListsSize();++j)
        {
            globalConditionsBooleans += codeGenerator.GetCodeNamespace()+"condition"+gd::String::From(j)+"IsTrue_"+gd::String::From(i)+" = {val:false};\n";
        }
    }

    output +=
    codeGenerator.GetCustomCodeOutsideMain()+"\n\n"
    +globalObjectLists+"\n"
    +globalConditionsBooleans+"\n"
    +"gdjs."+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"Code.func = function(runtimeScene, context) {\n"
    +"context.startNewFrame();\n"
    +globalObjectListsReset+"\n"
	+codeGenerator.GetCustomCodeInMain()
    +wholeEventsCode
    +"return;\n"
    +"}\n";

    //Export the symbols to avoid them being stripped by the Closure Compiler:
    output += "gdjs['"+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"Code']"
        +"= gdjs."+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"Code;\n";

    includeFiles.insert(codeGenerator.GetIncludeFiles().begin(), codeGenerator.GetIncludeFiles().end());
    return output;
}

gd::String EventsCodeGenerator::GenerateObjectFunctionCall(gd::String objectListName,
                                                      const gd::ObjectMetadata & objMetadata,
                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                      gd::String parametersStr,
                                                      gd::String defaultOutput,
                                                      gd::EventsCodeGenerationContext & context)
{
    if ( codeInfo.staticFunction )
        return "("+codeInfo.functionCallName+"("+parametersStr+"))";
    if ( context.GetCurrentObject() == objectListName && !context.GetCurrentObject().empty())
        return "("+GetObjectListName(objectListName, context)+"[i]."+codeInfo.functionCallName+"("+parametersStr+"))";
    else
        return "(( "+GetObjectListName(objectListName, context)+".length === 0 ) ? "+defaultOutput+" :"+ GetObjectListName(objectListName, context)+"[0]."+codeInfo.functionCallName+"("+parametersStr+"))";
}

gd::String EventsCodeGenerator::GenerateObjectBehaviorFunctionCall(gd::String objectListName,
                                                      gd::String behaviorName,
                                                      const gd::BehaviorMetadata & autoInfo,
                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                      gd::String parametersStr,
                                                      gd::String defaultOutput,
                                                      gd::EventsCodeGenerationContext & context)
{
    if ( codeInfo.staticFunction )
        return "("+codeInfo.functionCallName+"("+parametersStr+"))";
    if ( context.GetCurrentObject() == objectListName && !context.GetCurrentObject().empty())
        return "("+GetObjectListName(objectListName, context)+"[i].getBehavior(\""+behaviorName+"\")."+codeInfo.functionCallName+"("+parametersStr+"))";
    else
        return "(( "+GetObjectListName(objectListName, context)+".length === 0 ) ? "+defaultOutput+" :"+GetObjectListName(objectListName, context)+"[0].getBehavior(\""+behaviorName+"\")."+codeInfo.functionCallName+"("+parametersStr+"))";
}

gd::String EventsCodeGenerator::GenerateFreeCondition(const std::vector<gd::String> & arguments,
                                                             const gd::InstructionMetadata & instrInfos,
                                                             const gd::String & returnBoolean,
                                                             bool conditionInverted,
                                                             gd::EventsCodeGenerationContext & context)
{
    //Generate call
    gd::String predicat;
    if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string")
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName);
    }
    else
    {
        gd::String argumentsStr;
        for (std::size_t i = 0;i<arguments.size();++i)
        {
            if ( i != 0 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
    }

    //Add logical not if needed
    bool conditionAlreadyTakeCareOfInversion = false;
    for (std::size_t i = 0;i<instrInfos.parameters.size();++i) //Some conditions already have a "conditionInverted" parameter
    {
        if( instrInfos.parameters[i].type == "conditionInverted" )
            conditionAlreadyTakeCareOfInversion = true;
    }
    if (!conditionAlreadyTakeCareOfInversion && conditionInverted) predicat = GenerateNegatedPredicat(predicat);

    //Generate condition code
    return GenerateBooleanFullName(returnBoolean, context)+".val = "+predicat+";\n";
}

gd::String EventsCodeGenerator::GenerateObjectCondition(const gd::String & objectName,
                                                         const gd::ObjectMetadata & objInfo,
                                                         const std::vector<gd::String> & arguments,
                                                         const gd::InstructionMetadata & instrInfos,
                                                         const gd::String & returnBoolean,
                                                         bool conditionInverted,
                                                        gd::EventsCodeGenerationContext & context)
{
    gd::String conditionCode;

    //Prepare call
    gd::String objectFunctionCallNamePart = GetObjectListName(objectName, context)+"[i]."+instrInfos.codeExtraInformation.functionCallName;

    //Create call
    gd::String predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, 1);
    }
    else
    {
        gd::String argumentsStr;
        for (std::size_t i = 1;i<arguments.size();++i)
        {
            if ( i != 1 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = objectFunctionCallNamePart+"("+argumentsStr+")";
    }
    if ( conditionInverted ) predicat = GenerateNegatedPredicat(predicat);

    //Generate whole condition code
    conditionCode += "for(var i = 0, k = 0, l = "+GetObjectListName(objectName, context)+".length;i<l;++i) {\n";
    conditionCode += "    if ( "+predicat+" ) {\n";
    conditionCode += "        "+GenerateBooleanFullName(returnBoolean, context)+".val = true;\n";
    conditionCode += "        "+GetObjectListName(objectName, context)+"[k] = "+GetObjectListName(objectName, context)+"[i];\n";
    conditionCode += "        ++k;\n";
    conditionCode += "    }\n";
    conditionCode += "}\n";
    conditionCode += GetObjectListName(objectName, context)+".length = k;";

    return conditionCode;
}

gd::String EventsCodeGenerator::GenerateBehaviorCondition(const gd::String & objectName,
                                                             const gd::String & behaviorName,
                                                                   const gd::BehaviorMetadata & autoInfo,
                                                                   const std::vector<gd::String> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const gd::String & returnBoolean,
                                                                   bool conditionInverted,
                                                      gd::EventsCodeGenerationContext & context)
{
    gd::String conditionCode;

    //Prepare call
    gd::String objectFunctionCallNamePart = GetObjectListName(objectName, context)+"[i].getBehavior(\""+behaviorName+"\")."
                                        +instrInfos.codeExtraInformation.functionCallName;

    //Create call
    gd::String predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, 2);
    }
    else
    {
        gd::String argumentsStr;
        for (std::size_t i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = objectFunctionCallNamePart+"("+argumentsStr+")";
    }
    if ( conditionInverted ) predicat = GenerateNegatedPredicat(predicat);

    //Verify that object has behavior.
    vector < gd::String > behaviors = gd::GetBehaviorsOfObject(project, scene, objectName);
    if ( find(behaviors.begin(), behaviors.end(), behaviorName) == behaviors.end() )
    {
        cout << "Bad behavior requested" << endl;
    }
    else
    {
        conditionCode += "for(var i = 0, k = 0, l = "+GetObjectListName(objectName, context)+".length;i<l;++i) {\n";
        conditionCode += "    if ( "+predicat+" ) {\n";
        conditionCode += "        "+GenerateBooleanFullName(returnBoolean, context)+".val = true;\n";
        conditionCode += "        "+GetObjectListName(objectName, context)+"[k] = "+GetObjectListName(objectName, context)+"[i];\n";
        conditionCode += "        ++k;\n";
        conditionCode += "    }\n";
        conditionCode += "}\n";
        conditionCode += GetObjectListName(objectName, context)+".length = k;";
    }


    return conditionCode;
}

gd::String EventsCodeGenerator::GenerateObjectAction(const gd::String & objectName,
                                                                   const gd::ObjectMetadata & objInfo,
                                                                   const std::vector<gd::String> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                      gd::EventsCodeGenerationContext & context)
{
    gd::String actionCode;

    //Prepare call
    gd::String objectPart = GetObjectListName(objectName, context)+"[i]." ;

    //Create call
    gd::String call;
    if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string")
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName, objectPart+instrInfos.codeExtraInformation.optionalAssociatedInstruction,1);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName,1);
    }
    else
    {
        gd::String argumentsStr;
        for (std::size_t i = 1;i<arguments.size();++i)
        {
            if ( i != 1 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = objectPart+instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
    }

    actionCode += "for(var i = 0, len = "+GetObjectListName(objectName, context)+".length ;i < len;++i) {\n";
    actionCode += "    "+call+";\n";
    actionCode += "}\n";


    return actionCode;
}

gd::String EventsCodeGenerator::GenerateBehaviorAction(const gd::String & objectName,
                                                                    const gd::String & behaviorName,
                                                                   const gd::BehaviorMetadata & autoInfo,
                                                                   const std::vector<gd::String> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                      gd::EventsCodeGenerationContext & context)
{
    gd::String actionCode;

    //Prepare call
    //Add a static_cast if necessary
    gd::String objectPart = GetObjectListName(objectName, context)+"[i].getBehavior(\""+behaviorName+"\").";

    //Create call
    gd::String call;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName, objectPart+instrInfos.codeExtraInformation.optionalAssociatedInstruction,2);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName,2);
    }
    else
    {
        gd::String argumentsStr;
        for (std::size_t i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = objectPart+instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
    }

    //Verify that object has behavior.
    vector < gd::String > behaviors = gd::GetBehaviorsOfObject(project, scene, objectName);
    if ( find(behaviors.begin(), behaviors.end(), behaviorName) == behaviors.end() )
    {
        cout << "Bad behavior requested for an action" << endl;
    }
    else
    {
        actionCode += "for(var i = 0, len = "+GetObjectListName(objectName, context)+".length ;i < len;++i) {\n";
        actionCode += "    "+call+";\n";
        actionCode += "}\n";
    }


    return actionCode;
}

gd::String EventsCodeGenerator::GetObjectListName(const gd::String & name, const gd::EventsCodeGenerationContext & context)
{
    return GetCodeNamespace() + ManObjListName(name)
        + gd::String::From(context.GetLastDepthObjectListWasNeeded(name));
}

gd::String EventsCodeGenerator::GenerateObjectsDeclarationCode(gd::EventsCodeGenerationContext & context)
{
    gd::String declarationsCode;
    for ( set<gd::String>::iterator it = context.GetObjectsListsToBeDeclared().begin() ; it != context.GetObjectsListsToBeDeclared().end(); ++it )
    {
        declarationsCode += GetObjectListName(*it, context);
        if ( !context.ObjectAlreadyDeclared(*it) )
        {
            declarationsCode += ".createFrom(runtimeScene.getObjects(\""+ConvertToString(*it)+"\"));\n";
            context.SetObjectDeclared(*it);
        }
        else
        {
            if (context.GetParentContext())
                declarationsCode += ".createFrom("+GetObjectListName(*it, *context.GetParentContext())+");\n";
            else
                std::cout << "ERROR: During code generation, a context tried tried to use an already declared object list without having a parent" << std::endl;
        }
    }
    for ( set<gd::String>::iterator it = context.GetObjectsListsToBeDeclaredEmpty().begin() ; it != context.GetObjectsListsToBeDeclaredEmpty().end(); ++it )
    {
        declarationsCode += GetObjectListName(*it, context);
        if ( !context.ObjectAlreadyDeclared(*it) )
        {
            declarationsCode +=".length = 0;\n";
            context.SetObjectDeclared(*it);
        }
        else
        {
            if (context.GetParentContext())
                declarationsCode += ".createFrom("+GetObjectListName(*it, *context.GetParentContext())+");\n";
            else
                std::cout << "ERROR: During code generation, a context tried tried to use an already declared object list without having a parent" << std::endl;
        }
    }

    return declarationsCode ;
}

gd::String EventsCodeGenerator::GenerateConditionsListCode(gd::InstructionsList & conditions, gd::EventsCodeGenerationContext & context)
{
    gd::String outputCode;

    for (std::size_t i = 0;i<conditions.size();++i)
        outputCode += GenerateBooleanInitializationToFalse("condition"+gd::String::From(i)+"IsTrue", context);

    for (std::size_t cId =0;cId < conditions.size();++cId)
    {
        if (cId != 0) outputCode += "if ( "+GenerateBooleanFullName("condition"+gd::String::From(cId-1)+"IsTrue", context)+".val ) {\n";

        gd::InstructionMetadata instrInfos = gd::MetadataProvider::GetConditionMetadata(platform, conditions[cId].GetType());

        gd::String conditionCode = GenerateConditionCode(conditions[cId], "condition"+gd::String::From(cId)+"IsTrue", context);
        if ( !conditions[cId].GetType().empty() )
        {
            outputCode += "{\n";
            outputCode += conditionCode;
            outputCode += "}";
        }
    }

    for (std::size_t cId =0;cId < conditions.size();++cId)
    {
        if (cId != 0) outputCode += "}\n";
    }

    maxConditionsListsSize = std::max(maxConditionsListsSize, conditions.size());

    return outputCode;
}

gd::String EventsCodeGenerator::GenerateParameterCodes(const gd::String & parameter, const gd::ParameterMetadata & metadata,
                                                        gd::EventsCodeGenerationContext & context,
                                                        const gd::String & previousParameter,
                                                        std::vector < std::pair<gd::String, gd::String> > * supplementaryParametersTypes)
{
    gd::String argOutput;

    //Code only parameter type
    if ( metadata.type == "currentScene" )
    {
        argOutput = "runtimeScene";
    }
    //Code only parameter type
    else if ( metadata.type == "objectList" )
    {
        std::vector<gd::String> realObjects = ExpandObjectsName(parameter, context);

        argOutput += "context.clearEventsObjectsMap()";
        for (std::size_t i = 0;i<realObjects.size();++i)
        {
            context.ObjectsListNeeded(realObjects[i]);
            argOutput += ".addObjectsToEventsMap(\""+ConvertToString(realObjects[i])+"\", "+GetObjectListName(realObjects[i], context)+")";
        }
        argOutput += ".getEventsObjectsMap()";
    }
    //Code only parameter type
    else if ( metadata.type == "objectListWithoutPicking" )
    {
        std::vector<gd::String> realObjects = ExpandObjectsName(parameter, context);

        argOutput += "context.clearEventsObjectsMap()";
        for (std::size_t i = 0;i<realObjects.size();++i)
        {
            context.EmptyObjectsListNeeded(realObjects[i]);
            argOutput += ".addObjectsToEventsMap(\""+ConvertToString(realObjects[i])+"\", "+GetObjectListName(realObjects[i], context)+")";
        }
        argOutput += ".getEventsObjectsMap()";
    }
    //Code only parameter type
    else if ( metadata.type == "objectPtr")
    {
        std::vector<gd::String> realObjects = ExpandObjectsName(parameter, context);

        if ( find(realObjects.begin(), realObjects.end(), context.GetCurrentObject()) != realObjects.end() && !context.GetCurrentObject().empty())
        {
            //If object currently used by instruction is available, use it directly.
            argOutput = GetObjectListName(context.GetCurrentObject(), context)+"[i]";
        }
        else
        {
            for (std::size_t i = 0;i<realObjects.size();++i)
            {
                context.ObjectsListNeeded(realObjects[i]);
                argOutput += "("+GetObjectListName(realObjects[i], context)+".length !== 0 ? "+GetObjectListName(realObjects[i], context)+"[0] : ";
            }
            argOutput += "null";
            for (std::size_t i = 0;i<realObjects.size();++i)
                argOutput += ")";
        }
    }
    else if (metadata.type == "scenevar")
    {
        VariableCodeGenerationCallbacks callbacks(argOutput, *this, context, VariableCodeGenerationCallbacks::LAYOUT_VARIABLE);

        gd::VariableParser parser(parameter);
        if ( !parser.Parse(callbacks) )
        {
            cout << "Error :" << parser.firstErrorStr << " in: "<< parameter << endl;
            argOutput = "gdjs.VariablesContainer.badVariable";
        }
    }
    else if (metadata.type == "globalvar")
    {
        VariableCodeGenerationCallbacks callbacks(argOutput, *this, context, VariableCodeGenerationCallbacks::PROJECT_VARIABLE);

        gd::VariableParser parser(parameter);
        if ( !parser.Parse(callbacks) )
        {
            cout << "Error :" << parser.firstErrorStr << " in: "<< parameter << endl;
            argOutput = "gdjs.VariablesContainer.badVariable";
        }
    }
    else if (metadata.type == "objectvar")
    {
        //Object is either the object of the previous parameter or, if it is empty,
        //the object being picked by the instruction.
        gd::String object = previousParameter;
        if ( object.empty() ) object = context.GetCurrentObject();

        VariableCodeGenerationCallbacks callbacks(argOutput, *this, context, object);

        gd::VariableParser parser(parameter);
        if ( !parser.Parse(callbacks) )
        {
            cout << "Error :" << parser.firstErrorStr << " in: "<< parameter << endl;
            argOutput = "gdjs.VariablesContainer.badVariable";
        }
    }
    else
        return gd::EventsCodeGenerator::GenerateParameterCodes(parameter, metadata, context, previousParameter, supplementaryParametersTypes);

    return argOutput;
}

gd::String EventsCodeGenerator::GenerateReferenceToUpperScopeBoolean(const gd::String & referenceName,
                                                            const gd::String & referencedBoolean,
                                                            gd::EventsCodeGenerationContext & context)
{
    if ( context.GetParentContext() == NULL) return "";

    //FIXME: Using context.GetParentContext() generates the wrong boolean name in case a condition with a custom code generator
    //is used inside another condition (i.e: as a subinstructions).
    return GenerateBooleanFullName(referenceName, context)+" = "+GenerateBooleanFullName(referencedBoolean, *context.GetParentContext())+";\n";
}

gd::String EventsCodeGenerator::GenerateBooleanInitializationToFalse(const gd::String & boolName, const gd::EventsCodeGenerationContext & context)
{
    return GenerateBooleanFullName(boolName, context)+".val = false;\n";
}

gd::String EventsCodeGenerator::GenerateBooleanFullName(const gd::String & boolName, const gd::EventsCodeGenerationContext & context )
{
    return GetCodeNamespace() + boolName + "_"
        + gd::String::From(context.GetCurrentConditionDepth());
}

gd::String EventsCodeGenerator::GetCodeNamespace()
{
    return "gdjs."+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"Code.";
}

EventsCodeGenerator::EventsCodeGenerator(gd::Project & project, const gd::Layout & layout) :
    gd::EventsCodeGenerator(project, layout, JsPlatform::Get())
{
}

EventsCodeGenerator::~EventsCodeGenerator()
{
}

}
