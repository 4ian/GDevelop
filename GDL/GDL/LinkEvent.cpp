/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/LinkEvent.h"
#include "GDL/OpenSaveGame.h"
#include "tinyxml.h"
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
    if ( eventElem->FirstChildElement( "Limites" )->Attribute( "start" ) != NULL ) { int value;eventElem->FirstChildElement( "Limites" )->QueryIntAttribute( "start", &value ); start = value;}
    else { cout <<"Les informations concernant le départ d'un lien manquent."; }
    if ( eventElem->FirstChildElement( "Limites" )->Attribute( "end" ) != NULL ) { int value;eventElem->FirstChildElement( "Limites" )->QueryIntAttribute( "end", &value ); end = value;}
    else { cout <<"Les informations concernant la fin d'un lien manquent."; }
    if ( eventElem->FirstChildElement( "Scene" )->Attribute( "value" ) != NULL ) { sceneLinked = eventElem->FirstChildElement( "Scene" )->Attribute( "value" );}
    else { cout <<"Les informations concernant le nom de la scène liée."; }
}
