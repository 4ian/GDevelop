#ifndef EVENTRENDERER_H
#define EVENTRENDERER_H

#include "GDL/Event.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#include "Renderer.h"

class EventRenderer : public Renderer
{
    public:
        EventRenderer(wxBufferedPaintDC & dc_, const Event & event, int origineX, int origineY, int editorWidth, int conditionsColumnWidth);
        virtual ~EventRenderer();

        void Render() const;
        int GetHeight() const;
    protected:
    private:

        int GetConditionsHeight() const;
        int GetActionsHeight() const;

        //Données pour le rendu
        wxBufferedPaintDC & dc;
        const Event & event;
        int origineX;
        int origineY;
        int editorWidth;
        int conditionsColumnWidth;

        mutable wxHtmlDCRenderer htmlRenderer;
};

#endif // EVENTRENDERER_H
