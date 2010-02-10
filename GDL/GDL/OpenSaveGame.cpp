/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  OpenSaveGame.cpp
 *
 *  Ouvre un jeu et le stocke dans un Game.
 */

#ifdef GDP
    #define MSG(x) EcrireLog("Chargement", x); //Macro pour rapporter des erreurs
    #define MSGERR(x) EcrireLog("Chargement, erreur", x);

    #ifndef _
    #define _(x) x // "Emule" la macro de WxWidgets
    #endif
#endif
#ifdef GDE
    #include <wx/wx.h>
    #include "GDL/StdAlgo.h"
    #define MSG(x) wxLogWarning(x);          // Utiliser WxWidgets pour
    #define MSGERR(x) wxLogError(x.c_str()); // afficher les messages dans l'éditeur
    #define ToString(x) st(x) // Méthode de conversion int vers string
#endif

#include <string>
#include "GDL/OpenSaveGame.h"
#include "GDL/tinyxml.h"

#include "GDL/algo.h"
#include "GDL/Game.h"
#include "GDL/Scene.h"
#include "GDL/Object.h"
#include "GDL/constantes.h"
#include "GDL/Animation.h"
#include "GDL/Position.h"
#include "GDL/Event.h"
#include "GDL/Instruction.h"
#include "GDL/VersionWrapper.h"
#include "GDL/ExtensionsLoader.h"
#include "GDL/Layer.h"
#include "GDL/OpenSaveLoadingScreen.h"
#include "GDL/ExtensionsManager.h"
#include <boost/shared_ptr.hpp>

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
void OpenSaveGame::OpenFromFile(string file)
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(file.c_str()) )
    {
#ifdef GDP
        string ErrorDescription = doc.ErrorDesc();
        string Error =  "Erreur lors du chargement : " + ErrorDescription + _("\nVérifiez que le fichier existe et que vous possédez les droits suffisants pour y accéder.");
#endif
#ifdef GDE
        wxString ErrorDescription = doc.ErrorDesc();
        wxString Error = _( "Erreur lors du chargement : " ) + ErrorDescription + _("\nVérifiez que le fichier existe et que vous possédez les droits suffisants pour y accéder.");
#endif
        MSGERR( Error );
        return;
    }

    OpenDocument(doc);

    //Vérification de la portabilité du jeu
    if ( game.portable )
        RecreatePaths(file);
    game.portable = false;
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
        if ( build > GDLVersionWrapper::Build() || minor > GDLVersionWrapper::Minor() || revision > GDLVersionWrapper::Revision() )
        {
            MSG( _( "La version de l'éditeur utilisé pour créer ce jeu semble être supérieure.\nLe jeu peut donc ne pas s'ouvrir, ou des données peuvent manquer.\nVous devriez vérifier si une nouvelle version de Game Develop est disponible." ) );
        }
    }

    //Compatibility with version with no extension
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
        game.extensionsUsed.push_back("BuiltinInterface");
        game.extensionsUsed.push_back("BuiltinJoystick");
        game.extensionsUsed.push_back("BuiltinKeyboard");
        game.extensionsUsed.push_back("BuiltinMouse");
        game.extensionsUsed.push_back("BuiltinNetwork");
        game.extensionsUsed.push_back("BuiltinWindow");
        game.extensionsUsed.push_back("BuiltinTime");
    }

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

    //Global variables
    elem = hdl.FirstChildElement().FirstChildElement( "Variables" ).Element();
    if ( elem )
        OpenVariablesList(game.variables, elem);

    //Scenes du jeu
    elem = hdl.FirstChildElement().FirstChildElement( "Scenes" ).Element();
    if ( elem == NULL ) { MSG( "Les informations concernant les scenes manquent" ); }
    game.m_scenes.clear();

    elem = hdl.FirstChildElement().FirstChildElement( "Scenes" ).FirstChildElement().Element();
    while ( elem )
    {
        //Scene vide
        Scene newScene;

        //Nom
        if ( elem->Attribute( "nom" ) != NULL ) { newScene.name = elem->Attribute( "nom" );}
        else { MSG( "Les informations concernant le nom de la scene manquent." ); }
        if ( elem->Attribute( "r" ) != NULL ) { int value;elem->QueryIntAttribute( "r", &value ); newScene.backgroundColorR = value;}
        else { MSG( "Les informations concernant la couleur de fond de la scene manquent." ); }
        if ( elem->Attribute( "v" ) != NULL ) { int value;elem->QueryIntAttribute( "v", &value ); newScene.backgroundColorG = value;}
        else { MSG( "Les informations concernant la couleur de fond de la scene manquent." ); }
        if ( elem->Attribute( "b" ) != NULL ) { int value;elem->QueryIntAttribute( "b", &value ); newScene.backgroundColorB = value;}
        else { MSG( "Les informations concernant la couleur de fond de la scene manquent." ); }
        if ( elem->Attribute( "titre" ) != NULL ) { newScene.title = elem->Attribute( "titre" );}
        else { MSG( "Les informations concernant le titre de la fenêtre de la scene manquent." ); }

        if ( elem->FirstChildElement( "GroupesObjets" ) != NULL )
            OpenGroupesObjets(newScene.objectGroups, elem->FirstChildElement( "GroupesObjets" ));

        if ( elem->FirstChildElement( "Objets" ) != NULL )
            OpenObjects(newScene.objetsInitiaux, elem->FirstChildElement( "Objets" ));

        if ( elem->FirstChildElement( "Positions" ) != NULL )
            OpenPositions(newScene.positionsInitiales, elem->FirstChildElement( "Positions" ));

        if ( elem->FirstChildElement( "Layers" ) != NULL )
            OpenLayers(newScene.layers, elem->FirstChildElement( "Layers" ));

        if ( elem->FirstChildElement( "Events" ) != NULL )
            OpenEvents(newScene.events, elem->FirstChildElement( "Events" ));

        if ( elem->FirstChildElement( "Variables" ) != NULL )
            OpenVariablesList(newScene.variables, elem->FirstChildElement( "Variables" ));

        //Ajout de la scène et suppression de la mémoire de celle ci
        game.m_scenes.push_back( newScene );

        elem = elem->NextSiblingElement();
    }

    if ( notBackwardCompatible )
    {
        MSG( _("Attention, si vous enregistrez votre jeu avec cette version de Game Develop, vous ne pourrez plus le réouvrir avec une version précédente.") );
    }

    return;
}

void OpenSaveGame::OpenGameInformations(TiXmlElement * elem)
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
        TiXmlElement * extensionsElem = elem->FirstChildElement( "Extensions" )->FirstChildElement();
        while (extensionsElem)
        {
            if ( extensionsElem->Attribute("name") )
                game.extensionsUsed.push_back(extensionsElem->Attribute("name"));

            extensionsElem = extensionsElem->NextSiblingElement();
        }
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
        if ( imagesElem->Attribute( "fichier" ) != NULL ) {imageToAdd.fichier = imagesElem->Attribute( "fichier" ); }
        else { MSG( "Les informations concernant le fichier de l'image manquent." ); }

        imageToAdd.lissage = true;
        if ( imagesElem->Attribute( "lissage" ) != NULL )
        {
            if ( strcmp(imagesElem->Attribute( "lissage" ), "false") == 0 )
                imageToAdd.lissage = false;
        }

        game.images.push_back(imageToAdd);
        imagesElem = imagesElem->NextSiblingElement();
    }

    //Dossiers d'images
    game.dossierImages.clear();
    while ( dossierElem )
    {
        Dossier dossierToAdd;

        if ( dossierElem->Attribute( "nom" ) != NULL ) { dossierToAdd.nom =  dossierElem->Attribute( "nom" ); }
        else { MSG( "Les informations concernant le nom d'un dossier d'images manquent." ); }

        //On vérifie que le dossier n'existe pas plusieurs fois.
        //Notamment pour purger les fichiers qui ont eu des dossiers dupliqués suite à un bug
        //27/04/09
        bool alreadyexist = false;
        for (unsigned int i =0;i<game.dossierImages.size();++i)
        {
        	if ( dossierToAdd.nom == game.dossierImages.at(i).nom )
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

            game.dossierImages.push_back( dossierToAdd );
        }

        dossierElem = dossierElem->NextSiblingElement();
    }
}

void OpenSaveGame::OpenObjects(vector < boost::shared_ptr<Object> > & objects, TiXmlElement * elem)
{
    TiXmlElement * elemScene = elem->FirstChildElement("Objet");

    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();


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

void OpenSaveGame::OpenEvents(vector < Event > & list, TiXmlElement * elem)
{
    TiXmlElement * elemScene = elem->FirstChildElement();

    //Passage en revue des évènements
    while ( elemScene )
    {
        Event EventToAdd;
        if ( elemScene->FirstChildElement( "Type" )->Attribute( "value" ) != NULL ) { EventToAdd.type = elemScene->FirstChildElement( "Type" )->Attribute( "value" );}
        else { MSG( "Les informations concernant le type d'un évènement manquent." ); }

        if ( EventToAdd.type == "Commentaire" )
        {
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "r" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "r", &value ); EventToAdd.r = value;}
            else { MSG( "Les informations concernant la couleur d'un commentaire manquent." ); }
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "v" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "v", &value ); EventToAdd.v = value;}
            else { MSG( "Les informations concernant la couleur d'un commentaire manquent." ); }
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "b" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "b", &value ); EventToAdd.b = value;}
            else { MSG( "Les informations concernant la couleur d'un commentaire manquent." ); }
            if ( elemScene->FirstChildElement( "Com1" )->Attribute( "value" ) != NULL ) { EventToAdd.com1 = elemScene->FirstChildElement( "Com1" )->Attribute( "value" );}
            else { MSG( "Les informations concernant le texte 1 d'un commentaire manquent." ); }
            if ( elemScene->FirstChildElement( "Com2" )->Attribute( "value" ) != NULL ) { EventToAdd.com2 = elemScene->FirstChildElement( "Com2" )->Attribute( "value" );}
            else { MSG( "Les informations concernant le texte 2 d'un commentaire manquent." ); }

        }
        else if ( EventToAdd.type == "Dossier" )
        {
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "r" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "r", &value ); EventToAdd.r = value;}
            else { MSG( "Les informations concernant la couleur d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "v" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "v", &value ); EventToAdd.v = value;}
            else { MSG( "Les informations concernant la couleur d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "b" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "b", &value ); EventToAdd.b = value;}
            else { MSG( "Les informations concernant la couleur d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Com1" )->Attribute( "value" ) != NULL ) { EventToAdd.com1 = elemScene->FirstChildElement( "Com1" )->Attribute( "value" );}
            else { MSG( "Les informations concernant le nom d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Com2" )->Attribute( "value" ) != NULL ) { EventToAdd.com2 = elemScene->FirstChildElement( "Com2" )->Attribute( "value" );}
            else { MSG( "Les informations concernant le texte d'un dossier manquent." ); }

            if ( elemScene->FirstChildElement( "Events" ) != NULL )
            {
                OpenEvents(EventToAdd.events, elemScene->FirstChildElement( "Events" ));
            }

        }
        else if ( EventToAdd.type == "DossierFin" )
        {
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "r" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "r", &value ); EventToAdd.r = value;}
            else { MSG( "Les informations concernant la couleur d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "v" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "v", &value ); EventToAdd.v = value;}
            else { MSG( "Les informations concernant la couleur d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Couleur" )->Attribute( "b" ) != NULL ) { int value;elemScene->FirstChildElement( "Couleur" )->QueryIntAttribute( "b", &value ); EventToAdd.b = value;}
            else { MSG( "Les informations concernant la couleur d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Com1" )->Attribute( "value" ) != NULL ) { EventToAdd.com1 = elemScene->FirstChildElement( "Com1" )->Attribute( "value" );}
            else { MSG( "Les informations concernant le nom d'un dossier manquent." ); }
            if ( elemScene->FirstChildElement( "Com2" )->Attribute( "value" ) != NULL ) { EventToAdd.com2 = elemScene->FirstChildElement( "Com2" )->Attribute( "value" );}
            else { MSG( "Les informations concernant le texte d'un dossier manquent." ); }

        }
        else if ( EventToAdd.type == "Link" )
        {
            if ( elemScene->FirstChildElement( "Limites" )->Attribute( "start" ) != NULL ) { int value;elemScene->FirstChildElement( "Limites" )->QueryIntAttribute( "start", &value ); EventToAdd.start = value;}
            else { MSG( "Les informations concernant le départ d'un lien manquent." ); }
            if ( elemScene->FirstChildElement( "Limites" )->Attribute( "end" ) != NULL ) { int value;elemScene->FirstChildElement( "Limites" )->QueryIntAttribute( "end", &value ); EventToAdd.end = value;}
            else { MSG( "Les informations concernant la fin d'un lien manquent." ); }
            if ( elemScene->FirstChildElement( "Scene" )->Attribute( "value" ) != NULL ) { EventToAdd.sceneLinked = elemScene->FirstChildElement( "Scene" )->Attribute( "value" );}
            else { MSG( "Les informations concernant le nom de la scène liée." ); }

        }
        else
        {
            //Conditions
            TiXmlElement *elemConditions = elemScene->FirstChildElement( "Conditions" );
            if ( elemConditions != NULL )
            {
                elemConditions = elemConditions->FirstChildElement();

                //Passage en revue des conditions
                while ( elemConditions )
                {
                    Instruction instruction;

                    TiXmlElement *elemPara = elemConditions->FirstChildElement( "Type" );
                    if ( elemPara != NULL )
                    {

                        //Le premier "paramètre" est toujours le type
                        instruction.SetType( elemPara->Attribute( "value" ));
                        string LocStr = elemPara->Attribute( "loc" );
                        string ContraireStr;
                        if ( elemPara->Attribute( "Contraire" ) != NULL ) { ContraireStr = elemPara->Attribute( "Contraire" ); }
                        else { MSG("Les informations sur le type-contraire d'un évènement manquent"); }

                        instruction.SetInversion(false);
                        instruction.SetLocal(true);
                        if ( LocStr == "false" ) { instruction.SetLocal(false); }
                        if ( ContraireStr == "true" ) { instruction.SetInversion(true); }

                        vector < GDExpression > Para;

                        elemPara = elemPara->NextSiblingElement();
                        while ( elemPara )
                        {
                            string Parametre = elemPara->Attribute( "value" );
                            Para.push_back( GDExpression(Parametre) );

                            elemPara = elemPara->NextSiblingElement();
                        }

                        instruction.SetParameters( Para );

                        EventToAdd.conditions.push_back( instruction );

                    }
                    else { MSG( _( "Aucune informations sur les paramètres d'une condition d'un évènement" ) ); }

                    elemConditions = elemConditions->NextSiblingElement();
                }
            }
            else { MSG( _( "Aucune informations sur les conditions d'un évènement" ) ); }

            //Actions
            TiXmlElement *elemActions = elemScene->FirstChildElement( "Actions" );
            if ( elemActions != NULL )
            {
                elemActions = elemActions->FirstChildElement();

                //Passage en revue des actions
                while ( elemActions )
                {
                    Instruction instruction;

                    TiXmlElement *elemPara = elemActions->FirstChildElement( "Type" );
                    if ( elemPara != NULL )
                    {

                        //Le premier "paramètre" est toujours le type
                        instruction.SetType( elemPara->Attribute( "value" ));
                        string LocStr = elemPara->Attribute( "loc" );
                        vector < GDExpression > Para;
                        instruction.SetLocal(true);
                        if ( LocStr == "false" ) { instruction.SetLocal(false); }


                        elemPara = elemPara->NextSiblingElement();
                        while ( elemPara )
                        {
                            string parameter = elemPara->Attribute( "value" );
                            Para.push_back( GDExpression(parameter) );

                            elemPara = elemPara->NextSiblingElement();
                        }

                        instruction.SetParameters(Para);
                        EventToAdd.actions.push_back(instruction);

                    }
                    else { MSG( _( "Aucune informations sur les paramètres d'une action d'un évènement" ) ); }

                    elemActions = elemActions->NextSiblingElement();
                }
            }
            else { MSG( _( "Aucune informations sur les actions d'un évènement" ) ); }

            //Sous évènements
            if ( elemScene->FirstChildElement( "Events" ) != NULL )
            {
                OpenEvents(EventToAdd.events, elemScene->FirstChildElement( "Events" ));
            }
        }

        list.push_back( EventToAdd );
        elemScene = elemScene->NextSiblingElement();
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

        list.push_back( layer );
        elemScene = elemScene->NextSiblingElement();
    }
}

void OpenSaveGame::OpenVariablesList(ListVariable & list, const TiXmlElement * elem)
{
    list.variables.clear();
    const TiXmlElement * elemScene = elem->FirstChildElement();

    //Passage en revue des évènements
    while ( elemScene )
    {
        string name = "";
        if ( elemScene->Attribute( "Name" ) != NULL ) { name = (elemScene->Attribute( "Name" ));}
        else { MSG( "Les informations concernant le nom d'une variable manquent." ); }

        Variable variable(name);

        if ( elemScene->Attribute( "Value" ) != NULL ) { variable.Settexte(elemScene->Attribute( "Value" ));}
        else { MSG( "Les informations concernant la valeur d'une variable manquent." ); }

        list.variables.push_back( variable );
        elemScene = elemScene->NextSiblingElement();
    }
}

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
            image->SetAttribute( "fichier", game.images.at( i ).fichier.c_str() );

            if ( !game.images.at( i ).lissage )
            {
                image->SetAttribute( "lissage", "false" );
            }
            else
            {
                image->SetAttribute( "lissage", "true" );
            }

        }
    }

    TiXmlElement * dossiers = new TiXmlElement( "DossierImages" );
    root->LinkEndChild( dossiers );
    TiXmlElement * dossier;

    for ( unsigned int i = 0;i < game.dossierImages.size();++i )
    {

        dossier = new TiXmlElement( "Dossier" );
        dossiers->LinkEndChild( dossier );
        dossier->SetAttribute( "nom", game.dossierImages.at( i ).nom.c_str() );

        TiXmlElement * contenu = new TiXmlElement( "Contenu" );
        dossier->LinkEndChild( contenu );
        TiXmlElement * imageDossier;

        for ( unsigned int j = 0;j < game.dossierImages.at( i ).contenu.size();j++ )
        {
            imageDossier = new TiXmlElement( "Image" );
            contenu->LinkEndChild( imageDossier );
            imageDossier->SetAttribute( "nom", game.dossierImages.at( i ).contenu.at(j).c_str() );
        }
    }

    //Global objects
    TiXmlElement * objects = new TiXmlElement( "Objects" );
    root->LinkEndChild( objects );
    SaveObjects(game.globalObjects, objects);

    //Global variables
    TiXmlElement * variables = new TiXmlElement( "Variables" );
    root->LinkEndChild( variables );
    SaveVariablesList(game.variables, variables);

    //Les scènes
    TiXmlElement * scenes = new TiXmlElement( "Scenes" );
    root->LinkEndChild( scenes );
    TiXmlElement * scene;

    if ( !game.m_scenes.empty() )
    {
        for ( unsigned int i = 0;i < game.m_scenes.size();i++ )
        {
            scene = new TiXmlElement( "Scene" );
            scenes->LinkEndChild( scene );
            scene->SetAttribute( "nom", game.m_scenes.at( i ).name.c_str() );
            scene->SetDoubleAttribute( "r", game.m_scenes.at( i ).backgroundColorR );
            scene->SetDoubleAttribute( "v", game.m_scenes.at( i ).backgroundColorG );
            scene->SetDoubleAttribute( "b", game.m_scenes.at( i ).backgroundColorB );
            scene->SetAttribute( "titre", game.m_scenes.at( i ).title.c_str() );

            if ( !game.m_scenes.at( i ).objectGroups.empty() )
            {
                TiXmlElement * grpsobjets = new TiXmlElement( "GroupesObjets" );
                scene->LinkEndChild( grpsobjets );

                SaveGroupesObjets(game.m_scenes.at( i ).objectGroups, grpsobjets);
            }

            TiXmlElement * objets = new TiXmlElement( "Objets" );
            scene->LinkEndChild( objets );
            SaveObjects(game.m_scenes.at( i ).objetsInitiaux, objets);

            TiXmlElement * layers = new TiXmlElement( "Layers" );
            scene->LinkEndChild( layers );
            SaveLayers(game.m_scenes.at( i ).layers, layers);

            TiXmlElement * variables = new TiXmlElement( "Variables" );
            scene->LinkEndChild( variables );
            SaveVariablesList(game.m_scenes.at( i ).variables, variables);

            if ( !game.m_scenes.at( i ).positionsInitiales.empty() )
            {
                TiXmlElement * positions = new TiXmlElement( "Positions" );
                scene->LinkEndChild( positions );

                SavePositions(game.m_scenes.at( i ).positionsInitiales, positions);
            }

            //Evènements
            if ( !game.m_scenes.at( i ).events.empty() )
            {
                TiXmlElement * events = new TiXmlElement( "Events" );
                scene->LinkEndChild( events );

                SaveEvents(game.m_scenes.at( i ).events, events);
            }

        }
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

        gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();
        objet->SetAttribute( "type", extensionsManager->GetStringFromTypeId(list.at( j )->GetTypeId()).c_str() );

        TiXmlElement * variables = new TiXmlElement( "Variables" );
        objet->LinkEndChild( variables );
        SaveVariablesList(list.at( j )->variablesObjet, variables);

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

        for ( unsigned int k = 0;k < list.at(j).Getobjets().size();k++ )
        {
            TiXmlElement * objet;

            objet = new TiXmlElement( "Objet" );
            grp->LinkEndChild( objet );
            objet->SetAttribute( "nom", list.at( j ).Getobjets().at(k).c_str() );
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
        objet->SetAttribute( "x", list.at( j ).x );
        objet->SetAttribute( "y", list.at( j ).y );
        objet->SetAttribute( "plan", list.at( j ).zOrder );
        objet->SetAttribute( "layer", list.at( j ).layer.c_str() );
        objet->SetAttribute( "angle", list.at( j ).angle );

        objet->SetAttribute( "personalizedSize", "false" );
        if ( list.at( j ).personalizedSize )
            objet->SetAttribute( "personalizedSize", "true" );

        objet->SetAttribute( "width", list.at( j ).width );
        objet->SetAttribute( "height", list.at( j ).height );

        TiXmlElement * floatInfos = new TiXmlElement( "floatInfos" );
        objet->LinkEndChild( floatInfos );

        for(map<string, float>::const_iterator floatInfo = list[j].floatInfos.begin(); floatInfo != list[j].floatInfos.end(); ++floatInfo)
        {
            TiXmlElement * info = new TiXmlElement( "Info" );
            floatInfos->LinkEndChild( info );
            info->SetAttribute( "name", floatInfo->first.c_str());
            info->SetAttribute( "value", floatInfo->second);
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

void OpenSaveGame::SaveEvents(const vector < Event > & list, TiXmlElement * events)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        //Pour chaque évènements
        TiXmlElement * event;

        event = new TiXmlElement( "Event" );
        events->LinkEndChild( event );

        //Le type
        TiXmlElement * type;
        type = new TiXmlElement( "Type" );
        event->LinkEndChild( type );
        type->SetAttribute( "value", list.at( j ).type.c_str() );

        if ( list.at( j ).type == "Commentaire" )
        {
            //Enregistrement du commentaire
            TiXmlElement * couleur;
            couleur = new TiXmlElement( "Couleur" );
            event->LinkEndChild( couleur );

            couleur->SetDoubleAttribute( "r", list.at( j ).r );
            couleur->SetDoubleAttribute( "v", list.at( j ).v );
            couleur->SetDoubleAttribute( "b", list.at( j ).b );

            TiXmlElement * com1;
            com1 = new TiXmlElement( "Com1" );
            event->LinkEndChild( com1 );
            com1->SetAttribute( "value", list.at( j ).com1.c_str() );

            TiXmlElement * com2;
            com2 = new TiXmlElement( "Com2" );
            event->LinkEndChild( com2 );
            com2->SetAttribute( "value", list.at( j ).com2.c_str() );

        }
        else if ( list.at( j ).type == "Dossier" )
        {
            //Enregistrement du commentaire
            TiXmlElement * couleur;
            couleur = new TiXmlElement( "Couleur" );
            event->LinkEndChild( couleur );

            couleur->SetDoubleAttribute( "r", list.at( j ).r );
            couleur->SetDoubleAttribute( "v", list.at( j ).v );
            couleur->SetDoubleAttribute( "b", list.at( j ).b );

            TiXmlElement * com1;
            com1 = new TiXmlElement( "Com1" );
            event->LinkEndChild( com1 );
            com1->SetAttribute( "value", list.at( j ).com1.c_str() );

            TiXmlElement * com2;
            com2 = new TiXmlElement( "Com2" );
            event->LinkEndChild( com2 );
            com2->SetAttribute( "value", list.at( j ).com2.c_str() );

        }
        else if ( list.at( j ).type == "DossierFin" )
        {
            //Enregistrement du commentaire
            TiXmlElement * couleur;
            couleur = new TiXmlElement( "Couleur" );
            event->LinkEndChild( couleur );

            couleur->SetDoubleAttribute( "r", list.at( j ).r );
            couleur->SetDoubleAttribute( "v", list.at( j ).v );
            couleur->SetDoubleAttribute( "b", list.at( j ).b );

            TiXmlElement * com1;
            com1 = new TiXmlElement( "Com1" );
            event->LinkEndChild( com1 );
            com1->SetAttribute( "value", list.at( j ).com1.c_str() );

            TiXmlElement * com2;
            com2 = new TiXmlElement( "Com2" );
            event->LinkEndChild( com2 );
            com2->SetAttribute( "value", list.at( j ).com2.c_str() );

        }
        else if ( list.at( j ).type == "Link" )
        {
            //Enregistrement du commentaire
            TiXmlElement * couleur;
            couleur = new TiXmlElement( "Limites" );
            event->LinkEndChild( couleur );

            couleur->SetDoubleAttribute( "start", list.at( j ).start );
            couleur->SetDoubleAttribute( "end", list.at( j ).end );

            TiXmlElement * com1;
            com1 = new TiXmlElement( "Scene" );
            event->LinkEndChild( com1 );
            com1->SetAttribute( "value", list.at( j ).sceneLinked.c_str() );

        }
        else
        {

            TiXmlElement * conditions;

            //Les conditions
            conditions = new TiXmlElement( "Conditions" );
            event->LinkEndChild( conditions );
            if ( !list.at( j ).conditions.empty() )
            {

                for ( unsigned int k = 0;k < list.at( j ).conditions.size();k++ )
                {
                    //Pour chaque condition
                    TiXmlElement * condition;

                    condition = new TiXmlElement( "Condition" );
                    conditions->LinkEndChild( condition );

                    //Le type
                    TiXmlElement * typeCondition;
                    typeCondition = new TiXmlElement( "Type" );
                    condition->LinkEndChild( typeCondition );

                    typeCondition->SetAttribute( "value", list.at( j ).conditions.at( k ).GetType().c_str() );
                    if ( list.at( j ).conditions.at( k ).IsLocal() ) { typeCondition->SetAttribute( "loc", "true" ); }
                    else { typeCondition->SetAttribute( "loc", "false" ); }
                    if ( list.at( j ).conditions.at( k ).IsInverted() ) { typeCondition->SetAttribute( "Contraire", "true" ); }
                    else { typeCondition->SetAttribute( "Contraire", "false" ); }


                    //Les autres paramètres
                    for ( unsigned int l = 0;l < list.at( j ).conditions.at( k ).GetParameters().size();l++ )
                    {
                        TiXmlElement * Parametre = new TiXmlElement( "Parametre" );
                        condition->LinkEndChild( Parametre );
                        Parametre->SetAttribute( "value", list.at( j ).conditions.at( k ).GetParameter( l ).GetPlainString().c_str() );
                    }
                }
            }

            //Les actions
            TiXmlElement * actions;
            actions = new TiXmlElement( "Actions" );
            event->LinkEndChild( actions );
            if ( !list.at( j ).actions.empty() )
            {
                for ( unsigned int k = 0;k < list.at( j ).actions.size();k++ )
                {
                    //Pour chaque condition
                    TiXmlElement * action;

                    action = new TiXmlElement( "Action" );
                    actions->LinkEndChild( action );

                    //Le type
                    TiXmlElement * typeAction;
                    typeAction = new TiXmlElement( "Type" );
                    action->LinkEndChild( typeAction );

                    typeAction->SetAttribute( "value", list.at( j ).actions.at( k ).GetType().c_str() );
                    if ( list.at( j ).actions.at( k ).IsLocal() ) { typeAction->SetAttribute( "loc", "true" ); }
                    else { typeAction->SetAttribute( "loc", "false" ); }


                    //Les autres paramètres
                    for ( unsigned int l = 0;l < list.at( j ).actions.at( k ).GetParameters().size();l++ )
                    {
                        TiXmlElement * Parametre = new TiXmlElement( "Parametre" );
                        action->LinkEndChild( Parametre );
                        Parametre->SetAttribute( "value", list.at( j ).actions.at( k ).GetParameter( l ).GetPlainString().c_str() );
                    }

                }
            }

            //Sous évènements
            if ( !list.at( j ).events.empty() )
            {
                TiXmlElement * subevents;
                subevents = new TiXmlElement( "Events" );
                event->LinkEndChild( subevents );

                SaveEvents(list.at( j ).events, subevents);
            }
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

    }
}

void OpenSaveGame::SaveVariablesList(const ListVariable & list, TiXmlElement * elem)
{
    for ( unsigned int j = 0;j < list.variables.size();j++ )
    {
        TiXmlElement * variable = new TiXmlElement( "Variable" );
        elem->LinkEndChild( variable );

        variable->SetAttribute("Name", list.variables[j].GetName().c_str());
        variable->SetAttribute("Value", list.variables[j].Gettexte().c_str());
    }
}


////////////////////////////////////////////////////////////
/// Recréer les chemins
///
/// Recréer les chemins des ressources utilisées par le jeu
////////////////////////////////////////////////////////////
void OpenSaveGame::RecreatePaths(string file)
{
#ifdef GDE
    string rep = static_cast<string>( wxPathOnly( file ) ) + "/";
    if ( rep == "" ) return;

    //Image du chargement
    if ( game.loadingScreen.imageFichier != "" )
    {
        game.loadingScreen.imageFichier = rep + game.loadingScreen.imageFichier;
    }


    //Images : copie et enlève le répertoire des chemins
    for ( unsigned int i = 0;i < game.images.size() ;i++ )
    {
        game.images.at( i ).fichier = rep + game.images.at( i ).fichier;
        wxSafeYield();
    }

    for ( unsigned int i = 0;i < game.m_scenes.size();i++ )
    {
        for ( unsigned int j = 0;j < game.m_scenes[i].events.size() ;j++ )
        {
            for ( unsigned int k = 0;k < game.m_scenes[i].events[j].actions.size() ;k++ )
            {
                if ( game.m_scenes[i].events[j].actions[k].GetType() == "PlaySound" || game.m_scenes[i].events[j].actions[k].GetType() == "PlaySoundCanal" )
                {
                    //Rajout répertoire
                    game.m_scenes[i].events[j].actions[k].SetParameter(0, GDExpression(rep + game.m_scenes[i].events[j].actions[k].GetParameter(0).GetPlainString()));
                }
                if ( game.m_scenes[i].events[j].actions[k].GetType() == "PlayMusic" || game.m_scenes[i].events[j].actions[k].GetType() == "PlayMusicCanal" )
                {
                    //Rajout répertoire
                    game.m_scenes[i].events[j].actions[k].SetParameter(0, GDExpression(rep + game.m_scenes[i].events[j].actions[k].GetParameter(0).GetPlainString()));
                }
                if ( game.m_scenes[i].events[j].actions[k].GetType() == "EcrireTexte" )
                {
                    if ( game.m_scenes[i].events[j].actions[k].GetParameter(5).GetPlainString() != "" )
                    {
                        //Rajout répertoire
                        game.m_scenes[i].events[j].actions[k].SetParameter(5, GDExpression(rep + game.m_scenes[i].events[j].actions[k].GetParameter(5).GetPlainString()));
                    }
                }
            }
        }
        wxSafeYield();
    }
#endif //GDE
}
