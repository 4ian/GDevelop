/**

Game Develop - DestroyOutside Automatism Extension
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

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

