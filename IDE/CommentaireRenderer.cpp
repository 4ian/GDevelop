#ifdef DEBUG
#include "nommgr.h"
#endif

#include "CommentaireRenderer.h"
#include "GDL/Event.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/brush.h>
#include <wx/colour.h>
#include <wx/settings.h>

#ifdef DEBUG

#endif

CommentaireRenderer::CommentaireRenderer(wxBufferedPaintDC & dc_, const Event & event_, int origineX_, int origineY_, int editorWidth_) :
dc(dc_),
event(event_),
origineX(origineX_),
origineY(origineY_),
editorWidth(editorWidth_)
{
    //ctor
}

CommentaireRenderer::~CommentaireRenderer()
{
    //dtor
}

void CommentaireRenderer::Render() const
{
    const int espacement = 3; //Espacement en pixel entre le texte et la bordure
    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );

    wxRect rectangle = wxRect(dc.GetMultiLineTextExtent(event.com1));
    wxRect rectangle2 = wxRect(dc.GetMultiLineTextExtent(event.com2));

    //Paramètrage du rectangle
    rectangle.SetX(origineX);
    rectangle.SetY(origineY);
    rectangle.SetWidth(editorWidth-origineX);
    if ( rectangle.GetHeight() >= rectangle2.GetHeight() )
        rectangle.SetHeight(rectangle.GetHeight()+espacement*2);
    else
        rectangle.SetHeight(rectangle2.GetHeight()+espacement*2);

    //Affichage du rectangle
    dc.SetBrush(wxBrush(wxColour(event.r, event.v, event.b)));
    dc.SetPen(wxPen(wxColour(event.r/2, event.v/2, event.b/2), 1));
    if ( selected ) dc.SetPen(wxPen(wxColour(0, 0, 0), 1));
    if ( selected ) dc.SetBrush(wxBrush(wxSystemSettings::GetColour(wxSYS_COLOUR_HIGHLIGHT)));
    dc.DrawRectangle(rectangle);

    //Affichage du texte
    wxRect texteRect = rectangle;
    texteRect.SetY(texteRect.GetY()+espacement);
    texteRect.SetX(texteRect.GetX()+espacement);
    dc.DrawLabel( event.com1, texteRect );

    if ( event.com2 != "" )
    {
        //Texte facultatif
        texteRect.SetX(texteRect.GetX()+editorWidth/2);
        dc.DrawLabel( event.com2, texteRect );
    }
}

int CommentaireRenderer::GetHeight() const
{
    wxBufferedDC dc;
    dc.SetFont( wxFont( 8, wxDEFAULT, wxNORMAL, wxNORMAL ) );
    const int espacement = 3; //Espacement en pixel entre le texte et la bordure

    wxRect rectangle = wxRect(dc.GetMultiLineTextExtent(event.com1));
    wxRect rectangle2 = wxRect(dc.GetMultiLineTextExtent(event.com2));

    if ( rectangle.GetHeight() >= rectangle2.GetHeight() )
        rectangle.SetHeight(rectangle.GetHeight()+espacement*2);
    else
        rectangle.SetHeight(rectangle2.GetHeight()+espacement*2);

    return rectangle.GetHeight();
}
