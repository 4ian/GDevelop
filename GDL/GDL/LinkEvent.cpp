/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/LinkEvent.h"
#include "GDL/OpenSaveGame.h"
#include "tinyxml.h"
#include "RuntimeScene.h"
#include "Game.h"
#include "Event.h"
#include <iostream>

using namespace std;

void LinkEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * type = new TiXmlElement( "Type" );
    eventElem->LinkEndChild( type );
    type->SetAttribute( "value", "Link" );

    TiXmlElement * couleur;
    couleur = new TiXmlElement( "Limites" );
    eventElem->LinkEndChild( couleur );

    couleur->SetDoubleAttribute( "start", start );
    couleur->SetDoubleAttribute( "end", end );

    TiXmlElement * com1;
    com1 = new TiXmlElement( "Scene" );
    eventElem->LinkEndChild( com1 );
    com1->SetAttribute( "value", sceneLinked.c_str() );
}

void LinkEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    cout << "LOADEDD!!!!!!!!!!!!!";
    if ( eventElem->FirstChildElement( "Limites" )->Attribute( "start" ) != NULL ) { int value;eventElem->FirstChildElement( "Limites" )->QueryIntAttribute( "start", &value ); start = value;}
    else { cout <<"Les informations concernant le départ d'un lien manquent."; }
    if ( eventElem->FirstChildElement( "Limites" )->Attribute( "end" ) != NULL ) { int value;eventElem->FirstChildElement( "Limites" )->QueryIntAttribute( "end", &value ); end = value;}
    else { cout <<"Les informations concernant la fin d'un lien manquent."; }
    if ( eventElem->FirstChildElement( "Scene" )->Attribute( "value" ) != NULL ) { sceneLinked = eventElem->FirstChildElement( "Scene" )->Attribute( "value" );}
    else { cout <<"Les informations concernant le nom de la scène liée."; }
}

void LinkEvent::Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    cout << "called";
    //Scene containing the event to insert
    vector< boost::shared_ptr<Scene> >::const_iterator sceneLinkedIter =
        find_if(game.scenes.begin(), game.scenes.end(), bind2nd(SceneHasName(), sceneLinked));

    if ( sceneLinkedIter == game.scenes.end() ) return;

    if ( start == -1 && end == -1 ) //Do we need to include all events ?
    {
        start = 0;
        end = (*sceneLinkedIter)->events.size() - 1;
    }
    else
    {
        start--; //The numbers start at 1 in the events editor
        end--;
    }

    cout << "start" << start << "end" << end;

    //On teste la validité de l'insertion
    if ( start < 0 || static_cast<unsigned>(start) >= (*sceneLinkedIter)->events.size() )
    {
        scene.errors.Add( "Impossible d'insérer les évènements du lien ( Début invalide )", "", "", indexOfTheEventInThisList, 2 );
        return;
    }
    if ( end < 0 || static_cast<unsigned>(end) >= (*sceneLinkedIter)->events.size() )
    {
        scene.errors.Add( "Impossible d'insérer les évènements du lien ( Fin invalide )", "", "", indexOfTheEventInThisList, 2 );
        return;
    }
    if ( start > end )
    {
        scene.errors.Add( "Impossible d'insérer les évènements du lien ( la fin est avant le départ )", "", "", indexOfTheEventInThisList, 2 );
        return;
    }

    eventList.erase( eventList.begin() + indexOfTheEventInThisList ); //Suppression du lien
    for ( int insertion = start ; insertion <= end ;insertion++ ) //Insertion des évènements du lien
    {
        if ( indexOfTheEventInThisList+insertion < eventList.size() )
            eventList.insert( eventList.begin() + indexOfTheEventInThisList+insertion, (*sceneLinkedIter)->events.at( insertion )->Clone() );
        else
            eventList.push_back( (*sceneLinkedIter)->events.at( insertion )->Clone() );
    }
}
