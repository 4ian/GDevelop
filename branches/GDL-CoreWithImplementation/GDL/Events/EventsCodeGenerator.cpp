/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDL/IDE/DependenciesAnalyzer.h"
#include "GDL/CppPlatform.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventMetadata.h"
#include "GDCore/Events/InstructionMetadata.h"
#include "GDCore/Events/ExpressionMetadata.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDL/Events/EventsCodeGenerator.h"
#include "GDL/IDE/BaseProfiler.h"
#include "GDL/SceneNameMangler.h"
#include "GDL/ProfileEvent.h"

using namespace std;

std::string EventsCodeGenerator::GenerateCurrentObjectFunctionCall(std::string objectListName,
                                                      const gd::ObjectMetadata & objMetadata,
                                                      std::string functionCallName,
                                                      std::string parametersStr)
{
    bool castNeeded = !objMetadata.cppClassName.empty();
    if ( !castNeeded )
        return "("+ManObjListName(objectListName)+"[i]->"+functionCallName+"("+parametersStr+"))";
    else
        return "(static_cast<"+objMetadata.cppClassName+"*>("+ManObjListName(objectListName)+"[i])->"+functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateNotPickedObjectFunctionCall(std::string objectListName,
                                                        const gd::ObjectMetadata & objMetadata,
                                                        std::string functionCallName,
                                                        std::string parametersStr,
                                                        std::string defaultOutput)
{
    bool castNeeded = !objMetadata.cppClassName.empty();
    if ( !castNeeded )
        return "(( "+ManObjListName(objectListName)+".empty() ) ? "+defaultOutput+" :"+ ManObjListName(objectListName)+"[0]->"+functionCallName+"("+parametersStr+"))";
    else
        return "(( "+ManObjListName(objectListName)+".empty() ) ? "+defaultOutput+" : "+"static_cast<"+objMetadata.cppClassName+"*>("+ManObjListName(objectListName)+"[0])->"+functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateCurrentObjectAutomatismFunctionCall(std::string objectListName,
                                                                                       std::string automatismName,
                                                      const gd::AutomatismMetadata & autoInfo,
                                                      std::string functionCallName,
                                                      std::string parametersStr)
{
    bool castNeeded = !autoInfo.cppClassName.empty();
    if ( !castNeeded )
        return "("+ManObjListName(objectListName)+"[i]->GetAutomatismRawPointer(\""+automatismName+"\")->"+functionCallName+"("+parametersStr+"))";
    else
        return "(static_cast<"+autoInfo.cppClassName+"*>("+ManObjListName(objectListName)+"[i]->GetAutomatismRawPointer(\""+automatismName+"\"))->"+functionCallName+"("+parametersStr+"))";
}

std::string EventsCodeGenerator::GenerateNotPickedObjectAutomatismFunctionCall(std::string objectListName,
                                                                                       std::string automatismName,
                                                        const gd::AutomatismMetadata & autoInfo,
                                                        std::string functionCallName,
                                                        std::string parametersStr,
                                                        std::string defaultOutput)
{
    bool castNeeded = !autoInfo.cppClassName.empty();
    if ( !castNeeded )
        return "(( "+ManObjListName(objectListName)+".empty() ) ? "+defaultOutput+" :"+ManObjListName(objectListName)+"[0]->GetAutomatismRawPointer(\""+automatismName+"\")->"+functionCallName+"("+parametersStr+"))";
    else
        return "(( "+ManObjListName(objectListName)+".empty() ) ? "+defaultOutput+" : "+"static_cast<"+autoInfo.cppClassName+"*>("+ManObjListName(objectListName)+"[0]->GetAutomatismRawPointer(\""+automatismName+"\"))->"+functionCallName+"("+parametersStr+"))";
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
    //Add a static_cast if necessary
    string objectFunctionCallNamePart =
    ( !instrInfos.parameters[0].supplementaryInformation.empty() ) ?
        "static_cast<"+objInfo.cppClassName+"*>("+ManObjListName(objectName)+"[i])->"+instrInfos.codeExtraInformation.functionCallName
    :   ManObjListName(objectName)+"[i]->"+instrInfos.codeExtraInformation.functionCallName;

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
    conditionCode += "for(unsigned int i = 0;i < "+ManObjListName(objectName)+".size();)\n";
    conditionCode += "{\n";
    conditionCode += "    if ( "+predicat+" )\n";
    conditionCode += "    {\n";
    conditionCode += "        "+returnBoolean+" = true;\n";
    conditionCode += "        ++i;\n";
    conditionCode += "    }\n";
    conditionCode += "    else\n";
    conditionCode += "    {\n";
    conditionCode += "        "+ManObjListName(objectName)+".erase("+ManObjListName(objectName)+".begin()+i);\n";
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
    //Add a static_cast if necessary
    string objectFunctionCallNamePart =
    ( !instrInfos.parameters[1].supplementaryInformation.empty() ) ?
        "static_cast<"+autoInfo.cppClassName+"*>("+ManObjListName(objectName)+"[i]->GetAutomatismRawPointer(\""+automatismName+"\"))->"+instrInfos.codeExtraInformation.functionCallName
    :   ManObjListName(objectName)+"[i]->GetAutomatismRawPointer(\""+automatismName+"\")->"+instrInfos.codeExtraInformation.functionCallName;

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
        conditionCode += "for(unsigned int i = 0;i < "+ManObjListName(objectName)+".size();)\n";
        conditionCode += "{\n";
        conditionCode += "    if ( "+predicat+" )\n";
        conditionCode += "    {\n";
        conditionCode += "        "+returnBoolean+" = true;\n";
        conditionCode += "        ++i;\n";
        conditionCode += "    }\n";
        conditionCode += "    else\n";
        conditionCode += "    {\n";
        conditionCode += "        "+ManObjListName(objectName)+".erase("+ManObjListName(objectName)+".begin()+i);\n";
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
    //Add a static_cast if necessary
    string objectPart = ( !instrInfos.parameters[0].supplementaryInformation.empty() ) ? "static_cast<"+objInfo.cppClassName+"*>("+ManObjListName(objectName)+"[i])->" : ManObjListName(objectName)+"[i]->" ;

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

    actionCode += "for(unsigned int i = 0;i < "+ManObjListName(objectName)+".size();++i)\n";
    actionCode += "{\n";
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
    string objectPart =
    ( !instrInfos.parameters[1].supplementaryInformation.empty() ) ?
        "static_cast<"+autoInfo.cppClassName+"*>("+ManObjListName(objectName)+"[i]->GetAutomatismRawPointer(\""+automatismName+"\"))->"
    :   ManObjListName(objectName)+"[i]->GetAutomatismRawPointer(\""+automatismName+"\")->";

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
        actionCode += "for(unsigned int i = 0;i < "+ManObjListName(objectName)+".size();++i)\n";
        actionCode += "{\n";
        actionCode += "    "+call+";\n";
        actionCode += "}\n";
    }


    return actionCode;
}

string EventsCodeGenerator::GenerateSceneEventsCompleteCode(gd::Project & project, gd::Layout & scene, vector < gd::BaseEventSPtr > & events, bool compilationForRuntime)
{
    string output;

    //Prepare the global context ( Used to get needed header files )
    gd::EventsCodeGenerationContext context;
    EventsCodeGenerator codeGenerator(project, scene);
    codeGenerator.PreprocessEventList(scene.GetEvents());
    codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

    //Generate whole events code
    string wholeEventsCode = codeGenerator.GenerateEventsListCode(events, context);

    //Generate default code around events:
    //Includes
    output += "#include <vector>\n#include <map>\n#include <string>\n#include <algorithm>\n#include <SFML/System/Clock.hpp>\n#include <SFML/System/Vector2.hpp>\n#include <SFML/Graphics/Color.hpp>\n#include \"GDL/RuntimeContext.h\"\n#include \"GDL/Object.h\"\n";
    for ( set<string>::iterator include = codeGenerator.GetIncludeFiles().begin() ; include != codeGenerator.GetIncludeFiles().end(); ++include )
        output += "#include \""+*include+"\"\n";

    //Extra declarations needed by events
    for ( set<string>::iterator declaration = codeGenerator.GetCustomGlobalDeclaration().begin() ; declaration != codeGenerator.GetCustomGlobalDeclaration().end(); ++declaration )
        output += *declaration+"\n";

    output +=
    codeGenerator.GetCustomCodeOutsideMain()+
    "\n"
    "extern \"C\" int GDSceneEvents"+gd::SceneNameMangler::GetMangledSceneName(scene.GetName())+"(RuntimeContext * runtimeContext)\n"
    "{\n"
	+codeGenerator.GetCustomCodeInMain()
    +wholeEventsCode+
    "return 0;\n"
    "}\n";

    return output;
}

std::string EventsCodeGenerator::GenerateExternalEventsCompleteCode(gd::Project & project, gd::ExternalEvents & events, bool compilationForRuntime)
{
    DependenciesAnalyzer analyzer(project);
    std::string associatedSceneName = analyzer.ExternalEventsCanBeCompiledForAScene(events.GetName());
    if ( associatedSceneName.empty() || !project.HasLayoutNamed(associatedSceneName) )
    {
        std::cout << "ERROR: Cannot generate code for an external event: No unique associated scene." << std::endl;
        return "";
    }
    gd::Layout & associatedScene = project.GetLayout(project.GetLayoutPosition(associatedSceneName));

    string output;

    //Prepare the global context ( Used to get needed header files )
    gd::EventsCodeGenerationContext context;
    EventsCodeGenerator codeGenerator(project, associatedScene);
    codeGenerator.PreprocessEventList(events.GetEvents());
    codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

    //Generate whole events code
    string wholeEventsCode = codeGenerator.GenerateEventsListCode(events.GetEvents(), context);

    //Generate default code around events:
    //Includes
    output += "#include <vector>\n#include <map>\n#include <string>\n#include <algorithm>\n#include <SFML/System/Clock.hpp>\n#include <SFML/System/Vector2.hpp>\n#include <SFML/Graphics/Color.hpp>\n#include \"GDL/RuntimeContext.h\"\n#include \"GDL/RuntimeObject.h\"\n";
    for ( set<string>::iterator include = codeGenerator.GetIncludeFiles().begin() ; include != codeGenerator.GetIncludeFiles().end(); ++include )
        output += "#include \""+*include+"\"\n";

    //Extra declarations needed by events
    for ( set<string>::iterator declaration = codeGenerator.GetCustomGlobalDeclaration().begin() ; declaration != codeGenerator.GetCustomGlobalDeclaration().end(); ++declaration )
        output += *declaration+"\n";

    output +=
    codeGenerator.GetCustomCodeOutsideMain()+
    "\n"
    "void "+EventsCodeNameMangler::GetInstance()->GetExternalEventsFunctionMangledName(events.GetName())+"(RuntimeContext * runtimeContext)\n"
    "{\n"
	+codeGenerator.GetCustomCodeInMain()
    +wholeEventsCode+
    "return;\n"
    "}\n";

    return output;
}

EventsCodeGenerator::EventsCodeGenerator(gd::Project & project, const gd::Layout & layout) :
    gd::EventsCodeGenerator(project, layout, CppPlatform::Get())
{
}

EventsCodeGenerator::~EventsCodeGenerator()
{
}

void EventsCodeGenerator::PreprocessEventList( vector < gd::BaseEventSPtr > & listEvent )
{
    boost::shared_ptr<ProfileEvent> previousProfileEvent;

    for ( unsigned int i = 0;i < listEvent.size();++i )
    {
        listEvent[i]->Preprocess(*this, listEvent, i);
        if ( listEvent[i]->CanHaveSubEvents() )
            PreprocessEventList( listEvent[i]->GetSubEvents());

        if ( scene.GetProfiler() && scene.GetProfiler()->profilingActivated && listEvent[i]->IsExecutable() )
        {
            //Define a new profile event
            boost::shared_ptr<ProfileEvent> profileEvent = boost::shared_ptr<ProfileEvent>(new ProfileEvent);
            profileEvent->originalEvent = listEvent[i]->originalEvent;
            profileEvent->SetPreviousProfileEvent(previousProfileEvent);

            //Add it before the event to profile
            listEvent.insert(listEvent.begin()+i, profileEvent);

            previousProfileEvent = profileEvent;
            ++i; //Don't preprocess the newly added profile event
        }
    }

    if ( !listEvent.empty() && scene.GetProfiler() && scene.GetProfiler()->profilingActivated )
    {
        //Define a new profile event
        boost::shared_ptr<ProfileEvent> profileEvent = boost::shared_ptr<ProfileEvent>(new ProfileEvent);
        profileEvent->SetPreviousProfileEvent(previousProfileEvent);

        //Add it at the end of the events list
        listEvent.push_back(profileEvent);
    }
}

#endif

