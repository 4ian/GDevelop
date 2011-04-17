/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
    #include <wx/wx.h>
    #include "GDL/CommonTools.h"
    #define MSG(x) wxLogWarning(x);          // Utiliser WxWidgets pour
    #define MSGERR(x) wxLogError(x.c_str()); // afficher les messages dans l'éditeur
    #define ToString(x)ToString(x) // Méthode de conversion int vers string
#else
    #define MSG(x) EcrireLog("Chargement", x); //Macro pour rapporter des erreurs
    #define MSGERR(x) EcrireLog("Chargement, erreur", x);

    #ifndef _
    #define _(x) x // "Emule" la macro de WxWidgets
    #endif
#endif

#include <string>
#include <cctype>
#include <boost/shared_ptr.hpp>
#include <boost/interprocess/containers/flat_map.hpp>

#include "GDL/OpenSaveGame.h"
#include "GDL/tinyxml.h"
#include "GDL/ResourcesUnmergingHelper.h"
#include "GDL/CommonTools.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/constantes.h"
#include "GDL/Animation.h"
#include "GDL/Position.h"
#include "GDL/Event.h"
#include "GDL/Instruction.h"
#include "GDL/Automatism.h"
#include "GDL/AutomatismsSharedDatas.h"
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
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

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
        if ( build > GDLVersionWrapper::Build() || minor > GDLVersionWrapper::Minor() || revision > GDLVersionWrapper::Revision() )
        {
            MSG( _( "La version de l'éditeur utilisé pour créer ce jeu semble être supérieure.\nLe jeu peut donc ne pas s'ouvrir, ou des données peuvent manquer.\nVous devriez vérifier si une nouvelle version de Game Develop est disponible." ) );
        }
    }

    //Compatibility code
    game.extensionsUsed.clear();
    if ( major <= 1 && minor <= 2 && build <= 7630 && revision <= 38327)
    {
        game.extensionsUsed.push_back("BuiltinObject");
        game.extensionsUsed.push_back("BuiltinAudio");
        game.extensionsUsed.push_back("Sprite");
        game.extensionsUsed.push_back("BuiltinScene");
        game.extensionsUsed.push_back("BuiltinVariables");
        game.extensionsUsed.push_back("BuiltinCamera");
        game.extensionsUsed.push_back("BuiltinAdvanced");
        game.extensionsUsed.push_back("BuiltinFile");
        game.extensionsUsed.push_back("CommonDialogs");
        game.extensionsUsed.push_back("BuiltinJoystick");
        game.extensionsUsed.push_back("BuiltinKeyboard");
        game.extensionsUsed.push_back("BuiltinMouse");
        game.extensionsUsed.push_back("BuiltinNetwork");
        game.extensionsUsed.push_back("BuiltinWindow");
        game.extensionsUsed.push_back("BuiltinTime");
    }
    //End of Compatibility code
    //Compatibility code --- with Game Develop 1.3.8892 and inferior
    if ( major <= 1 && minor <= 3 && build <= 8892 && revision <= 44771)
    {
        game.extensionsUsed.push_back("BuiltinCommonInstructions");
    }
    //End of Compatibility code --- with Game Develop 1.3.8892 and inferior

    //Compatibility code --- with Game Develop 1.3.9262 and inferior
    if ( major <= 1 && minor <= 3 && build <= 9262 && revision <= 46622)
    {
        game.extensionsUsed.push_back("BuiltinCommonConversions");
        game.extensionsUsed.push_back("BuiltinStringInstructions");

        notBackwardCompatible = true;
    }
    //End of Compatibility code --- with Game Develop 1.3.9262 and inferior

    elem = hdl.FirstChildElement().FirstChildElement( "Info" ).Element();
    if ( elem )
        OpenGameInformations(elem);

    if (  elem->FirstChildElement( "Chargement" ) != NULL )
    {
        OpenSaveLoadingScreen openLoadingScreen(game.loadingScreen);
        openLoadingScreen.OpenFromElement(elem->FirstChildElement( "Chargement" ));
    }

    OpenImages(hdl.FirstChildElement().FirstChildElement( "Images" ).FirstChildElement().Element(),
               hdl.FirstChildElement().FirstChildElement( "DossierImages" ).FirstChildElement().Element());

    //Global objects
    elem = hdl.FirstChildElement().FirstChildElement( "Objects" ).Element();
    if ( elem )
        OpenObjects(game.globalObjects, elem);

    //Global object groups
    elem = hdl.FirstChildElement().FirstChildElement( "ObjectGroups" ).Element();
    if ( elem )
        OpenGroupesObjets(game.objectGroups, elem);

    //Global variables
    elem = hdl.FirstChildElement().FirstChildElement( "Variables" ).Element();
    if ( elem )
        OpenVariablesList(game.variables, elem);

    //Scenes
    elem = hdl.FirstChildElement().FirstChildElement( "Scenes" ).Element();
    if ( elem == NULL ) { MSG( "Les informations concernant les scenes manquent" ); }
    game.scenes.clear();

    elem = hdl.FirstChildElement().FirstChildElement( "Scenes" ).FirstChildElement().Element();
    while ( elem )
    {
        //Scene vide
        boost::shared_ptr<Scene> newScene = boost::shared_ptr<Scene>(new Scene());

        //Nom
        if ( elem->Attribute( "nom" ) != NULL ) { newScene->SetName( elem->Attribute( "nom" ) );}
        else { MSG( "Les informations concernant le nom de la scene manquent." ); }
        if ( elem->Attribute( "r" ) != NULL ) { int value;elem->QueryIntAttribute( "r", &value ); newScene->backgroundColorR = value;}
        else { MSG( "Les informations concernant la couleur de fond de la scene manquent." ); }
        if ( elem->Attribute( "v" ) != NULL ) { int value;elem->QueryIntAttribute( "v", &value ); newScene->backgroundColorG = value;}
        else { MSG( "Les informations concernant la couleur de fond de la scene manquent." ); }
        if ( elem->Attribute( "b" ) != NULL ) { int value;elem->QueryIntAttribute( "b", &value ); newScene->backgroundColorB = value;}
        else { MSG( "Les informations concernant la couleur de fond de la scene manquent." ); }
        if ( elem->Attribute( "titre" ) != NULL ) { newScene->title = elem->Attribute( "titre" );}
        else { MSG( "Les informations concernant le titre de la fenêtre de la scene manquent." ); }
        if ( elem->Attribute( "oglFOV" ) != NULL ) { elem->QueryFloatAttribute("oglFOV", &newScene->oglFOV); }
        if ( elem->Attribute( "oglZNear" ) != NULL ) { elem->QueryFloatAttribute("oglZNear", &newScene->oglZNear); }
        if ( elem->Attribute( "oglZFar" ) != NULL ) { elem->QueryFloatAttribute("oglZFar", &newScene->oglZFar); }
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("standardSortMethod", newScene->standardSortMethod);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("stopSoundsOnStartup", newScene->stopSoundsOnStartup);
        #if defined(GD_IDE_ONLY)
        if ( elem->Attribute( "grid" ) != NULL ) GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("grid", newScene->grid);
        if ( elem->Attribute( "snap" ) != NULL ) GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("snap", newScene->snap);
        if ( elem->Attribute( "windowMask" ) != NULL ) GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("windowMask", newScene->windowMask);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridWidth", newScene->gridWidth);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridHeight", newScene->gridHeight);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridR", newScene->gridR);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridG", newScene->gridG);
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_INT("gridB", newScene->gridB);
        #endif

        if ( elem->FirstChildElement( "GroupesObjets" ) != NULL )
            OpenGroupesObjets(newScene->objectGroups, elem->FirstChildElement( "GroupesObjets" ));

        if ( elem->FirstChildElement( "Objets" ) != NULL )
            OpenObjects(newScene->initialObjects, elem->FirstChildElement( "Objets" ));

        if ( elem->FirstChildElement( "Positions" ) != NULL )
            OpenPositions(newScene->initialObjectsPositions, elem->FirstChildElement( "Positions" ));

        if ( elem->FirstChildElement( "Layers" ) != NULL )
            OpenLayers(newScene->initialLayers, elem->FirstChildElement( "Layers" ));

        if ( elem->FirstChildElement( "Events" ) != NULL )
            OpenEvents(newScene->events, elem->FirstChildElement( "Events" ));

        if ( elem->FirstChildElement( "Variables" ) != NULL )
            OpenVariablesList(newScene->variables, elem->FirstChildElement( "Variables" ));

        if ( elem->FirstChildElement( "AutomatismsSharedDatas" ) != NULL )
        {
            TiXmlElement * elemSharedDatas = elem->FirstChildElement( "AutomatismsSharedDatas" )->FirstChildElement( "AutomatismSharedDatas" );
            while ( elemSharedDatas != NULL )
            {
                std::string type = elemSharedDatas->Attribute("Type") ? elemSharedDatas->Attribute("Type") : "";
                boost::shared_ptr<AutomatismsSharedDatas> sharedDatas = extensionsManager->CreateAutomatismSharedDatas(type);

                if ( sharedDatas != boost::shared_ptr<AutomatismsSharedDatas>() )
                {
                    sharedDatas->SetName( elemSharedDatas->Attribute("Name") ? elemSharedDatas->Attribute("Name") : "" );
                    sharedDatas->LoadFromXml(elemSharedDatas);
                    newScene->automatismsInitialSharedDatas[sharedDatas->GetAutomatismId()] = sharedDatas;
                }

                elemSharedDatas = elemSharedDatas->NextSiblingElement("AutomatismSharedDatas");
            }
        }

        game.scenes.push_back( newScene );

        elem = elem->NextSiblingElement();
    }

    //External events
    elem = hdl.FirstChildElement().FirstChildElement( "ExternalEvents" ).Element();
    if ( elem )
        OpenExternalEvents(game.externalEvents, elem);

    #if defined(GD_IDE_ONLY)
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

    //Compatibility code --- with Game Develop 1.3.9262 and inferior
    if ( major <= 1 && minor <= 3 && build <= 9262 && revision <= 46622)
    {
        for (unsigned int i = 0;i<game.scenes.size();++i)
        {
            AdaptExpressionsFromGD139262(game.scenes[i]->events, game, *game.scenes[i]);
        }
    }
    //End of Compatibility code --- with Game Develop 1.3.9262 and inferior

    //Compatibility code --- with Game Develop 1.4.9552 and inferior
    if ( major <= 1 && minor <= 4 && build <= 9552 && revision <= 48094 && !(major <= 1 && minor <= 3 && build <= 9262 && revision <= 46622))
    {
        for (unsigned int i = 0;i<game.scenes.size();++i)
        {
            AdaptExpressionsFromGD149552(game.scenes[i]->events, game, *game.scenes[i]);
        }
    }
    //End of Compatibility code --- with Game Develop 1.4.9552 and inferior

    //Compatibility code --- with Game Develop 1.4.9587 and inferior
    if ( major <= 1 && minor <= 4 && build <= 9587 && revision <= 48275)
    {
        for (unsigned int i = 0;i<game.scenes.size();++i)
        {
            AdaptExpressionsFromGD149587(game.scenes[i]->events, game, *game.scenes[i]);
        }
    }
    //End of Compatibility code --- with Game Develop 1.4.9587 and inferior

    if ( notBackwardCompatible )
    {
        MSG( _("Attention, si vous enregistrez votre jeu avec cette version de Game Develop, vous ne pourrez plus le réouvrir avec une version précédente.") );
    }

    return;
}

void OpenSaveGame::OpenGameInformations(const TiXmlElement * elem)
{
    if ( elem->FirstChildElement( "Nom" ) != NULL ) { game.name = elem->FirstChildElement( "Nom" )->Attribute( "value" ); }
    else { MSG( "Les informations concernant le nom manquent." ); }
    if ( elem->FirstChildElement( "Auteur" ) != NULL ) { game.author = elem->FirstChildElement( "Auteur" )->Attribute( "value" ); }
    else { MSG( "Les informations concernant l'auteur manquent." ); }
    if ( elem->FirstChildElement( "WindowW" ) != NULL ) { elem->FirstChildElement( "WindowW" )->QueryIntAttribute( "value", &game.windowWidth ); }
    else { MSG( "Les informations concernant la largeur manquent." ); }
    if ( elem->FirstChildElement( "WindowH" ) != NULL ) { elem->FirstChildElement( "WindowH" )->QueryIntAttribute( "value", &game.windowHeight ); }
    else { MSG( "Les informations concernant la hauteur manquent." ); }

    if ( elem->FirstChildElement( "Extensions" ) != NULL )
    {
        const TiXmlElement * extensionsElem = elem->FirstChildElement( "Extensions" )->FirstChildElement();
        while (extensionsElem)
        {
            if ( extensionsElem->Attribute("name") )
                game.extensionsUsed.push_back(extensionsElem->Attribute("name"));

            extensionsElem = extensionsElem->NextSiblingElement();
        }
    }

    //Compatibility with Game Develop 1.3 and older
    {
        std::vector<string>::iterator oldName = find(game.extensionsUsed.begin(), game.extensionsUsed.end(), "BuiltinInterface");
        if ( oldName != game.extensionsUsed.end() ) *oldName = "CommonDialogs";
    }

    if ( elem->FirstChildElement( "FPSmax" ) != NULL ) { elem->FirstChildElement( "FPSmax" )->QueryIntAttribute( "value", &game.maxFPS ); }
    if ( elem->FirstChildElement( "FPSmin" ) != NULL ) { elem->FirstChildElement( "FPSmin" )->QueryIntAttribute( "value", &game.minFPS ); }

    game.verticalSync = false;
    if ( elem->FirstChildElement( "verticalSync" ) != NULL )
    {
        string result = elem->FirstChildElement( "verticalSync" )->Attribute("value");
        if ( result == "true")
            game.verticalSync = true;
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
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("winExecutableFilename", game.winExecutableFilename);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("winExecutableIconFile", game.winExecutableIconFile);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("linuxExecutableFilename", game.linuxExecutableFilename);
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("macExecutableFilename", game.macExecutableFilename);
    #endif
    if ( elem->Attribute( "useExternalSourceFiles" )  != NULL )
        GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_BOOL("useExternalSourceFiles", game.useExternalSourceFiles);

    return;
}

void OpenSaveGame::OpenImages(const TiXmlElement * imagesElem, TiXmlElement * dossierElem)
{
    //Images
    game.images.clear();
    while ( imagesElem )
    {
        Image imageToAdd;

        if ( imagesElem->Attribute( "nom" ) != NULL ) { imageToAdd.nom = imagesElem->Attribute( "nom" ); }
        else { MSG( "Les informations concernant le nom de l'image manquent." ); }
        if ( imagesElem->Attribute( "fichier" ) != NULL ) {imageToAdd.file = imagesElem->Attribute( "fichier" ); }
        else { MSG( "Les informations concernant le fichier de l'image manquent." ); }

        imageToAdd.smooth = true;
        if ( imagesElem->Attribute( "lissage" ) != NULL && string(imagesElem->Attribute( "lissage" )) == "false")
                imageToAdd.smooth = false;

        imageToAdd.alwaysLoaded = false;
        if ( imagesElem->Attribute( "alwaysLoaded" ) != NULL && string(imagesElem->Attribute( "alwaysLoaded" )) == "true")
                imageToAdd.smooth = true;

        game.images.push_back(imageToAdd);
        imagesElem = imagesElem->NextSiblingElement();
    }

    //Dossiers d'images
    game.imagesFolders.clear();
    while ( dossierElem )
    {
        Dossier dossierToAdd;

        if ( dossierElem->Attribute( "nom" ) != NULL ) { dossierToAdd.nom =  dossierElem->Attribute( "nom" ); }
        else { MSG( "Les informations concernant le nom d'un dossier d'images manquent." ); }

        //On vérifie que le dossier n'existe pas plusieurs fois.
        //Notamment pour purger les fichiers qui ont eu des dossiers dupliqués suite à un bug
        //27/04/09
        bool alreadyexist = false;
        for (unsigned int i =0;i<game.imagesFolders.size();++i)
        {
        	if ( dossierToAdd.nom == game.imagesFolders.at(i).nom )
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
                    if ( elemDossier->Attribute( "nom" ) != NULL ) { dossierToAdd.contenu.push_back( elemDossier->Attribute( "nom" ) );}
                    else { MSG( "Les informations concernant le nom d'une image d'un dossier manquent." ); }

                    elemDossier = elemDossier->NextSiblingElement();
                }
            }

            game.imagesFolders.push_back( dossierToAdd );
        }

        dossierElem = dossierElem->NextSiblingElement();
    }
}

void OpenSaveGame::OpenObjects(vector < boost::shared_ptr<Object> > & objects, TiXmlElement * elem)
{
    TiXmlElement * elemScene = elem->FirstChildElement("Objet");

    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

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
        boost::shared_ptr<Object> newObject = extensionsManager->CreateObject(extensionsManager->GetTypeIdFromString(type),
                                                                                name);

        if ( elemScene->FirstChildElement( "Variables" ) != NULL ) { OpenVariablesList(newObject->variablesObjet, elemScene->FirstChildElement( "Variables" )); }

        //Spécifique à l'objet
        newObject->LoadFromXml(elemScene);

        if ( elemScene->FirstChildElement( "Automatism" ) != NULL )
        {
            TiXmlElement * elemAutomatism = elemScene->FirstChildElement( "Automatism" );
            while ( elemAutomatism )
            {
                boost::shared_ptr<Automatism> newAutomatism = extensionsManager->CreateAutomatism(elemAutomatism->Attribute("Type") != NULL ? elemAutomatism->Attribute("Type") : "");
                if ( newAutomatism != boost::shared_ptr<Automatism>() )
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

        elemScene = elemScene->NextSiblingElement();
    }
}

void OpenSaveGame::OpenGroupesObjets(vector < ObjectGroup > & list, TiXmlElement * elem)
{
    TiXmlElement * elemScene = elem->FirstChildElement("Groupe");

    //Passage en revue des positions initiales
    while ( elemScene )
    {
        ObjectGroup objectGroup;

        if ( elemScene->Attribute( "nom" ) != NULL ) { objectGroup.SetName(elemScene->Attribute( "nom" ));}
        else { MSG( "Les informations concernant le nom d'un groupe d'objet manquent." ); }

        TiXmlElement * objet = elemScene->FirstChildElement( "Objet" );
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

void OpenSaveGame::OpenPositions(vector < InitialPosition > & list, TiXmlElement * elem)
{
    TiXmlElement * elemScene = elem->FirstChildElement();

    //Passage en revue des positions initiales
    while ( elemScene )
    {
        InitialPosition newPosition;

        if ( elemScene->Attribute( "x" ) != NULL ) { elemScene->QueryFloatAttribute( "x", &newPosition.x );}
        else { MSG( "Les informations concernant la position X d'un objet manquent." ); }

        if ( elemScene->Attribute( "y" ) != NULL ) { elemScene->QueryFloatAttribute( "y", &newPosition.y );}
        else { MSG( "Les informations concernant la position Y d'un objet manquent." ); }

        //Compatibility with Game Develop 1.2 and inferior
        if ( elemScene->Attribute( "direction" ) != NULL )
        {
            int direction;
            elemScene->QueryIntAttribute( "direction", &direction );
            newPosition.floatInfos["direction"] = direction;
        }

        //Compatibility with Game Develop 1.2 and inferior
        if ( elemScene->Attribute( "animation" ) != NULL )
        {
            int animation;
            elemScene->QueryIntAttribute( "animation", &animation );
            newPosition.floatInfos["animation"] = animation;
        }

        if ( elemScene->Attribute( "angle" ) != NULL ) { elemScene->QueryFloatAttribute( "angle", &newPosition.angle );}

        //Compatibility with Game Develop 1.2.8522 and inferior
        newPosition.personalizedSize = false;
        if ( elemScene->Attribute( "personalizedSize" ) != NULL )
        {
            string personalizedSize = elemScene->Attribute( "personalizedSize" );
            if ( personalizedSize == "true")
                newPosition.personalizedSize = true;
        }

        //Compatibility with Game Develop 1.2.8522 and inferior
        if ( elemScene->Attribute( "width" ) != NULL )
            elemScene->QueryFloatAttribute( "width", &newPosition.width );

        //Compatibility with Game Develop 1.2.8522 and inferior
        if ( elemScene->Attribute( "height" ) != NULL )
            elemScene->QueryFloatAttribute( "height", &newPosition.height );

        if ( elemScene->Attribute( "plan" ) != NULL ) { elemScene->QueryIntAttribute( "plan", &newPosition.zOrder );}
        else { MSG( "Les informations concernant le plan d'un objet manquent." ); }

        if ( elemScene->Attribute( "layer" ) != NULL ) { newPosition.layer = elemScene->Attribute( "layer" ); }

        if ( elemScene->Attribute( "nom" ) != NULL ) { newPosition.objectName = elemScene->Attribute( "nom" );}
        else { MSG( "Les informations concernant le nom d'un objet manquent." ); }

        TiXmlElement * floatInfos = elemScene->FirstChildElement( "floatInfos" );
        if ( floatInfos ) floatInfos = floatInfos->FirstChildElement("Info");
        while ( floatInfos )
        {
            if ( floatInfos->Attribute("name") != NULL && floatInfos->Attribute("value") != NULL )
            {
                float value = 0;
                floatInfos->QueryFloatAttribute("value", &value);
                newPosition.floatInfos[floatInfos->Attribute("name")] = value;
            }

            floatInfos = floatInfos->NextSiblingElement();
        }

        TiXmlElement * stringInfos = elemScene->FirstChildElement( "stringInfos" );
        if ( stringInfos ) stringInfos = stringInfos->FirstChildElement("Info");
        while ( stringInfos )
        {
            if ( stringInfos->Attribute("name") != NULL && stringInfos->Attribute("value") != NULL )
                newPosition.stringInfos[stringInfos->Attribute("name")] = stringInfos->Attribute("value");

            stringInfos = stringInfos->NextSiblingElement();
        }

        list.push_back( newPosition );

        elemScene = elemScene->NextSiblingElement();
    }
}

void OpenSaveGame::OpenEvents(vector < BaseEventSPtr > & list, const TiXmlElement * elem)
{
    const TiXmlElement * elemScene = elem->FirstChildElement();
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    //Passage en revue des évènements
    while ( elemScene )
    {
        string type;

        if ( elemScene->FirstChildElement( "Type" )->Attribute( "value" ) != NULL ) { type = elemScene->FirstChildElement( "Type" )->Attribute( "value" );}
        else { MSG( "Les informations concernant le type d'un évènement manquent." ); }

        //Compatibility code --- with Game Develop 1.3.8892 and inferior
        bool isLegacyOrEvent = false;
        if ( type == "AND" ) type = "BuiltinCommonInstructions::Standard";
        else if ( type == "Link" ) type = "BuiltinCommonInstructions::Link";
        else if ( type == "Commentaire" ) type = "BuiltinCommonInstructions::Comment";
        else if ( type == "OR" )
        {
            type = "BuiltinCommonInstructions::Standard";
            isLegacyOrEvent = true;
        }
        //End of Compatibility code --- with Game Develop 1.3.8892 and inferior

        BaseEventSPtr event = extensionsManager->CreateEvent(type);
        if ( elemScene->Attribute( "disabled" ) != NULL ) { if ( string(elemScene->Attribute( "disabled" )) == "true" ) event->SetDisabled(); }

        if ( event != boost::shared_ptr<BaseEvent>())
        {
            event->LoadFromXml(elemScene);

            //Compatibility code --- with Game Develop 1.3.8892 and inferior
            if ( isLegacyOrEvent )
            {
                StandardEvent * legacyOrEvent = dynamic_cast<StandardEvent *>(event.get());
                if (legacyOrEvent != NULL)
                {
                    //Create a or condition
                    Instruction newConditionOr("BuiltinCommonInstructions::Or");
                    vector < Instruction > conditions = legacyOrEvent->GetConditions();
                    newConditionOr.SetSubInstructions(conditions);

                    //Add conditions as sub conditions
                    vector < Instruction > newConditions;
                    newConditions.push_back(newConditionOr);

                    //Replace all with the new or condition
                    legacyOrEvent->SetConditions(newConditions);
                }
            }
            //End of Compatibility code --- Compatibility with Game Develop 1.3.8892 and inferior
        }
        else
        {
            cout << "Unknown event of type " << type << endl;
            event = boost::shared_ptr<BaseEvent>(new EmptyEvent);
        }

        list.push_back( event );

        elemScene = elemScene->NextSiblingElement();
    }

    //Compatibility code --- with Game Develop 1.3.8892 and inferior
    AdaptEventsFromGD138892(list);
    //End of Compatibility code --- Compatibility with Game Develop 1.3.8892 and inferior
}

/**
 * Adapt events that comes from Game Develop 1.3.8892 and inferior
 * -> Transform legacy Repeat, While, ForEach condition/action into
 *    structure of event of different type
 */
void OpenSaveGame::AdaptEventsFromGD138892(vector < BaseEventSPtr > & list)
{
    for (unsigned int eId = 0;eId < list.size();++eId)
    {
        bool abordAndRestartEvent = false;

        vector < vector < Instruction > * > conditionsVectors = list[eId]->GetAllConditionsVectors();
        vector < vector < Instruction > * > actionsVectors = list[eId]->GetAllActionsVectors();

        for (unsigned int l = 0;l<conditionsVectors.size();++l)
        {
            vector < Instruction > * conditions = conditionsVectors[l];
            for (unsigned int c = 0;conditions != NULL && c<(*conditions).size();++c)
            {
                if ( (*conditions)[c].GetType() == "Repeat"  )
                {
                    //Split conditions
                    vector < Instruction > oldConditions = (*conditions);
                    vector < Instruction > eventNewConditions;
                    vector < Instruction > subEventConditions;
                    copy(oldConditions.begin(), oldConditions.begin()+c, back_inserter(eventNewConditions));
                    copy(oldConditions.begin()+c+1, oldConditions.end(), back_inserter(subEventConditions));

                    //Create the new event
                    RepeatEvent * subEvent = new RepeatEvent;
                    subEvent->SetType("BuiltinCommonInstructions::Repeat");
                    subEvent->SetConditions(subEventConditions);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        subEvent->SetActions(*actionsVectors[0]);

                    subEvent->SetSubEvents(list[eId]->GetSubEvents());
                    subEvent->SetRepeatExpression((*conditions)[c].GetParameterSafely(0).GetPlainString());

                    //Insert the new event and modify the current
                    BaseEventSPtr subEventSPtr = boost::shared_ptr<BaseEvent>(subEvent);
                    list[eId]->GetSubEvents().clear();
                    list[eId]->GetSubEvents().push_back(subEventSPtr);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        actionsVectors[0]->clear();

                    *conditions = eventNewConditions;

                    if ( conditions->empty() )
                        list[eId] = subEventSPtr;

                    abordAndRestartEvent = true; break;
                }
                else if ( (*conditions)[c].GetType() == "ForEach"  )
                {
                    //Split conditions
                    vector < Instruction > oldConditions = (*conditions);
                    vector < Instruction > eventNewConditions;
                    vector < Instruction > subEventConditions;
                    copy(oldConditions.begin(), oldConditions.begin()+c, back_inserter(eventNewConditions));
                    copy(oldConditions.begin()+c+1, oldConditions.end(), back_inserter(subEventConditions));

                    //Create the new event
                    ForEachEvent * subEvent = new ForEachEvent;
                    subEvent->SetType("BuiltinCommonInstructions::ForEach");
                    subEvent->SetConditions(subEventConditions);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        subEvent->SetActions(*actionsVectors[0]);

                    subEvent->SetSubEvents(list[eId]->GetSubEvents());
                    subEvent->SetObjectToPick((*conditions)[c].GetParameterSafely(0).GetPlainString());

                    //Insert the new event and modify the current
                    BaseEventSPtr subEventSPtr = boost::shared_ptr<BaseEvent>(subEvent);
                    list[eId]->GetSubEvents().clear();
                    list[eId]->GetSubEvents().push_back(subEventSPtr);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        actionsVectors[0]->clear();

                    *conditions = eventNewConditions;

                    if ( conditions->empty() )
                        list[eId] = subEventSPtr;

                    abordAndRestartEvent = true; break;
                }
                else if ( (*conditions)[c].GetType() == "While"  )
                {
                    //Split conditions
                    vector < Instruction > oldConditions = (*conditions);
                    vector < Instruction > eventNewConditions;
                    vector < Instruction > subEventConditions;
                    vector < Instruction > whileConditions;
                    copy(oldConditions.begin(), oldConditions.begin()+c, back_inserter(eventNewConditions));
                    if ( oldConditions.size() > c+1 )
                        copy(oldConditions.begin()+c+1, oldConditions.begin()+c+2, back_inserter(whileConditions));

                    //Inverting condition if while first parameter is false
                    if ( (*conditions)[c].GetParameterSafely(0).GetPlainString() == "Faux" || (*conditions)[c].GetParameterSafely(0).GetPlainString() == "False" )
                    {
                        Instruction notCondition("BuiltinCommonInstructions::Not");
                        notCondition.SetSubInstructions(whileConditions);

                        //Replace condition by the NOT condition
                        whileConditions.clear();
                        whileConditions.push_back(notCondition);
                    }

                    if ( c+2 < oldConditions.size() )
                        copy(oldConditions.begin()+c+2, oldConditions.end(), back_inserter(subEventConditions));

                    //Create the new event
                    WhileEvent * subEvent = new WhileEvent;
                    subEvent->SetType("BuiltinCommonInstructions::While");
                    subEvent->SetConditions(subEventConditions);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        subEvent->SetActions(*actionsVectors[0]);

                    subEvent->SetSubEvents(list[eId]->GetSubEvents());
                    subEvent->SetWhileConditions(whileConditions);

                    //Insert the new event and modify the current
                    BaseEventSPtr subEventSPtr = boost::shared_ptr<BaseEvent>(subEvent);
                    list[eId]->GetSubEvents().clear();
                    list[eId]->GetSubEvents().push_back(subEventSPtr);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        actionsVectors[0]->clear();

                    *conditions = eventNewConditions;

                    if ( conditions->empty() )
                        list[eId] = subEventSPtr;

                    abordAndRestartEvent = true; break;
                }
            }
            if ( abordAndRestartEvent ) //If the event has been modified, restart processing the event
                break;
        }

        if ( abordAndRestartEvent ) //If the event has been modified, restart processing the event
        {
            --eId;
            continue;
        }

        for (unsigned int l = 0;l<actionsVectors.size();++l)
        {
            vector < Instruction > * actions = actionsVectors[l];

            for (unsigned int a = 0;actions != NULL && a<(*actions).size();++a)
            {
                if ( (*actions)[a].GetType() == "Repeat"  )
                {
                    //Split conditions
                    vector < Instruction > oldActions = (*actions);
                    vector < Instruction > eventNewActions;
                    vector < Instruction > subEventActions;
                    copy(oldActions.begin(), oldActions.begin()+a, back_inserter(eventNewActions));
                    copy(oldActions.begin()+a+1, oldActions.end(), back_inserter(subEventActions));

                    //Create the new event
                    RepeatEvent * subEvent = new RepeatEvent;
                    subEvent->SetType("BuiltinCommonInstructions::Repeat");
                    subEvent->SetActions(subEventActions);
                    subEvent->SetSubEvents(list[eId]->GetSubEvents());
                    subEvent->SetRepeatExpression((*actions)[a].GetParameterSafely(0).GetPlainString());

                    //Insert the new event and modify the current
                    BaseEventSPtr subEventSPtr = boost::shared_ptr<BaseEvent>(subEvent);
                    list[eId]->GetSubEvents().clear();
                    list[eId]->GetSubEvents().push_back(subEventSPtr);
                    (*actions) = eventNewActions;

                    abordAndRestartEvent = true; break;
                }
                else if ( (*actions)[a].GetType() == "ForEach"  )
                {
                    //Split conditions
                    vector < Instruction > oldActions = (*actions);
                    vector < Instruction > eventNewActions;
                    vector < Instruction > subEventActions;
                    copy(oldActions.begin(), oldActions.begin()+a, back_inserter(eventNewActions));
                    copy(oldActions.begin()+a+1, oldActions.end(), back_inserter(subEventActions));

                    //Create the new event
                    ForEachEvent * subEvent = new ForEachEvent;
                    subEvent->SetType("BuiltinCommonInstructions::ForEach");
                    subEvent->SetActions(subEventActions);
                    subEvent->SetSubEvents(list[eId]->GetSubEvents());
                    subEvent->SetObjectToPick((*actions)[a].GetParameterSafely(0).GetPlainString());

                    //Insert the new event and modify the current
                    BaseEventSPtr subEventSPtr = boost::shared_ptr<BaseEvent>(subEvent);
                    list[eId]->GetSubEvents().clear();
                    list[eId]->GetSubEvents().push_back(subEventSPtr);
                    (*actions) = eventNewActions;

                    abordAndRestartEvent = true; break;
                }
            }
            if ( abordAndRestartEvent ) //If the event has been modified, restart processing the event
                break;
        }
        if ( abordAndRestartEvent ) //If the event has been modified, restart processing the event
        {
            --eId;
            continue;
        }

        if ( list[eId]->CanHaveSubEvents() )
            AdaptEventsFromGD138892(list[eId]->GetSubEvents());
    }
}

std::string AdaptLegacyMathExpression(std::string expression, Game & game, Scene & scene)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    string newExpression;
    size_t lastPos = 0;
    {
        size_t objectExpressionStart = expression.find( "OBJ(" );
        size_t valExpressionStart = expression.find( "VAL(" );
        size_t gblExpressionStart = expression.find( "GBL(" );
        while ( objectExpressionStart != string::npos ||
                valExpressionStart != string::npos ||
                gblExpressionStart != string::npos )
        {
            size_t parametersStart = string::npos;
            string functionName;

            //There is an object expression first.
            if ( objectExpressionStart != string::npos &&
                 objectExpressionStart < valExpressionStart &&
                 objectExpressionStart < gblExpressionStart)
            {
                if ( objectExpressionStart != lastPos ) newExpression += expression.substr(lastPos, objectExpressionStart-lastPos);

                size_t bracket = expression.find( "[", objectExpressionStart );
                size_t bracket2 = expression.find( "]", objectExpressionStart );
                string objectName;
                if ( bracket != string::npos ) objectName = expression.substr(objectExpressionStart+4, bracket-(objectExpressionStart+4));
                if ( bracket2 != string::npos ) functionName = expression.substr(bracket+1, bracket2-bracket-1);

                std::string functionNameWithNewCase = functionName;
                if ( !functionNameWithNewCase.empty()) functionNameWithNewCase[0] = toupper(functionNameWithNewCase[0]);

                //Handle old style of variable access
                if ( functionName == "count" )
                {
                    newExpression += "Count("+objectName;
                }
                else if ( !extensionsManager->HasObjectExpression(GetTypeIdOfObject(game, scene, objectName), functionNameWithNewCase) )
                    newExpression += ReplaceSpacesByTildes(objectName)+".Variable("+functionName;
                else
                    newExpression += ReplaceSpacesByTildes(objectName)+"."+functionNameWithNewCase+"(";

                parametersStart = bracket2+1;
            }
            //There is an value expression first.
            else if ( valExpressionStart != string::npos &&
                      valExpressionStart < objectExpressionStart &&
                      valExpressionStart < gblExpressionStart)
            {
                if ( valExpressionStart != lastPos ) newExpression += expression.substr(lastPos, valExpressionStart-lastPos);

                size_t bracket = expression.find( "[", valExpressionStart );
                if ( bracket != string::npos ) functionName = expression.substr(valExpressionStart+4, bracket-(valExpressionStart+4));

                std::string functionNameWithNewCase = functionName;
                if ( !functionNameWithNewCase.empty()) functionNameWithNewCase[0] = toupper(functionNameWithNewCase[0]);

                //Handle old style of variable access
                if ( !extensionsManager->HasExpression(functionNameWithNewCase) )
                    newExpression += "Variable("+functionName;
                else
                    newExpression += functionNameWithNewCase+"(";

                parametersStart = bracket+1;
            }
            //There is an global expression first.
            else if ( gblExpressionStart != string::npos &&
                      gblExpressionStart < objectExpressionStart &&
                      gblExpressionStart < valExpressionStart)
            {
                if ( gblExpressionStart != lastPos ) newExpression += expression.substr(lastPos, gblExpressionStart-lastPos);

                size_t bracket = expression.find( "[", gblExpressionStart );
                if ( bracket != string::npos ) functionName = expression.substr(gblExpressionStart+4, bracket-(gblExpressionStart+4));

                //Global expressions were always global variables
                newExpression += "GlobalVariable("+functionName;

                parametersStart = bracket+1;
            }

            //Adding parameters
            size_t pos = parametersStart;
            bool firstParam = true;
            while ( pos < expression.length() && expression[pos] != ')')
            {

                if (expression[pos] == '[' && !firstParam ) newExpression += ',';
                else if (expression[pos] == '[' && firstParam ) firstParam = false;
                else if (expression[pos] == ']') ;
                else newExpression += expression[pos];

                pos++;
            }

            lastPos = pos;

            objectExpressionStart = expression.find( "OBJ(", lastPos+1 );
            valExpressionStart = expression.find( "VAL(", lastPos+1 );
            gblExpressionStart = expression.find( "GBL(", lastPos+1 );
        }

        if ( expression.length() > lastPos ) newExpression += expression.substr(lastPos, expression.length());
    }

    return newExpression;
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

std::string AdaptLegacyTextExpression(std::string expression, Game & game, Scene & scene)
{
    string newExpression;
    bool firstToken = true;
    size_t lastPos = 0;
    {
        size_t objectExpressionStart = expression.find( "TXT\"OBJ(" );
        size_t valExpressionStart = expression.find( "TXT\"VAL(" );
        size_t gblExpressionStart = expression.find( "TXT\"GBL(" );
        size_t calExpressionStart = expression.find( "CAL\"" );
        while ( objectExpressionStart != string::npos ||
                valExpressionStart != string::npos ||
                gblExpressionStart != string::npos ||
                calExpressionStart != string::npos )
        {
            string functionName;

            //There is an object expression first.
            if ( objectExpressionStart != string::npos &&
                 objectExpressionStart < valExpressionStart &&
                 objectExpressionStart < gblExpressionStart &&
                 objectExpressionStart < calExpressionStart)
            {
                //Add constant text before
                if ( objectExpressionStart != lastPos )
                {
                    if ( !firstToken ) newExpression += " + ";
                    newExpression += "\""+AddBackSlashBeforeQuotes(expression.substr(lastPos, objectExpressionStart-lastPos))+"\"";

                    firstToken = false;
                }

                if ( !firstToken ) newExpression += " + ";

                size_t bracket = expression.find( "[", objectExpressionStart );
                size_t bracket2 = expression.find( "]", objectExpressionStart );
                string objectName;
                if ( bracket != string::npos ) objectName = expression.substr(objectExpressionStart+8, bracket-(objectExpressionStart+8));
                if ( bracket2 != string::npos ) functionName = expression.substr(bracket+1, bracket2-bracket-1);

                //Handle old style of variable access
                newExpression += ReplaceSpacesByTildes(objectName)+".VariableString("+functionName+")";

                lastPos = bracket2+3;
                firstToken = false;
            }
            //There is an value expression first.
            else if ( valExpressionStart != string::npos &&
                      valExpressionStart < objectExpressionStart &&
                      valExpressionStart < gblExpressionStart &&
                      valExpressionStart < calExpressionStart)
            {
                //Add constant text before
                if ( valExpressionStart != lastPos )
                {
                    if ( !firstToken ) newExpression += " + ";
                    newExpression += "\""+AddBackSlashBeforeQuotes(expression.substr(lastPos, valExpressionStart-lastPos))+"\"";

                    firstToken = false;
                }

                if ( !firstToken ) newExpression += " + ";

                size_t bracket = expression.find( "[", valExpressionStart );
                if ( bracket != string::npos ) functionName = expression.substr(valExpressionStart+8, bracket-(valExpressionStart+8));

                //Handle old style of variable access
                newExpression += "VariableString("+functionName+")";

                lastPos = bracket+4;
                firstToken = false;
            }
            //There is an global expression first.
            else if ( gblExpressionStart != string::npos &&
                      gblExpressionStart < objectExpressionStart &&
                      gblExpressionStart < valExpressionStart &&
                      gblExpressionStart < calExpressionStart)
            {
                //Add constant text before
                if ( gblExpressionStart != lastPos )
                {
                    if ( !firstToken ) newExpression += " + ";
                    newExpression += "\""+AddBackSlashBeforeQuotes(expression.substr(lastPos, gblExpressionStart-lastPos))+"\"";

                    firstToken = false;
                }

                if ( !firstToken ) newExpression += " + ";

                size_t bracket = expression.find( "[", gblExpressionStart );
                if ( bracket != string::npos ) functionName = expression.substr(gblExpressionStart+8, bracket-(gblExpressionStart+8));

                //Global expressions were always global variables
                newExpression += "GlobalVariableString("+functionName+")";

                lastPos = bracket+4;
                firstToken = false;
            }
            //There is an CAL"" expression first.
            else if ( calExpressionStart != string::npos &&
                      calExpressionStart < objectExpressionStart &&
                      calExpressionStart < valExpressionStart &&
                      calExpressionStart < gblExpressionStart)
            {
                //Add constant text before
                if ( calExpressionStart != lastPos )
                {
                    if ( !firstToken ) newExpression += " + ";
                    newExpression += "\""+AddBackSlashBeforeQuotes(expression.substr(lastPos, calExpressionStart-lastPos))+"\"";

                    firstToken = false;
                }

                if ( !firstToken ) newExpression += " + ";

                size_t endQuotePos = expression.find( "\"", calExpressionStart+4 );
                if ( endQuotePos != string::npos ) functionName = expression.substr(calExpressionStart+4, endQuotePos-(calExpressionStart+4));

                functionName = AdaptLegacyMathExpression(functionName, game, scene);

                newExpression += "ToString("+functionName+")";
                lastPos = endQuotePos+1;
                firstToken = false;
            }

            objectExpressionStart = expression.find( "TXT\"OBJ(", lastPos );
            valExpressionStart = expression.find( "TXT\"VAL(", lastPos );
            gblExpressionStart = expression.find( "TXT\"GBL(", lastPos );
            calExpressionStart = expression.find( "CAL\"", lastPos );
        }

        //Add last constant text
        if ( expression.length() > lastPos )
        {
            if ( !firstToken ) newExpression += " + ";
            newExpression += "\""+AddBackSlashBeforeQuotes(expression.substr(lastPos, expression.length()))+"\"";
        }
    }

    return newExpression;
}

/**
 * Adapt expressions that comes from Game Develop 1.3.9262 and inferior
 * -> Transform legacy OBJ, VAL and GBL into C++ style function calls
 */
void OpenSaveGame::AdaptExpressionsFromGD139262(vector < BaseEventSPtr > & list, Game & game, Scene & scene)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int eId = 0;eId < list.size();++eId)
    {
        vector < GDExpression * > eventExpressions = list[eId]->GetAllExpressions();

        //Adapt expression of events
        for (unsigned int l = 0;l<eventExpressions.size();++l)
            *eventExpressions[l] = GDExpression(AdaptLegacyMathExpression(eventExpressions[l]->GetPlainString(), game, scene));

        vector < vector < Instruction > * > conditionsVectors = list[eId]->GetAllConditionsVectors();
        vector < vector < Instruction > * > actionsVectors = list[eId]->GetAllActionsVectors();

        //Adapt expression of conditions
        for (unsigned int i = 0;i<conditionsVectors.size();++i)
        {
        	for (unsigned int j = 0;j<conditionsVectors[i]->size();++j)
        	{
        	    unsigned int paramNb = conditionsVectors[i]->at(j).GetParameters().size();
                InstructionInfos instructionInfos = extensionsManager->GetConditionInfos(conditionsVectors[i]->at(j).GetType());

                for (unsigned int p = 0;p<paramNb;++p)
                {
                    if ( p < instructionInfos.parameters.size() && instructionInfos.parameters[p].type == "expression" )
                        conditionsVectors[i]->at(j).SetParameter(p, GDExpression(AdaptLegacyMathExpression(conditionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString(), game, scene)));
                    if ( p < instructionInfos.parameters.size() && (instructionInfos.parameters[p].type == "text" || instructionInfos.parameters[p].type == "file" || instructionInfos.parameters[p].type == "joyaxis" || instructionInfos.parameters[p].type == "color"|| instructionInfos.parameters[p].type == "layer") )
                        conditionsVectors[i]->at(j).SetParameter(p, GDExpression(AdaptLegacyTextExpression(conditionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString(), game, scene)));
                }
        	}
        }

        //Adapt expression of actions
        for (unsigned int i = 0;i<actionsVectors.size();++i)
        {
        	for (unsigned int j = 0;j<actionsVectors[i]->size();++j)
        	{
        	    unsigned int paramNb = actionsVectors[i]->at(j).GetParameters().size();
                InstructionInfos instructionInfos = extensionsManager->GetActionInfos(actionsVectors[i]->at(j).GetType());

                //Special adaptations for some actions
                if ( actionsVectors[i]->at(j).GetType() == "Create" )
                {
                    if ( actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("CAL\"") != string::npos ||
                         actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("OBJ(") != string::npos ||
                         actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("GBL(") != string::npos ||
                         actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("VAL(") != string::npos )
                    {
                        actionsVectors[i]->at(j).SetType("CreateByName");
                        instructionInfos = extensionsManager->GetActionInfos(actionsVectors[i]->at(j).GetType());
                    }
                }

                for (unsigned int p = 0;p<paramNb;++p)
                {
                    if ( p < instructionInfos.parameters.size() && instructionInfos.parameters[p].type == "expression" )
                        actionsVectors[i]->at(j).SetParameter(p, GDExpression(AdaptLegacyMathExpression(actionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString(), game, scene)));
                    if ( p < instructionInfos.parameters.size() && (instructionInfos.parameters[p].type == "text" || instructionInfos.parameters[p].type == "file" || instructionInfos.parameters[p].type == "joyaxis" || instructionInfos.parameters[p].type == "color" || instructionInfos.parameters[p].type == "layer") )
                        actionsVectors[i]->at(j).SetParameter(p, GDExpression(AdaptLegacyTextExpression(actionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString(), game, scene)));
                }
        	}
        }

        if ( list[eId]->CanHaveSubEvents() )
            AdaptExpressionsFromGD139262(list[eId]->GetSubEvents(), game, scene);
    }
}


/**
 * Adapt expressions that comes from Game Develop 1.3.9552 and inferior
 * -> Transform legacy expression from parameters of type "layers".
 */
void OpenSaveGame::AdaptExpressionsFromGD149552(vector < BaseEventSPtr > & list, Game & game, Scene & scene)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int eId = 0;eId < list.size();++eId)
    {
        vector < GDExpression * > eventExpressions = list[eId]->GetAllExpressions();

        //Adapt expression of events
        for (unsigned int l = 0;l<eventExpressions.size();++l)
            *eventExpressions[l] = GDExpression(AdaptLegacyMathExpression(eventExpressions[l]->GetPlainString(), game, scene));

        vector < vector < Instruction > * > conditionsVectors = list[eId]->GetAllConditionsVectors();
        vector < vector < Instruction > * > actionsVectors = list[eId]->GetAllActionsVectors();

        //Adapt expression of conditions
        for (unsigned int i = 0;i<conditionsVectors.size();++i)
        {
        	for (unsigned int j = 0;j<conditionsVectors[i]->size();++j)
        	{
        	    unsigned int paramNb = conditionsVectors[i]->at(j).GetParameters().size();
                InstructionInfos instructionInfos = extensionsManager->GetConditionInfos(conditionsVectors[i]->at(j).GetType());

                for (unsigned int p = 0;p<paramNb;++p)
                {
                    if ( p < instructionInfos.parameters.size() && instructionInfos.parameters[p].type == "layer")
                        conditionsVectors[i]->at(j).SetParameter(p, GDExpression(AdaptLegacyTextExpression(conditionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString(), game, scene)));
                }
        	}
        }

        //Adapt expression of actions
        for (unsigned int i = 0;i<actionsVectors.size();++i)
        {
        	for (unsigned int j = 0;j<actionsVectors[i]->size();++j)
        	{
        	    unsigned int paramNb = actionsVectors[i]->at(j).GetParameters().size();
                InstructionInfos instructionInfos = extensionsManager->GetActionInfos(actionsVectors[i]->at(j).GetType());

                //Special adaptations for some actions
                if ( actionsVectors[i]->at(j).GetType() == "Create" )
                {
                    if ( actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("CAL\"") != string::npos ||
                         actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("OBJ(") != string::npos ||
                         actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("GBL(") != string::npos ||
                         actionsVectors[i]->at(j).GetParameterSafely(0).GetPlainString().find("VAL(") != string::npos )
                    {
                        actionsVectors[i]->at(j).SetType("CreateByName");
                        instructionInfos = extensionsManager->GetActionInfos(actionsVectors[i]->at(j).GetType());
                    }
                }

                for (unsigned int p = 0;p<paramNb;++p)
                {
                    if ( p < instructionInfos.parameters.size() && instructionInfos.parameters[p].type == "layer")
                        actionsVectors[i]->at(j).SetParameter(p, GDExpression(AdaptLegacyTextExpression(actionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString(), game, scene)));
                }
        	}
        }

        if ( list[eId]->CanHaveSubEvents() )
            AdaptExpressionsFromGD149552(list[eId]->GetSubEvents(), game, scene);
    }
}

/**
 * Adapt expressions that comes from Game Develop 1.3.9262 and inferior
 * -> Transform legacy OBJ, VAL and GBL into C++ style function calls
 */
void OpenSaveGame::AdaptExpressionsFromGD149587(vector < BaseEventSPtr > & list, Game & game, Scene & scene)
{
    GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();

    for (unsigned int eId = 0;eId < list.size();++eId)
    {
        vector < GDExpression * > eventExpressions = list[eId]->GetAllExpressions();

        //Adapt expression of events
        for (unsigned int l = 0;l<eventExpressions.size();++l)
            *eventExpressions[l] = GDExpression(AdaptLegacyMathExpression(eventExpressions[l]->GetPlainString(), game, scene));

        vector < vector < Instruction > * > conditionsVectors = list[eId]->GetAllConditionsVectors();
        vector < vector < Instruction > * > actionsVectors = list[eId]->GetAllActionsVectors();

        //Adapt expression of conditions
        for (unsigned int i = 0;i<conditionsVectors.size();++i)
        {
        	for (unsigned int j = 0;j<conditionsVectors[i]->size();++j)
        	{
        	    unsigned int paramNb = conditionsVectors[i]->at(j).GetParameters().size();
                InstructionInfos instructionInfos = extensionsManager->GetConditionInfos(conditionsVectors[i]->at(j).GetType());

                for (unsigned int p = 0;p<paramNb;++p)
                {
                    if ( p < instructionInfos.parameters.size() && (instructionInfos.parameters[p].type == "text" || instructionInfos.parameters[p].type == "file" || instructionInfos.parameters[p].type == "joyaxis" || instructionInfos.parameters[p].type == "color"|| instructionInfos.parameters[p].type == "layer" || instructionInfos.parameters[p].type == "expression" ))
                    {
                        string parameter = conditionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString();
                        size_t pos = 0;
                        bool end = false;

                        while (!end)
                        {
                            size_t first = parameter.find("MouseX", pos);
                            if ( parameter.find("MouseY", pos) < first ) first = parameter.find("MouseY", pos);
                            if ( parameter.find("CameraWidth", pos) < first ) first = parameter.find("CameraWidth", pos);
                            if ( parameter.find("CameraHeight", pos) < first ) first = parameter.find("CameraHeight", pos);
                            if ( parameter.find("CameraViewportLeft", pos) < first ) first = parameter.find("CameraViewportLeft", pos);
                            if ( parameter.find("CameraViewportTop", pos) < first ) first = parameter.find("CameraViewportTop", pos);
                            if ( parameter.find("CameraViewportRight", pos) < first ) first = parameter.find("CameraViewportRight", pos);
                            if ( parameter.find("CameraViewportBottom", pos) < first ) first = parameter.find("CameraViewportBottom", pos);
                            if ( parameter.find("CameraX", pos) < first ) first = parameter.find("CameraX", pos);
                            if ( parameter.find("VueX", pos) < first ) first = parameter.find("VueX", pos);
                            if ( parameter.find("CameraY", pos) < first ) first = parameter.find("CameraY", pos);
                            if ( parameter.find("VueY", pos) < first ) first = parameter.find("VueY", pos);
                            if ( parameter.find("CameraRotation", pos) < first ) first = parameter.find("CameraRotation", pos);
                            if ( parameter.find("VueRotation", pos) < first ) first = parameter.find("VueRotation", pos);

                            if ( first != string::npos )
                            {
                                size_t endFunction = parameter.find("(", first);
                                if ( endFunction != string::npos )
                                {
                                    if ( parameter[endFunction+1] != ')')
                                    {
                                        pos = endFunction+1;
                                        parameter.insert(endFunction+1, "\"");
                                        while (pos<parameter.length() && parameter[pos] != ')' && parameter[pos] != ',')
                                            pos++;

                                        if (pos<parameter.length()) parameter.insert(pos, "\"");
                                    }
                                    else
                                        pos = endFunction+1;
                                }
                                else
                                    pos = first+1;
                            }
                            else
                                end = true;
                        }

                        conditionsVectors[i]->at(j).SetParameter(p, GDExpression(parameter));
                    }
                }
        	}
        }

        //Adapt expression of actions
        for (unsigned int i = 0;i<actionsVectors.size();++i)
        {
        	for (unsigned int j = 0;j<actionsVectors[i]->size();++j)
        	{
        	    unsigned int paramNb = actionsVectors[i]->at(j).GetParameters().size();
                InstructionInfos instructionInfos = extensionsManager->GetActionInfos(actionsVectors[i]->at(j).GetType());

                for (unsigned int p = 0;p<paramNb;++p)
                {
                    if ( p < instructionInfos.parameters.size() && (instructionInfos.parameters[p].type == "expression" || instructionInfos.parameters[p].type == "text" || instructionInfos.parameters[p].type == "file" || instructionInfos.parameters[p].type == "joyaxis" || instructionInfos.parameters[p].type == "color" || instructionInfos.parameters[p].type == "layer") )
                    {
                        string parameter = actionsVectors[i]->at(j).GetParameterSafely(p).GetPlainString();
                        size_t pos = 0;
                        bool end = false;

                        while (!end)
                        {
                            size_t first = parameter.find("MouseX", pos);
                            if ( parameter.find("MouseY", pos) < first ) first = parameter.find("MouseY", pos);
                            if ( parameter.find("CameraWidth", pos) < first ) first = parameter.find("CameraWidth", pos);
                            if ( parameter.find("CameraHeight", pos) < first ) first = parameter.find("CameraHeight", pos);
                            if ( parameter.find("CameraViewportLeft", pos) < first ) first = parameter.find("CameraViewportLeft", pos);
                            if ( parameter.find("CameraViewportTop", pos) < first ) first = parameter.find("CameraViewportTop", pos);
                            if ( parameter.find("CameraViewportRight", pos) < first ) first = parameter.find("CameraViewportRight", pos);
                            if ( parameter.find("CameraViewportBottom", pos) < first ) first = parameter.find("CameraViewportBottom", pos);
                            if ( parameter.find("CameraX", pos) < first ) first = parameter.find("CameraX", pos);
                            if ( parameter.find("VueX", pos) < first ) first = parameter.find("VueX", pos);
                            if ( parameter.find("CameraY", pos) < first ) first = parameter.find("CameraY", pos);
                            if ( parameter.find("VueY", pos) < first ) first = parameter.find("VueY", pos);
                            if ( parameter.find("CameraRotation", pos) < first ) first = parameter.find("CameraRotation", pos);
                            if ( parameter.find("VueRotation", pos) < first ) first = parameter.find("VueRotation", pos);

                            if ( first != string::npos )
                            {
                                size_t endFunction = parameter.find("(", first);
                                if ( endFunction != string::npos )
                                {
                                    if ( parameter[endFunction+1] != ')')
                                    {
                                        pos = endFunction+1;
                                        parameter.insert(endFunction+1, "\"");
                                        while (pos<parameter.length() && parameter[pos] != ')' && parameter[pos] != ',')
                                            pos++;

                                        if (pos<parameter.length()) parameter.insert(pos, "\"");
                                    }
                                    else
                                        pos = endFunction+1;
                                }
                                else
                                    pos = first+1;
                            }
                            else
                                end = true;
                        }

                        actionsVectors[i]->at(j).SetParameter(p, GDExpression(parameter));
                    }
                }
        	}
        }

        if ( list[eId]->CanHaveSubEvents() )
            AdaptExpressionsFromGD149587(list[eId]->GetSubEvents(), game, scene);
    }
}


void OpenSaveGame::OpenConditions(vector < Instruction > & conditions, const TiXmlElement * elem)
{
    const TiXmlElement * elemConditions = elem->FirstChildElement();

    //Passage en revue des conditions
    while ( elemConditions )
    {
        Instruction instruction;

        //Read type and infos
        const TiXmlElement *elemPara = elemConditions->FirstChildElement( "Type" );
        if ( elemPara != NULL )
        {
            instruction.SetType( elemPara->Attribute( "value" ));
            string LocStr = elemPara->Attribute( "loc" );
            string ContraireStr;
            if ( elemPara->Attribute( "Contraire" ) != NULL ) { ContraireStr = elemPara->Attribute( "Contraire" ); }
            else { MSG("Les informations sur le type-contraire d'un évènement manquent"); }

            instruction.SetInversion(false);
            instruction.SetLocal(true);
            if ( LocStr == "false" ) { instruction.SetLocal(false); }
            if ( ContraireStr == "true" ) { instruction.SetInversion(true); }
        }

        //Read parameters
        vector < GDExpression > parameters;
        elemPara = elemConditions->FirstChildElement("Parametre");
        while ( elemPara )
        {
            parameters.push_back( GDExpression(elemPara->Attribute( "value" )) );
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

void OpenSaveGame::OpenActions(vector < Instruction > & actions, const TiXmlElement * elem)
{
    const TiXmlElement * elemActions = elem->FirstChildElement();

    //Passage en revue des actions
    while ( elemActions )
    {
        Instruction instruction;

        //Read type and info
        const TiXmlElement *elemPara = elemActions->FirstChildElement( "Type" );
        if ( elemPara != NULL )
        {
            instruction.SetType( elemPara->Attribute( "value" ));
            string LocStr = elemPara->Attribute( "loc" );
            instruction.SetLocal(true);
            if ( LocStr == "false" ) { instruction.SetLocal(false); }
        }

        //Read parameters
        vector < GDExpression > parameters;
        elemPara = elemActions->FirstChildElement("Parametre");
        while ( elemPara )
        {
            parameters.push_back( GDExpression(elemPara->Attribute( "value" )) );
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

void OpenSaveGame::OpenLayers(vector < Layer > & list, TiXmlElement * elem)
{
    list.clear();
    TiXmlElement * elemScene = elem->FirstChildElement();

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

        TiXmlElement * elemCamera = elemScene->FirstChildElement("Camera");

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


void OpenSaveGame::OpenExternalEvents( vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * elem )
{
    list.clear();
    TiXmlElement * elemScene = elem->FirstChildElement();

    while ( elemScene )
    {
        boost::shared_ptr<ExternalEvents> externalEvents = boost::shared_ptr<ExternalEvents>(new ExternalEvents);

        string name = elemScene->Attribute( "Name" ) != NULL ? elemScene->Attribute( "Name" ) : "";
        externalEvents->SetName(name);

        if ( elemScene->FirstChildElement("Events") != NULL )
            OpenEvents(externalEvents->events, elemScene->FirstChildElement("Events"));

        list.push_back(externalEvents);
        elemScene = elemScene->NextSiblingElement();
    }
}

void OpenSaveGame::OpenVariablesList(ListVariable & list, const TiXmlElement * elem)
{
    list.Clear();
    const TiXmlElement * elemScene = elem->FirstChildElement();

    //Passage en revue des évènements
    while ( elemScene )
    {
        string name = elemScene->Attribute( "Name" ) != NULL ? elemScene->Attribute( "Name" ) : "";
        Variable & variable = list.ObtainVariable(name);

        if ( elemScene->Attribute( "Value" ) != NULL ) { variable.SetString(elemScene->Attribute( "Value" ));}
        else { MSG( "Les informations concernant la valeur d'une variable manquent." ); }

        elemScene = elemScene->NextSiblingElement();
    }
}

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
        info->SetAttribute( "value", game.name.c_str() );
        info = new TiXmlElement( "Auteur" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", game.author.c_str() );
        info = new TiXmlElement( "WindowW" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", game.windowWidth );
        info = new TiXmlElement( "WindowH" );
        infos->LinkEndChild( info );
        info->SetAttribute( "value", game.windowHeight );
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
    for (unsigned int i =0;i<game.extensionsUsed.size();++i)
    {
        TiXmlElement * extension = new TiXmlElement( "Extension" );
        extensions->LinkEndChild( extension );
        extension->SetAttribute("name", game.extensionsUsed.at(i).c_str());
    }

    info = new TiXmlElement( "FPSmax" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", game.maxFPS );
    info = new TiXmlElement( "FPSmin" );
    infos->LinkEndChild( info );
    info->SetAttribute( "value", game.minFPS );

    info = new TiXmlElement( "verticalSync" );
    infos->LinkEndChild( info );
    if ( game.verticalSync )
        info->SetAttribute( "value", "true" );
    else
        info->SetAttribute( "value", "false" );

    TiXmlElement * chargement = new TiXmlElement( "Chargement" );
    infos->LinkEndChild( chargement );

    OpenSaveLoadingScreen saveLoadingScreen(game.loadingScreen);
    saveLoadingScreen.SaveToElement(chargement);

    //Les images
    TiXmlElement * images = new TiXmlElement( "Images" );
    root->LinkEndChild( images );
    TiXmlElement * image;

    if ( !game.images.empty() )
    {
        for ( unsigned int i = 0;i < game.images.size();i++ )
        {
            image = new TiXmlElement( "Image" );
            images->LinkEndChild( image );
            image->SetAttribute( "nom", game.images.at( i ).nom.c_str() );
            image->SetAttribute( "fichier", game.images.at( i ).file.c_str() );

            if ( !game.images.at( i ).smooth )
                image->SetAttribute( "lissage", "false" );
            else
                image->SetAttribute( "lissage", "true" );

            image->SetAttribute( "alwaysLoaded", "false" );
            if ( game.images.at( i ).alwaysLoaded )
                image->SetAttribute( "alwaysLoaded", "true" );

        }
    }

    TiXmlElement * dossiers = new TiXmlElement( "DossierImages" );
    root->LinkEndChild( dossiers );
    TiXmlElement * dossier;

    for ( unsigned int i = 0;i < game.imagesFolders.size();++i )
    {

        dossier = new TiXmlElement( "Dossier" );
        dossiers->LinkEndChild( dossier );
        dossier->SetAttribute( "nom", game.imagesFolders.at( i ).nom.c_str() );

        TiXmlElement * contenu = new TiXmlElement( "Contenu" );
        dossier->LinkEndChild( contenu );
        TiXmlElement * imageDossier;

        for ( unsigned int j = 0;j < game.imagesFolders.at( i ).contenu.size();j++ )
        {
            imageDossier = new TiXmlElement( "Image" );
            contenu->LinkEndChild( imageDossier );
            imageDossier->SetAttribute( "nom", game.imagesFolders.at( i ).contenu.at(j).c_str() );
        }
    }

    //Global objects
    TiXmlElement * objects = new TiXmlElement( "Objects" );
    root->LinkEndChild( objects );
    SaveObjects(game.globalObjects, objects);

    //Global object groups
    TiXmlElement * globalObjectGroups = new TiXmlElement( "ObjectGroups" );
    root->LinkEndChild( globalObjectGroups );
    SaveGroupesObjets(game.objectGroups, globalObjectGroups);

    //Global variables
    TiXmlElement * variables = new TiXmlElement( "Variables" );
    root->LinkEndChild( variables );
    SaveVariablesList(game.variables, variables);

    //Scenes
    TiXmlElement * scenes = new TiXmlElement( "Scenes" );
    root->LinkEndChild( scenes );
    TiXmlElement * scene;

    if ( !game.scenes.empty() )
    {
        for ( unsigned int i = 0;i < game.scenes.size();i++ )
        {
            scene = new TiXmlElement( "Scene" );
            scenes->LinkEndChild( scene );
            scene->SetAttribute( "nom", game.scenes[i]->GetName().c_str() );
            scene->SetDoubleAttribute( "r", game.scenes[i]->backgroundColorR );
            scene->SetDoubleAttribute( "v", game.scenes[i]->backgroundColorG );
            scene->SetDoubleAttribute( "b", game.scenes[i]->backgroundColorB );
            scene->SetAttribute( "titre", game.scenes[i]->title.c_str() );
            scene->SetDoubleAttribute( "oglFOV", game.scenes[i]->oglFOV );
            scene->SetDoubleAttribute( "oglZNear", game.scenes[i]->oglZNear );
            scene->SetDoubleAttribute( "oglZFar", game.scenes[i]->oglZFar );
            if ( game.scenes[i]->standardSortMethod ) scene->SetAttribute( "standardSortMethod", "true" ); else scene->SetAttribute( "standardSortMethod", "false" );
            if ( game.scenes[i]->stopSoundsOnStartup ) scene->SetAttribute( "stopSoundsOnStartup", "true" ); else scene->SetAttribute( "stopSoundsOnStartup", "false" );
            #if defined(GD_IDE_ONLY)
            scene->SetDoubleAttribute( "gridWidth", game.scenes[i]->gridWidth );
            if ( game.scenes[i]->grid ) scene->SetAttribute( "grid", "true" ); else scene->SetAttribute( "grid", "false" );
            if ( game.scenes[i]->snap ) scene->SetAttribute( "snap", "true" ); else scene->SetAttribute( "snap", "false" );
            scene->SetDoubleAttribute( "gridWidth", game.scenes[i]->gridWidth );
            scene->SetDoubleAttribute( "gridHeight", game.scenes[i]->gridHeight );
            scene->SetDoubleAttribute( "gridR", game.scenes[i]->gridR );
            scene->SetDoubleAttribute( "gridG", game.scenes[i]->gridG );
            scene->SetDoubleAttribute( "gridB", game.scenes[i]->gridB );
            if ( game.scenes[i]->windowMask ) scene->SetAttribute( "windowMask", "true" ); else scene->SetAttribute( "windowMask", "false" );
            #endif

            TiXmlElement * grpsobjets = new TiXmlElement( "GroupesObjets" );
            scene->LinkEndChild( grpsobjets );
            SaveGroupesObjets(game.scenes[i]->objectGroups, grpsobjets);

            TiXmlElement * objets = new TiXmlElement( "Objets" );
            scene->LinkEndChild( objets );
            SaveObjects(game.scenes[i]->initialObjects, objets);

            TiXmlElement * layers = new TiXmlElement( "Layers" );
            scene->LinkEndChild( layers );
            SaveLayers(game.scenes[i]->initialLayers, layers);

            TiXmlElement * variables = new TiXmlElement( "Variables" );
            scene->LinkEndChild( variables );
            SaveVariablesList(game.scenes[i]->variables, variables);

            TiXmlElement * autosSharedDatas = new TiXmlElement( "AutomatismsSharedDatas" );
            scene->LinkEndChild( autosSharedDatas );
            for (boost::interprocess::flat_map<unsigned int, boost::shared_ptr<AutomatismsSharedDatas> >::const_iterator it = game.scenes[i]->automatismsInitialSharedDatas.begin();
                 it != game.scenes[i]->automatismsInitialSharedDatas.end();++it)
            {
                TiXmlElement * autoSharedDatas = new TiXmlElement( "AutomatismSharedDatas" );
                autosSharedDatas->LinkEndChild( autoSharedDatas );

                autoSharedDatas->SetAttribute("Type", it->second->GetTypeName().c_str());
                autoSharedDatas->SetAttribute("Name", it->second->GetName().c_str());
                it->second->SaveToXml(autoSharedDatas);
            }

            if ( !game.scenes[i]->initialObjectsPositions.empty() )
            {
                TiXmlElement * positions = new TiXmlElement( "Positions" );
                scene->LinkEndChild( positions );

                SavePositions(game.scenes[i]->initialObjectsPositions, positions);
            }

            //Evènements
            if ( !game.scenes[i]->events.empty() )
            {
                TiXmlElement * events = new TiXmlElement( "Events" );
                scene->LinkEndChild( events );

                SaveEvents(game.scenes[i]->events, events);
            }

        }
    }

    //External events
    TiXmlElement * externalEvents = new TiXmlElement( "ExternalEvents" );
    root->LinkEndChild( externalEvents );
    SaveExternalEvents(game.externalEvents, externalEvents);

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

        GDpriv::ExtensionsManager * extensionsManager = GDpriv::ExtensionsManager::GetInstance();
        objet->SetAttribute( "type", extensionsManager->GetStringFromTypeId(list.at( j )->GetTypeId()).c_str() );

        TiXmlElement * variables = new TiXmlElement( "Variables" );
        objet->LinkEndChild( variables );
        SaveVariablesList(list.at( j )->variablesObjet, variables);

        vector <unsigned int > allAutomatisms = list[j]->GetAllAutomatismsNameIdentifiers();
        for (unsigned int i = 0;i<allAutomatisms.size();++i)
        {
            TiXmlElement * automatism = new TiXmlElement( "Automatism" );
            objet->LinkEndChild( automatism );
            automatism->SetAttribute( "Type", list[j]->GetAutomatism(allAutomatisms[i])->GetTypeName().c_str() );
            automatism->SetAttribute( "Name", list[j]->GetAutomatism(allAutomatisms[i])->GetName().c_str() );

            list[j]->GetAutomatism(allAutomatisms[i])->SaveToXml(automatism);
        }

        list[j]->SaveToXml(objet);
    }
}

void OpenSaveGame::SaveGroupesObjets(const vector < ObjectGroup > & list, TiXmlElement * grpsobjets)
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

void OpenSaveGame::SavePositions(const vector < InitialPosition > & list, TiXmlElement * positions)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        TiXmlElement * objet = new TiXmlElement( "Objet" );
        positions->LinkEndChild( objet );
        objet->SetAttribute( "nom", list.at( j ).objectName.c_str() );
        objet->SetDoubleAttribute( "x", list.at( j ).x );
        objet->SetDoubleAttribute( "y", list.at( j ).y );
        objet->SetAttribute( "plan", list.at( j ).zOrder );
        objet->SetAttribute( "layer", list.at( j ).layer.c_str() );
        objet->SetDoubleAttribute( "angle", list.at( j ).angle );

        objet->SetAttribute( "personalizedSize", "false" );
        if ( list.at( j ).personalizedSize )
            objet->SetAttribute( "personalizedSize", "true" );

        objet->SetDoubleAttribute( "width", list.at( j ).width );
        objet->SetDoubleAttribute( "height", list.at( j ).height );

        TiXmlElement * floatInfos = new TiXmlElement( "floatInfos" );
        objet->LinkEndChild( floatInfos );

        for(map<string, float>::const_iterator floatInfo = list[j].floatInfos.begin(); floatInfo != list[j].floatInfos.end(); ++floatInfo)
        {
            TiXmlElement * info = new TiXmlElement( "Info" );
            floatInfos->LinkEndChild( info );
            info->SetAttribute( "name", floatInfo->first.c_str());
            info->SetDoubleAttribute( "value", floatInfo->second);
        }

        TiXmlElement * stringInfos = new TiXmlElement( "stringInfos" );
        objet->LinkEndChild( stringInfos );

        for(map<string, string>::const_iterator stringInfo = list[j].stringInfos.begin(); stringInfo != list[j].stringInfos.end(); ++stringInfo)
        {
            TiXmlElement * info = new TiXmlElement( "Info" );
            stringInfos->LinkEndChild( info );
            info->SetAttribute( "name", stringInfo->first.c_str());
            info->SetAttribute( "value", stringInfo->second.c_str());
        }
    }
}

void OpenSaveGame::SaveEvents(const vector < BaseEventSPtr > & list, TiXmlElement * events)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        //Pour chaque évènements
        TiXmlElement * event;

        event = new TiXmlElement( "Event" );
        event->SetAttribute( "disabled", list[j]->IsDisabled() ? "true" : "false" );
        events->LinkEndChild( event );

        TiXmlElement * type = new TiXmlElement( "Type" );
        event->LinkEndChild( type );
        type->SetAttribute( "value", list[j]->GetType().c_str() );

        list[j]->SaveToXml(event);
    }
}

void OpenSaveGame::SaveActions(const vector < Instruction > & list, TiXmlElement * actions)
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
        if ( list[k].IsLocal() ) { typeAction->SetAttribute( "loc", "true" ); }
        else { typeAction->SetAttribute( "loc", "false" ); }


        //Les autres paramètres
        for ( unsigned int l = 0;l < list[k].GetParameters().size();l++ )
        {
            TiXmlElement * Parametre = new TiXmlElement( "Parametre" );
            action->LinkEndChild( Parametre );
            Parametre->SetAttribute( "value", list[k].GetParameterSafely( l ).GetPlainString().c_str() );
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

void OpenSaveGame::SaveConditions(const vector < Instruction > & list, TiXmlElement * conditions)
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
        if ( list[k].IsLocal() ) { typeCondition->SetAttribute( "loc", "true" ); }
        else { typeCondition->SetAttribute( "loc", "false" ); }
        if ( list[k].IsInverted() ) { typeCondition->SetAttribute( "Contraire", "true" ); }
        else { typeCondition->SetAttribute( "Contraire", "false" ); }

        //Les autres paramètres
        for ( unsigned int l = 0;l < list[k].GetParameters().size();l++ )
        {
            TiXmlElement * Parametre = new TiXmlElement( "Parametre" );
            condition->LinkEndChild( Parametre );
            Parametre->SetAttribute( "value", list[k].GetParameterSafely( l ).GetPlainString().c_str() );
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

void OpenSaveGame::SaveVariablesList(const ListVariable & list, TiXmlElement * elem)
{
    vector<Variable> variables = list.GetVariablesVector();
    for ( unsigned int j = 0;j < variables.size();j++ )
    {
        TiXmlElement * variable = new TiXmlElement( "Variable" );
        elem->LinkEndChild( variable );

        variable->SetAttribute("Name", variables[j].GetName().c_str());
        variable->SetAttribute("Value", variables[j].GetString().c_str());
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
        SaveEvents(list[j]->events, events);
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

    ResourcesUnmergingHelper resourcesUnmergingHelper(newDirectory);

    //Image du chargement
    if ( !game.loadingScreen.imageFichier.empty() )
        game.loadingScreen.imageFichier = resourcesUnmergingHelper.GetNewFilename(game.loadingScreen.imageFichier);


    //Images : copie et enlève le répertoire des chemins
    for ( unsigned int i = 0;i < game.images.size() ;i++ )
        game.images.at( i ).file = resourcesUnmergingHelper.GetNewFilename(game.images.at( i ).file);

    //Add scenes resources
    for ( unsigned int i = 0;i < game.scenes.size();i++ )
    {
        for (unsigned int j = 0;j<game.scenes[i]->initialObjects.size();++j) //Add objects resources
        	game.scenes[i]->initialObjects[j]->PrepareResourcesForMerging(resourcesUnmergingHelper);

        InventoryEventsResources(game, game.scenes[i]->events, resourcesUnmergingHelper);
    }
    for (unsigned int j = 0;j<game.globalObjects.size();++j) //Add global objects resources
        game.globalObjects[j]->PrepareResourcesForMerging(resourcesUnmergingHelper);
#endif //GDE
}
