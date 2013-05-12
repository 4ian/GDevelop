/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/IDE/MetadataProvider.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/CommonTools.h"
#include "GDJS/JsPlatform.h"
#include "GDJS/EventsCodeGenerator.h"

using namespace std;

std::string EventsCodeGenerator::GenerateSceneEventsCompleteCode(gd::Project & project,
                                                                 gd::Layout & scene,
                                                                 std::vector < gd::BaseEventSPtr > & events,
                                                                 std::set < std::string > & includeFiles,
                                                                 bool compilationForRuntime)
{
    string output;

    //Prepare the global context
    gd::EventsCodeGenerationContext context;
    EventsCodeGenerator codeGenerator(project, scene);
    codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);
    codeGenerator.PreprocessEventList(events);

    //Generate whole events code
    string wholeEventsCode = codeGenerator.GenerateEventsListCode(events, context);

    //Extra declarations needed by events
    for ( set<string>::iterator declaration = codeGenerator.GetCustomGlobalDeclaration().begin() ; declaration != codeGenerator.GetCustomGlobalDeclaration().end(); ++declaration )
        output += *declaration+"\n";

    output +=
    codeGenerator.GetCustomCodeOutsideMain()+"\n"
    +"gdjs."+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"Code = function(runtimeScene) {\n"
	+codeGenerator.GetCustomCodeInMain()
    +wholeEventsCode
    +"return;\n"
    +"}\n";

    includeFiles = codeGenerator.GetIncludeFiles();
    return output;
}

std::string EventsCodeGenerator::GenerateCurrentObjectFunctionCall(std::string objectListName,
                                                      const gd::ObjectMetadata & objMetadata,
                                                      std::string functionCallName,
                                                      std::string parametersStr)
{
    return "("+ManObjListName(objectListName)+"[i]."+functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateNotPickedObjectFunctionCall(std::string objectListName,
                                                        const gd::ObjectMetadata & objMetadata,
                                                        std::string functionCallName,
                                                        std::string parametersStr,
                                                        std::string defaultOutput)
{
    return "(( "+ManObjListName(objectListName)+".length === 0 ) ? "+defaultOutput+" :"+ ManObjListName(objectListName)+"[0]."+functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateCurrentObjectAutomatismFunctionCall(std::string objectListName,
                                                                                       std::string automatismName,
                                                      const gd::AutomatismMetadata & autoInfo,
                                                      std::string functionCallName,
                                                      std::string parametersStr)
{
    return "("+ManObjListName(objectListName)+"[i].getAutomatism(\""+automatismName+"\")."+functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateNotPickedObjectAutomatismFunctionCall(std::string objectListName,
                                                                                       std::string automatismName,
                                                        const gd::AutomatismMetadata & autoInfo,
                                                        std::string functionCallName,
                                                        std::string parametersStr,
                                                        std::string defaultOutput)
{
    return "(( "+ManObjListName(objectListName)+".length === 0 ) ? "+defaultOutput+" :"+ManObjListName(objectListName)+"[0].getAutomatism(\""+automatismName+"\")."+functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateFreeCondition(const std::vector<std::string> & arguments,
                                                             const gd::InstructionMetadata & instrInfos,
                                                             const std::string & returnBoolean,
                                                             bool conditionInverted)
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
    return returnBoolean+".val = "+predicat+";\n";
}

std::string EventsCodeGenerator::GenerateObjectCondition(const std::string & objectName,
                                                                   const gd::ObjectMetadata & objInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const std::string & returnBoolean,
                                                                   bool conditionInverted)
{
    std::string conditionCode;

    //Prepare call
    string objectFunctionCallNamePart = ManObjListName(objectName)+"[i]."+instrInfos.codeExtraInformation.functionCallName;

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
    conditionCode += "for(var i = 0;i < "+ManObjListName(objectName)+".length;) {\n";
    conditionCode += "    if ( "+predicat+" ) {\n";
    conditionCode += "        "+returnBoolean+".val = true;\n";
    conditionCode += "        ++i;\n";
    conditionCode += "    }\n";
    conditionCode += "    else {\n";
    conditionCode += "        "+ManObjListName(objectName)+".remove(i);\n";
    conditionCode += "    }\n";
    conditionCode += "}\n";

    return conditionCode;
}

std::string EventsCodeGenerator::GenerateAutomatismCondition(const std::string & objectName,
                                                                       const std::string & automatismName,
                                                                   const gd::AutomatismMetadata & autoInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos,
                                                                   const std::string & returnBoolean,
                                                                   bool conditionInverted)
{
    std::string conditionCode;

    //Prepare call
    string objectFunctionCallNamePart = ManObjListName(objectName)+"[i].getAutomatism(\""+automatismName+"\")."
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
        conditionCode += "for(var i = 0;i < "+ManObjListName(objectName)+".length;) {\n";
        conditionCode += "    if ( "+predicat+" ) {\n";
        conditionCode += "        "+returnBoolean+" = true;\n";
        conditionCode += "        ++i;\n";
        conditionCode += "    }\n";
        conditionCode += "    else {\n";
        conditionCode += "        "+ManObjListName(objectName)+".remove(i);\n";
        conditionCode += "    }\n";
        conditionCode += "}";
    }


    return conditionCode;
}

std::string EventsCodeGenerator::GenerateObjectAction(const std::string & objectName,
                                                                   const gd::ObjectMetadata & objInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos)
{
    std::string actionCode;

    //Prepare call
    string objectPart = ManObjListName(objectName)+"[i]." ;

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

    actionCode += "for(var i = 0, len = "+ManObjListName(objectName)+".length ;i < len;++i) {\n";
    actionCode += "    "+call+";\n";
    actionCode += "}\n";


    return actionCode;
}

std::string EventsCodeGenerator::GenerateAutomatismAction(const std::string & objectName,
                                                                    const std::string & automatismName,
                                                                   const gd::AutomatismMetadata & autoInfo,
                                                                   const std::vector<std::string> & arguments,
                                                                   const gd::InstructionMetadata & instrInfos)
{
    std::string actionCode;

    //Prepare call
    //Add a static_cast if necessary
    string objectPart = ManObjListName(objectName)+"[i].getAutomatism(\""+automatismName+"\").";

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
        actionCode += "for(var i = 0, len = "+ManObjListName(objectName)+".length ;i < len;++i) {\n";
        actionCode += "    "+call+";\n";
        actionCode += "}\n";
    }


    return actionCode;
}

std::string EventsCodeGenerator::GenerateObjectsDeclarationCode(gd::EventsCodeGenerationContext & context)
{
    std::string declarationsCode;
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclared().begin() ; it != context.GetObjectsListsToBeDeclared().end(); ++it )
    {
        if ( !context.ObjectAlreadyDeclared(*it) )
        {
            declarationsCode += "var "+ManObjListName(*it) +" = runtimeScene.getObjects(\""+ConvertToString(*it)+"\").slice(0);\n";
            context.SetObjectDeclared(*it);
        }
        else
        {
            declarationsCode += "var "+ManObjListName(*it)+"T = "+ManObjListName(*it)+".slice(0);\n";
            declarationsCode += "var "+ManObjListName(*it)+" = "+ManObjListName(*it)+"T;\n";
        }
    }
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclaredEmpty().begin() ; it != context.GetObjectsListsToBeDeclaredEmpty().end(); ++it )
    {
        if ( !context.ObjectAlreadyDeclared(*it) )
        {
            declarationsCode += "var "+ManObjListName(*it)+" = [];\n";
            context.SetObjectDeclared(*it);
        }
        else
        {
            declarationsCode += "var "+ManObjListName(*it)+"T = "+ManObjListName(*it)+".slice(0);\n";
            declarationsCode += "var "+ManObjListName(*it)+" = "+ManObjListName(*it)+"T;\n";
        }
    }

    return declarationsCode ;
}

std::string EventsCodeGenerator::GenerateScopeBegin(gd::EventsCodeGenerationContext & context, const std::string & extraVariable) const
{
    //Generate a list of variables declared in the parent scope
    std::string scopeInheritedVariables = extraVariable;
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclared().begin() ; it != context.GetObjectsListsToBeDeclared().end(); ++it )
    {
        if ( !context.ObjectAlreadyDeclared(*it) ) continue;

        scopeInheritedVariables += !scopeInheritedVariables.empty() ? ", " : "";
        scopeInheritedVariables += ManObjListName(*it);
    }
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclaredEmpty().begin() ; it != context.GetObjectsListsToBeDeclaredEmpty().end(); ++it )
    {
        if ( !context.ObjectAlreadyDeclared(*it) ) continue;

        scopeInheritedVariables += !scopeInheritedVariables.empty() ? ", " : "";
        scopeInheritedVariables += ManObjListName(*it);
    }

    return "( function("+scopeInheritedVariables+") {\n";
};
std::string EventsCodeGenerator::GenerateScopeEnd(gd::EventsCodeGenerationContext & context, const std::string & extraVariable) const
{
    //Generate a list of variables declared in the parent scope
    std::string scopeInheritedVariables = extraVariable;
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclared().begin() ; it != context.GetObjectsListsToBeDeclared().end(); ++it )
    {
        if ( !context.ObjectAlreadyDeclared(*it) ) continue;

        scopeInheritedVariables += !scopeInheritedVariables.empty() ? ", " : "";
        scopeInheritedVariables += ManObjListName(*it);
    }
    for ( set<string>::iterator it = context.GetObjectsListsToBeDeclaredEmpty().begin() ; it != context.GetObjectsListsToBeDeclaredEmpty().end(); ++it )
    {
        if ( !context.ObjectAlreadyDeclared(*it) ) continue;

        scopeInheritedVariables += !scopeInheritedVariables.empty() ? ", " : "";
        scopeInheritedVariables += ManObjListName(*it);
    }

    return "})("+scopeInheritedVariables+");\n";
};

string EventsCodeGenerator::GenerateConditionsListCode(vector < gd::Instruction > & conditions, gd::EventsCodeGenerationContext & context)
{
    string outputCode;

    for (unsigned int i = 0;i<conditions.size();++i)
        outputCode += GenerateBooleanInitializationToFalse("condition"+gd::ToString(i)+"IsTrue");

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        if (cId != 0) outputCode += "if ( condition"+gd::ToString(cId-1)+"IsTrue.val ) {\n";

        gd::InstructionMetadata instrInfos = gd::MetadataProvider::GetConditionMetadata(platform, conditions[cId].GetType());

        string conditionCode = GenerateConditionCode(conditions[cId], "condition"+gd::ToString(cId)+"IsTrue", context);
        if ( !conditions[cId].GetType().empty() )
        {
            if ( !instrInfos.codeExtraInformation.doNotEncloseInstructionCodeWithinBrackets ) outputCode += "{";
            outputCode += conditionCode;
            if ( !instrInfos.codeExtraInformation.doNotEncloseInstructionCodeWithinBrackets ) outputCode += "}";
        }
    }

    for (unsigned int cId =0;cId < conditions.size();++cId)
    {
        if (cId != 0) outputCode += "}\n";
    }

    return outputCode;
}

std::string EventsCodeGenerator::GenerateParameterCodes(const std::string & parameter, const gd::ParameterMetadata & metadata,
                                                        gd::EventsCodeGenerationContext & context,
                                                        const std::vector < gd::Expression > & othersParameters,
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

        argOutput += "gdjs.commonTools.clearEventsObjectsMap()";
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            context.ObjectsListNeeded(realObjects[i]);
            argOutput += ".addObjectsToEventsMap(\""+ConvertToString(realObjects[i])+"\", "+ManObjListName(realObjects[i])+")";
        }
        argOutput += ".getEventsObjectsMap()";
    }
    //Code only parameter type
    else if ( metadata.type == "objectListWithoutPicking" )
    {
        std::vector<std::string> realObjects = ExpandObjectsName(parameter, context);

        argOutput += "gdjs.commonTools.clearEventsObjectsMap()";
        for (unsigned int i = 0;i<realObjects.size();++i)
        {
            context.EmptyObjectsListNeeded(realObjects[i]);
            argOutput += ".addObjectsToEventsMap(\""+ConvertToString(realObjects[i])+"\", "+ManObjListName(realObjects[i])+")";
        }
        argOutput += ".getEventsObjectsMap()";
    }
    //Code only parameter type
    else if ( metadata.type == "objectPtr")
    {
        unsigned int i = gd::ToInt(metadata.supplementaryInformation);
        if ( i < othersParameters.size() )
        {
            std::vector<std::string> realObjects = ExpandObjectsName(parameter, context);

            if ( find(realObjects.begin(), realObjects.end(), context.GetCurrentObject()) != realObjects.end() && !context.GetCurrentObject().empty())
            {
                //If object currently used by instruction is available, use it directly.
                argOutput = ManObjListName(context.GetCurrentObject())+"[i]";
            }
            else
            {
                for (unsigned int i = 0;i<realObjects.size();++i)
                {
                    context.ObjectsListNeeded(realObjects[i]);
                    argOutput += "(!"+ManObjListName(realObjects[i])+".empty() ? "+ManObjListName(realObjects[i])+"[0] : ";
                }
                argOutput += "null";
                for (unsigned int i = 0;i<realObjects.size();++i)
                    argOutput += ")";
            }
        }
        else
        {
            ReportError();
            cout << "Error: Could not get objects for a parameter" << endl;
            return "null";
        }
    }
    else
        return gd::EventsCodeGenerator::GenerateParameterCodes(parameter, metadata, context, othersParameters, supplementaryParametersTypes);

    return argOutput;
}

EventsCodeGenerator::EventsCodeGenerator(gd::Project & project, const gd::Layout & layout) :
    gd::EventsCodeGenerator(project, layout, JsPlatform::Get())
{
}

EventsCodeGenerator::~EventsCodeGenerator()
{
}
