/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDL/EmptyEvent.h"
#include "GDL/ForEachEvent.h"
#include "GDL/WhileEvent.h"
#include "GDL/StandardEvent.h"
#include "GDL/RepeatEvent.h"
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
bool OpenSaveGame::OpenFromFile(string file)
{
    TiXmlDocument doc;
    if ( !doc.LoadFile(file.c_str()) )
    {
#if defined(GDP)
        string ErrorDescription = doc.ErrorDesc();
        string Error =  "Erreur lors du chargement : " + ErrorDescription + _("\nVérifiez que le fichier existe et que vous possédez les droits suffisants pour y accéder.");
#endif
#if defined(GDE)
        wxString ErrorDescription = doc.ErrorDesc();
        wxString Error = _( "Erreur lors du chargement : " ) + ErrorDescription + _("\nVérifiez que le fichier existe et que vous possédez les droits suffisants pour y accéder.");
#endif
        MSGERR( Error );
        return false;
    }

    OpenDocument(doc);
    #if defined(GDE)
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
        game.extensionsUsed.push_back("CommonDialogs");
        game.extensionsUsed.push_back("BuiltinJoystick");
        game.extensionsUsed.push_back("BuiltinKeyboard");
        game.extensionsUsed.push_back("BuiltinMouse");
        game.extensionsUsed.push_back("BuiltinNetwork");
        game.extensionsUsed.push_back("BuiltinWindow");
        game.extensionsUsed.push_back("BuiltinTime");
    }
    if ( major <= 1 && minor <= 3 && build <= 8892 && revision <= 44771)
    {
        game.extensionsUsed.push_back("BuiltinCommonInstructions");
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

    //Global object groups
    elem = hdl.FirstChildElement().FirstChildElement( "ObjectGroups" ).Element();
    if ( elem )
        OpenGroupesObjets(game.objectGroups, elem);

    //Global variables
    elem = hdl.FirstChildElement().FirstChildElement( "Variables" ).Element();
    if ( elem )
        OpenVariablesList(game.variables, elem);

    //Scenes du jeu
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

        game.scenes.push_back( newScene );

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

        imageToAdd.smooth = true;
        if ( imagesElem->Attribute( "lissage" ) != NULL )
        {
            if ( strcmp(imagesElem->Attribute( "lissage" ), "false") == 0 )
                imageToAdd.smooth = false;
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

void OpenSaveGame::OpenEvents(vector < BaseEventSPtr > & list, const TiXmlElement * elem)
{
    const TiXmlElement * elemScene = elem->FirstChildElement();
    gdp::ExtensionsManager * extensionsManager = gdp::ExtensionsManager::getInstance();

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

    AdaptEventsFromGD138892(list);
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
                    subEvent->SetRepeatExpression((*conditions)[c].GetParameter(0).GetPlainString());

                    //Insert the new event and modify the current
                    BaseEventSPtr subEventSPtr = boost::shared_ptr<BaseEvent>(subEvent);
                    list[eId]->GetSubEvents().clear();
                    list[eId]->GetSubEvents().push_back(subEventSPtr);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        actionsVectors[0]->clear();

                    *conditions = eventNewConditions;

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
                    subEvent->SetObjectToPick((*conditions)[c].GetParameter(0).GetPlainString());

                    //Insert the new event and modify the current
                    BaseEventSPtr subEventSPtr = boost::shared_ptr<BaseEvent>(subEvent);
                    list[eId]->GetSubEvents().clear();
                    list[eId]->GetSubEvents().push_back(subEventSPtr);

                    if ( !actionsVectors.empty() && actionsVectors[0] != NULL ) //Assume first member of actions vector is the main action list
                        actionsVectors[0]->clear();

                    *conditions = eventNewConditions;

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
                    copy(oldConditions.begin()+c+1, oldConditions.begin()+c+1, back_inserter(whileConditions));

                    //Inverting condition if while first parameter is false
                    if ( (*conditions)[c].GetParameter(0).GetPlainString() == "Faux" || (*conditions)[c].GetParameter(0).GetPlainString() == "False" )
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
                    subEvent->SetRepeatExpression((*actions)[a].GetParameter(0).GetPlainString());

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
                    subEvent->SetObjectToPick((*actions)[a].GetParameter(0).GetPlainString());

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
            elemCamera->QueryFloatAttribute("ViewportRight", &layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Right);
            elemCamera->QueryFloatAttribute("ViewportBottom", &layer.GetCamera(layer.GetCamerasNumber()-1).viewport.Bottom);

            elemCamera = elemCamera->NextSiblingElement();
        }

        list.push_back( layer );
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

        if ( elemScene->Attribute( "Value" ) != NULL ) { variable.Settexte(elemScene->Attribute( "Value" ));}
        else { MSG( "Les informations concernant la valeur d'une variable manquent." ); }

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

            if ( !game.images.at( i ).smooth )
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

    //Global object groups
    TiXmlElement * globalObjectGroups = new TiXmlElement( "ObjectGroups" );
    root->LinkEndChild( globalObjectGroups );
    SaveGroupesObjets(game.objectGroups, globalObjectGroups);

    //Global variables
    TiXmlElement * variables = new TiXmlElement( "Variables" );
    root->LinkEndChild( variables );
    SaveVariablesList(game.variables, variables);

    //Les scènes
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

void OpenSaveGame::SaveEvents(const vector < BaseEventSPtr > & list, TiXmlElement * events)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        //Pour chaque évènements
        TiXmlElement * event;

        event = new TiXmlElement( "Event" );
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
            camera->SetDoubleAttribute("ViewportRight", list.at(j).GetCamera(c).viewport.Right);
            camera->SetDoubleAttribute("ViewportBottom", list.at(j).GetCamera(c).viewport.Bottom);
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
        variable->SetAttribute("Value", variables[j].Gettexte().c_str());
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

    for ( unsigned int s = 0;s < game.scenes.size();s++ )
    {
        for ( unsigned int j = 0;j < game.scenes[s]->events.size() ;j++ )
        {
            vector < vector<Instruction>* > allActionsVectors = game.scenes[s]->events[j]->GetAllActionsVectors();
            for (unsigned int i = 0;i<allActionsVectors.size();++i)
            {
                for ( unsigned int k = 0;k < allActionsVectors[i]->size() ;k++ )
                {
                    if ( allActionsVectors[i]->at(k).GetType() == "PlaySound" || allActionsVectors[i]->at(k).GetType() == "PlaySoundCanal" )
                    {
                        //Rajout répertoire
                        allActionsVectors[i]->at(k).SetParameter(0, GDExpression(rep + allActionsVectors[i]->at(k).GetParameter(0).GetPlainString()));
                    }
                    if ( allActionsVectors[i]->at(k).GetType() == "PlayMusic" || allActionsVectors[i]->at(k).GetType() == "PlayMusicCanal" )
                    {
                        //Rajout répertoire
                        allActionsVectors[i]->at(k).SetParameter(0, GDExpression(rep + allActionsVectors[i]->at(k).GetParameter(0).GetPlainString()));
                    }
                    if ( allActionsVectors[i]->at(k).GetType() == "EcrireTexte" )
                    {
                        if ( allActionsVectors[i]->at(k).GetParameter(5).GetPlainString() != "" )
                        {
                            //Rajout répertoire
                            allActionsVectors[i]->at(k).SetParameter(5, GDExpression(rep + allActionsVectors[i]->at(k).GetParameter(5).GetPlainString()));
                        }
                    }
                }
            }
        }
        wxSafeYield();
    }
#endif //GDE
}
