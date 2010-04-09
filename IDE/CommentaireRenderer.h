/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef COMMENTAIRERENDERER_H
#define COMMENTAIRERENDERER_H

#include "GDL/CommentEvent.h"
#include "Renderer.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>
#include "EventsRendererDatas.h"

class CommentaireRenderer : public Renderer
{
    public:
        CommentaireRenderer(wxBufferedPaintDC & dc_, const CommentEvent & event_, EventsRendererDatas & eventsRenderersDatas_);
        virtual ~CommentaireRenderer() {};

        void Render() const;
        int GetHeight() const;

    protected:
    private:
        wxBufferedPaintDC & dc;
        const CommentEvent & event;
        EventsRendererDatas & renderingDatas;
};

#endif // COMMENTAIRERENDERER_H
