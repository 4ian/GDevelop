/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef RENDERER_H
#define RENDERER_H

/**
 * Base class for events renderers
 */
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
};

#endif // RENDERER_H
