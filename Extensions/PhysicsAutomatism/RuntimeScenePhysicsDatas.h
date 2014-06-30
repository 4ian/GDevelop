/**

Game Develop - Physics Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

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

#ifndef RUNTIMESCENEPHYSICSDATAS_H
#define RUNTIMESCENEPHYSICSDATAS_H

class b2World;
class b2Body;
#include "GDCpp/AutomatismsRuntimeSharedData.h"
class ScenePhysicsDatas;
class ContactListener;

/**
 * Datas shared by Physics Automatism at runtime
 */
class RuntimeScenePhysicsDatas : public AutomatismsRuntimeSharedData
{
public:
    RuntimeScenePhysicsDatas(const ScenePhysicsDatas & automatismSharedDatas);
    virtual ~RuntimeScenePhysicsDatas();
    virtual boost::shared_ptr<AutomatismsRuntimeSharedData> Clone() const { return boost::shared_ptr<AutomatismsRuntimeSharedData>(new RuntimeScenePhysicsDatas(*this));}

    b2World * world;
    ContactListener * contactListener;
    b2Body * staticBody; ///< A simple static body with no fixture. Used for joints.
    bool stepped; ///< Used to be sure that Step is called only once at each frame.

    /**
     * Get the scale between world coordinates and scene pixels in x axis
     */
    inline float GetScaleX() const { return scaleX; }

    /**
     * Get the scale between world coordinates and scene pixels in y axis
     */
    inline float GetScaleY() const { return scaleY; }

    /**
     * Get inverse of scale X
     */
    inline float GetInvScaleX() const { return invScaleX; }

    /**
     * Get inverse of scale Y
     */
    inline float GetInvScaleY() const { return invScaleY; }

    /**
     * Call world->Step(), ensuring that the timeStep passed to Step() is fixed.
     * This method is to be called once a frame ( by PhysicsAutomatism ).
     */
    void StepWorld(float dt, int v, int p);

private:
    float scaleX;
    float scaleY;
    float invScaleX;
    float invScaleY;

    float fixedTimeStep; ///< Time step between to call to world->Step(...). Box2D need a fixed time step to ensure reliable simulation.
    unsigned int maxSteps; ///< Maximum steps per frames, to prevent slow down (a slow down will force the computer to make more steps which will force it to make even more steps...)

    float totalTime;
};

#endif // RUNTIMESCENEPHYSICSDATAS_H

