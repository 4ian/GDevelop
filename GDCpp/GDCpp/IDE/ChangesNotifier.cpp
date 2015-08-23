/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#include <string>
#include <vector>
#include <iostream>
#if !defined(GD_NO_WX_GUI)
#include <wx/datetime.h>
#endif
#include "ChangesNotifier.h"
#include "GDCore/IDE/EventsChangesNotifier.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCpp/CppPlatform.h"
#include "GDCpp/IDE/DependenciesAnalyzer.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Project.h"
#include "GDCpp/Events/CodeCompilationHelpers.h"

void ChangesNotifier::OnObjectEdited(gd::Project & game, gd::Layout * scene, gd::Object & object) const
{
    if ( scene )
        scene->SetRefreshNeeded();
    else //Scene pointer is not NULL: Update shared data of all scenes
    {
        for (std::size_t i = 0;i<game.GetLayoutsCount();++i)
            game.GetLayout(i).SetRefreshNeeded();
    }
}

void ChangesNotifier::OnObjectAdded(gd::Project & project, gd::Layout * layout, gd::Object & object) const
{
    RequestFullRecompilation(project, layout);
}
void ChangesNotifier::OnObjectRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, const gd::String & oldName) const
{
    RequestFullRecompilation(project, layout);
}
void ChangesNotifier::OnVariablesModified(gd::Project & project, gd::Layout * layout) const
{
    RequestFullRecompilation(project, layout);
}
void ChangesNotifier::OnObjectGroupAdded(gd::Project & project, gd::Layout * layout, const gd::String & groupName) const
{
    RequestFullRecompilation(project, layout);
}
void ChangesNotifier::OnObjectGroupEdited(gd::Project & project, gd::Layout * layout, const gd::String & groupName) const
{
    RequestFullRecompilation(project, layout);
}
void ChangesNotifier::OnObjectGroupRenamed(gd::Project & project, gd::Layout * layout, const gd::String & groupName, const gd::String & oldName) const
{
    RequestFullRecompilation(project, layout);
}
void ChangesNotifier::OnObjectGroupDeleted(gd::Project & project, gd::Layout * layout, const gd::String & groupName) const
{
    RequestFullRecompilation(project, layout);
}

void ChangesNotifier::OnObjectsDeleted(gd::Project & project, gd::Layout * layout, const std::vector<gd::String> & deletedObjects) const
{
    RequestFullRecompilation(project, layout);
}

void ChangesNotifier::OnBehaviorEdited(gd::Project & game, gd::Layout * scene, gd::Object & object, gd::Behavior & behavior) const
{
    if ( scene )
        scene->SetRefreshNeeded();
    else //Scene pointer is not NULL: Update shared data of all scenes
    {
        for (std::size_t i = 0;i<game.GetLayoutsCount();++i)
            game.GetLayout(i).SetRefreshNeeded();
    }
}

void ChangesNotifier::OnBehaviorAdded(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Behavior & behavior) const
{
    RequestFullRecompilation(project, layout);
}

void ChangesNotifier::OnBehaviorRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Behavior & behavior, const gd::String & oldName) const
{
    RequestFullRecompilation(project, layout);
}

void ChangesNotifier::OnBehaviorDeleted(gd::Project & project, gd::Layout * layout, gd::Object & object, const gd::String & behaviorName) const
{
    RequestFullRecompilation(project, layout);
}

void ChangesNotifier::OnObjectVariablesChanged(gd::Project & game, gd::Layout * scene, gd::Object & object) const
{
    #if !defined(GD_NO_WX_GUI) //Compilation is not supported when wxWidgets support is disabled.
    if ( scene )
        scene->SetRefreshNeeded();
    else //Scene pointer is NULL: Update shared data of all scenes
    {
        for (std::size_t i = 0;i<game.GetLayoutsCount();++i)
        {
            game.GetLayout(i).SetRefreshNeeded();
            game.GetLayout(i).SetCompilationNeeded();
        }
        for (std::size_t i = 0;i<game.GetExternalEventsCount();++i)
        {
            game.GetExternalEvents(i).SetLastChangeTimeStamp(wxDateTime::Now().GetTicks()); //Do no forget external events as they can have been compiled separately from scenes.
        }
    }
    #endif
}

void ChangesNotifier::OnEventsModified(gd::Project & game, gd::Layout & scene, bool indirectChange, gd::String sourceOfTheIndirectChange) const
{
    #if !defined(GD_NO_WX_GUI) //Compilation is not supported when wxWidgets support is disabled.
    std::cout << "Changes occured inside " << scene.GetName() << "...";

    scene.SetRefreshNeeded();
    if ( !indirectChange || !game.HasExternalEventsNamed(sourceOfTheIndirectChange) ) //Changes occured directly in the scene: Recompile it.
    {
        scene.SetCompilationNeeded();
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
        std::cout << "Recompilation triggered." << std::endl;
    }
    else
    {
        DependenciesAnalyzer analyzer(game, game.GetExternalEvents(sourceOfTheIndirectChange));
        if ( analyzer.ExternalEventsCanBeCompiledForAScene() == scene.GetName() )
        {
            //Do nothing: Changes occured in an external event which is compiled separately
            std::cout << "But nothing to do." << std::endl;
        }
        else
        {
            //Changes occurred in an external event which is directly included in the scene events.
            scene.SetCompilationNeeded();
            std::cout << "Recompilation asked for later." << std::endl;
        }
    }
    #endif
}

void ChangesNotifier::OnEventsModified(gd::Project & game, gd::ExternalEvents & events, bool indirectChange, gd::String sourceOfTheIndirectChange) const
{
    #if !defined(GD_NO_WX_GUI) //Compilation is not supported when wxWidgets support is disabled.
    DependenciesAnalyzer analyzer(game, events);
    gd::String associatedScene = analyzer.ExternalEventsCanBeCompiledForAScene();
    bool externalEventsAreCompiledSeparately = !associatedScene.empty();

    if ( !externalEventsAreCompiledSeparately ) return;

    std::cout << "Changes occured inside " << events.GetName() << " (compiled separately)..." << std::endl;

    //The external events are compiled separately from the scene events:
    //We need to recompile them if the changes occured inside them.

    if ( !indirectChange || !game.HasExternalEventsNamed(sourceOfTheIndirectChange)  )
    {
        //Changes occurred directly inside the external events: We need to recompile them
        events.SetLastChangeTimeStamp(wxDateTime::Now().GetTicks());
        CodeCompilationHelpers::CreateExternalEventsCompilationTask(game, events);
        std::cout << "Recompilation triggered." << std::endl;
    }
    else
    {
        DependenciesAnalyzer analyzer(game, game.GetExternalEvents(sourceOfTheIndirectChange));
        if ( analyzer.ExternalEventsCanBeCompiledForAScene() == associatedScene )
        {
            //Do nothing: Changes occurred in an external event which is compiled separately
            std::cout << "But nothing to do." << std::endl;
        }
        else
        {
            //Changes occurred in an another external event which is directly included in our external events.
            events.SetLastChangeTimeStamp(wxDateTime::Now().GetTicks());
            CodeCompilationHelpers::CreateExternalEventsCompilationTask(game, events);
            std::cout << "Recompilation triggered." << std::endl;
        }
    }
    #endif
}

void ChangesNotifier::OnLayoutAdded(gd::Project & project, gd::Layout & layout) const
{
    //A new layout may trigger recompilation of some events.
    gd::EventsChangesNotifier::NotifyChangesInEventsOfScene(project, layout);
}

void ChangesNotifier::OnLayoutRenamed(gd::Project & project, gd::Layout & layout, const gd::String & oldName) const
{
    //A renamed layout may trigger recompilation of some events.
    gd::EventsChangesNotifier::NotifyChangesInEventsOfScene(project, layout);
}

void ChangesNotifier::OnExternalEventsAdded(gd::Project & project, gd::ExternalEvents & events) const
{
    //New external events may trigger recompilation of some events.
    gd::EventsChangesNotifier::NotifyChangesInEventsOfExternalEvents(project, events);
}

void ChangesNotifier::OnExternalEventsRenamed(gd::Project & project, gd::ExternalEvents & events, const gd::String & oldName) const
{
    //A renamed external events sheet may trigger recompilation of some events.
    gd::EventsChangesNotifier::NotifyChangesInEventsOfExternalEvents(project, events);
}

void ChangesNotifier::OnExternalEventsDeleted(gd::Project & project, const gd::String deletedLayout) const
{
    RequestFullRecompilation(project, NULL);
}

void ChangesNotifier::OnLayoutDeleted(gd::Project & project, const gd::String deletedLayout) const
{
    //There is a possibility that the deleting the layout now enables some external events
    //to be compiled separately from the scene using them ( For instance, scenes A and B are including
    //the external events, and scene B is deleted ).
    //So we request the recompilation of all scenes.
    RequestFullRecompilation(project, NULL);
}

void ChangesNotifier::RequestFullRecompilation(gd::Project & game, gd::Layout * scene) const
{
    #if !defined(GD_NO_WX_GUI) //Compilation is not supported when wxWidgets support is disabled.
    if ( scene )
    {
        //Notify the scene it has been changed...
        scene->SetRefreshNeeded();

        //...as well as the dependencies
        DependenciesAnalyzer analyzer(game, *scene);
        if ( !analyzer.Analyze() )
        {
            std::cout << "WARNING: Circular dependency for scene " << scene->GetName() << std::endl;
            return;
        }

        std::set< gd::String > externalEventsDependencies = analyzer.GetExternalEventsDependencies();
        for (std::set<gd::String>::const_iterator i = externalEventsDependencies.begin();i!=externalEventsDependencies.end();++i)
        {
            if ( game.HasExternalEventsNamed(*i) )
                game.GetExternalEvents(*i).SetLastChangeTimeStamp(wxDateTime::Now().GetTicks());
        }

        //And ask for a recompilation of everything.
        CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
    }
    else //Scene pointer is NULL: Mark all scenes as modified
    {
        for (std::size_t i = 0;i<game.GetLayoutsCount();++i)
        {
            game.GetLayout(i).SetRefreshNeeded();
            game.GetLayout(i).SetCompilationNeeded();
        }
        for (std::size_t i = 0;i<game.GetExternalEventsCount();++i)
        {
            game.GetExternalEvents(i).SetLastChangeTimeStamp(wxDateTime::Now().GetTicks()); //Do no forget external events as they can have been compiled separately from scenes.
        }
    }
    #endif
}

void ChangesNotifier::OnResourceModified(gd::Project & project, const gd::String & resourceName) const
{
    project.imagesChanged.push_back(resourceName);
}

#endif
