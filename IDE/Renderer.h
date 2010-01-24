#ifndef RENDERER_H
#define RENDERER_H

#include "GDL/Event.h"
#include <wx/dc.h>
#include <wx/dcbuffer.h>

class Renderer
{
    public:
        Renderer();
        virtual ~Renderer();
        void SetSelected(bool pSelected = true);
        virtual void Render() const = 0;
        virtual int GetHeight() const = 0;

    protected:
        bool selected;
    private:

};

#endif // RENDERER_H
