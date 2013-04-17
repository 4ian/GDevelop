/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDL/IDE/DependenciesAnalyzer.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
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

string EventsCodeGenerator::GenerateSceneEventsCompleteCode(const gd::Platform & platform, gd::Project & project, gd::Layout & scene, vector < gd::BaseEventSPtr > & events, bool compilationForRuntime)
{
    string output;

    //Prepare the global context ( Used to get needed header files )
    gd::EventsCodeGenerationContext context;
    gd::EventsCodeGenerator codeGenerator(project, platform);
    codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

    //Generate whole events code
    string wholeEventsCode = codeGenerator.GenerateEventsListCode(scene, events, context);

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
    "extern \"C\" int GDSceneEvents"+SceneNameMangler::GetMangledSceneName(scene.GetName())+"(RuntimeContext * runtimeContext)\n"
    "{\n"
	+codeGenerator.GetCustomCodeInMain()
    +wholeEventsCode+
    "return 0;\n"
    "}\n";

    return output;
}

std::string EventsCodeGenerator::GenerateExternalEventsCompleteCode(const gd::Platform & platform, gd::Project & project, gd::ExternalEvents & events, bool compilationForRuntime)
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
    gd::EventsCodeGenerator codeGenerator(project, platform);
    codeGenerator.SetGenerateCodeForRuntime(compilationForRuntime);

    //Generate whole events code
    string wholeEventsCode = codeGenerator.GenerateEventsListCode(associatedScene, events.GetEvents(), context);

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


/**
 * Call preprocession method of each event
 */
void EventsCodeGenerator::PreprocessEventList( gd::Project & project, gd::Layout & scene, vector < gd::BaseEventSPtr > & listEvent )
{
    boost::shared_ptr<ProfileEvent> previousProfileEvent;

    for ( unsigned int i = 0;i < listEvent.size();++i )
    {
        listEvent[i]->Preprocess(project, scene, listEvent, i);
        if ( listEvent[i]->CanHaveSubEvents() )
            PreprocessEventList( project, scene, listEvent[i]->GetSubEvents());

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

