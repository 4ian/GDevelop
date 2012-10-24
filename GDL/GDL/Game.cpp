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
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/VersionWrapper.h"
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
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/CommonTools.h"
#elif !defined(_)
#define _(x) x
#endif

#if defined(GD_IDE_ONLY)
ChangesNotifier Game::changesNotifier;
#endif

Game::Game() :
useExternalSourceFiles(false),
name(_("Project")),
windowWidth(800),
windowHeight(600),
maxFPS(60),
minFPS(10),
verticalSync(false)
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

void Game::LoadFromXml(const TiXmlElement * rootElement)
{
    if ( rootElement == NULL ) return;

    const TiXmlElement * elem = rootElement->FirstChildElement();

    //Comparaison de versions
    int major = 0;
    int minor = 0;
    int build = 0;
    int revision = 0;
    if ( elem != NULL )
    {
        elem->QueryIntAttribute( "Major", &major );
        elem->QueryIntAttribute( "Minor", &minor );
        elem->QueryIntAttribute( "Build", &build );
        elem->QueryIntAttribute( "Revision", &revision );
        if ( major > GDLVersionWrapper::Major() )
        {
            #if defined(GD_IDE_ONLY)
            wxLogWarning( _( "The version of the editor used to create this game seems to be a new version.\nThe game can not open, or datas may be missing.\nYou should check if a new version of Game Develop is available." ) );
            #endif
        }
        else
        {
            if ( major == GDLVersionWrapper::Major() && (build > GDLVersionWrapper::Build() || minor > GDLVersionWrapper::Minor() || revision > GDLVersionWrapper::Revision()) )
            {
                #if defined(GD_IDE_ONLY)
                wxLogWarning( _( "The version of the editor used to create this game seems to be greater.\nThe game can not open, or data may be missing.\nYou should check if a new version of Game Develop is available." ) );
                #endif
            }
        }

        //Compatibility code
        #if defined(GD_IDE_ONLY)
        if ( major <= 1 )
        {
            wxLogError(_("The game was saved with version of Game Develop which is too old. Please open and save the game with one of the first version of Game Develop 2. You will then be able to open your game with this Game Develop version."));
            return;
        }
        #endif
        //End of Compatibility code
    }

    elem = rootElement->FirstChildElement( "Info" );
    if ( elem ) LoadGameInformationFromXml(elem);

    if (  elem->FirstChildElement( "Chargement" ) != NULL )
    {
        OpenSaveLoadingScreen::OpenFromElement(loadingScreen, elem->FirstChildElement( "Chargement" ));
    }

    //Compatibility code
    #if defined(GD_IDE_ONLY)
    if ( major < 2 || (major == 2 && minor == 0 && build <= 10498) )
    {
        OpenSaveGame::OpenImagesFromGD2010498(*this,
                                              rootElement->FirstChildElement( "Images" )->FirstChildElement(),
                                              rootElement->FirstChildElement( "DossierImages" )->FirstChildElement());
    }
    #endif
    //End of Compatibility code

    //Compatibility code
    #if defined(GD_IDE_ONLY)
    if ( major < 2 || (major == 2 && minor <= 0) )
    {
        //TODO
        /*
        updateText += _("The action \"Create an object from its name\" need you to specify a group of objects containing all the objects which can be created by the action.\nFor example, if the objects created by the action can be Object1, Object2 or Object3, you can create a group containing these 3 objects and pass it as parameter of the action.\n\n");
        updateText += _("Functions setup has been changed. You have now to specify the objects to be passed as arguments to the function, if needed. As below, you can create an object group containing the objects to be passed as arguments to the function.\n\n");
        updateText += _("Finally, if you're using Linked Objects extension, the actions/conditions now always need you to specify the name of objects to be taken into account: Check your events related to this extension.\n\n");
        updateText += _("Thank you for your understanding.\n");
        */
    }
    #endif
    //End of Compatibility code

    //Compatibility code
    #if defined(GD_IDE_ONLY)
    if ( major < 2 || (major == 2 && minor <= 1 && build <= 10822) )
    {
        GetUsedPlatformExtensions().push_back("BuiltinExternalLayouts");
    }
    #endif

    resourcesManager.LoadFromXml(rootElement->FirstChildElement( "Resources" ));

    //Global objects
    elem = rootElement->FirstChildElement( "Objects" );
    if ( elem )
        OpenSaveGame::OpenObjects(GetGlobalObjects(), elem);

    #if defined(GD_IDE_ONLY)
    //Global object groups
    elem = rootElement->FirstChildElement( "ObjectGroups" );
    if ( elem )
        OpenSaveGame::OpenGroupesObjets(GetObjectGroups(), elem);
    #endif

    //Global variables
    elem = rootElement->FirstChildElement( "Variables" );
    if ( elem ) GetVariables().LoadFromXml(elem);

    //Scenes
    elem = rootElement->FirstChildElement( "Scenes" ) ? rootElement->FirstChildElement( "Scenes" )->FirstChildElement() : NULL;
    while ( elem )
    {
        std::string layoutName = elem->Attribute( "nom" ) != NULL ? elem->Attribute( "nom" ) : "";

        //Add a new layout
        GetLayouts().push_back(boost::shared_ptr<Scene>(new Scene));
        GetLayouts().back()->SetName(layoutName);
        GetLayouts().back()->LoadFromXml(elem);

        elem = elem->NextSiblingElement();
    }

    #if defined(GD_IDE_ONLY)
    //External events
    elem = rootElement->FirstChildElement( "ExternalEvents" );
    if ( elem )
        OpenSaveGame::OpenExternalEvents(GetExternalEvents(), elem);

    elem = rootElement->FirstChildElement( "ExternalSourceFiles" );
    if ( elem )
    {
        const TiXmlElement * sourceFileElem = elem->FirstChildElement( "SourceFile" );
        while (sourceFileElem)
        {
            boost::shared_ptr<GDpriv::SourceFile> newSourceFile(new GDpriv::SourceFile);
            newSourceFile->LoadFromXml(sourceFileElem);
            externalSourceFiles.push_back(newSourceFile);

            sourceFileElem = sourceFileElem->NextSiblingElement();
        }
    }
    #endif

    elem = rootElement->FirstChildElement( "ExternalLayouts" );
    if ( elem )
    {
        const TiXmlElement * externalLayoutElem = elem->FirstChildElement( "ExternalLayout" );
        while (externalLayoutElem)
        {
            boost::shared_ptr<ExternalLayout> newExternalLayout(new ExternalLayout);
            newExternalLayout->LoadFromXml(externalLayoutElem);
            GetExternalLayouts().push_back(newExternalLayout);

            externalLayoutElem = externalLayoutElem->NextSiblingElement();
        }
    }

    return;
}

void Game::LoadGameInformationFromXml(const TiXmlElement * elem)
{
    if ( elem->FirstChildElement( "Nom" ) != NULL ) { SetName( elem->FirstChildElement( "Nom" )->Attribute( "value" ) ); }
    if ( elem->FirstChildElement( "WindowW" ) != NULL ) { SetMainWindowDefaultWidth(ToInt(elem->FirstChildElement( "WindowW" )->Attribute( "value"))); }
    if ( elem->FirstChildElement( "WindowH" ) != NULL ) { SetMainWindowDefaultHeight(ToInt(elem->FirstChildElement( "WindowH" )->Attribute( "value"))); }
    if ( elem->FirstChildElement( "FPSmax" ) != NULL ) { SetMaximumFPS(ToInt(elem->FirstChildElement( "FPSmax" )->Attribute( "value" ))); }
    if ( elem->FirstChildElement( "FPSmin" ) != NULL ) { SetMinimumFPS(ToInt(elem->FirstChildElement( "FPSmin" )->Attribute( "value" ))); }

    SetVerticalSyncActivatedByDefault( false );
    if ( elem->FirstChildElement( "verticalSync" ) != NULL )
    {
        string result = elem->FirstChildElement( "verticalSync" )->Attribute("value");
        if ( result == "true")
            SetVerticalSyncActivatedByDefault(true);
    }

    #if defined(GD_IDE_ONLY)
    if ( elem->FirstChildElement( "Auteur" ) != NULL ) { SetAuthor( elem->FirstChildElement( "Auteur" )->Attribute( "value" ) ); }
    if ( elem->FirstChildElement( "LatestCompilationDirectory" ) != NULL && elem->FirstChildElement( "LatestCompilationDirectory" )->Attribute( "value" ) != NULL )
        SetLastCompilationDirectory( elem->FirstChildElement( "LatestCompilationDirectory" )->Attribute( "value" ) );

    if ( elem->FirstChildElement( "Extensions" ) != NULL )
    {
        const TiXmlElement * extensionsElem = elem->FirstChildElement( "Extensions" )->FirstChildElement();
        while (extensionsElem)
        {
            if ( extensionsElem->Attribute("name") )
            {
                std::string extensionName = extensionsElem->Attribute("name");
                if ( find(GetUsedPlatformExtensions().begin(), GetUsedPlatformExtensions().end(), extensionName ) == GetUsedPlatformExtensions().end() )
                    GetUsedPlatformExtensions().push_back(extensionName);
            }

            extensionsElem = extensionsElem->NextSiblingElement();
        }
    }

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("winExecutableFilename", winExecutableFilename);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("winExecutableIconFile", winExecutableIconFile);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("linuxExecutableFilename", linuxExecutableFilename);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("macExecutableFilename", macExecutableFilename);
    if ( elem->Attribute( "useExternalSourceFiles" )  != NULL )
    {
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("useExternalSourceFiles", useExternalSourceFiles);
    }
    #endif

    return;
}

#if defined(GD_IDE_ONLY)
void Game::SaveToXml(TiXmlElement * root) const
{
    TiXmlElement * version = new TiXmlElement( "GDVersion" );
    root->LinkEndChild( version );
    version->SetAttribute( "Major", ToString( GDLVersionWrapper::Major() ).c_str() );
    version->SetAttribute( "Minor", ToString( GDLVersionWrapper::Minor() ).c_str() );
    version->SetAttribute( "Build", ToString( GDLVersionWrapper::Build() ).c_str() );
    version->SetAttribute( "Revision", ToString( GDLVersionWrapper::Revision() ).c_str() );

    TiXmlElement * infos = new TiXmlElement( "Info" );
    root->LinkEndChild( infos );

    //Info du jeu
    TiXmlElement * info;
    {
        info = new TiXmlElement( "Nom" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", GetName().c_str() );
        info = new TiXmlElement( "Auteur" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", GetAuthor().c_str() );
        info = new TiXmlElement( "WindowW" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", GetMainWindowDefaultWidth() );
        info = new TiXmlElement( "WindowH" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", GetMainWindowDefaultHeight() );
        info = new TiXmlElement( "Portable" );
        infos->LinkEndChild( info );
        info = new TiXmlElement( "LatestCompilationDirectory" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", GetLastCompilationDirectory().c_str() );
    }
    {
        TiXmlElement * elem = infos;
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("winExecutableFilename", winExecutableFilename);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("winExecutableIconFile", winExecutableIconFile);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("linuxExecutableFilename", linuxExecutableFilename);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("macExecutableFilename", macExecutableFilename);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("useExternalSourceFiles", useExternalSourceFiles);
    }

    TiXmlElement * extensions = new TiXmlElement( "Extensions" );
    infos->LinkEndChild( extensions );
    for (unsigned int i =0;i<GetUsedPlatformExtensions().size();++i)
    {
        TiXmlElement * extension = new TiXmlElement( "Extension" );
        extensions->LinkEndChild( extension );
        extension->SetAttribute("name", GetUsedPlatformExtensions().at(i).c_str());
    }

    info = new TiXmlElement( "FPSmax" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", GetMaximumFPS() );
    info = new TiXmlElement( "FPSmin" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", GetMinimumFPS() );

    info = new TiXmlElement( "verticalSync" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", IsVerticalSynchronizationEnabledByDefault() ? "true" : "false" );

    TiXmlElement * chargement = new TiXmlElement( "Chargement" );
    infos->LinkEndChild( chargement );

    OpenSaveLoadingScreen::SaveToElement(loadingScreen, chargement);

    //Ressources
    TiXmlElement * resources = new TiXmlElement( "Resources" );
    root->LinkEndChild( resources );
    resourcesManager.SaveToXml(resources);

    //Global objects
    TiXmlElement * objects = new TiXmlElement( "Objects" );
    root->LinkEndChild( objects );
    OpenSaveGame::SaveObjects(GetGlobalObjects(), objects);

    //Global object groups
    TiXmlElement * globalObjectGroups = new TiXmlElement( "ObjectGroups" );
    root->LinkEndChild( globalObjectGroups );
    OpenSaveGame::SaveGroupesObjets(GetObjectGroups(), globalObjectGroups);

    //Global variables
    TiXmlElement * variables = new TiXmlElement( "Variables" );
    root->LinkEndChild( variables );
    GetVariables().SaveToXml(variables);

    //Scenes
    TiXmlElement * scenes = new TiXmlElement( "Scenes" );
    root->LinkEndChild( scenes );
    TiXmlElement * scene;

    for ( unsigned int i = 0;i < GetLayoutCount();i++ )
    {
        scene = new TiXmlElement( "Scene" );
        scenes->LinkEndChild( scene );
        GetLayout(i).SaveToXml(scene);
    }

    //External events
    TiXmlElement * externalEvents = new TiXmlElement( "ExternalEvents" );
    root->LinkEndChild( externalEvents );
    OpenSaveGame::SaveExternalEvents(GetExternalEvents(), externalEvents);

    //External layouts
    TiXmlElement * externalLayouts = new TiXmlElement( "ExternalLayouts" );
    root->LinkEndChild( externalLayouts );
    for (unsigned int i = 0;i<GetExternalLayouts().size();++i)
    {
        TiXmlElement * externalLayout = new TiXmlElement( "ExternalLayout" );
        externalLayouts->LinkEndChild( externalLayout );
        GetExternalLayouts()[i]->SaveToXml(externalLayout);
    }

    //External source files
    TiXmlElement * externalSourceFilesElem = new TiXmlElement( "ExternalSourceFiles" );
    root->LinkEndChild( externalSourceFilesElem );
    for (unsigned int i = 0;i<externalSourceFiles.size();++i)
    {
        TiXmlElement * sourceFile = new TiXmlElement( "SourceFile" );
        externalSourceFilesElem->LinkEndChild( sourceFile );
        externalSourceFiles[i]->SaveToXml(sourceFile);
    }
}

void Game::PopulatePropertyGrid(wxPropertyGrid * grid)
{
    gd::Project::PopulatePropertyGrid(grid);

    grid->Append( new wxPropertyCategory(_("Generation")) );
    grid->Append( new wxStringProperty(_("Windows executable name"), wxPG_LABEL, winExecutableFilename) );
    grid->Append( new wxImageFileProperty(_("Windows executable icon"), wxPG_LABEL, winExecutableIconFile) );
    grid->Append( new wxStringProperty(_("Linux executable name"), wxPG_LABEL, linuxExecutableFilename) );
    grid->Append( new wxStringProperty(_("Mac OS executable name"), wxPG_LABEL, macExecutableFilename) );

    grid->Append( new wxPropertyCategory(_("C++ features")) );
    grid->Append( new wxBoolProperty(_("Activate the use of C++ source files"), wxPG_LABEL, useExternalSourceFiles) );

    grid->Append( new wxPropertyCategory(_("Loading screen")) );
    grid->Append( new wxBoolProperty(_("Display the loading screen"), wxPG_LABEL, loadingScreen.afficher) );
    grid->AppendIn( _("Loading screen"), new wxPropertyCategory(_("Setup")) );
    grid->Append( new wxBoolProperty(_("Display window's border"), wxPG_LABEL, loadingScreen.border) );
    grid->Append( new wxUIntProperty(_("Width"), "LoadingScreenWidth", loadingScreen.width) );
    grid->Append( new wxUIntProperty(_("Height"), "LoadingScreenHeight", loadingScreen.height) );
    grid->Append( new wxBoolProperty(_("Display a text"), wxPG_LABEL, loadingScreen.texte) );
    grid->Append( new wxIntProperty(_("X position of the text"), wxPG_LABEL, loadingScreen.texteXPos) );
    grid->Append( new wxIntProperty(_("Y position of the text"), wxPG_LABEL, loadingScreen.texteYPos) );
    grid->Append( new wxStringProperty(_("Text to display"), wxPG_LABEL, loadingScreen.texteChargement) );
    grid->Append( new wxBoolProperty(_("Display an image"), wxPG_LABEL, loadingScreen.image) );
    grid->Append( new wxImageFileProperty(_("Image file"), wxPG_LABEL, loadingScreen.imageFichier) );
    grid->Append( new wxBoolProperty(_("Smooth the image"), wxPG_LABEL, loadingScreen.smooth) );
    grid->Append( new wxStringProperty(_("Preview"), "Preview", _("Click to preview")) );

    grid->SetPropertyCell("Preview", 1, _("Click to preview"), wxNullBitmap, wxSystemSettings::GetColour(wxSYS_COLOUR_HOTLIGHT));
    grid->SetPropertyReadOnly(_("Globals variables"));

    grid->EnableProperty(_("Setup"), grid->GetProperty(_("Display the loading screen"))->GetValue().GetBool());
}

void Game::UpdateFromPropertyGrid(wxPropertyGrid * grid)
{
    gd::Project::UpdateFromPropertyGrid(grid);

    if ( grid->GetProperty(_("Windows executable name")) != NULL)
        winExecutableFilename = gd::ToString(grid->GetProperty(_("Windows executable name"))->GetValueAsString());
    if ( grid->GetProperty(_("Windows executable icon")) != NULL)
        winExecutableIconFile = gd::ToString(grid->GetProperty(_("Windows executable icon"))->GetValueAsString());
    if ( grid->GetProperty(_("Linux executable name")) != NULL)
        linuxExecutableFilename = gd::ToString(grid->GetProperty(_("Linux executable name"))->GetValueAsString());
    if ( grid->GetProperty(_("Mac OS executable name")) != NULL)
        macExecutableFilename = gd::ToString(grid->GetProperty(_("Mac OS executable name"))->GetValueAsString());
    if ( grid->GetProperty(_("Activate the use of C++ source files")) != NULL)
        useExternalSourceFiles =grid->GetProperty(_("Activate the use of C++ source files"))->GetValue().GetBool();
    if ( grid->GetProperty(_("Display the loading screen")) != NULL)
        loadingScreen.afficher = grid->GetProperty(_("Display the loading screen"))->GetValue().GetBool();
    if ( grid->GetProperty(_("Display window's border")) != NULL)
        loadingScreen.border =grid->GetProperty(_("Display window's border"))->GetValue().GetBool();
    if ( grid->GetProperty("LoadingScreenWidth") != NULL)
        loadingScreen.width = grid->GetProperty("LoadingScreenWidth")->GetValue().GetInteger();
    if ( grid->GetProperty("LoadingScreenHeight") != NULL)
        loadingScreen.height = grid->GetProperty("LoadingScreenHeight")->GetValue().GetInteger();
    if ( grid->GetProperty(_("Display a text")) != NULL)
        loadingScreen.texte =grid->GetProperty(_("Display a text"))->GetValue().GetBool();
    if ( grid->GetProperty(_("X position of the text")) != NULL)
        loadingScreen.texteXPos = grid->GetProperty(_("X position of the text"))->GetValue().GetInteger();
    if ( grid->GetProperty(_("Y position of the text")) != NULL)
        loadingScreen.texteYPos = grid->GetProperty(_("Y position of the text"))->GetValue().GetInteger();
    if ( grid->GetProperty(_("Text to display")) != NULL)
        loadingScreen.texteChargement = gd::ToString(grid->GetProperty(_("Text to display"))->GetValueAsString());
    if ( grid->GetProperty(_("Display an image")) != NULL)
        loadingScreen.image =grid->GetProperty(_("Display an image"))->GetValue().GetBool();
    if ( grid->GetProperty(_("Image file")) != NULL)
        loadingScreen.imageFichier =grid->GetProperty(_("Image file"))->GetValueAsString();
    if ( grid->GetProperty(_("Smooth the image")) != NULL)
        loadingScreen.smooth =grid->GetProperty(_("Smooth the image"))->GetValue().GetBool();
}

void Game::OnChangeInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event)
{
    gd::Project::OnChangeInPropertyGrid(grid, event);

    if ( event.GetPropertyName() == _("Display the loading screen") )
        grid->EnableProperty(_("Setup"), grid->GetProperty(_("Display the loading screen"))->GetValue().GetBool());

    UpdateFromPropertyGrid(grid);
}

void Game::OnSelectionInPropertyGrid(wxPropertyGrid * grid, wxPropertyGridEvent & event)
{
    gd::Project::OnSelectionInPropertyGrid(grid, event);

    if ( event.GetPropertyName() == _("Globals variables") )
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
        int texteXPos = grid->GetProperty(_("X position of the text"))->GetValue().GetInteger();
        int texteYPos = grid->GetProperty(_("Y position of the text"))->GetValue().GetInteger();

        // Fenêtre
        unsigned long style = 0;
        if ( grid->GetProperty(_("Display window's border"))->GetValue().GetBool() )
        {
            style |= sf::Style::Titlebar;
            style |= sf::Style::Close;
        }
        sf::RenderWindow App( sf::VideoMode( width, height, 32 ), "Chargement en cours...", style );

        sf::Texture image;
        if ( grid->GetProperty(_("Display an image"))->GetValue().GetBool() )
            image.loadFromFile( gd::ToString(grid->GetProperty(_("Image file"))->GetValueAsString()) );

        image.setSmooth(grid->GetProperty(_("Smooth the image"))->GetValue().GetBool());

        sf::Sprite sprite( image );

        sf::Text loadingText( gd::ToString(grid->GetProperty(_("Text to display"))->GetValueAsString()), *FontManager::GetInstance()->GetFont("") );
        loadingText.setPosition(texteXPos, texteYPos);
        App.draw( loadingText );

        App.clear( sf::Color( 100, 100, 100 ) );
        App.setFramerateLimit( 30 );
        App.display();

        bool Running = true;
        sf::Event Event;
        while ( Running )
        {
            App.clear( sf::Color( 100, 100, 100 ) );

            // Process events
            while ( App.pollEvent( Event ) )
            {
                // Close window : exit
                if ( Event.type == sf::Event::Closed || Event.type == sf::Event::KeyPressed )
                    Running = false;
            }

            if ( grid->GetProperty(_("Display an image"))->GetValue().GetBool() )
                App.draw( sprite );
            if ( grid->GetProperty(_("Display a text"))->GetValue().GetBool() )
                App.draw(loadingText);

            App.display();
        }
    }
}

void Game::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    gd::Project::ExposeResources(worker);

    //Add loading image
    if ( !loadingScreen.imageFichier.empty() )
        worker.ExposeResource(loadingScreen.imageFichier);
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

void Game::InsertNewLayout(const std::string & name, unsigned int position)
{
    boost::shared_ptr<Scene> newScene = boost::shared_ptr<Scene>(new Scene);
    if (position<scenes.size())
        scenes.insert(scenes.begin()+position, newScene);
    else
        scenes.push_back(newScene);

    newScene->SetName(name);
    newScene->UpdateAutomatismsSharedData(*this);
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

        newScene->UpdateAutomatismsSharedData(*this);
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

void Game::InsertNewObject(const std::string & objectType, const std::string & name, unsigned int position)
{
    boost::shared_ptr<Object> newObject = ExtensionsManager::GetInstance()->CreateObject(objectType, name);
    if (position<GetGlobalObjects().size())
        GetGlobalObjects().insert(GetGlobalObjects().begin()+position, newObject);
    else
        GetGlobalObjects().push_back(newObject);
}

void Game::InsertObject(const gd::Object & object, unsigned int position)
{
    try
    {
        const Object & castedObject = dynamic_cast<const Object&>(object);
        boost::shared_ptr<Object> newObject = boost::shared_ptr<Object>(castedObject.Clone());
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

void Game::SwapObjects(unsigned int firstObjectIndex, unsigned int secondObjectIndex)
{
    if ( firstObjectIndex >= GetGlobalObjects().size() || secondObjectIndex >= GetGlobalObjects().size() )
        return;

    boost::shared_ptr<Object> temp = GetGlobalObjects()[firstObjectIndex];
    GetGlobalObjects()[firstObjectIndex] = GetGlobalObjects()[secondObjectIndex];
    GetGlobalObjects()[secondObjectIndex] = temp;
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
    latestCompilationDirectory = game.latestCompilationDirectory;
    extensionsUsed = game.GetUsedPlatformExtensions();
    #endif

    loadingScreen = game.loadingScreen;

    //Resources
    resourcesManager = game.resourcesManager;

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

