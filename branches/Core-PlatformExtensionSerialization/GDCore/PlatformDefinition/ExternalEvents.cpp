#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/Events/Event.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "ExternalEvents.h"

namespace gd
{

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
    associatedScene = externalEvents.GetAssociatedLayout();
    lastChangeTimeStamp = externalEvents.GetLastChangeTimeStamp();
    events = CloneVectorOfEvents(externalEvents.events);
}

void ExternalEvents::LoadFromXml(gd::Project & project, const TiXmlElement * element)
{
    if (!element) return;

    name = element->Attribute( "Name" ) != NULL ? element->Attribute( "Name" ) : "";
    associatedScene = element->Attribute( "AssociatedScene" ) != NULL ? element->Attribute( "AssociatedScene" ) : "";
    lastChangeTimeStamp = element->Attribute( "LastChangeTimeStamp" ) != NULL ? atol(element->Attribute( "LastChangeTimeStamp" )) : 0;
    if ( element->FirstChildElement("Events") != NULL )
        gd::EventsListSerialization::LoadEventsFromXml(project, events, element->FirstChildElement("Events"));
}

void ExternalEvents::SaveToXml(TiXmlElement * element) const
{
    if (!element) return;

    element->SetAttribute("Name", name.c_str());
    element->SetAttribute("AssociatedScene", associatedScene.c_str());
    element->SetAttribute("LastChangeTimeStamp", lastChangeTimeStamp);

    TiXmlElement * eventsElem = new TiXmlElement( "Events" );
    element->LinkEndChild( eventsElem );
    gd::EventsListSerialization::SaveEventsToXml(events, eventsElem);
}

}
