/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#include <iostream>
#include <fstream>
#include <wx/dcmemory.h>
#include "GDCore/IDE/SkinHelper.h"
#include "GDCore/TinyXml/tinyxml.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/ExternalEvents.h"
#include "GDCore/Events/EventsCodeGenerationContext.h"
#include "GDCore/Events/EventsCodeGenerator.h"
#include "GDCore/Events/EventsCodeNameMangler.h"
#include "GDCore/Events/Builtin/LinkEvent.h"
#include "GDCore/IDE/Dialogs/EditLink.h"
#include "GDCore/CommonTools.h"

using namespace std;

namespace gd
{

void LinkEvent::ReplaceLinkByLinkedEvents(gd::Project & project, std::vector < gd::BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    //Finding what to link to.
    const vector< gd::BaseEventSPtr > * eventsToInclude = NULL;
    gd::ExternalEvents * linkedExternalEvents = NULL;
    if ( project.HasExternalEventsNamed(GetTarget()) )
    {
        linkedExternalEvents = &project.GetExternalEvents(GetTarget());
        eventsToInclude = &project.GetExternalEvents(GetTarget()).GetEvents();
    }
    else if ( project.HasLayoutNamed(GetTarget()) ) eventsToInclude = &project.GetLayout(GetTarget()).GetEvents();

    if ( eventsToInclude != NULL )
    {
        unsigned int firstEvent = IncludeAllEvents() ? 0 : GetIncludeStart();
        unsigned int lastEvent = IncludeAllEvents() ? eventsToInclude->size() - 1 : GetIncludeEnd();

        //Check bounds
        if ( firstEvent >= eventsToInclude->size() )
        {
            std::cout << "Unable to get events from a link ( Invalid start )" << std::endl;
            linkWasInvalid = true;
            return;
        }
        if ( lastEvent >= eventsToInclude->size() )
        {
            std::cout << "Unable to get events from a link ( Invalid end )" << std::endl;
            linkWasInvalid = true;
            return;
        }
        if ( firstEvent > lastEvent )
        {
            std::cout << "Unable to get events from a link ( End is before start )" << std::endl;
            linkWasInvalid = true;
            return;
        }

        //Insert an empty event to replace the link event ( we'll delete the link event at the end )
        //( If we just erase the link event without adding a blank event to replace it,
        //the first event inserted by the link will not be preprocessed ( and it can be annoying if it require preprocessing, such as another link event ). )
        eventList.insert(eventList.begin() + indexOfTheEventInThisList, boost::shared_ptr<gd::BaseEvent>(new gd::EmptyEvent));

        //Insert linked events
        for ( unsigned int insertion = 0;insertion <= static_cast<unsigned>(lastEvent-firstEvent);insertion++ )
        {
            //Profiling can be enabled in editor, so we use CloneRememberingOriginalEvent.
            eventList.insert( eventList.begin() + indexOfTheEventInThisList + 1 + insertion, /*Start inserted at indexOfTheEventInThisList+1 ( after the empty event ) */
                             CloneRememberingOriginalEvent(eventsToInclude->at( firstEvent+insertion )));
        }

        //Delete the link event ( which is now at the end of the list of events we've just inserted )
        eventList.erase( eventList.begin() + indexOfTheEventInThisList + 1 + static_cast<unsigned>(lastEvent-firstEvent)+1 );
    }
    else
    {
        std::cout << "Unable to get events from a link." << std::endl;
        linkWasInvalid = true;

        //Delete the link event
        eventList.erase( eventList.begin() + indexOfTheEventInThisList );
        return;
    }

    linkWasInvalid = false;
}

LinkEvent::~LinkEvent()
{
}

void LinkEvent::SaveToXml(TiXmlElement * eventElem) const
{
    TiXmlElement * type = new TiXmlElement( "Type" );
    eventElem->LinkEndChild( type );
    type->SetAttribute( "value", "Link" );

    TiXmlElement * limitsElem;
    limitsElem = new TiXmlElement( "Limites" );
    eventElem->LinkEndChild( limitsElem );

    limitsElem->SetAttribute( "includeAll", IncludeAllEvents() ? "true" : "false" );
    limitsElem->SetDoubleAttribute( "start", GetIncludeStart() );
    limitsElem->SetDoubleAttribute( "end", GetIncludeEnd() );

    TiXmlElement * com1;
    com1 = new TiXmlElement( "Scene" );
    eventElem->LinkEndChild( com1 );
    com1->SetAttribute( "value", GetTarget().c_str() );
}

void LinkEvent::LoadFromXml(gd::Project & project, const TiXmlElement * eventElem)
{
    if ( eventElem->FirstChildElement( "Limites" ) )
    {
        if ( eventElem->FirstChildElement( "Limites" )->Attribute( "includeAll" ) )
        {
            SetIncludeAllEvents( !(ToString(eventElem->FirstChildElement( "Limites" )->Attribute( "includeAll" )) == "false") );
        }

        if ( eventElem->FirstChildElement( "Limites" )->Attribute( "start" ) != NULL && eventElem->FirstChildElement( "Limites" )->Attribute( "end" ) != NULL )
        {
            SetIncludeStartAndEnd(ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "start" )),
                                  ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "end" )));

            //Backward compatibility
            if ( ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "start" )) == -1 && ToInt(eventElem->FirstChildElement( "Limites" )->Attribute( "end" )) == -1  )
                SetIncludeAllEvents( true );
        }
    }

    if ( eventElem->FirstChildElement( "Scene" ) && eventElem->FirstChildElement( "Scene" )->Attribute( "value" ) != NULL ) { SetTarget(eventElem->FirstChildElement( "Scene" )->Attribute( "value" ));}
    else { cout <<"Cannot found link target"; }
}

gd::BaseEvent::EditEventReturnType LinkEvent::EditEvent(wxWindow* parent_, gd::Project & project, gd::Layout & scene_, gd::MainFrameWrapper & mainFrameWrapper_)
{
    EditLink dialog(parent_, *this, project);
    if ( dialog.ShowModal() == 0 ) return Cancelled;

    return ChangesMade;
}

/**
 * Render the event in the bitmap
 */
void LinkEvent::Render(wxDC & dc, int x, int y, unsigned int width, gd::EventsEditorItemsAreas & areas, gd::EventsEditorSelection & selection, const gd::Platform & platform)
{
    dc.SetBrush( wxBrush( wxColour( 255, 255, 255 ) ) );
    dc.SetPen( wxPen( wxColour( 0, 0, 0 ), 1) );
    wxRect rect(x+1, y, width, GetRenderedHeight(width, platform)-2);
    dc.DrawRectangle(rect);

    dc.DrawBitmap( gd::SkinHelper::GetIcon("events", 24), x+4, y + 1, true);

    dc.SetTextBackground( wxColour( 255, 255, 255 ) );
    if ( !IsDisabled() )
        dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    else
        dc.SetTextForeground( wxColour( 160, 160, 160 ) );
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.DrawText( _("Link to ")+GetTarget(), x+32, y + 3 );
    wxRect lien = dc.GetTextExtent(_("Link to ")+GetTarget());

    dc.SetFont( wxFont( 10, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    if ( IncludeAllEvents() )
        dc.DrawText( _("Include all events"), x+lien.GetWidth()+32+10, y + 5 );
    else
        dc.DrawText( _("Include events ")+ToString(GetIncludeStart()+1)+_(" to ")+ToString(GetIncludeEnd()+1), x+lien.GetWidth()+32+10, y + 5 );
}

/**
 * Precompute height for the link
 */
unsigned int LinkEvent::GetRenderedHeight(unsigned int width, const gd::Platform & platform) const
{
    if ( eventHeightNeedUpdate )
    {
        wxMemoryDC dc;
        wxBitmap fakeBmp(1,1);
        dc.SelectObject(fakeBmp);

        dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
        wxRect lien = dc.GetTextExtent(_("Link to "));

        renderedHeight = lien.GetHeight()+10;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

}


