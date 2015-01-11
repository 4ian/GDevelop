/**

GDevelop - Draggable Automatism Extension
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DRAGGABLEAUTOMATISM_H
#define DRAGGABLEAUTOMATISM_H
#include "GDCpp/Automatism.h"
#include "GDCpp/Object.h"
#include <SFML/System/Vector2.hpp>
#include <map>
class RuntimeScene;
namespace gd { class SerializerElement; }
namespace gd { class Layout; }

/**
 * \brief Automatism that allows objects to be dragged with the mouse
 */
class GD_EXTENSION_API DraggableAutomatism : public Automatism
{
public:
    DraggableAutomatism();
    virtual ~DraggableAutomatism() {};
    virtual Automatism* Clone() const { return new DraggableAutomatism(*this); }

    /**
     * \brief Return true if the object is being dragged.
     */
    bool IsDragged() const { return dragged; };

    virtual void OnDeActivate();

private:
    virtual void DoStepPreEvents(RuntimeScene & scene);
    virtual void DoStepPostEvents(RuntimeScene & scene);

    float xOffset;
    float yOffset;
    unsigned int dragCameraIndex; ///< The camera being used to move the object. ( The layer is the object's layer ).
    bool dragged; ///< True if the object is being dragged.
    static bool somethingDragged; ///< Used to avoid start dragging an object while another is being dragged.
    static bool leftPressedLastFrame; ///< Used to only start dragging when clicking.
};

#endif // DRAGGABLEAUTOMATISM_H

