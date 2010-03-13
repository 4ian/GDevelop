/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EVENTRENDERER_H
#define EVENTRENDERER_H

#include "GDL/Event.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include <wx/html/htmprint.h>
#include "Renderer.h"
#include "EventsRendererDatas.h"

/**
 * Class for rendering an event
 */
class EventRenderer : public Renderer
{
    public:
        EventRenderer(wxBufferedPaintDC & dc_, const Event & event, EventsRendererDatas & eventsRenderersDatas_);
        virtual ~EventRenderer() {};

        void Render() const;
        int GetHeight() const;
    protected:
    private:

        int GetConditionsHeight() const;
        int GetActionsHeight() const;
        void DrawNiceRectangle(const wxRect & coords, const wxColor & color1, const wxColor & color2,const wxColor & color3,const wxColor & color4,const wxColor & color5) const;

        //Datas for rendering
        wxBufferedPaintDC & dc;
        const Event & event;
        EventsRendererDatas & renderingDatas;
};

#endif // EVENTRENDERER_H
