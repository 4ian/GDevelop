/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "PlatformerObjectRuntimeBehavior.h"
#include <SFML/Window.hpp>
#include <algorithm>
#include <cmath>
#include <iostream>
#include <memory>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "PlatformRuntimeBehavior.h"
#include "ScenePlatformObjectsManager.h"

PlatformerObjectRuntimeBehavior::PlatformerObjectRuntimeBehavior(
    const gd::SerializerElement& behaviorContent)
    : RuntimeBehavior(behaviorContent),
      ignoreTouchingEdges(true),
      roundCoordinates(true),
      gravity(1000),
      maxFallingSpeed(700),
      ladderClimbingSpeed(150),
      acceleration(1500),
      deceleration(1500),
      maxSpeed(250),
      jumpSpeed(600),
      canGrabPlatforms(false),
      yGrabOffset(0),
      xGrabTolerance(10),
      parentScene(NULL),
      sceneManager(NULL),
      isOnFloor(false),
      isOnLadder(false),
      floorPlatform(NULL),
      currentFallSpeed(0),
      currentSpeed(0),
      jumping(false),
      currentJumpSpeed(0),
      canJump(false),
      hasReallyMoved(false),
      isGrabbingPlatform(false),
      grabbedPlatform(NULL),
      grabbedPlatformLastX(0),
      grabbedPlatformLastY(0),
      trackSize(true),
      ignoreDefaultControls(false),
      leftKey(false),
      rightKey(false),
      ladderKey(false),
      upKey(false),
      downKey(false),
      jumpKey(false),
      releaseKey(false) {
  SetSlopeMaxAngle(60);

  roundCoordinates =
      behaviorContent.GetBoolAttribute("roundCoordinates", false);
  gravity = behaviorContent.GetDoubleAttribute("gravity");
  maxFallingSpeed = behaviorContent.GetDoubleAttribute("maxFallingSpeed");
  ladderClimbingSpeed = behaviorContent.GetDoubleAttribute("ladderClimbingSpeed");
  acceleration = behaviorContent.GetDoubleAttribute("acceleration");
  deceleration = behaviorContent.GetDoubleAttribute("deceleration");
  maxSpeed = behaviorContent.GetDoubleAttribute("maxSpeed");
  jumpSpeed = behaviorContent.GetDoubleAttribute("jumpSpeed");
  ignoreDefaultControls =
      behaviorContent.GetBoolAttribute("ignoreDefaultControls");
  SetSlopeMaxAngle(behaviorContent.GetDoubleAttribute("slopeMaxAngle"));
  canGrabPlatforms =
      behaviorContent.GetBoolAttribute("canGrabPlatforms", false);
  yGrabOffset = behaviorContent.GetDoubleAttribute("yGrabOffset");
  xGrabTolerance = behaviorContent.GetDoubleAttribute("xGrabTolerance", 10);
}

PlatformerObjectRuntimeBehavior::~PlatformerObjectRuntimeBehavior() {}

void PlatformerObjectRuntimeBehavior::OnOwnerChanged() {
  oldHeight = object->GetHeight();
}

bool PlatformerObjectRuntimeBehavior::SetSlopeMaxAngle(double newMaxAngle) {
  if (newMaxAngle < 0 || newMaxAngle >= 90) return false;

  slopeMaxAngle = newMaxAngle;
  if (slopeMaxAngle == 45)
    slopeClimbingFactor = 1;  // Avoid rounding errors
  else
    slopeClimbingFactor = tan(slopeMaxAngle * 3.1415926 / 180);

  return true;
}

void PlatformerObjectRuntimeBehavior::DoStepPreEvents(RuntimeScene& scene) {
  if (parentScene != &scene)  // Parent scene has changed
  {
    parentScene = &scene;
    sceneManager =
        parentScene ? &ScenePlatformObjectsManager::managers[&scene] : NULL;
    floorPlatform = NULL;
  }

  if (!sceneManager) return;

  double timeDelta =
      static_cast<double>(object->GetElapsedTime(scene)) / 1000000.0;

  // 0.1) Get the player input:

  double requestedDeltaX = 0;
  double requestedDeltaY = 0;

  // Change the speed according to the player's input.
  leftKey |=
      !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Left");
  rightKey |=
      !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Right");
  if (leftKey) currentSpeed -= acceleration * timeDelta;
  if (rightKey) currentSpeed += acceleration * timeDelta;

  // Take deceleration into account only if no key is pressed.
  if (leftKey == rightKey) {
    bool wasPositive = currentSpeed > 0;
    currentSpeed -= deceleration * timeDelta * (wasPositive ? 1.0 : -1.0);

    // Set the speed to 0 if the speed was top low.
    if (wasPositive && currentSpeed < 0) currentSpeed = 0;
    if (!wasPositive && currentSpeed > 0) currentSpeed = 0;
  }

  if (currentSpeed > maxSpeed) currentSpeed = maxSpeed;
  if (currentSpeed < -maxSpeed) currentSpeed = -maxSpeed;
  requestedDeltaX += currentSpeed * timeDelta;

  // Compute the list of the objects that will be used
  std::set<PlatformRuntimeBehavior*> potentialObjects =
      GetPotentialCollidingObjects(std::max(requestedDeltaX, maxFallingSpeed));
  std::set<PlatformRuntimeBehavior*> overlappedJumpThru =
      GetJumpthruCollidingWith(potentialObjects);

  // Check that the floor object still exists and is near the object.
  if (isOnFloor &&
      potentialObjects.find(floorPlatform) == potentialObjects.end()) {
    isOnFloor = false;
    floorPlatform = NULL;
  }

  // Check that the grabbed platform object still exists and is near the object.
  if (isGrabbingPlatform &&
      potentialObjects.find(grabbedPlatform) == potentialObjects.end()) {
    ReleaseGrabbedPlatform();
  }

  // 0.2) Track changes in object size

  // Stick the object to the floor if its height has changed.
  if (trackSize && isOnFloor && oldHeight != object->GetHeight() &&
      !scene.GetTimeManager().IsFirstLoop()) {
    object->SetY(floorLastY - object->GetHeight() +
                 (object->GetY() - object->GetDrawableY()) - 1);
  }

  oldHeight = object->GetHeight();

  // 1) X axis:

  // Shift the object according to the floor movement.
  if (isOnFloor) {
    requestedDeltaX += floorPlatform->GetObject()->GetX() - floorLastX;
    requestedDeltaY += floorPlatform->GetObject()->GetY() - floorLastY;
  }

  // Shift the object according to the grabbed platform movement.
  if (isGrabbingPlatform) {
    // This erases any other movement
    requestedDeltaX =
        grabbedPlatform->GetObject()->GetX() - grabbedPlatformLastX;
    requestedDeltaY =
        grabbedPlatform->GetObject()->GetY() - grabbedPlatformLastY;
  }

  // Ensure the object is not stuck
  if (SeparateFromPlatforms(potentialObjects, true)) {
    canJump =
        true;  // After being unstuck, the object must be able to jump again.
  }

  // Move the object on x axis.
  double oldX = object->GetX();
  if (requestedDeltaX != 0) {
    object->SetX(object->GetX() + requestedDeltaX);
    bool tryRounding = true;
    // Colliding: Try to push out from the solid.
    // Note that jump thru are never obstacle on X axis.
    while (IsCollidingWith(
        potentialObjects, floorPlatform, /*excludeJumpthrus=*/true)) {
      if ((requestedDeltaX > 0 && object->GetX() <= oldX) ||
          (requestedDeltaX < 0 && object->GetX() >= oldX)) {
        object->SetX(oldX);  // Unable to move the object without being stuck in
                             // an obstacle.
        break;
      }

      // If on floor: try get up a bit to bypass not perfectly aligned floors.
      if (isOnFloor) {
        object->SetY(object->GetY() - 1);
        if (!IsCollidingWith(
                potentialObjects, floorPlatform, /*excludeJumpthrus=*/true))
          break;
        object->SetY(object->GetY() + 1);
      }

      if (tryRounding) {
        // First try rounding the position as this might be sufficient to get
        // the object out of the wall.
        object->SetX(GDRound(object->GetX()));
        tryRounding = false;
      } else {
        object->SetX(GDRound(object->GetX()) + (requestedDeltaX > 0 ? -1 : 1));
      }
      currentSpeed = 0;  // Collided with a wall
    }
  }

  // 2) Y axis:

  // Go on a ladder
  ladderKey |=
      !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Up");
  if (ladderKey && IsOverlappingLadder(potentialObjects)) {
    canJump = true;
    isOnFloor = false;
    floorPlatform = NULL;
    currentJumpSpeed = 0;
    currentFallSpeed = 0;
    isOnLadder = true;
  }

  if (isOnLadder) {
    upKey |=
        !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Up");
    downKey |=
        !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Down");
    if (upKey) requestedDeltaY -= ladderClimbingSpeed * timeDelta;
    if (downKey) requestedDeltaY += ladderClimbingSpeed * timeDelta;

    // Coming to an extremity of a ladder
    if (!IsOverlappingLadder(potentialObjects)) {
      isOnLadder = false;
    }
  }

  // Fall
  if (!isOnFloor && !isOnLadder && !isGrabbingPlatform) {
    currentFallSpeed += gravity * timeDelta;
    if (currentFallSpeed > maxFallingSpeed) currentFallSpeed = maxFallingSpeed;

    requestedDeltaY += currentFallSpeed * timeDelta;
    requestedDeltaY = std::min(requestedDeltaY, maxFallingSpeed * timeDelta);
  }

  // Grabbing a platform
  if (canGrabPlatforms && requestedDeltaX != 0 && !isOnLadder && !isOnFloor) {
    bool tryGrabbingPlatform = false;

    object->SetX(object->GetX() +
                 (requestedDeltaX > 0 ? xGrabTolerance : -xGrabTolerance));
    auto collidingObjects =
        GetPlatformsCollidingWith(potentialObjects, overlappedJumpThru);
    if (!collidingObjects.empty() &&
        CanGrab(*collidingObjects.begin(), requestedDeltaY)) {
      tryGrabbingPlatform = true;
    }
    object->SetX(object->GetX() +
                 (requestedDeltaX > 0 ? -xGrabTolerance : xGrabTolerance));

    // Check if we can grab the collided platform
    if (tryGrabbingPlatform) {
      double oldY = object->GetY();
      PlatformRuntimeBehavior* collidingPlatform = *collidingObjects.begin();
      object->SetY(collidingPlatform->GetObject()->GetY() +
                   collidingPlatform->GetYGrabOffset() - yGrabOffset);
      if (!IsCollidingWith(potentialObjects, NULL, /*excludeJumpthrus=*/true)) {
        isGrabbingPlatform = true;
        grabbedPlatform = collidingPlatform;
        requestedDeltaY = 0;
      } else {
        object->SetY(oldY);
      }
    }
  }

  releaseKey |=
      !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Down");
  if (isGrabbingPlatform && !releaseKey) {
    canJump = true;
    currentJumpSpeed = 0;
    currentFallSpeed = 0;
    grabbedPlatformLastX = grabbedPlatform->GetObject()->GetX();
    grabbedPlatformLastY = grabbedPlatform->GetObject()->GetY();
  }
  if (releaseKey) ReleaseGrabbedPlatform();

  // Jumping
  jumpKey |= !ignoreDefaultControls &&
             (scene.GetInputManager().IsKeyPressed("LShift") ||
              scene.GetInputManager().IsKeyPressed("RShift") ||
              scene.GetInputManager().IsKeyPressed("Space"));
  if (canJump && jumpKey) {
    jumping = true;
    canJump = false;
    // isOnFloor = false; If floor is a very steep slope, the object could go
    // into it.
    isOnLadder = false;
    currentJumpSpeed = jumpSpeed;
    currentFallSpeed = 0;
    isGrabbingPlatform = false;
    // object->SetY(object->GetY()-1);
  }

  if (jumping) {
    // TODO: Port the jump sustain feature
    requestedDeltaY -= currentJumpSpeed * timeDelta;
    currentJumpSpeed -= gravity * timeDelta;
    if (currentJumpSpeed < 0) {
      currentJumpSpeed = 0;
      jumping = false;
    }
  }

  // Follow the floor
  if (isOnFloor) {
    if (object->IsCollidingWith(floorPlatform->GetObject(),
                                ignoreTouchingEdges)) {
      // Floor is getting up, as the object is colliding with it.
      double oldY = object->GetY();
      int step = 0;
      bool stillInFloor = false;
      do {
        if (step >=
            floor(std::abs(
                requestedDeltaX *
                slopeClimbingFactor)))  // Slope is too step ( > max angle )
        {
          object->SetY(object->GetY() -
                       (std::abs(requestedDeltaX * slopeClimbingFactor) -
                        (double)step));  // Try to add the decimal part.
          if (object->IsCollidingWith(floorPlatform->GetObject(),
                                      ignoreTouchingEdges))
            stillInFloor = true;  // Too steep.

          break;
        }

        // Try to get out of the floor.
        object->SetY(object->GetY() - 1);
        step++;
      } while (object->IsCollidingWith(floorPlatform->GetObject(),
                                       ignoreTouchingEdges));

      if (stillInFloor) {
        object->SetY(oldY);  // Unable to follow the floor ( too steep ): Go
                             // back to the original position.
        object->SetX(oldX);  // And also revert the shift on X axis.
      }
    } else {
      // Floor is flat or get down.
      double oldY = object->GetY();
      double tentativeStartY = object->GetY() + 1;
      object->SetY(roundCoordinates ? GDRound(tentativeStartY)
                                    : tentativeStartY);
      int step = 0;
      bool noMoreOnFloor = false;
      while (!IsCollidingWith(potentialObjects)) {
        if (step >
            std::abs(requestedDeltaX *
                     slopeClimbingFactor))  // Slope is too step ( > 50% )
        {
          noMoreOnFloor = true;
          break;
        }

        // Object was on floor, but no more: Maybe a slope, try to follow it.
        object->SetY(object->GetY() + 1);
        step++;
      }
      if (noMoreOnFloor)
        object->SetY(oldY);  // Unable to follow the floor: Go back to the
                             // original position. Fall will be triggered next
                             // tick.
      else
        object->SetY(object->GetY() -
                     1);  // Floor touched: Go back 1 pixel over.
    }
  }

  // Move the object on Y axis
  if (requestedDeltaY != 0) {
    double oldY = object->GetY();
    object->SetY(object->GetY() + requestedDeltaY);

    // Stop when colliding with an obstacle.
    while ((requestedDeltaY < 0 &&
            IsCollidingWith(potentialObjects,
                            NULL,
                            /*excludeJumpThrus=*/true))  // Jumpthru = obstacle
                                                         // <=> Never when going
                                                         // up
           || (requestedDeltaY > 0 &&
               IsCollidingWith(potentialObjects,
                               overlappedJumpThru)))  // Jumpthru = obstacle <=>
                                                      // Only if not already
                                                      // overlapped when goign
                                                      // down
    {
      jumping = false;
      currentJumpSpeed = 0;
      if ((requestedDeltaY > 0 && object->GetY() <= oldY) ||
          (requestedDeltaY < 0 && object->GetY() >= oldY)) {
        object->SetY(oldY);  // Unable to move the object without being stuck in
                             // an obstacle.
        break;
      }

      object->SetY(floor(object->GetY()) + (requestedDeltaY > 0 ? -1 : 1));
    }
  }

  // 3) Update the current floor data for the next tick:
  overlappedJumpThru = GetJumpthruCollidingWith(potentialObjects);
  if (!isOnLadder) {
    // Check if the object is on a floor:
    // In priority, check if the last floor platform is still the floor.
    double oldY = object->GetY();
    object->SetY(object->GetY() + 1);
    if (isOnFloor && object->IsCollidingWith(floorPlatform->GetObject(),
                                             ignoreTouchingEdges)) {
      // Still on the same floor
      floorLastX = floorPlatform->GetObject()->GetX();
      floorLastY = floorPlatform->GetObject()->GetY();
    } else {
      // Avoid landing on a platform if the object is not going down.
      // (which could happen for a jumpthru, when the object jump and pass just
      // at the top of a jumpthru, it could be considered as landing if not for
      // this extra check).
      bool canLand = requestedDeltaY >= 0;

      // Check if landing on a new floor: (Exclude already overlapped jump thru)
      std::set<PlatformRuntimeBehavior*> collidingObjects =
          GetPlatformsCollidingWith(potentialObjects, overlappedJumpThru);
      if (canLand && !collidingObjects.empty()) {  // Just landed on floor
        isOnFloor = true;
        canJump = true;
        jumping = false;
        currentJumpSpeed = 0;
        currentFallSpeed = 0;

        floorPlatform = *collidingObjects.begin();
        floorLastX = floorPlatform->GetObject()->GetX();
        floorLastY = floorPlatform->GetObject()->GetY();

        ReleaseGrabbedPlatform();  // Ensure nothing is grabbed.
      } else {                     // In the air
        canJump = false;
        isOnFloor = false;
        floorPlatform = NULL;
      }
    }
    object->SetY(oldY);
  }

  // 4) Do not forget to reset pressed keys
  leftKey = false;
  rightKey = false;
  ladderKey = false;
  upKey = false;
  downKey = false;
  jumpKey = false;
  releaseKey = false;

  // 5) Track the movement
  hasReallyMoved = std::abs(object->GetX() - oldX) >= 1;
}

bool PlatformerObjectRuntimeBehavior::CanGrab(PlatformRuntimeBehavior* platform,
                                              double requestedDeltaY) const {
  double y1 = object->GetY() + yGrabOffset;
  double y2 = object->GetY() + yGrabOffset + requestedDeltaY;
  double platformY = platform->GetObject()->GetY() + platform->GetYGrabOffset();

  return (platform->CanBeGrabbed() && ((y1 < platformY && platformY < y2) ||
                                       (y2 < platformY && platformY < y1)));
}

void PlatformerObjectRuntimeBehavior::SetCanGrabPlatforms(bool enable) {
  canGrabPlatforms = enable;
  if (!enable) ReleaseGrabbedPlatform();
}

void PlatformerObjectRuntimeBehavior::ReleaseGrabbedPlatform() {
  isGrabbingPlatform = false;  // Ensure nothing is grabbed.
  grabbedPlatform = nullptr;
}

bool PlatformerObjectRuntimeBehavior::SeparateFromPlatforms(
    const std::set<PlatformRuntimeBehavior*>& candidates,
    bool excludeJumpThrus) {
  std::vector<RuntimeObject*> objects;
  for (std::set<PlatformRuntimeBehavior*>::iterator it = candidates.begin();
       it != candidates.end();
       ++it) {
    if ((*it)->GetPlatformType() == PlatformRuntimeBehavior::Ladder) continue;
    if (excludeJumpThrus &&
        (*it)->GetPlatformType() == PlatformRuntimeBehavior::Jumpthru)
      continue;

    objects.push_back((*it)->GetObject());
  }

  return object->SeparateFromObjects(objects, ignoreTouchingEdges);
}

std::set<PlatformRuntimeBehavior*>
PlatformerObjectRuntimeBehavior::GetPlatformsCollidingWith(
    const std::set<PlatformRuntimeBehavior*>& candidates,
    const std::set<PlatformRuntimeBehavior*>& exceptTheseOnes) {
  // TODO: This function could be refactored to return only the first colliding
  // platform.
  std::set<PlatformRuntimeBehavior*> result;
  for (std::set<PlatformRuntimeBehavior*>::iterator it = candidates.begin();
       it != candidates.end();
       ++it) {
    if (exceptTheseOnes.find(*it) != exceptTheseOnes.end()) continue;
    if ((*it)->GetPlatformType() == PlatformRuntimeBehavior::Ladder) continue;

    if (object->IsCollidingWith((*it)->GetObject(), ignoreTouchingEdges))
      result.insert(*it);
  }

  return result;
}

bool PlatformerObjectRuntimeBehavior::IsCollidingWith(
    const std::set<PlatformRuntimeBehavior*>& candidates,
    PlatformRuntimeBehavior* exceptThisOne,
    bool excludeJumpThrus) {
  for (std::set<PlatformRuntimeBehavior*>::iterator it = candidates.begin();
       it != candidates.end();
       ++it) {
    if (*it == exceptThisOne) continue;
    if ((*it)->GetPlatformType() == PlatformRuntimeBehavior::Ladder) continue;
    if (excludeJumpThrus &&
        (*it)->GetPlatformType() == PlatformRuntimeBehavior::Jumpthru)
      continue;

    if (object->IsCollidingWith((*it)->GetObject(), ignoreTouchingEdges))
      return true;
  }

  return false;
}

bool PlatformerObjectRuntimeBehavior::IsCollidingWith(
    const std::set<PlatformRuntimeBehavior*>& candidates,
    const std::set<PlatformRuntimeBehavior*>& exceptTheseOnes) {
  for (std::set<PlatformRuntimeBehavior*>::iterator it = candidates.begin();
       it != candidates.end();
       ++it) {
    if (exceptTheseOnes.find(*it) != exceptTheseOnes.end()) continue;
    if ((*it)->GetPlatformType() == PlatformRuntimeBehavior::Ladder) continue;

    if (object->IsCollidingWith((*it)->GetObject(), ignoreTouchingEdges))
      return true;
  }

  return false;
}

std::set<PlatformRuntimeBehavior*>
PlatformerObjectRuntimeBehavior::GetJumpthruCollidingWith(
    const std::set<PlatformRuntimeBehavior*>& candidates) {
  std::set<PlatformRuntimeBehavior*> result;
  for (std::set<PlatformRuntimeBehavior*>::iterator it = candidates.begin();
       it != candidates.end();
       ++it) {
    if ((*it)->GetPlatformType() != PlatformRuntimeBehavior::Jumpthru) continue;

    if (object->IsCollidingWith((*it)->GetObject(), ignoreTouchingEdges))
      result.insert(*it);
  }

  return result;
}

bool PlatformerObjectRuntimeBehavior::IsOverlappingLadder(
    const std::set<PlatformRuntimeBehavior*>& candidates) {
  for (std::set<PlatformRuntimeBehavior*>::iterator it = candidates.begin();
       it != candidates.end();
       ++it) {
    if ((*it)->GetPlatformType() != PlatformRuntimeBehavior::Ladder) continue;
    if (object->IsCollidingWith((*it)->GetObject(), ignoreTouchingEdges))
      return true;
  }

  return false;
}

std::set<PlatformRuntimeBehavior*>
PlatformerObjectRuntimeBehavior::GetPotentialCollidingObjects(
    double maxMovementLength) {
  // Compute the "bounding circle" radius of the object.
  float o1w = object->GetWidth();
  float o1h = object->GetHeight();
  float obj1BoundingRadius =
      sqrt(o1w * o1w + o1h * o1h) / 2.0 +
      maxMovementLength / 2.0;  // Add to it the maximum magnitude of movement.

  std::set<PlatformRuntimeBehavior*> potentialObjects;
  for (std::set<PlatformRuntimeBehavior*>::iterator it =
           sceneManager->GetAllPlatforms().begin();
       it != sceneManager->GetAllPlatforms().end();
       ++it) {
    // First check if bounding circle are too far.
    RuntimeObject* obj2 = (*it)->GetObject();
    float o2w = obj2->GetWidth();
    float o2h = obj2->GetHeight();

    float x = object->GetDrawableX() + object->GetCenterX() -
              (obj2->GetDrawableX() + obj2->GetCenterX());
    float y = object->GetDrawableY() + object->GetCenterY() -
              (obj2->GetDrawableY() + obj2->GetCenterY());
    float obj2BoundingRadius = sqrt(o2w * o2w + o2h * o2h) / 2.0;

    if (sqrt(x * x + y * y) <= obj1BoundingRadius + obj2BoundingRadius) {
      potentialObjects.insert(*it);
    }
  }

  return potentialObjects;
}

void PlatformerObjectRuntimeBehavior::DoStepPostEvents(RuntimeScene& scene) {
  if (parentScene != &scene)  // Parent scene has changed
  {
    parentScene = &scene;
    sceneManager =
        parentScene ? &ScenePlatformObjectsManager::managers[&scene] : NULL;
    floorPlatform = NULL;
  }
}

void PlatformerObjectRuntimeBehavior::SimulateControl(const gd::String& input) {
  if (input == "Left")
    leftKey = true;
  else if (input == "Right")
    rightKey = true;
  else if (input == "Up")
    upKey = true;
  else if (input == "Down")
    downKey = true;
  else if (input == "Ladder")
    ladderKey = true;
  else if (input == "Jump")
    jumpKey = true;
  else if (input == "Release")
    releaseKey = true;
}
