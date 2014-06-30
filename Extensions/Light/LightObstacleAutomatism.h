/**


This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
Game Develop - Light Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)
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

#ifndef LIGHTOBSTACLEAUTOMATISM_H
#define LIGHTOBSTACLEAUTOMATISM_H

#include "GDCpp/Automatism.h"
#include "GDCpp/RuntimeObject.h"
#include "Light.h"
#include "LightManager.h"
#include <map>
#include <set>
#include "GDCpp/RuntimeScene.h"
namespace gd { class SerializerElement; }
namespace gd { class Layout; }
class LightObstacleAutomatismEditor;

/**
 * Automatism that set an object as an obstacle for light objects
 */
class GD_EXTENSION_API LightObstacleAutomatism : public Automatism
{
friend class LightObstacleAutomatismEditor;

public:
    LightObstacleAutomatism();
    virtual ~LightObstacleAutomatism();
    virtual Automatism* Clone() const { return new LightObstacleAutomatism(*this);}

    /**
     * Access to the object owning the automatism
     */
    inline RuntimeObject * GetObject() {return object;};

    /**
     * Access to the object owning the automatism
     */
    inline const RuntimeObject * GetObject() const {return object;};

    virtual void OnDeActivate();
    virtual void OnActivate();

private:

    #if defined(GD_IDE_ONLY)
    /**
     * Called when user wants to edit the automatism.
     */
    virtual void EditAutomatism( wxWindow* parent, gd::Project & game_, gd::Layout * scene, gd::MainFrameWrapper & mainFrameWrapper_ );
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

    boost::shared_ptr<Light_Manager> manager;
};

#endif // LIGHTOBSTACLEAUTOMATISM_H

