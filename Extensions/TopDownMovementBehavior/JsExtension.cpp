/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include <iostream>

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclareTopDownMovementBehaviorExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TopDownMovementBehaviorJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  TopDownMovementBehaviorJsExtension() {
    DeclareTopDownMovementBehaviorExtension(*this);

    GetBehaviorMetadata("TopDownMovementBehavior::TopDownMovementBehavior")
        .SetIncludeFile(
            "Extensions/TopDownMovementBehavior/"
            "topdownmovementruntimebehavior.js");

    std::map<gd::String, gd::InstructionMetadata>& autActions =
        GetAllActionsForBehavior(
            "TopDownMovementBehavior::TopDownMovementBehavior");
    std::map<gd::String, gd::InstructionMetadata>& autConditions =
        GetAllConditionsForBehavior(
            "TopDownMovementBehavior::TopDownMovementBehavior");
    std::map<gd::String, gd::ExpressionMetadata>& autExpressions =
        GetAllExpressionsForBehavior(
            "TopDownMovementBehavior::TopDownMovementBehavior");

    autConditions["TopDownMovementBehavior::IsMoving"].SetFunctionName(
        "isMoving");

    autActions["TopDownMovementBehavior::Acceleration"]
        .SetFunctionName("setAcceleration")
        .SetGetter("getAcceleration");
    autConditions["TopDownMovementBehavior::Acceleration"].SetFunctionName(
        "getAcceleration");
    autActions["TopDownMovementBehavior::Deceleration"]
        .SetFunctionName("setDeceleration")
        .SetGetter("getDeceleration");
    autConditions["TopDownMovementBehavior::Deceleration"].SetFunctionName(
        "getDeceleration");
    autActions["TopDownMovementBehavior::MaxSpeed"]
        .SetFunctionName("setMaxSpeed")
        .SetGetter("getMaxSpeed");
    autConditions["TopDownMovementBehavior::MaxSpeed"].SetFunctionName(
        "getMaxSpeed");
    autConditions["TopDownMovementBehavior::Speed"].SetFunctionName("getSpeed");
    autActions["TopDownMovementBehavior::AngularMaxSpeed"]
        .SetFunctionName("setAngularMaxSpeed")
        .SetGetter("getAngularMaxSpeed");
    autConditions["TopDownMovementBehavior::AngularMaxSpeed"].SetFunctionName(
        "getAngularMaxSpeed");
    autActions["TopDownMovementBehavior::AngleOffset"]
        .SetFunctionName("setAngleOffset")
        .SetGetter("getAngleOffset");
    autConditions["TopDownMovementBehavior::AngleOffset"].SetFunctionName(
        "getAngleOffset");
    // Deprecated, prefer IsMovementAngleAround instead.
    autConditions["TopDownMovementBehavior::Angle"].SetFunctionName("getAngle");
    autConditions["TopDownMovementBehavior::TopDownMovementBehavior::IsMovementAngleAround"]
        .SetFunctionName("isMovementAngleAround");
    autConditions["TopDownMovementBehavior::XVelocity"].SetFunctionName(
        "getXVelocity");
    autConditions["TopDownMovementBehavior::YVelocity"].SetFunctionName(
        "getYVelocity");
    autActions
        ["TopDownMovementBehavior::TopDownMovementBehavior::"
         "SetMovementAngleOffset"]
            .SetFunctionName("setMovementAngleOffset")
            .SetGetter("getMovementAngleOffset");
    autConditions
        ["TopDownMovementBehavior::TopDownMovementBehavior::"
         "MovementAngleOffset"]
            .SetFunctionName("getMovementAngleOffset");

    autActions["TopDownMovementBehavior::AllowDiagonals"].SetFunctionName(
        "allowDiagonals");
    autConditions["TopDownMovementBehavior::DiagonalsAllowed"].SetFunctionName(
        "diagonalsAllowed");
    autActions["TopDownMovementBehavior::RotateObject"].SetFunctionName(
        "setRotateObject");
    autConditions["TopDownMovementBehavior::ObjectRotated"].SetFunctionName(
        "isObjectRotated");

    autActions["TopDownMovementBehavior::SimulateLeftKey"].SetFunctionName(
        "simulateLeftKey");
    autActions["TopDownMovementBehavior::SimulateRightKey"].SetFunctionName(
        "simulateRightKey");
    autActions["TopDownMovementBehavior::SimulateUpKey"].SetFunctionName(
        "simulateUpKey");
    autActions["TopDownMovementBehavior::SimulateDownKey"].SetFunctionName(
        "simulateDownKey");
    autActions["TopDownMovementBehavior::SimulateControl"].SetFunctionName(
        "simulateControl");
    autActions["TopDownMovementBehavior::IgnoreDefaultControls"]
        .SetFunctionName("ignoreDefaultControls");
    autActions["TopDownMovementBehavior::SimulateStick"].SetFunctionName(
        "simulateStick");
    autConditions["TopDownMovementBehavior::TopDownMovementBehavior::IsUsingControl"].SetFunctionName(
        "isUsingControl");
    autExpressions["StickAngle"].SetFunctionName("getLastStickInputAngle");

    autExpressions["Acceleration"].SetFunctionName("getAcceleration");
    autExpressions["Deceleration"].SetFunctionName("getDeceleration");
    autExpressions["MaxSpeed"].SetFunctionName("getMaxSpeed");
    autExpressions["Speed"].SetFunctionName("getSpeed");
    autExpressions["AngularMaxSpeed"].SetFunctionName("getAngularMaxSpeed");
    autExpressions["AngleOffset"].SetFunctionName("getAngleOffset");
    autExpressions["Angle"].SetFunctionName("getAngle");
    autExpressions["XVelocity"].SetFunctionName("getXVelocity");
    autExpressions["YVelocity"].SetFunctionName("getYVelocity");
    autActions["TopDownMovementBehavior::TopDownMovementBehavior::SetVelocityX"]
        .SetFunctionName("setXVelocity")
        .SetGetter("getXVelocity");
    autActions["TopDownMovementBehavior::TopDownMovementBehavior::SetVelocityY"]
        .SetFunctionName("setYVelocity")
        .SetGetter("getYVelocity");
    autExpressions["MovementAngleOffset"].SetFunctionName(
        "getMovementAngleOffset");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSTopDownMovementBehaviorExtension() {
  return new TopDownMovementBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new TopDownMovementBehaviorJsExtension;
}
#endif
#endif
