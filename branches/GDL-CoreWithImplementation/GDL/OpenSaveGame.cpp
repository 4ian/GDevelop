/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
    #include <wx/wx.h>
    #define MSG(x) wxLogWarning(x);          // Utiliser WxWidgets pour
    #define MSGERR(x) wxLogError(x.c_str()); // afficher les messages dans l'éditeur
    #include "GDL/IDE/Dialogs/ProjectUpdateDlg.h"
    #include "GDL/PlatformDefinition/Platform.h"
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
#include "GDL/ExternalLayout.h"
#include "GDL/StandardEvent.h"
#include "GDL/RepeatEvent.h"
#include "GDL/XmlMacros.h"
#include "GDL/SourceFile.h"

using namespace std;

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
        if ( !elemCamera ) layer.SetCameraCount(1);

        while (elemCamera)
        {
            layer.SetCameraCount(layer.GetCameraCount()+1);

            if ( elemCamera->Attribute("DefaultSize") && elemCamera->Attribute("Width") && elemCamera->Attribute("Height") )
            {
                string defaultSize = elemCamera->Attribute("DefaultSize");
                layer.GetCamera(layer.GetCameraCount()-1).SetUseDefaultSize(!(defaultSize == "false"));
                layer.GetCamera(layer.GetCameraCount()-1).SetSize(sf::Vector2f(ToFloat(elemCamera->Attribute("Width")), ToFloat(elemCamera->Attribute("Height"))));
            }

            if ( elemCamera->Attribute("DefaultViewport") && elemCamera->Attribute("ViewportLeft") && elemCamera->Attribute("ViewportTop") &&
                 elemCamera->Attribute("ViewportRight") && elemCamera->Attribute("ViewportBottom") )
            {
                string defaultViewport = elemCamera->Attribute("DefaultViewport");
                layer.GetCamera(layer.GetCameraCount()-1).SetUseDefaultViewport(!(defaultViewport == "false"));
                layer.GetCamera(layer.GetCameraCount()-1).SetViewport(sf::FloatRect(ToFloat(elemCamera->Attribute("ViewportLeft")),
                                                                                    ToFloat(elemCamera->Attribute("ViewportTop")),
                                                                                    ToFloat(elemCamera->Attribute("ViewportRight"))-ToFloat(elemCamera->Attribute("ViewportLeft")),
                                                                                    ToFloat(elemCamera->Attribute("ViewportBottom"))-ToFloat(elemCamera->Attribute("ViewportTop"))
                                                                                    )); // (sf::Rect used Right and Bottom instead of Width and Height before. )
            }

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

        externalEvents->LoadFromXml(elemScene);

        list.push_back(externalEvents);
        elemScene = elemScene->NextSiblingElement();
    }
}
#endif


#if defined(GD_IDE_ONLY)
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

            list[j]->GetAutomatism(allAutomatisms[i]).SaveToXml(automatism);
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
        TiXmlElement * event = new TiXmlElement( "Event" );
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

        for (unsigned int c = 0;c<list.at(j).GetCameraCount();++c)
        {
            TiXmlElement * camera = new TiXmlElement( "Camera" );
            layer->LinkEndChild( camera );

            camera->SetAttribute("DefaultSize", list.at(j).GetCamera(c).UseDefaultSize() ? "true" : "false");

            camera->SetDoubleAttribute("Width", list.at(j).GetCamera(c).GetSize().x);
            camera->SetDoubleAttribute("Height", list.at(j).GetCamera(c).GetSize().y);

            camera->SetAttribute("DefaultViewport", list.at(j).GetCamera(c).UseDefaultViewport() ? "true" : "false");

            camera->SetDoubleAttribute("ViewportLeft", list.at(j).GetCamera(c).GetViewport().left);
            camera->SetDoubleAttribute("ViewportTop", list.at(j).GetCamera(c).GetViewport().top);
            camera->SetDoubleAttribute("ViewportRight", list.at(j).GetCamera(c).GetViewport().left+list.at(j).GetCamera(c).GetViewport().width);
            camera->SetDoubleAttribute("ViewportBottom", list.at(j).GetCamera(c).GetViewport().top+list.at(j).GetCamera(c).GetViewport().height);
        }
    }
}

void OpenSaveGame::SaveExternalEvents(const vector < boost::shared_ptr<ExternalEvents> > & list, TiXmlElement * elem)
{
    for ( unsigned int j = 0;j < list.size();j++ )
    {
        TiXmlElement * externalEvents = new TiXmlElement( "ExternalEvents" );
        elem->LinkEndChild( externalEvents );

        list[j]->SaveToXml(externalEvents);
    }
}


void OpenSaveGame::OpenImagesFromGD2010498(Game & game, const TiXmlElement * imagesElem, const TiXmlElement * dossierElem)
{
    //Images
    while ( imagesElem )
    {
        ImageResource image;

        if ( imagesElem->Attribute( "nom" ) != NULL ) { image.SetName(imagesElem->Attribute( "nom" )); }
        else { MSG( "Les informations concernant le nom de l'image manquent." ); }
        if ( imagesElem->Attribute( "fichier" ) != NULL ) {image.GetFile() = imagesElem->Attribute( "fichier" ); }
        else { MSG( "Les informations concernant le fichier de l'image manquent." ); }

        image.smooth = true;
        if ( imagesElem->Attribute( "lissage" ) != NULL && string(imagesElem->Attribute( "lissage" )) == "false")
                image.smooth = false;

        image.alwaysLoaded = false;
        if ( imagesElem->Attribute( "alwaysLoaded" ) != NULL && string(imagesElem->Attribute( "alwaysLoaded" )) == "true")
                image.alwaysLoaded = true;

        game.GetResourcesManager().AddResource(image);
        imagesElem = imagesElem->NextSiblingElement();
    }

    //Dossiers d'images
    while ( dossierElem )
    {
        if ( dossierElem->Attribute( "nom" ) != NULL )
        {
            game.GetResourcesManager().CreateFolder( dossierElem->Attribute( "nom" ) );
            ResourceFolder & folder = game.GetResourcesManager().GetFolder(dossierElem->Attribute( "nom" ));

            const TiXmlElement *elemDossier = dossierElem;
            if ( elemDossier->FirstChildElement( "Contenu" ) != NULL )
            {
                elemDossier = elemDossier->FirstChildElement( "Contenu" )->FirstChildElement();
                while ( elemDossier )
                {
                    if ( elemDossier->Attribute( "nom" ) != NULL ) { folder.AddResource(elemDossier->Attribute( "nom" ), game.GetResourcesManager()); }
                    else { MSG( "Les informations concernant le nom d'une image d'un dossier manquent." ); }

                    elemDossier = elemDossier->NextSiblingElement();
                }
            }
        }

        dossierElem = dossierElem->NextSiblingElement();
    }
}

#endif
