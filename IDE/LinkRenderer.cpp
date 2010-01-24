#ifdef DEBUG
#include "nommgr.h"
#endif

#include "LinkRenderer.h"
#include "GDL/Event.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/brush.h>
#include <wx/colour.h>
#include <wx/settings.h>
#include "StdAlgo.h"

#ifdef DEBUG

#endif

LinkRenderer::LinkRenderer(wxBufferedPaintDC & dc_, const Event & event_, int origineX_, int origineY_, int editorWidth_) :
dc(dc_),
event(event_),
origineX(origineX_),
origineY(origineY_),
editorWidth(editorWidth_)
{
    //ctor
}

LinkRenderer::~LinkRenderer()
{
    //dtor
}

void LinkRenderer::Render() const
{
    dc.SetBrush( wxBrush( wxColour( 255, 255, 255 ) ) );
    dc.SetPen( wxPen( wxColour( 255, 255, 255 ), 5, wxSOLID ) );
    if ( selected ) dc.SetPen(wxPen(wxColour(0, 0, 0), 1));
    if ( selected ) dc.SetBrush(wxBrush(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));

    dc.DrawRectangle(origineX, origineY, editorWidth, GetHeight());

    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.SetTextForeground( wxColour( 0, 0, 0 ) );
    dc.SetTextBackground( wxColour( 255, 255, 255 ) );

    dc.DrawBitmap( wxBitmap( "res/link48.png", wxBITMAP_TYPE_ANY ), origineX+4, origineY + 4, true);
    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    dc.DrawText( "Lien vers la scène "+event.sceneLinked, origineX+56, origineY + 16 );
    wxRect lien = dc.GetTextExtent("Lien vers la scène "+event.sceneLinked);

    dc.SetFont( wxFont( 10, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    if ( event.start == -1 && event.end == -1 )
        dc.DrawText( _("Inclure tous les évènements"), origineX+lien.GetWidth()+56+10, origineY + 18 );
    else
        dc.DrawText( "Inclure les évènements "+st(event.start)+" à "+st(event.end), origineX+lien.GetWidth()+56+10, origineY + 18 );
}

int LinkRenderer::GetHeight() const
{
    wxBufferedDC dc;

    dc.SetFont( wxFont( 12, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    wxRect lien = dc.GetTextExtent("Lien vers la scène ");

    return lien.GetHeight()+32;
}
