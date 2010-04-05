/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CommentEvent.h"
#include "tinyxml.h"
#include "GDL/OpenSaveGame.h"

void CommentEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * color;
    color = new TiXmlElement( "Couleur" );
    eventElem->LinkEndChild( color );

    color->SetDoubleAttribute( "r", r );
    color->SetDoubleAttribute( "v", v );
    color->SetDoubleAttribute( "b", b );

    TiXmlElement * com1Elem = new TiXmlElement( "Com1" );
    eventElem->LinkEndChild( com1Elem );
    com1Elem->SetAttribute( "value", com1.c_str() );

    TiXmlElement * com2Elem = new TiXmlElement( "Com2" );
    eventElem->LinkEndChild( com2Elem );
    com2Elem->SetAttribute( "value", com2.c_str() );
}

void CommentEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "Couleur" )->Attribute( "r" ) != NULL ) { int value;eventElem->FirstChildElement( "Couleur" )->QueryIntAttribute( "r", &value ); r = value;}
    else { cout << "Les informations concernant la couleur d'un commentaire manquent."; }
    if ( eventElem->FirstChildElement( "Couleur" )->Attribute( "v" ) != NULL ) { int value;eventElem->FirstChildElement( "Couleur" )->QueryIntAttribute( "v", &value ); v = value;}
    else { cout <<"Les informations concernant la couleur d'un commentaire manquent." ; }
    if ( eventElem->FirstChildElement( "Couleur" )->Attribute( "b" ) != NULL ) { int value;eventElem->FirstChildElement( "Couleur" )->QueryIntAttribute( "b", &value ); b = value;}
    else { cout <<"Les informations concernant la couleur d'un commentaire manquent." ; }
    if ( eventElem->FirstChildElement( "Com1" )->Attribute( "value" ) != NULL ) { com1 = eventElem->FirstChildElement( "Com1" )->Attribute( "value" );}
    else { cout <<"Les informations concernant le texte 1 d'un commentaire manquent." ; }
    if ( eventElem->FirstChildElement( "Com2" )->Attribute( "value" ) != NULL ) { com2 = eventElem->FirstChildElement( "Com2" )->Attribute( "value" );}
    else { cout <<"Les informations concernant le texte 2 d'un commentaire manquent." ; }
}
