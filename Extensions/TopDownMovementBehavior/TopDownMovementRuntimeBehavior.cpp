/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "TopDownMovementRuntimeBehavior.h"
#include <SFML/Window.hpp>
#include <algorithm>
#include <cmath>
#include <iostream>
#include <memory>
#include <set>
#include "GDCore/CommonTools.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Extensions/Builtin/MathematicalTools.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"

TopDownMovementRuntimeBehavior::TopDownMovementRuntimeBehavior(
    const gd::SerializerElement& behaviorContent)
    : RuntimeBehavior(behaviorContent),
      allowDiagonals(true),
      acceleration(400),
      deceleration(800),
      maxSpeed(200),
      angularMaxSpeed(180),
      rotateObject(true),
      angleOffset(0),
      xVelocity(0),
      yVelocity(0),
      angularSpeed(0),
      angle(0),
      ignoreDefaultControls(false),
      leftKey(false),
      rightKey(false),
      upKey(false),
      downKey(false) {
  allowDiagonals = behaviorContent.GetBoolAttribute("allowDiagonals");
  acceleration = behaviorContent.GetDoubleAttribute("acceleration");
  deceleration = behaviorContent.GetDoubleAttribute("deceleration");
  maxSpeed = behaviorContent.GetDoubleAttribute("maxSpeed");
  angularMaxSpeed = behaviorContent.GetDoubleAttribute("angularMaxSpeed");
  rotateObject = behaviorContent.GetBoolAttribute("rotateObject");
  angleOffset = behaviorContent.GetDoubleAttribute("angleOffset");
  ignoreDefaultControls =
      behaviorContent.GetBoolAttribute("ignoreDefaultControls");
}

float TopDownMovementRuntimeBehavior::GetSpeed() const {
  return sqrt(xVelocity * xVelocity + yVelocity * yVelocity);
}

void TopDownMovementRuntimeBehavior::DoStepPreEvents(RuntimeScene& scene) {
  // Get the player input:
  leftKey |=
      !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Left");
  rightKey |=
      !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Right");
  downKey |=
      !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Down");
  upKey |= !ignoreDefaultControls && scene.GetInputManager().IsKeyPressed("Up");

  int direction = -1;
  float directionInRad = 0;
  float directionInDeg = 0;
  if (!allowDiagonals) {
    if (upKey && !downKey)
      direction = 6;
    else if (!upKey && downKey)
      direction = 2;

    if (!upKey && !downKey) {
      if (leftKey && !rightKey)
        direction = 4;
      else if (!leftKey && rightKey)
        direction = 0;
    }
  } else {
    if (upKey && !downKey) {
      if (leftKey && !rightKey)
        direction = 5;
      else if (!leftKey && rightKey)
        direction = 7;
      else
        direction = 6;
    } else if (!upKey && downKey) {
      if (leftKey && !rightKey)
        direction = 3;
      else if (!leftKey && rightKey)
        direction = 1;
      else
        direction = 2;
    } else {
      if (leftKey && !rightKey)
        direction = 4;
      else if (!leftKey && rightKey)
        direction = 0;
    }
  }

  // Update the speed of the object
  float timeDelta =
      static_cast<double>(object->GetElapsedTime(scene)) / 1000000.0;
  if (direction != -1) {
    directionInRad = static_cast<float>(direction) * gd::Pi() / 4.0;
    directionInDeg = static_cast<float>(direction) * 45;

    xVelocity += acceleration * timeDelta * cos(directionInRad);
    yVelocity += acceleration * timeDelta * sin(directionInRad);
  } else {
    directionInRad = atan2(yVelocity, xVelocity);
    directionInDeg = atan2(yVelocity, xVelocity) * 180.0 / gd::Pi();

    bool xVelocityWasPositive = xVelocity >= 0;
    bool yVelocityWasPositive = yVelocity >= 0;
    xVelocity -= deceleration * timeDelta * cos(directionInRad);
    yVelocity -= deceleration * timeDelta * sin(directionInRad);
    if ((xVelocity > 0) ^ xVelocityWasPositive) xVelocity = 0;
    if ((yVelocity > 0) ^ yVelocityWasPositive) yVelocity = 0;
  }

  float speed = sqrt(xVelocity * xVelocity + yVelocity * yVelocity);
  if (speed > maxSpeed) {
    xVelocity = maxSpeed * cos(directionInRad);
    yVelocity = maxSpeed * sin(directionInRad);
  }
  angularSpeed = angularMaxSpeed;  // No acceleration for angular speed for now

  // Position object
  object->SetX(object->GetX() + xVelocity * timeDelta);
  object->SetY(object->GetY() + yVelocity * timeDelta);

  // Also update angle if needed
  if ((xVelocity != 0 || yVelocity != 0)) {
    angle = directionInDeg;

    if (rotateObject) {
      float angularDiff = GDpriv::MathematicalTools::angleDifference(
          object->GetAngle(), directionInDeg + angleOffset);
      bool diffWasPositive = angularDiff >= 0;

      float newAngle = object->GetAngle() + (diffWasPositive ? -1.0 : 1.0) *
                                                angularSpeed * timeDelta;
      if ((GDpriv::MathematicalTools::angleDifference(
               newAngle, directionInDeg + angleOffset) > 0) ^
          diffWasPositive)
        newAngle = directionInDeg + angleOffset;
      object->SetAngle(newAngle);

      if (object->GetAngle() !=
          newAngle)  // Objects like sprite in 8 directions
                     // does not handle small increments...
        object->SetAngle(
            directionInDeg +
            angleOffset);  //...so force them to be in the path angle anyway.
    }
  }

  leftKey = false;
  rightKey = false;
  upKey = false;
  downKey = false;
}

void TopDownMovementRuntimeBehavior::SimulateControl(const gd::String& input) {
  if (input == "Left")
    leftKey = true;
  else if (input == "Right")
    rightKey = true;
  else if (input == "Up")
    upKey = true;
  else if (input == "Down")
    downKey = true;
}
