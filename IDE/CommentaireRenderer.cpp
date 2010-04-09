/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "CommentaireRenderer.h"
#include "GDL/Event.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/brush.h>
#include <wx/colour.h>
#include <wx/settings.h>

CommentaireRenderer::CommentaireRenderer(wxBufferedPaintDC & dc_, const CommentEvent & event_, EventsRendererDatas & eventsRenderersDatas_) :
dc(dc_),
event(event_),
renderingDatas(eventsRenderersDatas_)
{
    //ctor
}

void CommentaireRenderer::Render() const
{
    const int sideSeparation = 3; //Espacement en pixel entre le texte et la bordure
    dc.SetFont( renderingDatas.GetFont() );

    wxRect rectangle = wxRect(dc.GetMultiLineTextExtent(event.com1));
    wxRect rectangle2 = wxRect(dc.GetMultiLineTextExtent(event.com2));

    //Setup the background
    rectangle.SetX(renderingDatas.GetOrigineX());
    rectangle.SetY(renderingDatas.GetOrigineY());
    rectangle.SetWidth(renderingDatas.GetRenderZoneWidth()-renderingDatas.GetOrigineX());
    if ( rectangle.GetHeight() >= rectangle2.GetHeight() )
        rectangle.SetHeight(rectangle.GetHeight()+sideSeparation*2);
    else
        rectangle.SetHeight(rectangle2.GetHeight()+sideSeparation*2);

    if ( !event.selected )
    {
        dc.SetBrush(wxBrush(wxColour(event.r, event.v, event.b)));
        dc.SetPen(wxPen(wxColour(event.r/2, event.v/2, event.b/2), 1));
    }
    else
    {
        dc.SetPen(renderingDatas.GetSelectedRectangleOutlinePen());
        dc.SetBrush(renderingDatas.GetSelectedRectangleFillBrush());
    }

    //Draw the background
    dc.DrawRectangle(rectangle);

    //Draw the texte
    wxRect texteRect = rectangle;
    texteRect.SetY(texteRect.GetY()+sideSeparation);
    texteRect.SetX(texteRect.GetX()+sideSeparation);
    dc.DrawLabel( event.com1, texteRect );

    //Optional text
    if ( event.com2 != "" )
    {
        texteRect.SetX(texteRect.GetX()+renderingDatas.GetRenderZoneWidth()/2);
        dc.DrawLabel( event.com2, texteRect );
    }
}

int CommentaireRenderer::GetHeight() const
{
    wxBufferedDC dc;
    dc.SetFont( renderingDatas.GetFont() );
    const int sideSeparation = 3; //Espacement en pixel entre le texte et la bordure

    wxRect rectangle = wxRect(dc.GetMultiLineTextExtent(event.com1));
    wxRect rectangle2 = wxRect(dc.GetMultiLineTextExtent(event.com2));

    if ( rectangle.GetHeight() >= rectangle2.GetHeight() )
        rectangle.SetHeight(rectangle.GetHeight()+sideSeparation*2);
    else
        rectangle.SetHeight(rectangle2.GetHeight()+sideSeparation*2);

    return rectangle.GetHeight();
}
