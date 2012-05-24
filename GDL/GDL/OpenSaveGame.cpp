/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
    #include <wx/wx.h>
    #define MSG(x) wxLogWarning(x);          // Utiliser WxWidgets pour
    #define MSGERR(x) wxLogError(x.c_str()); // afficher les messages dans l'éditeur
    #include "GDL/IDE/Dialogs/ProjectUpdateDlg.h"
    #include "PlatformDefinition/Platform.h"
    #include "GDCore/PlatformDefinition/ObjectGroup.h"
    #include "GDCore/IDE/ResourcesUnmergingHelper.h"
    #include "GDCore/Events/Event.h"
    #include "GDCore/Events/Instruction.h"
#else
    #include "GDL/Log.h"
    #include <iostream>

    #ifndef _
    #define _(x) x // "Emule" la macro de WxWidgets
    #endif

    #define MSG(x) std::cout << _("Loading: ") << x; //Macro pour rapporter des erreurs
    #define MSGERR(x) std::cout << _("Error during loading: ") << x;

#endif

#include <string>
#include <cctype>
#include <boost/shared_ptr.hpp>

#include "GDL/OpenSaveGame.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/Animation.h"
#include "GDL/Position.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedDatas.h"
#include "GDL/ExtensionBase.h"
#include "GDL/VersionWrapper.h"
#include "GDL/ExtensionsLoader.h"
#include "GDL/Layer.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/EmptyEvent.h"
#include "GDL/ForEachEvent.h"
#include "GDL/WhileEvent.h"
#include "GDL/ExternalEvents.h"
#include "GDL/StandardEvent.h"
#include "GDL/RepeatEvent.h"
#include "GDL/XmlMacros.h"
#include "GDL/SourceFile.h"

using namespace std;

#if defined(GD_IDE_ONLY)
bool OpenSaveGame::updateEventsFromGD1x = false;
#endif

OpenSaveGame::OpenSaveGame( Game & game_ ) :
game(game_)
{
}

OpenSaveGame::~OpenSaveGame()
{
    //dtor
}

////////////////////////////////////////////////////////////
/// Chargement depuis un fichier
////////////////////////////////////////////////////////////
bool OpenSaveGame::OpenFromFile(string file)
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(file.c_str()) )
    {
#if defined(GD_IDE_ONLY)
        wxString ErrorDescription = doc.ErrorDesc();
        wxString Error = _( "Erreur lors du chargement : " ) + ErrorDescription + _("\nVérifiez que le fichier existe et que vous possédez les droits suffisants pour y accéder.");
#else
        string ErrorDescription = doc.ErrorDesc();
        string Error =  "Erreur lors du chargement : " + ErrorDescription + _("\nVérifiez que le fichier existe et que vous possédez les droits suffisants pour y accéder.");
#endif
        MSGERR( Error );
        return false;
    }

    OpenDocument(doc);
    #if defined(GD_IDE_ONLY)
    game.gameFile = file;
    #endif

    //Vérification de la portabilité du jeu
    if ( game.portable )
        RecreatePaths(file);
    game.portable = false;

    #if defined(GD_IDE_ONLY)
    if (!updateText.empty())
    {
        ProjectUpdateDlg updateDialog(NULL, updateText);
        updateDialog.ShowModal();
    }
    #endif

    return true;
}

////////////////////////////////////////////////////////////
/// Chargement depuis une chaine
////////////////////////////////////////////////////////////
void OpenSaveGame::OpenFromString(string text)
{
    TiXmlDocument doc;
    doc.Parse(text.c_str());

    OpenDocument(doc);
}

////////////////////////////////////////////////////////////
/// Chargement depuis un TiXmlDocument
////////////////////////////////////////////////////////////
void OpenSaveGame::OpenDocument(TiXmlDocument & doc)
{
    bool notBackwardCompatible = false;

    TiXmlHandle hdl( &doc );
    TiXmlElement *elem = hdl.FirstChildElement().FirstChildElement().Element();

    //Comparaison de versions
    int major = 0;
    int minor = 0;
    int build = 0;
    int revision = 0;
    elem->QueryIntAttribute( "Major", &major );
    elem->QueryIntAttribute( "Minor", &minor );
    elem->QueryIntAttribute( "Build", &build );
    elem->QueryIntAttribute( "Revision", &revision );
    if ( major > GDLVersionWrapper::Major() )
    {
        MSG( _( "La version de l'éditeur utilisé pour créer ce jeu semble être une nouvelle version.\nLe jeu peut donc ne pas s'ouvrir, ou des données peuvent manquer.\nVous devriez vérifier si une nouvelle version de Game Develop est disponible." ) );
    }
    else
    {
        if ( major == GDLVersionWrapper::Major() && (build > GDLVersionWrapper::Build() || minor > GDLVersionWrapper::Minor() || revision > GDLVersionWrapper::Revision()) )
        {
            MSG( _( "La version de l'éditeur utilisé pour créer ce jeu semble être supérieure.\nLe jeu peut donc ne pas s'ouvrir, ou des données peuvent manquer.\nVous devriez vérifier si une nouvelle version de Game Develop est disponible." ) );
        }
    }


    //Compatibility code
    #if defined(GD_IDE_ONLY)
    if ( major <= 1 )
    {
        updateEventsFromGD1x = true;
        game.GetUsedPlatformExtensions().push_back("BuiltinMathematicalTools");

        if ( minor < 4 || build < 9587 )
        {
            wxLogWarning(_("Le jeu ouvert a été enregistré avec une ancienne version de Game Develop.\nIl se peut que le jeu ne soit pas correctement ouvert.\nVeuillez ouvrir le jeu et l'enregistrer avec la version 1.5.10151 avant de le réouvrir avec cette version de Game Develop."));
        }

    }
    else
        updateEventsFromGD1x = false;

    //End of Compatibility code
    #endif

    elem = hdl.FirstChildElement().FirstChildElement( "Info" ).Element();
    if ( elem )
        OpenGameInformations(elem);

    if (  elem->FirstChildElement( "Chargement" ) != NULL )
    {
        OpenSaveLoadingScreen openLoadingScreen(game.loadingScreen);
        openLoadingScreen.OpenFromElement(elem->FirstChildElement( "Chargement" ));
    }

    //Compatibility code
    #if defined(GD_IDE_ONLY)
    if ( major < 2 || (major == 2 && minor == 0 && build <= 10498) )
    {
        OpenImagesFromGD2010498(hdl.FirstChildElement().FirstChildElement( "Images" ).FirstChildElement().Element(),
                   hdl.FirstChildElement().FirstChildElement( "DossierImages" ).FirstChildElement().Element());
    }
    #endif
    //End of Compatibility code

    //Compatibility code
    #if defined(GD_IDE_ONLY)
    if ( major < 2 || (major == 2 && minor <= 0) )
    {
        updateText += _("L'action \"Créer un objet de partir son nom\" nécessite dorénavant que vous indiquiez un groupe d'objet parmi lequel les objets sont susceptibles d'être créés.\nPar exemple, si les objets que vous crééez à partir de cette action peuvent prendre comme nom Objet1, Objet2 ou Objet3, créez un groupe avec ces 3 objets et passez le en paramètre à l'action.\n\n");
        updateText += _("Les fonctions ont subi un changement au niveau de leur paramétrage. Vous devenez dorénavant indiquer les objets susceptibles passés en paramètre à la fonction, si vous en utilisez. De même que ci dessus, créez un groupe d'objet qui contient les objets devant être passés en argument à la fonction si vous en avez besoin.\n\n");
        updateText += _("Enfin, si vous utilisez l'extension Association d'objets, les actions/conditions nécessitent dorénavant de toujours indiquer le nom des objets associés à prendre en compte : Vérifiez que vos évènements liés à cette extension sont toujours valides.\n\n");
        updateText += _("Merci de votre compréhension.\n");
    }
    #endif
    //End of Compatibility code


    game.resourceManager.LoadFromXml(hdl.FirstChildElement().FirstChildElement( "Resources" ).Element());

    //Global objects
    elem = hdl.FirstChildElement().FirstChildElement( "Objects" ).Element();
    if ( elem )
        OpenObjects(game.GetGlobalObjects(), elem);

    #if defined(GD_IDE_ONLY)
    //Global object groups
    elem = hdl.FirstChildElement().FirstChildElement( "ObjectGroups" ).Element();
    if ( elem )
        OpenGroupesObjets(game.GetObjectGroups(), elem);
    #endif

    //Global variables
    elem = hdl.FirstChildElement().FirstChildElement( "Variables" ).Element();
    if ( elem ) game.GetVariables().LoadFromXml(elem);

    //Scenes
    elem = hdl.FirstChildElement().FirstChildElement( "Scenes" ).Element();
    if ( elem == NULL ) { MSG( "Les informations concernant les scenes manquent" ); }

    elem = hdl.FirstChildElement().FirstChildElement( "Scenes" ).FirstChildElement().Element();
    while ( elem )
    {
        std::string layoutName = elem->Attribute( "nom" ) != NULL ? elem->Attribute( "nom" ) : "";

        //Add a new layout
        game.GetLayouts().push_back(boost::shared_ptr<Scene>(new Scene));
        game.GetLayouts().back()->SetName(layoutName);
        game.GetLayouts().back()->LoadFromXml(elem);

        elem = elem->NextSiblingElement();
    }

    #if defined(GD_IDE_ONLY)
    //External events
    elem = hdl.FirstChildElement().FirstChildElement( "ExternalEvents" ).Element();
    if ( elem )
        OpenExternalEvents(game.GetExternalEvents(), elem);

    elem = hdl.FirstChildElement().FirstChildElement( "ExternalSourceFiles" ).Element();
    if ( elem )
    {
        TiXmlElement * sourceFileElem = elem->FirstChildElement( "SourceFile" );
        while (sourceFileElem)
        {
            boost::shared_ptr<GDpriv::SourceFile> newSourceFile(new GDpriv::SourceFile);
            newSourceFile->LoadFromXml(sourceFileElem);
            game.externalSourceFiles.push_back(newSourceFile);

            sourceFileElem = sourceFileElem->NextSiblingElement();
        }
    }
    #endif

    if ( notBackwardCompatible )
    {
        MSG( _("Attention, si vous enregistrez votre jeu avec cette version de Game Develop, vous ne pourrez plus le réouvrir avec une version précédente.") );
    }

    return;
}

void OpenSaveGame::OpenGameInformations(const TiXmlElement * elem)
{
    if ( elem->FirstChildElement( "Nom" ) != NULL ) { game.SetName( elem->FirstChildElement( "Nom" )->Attribute( "value" ) ); }
    else { MSG( "Les informations concernant le nom manquent." ); }
    if ( elem->FirstChildElement( "WindowW" ) != NULL ) { game.SetMainWindowDefaultWidth(ToInt(elem->FirstChildElement( "WindowW" )->Attribute( "value"))); }
    else { MSG( "Les informations concernant la largeur manquent." ); }
    if ( elem->FirstChildElement( "WindowH" ) != NULL ) { game.SetMainWindowDefaultHeight(ToInt(elem->FirstChildElement( "WindowH" )->Attribute( "value"))); }
    else { MSG( "Les informations concernant la hauteur manquent." ); }

    if ( elem->FirstChildElement( "FPSmax" ) != NULL ) { game.SetMaximumFPS(ToInt(elem->FirstChildElement( "FPSmax" )->Attribute( "value" ))); }
    if ( elem->FirstChildElement( "FPSmin" ) != NULL ) { game.SetMinimumFPS(ToInt(elem->FirstChildElement( "FPSmin" )->Attribute( "value" ))); }

    game.SetVerticalSyncActivatedByDefault( false );
    if ( elem->FirstChildElement( "verticalSync" ) != NULL )
    {
        string result = elem->FirstChildElement( "verticalSync" )->Attribute("value");
        if ( result == "true")
            game.SetVerticalSyncActivatedByDefault(true);
    }

    game.portable = false;
    if ( elem->FirstChildElement( "Portable" ) != NULL )
    {
        if ( strcmp(elem->FirstChildElement( "Portable" )->Attribute( "value" ), "true") == 0 )
        {
            game.portable = true;
        }
    } else { MSG(_("Aucune information sur la portabilité du jeu")); }

    #if defined(GD_IDE_ONLY)
    if ( elem->FirstChildElement( "Auteur" ) != NULL ) { game.SetAuthor( elem->FirstChildElement( "Auteur" )->Attribute( "value" ) ); }
    else { MSG( "Les informations concernant l'auteur manquent." ); }

    if ( elem->FirstChildElement( "Extensions" ) != NULL )
    {
        const TiXmlElement * extensionsElem = elem->FirstChildElement( "Extensions" )->FirstChildElement();
        while (extensionsElem)
        {
            if ( extensionsElem->Attribute("name") )
            {
                std::string extensionName = extensionsElem->Attribute("name");
                if ( find(game.GetUsedPlatformExtensions().begin(), game.GetUsedPlatformExtensions().end(), extensionName ) == game.GetUsedPlatformExtensions().end() )
                    game.GetUsedPlatformExtensions().push_back(extensionName);
            }

            extensionsElem = extensionsElem->NextSiblingElement();
        }
    }

    //Compatibility with Game Develop 1.3 and older
    {
        std::vector<string>::iterator oldName = find(game.GetUsedPlatformExtensions().begin(), game.GetUsedPlatformExtensions().end(), "BuiltinInterface");
        if ( oldName != game.GetUsedPlatformExtensions().end() ) *oldName = "CommonDialogs";
    }

    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("winExecutableFilename", game.winExecutableFilename);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("winExecutableIconFile", game.winExecutableIconFile);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("linuxExecutableFilename", game.linuxExecutableFilename);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("macExecutableFilename", game.macExecutableFilename);
    if ( elem->Attribute( "useExternalSourceFiles" )  != NULL )
    {
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("useExternalSourceFiles", game.useExternalSourceFiles);
    }
    #endif

    return;
}

void OpenSaveGame::OpenObjects(vector < boost::shared_ptr<Object> > & objects, const TiXmlElement * elem)
{
    const TiXmlElement * elemScene = elem->FirstChildElement("Objet");

    ExtensionsManager * extensionsManager = ExtensionsManager::GetInstance();

    //Passage en revue des objets
    while ( elemScene )
    {
        //Nom
        string name;
        if ( elemScene->Attribute( "nom" ) != NULL ) { name = elemScene->Attribute( "nom" ); }
        else { MSG( "Les informations concernant le nom de de l'objet manquent." ); }

        string type = "Sprite"; //Compatibility with Game Develop 1.2 and inferior
        if ( elemScene->Attribute( "type" ) != NULL ) { type = elemScene->Attribute( "type" ); }

        //Objet vide
        boost::shared_ptr<Object> newObject = extensionsManager->CreateObject(type, name);

        if ( newObject != boost::shared_ptr<Object>() )
        {
            if ( elemScene->FirstChildElement( "Variables" ) != NULL ) { newObject->GetVariables().LoadFromXml(elemScene->FirstChildElement( "Variables" )); }

            //Spécifique à l'objet
            newObject->LoadFromXml(elemScene);

            if ( elemScene->FirstChildElement( "Automatism" ) != NULL )
            {
                const TiXmlElement * elemAutomatism = elemScene->FirstChildElement( "Automatism" );
                while ( elemAutomatism )
                {
                    Automatism* newAutomatism = extensionsManager->CreateAutomatism(elemAutomatism->Attribute("Type") != NULL ? elemAutomatism->Attribute("Type") : "");
                    if ( newAutomatism != NULL )
                    {
                        newAutomatism->SetName(elemAutomatism->Attribute("Name") != NULL ? elemAutomatism->Attribute("Name") : "");
                        newAutomatism->LoadFromXml(elemAutomatism);

                        newObject->AddAutomatism(newAutomatism);
                    }
                    else
                        cout << "Unknown automatism" << elemAutomatism->Attribute("Type") << endl;

                    elemAutomatism = elemAutomatism->NextSiblingElement("Automatism");
                }
            }

            //Ajout de l'objet
            objects.push_back( newObject );
        }

        elemScene = elemScene->NextSiblingElement();
    }
}

#if defined(GD_IDE_ONLY)
void OpenSaveGame::OpenGroupesObjets(vector < gd::ObjectGroup > & list, const TiXmlElement * elem)
{
    const TiXmlElement * elemScene = elem->FirstChildElement("Groupe");

    //Passage en revue des positions initiales
    while ( elemScene )
    {
        gd::ObjectGroup objectGroup;

        if ( elemScene->Attribute( "nom" ) != NULL ) { objectGroup.SetName(elemScene->Attribute( "nom" ));}
        else { MSG( "Les informations concernant le nom d'un groupe d'objet manquent." ); }

        const TiXmlElement * objet = elemScene->FirstChildElement( "Objet" );
        while ( objet )
        {
            string objetName;
            if ( objet->Attribute( "nom" ) != NULL ) { objetName = objet->Attribute( "nom");}
            else { MSG( "Les informations concernant le nom d'un objet d'un groupe d'objet manquent." ); }

            objectGroup.AddObject(objetName);
            objet = objet->NextSiblingElement();
        }

        list.push_back( objectGroup );

        elemScene = elemScene->NextSiblingElement();
    }
}
#endif

#if defined(GD_IDE_ONLY)
void OpenSaveGame::OpenEvents(vector < gd::BaseEventSPtr > & list, const TiXmlElement * elem)
{
    const TiXmlElement * elemScene = elem->FirstChildElement();
    ExtensionsManager * extensionsManager = ExtensionsManager::GetInstance();

    //Passage en revue des évènements
    while ( elemScene )
    {
        string type;

        if ( elemScene->FirstChildElement( "Type" ) != NULL && elemScene->FirstChildElement( "Type" )->Attribute( "value" ) != NULL ) { type = elemScene->FirstChildElement( "Type" )->Attribute( "value" );}
        else { MSG( "Les informations concernant le type d'un évènement manquent." ); }

        gd::BaseEventSPtr event = extensionsManager->CreateEvent(type);
        if ( event != boost::shared_ptr<gd::BaseEvent>())
        {
            event->LoadFromXml(elemScene);
        }
        else
        {
            cout << "Unknown event of type " << type << endl;
            event = boost::shared_ptr<gd::BaseEvent>(new EmptyEvent);
        }

        if ( elemScene->Attribute( "disabled" ) != NULL ) { if ( string(elemScene->Attribute( "disabled" )) == "true" ) event->SetDisabled(); }
        if ( elemScene->Attribute( "folded" ) != NULL ) { event->folded = ( string(elemScene->Attribute( "folded" )) == "true" ); }

        list.push_back( event );

        elemScene = elemScene->NextSiblingElement();
    }

}

std::string AddBackSlashBeforeQuotes(std::string text)
{
    size_t foundPos=text.find("\"");
    while(foundPos != string::npos)
    {
        if(foundPos != string::npos) text.replace(foundPos,1,"\\\"");
        foundPos=text.find("\"", foundPos+2);
    }

    return text;
}

void OpenSaveGame::OpenConditions(vector < gd::Instruction > & conditions, const TiXmlElement * elem)
{
    if (elem == NULL) return;
    const TiXmlElement * elemConditions = elem->FirstChildElement();

    //Passage en revue des conditions
    while ( elemConditions )
    {
        gd::Instruction instruction;

        //Read type and infos
        const TiXmlElement *elemPara = elemConditions->FirstChildElement( "Type" );
        if ( elemPara != NULL )
        {
            instruction.SetType( elemPara->Attribute( "value" ) != NULL ? elemPara->Attribute( "value" ) : "");
            instruction.SetInverted( (elemPara->Attribute( "Contraire" ) != NULL) && (string(elemPara->Attribute( "Contraire" )) == "true") );
        }

        //Read parameters
        vector < gd::Expression > parameters;
        elemPara = elemConditions->FirstChildElement("Parametre");
        while ( elemPara )
        {
            if ( elemPara->Attribute( "value" ) != NULL ) parameters.push_back( gd::Expression(elemPara->Attribute( "value" )) );
            elemPara = elemPara->NextSiblingElement("Parametre");
        }
        instruction.SetParameters( parameters );

        //Read sub conditions
        if ( elemConditions->FirstChildElement( "SubConditions" ) != NULL )
            OpenConditions(instruction.GetSubInstructions(), elemConditions->FirstChildElement( "SubConditions" ));

        conditions.push_back( instruction );

        elemConditions = elemConditions->NextSiblingElement();
    }
}

void OpenSaveGame::OpenActions(vector < gd::Instruction > & actions, const TiXmlElement * elem)
{
    if (elem == NULL) return;
    const TiXmlElement * elemActions = elem->FirstChildElement();

    //Passage en revue des actions
    while ( elemActions )
    {
        gd::Instruction instruction;

        //Read type and info
        const TiXmlElement *elemPara = elemActions->FirstChildElement( "Type" );
        if ( elemPara != NULL )
        {
            if (elemPara->Attribute( "value" ) != NULL) instruction.SetType( elemPara->Attribute( "value" ));
        }

        //Read parameters
        vector < gd::Expression > parameters;
        elemPara = elemActions->FirstChildElement("Parametre");
        while ( elemPara )
        {
            if (elemPara->Attribute( "value" ) != NULL) parameters.push_back( gd::Expression(elemPara->Attribute( "value" )) );
            elemPara = elemPara->NextSiblingElement("Parametre");
        }
        instruction.SetParameters(parameters);

        //Read sub actions
        if ( elemActions->FirstChildElement( "SubActions" ) != NULL )
            OpenActions(instruction.GetSubInstructions(), elemActions->FirstChildElement( "SubActions" ));

        actions.push_back(instruction);
        elemActions = elemActions->NextSiblingElement();
    }
}
#endif

void OpenSaveGame::OpenLayers(vector < Layer > & list, const TiXmlElement * elem)
{
    list.clear();
    const TiXmlElement * elemScene = elem->FirstChildElement();

    //Passage en revue des évènements
    while ( elemScene )
    {
        Layer layer;

        layer.SetName("unnamed");
        if ( elemScene->Attribute( "Name" ) != NULL ) { layer.SetName(elemScene->Attribute( "Name" ));}
        else { MSG( "Les informations concernant le nom d'un calque manquent." ); }

        if ( elemScene->Attribute( "Visibility" ) != NULL )
        {
            string visibility = elemScene->Attribute( "Visibility" );
            if ( visibility == "false" )
                layer.SetVisibility( false );

        }
        else { MSG( "Les informations concernant la visibilité manquent." ); }

        const TiXmlElement * elemCamera = elemScene->FirstChildElement("Camera");

        //Compatibility with Game Develop 1.2.8699 and inferior
        if ( !elemCamera ) layer.SetCamerasNumber(1);

        while (elemCamera)
        {
            layer.SetCamerasNumber(layer.GetCamerasNumber()+1);

            string defaultSize = elemCamera->Attribute("DefaultSize");
            layer.GetCamera(layer.GetCamerasNumber()-1).defaultSize = true;
            if ( defaultSize == "false") layer.GetCamera(layer.GetCamerasNumber()-1).defaultSize = false;

            elemCamera->QueryFloatAttribute("Width", &layer.GetCamera(layer.GetCamerasNumber()-1).size.x);
            elemCamera->QueryFloatAttribute("Height", &layer.GetCamera(layer.GetCamerasNumber()-1).size.y);

            string defaultViewport = elemCamera->Attribute("DefaultViewport");
            layer.GetCamera(layer.GetCamerasNumber()-1).defaultViewport = true;
            if ( defaultViewport == "false") layer.GetCamera(layer.GetCamerasNumber()-1).defaultViewport = false;

            elemCamera->QueryFloatAttribute("ViewportLeft", &layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Left);
            elemCamera->QueryFloatAttribute("ViewportTop", &layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Top);

            float value;
            elemCamera->QueryFloatAttribute("ViewportRight", &value); //sf::Rect used Right and Bottom instead of Width and Height before.
            layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Width = value - layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Left;
            elemCamera->QueryFloatAttribute("ViewportBottom", &value);
            layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Height = value - layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Top;

            elemCamera = elemCamera->NextSiblingElement();
        }

        list.push_back( layer );
        elemScene = elemScene->NextSiblingElement();
    }
}


#if defined(GD_IDE_ONLY)
void OpenSaveGame::OpenExternalEvents( vector < boost::shared_ptr<ExternalEvents> > & list, const TiXmlElement * elem )
{
    list.clear();
    const TiXmlElement * elemScene = elem->FirstChildElement();

    while ( elemScene )
    {
        boost::shared_ptr<ExternalEvents> externalEvents = boost::shared_ptr<ExternalEvents>(new ExternalEvents);

        string name = elemScene->Attribute( "Name" ) != NULL ? elemScene->Attribute( "Name" ) : "";
        externalEvents->SetName(name);

        if ( elemScene->FirstChildElement("Events") != NULL )
            OpenEvents(externalEvents->GetEvents(), elemScene->FirstChildElement("Events"));
        if ( updateEventsFromGD1x ) AdaptEventsFromGD1x(externalEvents->GetEvents());

        list.push_back(externalEvents);
        elemScene = elemScene->NextSiblingElement();
    }
}
#endif


#if defined(GD_IDE_ONLY)
////////////////////////////////////////////////////////////
/// Sauvegarde le jeu dans le fichier indiqué
////////////////////////////////////////////////////////////
bool OpenSaveGame::SaveToFile(string file)
{

    TiXmlDocument doc;
    TiXmlDeclaration* decl = new TiXmlDeclaration( "1.0", "ISO-8859-1", "" );
    doc.LinkEndChild( decl );

    TiXmlElement * root = new TiXmlElement( "Game" );
    doc.LinkEndChild( root );

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
        info->SetAttribute( "value", game.GetName().c_str() );
        info = new TiXmlElement( "Auteur" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", game.GetAuthor().c_str() );
        info = new TiXmlElement( "WindowW" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", game.GetMainWindowDefaultWidth() );
        info = new TiXmlElement( "WindowH" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", game.GetMainWindowDefaultHeight() );
        info = new TiXmlElement( "Portable" );
        infos->LinkEndChild( info );
        if ( game.portable )
            info->SetAttribute( "value", "true" );
        else
            info->SetAttribute( "value", "false" );
    }
    {
        TiXmlElement * elem = infos;
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("winExecutableFilename", game.winExecutableFilename);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("winExecutableIconFile", game.winExecutableIconFile);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("linuxExecutableFilename", game.linuxExecutableFilename);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("macExecutableFilename", game.macExecutableFilename);
        GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_BOOL("useExternalSourceFiles", game.useExternalSourceFiles);
    }

    TiXmlElement * extensions = new TiXmlElement( "Extensions" );
    infos->LinkEndChild( extensions );
    for (unsigned int i =0;i<game.GetUsedPlatformExtensions().size();++i)
    {
        TiXmlElement * extension = new TiXmlElement( "Extension" );
        extensions->LinkEndChild( extension );
        extension->SetAttribute("name", game.GetUsedPlatformExtensions().at(i).c_str());
    }

    info = new TiXmlElement( "FPSmax" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", game.GetMaximumFPS() );
    info = new TiXmlElement( "FPSmin" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", game.GetMinimumFPS() );

    info = new TiXmlElement( "verticalSync" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", game.IsVerticalSynchronizationEnabledByDefault() ? "true" : "false" );

    TiXmlElement * chargement = new TiXmlElement( "Chargement" );
    infos->LinkEndChild( chargement );

    OpenSaveLoadingScreen saveLoadingScreen(game.loadingScreen);
    saveLoadingScreen.SaveToElement(chargement);

    //Ressources
    TiXmlElement * resources = new TiXmlElement( "Resources" );
    root->LinkEndChild( resources );
    game.resourceManager.SaveToXml(resources);

    //Global objects
    TiXmlElement * objects = new TiXmlElement( "Objects" );
    root->LinkEndChild( objects );
    SaveObjects(game.GetGlobalObjects(), objects);

    #if defined(GD_IDE_ONLY)
    //Global object groups
    TiXmlElement * globalObjectGroups = new TiXmlElement( "ObjectGroups" );
    root->LinkEndChild( globalObjectGroups );
    SaveGroupesObjets(game.GetObjectGroups(), globalObjectGroups);
    #endif

    //Global variables
    TiXmlElement * variables = new TiXmlElement( "Variables" );
    root->LinkEndChild( variables );
    game.GetVariables().SaveToXml(variables);

    //Scenes
    TiXmlElement * scenes = new TiXmlElement( "Scenes" );
    root->LinkEndChild( scenes );
    TiXmlElement * scene;

    for ( unsigned int i = 0;i < game.GetLayoutCount();i++ )
    {
        scene = new TiXmlElement( "Scene" );
        scenes->LinkEndChild( scene );
        scene->SetAttribute( "nom", game.GetLayout(i).GetName().c_str() );
        scene->SetDoubleAttribute( "r", game.GetLayout(i).GetBackgroundColorRed() );
        scene->SetDoubleAttribute( "v", game.GetLayout(i).GetBackgroundColorGreen() );
        scene->SetDoubleAttribute( "b", game.GetLayout(i).GetBackgroundColorBlue() );
        scene->SetAttribute( "titre", game.GetLayout(i).GetWindowDefaultTitle().c_str() );
        scene->SetDoubleAttribute( "oglFOV", game.GetLayouts()[i]->oglFOV );
        scene->SetDoubleAttribute( "oglZNear", game.GetLayouts()[i]->oglZNear );
        scene->SetDoubleAttribute( "oglZFar", game.GetLayouts()[i]->oglZFar );
        if ( game.GetLayouts()[i]->standardSortMethod ) scene->SetAttribute( "standardSortMethod", "true" ); else scene->SetAttribute( "standardSortMethod", "false" );
        if ( game.GetLayouts()[i]->stopSoundsOnStartup ) scene->SetAttribute( "stopSoundsOnStartup", "true" ); else scene->SetAttribute( "stopSoundsOnStartup", "false" );
        #if defined(GD_IDE_ONLY)
        scene->SetDoubleAttribute( "gridWidth", game.GetLayouts()[i]->gridWidth );
        if ( game.GetLayouts()[i]->grid ) scene->SetAttribute( "grid", "true" ); else scene->SetAttribute( "grid", "false" );
        if ( game.GetLayouts()[i]->snap ) scene->SetAttribute( "snap", "true" ); else scene->SetAttribute( "snap", "false" );
        scene->SetDoubleAttribute( "gridWidth", game.GetLayouts()[i]->gridWidth );
        scene->SetDoubleAttribute( "gridHeight", game.GetLayouts()[i]->gridHeight );
        scene->SetDoubleAttribute( "gridR", game.GetLayouts()[i]->gridR );
        scene->SetDoubleAttribute( "gridG", game.GetLayouts()[i]->gridG );
        scene->SetDoubleAttribute( "gridB", game.GetLayouts()[i]->gridB );
        if ( game.GetLayouts()[i]->windowMask ) scene->SetAttribute( "windowMask", "true" ); else scene->SetAttribute( "windowMask", "false" );
        #endif

        TiXmlElement * grpsobjets = new TiXmlElement( "GroupesObjets" );
        scene->LinkEndChild( grpsobjets );
        SaveGroupesObjets(game.GetLayouts()[i]->GetObjectGroups(), grpsobjets);

        TiXmlElement * objets = new TiXmlElement( "Objets" );
        scene->LinkEndChild( objets );
        SaveObjects(game.GetLayouts()[i]->GetInitialObjects(), objets);

        TiXmlElement * layers = new TiXmlElement( "Layers" );
        scene->LinkEndChild( layers );
        SaveLayers(game.GetLayouts()[i]->initialLayers, layers);

        TiXmlElement * variables = new TiXmlElement( "Variables" );
        scene->LinkEndChild( variables );
        game.GetLayout(i).GetVariables().SaveToXml(variables);

        TiXmlElement * autosSharedDatas = new TiXmlElement( "AutomatismsSharedDatas" );
        scene->LinkEndChild( autosSharedDatas );
        for (std::map<std::string, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = game.GetLayouts()[i]->automatismsInitialSharedDatas.begin();
             it != game.GetLayouts()[i]->automatismsInitialSharedDatas.end();++it)
        {
            TiXmlElement * autoSharedDatas = new TiXmlElement( "AutomatismSharedDatas" );
            autosSharedDatas->LinkEndChild( autoSharedDatas );

            autoSharedDatas->SetAttribute("Type", it->second->GetTypeName().c_str());
            autoSharedDatas->SetAttribute("Name", it->second->GetName().c_str());
            it->second->SaveToXml(autoSharedDatas);
        }

        TiXmlElement * dependenciesElem = new TiXmlElement( "Dependencies" );
        scene->LinkEndChild( dependenciesElem );
        for ( unsigned int j = 0;j < game.GetLayouts()[i]->externalSourcesDependList.size();++j)
        {
            TiXmlElement * dependencyElem = new TiXmlElement( "Dependency" );
            dependenciesElem->LinkEndChild( dependencyElem );

            dependencyElem->SetAttribute("sourceFile", game.GetLayouts()[i]->externalSourcesDependList[j].c_str());
        }

        {
            TiXmlElement * positions = new TiXmlElement( "Positions" );
            scene->LinkEndChild( positions );
            game.GetLayout(i).GetInitialInstances().SaveToXml(positions);
        }

        //Evènements
        if ( !game.GetLayout(i).GetEvents().empty() )
        {
            TiXmlElement * events = new TiXmlElement( "Events" );
            scene->LinkEndChild( events );

            SaveEvents(game.GetLayout(i).GetEvents(), events);
        }

    }

    //External events
    TiXmlElement * externalEvents = new TiXmlElement( "ExternalEvents" );
    root->LinkEndChild( externalEvents );
    SaveExternalEvents(game.GetExternalEvents(), externalEvents);

    //External events
    TiXmlElement * externalSourceFiles = new TiXmlElement( "ExternalSourceFiles" );
    root->LinkEndChild( externalSourceFiles );
    for (unsigned int i = 0;i<game.externalSourceFiles.size();++i)
    {
        TiXmlElement * sourceFile = new TiXmlElement( "SourceFile" );
        externalSourceFiles->LinkEndChild( sourceFile );
        game.externalSourceFiles[i]->SaveToXml(sourceFile);
    }

    //Sauvegarde le tout
    if ( !doc.SaveFile( file.c_str() ) )
    {
        MSG( _( "Impossible d'enregistrer le fichier. Vérifiez que le disque comporte assez d'espace disque, ou qu'il n'est pas protégé en écriture." ) );
        return false;
    }

    return true;
}


void OpenSaveGame::SaveObjects(const vector < boost::shared_ptr<Object> > & list, TiXmlElement * objects )
{
    //Objets
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        TiXmlElement * objet = new TiXmlElement( "Objet" );
        objects->LinkEndChild( objet );

        objet->SetAttribute( "nom", list.at( j )->GetName().c_str() );
        objet->SetAttribute( "type", list.at( j )->GetType().c_str() );

        TiXmlElement * variables = new TiXmlElement( "Variables" );
        objet->LinkEndChild( variables );
        list[j]->GetVariables().SaveToXml(variables);

        vector < std::string > allAutomatisms = list[j]->GetAllAutomatismNames();
        for (unsigned int i = 0;i<allAutomatisms.size();++i)
        {
            TiXmlElement * automatism = new TiXmlElement( "Automatism" );
            objet->LinkEndChild( automatism );
            automatism->SetAttribute( "Type", list[j]->GetAutomatism(allAutomatisms[i]).GetTypeName().c_str() );
            automatism->SetAttribute( "Name", list[j]->GetAutomatism(allAutomatisms[i]).GetName().c_str() );

            list[j]->GetAutomatismRawPointer(allAutomatisms[i])->SaveToXml(automatism);
        }

        list[j]->SaveToXml(objet);
    }
}

void OpenSaveGame::SaveGroupesObjets(const vector < gd::ObjectGroup > & list, TiXmlElement * grpsobjets)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        TiXmlElement * grp;

        grp = new TiXmlElement( "Groupe" );
        grpsobjets->LinkEndChild( grp );
        grp->SetAttribute( "nom", list.at( j ).GetName().c_str() );

        vector < string > allObjects = list.at(j).GetAllObjectsNames();
        for ( unsigned int k = 0;k < allObjects.size();k++ )
        {
            TiXmlElement * objet;

            objet = new TiXmlElement( "Objet" );
            grp->LinkEndChild( objet );
            objet->SetAttribute( "nom", allObjects.at(k).c_str() );
        }
    }
}

void OpenSaveGame::SaveEvents(const vector < gd::BaseEventSPtr > & list, TiXmlElement * events)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        //Pour chaque évènements
        TiXmlElement * event;

        event = new TiXmlElement( "Event" );
        event->SetAttribute( "disabled", list[j]->IsDisabled() ? "true" : "false" );
        event->SetAttribute( "folded", list[j]->folded ? "true" : "false" );
        events->LinkEndChild( event );

        TiXmlElement * type = new TiXmlElement( "Type" );
        event->LinkEndChild( type );
        type->SetAttribute( "value", list[j]->GetType().c_str() );

        list[j]->SaveToXml(event);
    }
}

void OpenSaveGame::SaveActions(const vector < gd::Instruction > & list, TiXmlElement * actions)
{
    for ( unsigned int k = 0;k < list.size();k++ )
    {
        //Pour chaque condition
        TiXmlElement * action;

        action = new TiXmlElement( "Action" );
        actions->LinkEndChild( action );

        //Le type
        TiXmlElement * typeAction;
        typeAction = new TiXmlElement( "Type" );
        action->LinkEndChild( typeAction );

        typeAction->SetAttribute( "value", list[k].GetType().c_str() );


        //Les autres paramètres
        for ( unsigned int l = 0;l < list[k].GetParameters().size();l++ )
        {
            TiXmlElement * Parametre = new TiXmlElement( "Parametre" );
            action->LinkEndChild( Parametre );
            Parametre->SetAttribute( "value", list[k].GetParameter( l ).GetPlainString().c_str() );
        }

        //Sub instructions
        if ( !list[k].GetSubInstructions().empty() )
        {
            TiXmlElement * subActions = new TiXmlElement( "SubActions" );
            action->LinkEndChild(subActions);
            SaveActions(list[k].GetSubInstructions() , subActions);
        }
    }
}

void OpenSaveGame::SaveConditions(const vector < gd::Instruction > & list, TiXmlElement * conditions)
{
    for ( unsigned int k = 0;k < list.size();k++ )
    {
        //Pour chaque condition
        TiXmlElement * condition = new TiXmlElement( "Condition" );
        conditions->LinkEndChild( condition );

        //Le type
        TiXmlElement * typeCondition = new TiXmlElement( "Type" );
        condition->LinkEndChild( typeCondition );

        typeCondition->SetAttribute( "value", list[k].GetType().c_str() );
        if ( list[k].IsInverted() ) { typeCondition->SetAttribute( "Contraire", "true" ); }
        else { typeCondition->SetAttribute( "Contraire", "false" ); }

        //Les autres paramètres
        for ( unsigned int l = 0;l < list[k].GetParameters().size();l++ )
        {
            TiXmlElement * Parametre = new TiXmlElement( "Parametre" );
            condition->LinkEndChild( Parametre );
            Parametre->SetAttribute( "value", list[k].GetParameter( l ).GetPlainString().c_str() );
        }

        //Sub instructions
        if ( !list[k].GetSubInstructions().empty() )
        {
            TiXmlElement * subConditions = new TiXmlElement( "SubConditions" );
            condition->LinkEndChild(subConditions);
            SaveConditions(list[k].GetSubInstructions(), subConditions);
        }
    }
}

void OpenSaveGame::SaveLayers(const vector < Layer > & list, TiXmlElement * layers)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        //Pour chaque calque
        TiXmlElement * layer;

        layer = new TiXmlElement( "Layer" );
        layers->LinkEndChild( layer );

        layer->SetAttribute("Name", list.at(j).GetName().c_str());
        if ( list.at(j).GetVisibility() )
            layer->SetAttribute("Visibility", "true");
        else
            layer->SetAttribute("Visibility", "false");

        for (unsigned int c = 0;c<list.at(j).GetCamerasNumber();++c)
        {
            TiXmlElement * camera = new TiXmlElement( "Camera" );
            layer->LinkEndChild( camera );

            camera->SetAttribute("DefaultSize", "true");
            if ( !list.at(j).GetCamera(c).defaultSize )
                camera->SetAttribute("DefaultSize", "false");

            camera->SetDoubleAttribute("Width", list.at(j).GetCamera(c).size.x);
            camera->SetDoubleAttribute("Height", list.at(j).GetCamera(c).size.y);

            camera->SetAttribute("DefaultViewport", "true");
            if ( !list.at(j).GetCamera(c).defaultViewport )
                camera->SetAttribute("DefaultViewport", "false");

            camera->SetDoubleAttribute("ViewportLeft", list.at(j).GetCamera(c).viewport.Left);
            camera->SetDoubleAttribute("ViewportTop", list.at(j).GetCamera(c).viewport.Top);
            camera->SetDoubleAttribute("ViewportRight", list.at(j).GetCamera(c).viewport.Left+list.at(j).GetCamera(c).viewport.Width);
            camera->SetDoubleAttribute("ViewportBottom", list.at(j).GetCamera(c).viewport.Top+list.at(j).GetCamera(c).viewport.Height);
        }
    }
}

void OpenSaveGame::SaveExternalEvents(const vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * elem)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        TiXmlElement * externalEvents = new TiXmlElement( "ExternalEvents" );
        elem->LinkEndChild( externalEvents );

        externalEvents->SetAttribute("Name", list[j]->GetName().c_str());

        TiXmlElement * events = new TiXmlElement( "Events" );
        externalEvents->LinkEndChild( events );
        SaveEvents(list[j]->GetEvents(), events);
    }
}

#endif

////////////////////////////////////////////////////////////
/// Recréer les chemins
///
/// Recréer les chemins des ressources utilisées par le jeu
////////////////////////////////////////////////////////////
void OpenSaveGame::RecreatePaths(string file)
{
#if defined(GD_IDE_ONLY)
    string newDirectory = string( wxPathOnly( file ).mb_str() );
    if ( newDirectory.empty() ) return;

    gd::ResourcesUnmergingHelper resourcesUnmergingHelper(newDirectory);

    //Image du chargement
    if ( !game.loadingScreen.imageFichier.empty() )
        resourcesUnmergingHelper.ExposeResource(game.loadingScreen.imageFichier);


    for ( unsigned int i = 0;i < game.resourceManager.resources.size() ;i++ )
    {
        if ( game.resourceManager.resources[i] == boost::shared_ptr<Resource>() )
            continue;

        if ( game.resourceManager.resources[i]->UseFile() )
            resourcesUnmergingHelper.ExposeResource(game.resourceManager.resources[i]->GetFile());
    }

    //Add scenes resources
    for ( unsigned int i = 0;i < game.GetLayoutCount();i++ )
    {
        for (unsigned int j = 0;j<game.GetLayouts()[i]->GetInitialObjects().size();++j) //Add objects resources
        	game.GetLayouts()[i]->GetInitialObjects()[j]->ExposeResources(resourcesUnmergingHelper);

        LaunchResourceWorkerOnEvents(game, game.GetLayout(i).GetEvents(), resourcesUnmergingHelper);
    }
    for (unsigned int j = 0;j<game.GetGlobalObjects().size();++j) //Add global objects resources
        game.GetGlobalObjects()[j]->ExposeResources(resourcesUnmergingHelper);
#endif
}

#if defined(GD_IDE_ONLY)
void OpenSaveGame::OpenImagesFromGD2010498(const TiXmlElement * imagesElem, TiXmlElement * dossierElem)
{
    //Images
    game.resourceManager.resources.clear();
    while ( imagesElem )
    {
        boost::shared_ptr<ImageResource> image(new ImageResource);

        if ( imagesElem->Attribute( "nom" ) != NULL ) { image->name = imagesElem->Attribute( "nom" ); }
        else { MSG( "Les informations concernant le nom de l'image manquent." ); }
        if ( imagesElem->Attribute( "fichier" ) != NULL ) {image->file = imagesElem->Attribute( "fichier" ); }
        else { MSG( "Les informations concernant le fichier de l'image manquent." ); }

        image->smooth = true;
        if ( imagesElem->Attribute( "lissage" ) != NULL && string(imagesElem->Attribute( "lissage" )) == "false")
                image->smooth = false;

        image->alwaysLoaded = false;
        if ( imagesElem->Attribute( "alwaysLoaded" ) != NULL && string(imagesElem->Attribute( "alwaysLoaded" )) == "true")
                image->alwaysLoaded = true;

        game.resourceManager.resources.push_back(image);
        imagesElem = imagesElem->NextSiblingElement();
    }

    //Dossiers d'images
    game.resourceManager.folders.clear();
    while ( dossierElem )
    {
        ResourceFolder folder;

        if ( dossierElem->Attribute( "nom" ) != NULL ) { folder.name =  dossierElem->Attribute( "nom" ); }
        else { MSG( "Les informations concernant le nom d'un dossier d'images manquent." ); }

        //On vérifie que le dossier n'existe pas plusieurs fois.
        //Notamment pour purger les fichiers qui ont eu des dossiers dupliqués suite à un bug
        //27/04/09
        bool alreadyexist = false;
        for (unsigned int i =0;i<game.resourceManager.folders.size();++i)
        {
        	if ( folder.name == game.resourceManager.folders[i].name )
                alreadyexist = true;
        }

        if ( !alreadyexist )
        {
            TiXmlElement *elemDossier = dossierElem;
            if ( elemDossier->FirstChildElement( "Contenu" ) != NULL )
            {
                elemDossier = elemDossier->FirstChildElement( "Contenu" )->FirstChildElement();
                while ( elemDossier )
                {
                    if ( elemDossier->Attribute( "nom" ) != NULL ) { folder.AddResource(elemDossier->Attribute( "nom" ), game.resourceManager.resources); }
                    else { MSG( "Les informations concernant le nom d'une image d'un dossier manquent." ); }

                    elemDossier = elemDossier->NextSiblingElement();
                }
            }

            game.resourceManager.folders.push_back( folder );
        }

        dossierElem = dossierElem->NextSiblingElement();
    }
}


void OpenSaveGame::AdaptConditionFromGD1x(gd::Instruction & instruction, const gd::InstructionMetadata & instrInfos)
{
    vector < gd::Expression > newParameters = instruction.GetParameters();
    for (unsigned int i = 0;i<instrInfos.parameters.size() && i<newParameters.size();++i)
    {
        if ( instrInfos.parameters[i].codeOnly )
            newParameters.insert(newParameters.begin()+i, gd::Expression(""));
    }

    instruction.SetParameters(newParameters);

    if ( instrInfos.canHaveSubInstructions )
    {
        ExtensionsManager * extensionManager = ExtensionsManager::GetInstance();

        vector < gd::Instruction > & subInstructions = instruction.GetSubInstructions();
        for (unsigned int i = 0;i<subInstructions.size();++i)
            AdaptConditionFromGD1x(subInstructions[i], extensionManager->GetConditionMetadata(subInstructions[i].GetType()));
    }
}

void OpenSaveGame::AdaptActionFromGD1x(gd::Instruction & instruction, const gd::InstructionMetadata & instrInfos)
{
    vector < gd::Expression > newParameters = instruction.GetParameters();
    for (unsigned int i = 0;i<instrInfos.parameters.size() && i<newParameters.size();++i)
    {
        if ( instrInfos.parameters[i].codeOnly )
            newParameters.insert(newParameters.begin()+i, gd::Expression(""));
    }

    instruction.SetParameters(newParameters);

    if ( instrInfos.canHaveSubInstructions )
    {
        ExtensionsManager * extensionManager = ExtensionsManager::GetInstance();

        vector < gd::Instruction > & subInstructions = instruction.GetSubInstructions();
        for (unsigned int i = 0;i<subInstructions.size();++i)
            AdaptActionFromGD1x(subInstructions[i], extensionManager->GetActionMetadata(subInstructions[i].GetType()));
    }
}

void OpenSaveGame::AdaptEventsFromGD1x(vector < gd::BaseEventSPtr > & list)
{
    ExtensionsManager * extensionManager = ExtensionsManager::GetInstance();

    for (unsigned int eId = 0;eId<list.size();++eId)
    {
        vector < vector<gd::Instruction>* > conditions = list[eId]->GetAllConditionsVectors();
        for (unsigned cV = 0;cV<conditions.size();++cV)
        {
            for (unsigned int cId = 0;cId<conditions[cV]->size();++cId)
            {
                AdaptConditionFromGD1x((*conditions[cV])[cId], extensionManager->GetConditionMetadata((*conditions[cV])[cId].GetType()));
            }
        }

        vector < vector<gd::Instruction>* > actions = list[eId]->GetAllActionsVectors();
        for (unsigned aV = 0;aV<actions.size();++aV)
        {
            for (unsigned int aId = 0;aId<actions[aV]->size();++aId)
            {
                AdaptActionFromGD1x( (*actions[aV])[aId], extensionManager->GetActionMetadata((*actions[aV])[aId].GetType()));
            }
        }

        if ( list[eId]->CanHaveSubEvents() )
            AdaptEventsFromGD1x(list[eId]->GetSubEvents());
    }
}

#endif
