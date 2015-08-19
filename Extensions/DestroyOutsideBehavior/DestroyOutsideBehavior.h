/**

GDevelop - DestroyOutside Behavior Extension
Copyright (c) 2013-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef DRAGGABLEBEHAVIOR_H
#define DRAGGABLEBEHAVIOR_H
#include "GDCpp/Behavior.h"
#include "GDCpp/Object.h"
#include <SFML/System/Vector2.hpp>
#include <map>
class RuntimeScene;
namespace gd { class SerializerElement; }
namespace gd { class Layout; }

/**
 * \brief Behavior that allows objects to be dragged with the mouse
 */
class GD_EXTENSION_API DestroyOutsideBehavior : public Behavior
{
public:
    DestroyOutsideBehavior();
    virtual ~DestroyOutsideBehavior() {};
    virtual Behavior* Clone() const { return new DestroyOutsideBehavior(*this); }

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize the behavior.
     */
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    /**
     * \brief Unserialize the behavior.
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element);

    /**
     * \brief Return the value of the extra border.
     */
    bool GetExtraBorder() const { return extraBorder; };

    /**
     * \brief Set the value of the extra border, i.e the supplementary margin that the object
     * must cross before being deleted.
     */
    void SetExtraBorder(float extraBorder_) { extraBorder = extraBorder_; };

private:

    virtual void DoStepPostEvents(RuntimeScene & scene);

    float extraBorder; ///< The supplementary margin outside the screen that the object must cross before being deleted.
};

#endif // DRAGGABLEBEHAVIOR_H

