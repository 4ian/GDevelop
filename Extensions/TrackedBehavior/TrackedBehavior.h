/**

GDevelop - Tracked Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DRAGGABLEBEHAVIOR_H
#define DRAGGABLEBEHAVIOR_H
#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/Project/Object.h"
#include <SFML/System/Vector2.hpp>
#include <map>
class RuntimeScene;
namespace gd { class SerializerElement; }
namespace gd { class Layout; }

/**
 * \brief TODO
 */
class GD_EXTENSION_API TrackedBehavior : public Behavior
{
public:
    TrackedBehavior();
    virtual ~TrackedBehavior() {};
    virtual Behavior* Clone() const { return new TrackedBehavior(*this); }

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
    std::size_t dragCameraIndex; ///< The camera being used to move the object. ( The layer is the object's layer ).
    bool dragged; ///< True if the object is being dragged.
    static bool somethingDragged; ///< Used to avoid start dragging an object while another is being dragged.
    static bool leftPressedLastFrame; ///< Used to only start dragging when clicking.
};

#endif // DRAGGABLEBEHAVIOR_H
