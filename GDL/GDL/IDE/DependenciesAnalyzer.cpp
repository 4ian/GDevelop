#if defined(GD_IDE_ONLY)
#include "GDCore/Events/Event.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/SourceFile.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDL/CppCodeEvent.h"
#include "DependenciesAnalyzer.h"

bool DependenciesAnalyzer::Analyze(std::vector< boost::shared_ptr<gd::BaseEvent> > & events)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        boost::shared_ptr<gd::LinkEvent> linkEvent = boost::dynamic_pointer_cast<gd::LinkEvent>(events[i]);
        boost::shared_ptr<CppCodeEvent> cppCodeEvent = boost::dynamic_pointer_cast<CppCodeEvent>(events[i]);
        if ( linkEvent != boost::shared_ptr<gd::LinkEvent>() )
        {
            std::string linked = linkEvent->GetTarget();
            if ( project.HasExternalEventsNamed(linked) )
            {
                externalEventsDependencies.insert(linked);

                if ( !Analyze(project.GetExternalEvents(linked).GetEvents()) )
                    return false;
            }
            else if ( project.HasLayoutNamed(linked) )
            {
                scenesDependencies.insert(linked);

                if ( !Analyze(project.GetLayout(linked).GetEvents()) )
                    return false;
            }
        }
        else if ( cppCodeEvent != boost::shared_ptr<CppCodeEvent>() )
        {
            const std::vector<std::string> & dependencies = cppCodeEvent->GetDependencies();
            sourceFilesDependencies.insert(dependencies.begin(), dependencies.end());
            sourceFilesDependencies.insert(cppCodeEvent->GetAssociatedGDManagedSourceFile(project));
        }
    }

    if ( !baseScene.empty() && scenesDependencies.find(baseScene) != scenesDependencies.end() )
        return false;

    if ( !baseExternalEvents.empty() && externalEventsDependencies.find(baseExternalEvents) != externalEventsDependencies.end() )
        return false;

    return true;
}

DependenciesAnalyzer::~DependenciesAnalyzer()
{
}

std::string DependenciesAnalyzer::ExternalEventsCanBeCompiledForAScene(const std::string & externalEventsName)
{
    std::string sceneName;
    for (unsigned int i = 0;i<project.GetLayoutCount();++i)
    {
        DependenciesAnalyzer analyzer(project);
        analyzer.Analyze(project.GetLayout(i).GetEvents());
        const std::set <std::string > & dependencies = analyzer.GetExternalEventsDependencies();

        if ( dependencies.find(externalEventsName) != dependencies.end() &&
             CheckIfExternalEventsIsLinkedOnlyAtTopLevel(externalEventsName, project.GetLayout(i).GetEvents()) )
        {
            if (!sceneName.empty())
                return ""; //External events can be compiled only if one scene is including them.
            else
                sceneName = project.GetLayout(i).GetName();
        }
    }

    return sceneName; //External events can be compiled and used for the scene.
}

bool DependenciesAnalyzer::CheckIfExternalEventsIsLinkedOnlyAtTopLevel(const std::string & externalEventsName, std::vector< boost::shared_ptr<gd::BaseEvent> > & events)
{
    for (unsigned int i = 0;i<events.size();++i)
    {
        //Check the sub events of each events:
        //If they contain a link to the external events, then external events are not used
        //at the top level.
        if ( events[i]->CanHaveSubEvents() )
        {
            DependenciesAnalyzer analyzer(project);
            analyzer.Analyze(events[i]->GetSubEvents());
            const std::set <std::string > & dependencies = analyzer.GetExternalEventsDependencies();

            if ( dependencies.find(externalEventsName) != dependencies.end() )
                return false;
        }

        //Check the targets of the links
        boost::shared_ptr<gd::LinkEvent> linkEvent = boost::dynamic_pointer_cast<gd::LinkEvent>(events[i]);
        if ( linkEvent != boost::shared_ptr<gd::LinkEvent>() )
        {
            std::string linked = linkEvent->GetTarget();
            if ( project.HasExternalEventsNamed(linked) )
            {
                if ( !CheckIfExternalEventsIsLinkedOnlyAtTopLevel(externalEventsName, project.GetExternalEvents(linked).GetEvents()) )
                    return false;
            }
            else if ( project.HasLayoutNamed(linked) )
            {
                if ( !CheckIfExternalEventsIsLinkedOnlyAtTopLevel(externalEventsName, project.GetLayout(linked).GetEvents()) )
                    return false;
            }
        }
    }

    //Here, we're sure that, if a link to the external events exists, then it is only
    //at the top level of events (i.e: The link has not parent ).
    return true;
}

#endif
