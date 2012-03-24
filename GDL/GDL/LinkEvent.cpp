/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include <wx/dcmemory.h>
#include "GDL/LinkEvent.h"
#include "GDL/OpenSaveGame.h"
#include "GDCore/IDE/EventsRenderingHelper.h"
#include "GDL/CommonTools.h"
#include "GDL/EmptyEvent.h"
#include "GDL/ExternalEvents.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Game.h"
#include <iostream>
#include "GDL/IDE/Dialogs/EditLink.h"

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

void LinkEvent::Preprocess(const Game & game, const Scene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    if ( IsDisabled() ) return;

    //Finding events to include
    vector< BaseEventSPtr > * eventsToInclude = NULL;

    vector< boost::shared_ptr<Scene> >::const_iterator sceneLinkedIter =
        find_if(game.scenes.begin(), game.scenes.end(), bind2nd(SceneHasName(), sceneLinked));
    vector< boost::shared_ptr<ExternalEvents> >::const_iterator eventsLinkedIter =
        find_if(game.externalEvents.begin(), game.externalEvents.end(), bind2nd(ExternalEventsHasName(), sceneLinked));

    if ( eventsLinkedIter != game.externalEvents.end() ) eventsToInclude = &(*eventsLinkedIter)->events;
    else if ( sceneLinkedIter != game.scenes.end() ) eventsToInclude = &(*sceneLinkedIter)->events;

    if ( eventsToInclude == NULL )
    {
        std::cout << "Unable to get events from a link" << std::endl;
        return;
    }

    unsigned int firstEvent = start;
    unsigned int lastEvent = end;

    if ( firstEvent == std::string::npos && lastEvent == std::string::npos ) //Do we need to include all events ?
    {
        firstEvent = 0;
        lastEvent = eventsToInclude->size() - 1;
    }
    else
    {
        firstEvent--; //The numbers start at 1 in the events editor
        lastEvent--;
    }

    //Check bounds
    if ( firstEvent >= eventsToInclude->size() )
    {
        std::cout << "Unable to get events from a link ( Invalid start )" << std::endl;
        return;
    }
    if ( lastEvent >= eventsToInclude->size() )
    {
        std::cout << "Unable to get events from a link ( Invalid end )" << std::endl;
        return;
    }
    if ( firstEvent > lastEvent )
    {
        std::cout << "Unable to get events from a link ( End is before start )" << std::endl;
        return;
    }

    //Insert an empty event to replace the link event ( we'll delete the link event at the end )
    //( If we just erase the link event without adding a blank event to replace it,
    //the first event inserted by the link will not be preprocessed ( and it can be annoying if it require preprocessing, such as another link event ). )
    eventList.insert(eventList.begin() + indexOfTheEventInThisList, boost::shared_ptr<BaseEvent>(new EmptyEvent));

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

BaseEvent::EditEventReturnType LinkEvent::EditEvent(wxWindow* parent_, Game & game, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    EditLink dialog(parent_, *this, game);
    if ( dialog.ShowModal() == 0 ) return Cancelled;

    return ChangesMade;
}

/**
 * Render the event in the bitmap
 */
void LinkEvent::Render(wxDC & dc, int x, int y, unsigned int width, EventsEditorItemsAreas & areas, EventsEditorSelection & selection)
{
    dc.SetBrush( wxBrush( wxColour( 255, 255, 255 ) ) );
    dc.SetPen( wxPen( wxColour( 0, 0, 0 ), 1) );
    wxRect rect(x+1, y, width, GetRenderedHeight(width)-2);
    dc.DrawRectangle(rect);

    dc.DrawBitmap( wxBitmap( "res/link48.png", wxBITMAP_TYPE_ANY ), x+4, y + 4, true);

    dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    dc.SetTextBackground( wxColour( 255, 255, 255 ) );
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.DrawText( _("Lien vers ")+sceneLinked, x+56, y + 16 );
    wxRect lien = dc.GetTextExtent(_("Lien vers ")+sceneLinked);

    dc.SetFont( wxFont( 10, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    if ( start == -1 && end == -1 )
        dc.DrawText( _("Inclure tous les évènements"), x+lien.GetWidth()+56+10, y + 18 );
    else
        dc.DrawText( _("Inclure les évènements ")+ToString(start)+_(" à ")+ToString(end), x+lien.GetWidth()+56+10, y + 18 );
}

/**
 * Precompute height for the link
 */
unsigned int LinkEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        wxMemoryDC dc;
        wxBitmap fakeBmp(1,1);
        dc.SelectObject(fakeBmp);

        dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
        wxRect lien = dc.GetTextExtent(_("Lien vers "));

        renderedHeight = lien.GetHeight()+32;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

#endif
