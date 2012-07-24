/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Game.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExternalEvents.h"
#include "GDL/ExternalLayout.h"
#include "GDL/SourceFile.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/ObjectHelpers.h"
#include "GDL/FontManager.h"

#if defined(GD_IDE_ONLY)
#include <wx/intl.h>
#include <wx/propgrid/propgrid.h>
#include <wx/propgrid/advprops.h>
#include "PlatformDefinition/Platform.h"
#include "GDL/Events/CodeCompilationHelpers.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/CommonTools.h"
#elif !defined(_)
#define _(x) x
#endif

Game::Game() :
name(_("Projet")),
windowWidth(800),
windowHeight(600),
maxFPS(60),
minFPS(10),
verticalSync(false),
useExternalSourceFiles(false)
#if defined(GD_IDE_ONLY)
,platform(NULL)
#endif
{
    #if defined(GD_IDE_ONLY)
    //Game use builtin extensions by default
    extensionsUsed.push_back("BuiltinObject");
    extensionsUsed.push_back("BuiltinAudio");
    extensionsUsed.push_back("BuiltinVariables");
    extensionsUsed.push_back("BuiltinTime");
    extensionsUsed.push_back("BuiltinMouse");
    extensionsUsed.push_back("BuiltinKeyboard");
    extensionsUsed.push_back("BuiltinJoystick");
    extensionsUsed.push_back("BuiltinCamera");
    extensionsUsed.push_back("BuiltinWindow");
    extensionsUsed.push_back("BuiltinFile");
    extensionsUsed.push_back("BuiltinNetwork");
    extensionsUsed.push_back("BuiltinScene");
    extensionsUsed.push_back("BuiltinAdvanced");
    extensionsUsed.push_back("Sprite");
    extensionsUsed.push_back("BuiltinCommonInstructions");
    extensionsUsed.push_back("BuiltinCommonConversions");
    extensionsUsed.push_back("BuiltinStringInstructions");
    extensionsUsed.push_back("BuiltinMathematicalTools");
    extensionsUsed.push_back("BuiltinExternalLayouts");

    platform = new Platform; //For now, Platform is automatically created
    #endif
}

Game::~Game()
{
}

#if defined(GD_IDE_ONLY)
void Game::PopulatePropertyGrid(wxPropertyGrid * grid)
{
    gd::Project::PopulatePropertyGrid(grid);

    grid->Append( new wxPropertyCategory(_("Génération")) );
    grid->Append( new wxStringProperty(_("Nom de l'executable Windows"), wxPG_LABEL, winExecutableFilename) );
    grid->Append( new wxImageFileProperty(_("Icone de l'executable Windows"), wxPG_LABEL, winExecutableIconFile) );
    grid->Append( new wxStringProperty(_("Nom de l'executable Linux"), wxPG_LABEL, linuxExecutableFilename) );
    grid->Append( new wxStringProperty(_("Nom de l'executable Mac OS"), wxPG_LABEL, macExecutableFilename) );

    grid->Append( new wxPropertyCategory(_("Fonctionnalités C++")) );
    grid->Append( new wxBoolProperty(_("Activer l'utilisation de sources C++"), wxPG_LABEL, useExternalSourceFiles) );

    grid->Append( new wxPropertyCategory(_("Ecran de chargement")) );
    grid->Append( new wxBoolProperty(_("Afficher l'écran"), wxPG_LABEL, loadingScreen.afficher) );
    grid->AppendIn( _("Ecran de chargement"), new wxPropertyCategory(_("Configuration")) );
    grid->Append( new wxBoolProperty(_("Afficher la bordure de la fenêtre"), wxPG_LABEL, loadingScreen.border) );
    grid->Append( new wxUIntProperty(_("Largeur"), "LoadingScreenWidth", loadingScreen.width) );
    grid->Append( new wxUIntProperty(_("Hauteur"), "LoadingScreenHeight", loadingScreen.height) );
    grid->Append( new wxBoolProperty(_("Afficher un texte"), wxPG_LABEL, loadingScreen.texte) );
    grid->Append( new wxIntProperty(_("Position X du texte"), wxPG_LABEL, loadingScreen.texteXPos) );
    grid->Append( new wxIntProperty(_("Position Y du texte"), wxPG_LABEL, loadingScreen.texteYPos) );
    grid->Append( new wxStringProperty(_("Texte à afficher"), wxPG_LABEL, loadingScreen.texteChargement) );
    grid->Append( new wxBoolProperty(_("Afficher une image"), wxPG_LABEL, loadingScreen.image) );
    grid->Append( new wxImageFileProperty(_("Fichier de l'image"), wxPG_LABEL, loadingScreen.imageFichier) );
    grid->Append( new wxBoolProperty(_("Lisser l'image"), wxPG_LABEL, loadingScreen.smooth) );
    grid->Append( new wxStringProperty(_("Aperçu"), "Preview", _("Cliquez pour prévisualiser...")) );

    grid->SetPropertyCell("Preview", 1, _("Cliquez pour prévisualiser..."), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
    grid->SetPropertyReadOnly(_("Variables globales"));

    grid->EnableProperty(_("Configuration"), grid->GetProperty(_("Afficher l'écran"))->GetValue().GetBool());
}

void Game::UpdateFromPropertyGrid(wxPropertyGrid * grid)
{
    gd::Project::UpdateFromPropertyGrid(grid);

    if ( grid->GetProperty(_("Nom de l'executable Windows")) != NULL)
        winExecutableFilename = gd::ToString(grid->GetProperty(_("Nom de l'executable Windows"))->GetValueAsString());
    if ( grid->GetProperty(_("Icone de l'executable Windows")) != NULL)
        winExecutableIconFile = gd::ToString(grid->GetProperty(_("Icone de l'executable Windows"))->GetValueAsString());
    if ( grid->GetProperty(_("Nom de l'executable Linux")) != NULL)
        linuxExecutableFilename = gd::ToString(grid->GetProperty(_("Nom de l'executable Linux"))->GetValueAsString());
    if ( grid->GetProperty(_("Nom de l'executable Mac OS")) != NULL)
        macExecutableFilename = gd::ToString(grid->GetProperty(_("Nom de l'executable Mac OS"))->GetValueAsString());
    if ( grid->GetProperty(_("Activer l'utilisation de sources C++")) != NULL)
        useExternalSourceFiles =grid->GetProperty(_("Activer l'utilisation de sources C++"))->GetValue().GetBool();
    if ( grid->GetProperty(_("Afficher l'écran")) != NULL)
        loadingScreen.afficher = grid->GetProperty(_("Afficher l'écran"))->GetValue().GetBool();
    if ( grid->GetProperty(_("Afficher la bordure de la fenêtre")) != NULL)
        loadingScreen.border =grid->GetProperty(_("Afficher la bordure de la fenêtre"))->GetValue().GetBool();
    if ( grid->GetProperty("LoadingScreenWidth") != NULL)
        loadingScreen.width = grid->GetProperty("LoadingScreenWidth")->GetValue().GetInteger();
    if ( grid->GetProperty("LoadingScreenHeight") != NULL)
        loadingScreen.height = grid->GetProperty("LoadingScreenHeight")->GetValue().GetInteger();
    if ( grid->GetProperty(_("Afficher un texte")) != NULL)
        loadingScreen.texte =grid->GetProperty(_("Afficher un texte"))->GetValue().GetBool();
    if ( grid->GetProperty(_("Position X du texte")) != NULL)
        loadingScreen.texteXPos = grid->GetProperty(_("Position X du texte"))->GetValue().GetInteger();
    if ( grid->GetProperty(_("Position Y du texte")) != NULL)
        loadingScreen.texteYPos = grid->GetProperty(_("Position Y du texte"))->GetValue().GetInteger();
    if ( grid->GetProperty(_("Texte à afficher")) != NULL)
        loadingScreen.texteChargement = gd::ToString(grid->GetProperty(_("Texte à afficher"))->GetValueAsString());
    if ( grid->GetProperty(_("Afficher une image")) != NULL)
        loadingScreen.image =grid->GetProperty(_("Afficher une image"))->GetValue().GetBool();
    if ( grid->GetProperty(_("Fichier de l'image")) != NULL)
        loadingScreen.imageFichier =grid->GetProperty(_("Fichier de l'image"))->GetValueAsString();
    if ( grid->GetProperty(_("Lisser l'image")) != NULL)
        loadingScreen.smooth =grid->GetProperty(_("Lisser l'image"))->GetValue().GetBool();
}

void Game::OnChangeInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event)
{
    gd::Project::OnChangeInPropertyGrid(grid, event);

    if ( event.GetPropertyName() == _("Afficher l'écran") )
        grid->EnableProperty(_("Configuration"), grid->GetProperty(_("Afficher l'écran"))->GetValue().GetBool());

    UpdateFromPropertyGrid(grid);
}

void Game::OnSelectionInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event)
{
    gd::Project::OnSelectionInPropertyGrid(grid, event);

    if ( event.GetPropertyName() == _("Variables globales") )
    {
        //Our implementation need to do a full recompilation when global variables have been edited
        for (unsigned int i = 0;i<GetLayouts().size();++i)
        {
            GetLayouts()[i]->wasModified = true;
            CodeCompilationHelpers::CreateSceneEventsCompilationTask(*this, *GetLayouts()[i]);
        }
    }
    else if ( event.GetPropertyName() == "Preview" )
    {
        int width =  grid->GetProperty("LoadingScreenWidth")->GetValue().GetInteger();
        int height = grid->GetProperty("LoadingScreenHeight")->GetValue().GetInteger();
        int texteXPos = grid->GetProperty(_("Position X du texte"))->GetValue().GetInteger();
        int texteYPos = grid->GetProperty(_("Position Y du texte"))->GetValue().GetInteger();

        // Fenêtre
        unsigned long style = 0;
        if ( grid->GetProperty(_("Afficher la bordure de la fenêtre"))->GetValue().GetBool() )
        {
            style |= sf::Style::Titlebar;
            style |= sf::Style::Close;
        }
        sf::RenderWindow App( sf::VideoMode( width, height, 32 ), "Chargement en cours...", style );

        sf::Texture image;
        if ( grid->GetProperty(_("Afficher une image"))->GetValue().GetBool() )
            image.LoadFromFile( gd::ToString(grid->GetProperty(_("Fichier de l'image"))->GetValueAsString()) );

        image.SetSmooth(grid->GetProperty(_("Lisser l'image"))->GetValue().GetBool());

        sf::Sprite sprite( image );

        sf::Text Chargement( gd::ToString(grid->GetProperty(_("Texte à afficher"))->GetValueAsString()), *FontManager::GetInstance()->GetFont("") );
        Chargement.SetPosition(texteXPos, texteYPos);
        App.Draw( Chargement );

        App.Clear( sf::Color( 100, 100, 100 ) );
        App.SetFramerateLimit( 30 );
        App.Display();

        bool Running = true;
        sf::Event Event;
        while ( Running )
        {
            App.Clear( sf::Color( 100, 100, 100 ) );

            // Process events
            while ( App.PollEvent( Event ) )
            {
                // Close window : exit
                if ( Event.Type == sf::Event::Closed || Event.Type == sf::Event::KeyPressed )
                    Running = false;
            }

            if ( grid->GetProperty(_("Afficher une image"))->GetValue().GetBool() )
                App.Draw( sprite );
            if ( grid->GetProperty(_("Afficher un texte"))->GetValue().GetBool() )
                App.Draw(Chargement);

            App.Display();
        }
    }
}

bool Game::HasLayoutNamed(const std::string & name) const
{
    return ( find_if(scenes.begin(), scenes.end(), bind2nd(SceneHasName(), name)) != scenes.end() );
}
gd::Layout & Game::GetLayout(const std::string & name)
{
    return *(*find_if(scenes.begin(), scenes.end(), bind2nd(SceneHasName(), name)));
}
const gd::Layout & Game::GetLayout(const std::string & name) const
{
    return *(*find_if(scenes.begin(), scenes.end(), bind2nd(SceneHasName(), name)));
}
gd::Layout & Game::GetLayout(unsigned int index)
{
    return *scenes[index];
}
const gd::Layout & Game::GetLayout (unsigned int index) const
{
    return *scenes[index];
}
unsigned int Game::GetLayoutPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<scenes.size();++i)
    {
        if ( scenes[i]->GetName() == name ) return i;
    }
    return std::string::npos;
}
unsigned int Game::GetLayoutCount() const
{
    return scenes.size();
}

void Game::InsertNewLayout(std::string & name, unsigned int position)
{
    boost::shared_ptr<Scene> newScene = boost::shared_ptr<Scene>(new Scene);
    if (position<scenes.size())
        scenes.insert(scenes.begin()+position, newScene);
    else
        scenes.push_back(newScene);

    newScene->SetName(name);
}

void Game::InsertLayout(const gd::Layout & layout, unsigned int position)
{
    try
    {
        const Scene & scene = dynamic_cast<const Scene&>(layout);
        boost::shared_ptr<Scene> newScene = boost::shared_ptr<Scene>(new Scene(scene));
        if (position<scenes.size())
            scenes.insert(scenes.begin()+position, newScene);
        else
            scenes.push_back(newScene);
    }
    catch(...) { std::cout << "WARNING: Tried to add a layout which is not a GD C++ Platform layout to a GD C++ Platform project"; }
}

void Game::RemoveLayout(const std::string & name)
{
    std::vector< boost::shared_ptr<Scene> >::iterator scene = find_if(scenes.begin(), scenes.end(), bind2nd(SceneHasName(), name));
    if ( scene == scenes.end() ) return;

    scenes.erase(scene);
}

bool Game::HasExternalEventsNamed(const std::string & name) const
{
    return ( find_if(externalEvents.begin(), externalEvents.end(), bind2nd(ExternalEventsHasName(), name)) != externalEvents.end() );
}
gd::ExternalEvents & Game::GetExternalEvents(const std::string & name)
{
    return *(*find_if(externalEvents.begin(), externalEvents.end(), bind2nd(ExternalEventsHasName(), name)));
}
const gd::ExternalEvents & Game::GetExternalEvents(const std::string & name) const
{
    return *(*find_if(externalEvents.begin(), externalEvents.end(), bind2nd(ExternalEventsHasName(), name)));
}
gd::ExternalEvents & Game::GetExternalEvents(unsigned int index)
{
    return *externalEvents[index];
}
const gd::ExternalEvents & Game::GetExternalEvents (unsigned int index) const
{
    return *externalEvents[index];
}
unsigned int Game::GetExternalEventsPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<externalEvents.size();++i)
    {
        if ( externalEvents[i]->GetName() == name ) return i;
    }
    return std::string::npos;
}
unsigned int Game::GetExternalEventsCount() const
{
    return externalEvents.size();
}

void Game::InsertNewExternalEvents(std::string & name, unsigned int position)
{
    boost::shared_ptr<ExternalEvents> newExternalEvents = boost::shared_ptr<ExternalEvents>(new ExternalEvents);
    if (position<externalEvents.size())
        externalEvents.insert(externalEvents.begin()+position, newExternalEvents);
    else
        externalEvents.push_back(newExternalEvents);

    newExternalEvents->SetName(name);
}

void Game::InsertExternalEvents(const gd::ExternalEvents & events, unsigned int position)
{
    try
    {
        const ExternalEvents & castedEvents = dynamic_cast<const ExternalEvents&>(events);
        boost::shared_ptr<ExternalEvents> newExternalEvents = boost::shared_ptr<ExternalEvents>(new ExternalEvents(castedEvents));
        if (position<externalEvents.size())
            externalEvents.insert(externalEvents.begin()+position, newExternalEvents);
        else
            externalEvents.push_back(newExternalEvents);
    }
    catch(...) { std::cout << "WARNING: Tried to add external events which are not GD C++ Platform ExternalEvents to a GD C++ Platform project"; }
}

void Game::RemoveExternalEvents(const std::string & name)
{
    std::vector< boost::shared_ptr<ExternalEvents> >::iterator events = find_if(externalEvents.begin(), externalEvents.end(), bind2nd(ExternalEventsHasName(), name));
    if ( events == externalEvents.end() ) return;

    externalEvents.erase(events);
}

bool Game::HasExternalLayoutNamed(const std::string & name) const
{
    return ( find_if(externalLayouts.begin(), externalLayouts.end(), bind2nd(ExternalLayoutHasName(), name)) != externalLayouts.end() );
}
gd::ExternalLayout & Game::GetExternalLayout(const std::string & name)
{
    return *(*find_if(externalLayouts.begin(), externalLayouts.end(), bind2nd(ExternalLayoutHasName(), name)));
}
const gd::ExternalLayout & Game::GetExternalLayout(const std::string & name) const
{
    return *(*find_if(externalLayouts.begin(), externalLayouts.end(), bind2nd(ExternalLayoutHasName(), name)));
}
gd::ExternalLayout & Game::GetExternalLayout(unsigned int index)
{
    return *externalLayouts[index];
}
const gd::ExternalLayout & Game::GetExternalLayout (unsigned int index) const
{
    return *externalLayouts[index];
}
unsigned int Game::GetExternalLayoutPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<externalLayouts.size();++i)
    {
        if ( externalLayouts[i]->GetName() == name ) return i;
    }
    return std::string::npos;
}
unsigned int Game::GetExternalLayoutsCount() const
{
    return externalLayouts.size();
}

void Game::InsertNewExternalLayout(std::string & name, unsigned int position)
{
    boost::shared_ptr<ExternalLayout> newExternalLayout = boost::shared_ptr<ExternalLayout>(new ExternalLayout);
    if (position<externalLayouts.size())
        externalLayouts.insert(externalLayouts.begin()+position, newExternalLayout);
    else
        externalLayouts.push_back(newExternalLayout);

    newExternalLayout->SetName(name);
}

void Game::InsertExternalLayout(const gd::ExternalLayout & events, unsigned int position)
{
    try
    {
        const ExternalLayout & castedEvents = dynamic_cast<const ExternalLayout&>(events);
        boost::shared_ptr<ExternalLayout> newExternalLayout = boost::shared_ptr<ExternalLayout>(new ExternalLayout(castedEvents));
        if (position<externalLayouts.size())
            externalLayouts.insert(externalLayouts.begin()+position, newExternalLayout);
        else
            externalLayouts.push_back(newExternalLayout);
    }
    catch(...) { std::cout << "WARNING: Tried to add external layout which are not GD C++ Platform ExternalLayout to a GD C++ Platform project"; }
}

void Game::RemoveExternalLayout(const std::string & name)
{
    std::vector< boost::shared_ptr<ExternalLayout> >::iterator externalLayout = find_if(externalLayouts.begin(), externalLayouts.end(), bind2nd(ExternalLayoutHasName(), name));
    if ( externalLayout == externalLayouts.end() ) return;

    externalLayouts.erase(externalLayout);
}


bool Game::HasObjectNamed(const std::string & name) const
{
    return ( find_if(GetGlobalObjects().begin(), GetGlobalObjects().end(), bind2nd(ObjectHasName(), name)) != GetGlobalObjects().end() );
}
gd::Object & Game::GetObject(const std::string & name)
{
    return *(*find_if(GetGlobalObjects().begin(), GetGlobalObjects().end(), bind2nd(ObjectHasName(), name)));
}
const gd::Object & Game::GetObject(const std::string & name) const
{
    return *(*find_if(GetGlobalObjects().begin(), GetGlobalObjects().end(), bind2nd(ObjectHasName(), name)));
}
gd::Object & Game::GetObject(unsigned int index)
{
    return *GetGlobalObjects()[index];
}
const gd::Object & Game::GetObject (unsigned int index) const
{
    return *GetGlobalObjects()[index];
}
unsigned int Game::GetObjectPosition(const std::string & name) const
{
    for (unsigned int i = 0;i<GetGlobalObjects().size();++i)
    {
        if ( GetGlobalObjects()[i]->GetName() == name ) return i;
    }
    return std::string::npos;
}
unsigned int Game::GetObjectsCount() const
{
    return GetGlobalObjects().size();
}

void Game::InsertNewObject(std::string & name, unsigned int position)
{
    boost::shared_ptr<Object> newObject = boost::shared_ptr<Object>(new Object(name));
    if (position<GetGlobalObjects().size())
        GetGlobalObjects().insert(GetGlobalObjects().begin()+position, newObject);
    else
        GetGlobalObjects().push_back(newObject);
}

void Game::InsertObject(const gd::Object & events, unsigned int position)
{
    try
    {
        const Object & castedEvents = dynamic_cast<const Object&>(events);
        boost::shared_ptr<Object> newObject = boost::shared_ptr<Object>(new Object(castedEvents));
        if (position<GetGlobalObjects().size())
            GetGlobalObjects().insert(GetGlobalObjects().begin()+position, newObject);
        else
            GetGlobalObjects().push_back(newObject);
    }
    catch(...) { std::cout << "WARNING: Tried to add an object which is not a GD C++ Platform Object to a GD C++ Platform project"; }
}

void Game::RemoveObject(const std::string & name)
{
    std::vector< boost::shared_ptr<Object> >::iterator events = find_if(GetGlobalObjects().begin(), GetGlobalObjects().end(), bind2nd(ObjectHasName(), name));
    if ( events == GetGlobalObjects().end() ) return;

    GetGlobalObjects().erase(events);
}
#endif

void Game::Init(const Game & game)
{
    //Some properties
    name = game.name;
    windowWidth = game.windowWidth;
    windowHeight = game.windowHeight;
    maxFPS = game.maxFPS;
    minFPS = game.minFPS;
    verticalSync = game.verticalSync;

    #if defined(GD_IDE_ONLY)
    author = game.author;
    extensionsUsed = game.GetUsedPlatformExtensions();
    #endif

    loadingScreen = game.loadingScreen;

    //Resources
    resourceManager = game.resourceManager;

    GetGlobalObjects().clear();
    for (unsigned int i =0;i<game.GetGlobalObjects().size();++i)
    	GetGlobalObjects().push_back( boost::shared_ptr<Object>(game.GetGlobalObjects()[i]->Clone()) );

    scenes.clear();
    for (unsigned int i =0;i<game.scenes.size();++i)
    	scenes.push_back( boost::shared_ptr<Scene>(new Scene(*game.scenes[i])) );

    #if defined(GD_IDE_ONLY)
    externalEvents.clear();
    for (unsigned int i =0;i<game.externalEvents.size();++i)
    	externalEvents.push_back( boost::shared_ptr<ExternalEvents>(new ExternalEvents(*game.externalEvents[i])) );
    #endif

    externalLayouts.clear();
    for (unsigned int i =0;i<game.externalLayouts.size();++i)
    	externalLayouts.push_back( boost::shared_ptr<ExternalLayout>(new ExternalLayout(*game.externalLayouts[i])) );

    useExternalSourceFiles = game.useExternalSourceFiles;

    #if defined(GD_IDE_ONLY)
    externalSourceFiles.clear();
    for (unsigned int i =0;i<game.externalSourceFiles.size();++i)
    	externalSourceFiles.push_back( boost::shared_ptr<GDpriv::SourceFile>(new GDpriv::SourceFile(*game.externalSourceFiles[i])) );
    #endif

    variables = game.GetVariables();

    #if defined(GD_IDE_ONLY)
    gameFile = game.GetProjectFile();
    imagesChanged = game.imagesChanged;

    winExecutableFilename = game.winExecutableFilename;
    winExecutableIconFile = game.winExecutableIconFile;
    linuxExecutableFilename = game.linuxExecutableFilename;
    macExecutableFilename = game.macExecutableFilename;
    #endif
}


Game::Game(const Game & game)
#if defined(GD_IDE_ONLY)
    : gd::Project(game)
#endif
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
        gd::Project::operator=(game);
#endif
        Init(game);
    }

    return *this;
}
