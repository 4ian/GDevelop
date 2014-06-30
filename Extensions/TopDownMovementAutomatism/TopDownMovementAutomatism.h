/**

Game Develop - Top-down movement Automatism Extension
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

#ifndef TOPDOWNMOVEMENTAUTOMATISM_H
#define TOPDOWNMOVEMENTAUTOMATISM_H
#include "GDCpp/Automatism.h"
#include "GDCpp/Object.h"
#include <SFML/System/Vector2.hpp>
#include <vector>
namespace gd { class Layout; }
class RuntimeScene;
class PlatformAutomatism;
class ScenePathfindingObstaclesManager;
namespace gd { class SerializerElement; }
class RuntimeScenePlatformData;

/**
 * \brief Compute path for objects avoiding obstacles
 */
class GD_EXTENSION_API TopDownMovementAutomatism : public Automatism
{
public:
    TopDownMovementAutomatism();
    virtual ~TopDownMovementAutomatism() {};
    virtual Automatism* Clone() const { return new TopDownMovementAutomatism(*this); }

    //Configuration:
    bool DiagonalsAllowed() { return allowDiagonals; };
    float GetAcceleration() { return acceleration; };
    float GetDeceleration() { return deceleration; };
    float GetMaxSpeed() { return maxSpeed; };
    float GetAngularMaxSpeed() { return angularMaxSpeed; };
    bool IsObjectRotated() { return rotateObject; }
    float GetAngleOffset() { return angleOffset; };

    bool SetAllowDiagonals(bool allowDiagonals_) { allowDiagonals = allowDiagonals_; };
    float SetAcceleration(float acceleration_) { acceleration = acceleration_; };
    float SetDeceleration(float deceleration_) { deceleration = deceleration_; };
    float SetMaxSpeed(float maxSpeed_) { maxSpeed = maxSpeed_; };
    float SetAngularMaxSpeed(float angularMaxSpeed_) { angularMaxSpeed = angularMaxSpeed_; };
    bool SetRotateObject(bool rotateObject_) { rotateObject = rotateObject_; };
    float SetAngleOffset(float angleOffset_) { angleOffset = angleOffset_; };

    bool IsMoving() { return xVelocity != 0 || yVelocity != 0; };
    float GetSpeed();

    void IgnoreDefaultControls(bool ignore = true) { ignoreDefaultControls = ignore; };
    void SimulateControl(const std::string & input);
    void SimulateLeftKey() { leftKey = true; };
    void SimulateRightKey() { rightKey = true; };
    void SimulateUpKey() { upKey = true; };
    void SimulateDownKey() { downKey = true; };

    /**
     * \brief Unserialize the automatism
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element);

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize the automatism
     */
    virtual void SerializeTo(gd::SerializerElement & element) const;

    virtual std::map<std::string, gd::PropertyDescriptor> GetProperties(gd::Project & project) const;
    virtual bool UpdateProperty(const std::string & name, const std::string & value, gd::Project & project);
    #endif

private:
    virtual void DoStepPreEvents(RuntimeScene & scene);

    //Automatism configuration:
    bool allowDiagonals;
    float acceleration;
    float deceleration;
    float maxSpeed;
    float angularMaxSpeed;
    bool rotateObject; ///< If true, the object is rotated according to the current segment's angle.
    float angleOffset; ///< Angle offset (added to the angle calculated with the segment)

    //Attributes used when moving
    float xVelocity;
    float yVelocity;
    float angularSpeed;

    bool ignoreDefaultControls; ///< If set to true, do not track the default inputs.
    bool leftKey;
    bool rightKey;
    bool upKey;
    bool downKey;
};
#endif // TOPDOWNMOVEMENTAUTOMATISM_H

