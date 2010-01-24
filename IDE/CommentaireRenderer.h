#ifndef COMMENTAIRERENDERER_H
#define COMMENTAIRERENDERER_H

#include "GDL/Event.h"
#include "Renderer.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>

class CommentaireRenderer : public Renderer
{
    public:
        CommentaireRenderer(wxBufferedPaintDC & dc_, const Event & event_, int origineX_, int origineY_, int editorWidth_);
        virtual ~CommentaireRenderer();

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

#endif // COMMENTAIRERENDERER_H
