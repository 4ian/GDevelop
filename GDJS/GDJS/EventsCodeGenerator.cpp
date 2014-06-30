/*
 * Game Develop JS Platform
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Automatism.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDJS/JsPlatform.h"
#include "GDJS/EventsCodeGenerator.h"
#include "GDJS/VariableParserCallbacks.h"

using namespace std;

namespace gdjs
{

std::string EventsCodeGenerator::GenerateSceneEventsCompleteCode(gd::Project & project,
                                                                 gd::Layout & scene,
                                                                 gd::EventsList & events,
                                                                 std::set < std::string > & includeFiles,
                                                                 bool compilationForRuntime)
{
    string output = "gdjs."+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"Code = {};\n";

    //Prepare the global context
    unsigned int maxDepthLevelReached = 0;
    gd::EventsCodeGenerationContext context(&maxDepthLevelReached);
    EventsCodeGenerator codeGenerator(project, scene);
    codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);
    codeGenerator.PreprocessEventList(events);

    //Generate whole events code
    string wholeEventsCode = codeGenerator.GenerateEventsListCode(events, context);

    //Extra declarations needed by events
    for ( set<string>::iterator declaration = codeGenerator.GetCustomGlobalDeclaration().begin() ;
        declaration != codeGenerator.GetCustomGlobalDeclaration().end(); ++declaration )
        output += *declaration+"\n";

    //Global objects lists
    std::string globalObjectLists;
    std::string globalObjectListsReset;
    for (unsigned int i = 0;i<project.GetObjectsCount();++i)
    {
        const gd::Object & object = project.GetObject(i);

        //Ensure needed files are included.
        std::string type = gd::GetTypeOfObject(project, scene, object.GetName());
        const gd::ObjectMetadata & metadata = gd::MetadataProvider::GetObjectMetadata(JsPlatform::Get(), type);
        codeGenerator.AddIncludeFiles(metadata.includeFiles);

        std::vector<std::string> automatisms = object.GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            const gd::AutomatismMetadata & metadata = gd::MetadataProvider::GetAutomatismMetadata(JsPlatform::Get(),
                                                                                                  object.GetAutomatism(automatisms[j]).GetTypeName());
            codeGenerator.AddIncludeFiles(metadata.includeFiles);
        }

        //Generate declarations for the objects lists
        for (unsigned int j = 1;j<=maxDepthLevelReached;++j)
        {
            globalObjectLists += codeGenerator.GetCodeNamespace()
                                 +ManObjListName(object.GetName())+gd::ToString(j) + "= [];\n";
            globalObjectListsReset += codeGenerator.GetCodeNamespace()
                                      +ManObjListName(object.GetName())+gd::ToString(j) + ".length = 0;\n";
        }
    }
    for (unsigned int i = 0;i<scene.GetObjectsCount();++i)
    {
        const gd::Object & object = scene.GetObject(i);

        //Ensure needed files are included.
        std::string type = gd::GetTypeOfObject(project, scene, object.GetName());
        const gd::ObjectMetadata & metadata = gd::MetadataProvider::GetObjectMetadata(JsPlatform::Get(), type);
        codeGenerator.AddIncludeFiles(metadata.includeFiles);

        std::vector<std::string> automatisms = object.GetAllAutomatismNames();
        for (unsigned int j = 0;j<automatisms.size();++j)
        {
            const gd::AutomatismMetadata & metadata = gd::MetadataProvider::GetAutomatismMetadata(JsPlatform::Get(),
                                                                                                  object.GetAutomatism(automatisms[j]).GetTypeName());
            codeGenerator.AddIncludeFiles(metadata.includeFiles);
        }

        //Generate declarations for the objects lists
        for (unsigned int j = 1;j<=maxDepthLevelReached;++j)
        {
            globalObjectLists += codeGenerator.GetCodeNamespace()
                                 +ManObjListName(object.GetName())+gd::ToString(j) + "= [];\n";
            globalObjectListsReset += codeGenerator.GetCodeNamespace()
                                      +ManObjListName(object.GetName())+gd::ToString(j) + ".length = 0;\n";
        }
    }

    //Condition global booleans
    std::string globalConditionsBooleans;
    for (unsigned int i = 0;i<=codeGenerator.GetMaxCustomConditionsDepth();++i)
    {
        globalConditionsBooleans += codeGenerator.GetCodeNamespace()+"conditionTrue_"+gd::ToString(i)+" = {val:false};\n";
        for (unsigned int j = 0;j<=codeGenerator.GetMaxConditionsListsSize();++j)
        {
            globalConditionsBooleans += codeGenerator.GetCodeNamespace()+"condition"+gd::ToString(j)+"IsTrue_"+gd::ToString(i)+" = {val:false};\n";
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

std::string EventsCodeGenerator::GenerateObjectFunctionCall(std::string objectListName,
                                                      const gd::ObjectMetadata & objMetadata,
                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                      std::string parametersStr,
                                                      std::string defaultOutput,
                                                      gd::EventsCodeGenerationContext & context)
{
    if ( codeInfo.staticFunction )
        return "("+codeInfo.functionCallName+"("+parametersStr+"))";
    if ( context.GetCurrentObject() == objectListName && !context.GetCurrentObject().empty())
        return "("+GetObjectListName(objectListName, context)+"[i]."+codeInfo.functionCallName+"("+parametersStr+"))";
    else
        return "(( "+GetObjectListName(objectListName, context)+".length === 0 ) ? "+defaultOutput+" :"+ GetObjectListName(objectListName, context)+"[0]."+codeInfo.functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateObjectAutomatismFunctionCall(std::string objectListName,
                                                      std::string automatismName,
                                                      const gd::AutomatismMetadata & autoInfo,
                                                      const gd::ExpressionCodeGenerationInformation & codeInfo,
                                                      std::string parametersStr,
                                                      std::string defaultOutput,
                                                      gd::EventsCodeGenerationContext & context)
{
    if ( codeInfo.staticFunction )
        return "("+codeInfo.functionCallName+"("+parametersStr+"))";
    if ( context.GetCurrentObject() == objectListName && !context.GetCurrentObject().empty())
        return "("+GetObjectListName(objectListName, context)+"[i].getAutomatism(\""+automatismName+"\")."+codeInfo.functionCallName+"("+parametersStr+"))";
    else
        return "(( "+GetObjectListName(objectListName, context)+".length === 0 ) ? "+defaultOutput+" :"+GetObjectListName(objectListName, context)+"[0].getAutomatism(\""+automatismName+"\")."+codeInfo.functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateFreeCondition(const std::vector<std::string> & arguments,
                                                             const gd::InstructionMetadata & instrInfos,
                                                             const std::string & returnBoolean,
                                                             bool conditionInverted,
                                                             gd::EventsCodeGenerationContext & context)
{
    //Generate call
    string predicat;
    if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string")
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, instrInfos.codeExtraInformation.functionCallName);
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 0;i<arguments.size();++i)
        {
            if ( i != 0 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
    }

    //Add logical not if needed
    bool conditionAlreadyTakeCareOfInversion = false;
    for (unsigned int i = 0;i<instrInfos.parameters.size();++i) //Some conditions already have a "conditionInverted" parameter
    {
        if( instrInfos.parameters[i].type == "conditionInverted" )
            conditionAlreadyTakeCareOfInversion = true;
    }
    if (!conditionAlreadyTakeCareOfInversion && conditionInverted) predicat = GenerateNegatedPredicat(predicat);

    //Generate condition code
    return GenerateBooleanFullName(returnBoolean, context)+".val = "+predicat+";\n";
}

std::string EventsCodeGenerator::GenerateObjectCondition(const std::string & objectName,
                                                         const gd::ObjectMetadata & objInfo,
                                                         const std::vector<std::string> & arguments,
                                                         const gd::InstructionMetadata & instrInfos,
                                                         const std::string & returnBoolean,
                                                         bool conditionInverted,
                                                        gd::EventsCodeGenerationContext & context)
{
    std::string conditionCode;

    //Prepare call
    string objectFunctionCallNamePart = GetObjectListName(objectName, context)+"[i]."+instrInfos.codeExtraInformation.functionCallName;

    //Create call
    string predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, 1);
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 1;i<arguments.size();++i)
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

std::string EventsCodeGenerator::GenerateAutomatismCondition(const std::string & objectName,
                                                             const std::string & automatismName,
                                                                   const gd::AutomatismMetadata & autoInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const std::string & returnBoolean,
                                                                   bool conditionInverted,
                                                      gd::EventsCodeGenerationContext & context)
{
    std::string conditionCode;

    //Prepare call
    string objectFunctionCallNamePart = GetObjectListName(objectName, context)+"[i].getAutomatism(\""+automatismName+"\")."
                                        +instrInfos.codeExtraInformation.functionCallName;

    //Create call
    string predicat;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        predicat = GenerateRelationalOperatorCall(instrInfos, arguments, objectFunctionCallNamePart, 2);
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        predicat = objectFunctionCallNamePart+"("+argumentsStr+")";
    }
    if ( conditionInverted ) predicat = GenerateNegatedPredicat(predicat);

    //Verify that object has automatism.
    vector < string > automatisms = gd::GetAutomatismsOfObject(project, scene, objectName);
    if ( find(automatisms.begin(), automatisms.end(), automatismName) == automatisms.end() )
    {
        cout << "Bad automatism requested" << endl;
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

std::string EventsCodeGenerator::GenerateObjectAction(const std::string & objectName,
                                                                   const gd::ObjectMetadata & objInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                      gd::EventsCodeGenerationContext & context)
{
    std::string actionCode;

    //Prepare call
    string objectPart = GetObjectListName(objectName, context)+"[i]." ;

    //Create call
    string call;
    if ( instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string")
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName, objectPart+instrInfos.codeExtraInformation.optionalAssociatedInstruction,1);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName,1);
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 1;i<arguments.size();++i)
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

std::string EventsCodeGenerator::GenerateAutomatismAction(const std::string & objectName,
                                                                    const std::string & automatismName,
                                                                   const gd::AutomatismMetadata & autoInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                      gd::EventsCodeGenerationContext & context)
{
    std::string actionCode;

    //Prepare call
    //Add a static_cast if necessary
    string objectPart = GetObjectListName(objectName, context)+"[i].getAutomatism(\""+automatismName+"\").";

    //Create call
    string call;
    if ( (instrInfos.codeExtraInformation.type == "number" || instrInfos.codeExtraInformation.type == "string") )
    {
        if ( instrInfos.codeExtraInformation.accessType == gd::InstructionMetadata::ExtraInformation::MutatorAndOrAccessor )
            call = GenerateOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName, objectPart+instrInfos.codeExtraInformation.optionalAssociatedInstruction,2);
        else
            call = GenerateCompoundOperatorCall(instrInfos, arguments, objectPart+instrInfos.codeExtraInformation.functionCallName,2);
    }
    else
    {
        string argumentsStr;
        for (unsigned int i = 2;i<arguments.size();++i)
        {
            if ( i != 2 ) argumentsStr += ", ";
            argumentsStr += arguments[i];
        }

        call = objectPart+instrInfos.codeExtraInformation.functionCallName+"("+argumentsStr+")";
    }

    //Verify that object has automatism.
    vector < string > automatisms = gd::GetAutomatismsOfObject(project, scene, objectName);
    if ( find(automatisms.begin(), automatisms.end(), automatismName) == automatisms.end() )
    {
        cout << "Bad automatism requested for an action" << endl;
    }
    else
    {
        actionCode += "for(var i = 0, len = "+GetObjectListName(objectName, context)+".length ;i < len;++i) {\n";
        actionCode += "    "+call+";\n";
        actionCode += "}\n";
    }


    return actionCode;
}

std::string EventsCodeGenerator::GetObjectListName(const std::string & name, const gd::EventsCodeGenerationContext & context)
{
    return GetCodeNamespace()+ManObjListName(name)+gd::ToString(context.GetLastDepthObjectListWasNeeded(name));
}

std::string EventsCodeGenerator::GenerateObjectsDeclarationCode(gd::EventsCodeGenerationContext & context)
{
    std::string declarationsCode;
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclared().begin() ; it != context.GetObjectsListsToBeDeclared().end(); ++it )
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
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclaredEmpty().begin() ; it != context.GetObjectsListsToBeDeclaredEmpty().end(); ++it )
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

string EventsCodeGenerator::GenerateConditionsListCode(vector < gd::Instruction > & conditions, gd::EventsCodeGenerationContext & context)
{
    string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += GenerateBooleanInitializationToFalse("condition"+gd::ToString(i)+"IsTrue", context);

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        if (cId != 0) outputCode += "if ( "+GenerateBooleanFullName("condition"+gd::ToString(cId-1)+"IsTrue", context)+".val ) {\n";

        gd::InstructionMetadata instrInfos = gd::MetadataProvider::GetConditionMetadata(platform, conditions[cId].GetType());

        string conditionCode = GenerateConditionCode(conditions[cId], "condition"+gd::ToString(cId)+"IsTrue", context);
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

    maxConditionsListsSize = std::max(maxConditionsListsSize, conditions.size());

    return outputCode;
}

std::string EventsCodeGenerator::GenerateParameterCodes(const std::string & parameter, const gd::ParameterMetadata & metadata,
                                                        gd::EventsCodeGenerationContext & context,
                                                        const std::string & previousParameter,
                                                        std::vector < std::pair<std::string, std::string> > * supplementaryParametersTypes)
{
    std::string argOutput;

    //Code only parameter type
    if ( metadata.type == "currentScene" )
    {
        argOutput = "runtimeScene";
    }
    //Code only parameter type
    else if ( metadata.type == "objectList" )
    {
        std::vector<std::string> realObjects = ExpandObjectsName(parameter, context);

        argOutput += "context.clearEventsObjectsMap()";
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            context.ObjectsListNeeded(realObjects[i]);
            argOutput += ".addObjectsToEventsMap(\""+ConvertToString(realObjects[i])+"\", "+GetObjectListName(realObjects[i], context)+")";
        }
        argOutput += ".getEventsObjectsMap()";
    }
    //Code only parameter type
    else if ( metadata.type == "objectListWithoutPicking" )
    {
        std::vector<std::string> realObjects = ExpandObjectsName(parameter, context);

        argOutput += "context.clearEventsObjectsMap()";
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            context.EmptyObjectsListNeeded(realObjects[i]);
            argOutput += ".addObjectsToEventsMap(\""+ConvertToString(realObjects[i])+"\", "+GetObjectListName(realObjects[i], context)+")";
        }
        argOutput += ".getEventsObjectsMap()";
    }
    //Code only parameter type
    else if ( metadata.type == "objectPtr")
    {
        std::vector<std::string> realObjects = ExpandObjectsName(parameter, context);

        if ( find(realObjects.begin(), realObjects.end(), context.GetCurrentObject()) != realObjects.end() && !context.GetCurrentObject().empty())
        {
            //If object currently used by instruction is available, use it directly.
            argOutput = GetObjectListName(context.GetCurrentObject(), context)+"[i]";
        }
        else
        {
            for (unsigned int i = 0;i<realObjects.size();++i)
            {
                context.ObjectsListNeeded(realObjects[i]);
                argOutput += "("+GetObjectListName(realObjects[i], context)+".length !== 0 ? "+GetObjectListName(realObjects[i], context)+"[0] : ";
            }
            argOutput += "null";
            for (unsigned int i = 0;i<realObjects.size();++i)
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
        std::string object = previousParameter;
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

std::string EventsCodeGenerator::GenerateReferenceToUpperScopeBoolean(const std::string & referenceName,
                                                            const std::string & referencedBoolean,
                                                            gd::EventsCodeGenerationContext & context)
{
    if ( context.GetParentContext() == NULL) return "";

    return GenerateBooleanFullName(referenceName, context)+" = "+GenerateBooleanFullName(referencedBoolean, *context.GetParentContext())+";\n";
}

std::string EventsCodeGenerator::GenerateBooleanInitializationToFalse(const std::string & boolName, const gd::EventsCodeGenerationContext & context)
{
    return GenerateBooleanFullName(boolName, context)+".val = false;\n";
}

std::string EventsCodeGenerator::GenerateBooleanFullName(const std::string & boolName, const gd::EventsCodeGenerationContext & context )
{
    return GetCodeNamespace()+boolName+"_"+gd::ToString(context.GetCurrentConditionDepth());
}

std::string EventsCodeGenerator::GetCodeNamespace()
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
