#include "Renderer.h"

#ifdef DEBUG

#endif

Renderer::Renderer() :
selected(false)
{
    //ctor
}

Renderer::~Renderer()
{
    //dtor
}

void Renderer::SetSelected(bool pSelected)
{
    selected = pSelected;
}
