/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TOPDOWNMOVEMENTBEHAVIOR_H
#define TOPDOWNMOVEMENTBEHAVIOR_H
#include "GDCpp/Project/Behavior.h"
#include "GDCpp/Project/Object.h"
#include <SFML/System/Vector2.hpp>
#include <vector>
namespace gd { class Layout; }
class RuntimeScene;
class PlatformBehavior;
class ScenePathfindingObstaclesManager;
namespace gd { class SerializerElement; }
class RuntimeScenePlatformData;

/**
 * \brief Allow to move an object in 4 or 8 directions.
 */
class GD_EXTENSION_API TopDownMovementBehavior : public Behavior
{
public:
    TopDownMovementBehavior();
    virtual ~TopDownMovementBehavior() {};
    virtual Behavior* Clone() const { return new TopDownMovementBehavior(*this); }

    //Configuration:
    bool DiagonalsAllowed() { return allowDiagonals; };
    float GetAcceleration() { return acceleration; };
    float GetDeceleration() { return deceleration; };
    float GetMaxSpeed() { return maxSpeed; };
    float GetAngularMaxSpeed() { return angularMaxSpeed; };
    bool IsObjectRotated() { return rotateObject; }
    float GetAngleOffset() { return angleOffset; };

    void SetAllowDiagonals(bool allowDiagonals_) { allowDiagonals = allowDiagonals_; };
    void SetAcceleration(float acceleration_) { acceleration = acceleration_; };
    void SetDeceleration(float deceleration_) { deceleration = deceleration_; };
    void SetMaxSpeed(float maxSpeed_) { maxSpeed = maxSpeed_; };
    void SetAngularMaxSpeed(float angularMaxSpeed_) { angularMaxSpeed = angularMaxSpeed_; };
    void SetRotateObject(bool rotateObject_) { rotateObject = rotateObject_; };
    void SetAngleOffset(float angleOffset_) { angleOffset = angleOffset_; };

    bool IsMoving() { return xVelocity != 0 || yVelocity != 0; };
    float GetSpeed();

    void IgnoreDefaultControls(bool ignore = true) { ignoreDefaultControls = ignore; };
    void SimulateControl(const gd::String & input);
    void SimulateLeftKey() { leftKey = true; };
    void SimulateRightKey() { rightKey = true; };
    void SimulateUpKey() { upKey = true; };
    void SimulateDownKey() { downKey = true; };

    /**
     * \brief Unserialize the behavior
     */
    virtual void UnserializeFrom(const gd::SerializerElement & element);

    #if defined(GD_IDE_ONLY)
    /**
     * \brief Serialize the behavior
     */
    virtual void SerializeTo(gd::SerializerElement & element) const;

    virtual std::map<gd::String, gd::PropertyDescriptor> GetProperties(gd::Project & project) const;
    virtual bool UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project);
    #endif

private:
    virtual void DoStepPreEvents(RuntimeScene & scene);

    //Behavior configuration:
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
#endif // TOPDOWNMOVEMENTBEHAVIOR_H

