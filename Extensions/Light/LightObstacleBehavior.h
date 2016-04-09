/**


This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
GDevelop - Light Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
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

#ifndef LIGHTOBSTACLEBEHAVIOR_H
#define LIGHTOBSTACLEBEHAVIOR_H

#include "GDCpp/Runtime/Project/Behavior.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "Light.h"
#include "LightManager.h"
#include <map>
#include <set>
#include "GDCpp/Runtime/RuntimeScene.h"
namespace gd { class SerializerElement; }
namespace gd { class Layout; }
class LightObstacleBehaviorEditor;

/**
 * Behavior that set an object as an obstacle for light objects
 */
class GD_EXTENSION_API LightObstacleBehavior : public Behavior
{
friend class LightObstacleBehaviorEditor;

public:
    LightObstacleBehavior();
    virtual ~LightObstacleBehavior();
    virtual Behavior* Clone() const { return new LightObstacleBehavior(*this);}

    /**
     * Access to the object owning the behavior
     */
    inline RuntimeObject * GetObject() {return object;};

    /**
     * Access to the object owning the behavior
     */
    inline const RuntimeObject * GetObject() const {return object;};

    virtual void OnDeActivate();
    virtual void OnActivate();

private:

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the behavior.
     */
    virtual void EditBehavior( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ );
    #endif

    virtual void DoStepPostEvents(RuntimeScene & scene);

    /**
     * Tool function
     */
    sf::Vector2f RotatePoint( const sf::Vector2f& point, float angle );

    std::vector <Wall*> wallsOfObject;
    float objectOldX;
    float objectOldY;
    float objectOldAngle;
    float objectOldWidth;
    float objectOldHeight;

    bool disabled;

    std::shared_ptr<Light_Manager> manager;
};

#endif // LIGHTOBSTACLEBEHAVIOR_H

