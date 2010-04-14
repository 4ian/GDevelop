/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/LinkEvent.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/EventsRenderingHelper.h"
#include "GDL/StdAlgo.h"
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

#if defined(GDE)
/**
 * Render the event in the bitmap
 */
void LinkEvent::RenderInBitmap() const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

    //Get sizes and recreate the bitmap
    unsigned int renderedHeight = CalculateNecessaryHeight();
    renderedEventBitmap.Create(renderedWidth, renderedHeight, -1);

    //Prepare DC and constants
    wxMemoryDC dc;
    dc.SelectObject(renderedEventBitmap);

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

    dc.DrawRectangle(0, 0, renderedWidth, renderedHeight);
    dc.DrawBitmap( wxBitmap( "res/link48.png", wxBITMAP_TYPE_ANY ), 4, 0 + 4, true);

    dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    dc.SetTextBackground( wxColour( 255, 255, 255 ) );
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.DrawText( _("Lien vers la scène ")+sceneLinked, 56, 0 + 16 );
    wxRect lien = dc.GetTextExtent(_("Lien vers la scène ")+sceneLinked);

    dc.SetFont( wxFont( 10, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    if ( start == -1 && end == -1 )
        dc.DrawText( _("Inclure tous les évènements"), lien.GetWidth()+56+10, 0 + 18 );
    else
        dc.DrawText( "Inclure les évènements "+toString(start)+" à "+toString(end), lien.GetWidth()+56+10, 0 + 18 );
}

/**
 * Precompute height for the link
 */
unsigned int LinkEvent::CalculateNecessaryHeight() const
{
    wxMemoryDC dc;
    dc.SelectObject(renderedEventBitmap);

    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    wxRect lien = dc.GetTextExtent(_("Lien vers la scène "));

    return lien.GetHeight()+32;
}

#endif
