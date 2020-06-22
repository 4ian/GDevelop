/**

GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#ifndef PLATFORMEROBJECTRUNTIMEBEHAVIOR_H
#define PLATFORMEROBJECTRUNTIMEBEHAVIOR_H
#include <SFML/System/Vector2.hpp>
#include <map>
#include <set>
#include "GDCpp/Runtime/RuntimeBehavior.h"
#include "GDCpp/Runtime/RuntimeObject.h"
namespace gd {
class SerializerElement;
}
class RuntimeScene;
class PlatformRuntimeBehavior;
class ScenePlatformObjectsManager;

/**
 * \brief Allows objects to jump and stand on platforms.
 */
class GD_EXTENSION_API PlatformerObjectRuntimeBehavior
    : public RuntimeBehavior {
 public:
  PlatformerObjectRuntimeBehavior(const gd::SerializerElement& behaviorContent);
  virtual ~PlatformerObjectRuntimeBehavior();
  virtual RuntimeBehavior* Clone() const {
    return new PlatformerObjectRuntimeBehavior(*this);
  }

  double GetGravity() const { return gravity; };
  double GetMaxFallingSpeed() const { return maxFallingSpeed; };
  double GetLadderClimbingSpeed() const { return ladderClimbingSpeed; };
  double GetAcceleration() const { return acceleration; };
  double GetDeceleration() const { return deceleration; };
  double GetMaxSpeed() const { return maxSpeed; };
  double GetJumpSpeed() const { return jumpSpeed; };
  double GetCurrentFallSpeed() const { return currentFallSpeed; };
  double GetCurrentSpeed() const { return currentSpeed; };
  double GetCurrentJumpSpeed() const { return currentJumpSpeed; };
  double GetSlopeMaxAngle() const { return slopeMaxAngle; };
  bool CanGrabPlatforms() const { return canGrabPlatforms; };
  bool CanJump() const { return canJump; };

  void SetGravity(double gravity_) { gravity = gravity_; };
  void SetMaxFallingSpeed(double maxFallingSpeed_) {
    maxFallingSpeed = maxFallingSpeed_;
  };
  void SetLadderClimbingSpeed(double ladderClimbingSpeed_) { ladderClimbingSpeed = ladderClimbingSpeed_; };
  void SetAcceleration(double acceleration_) { acceleration = acceleration_; };
  void SetDeceleration(double deceleration_) { deceleration = deceleration_; };
  void SetMaxSpeed(double maxSpeed_) { maxSpeed = maxSpeed_; };
  void SetJumpSpeed(double jumpSpeed_) { jumpSpeed = jumpSpeed_; };
  bool SetSlopeMaxAngle(double slopeMaxAngle_);
  void SetCanJump() { canJump = true; };
  void SetCanGrabPlatforms(bool enable);

  void IgnoreDefaultControls(bool ignore = true) {
    ignoreDefaultControls = ignore;
  };
  void SimulateControl(const gd::String& input);
  void SimulateLeftKey() { leftKey = true; };
  void SimulateRightKey() { rightKey = true; };
  void SimulateLadderKey() { ladderKey = true; };
  void SimulateUpKey() { upKey = true; };
  void SimulateDownKey() { downKey = true; };
  void SimulateJumpKey() { jumpKey = true; };
  void SimulateReleaseKey() { releaseKey = true; };

  bool IsOnFloor() const { return isOnFloor; }
  bool IsOnLadder() const { return isOnLadder; }
  bool IsJumping() const { return jumping; }
  bool IsFalling() const {
    return !isOnFloor && !isGrabbingPlatform && !isOnLadder &&
           (!jumping || currentJumpSpeed < currentFallSpeed);
  }
  bool IsMoving() const {
    return (currentSpeed != 0 && hasReallyMoved) || currentJumpSpeed != 0 ||
           currentFallSpeed != 0;
  }
  bool IsGrabbingPlatform() const { return isGrabbingPlatform; }

  virtual void OnOwnerChanged();

 private:
  virtual void DoStepPreEvents(RuntimeScene& scene);
  virtual void DoStepPostEvents(RuntimeScene& scene);

  /**
   * \brief Return a list of all the platforms that could be colliding with the
   * object if it is moved. \param maxMovementLength The maximum length of any
   * movement that could be done by the object, in pixels. \warning sceneManager
   * must be valid and not NULL.
   */
  std::set<PlatformRuntimeBehavior*> GetPotentialCollidingObjects(
      double maxMovementLength);

  /**
   * \brief Separate the object from all platforms passed as parameter, except
   * ladders. \param candidates The platform to be tested for collision \param
   * excludeJumpThrus If set to true, the jump thru platform will be excluded.
   */
  bool SeparateFromPlatforms(
      const std::set<PlatformRuntimeBehavior*>& candidates,
      bool excludeJumpThrus);

  /**
   * \brief Among the platforms passed in parameter, return a list of the
   * platforms colliding with the object. \note Ladders are *always* excluded
   * from the test. \param candidates The platform to be tested for collision
   * \param exceptTheseOnes The platforms to be excluded from the test
   */
  std::set<PlatformRuntimeBehavior*> GetPlatformsCollidingWith(
      const std::set<PlatformRuntimeBehavior*>& candidates,
      const std::set<PlatformRuntimeBehavior*>& exceptTheseOnes);

  /**
   * \brief Among the platforms passed in parameter, return true if there is a
   * platform colliding with the object. \note Ladders are *always* excluded
   * from the test. \param candidates The platform to be tested for collision
   * \param exceptThisOne If not NULL, this platform won't be tested for
   * collision. \param excludeJumpThrus If set to true, the jump thru platform
   * will be excluded.
   */
  bool IsCollidingWith(const std::set<PlatformRuntimeBehavior*>& candidates,
                       PlatformRuntimeBehavior* exceptThisOne = NULL,
                       bool excludeJumpThrus = false);

  /**
   * \brief Among the platforms passed in parameter, return true if there is a
   * platform colliding with the object. \note Ladders are *always* excluded
   * from the test. \param candidates The platforms to be tested for collision
   * \param exceptTheseOnes The platforms to be excluded from the test
   */
  bool IsCollidingWith(
      const std::set<PlatformRuntimeBehavior*>& candidates,
      const std::set<PlatformRuntimeBehavior*>& exceptTheseOnes);

  /**
   * \brief Among the platforms passed in parameter, return true if the object
   * is overlapping a ladder. \param candidates The platform to be tested for
   * collision
   */
  bool IsOverlappingLadder(
      const std::set<PlatformRuntimeBehavior*>& candidates);

  /**
   * \brief Among the platforms passed in parameter, return a list of the jump
   * thru platforms colliding with the object. \param candidates The platform to
   * be tested for collision
   */
  std::set<PlatformRuntimeBehavior*> GetJumpthruCollidingWith(
      const std::set<PlatformRuntimeBehavior*>& candidates);

  /**
   * \brief Return true if the object owning the behavior can grab the specified
   * platform. There must be a collision between the object and the platform.
   * \param platform The platform the object is in collision with
   * \param y Grabbing will be allowed if the object is above the platform but
   * the distance is less than this parameter.
   */
  bool CanGrab(PlatformRuntimeBehavior* platform, double y) const;

  /**
   * \brief Mark the platformer object has not being grabbing any platform.
   */
  void ReleaseGrabbedPlatform();

  bool ignoreTouchingEdges;  // To achieve pixel-perfect precision when
                             // positioning object on platform or handling
                             // collision with "walls", edges of the hitboxes
                             // must be ignored during collision checks, so that
                             // two overlapping edges are not considered as
                             // colliding. For example, if a character is 10px
                             // width and is at position (0, 0), it must not be
                             // considered as colliding with a platform which is
                             // at position (10, 0). Edges will still be
                             // overlapping (because character hitbox right edge
                             // is at X position 10 and platform hitbox left
                             // edge is also at X position 10). This parameter
                             // "ignoreTouchingEdges" will be passed to all
                             // collision handling functions.
  bool roundCoordinates;   ///< true to round coordinates when trying to move on
                           ///< X and Y axis.
  double gravity;          ///< In pixels.seconds^-2
  double maxFallingSpeed;  ///< In pixels.seconds^-1
  double ladderClimbingSpeed; ///<In pixels.seconds^-1
  double acceleration;     ///< In pixels.seconds^-2
  double deceleration;     ///< In pixels.seconds^-2
  double maxSpeed;         ///< In pixels.seconds^-1
  double jumpSpeed;        ///< In pixels.seconds^-1
  double slopeMaxAngle;    ///< In degrees
  double slopeClimbingFactor;  ///< Equals to tan(slopeMaxAngle).
  bool canGrabPlatforms;  ///< True to allow the object to grab platform ledges.
  double yGrabOffset;
  double xGrabTolerance;  ///< Maximum distance, in pixels, on X axis that can
                          ///< be used to grab a platform.

  RuntimeScene* parentScene;  ///< The scene the object belongs to.
  ScenePlatformObjectsManager*
      sceneManager;  ///< The platform objects manager associated to the scene.
  bool isOnFloor;    ///< True if the object is on a floor.
  bool isOnLadder;   ///< True if the object is on a ladder.
  PlatformRuntimeBehavior* floorPlatform;  ///< The platform the object is on,
                                           ///< when isOnFloor == true.
  double floorLastX;        ///< The last X position of the floor platform, when
                            ///< isOnFloor == true.
  double floorLastY;        ///< The last Y position of the floor platform, when
                            ///< isOnFloor == true.
  double currentFallSpeed;  ///< The current speed of the fall, when isOnFloor
                            ///< == false.
  double currentSpeed;      ///< The current speed in the left/right direction.
  bool jumping;             ///< True if the object is jumping.
  double currentJumpSpeed;  ///< The current speed of the jump, when jumping ==
                            ///< true.
  bool canJump;             ///< True if the object can jump.
  bool hasReallyMoved;      ///< Used for IsMoving(): Only set to true when the
                            ///< object has moved from more than 1 pixel
                            ///< horizontally.
  bool isGrabbingPlatform;  ///< True if the object is on a ladder.
  PlatformRuntimeBehavior*
      grabbedPlatform;          ///< The platform the object is on, when
                                ///< isGrabbingPlatform == true.
  double grabbedPlatformLastX;  ///< The last X position of the grabbed
                                ///< platform, when isGrabbingPlatform == true.
  double grabbedPlatformLastY;  ///< The last Y position of the grabbed
                                ///< platform, when isGrabbingPlatform == true.

  // Object size tracking:
  bool trackSize;   ///< If true, the behavior try to change the object position
                    ///< to avoid glitch when size change.
  float oldHeight;  ///< Object old height, used to track changes in height.

  bool ignoreDefaultControls;  ///< If set to true, do not track the default
                               ///< inputs.
  bool leftKey;
  bool rightKey;
  bool ladderKey;
  bool upKey;
  bool downKey;
  bool jumpKey;
  bool releaseKey;
};
#endif  // PLATFORMEROBJECTRUNTIMEBEHAVIOR_H
