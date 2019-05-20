/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef TOPDOWNMOVEMENTRUNTIMEBEHAVIOR_H
#define TOPDOWNMOVEMENTRUNTIMEBEHAVIOR_H
#include <SFML/System/Vector2.hpp>
#include <vector>
#include "GDCpp/Runtime/RuntimeBehavior.h"
#include "GDCpp/Runtime/RuntimeObject.h"
class RuntimeScene;
namespace gd {
class SerializerElement;
}

/**
 * \brief Allow to move an object in 4 or 8 directions.
 */
class GD_EXTENSION_API TopDownMovementRuntimeBehavior : public RuntimeBehavior {
 public:
  TopDownMovementRuntimeBehavior(const gd::SerializerElement& behaviorContent);
  virtual ~TopDownMovementRuntimeBehavior(){};
  virtual TopDownMovementRuntimeBehavior* Clone() const {
    return new TopDownMovementRuntimeBehavior(*this);
  }

  // Configuration:
  bool DiagonalsAllowed() const { return allowDiagonals; };
  float GetAcceleration() const { return acceleration; };
  float GetDeceleration() const { return deceleration; };
  float GetMaxSpeed() const { return maxSpeed; };
  float GetAngularMaxSpeed() const { return angularMaxSpeed; };
  bool IsObjectRotated() const { return rotateObject; }
  float GetAngleOffset() const { return angleOffset; };

  void SetAllowDiagonals(bool allowDiagonals_) {
    allowDiagonals = allowDiagonals_;
  };
  void SetAcceleration(float acceleration_) { acceleration = acceleration_; };
  void SetDeceleration(float deceleration_) { deceleration = deceleration_; };
  void SetMaxSpeed(float maxSpeed_) { maxSpeed = maxSpeed_; };
  void SetAngularMaxSpeed(float angularMaxSpeed_) {
    angularMaxSpeed = angularMaxSpeed_;
  };
  void SetRotateObject(bool rotateObject_) { rotateObject = rotateObject_; };
  void SetAngleOffset(float angleOffset_) { angleOffset = angleOffset_; };

  bool IsMoving() const { return xVelocity != 0 || yVelocity != 0; };
  float GetSpeed() const;
  float GetXVelocity() const { return xVelocity; };
  float GetYVelocity() const { return yVelocity; };
  float GetAngle() const { return angle; };

  void IgnoreDefaultControls(bool ignore = true) {
    ignoreDefaultControls = ignore;
  };
  void SimulateControl(const gd::String& input);
  void SimulateLeftKey() { leftKey = true; };
  void SimulateRightKey() { rightKey = true; };
  void SimulateUpKey() { upKey = true; };
  void SimulateDownKey() { downKey = true; };

 private:
  virtual void DoStepPreEvents(RuntimeScene& scene);

  // Behavior configuration:
  bool allowDiagonals;
  float acceleration;
  float deceleration;
  float maxSpeed;
  float angularMaxSpeed;
  bool rotateObject;  ///< If true, the object is rotated according to the
                      ///< current segment's angle.
  float angleOffset;  ///< Angle offset (added to the angle calculated with the
                      ///< segment)

  // Attributes used when moving
  float xVelocity;
  float yVelocity;
  float angularSpeed;
  float angle;  // The latest angle of movement, in degrees.

  bool ignoreDefaultControls;  ///< If set to true, do not track the default
                               ///< inputs.
  bool leftKey;
  bool rightKey;
  bool upKey;
  bool downKey;
};
#endif  // TOPDOWNMOVEMENTRUNTIMEBEHAVIOR_H
