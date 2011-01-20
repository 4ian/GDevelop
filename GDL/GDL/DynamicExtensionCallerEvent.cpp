/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */
#if !defined(GD_NO_DYNAMIC_EXTENSIONS)

#include "GDL/DynamicExtensionCallerEvent.h"
#include "GDL/OpenSaveGame.h"
#include "GDL/EventsRenderingHelper.h"
#include "GDL/CommonTools.h"
#include "GDL/ExternalEvents.h"
#include "GDL/DynamicExtensionsManager.h"
#include "tinyxml.h"
#include "RuntimeScene.h"
#include "Game.h"
#include "Event.h"
#include <iostream>

#if defined(GD_IDE_ONLY)
#include "GDL/EditLink.h"
#endif

using namespace std;

/**
 * Launch dynamic extension event
 */
void DynamicExtensionCallerEvent::Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    cout << "Executed" << endl;
    if ( !dynamicExtensionEvent.expired() ) dynamicExtensionEvent.lock()->Execute(scene, objectsConcerned);
}

#if defined(GD_IDE_ONLY)
void DynamicExtensionCallerEvent::SaveToXml(TiXmlElement * eventElem) const
{
    /*TiXmlElement * type = new TiXmlElement( "Type" );
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
    com1->SetAttribute( "value", sceneLinked.c_str() );*/
}
#endif

void DynamicExtensionCallerEvent::LoadFromXml(const TiXmlElement * eventElem)
{
    /*if ( eventElem->FirstChildElement( "Limites" )->Attribute( "start" ) != NULL ) { int value;eventElem->FirstChildElement( "Limites" )->QueryIntAttribute( "start", &value ); start = value;}
    else { cout <<"Les informations concernant le départ d'un lien manquent."; }
    if ( eventElem->FirstChildElement( "Limites" )->Attribute( "end" ) != NULL ) { int value;eventElem->FirstChildElement( "Limites" )->QueryIntAttribute( "end", &value ); end = value;}
    else { cout <<"Les informations concernant la fin d'un lien manquent."; }
    if ( eventElem->FirstChildElement( "Scene" )->Attribute( "value" ) != NULL ) { sceneLinked = eventElem->FirstChildElement( "Scene" )->Attribute( "value" );}
    else { cout <<"Les informations concernant le nom de la scène liée."; }*/
}

void DynamicExtensionCallerEvent::Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    if ( IsDisabled() ) return;
    cout << "Preprocess" << endl;

    dynamicExtensionEvent = boost::shared_ptr<BaseEvent>();
    if ( GDpriv::DynamicExtensionsManager::getInstance()->HasEvent(dynamicExtensionEventName) )
        dynamicExtensionEvent = GDpriv::DynamicExtensionsManager::getInstance()->CreateEvent(dynamicExtensionEventName);
}

#if defined(GD_IDE_ONLY)
void DynamicExtensionCallerEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    /*EditLink dialog(parent_, *this);
    dialog.ShowModal();*/
}

/**
 * Render the event in the bitmap
 */
void DynamicExtensionCallerEvent::Render(wxBufferedPaintDC & dc, int x, int y, unsigned int width) const
{
    EventsRenderingHelper * renderingHelper = EventsRenderingHelper::getInstance();

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

    wxRect rect(x, y, width, GetRenderedHeight(width));
    wxColor color1 = selected ? renderingHelper->selectionColor : (IsDisabled() ? renderingHelper->disabledColor2 :renderingHelper->eventGradient1);
    wxColor color2 = IsDisabled() ? renderingHelper->disabledColor : renderingHelper->eventGradient2;
    wxColor color3 = IsDisabled() ? renderingHelper->disabledColor : renderingHelper->eventGradient3;
    wxColor color4 = selected ? renderingHelper->selectionColor : (IsDisabled() ? renderingHelper->disabledColor2 :renderingHelper->eventGradient4);

    renderingHelper->DrawNiceRectangle(dc, rect, color1, color2, color3, color4, renderingHelper->eventBorderColor);

    dc.DrawBitmap( wxBitmap( "res/link48.png", wxBITMAP_TYPE_ANY ), x+4, y + 4, true);

    dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    dc.SetTextBackground( wxColour( 255, 255, 255 ) );
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.DrawText( _("Appeler ")+dynamicExtensionEventName, x+56, y + 16 );
    wxRect lien = dc.GetTextExtent(_("Appeler ")+dynamicExtensionEventName);
}

/**
 * Precompute height for the link
 */
unsigned int DynamicExtensionCallerEvent::GetRenderedHeight(unsigned int width) const
{
    if ( eventHeightNeedUpdate )
    {
        wxMemoryDC dc;
        wxBitmap fakeBmp(1,1);
        dc.SelectObject(fakeBmp);

        dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
        wxRect lien = dc.GetTextExtent(_("Appeler "));

        renderedHeight = lien.GetHeight()+32;
        eventHeightNeedUpdate = false;
    }

    return renderedHeight;
}

#endif

/**
 * Initialize from another DynamicExtensionCallerEvent.
 * Used by copy ctor and assignement operator
 */
void DynamicExtensionCallerEvent::Init(const DynamicExtensionCallerEvent & event)
{
    dynamicExtensionEvent = boost::shared_ptr<BaseEvent>();

    dynamicExtensionEventName = event.dynamicExtensionEventName;
}

/**
 * Custom copy operator
 */
DynamicExtensionCallerEvent::DynamicExtensionCallerEvent(const DynamicExtensionCallerEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
DynamicExtensionCallerEvent& DynamicExtensionCallerEvent::operator=(const DynamicExtensionCallerEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

#endif
