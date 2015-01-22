/**

GDevelop - DestroyOutside Automatism Extension
Copyright (c) 2013-2015 Florian Rival (Florian.Rival@gmail.com)
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
class GD_EXTENSION_API DestroyOutsideAutomatism : public Automatism
{
public:
    DestroyOutsideAutomatism();
    virtual ~DestroyOutsideAutomatism() {};
    virtual Automatism* Clone() const { return new DestroyOutsideAutomatism(*this); }

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize the automatism.
     */
    virtual void SerializeTo(gd::SerializerElement & element) const;
    #endif

    /**
     * \brief Unserialize the automatism.
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

#endif // DRAGGABLEAUTOMATISM_H

