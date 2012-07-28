/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY)
#include <string>
#include <vector>
#include <iostream>
#include "ChangesNotifier.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"
#include "GDL/Events/CodeCompilationHelpers.h"

void ChangesNotifier::OnObjectEdited(gd::Project & project, gd::Layout * layout, gd::Object & object) const
{
    try
    {
        Game & game = dynamic_cast<Game &>(project);
        Scene * scene = dynamic_cast<Scene *>(layout);

        if ( scene )
            scene->wasModified = true;
        else //Scene pointer is not NULL: Update shared data of all scenes
        {
            for (unsigned int i = 0;i<game.GetLayouts().size();++i)
                game.GetLayouts()[i]->wasModified = true;
        }
    }
    catch(...)
    {
        std::cout << "WARNING: IDE probably sent a gd::Project object which is not a GD C++ Platform project" << std::endl;
    }
}

void ChangesNotifier::OnObjectAdded(gd::Project & project, gd::Layout * layout, gd::Object & object) const
{
    RequestCompilation(project, layout);
}

void ChangesNotifier::OnObjectRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, const std::string & oldName) const
{
    RequestCompilation(project, layout);
}

void ChangesNotifier::OnObjectsDeleted(gd::Project & project, gd::Layout * layout, const std::vector<std::string> & deletedObjects) const
{
    RequestAutomatismsSharedDataUpdate(project, layout);
    RequestCompilation(project, layout);
}

void ChangesNotifier::OnAutomatismEdited(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism) const
{
    try
    {
        Game & game = dynamic_cast<Game &>(project);
        Scene * scene = dynamic_cast<Scene *>(layout);

        if ( scene )
            scene->wasModified = true;
        else //Scene pointer is not NULL: Update shared data of all scenes
        {
            for (unsigned int i = 0;i<game.GetLayouts().size();++i)
                game.GetLayouts()[i]->wasModified = true;
        }
    }
    catch(...)
    {
        std::cout << "WARNING: IDE probably sent a gd::Project object which is not a GD C++ Platform project" << std::endl;
    }
}

void ChangesNotifier::OnAutomatismAdded(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism) const
{
    RequestAutomatismsSharedDataUpdate(project, layout);
    RequestCompilation(project, layout);
}

void ChangesNotifier::OnAutomatismRenamed(gd::Project & project, gd::Layout * layout, gd::Object & object, gd::Automatism & automatism, const std::string & oldName) const
{
    RequestAutomatismsSharedDataUpdate(project, layout);
    RequestCompilation(project, layout);
}

void ChangesNotifier::OnAutomatismDeleted(gd::Project & project, gd::Layout * layout, gd::Object & object, const std::string & automatismName) const
{
    RequestAutomatismsSharedDataUpdate(project, layout);
    RequestCompilation(project, layout);
}

void ChangesNotifier::OnObjectVariablesChanged(gd::Project & project, gd::Layout * layout, gd::Object & object) const
{
    try
    {
        Game & game = dynamic_cast<Game &>(project);
        Scene * scene = dynamic_cast<Scene *>(layout);

        if ( scene )
            scene->wasModified = true;
        else //Scene pointer is not NULL: Update shared data of all scenes
        {
            for (unsigned int i = 0;i<game.GetLayouts().size();++i)
                game.GetLayouts()[i]->wasModified = true;
        }
    }
    catch(...)
    {
        std::cout << "WARNING: IDE probably sent a gd::Project object which is not a GD C++ Platform project" << std::endl;
    }
}

void ChangesNotifier::OnEventsModified(gd::Project & project, gd::Layout & layout, bool indirectChange) const
{
    try
    {
        Game & game = dynamic_cast<Game &>(project);
        Scene & scene = dynamic_cast<Scene &>(layout);

        scene.wasModified = true;
        scene.SetCompilationNeeded();
        if ( !indirectChange ) CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, scene);
    }
    catch(...)
    {
        std::cout << "WARNING: IDE probably sent a gd::Project object which is not a GD C++ Platform project" << std::endl;
    }
}

void ChangesNotifier::RequestCompilation(gd::Project & project, gd::Layout * layout) const
{
    try
    {
        Game & game = dynamic_cast<Game &>(project);
        Scene * scene = dynamic_cast<Scene *>(layout);

        if ( scene )
        {
            scene->wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(game, *scene);
        }
    }
    catch(...)
    {
        std::cout << "WARNING: IDE probably sent a gd::Project object which is not a GD C++ Platform project" << std::endl;
    }
}

void ChangesNotifier::RequestAutomatismsSharedDataUpdate(gd::Project & project, gd::Layout * layout) const
{
    try
    {
        Game & game = dynamic_cast<Game &>(project);
        Scene * scene = dynamic_cast<Scene *>(layout);

        if ( scene )
            scene->UpdateAutomatismsSharedData(game);
        else //Scene pointer is not NULL: Update shared data of all scenes
        {
            for (unsigned int i = 0;i<game.GetLayouts().size();++i)
                game.GetLayouts()[i]->UpdateAutomatismsSharedData(game);
        }
    }
    catch(...)
    {
        std::cout << "WARNING: IDE probably sent a gd::Project object which is not a GD C++ Platform project" << std::endl;
    }
}

#endif
