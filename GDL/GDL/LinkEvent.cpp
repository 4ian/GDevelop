/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/LinkEvent.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/EventsRenderingHelper.h"
#include "GDL/CommonTools.h"
#include "GDL/ExternalEvents.h"
#include "tinyxml.h"
#include "RuntimeScene.h"
#include "Game.h"
#include "Event.h"
#include <iostream>

#if defined(GDE)
#include "GDL/EditLink.h"
#endif

//Declaration of serialization for xml archives
#include <boost/archive/xml_oarchive.hpp>
#include <boost/archive/xml_iarchive.hpp>

template void LinkEvent::serialize(
    boost::archive::xml_oarchive & ar,
    const unsigned int version
);
template void LinkEvent::serialize(
    boost::archive::xml_iarchive & ar,
    const unsigned int version
);

//This is used to make the serialization library aware that code should be instantiated for serialization
//of a given class even though the class hasn't been otherwise referred to by the program.
#include <boost/serialization/export.hpp>
BOOST_CLASS_EXPORT_IMPLEMENT(LinkEvent)

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

void LinkEvent::Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    //Finding events to include
    vector< BaseEventSPtr > * eventsToInclude = NULL;

    vector< boost::shared_ptr<Scene> >::const_iterator sceneLinkedIter =
        find_if(game.scenes.begin(), game.scenes.end(), bind2nd(SceneHasName(), sceneLinked));
    vector< boost::shared_ptr<ExternalEvents> >::const_iterator eventsLinkedIter =
        find_if(game.externalEvents.begin(), game.externalEvents.end(), bind2nd(ExternalEventsHasName(), sceneLinked));

    if ( eventsLinkedIter != game.externalEvents.end() ) eventsToInclude = &(*eventsLinkedIter)->events;
    else if ( sceneLinkedIter != game.scenes.end() ) eventsToInclude = &(*sceneLinkedIter)->events;

    if ( eventsToInclude == NULL ) return;

    int firstEvent = start;
    int lastEvent = end;

    if ( firstEvent == -1 && lastEvent == -1 ) //Do we need to include all events ?
    {
        firstEvent = 0;
        lastEvent = eventsToInclude->size() - 1;
    }
    else
    {
        firstEvent--; //The numbers start at 1 in the events editor
        lastEvent--;
    }


    //On teste la validité de l'insertion
    if ( firstEvent < 0 || static_cast<unsigned>(firstEvent) >= eventsToInclude->size() )
    {
        scene.errors.Add( "Impossible d'insérer les évènements du lien ( Début invalide )", "", "", indexOfTheEventInThisList, 2 );
        return;
    }
    if ( lastEvent < 0 || static_cast<unsigned>(lastEvent) >= eventsToInclude->size() )
    {
        scene.errors.Add( "Impossible d'insérer les évènements du lien ( Fin invalide )", "", "", indexOfTheEventInThisList, 2 );
        return;
    }
    if ( firstEvent > lastEvent )
    {
        scene.errors.Add( "Impossible d'insérer les évènements du lien ( la fin est avant le départ )", "", "", indexOfTheEventInThisList, 2 );
        return;
    }

    eventList.erase( eventList.begin() + indexOfTheEventInThisList ); //Suppression du lien
    for ( int insertion = firstEvent ; insertion <= lastEvent ;insertion++ ) //Insertion des évènements du lien
    {
        if ( indexOfTheEventInThisList+insertion < eventList.size() )
            eventList.insert( eventList.begin() + indexOfTheEventInThisList+insertion, eventsToInclude->at( insertion )->Clone() );
        else
            eventList.push_back( eventsToInclude->at( insertion )->Clone() );
    }
}

#if defined(GDE)
void LinkEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    EditLink dialog(parent_, *this);
    dialog.ShowModal();
}

/**
 * Render the event in the bitmap
 */
void LinkEvent::Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const
{
    if ( !selected )
    {
        dc.SetBrush( wxBrush( wxColour( 255, 255, 255 ) ) );
        dc.SetPen( wxPen( wxColour( 255, 255, 255 ), 5, wxSOLID ) );
    }
    else
    {
        dc.SetPen(wxPen(wxColour(0, 0, 0), 1));
        dc.SetBrush(wxBrush(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));
    }

    dc.DrawRectangle(x, y, width, GetRenderedHeight(width));
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
