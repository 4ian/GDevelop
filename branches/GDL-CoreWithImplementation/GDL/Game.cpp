/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExternalEvents.h"
#include "GDL/ExternalLayout.h"
#include "GDCore/PlatformDefinition/SourceFile.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/FontManager.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDCore/Tools/VersionWrapper.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/XmlMacros.h"

#if defined(GD_IDE_ONLY)
#include <wx/intl.h>
#include <wx/propgrid/propgrid.h>
#include <wx/propgrid/advprops.h>
#include <wx/settings.h>
#include <wx/log.h>
#include "GDL/PlatformDefinition/Platform.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDL/IDE/ChangesNotifier.h"
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/PlatformDefinition/ObjectGroup.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/CommonTools.h"
#elif !defined(_)
#define _(x) x
#endif

#if defined(GD_IDE_ONLY)
ChangesNotifier Game::changesNotifier;
#endif

Game::Game()
{
    #if defined(GD_IDE_ONLY)
    platform = new Platform; //For now, Platform is automatically created
    #endif
}

Game::~Game()
{
}

#if defined(GD_IDE_ONLY)
void Game::OnSelectionInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event)
{
    gd::Project::OnSelectionInPropertyGrid(grid, event);

    if ( event.GetPropertyName() == _("Globals variables") )
    {
        //Our implementation need to do a full recompilation when global variables have been edited
        for (unsigned int i = 0;i<GetLayoutCount();++i)
        {
            GetLayout(i).SetRefreshNeeded();
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(*this, GetLayout(i));
        }
    }
}
#endif

void Game::Init(const Game & game)
{
}

Game::Game(const Game & game)
    : gd::Project(game)
{
#if defined(GD_IDE_ONLY)
    platform = new Platform; //TODO For now, Platform is automatically created
#endif
    Init(game);
}

Game& Game::operator=(const Game & game)
{
    if ( this != &game )
    {
#if defined(GD_IDE_ONLY)
        platform = new Platform; //TODO For now, Platform is automatically created
#endif
        gd::Project::operator=(game);
        Init(game);
    }

    return *this;
}

