/**

GDevelop - Top-down movement Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
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
 * \brief Allow to move an object in 4 or 8 directions.
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

