/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef LINKRENDERER_H
#define LINKRENDERER_H

#include "GDL/Event.h"
#include "Renderer.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include "EventsRendererDatas.h"

class LinkRenderer : public Renderer
{
    public:
        LinkRenderer(wxBufferedPaintDC & dc_, const Event & event_, EventsRendererDatas & eventsRenderersDatas_);
        virtual ~LinkRenderer() {};

        void Render() const;
        int GetHeight() const;
    protected:
    private:
        wxBufferedPaintDC & dc;
        const Event & event;
        EventsRendererDatas & renderingDatas;
};


#endif // LINKRENDERER_H
