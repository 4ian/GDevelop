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
#include "GDL/EditDynamicExtensionCallerEvent.h"
#include "tinyxml.h"
#include "RuntimeScene.h"
#include "Game.h"
#include "Event.h"
#include "XmlMacros.h"
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
    if ( !dynamicExtensionEvent.expired() ) dynamicExtensionEvent.lock()->Execute(scene, objectsConcerned);
}

#if defined(GD_IDE_ONLY)
void DynamicExtensionCallerEvent::SaveToXml(TiXmlElement * elem) const
{
    GD_CURRENT_ELEMENT_SAVE_ATTRIBUTE_STRING("dynamicExtensionEventName", dynamicExtensionEventName);
}
#endif

void DynamicExtensionCallerEvent::LoadFromXml(const TiXmlElement * elem)
{
    GD_CURRENT_ELEMENT_LOAD_ATTRIBUTE_STRING("dynamicExtensionEventName", dynamicExtensionEventName);
}

void DynamicExtensionCallerEvent::Preprocess(const Game & game, RuntimeScene & scene, std::vector < BaseEventSPtr > & eventList, unsigned int indexOfTheEventInThisList)
{
    if ( IsDisabled() ) return;
    dynamicExtensionEvent = boost::shared_ptr<BaseEvent>();

    //Stop preprocessing if game does not use external source files.
    if ( !game.useExternalSourceFiles )
    {
        wxLogWarning(_("L'évènement C++ nommé")+" \""+dynamicExtensionEventName+"\" "+_("ne sera pas executé car le jeu n'utilise pas de sources C++."));
        return;
    }

    if ( GDpriv::DynamicExtensionsManager::getInstance()->HasEvent(dynamicExtensionEventName) )
        dynamicExtensionEvent = GDpriv::DynamicExtensionsManager::getInstance()->CreateEvent(dynamicExtensionEventName);
    else
        wxLogStatus(_("L'évènement C++ nommé")+" \""+dynamicExtensionEventName+"\" "+_("n'a pas été trouvé.\nAssurez vous de l'avoir declaré dans le fichier de déclaration."));
}

#if defined(GD_IDE_ONLY)
void DynamicExtensionCallerEvent::EditEvent(wxWindow* parent_, Game & game_, Scene & scene_, MainEditorCommand & mainEditorCommand_)
{
    EditDynamicExtensionCallerEvent dialog(parent_, game_, *this);
    dialog.ShowModal();
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
