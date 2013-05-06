/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/IDE/SceneNameMangler.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/EventsCodeGenerator.h"
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

std::string EventsCodeGenerator::GenerateObjectListObjectCondition(const std::string & objectName,
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
    conditionCode += "        "+returnBoolean+" = true;\n";
    conditionCode += "        ++i;\n";
    conditionCode += "    }\n";
    conditionCode += "    else {\n";
    conditionCode += "        "+ManObjListName(objectName)+".remove(i);\n";
    conditionCode += "    }\n";
    conditionCode += "}\n";

    return conditionCode;
}

std::string EventsCodeGenerator::GenerateObjectListAutomatismCondition(const std::string & objectName,
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

std::string EventsCodeGenerator::GenerateObjectListObjectAction(const std::string & objectName,
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

std::string EventsCodeGenerator::GenerateObjectListAutomatismAction(const std::string & objectName,
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
            declarationsCode += "var "+ManObjListName(*it) +" = runtimeScene.getObjects(\""+ConvertToCppString(*it)+"\").slice(0);\n";
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

EventsCodeGenerator::EventsCodeGenerator(gd::Project & project, const gd::Layout & layout) :
    gd::EventsCodeGenerator(project, layout, JsPlatform::Get())
{
}

EventsCodeGenerator::~EventsCodeGenerator()
{
}
