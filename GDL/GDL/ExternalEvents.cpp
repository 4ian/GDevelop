/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/OpenSaveGame.h"
#include "ExternalEvents.h"

ExternalEvents::ExternalEvents() :
lastChangeTimeStamp(0)
{
    //ctor
}

ExternalEvents::ExternalEvents(const ExternalEvents & externalEvents)
{
    Init(externalEvents);
}

ExternalEvents& ExternalEvents::operator=(const ExternalEvents & rhs)
{
    if ( this != &rhs )
        Init(rhs);

    return *this;
}

void ExternalEvents::Init(const ExternalEvents & externalEvents)
{
    name = externalEvents.GetName();
    associatedScene = externalEvents.GetAssociatedScene();
    lastChangeTimeStamp = externalEvents.GetLastChangeTimeStamp();
    events = CloneVectorOfEvents(externalEvents.events);
}

void ExternalEvents::LoadFromXml(const TiXmlElement * element)
{
    if (!element) return;

    name = element->Attribute( "Name" ) != NULL ? element->Attribute( "Name" ) : "";
    associatedScene = element->Attribute( "AssociatedScene" ) != NULL ? element->Attribute( "AssociatedScene" ) : "";
    lastChangeTimeStamp = element->Attribute( "LastChangeTimeStamp" ) != NULL ? atol(element->Attribute( "LastChangeTimeStamp" )) : 0;
    if ( element->FirstChildElement("Events") != NULL )  OpenSaveGame::OpenEvents(events, element->FirstChildElement("Events"));
}

void ExternalEvents::SaveToXml(TiXmlElement * element) const
{
    if (!element) return;

    element->SetAttribute("Name", name.c_str());
    element->SetAttribute("AssociatedScene", associatedScene.c_str());
    element->SetAttribute("LastChangeTimeStamp", lastChangeTimeStamp);

    TiXmlElement * eventsElem = new TiXmlElement( "Events" );
    element->LinkEndChild( eventsElem );
    OpenSaveGame::SaveEvents(events, eventsElem);
}

#endif

