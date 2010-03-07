/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "LinkRenderer.h"
#include "GDL/Event.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/brush.h>
#include <wx/colour.h>
#include <wx/settings.h>
#include "GDL/StdAlgo.h"

LinkRenderer::LinkRenderer(wxBufferedPaintDC & dc_, const Event & event_, EventsRendererDatas & eventsRenderersDatas_) :
dc(dc_),
event(event_),
renderingDatas(eventsRenderersDatas_)
{
    //ctor
}

void LinkRenderer::Render() const
{
    dc.SetBrush( wxBrush( wxColour( 255, 255, 255 ) ) );
    dc.SetPen( wxPen( wxColour( 255, 255, 255 ), 5, wxSOLID ) );
    if ( selected ) dc.SetPen(wxPen(wxColour(0, 0, 0), 1));
    if ( selected ) dc.SetBrush(wxBrush(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));

    dc.DrawRectangle(renderingDatas.GetOrigineX(), renderingDatas.GetOrigineY(), renderingDatas.GetRenderZoneWidth(), GetHeight());

    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    dc.SetTextBackground( wxColour( 255, 255, 255 ) );

    dc.DrawBitmap( wxBitmap( "res/link48.png", wxBITMAP_TYPE_ANY ), renderingDatas.GetOrigineX()+4, renderingDatas.GetOrigineY() + 4, true);
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.DrawText( "Lien vers la scène "+event.sceneLinked, renderingDatas.GetOrigineX()+56, renderingDatas.GetOrigineY() + 16 );
    wxRect lien = dc.GetTextExtent("Lien vers la scène "+event.sceneLinked);

    dc.SetFont( wxFont( 10, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    if ( event.start == -1 && event.end == -1 )
        dc.DrawText( _("Inclure tous les évènements"), renderingDatas.GetOrigineX()+lien.GetWidth()+56+10, renderingDatas.GetOrigineY() + 18 );
    else
        dc.DrawText( "Inclure les évènements "+st(event.start)+" à "+st(event.end), renderingDatas.GetOrigineX()+lien.GetWidth()+56+10, renderingDatas.GetOrigineY() + 18 );
}

int LinkRenderer::GetHeight() const
{
    wxBufferedDC dc;

    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    wxRect lien = dc.GetTextExtent("Lien vers la scène ");

    return lien.GetHeight()+32;
}
