#ifndef LINKRENDERER_H
#define LINKRENDERER_H

#include "GDL/Event.h"
#include "Renderer.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>

class LinkRenderer : public Renderer
{
    public:
        LinkRenderer(wxBufferedPaintDC & dc_, const Event & event_, int origineX_, int origineY_, int editorWidth_);
        virtual ~LinkRenderer();

        void Render() const;
        int GetHeight() const;
    protected:
    private:
        wxBufferedPaintDC & dc;
        const Event & event;
        int origineX;
        int origineY;
        int editorWidth;
};


#endif // LINKRENDERER_H
