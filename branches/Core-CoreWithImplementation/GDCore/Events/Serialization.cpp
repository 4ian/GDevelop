/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Serialization.h"
#include "GDCore/TinyXml/tinyxml.h"

using namespace std;

namespace gd
{

void EventsListSerialization::LoadEventsFromXml(gd::Project & project, std::vector < boost::shared_ptr<gd::BaseEvent> > & list, const TiXmlElement * events)
{
    const TiXmlElement * elemScene = events->FirstChildElement();

    //Passage en revue des évènements
    while ( elemScene )
    {
        string type;

        if ( elemScene->FirstChildElement( "Type" ) != NULL && elemScene->FirstChildElement( "Type" )->Attribute( "value" ) != NULL ) { type = elemScene->FirstChildElement( "Type" )->Attribute( "value" );}

        gd::BaseEventSPtr event = project.CreateEvent(type);
        if ( event != boost::shared_ptr<gd::BaseEvent>())
        {
            event->LoadFromXml(project, elemScene);
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

void EventsListSerialization::SaveEventsToXml(const std::vector < boost::shared_ptr<gd::BaseEvent> > & list, TiXmlElement * events)
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

}
