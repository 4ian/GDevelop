/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

#include "GDCore/Tools/Localization.h"

#include <iostream>

void DeclarePlatformBehaviorExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PlatformBehaviorJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  PlatformBehaviorJsExtension() {
    DeclarePlatformBehaviorExtension(*this);

    GetBehaviorMetadata("PlatformBehavior::PlatformBehavior")
        .SetIncludeFile(
            "Extensions/PlatformBehavior/platformruntimebehavior.js")
        .AddIncludeFile(
            "Extensions/PlatformBehavior/platformerobjectruntimebehavior.js")
        .AddIncludeFile(
            "Extensions/PlatformBehavior/platformtools.js");

    GetBehaviorMetadata("PlatformBehavior::PlatformerObjectBehavior")
        .SetIncludeFile(
            "Extensions/PlatformBehavior/platformruntimebehavior.js")
        .AddIncludeFile(
            "Extensions/PlatformBehavior/platformerobjectruntimebehavior.js")
        .AddIncludeFile(
            "Extensions/PlatformBehavior/platformtools.js");

    {
      std::map<gd::String, gd::InstructionMetadata>& autActions =
          GetAllActionsForBehavior(
              "PlatformBehavior::PlatformerObjectBehavior");
      std::map<gd::String, gd::InstructionMetadata>& autConditions =
          GetAllConditionsForBehavior(
              "PlatformBehavior::PlatformerObjectBehavior");
      std::map<gd::String, gd::ExpressionMetadata>& autExpressions =
          GetAllExpressionsForBehavior(
              "PlatformBehavior::PlatformerObjectBehavior");

      autConditions["PlatformBehavior::IsMoving"].SetFunctionName("isMoving");
      autConditions["PlatformBehavior::PlatformerObjectBehavior::IsMovingEvenALittle"]
          .SetFunctionName("isMovingEvenALittle");
      autConditions["PlatformBehavior::IsOnFloor"].SetFunctionName("isOnFloor");
      autConditions["PlatformBehavior::IsOnLadder"].SetFunctionName(
          "isOnLadder");
      autConditions["PlatformBehavior::IsJumping"].SetFunctionName("isJumping");
      autConditions["PlatformBehavior::IsFalling"].SetFunctionName("isFalling");
      autConditions["PlatformBehavior::IsGrabbingPlatform"].SetFunctionName(
          "isGrabbingPlatform");

      autConditions["PlatformBehavior::Gravity"].SetFunctionName("getGravity");
      autActions["PlatformBehavior::Gravity"]
          .SetFunctionName("setGravity")
          .SetGetter("getGravity");
      autExpressions["Gravity"].SetFunctionName("getGravity");
      autConditions["PlatformBehavior::MaxFallingSpeed"].SetFunctionName(
          "getMaxFallingSpeed");
      autActions["PlatformBehavior::MaxFallingSpeed"]
          .SetFunctionName("setMaxFallingSpeed")
          .SetGetter("getMaxFallingSpeed");
      autExpressions["MaxFallingSpeed"].SetFunctionName("getMaxFallingSpeed");
      autConditions["PlatformBehavior::Acceleration"].SetFunctionName(
          "getAcceleration");
      autActions["PlatformBehavior::LadderClimbingSpeed"]
          .SetFunctionName("setLadderClimbingSpeed")
          .SetGetter("getLadderClimbingSpeed");
      autExpressions["LadderClimbingSpeed"].SetFunctionName("getLadderClimbingSpeed");
      autConditions["PlatformBehavior::LadderClimbingSpeed"].SetFunctionName(
          "getLadderClimbingSpeed");
      autActions["PlatformBehavior::Acceleration"]
          .SetFunctionName("setAcceleration")
          .SetGetter("getAcceleration");
      autExpressions["Acceleration"].SetFunctionName("getAcceleration");
      autConditions["PlatformBehavior::Deceleration"].SetFunctionName(
          "getDeceleration");
      autActions["PlatformBehavior::Deceleration"]
          .SetFunctionName("setDeceleration")
          .SetGetter("getDeceleration");
      autExpressions["Deceleration"].SetFunctionName("getDeceleration");
      autConditions["PlatformBehavior::MaxSpeed"].SetFunctionName(
          "getMaxSpeed");
      autActions["PlatformBehavior::MaxSpeed"]
          .SetFunctionName("setMaxSpeed")
          .SetGetter("getMaxSpeed");
      autExpressions["MaxSpeed"].SetFunctionName("getMaxSpeed");
      autConditions["PlatformBehavior::JumpSpeed"].SetFunctionName(
          "getJumpSpeed");
      autActions["PlatformBehavior::JumpSpeed"]
          .SetFunctionName("setJumpSpeed")
          .SetGetter("getJumpSpeed");
      autExpressions["JumpSpeed"].SetFunctionName("getJumpSpeed");
      autConditions["PlatformBehavior::JumpSustainTime"].SetFunctionName(
          "getJumpSustainTime");
      autActions["PlatformBehavior::JumpSustainTime"]
          .SetFunctionName("setJumpSustainTime")
          .SetGetter("getJumpSustainTime");
      autExpressions["JumpSustainTime"].SetFunctionName("getJumpSustainTime");
      autActions["PlatformBehavior::PlatformerObjectBehavior::SetCurrentFallSpeed"]
          .SetFunctionName("setCurrentFallSpeed")
          .SetGetter("getCurrentFallSpeed");
      autConditions["PlatformBehavior::CurrentFallSpeed"].SetFunctionName(
          "getCurrentFallSpeed");
      autExpressions["CurrentFallSpeed"].SetFunctionName("getCurrentFallSpeed");
      autActions["PlatformBehavior::PlatformerObjectBehavior::SetCurrentSpeed"]
          .SetFunctionName("setCurrentSpeed")
          .SetGetter("getCurrentSpeed");
      autConditions["PlatformBehavior::CurrentSpeed"].SetFunctionName(
          "getCurrentSpeed");
      autExpressions["CurrentSpeed"].SetFunctionName("getCurrentSpeed");
      autActions["PlatformBehavior::CanGrabPlatforms"]
          .SetFunctionName("setCanGrabPlatforms")
          .SetGetter("canGrabPlatforms");
      autConditions["PlatformBehavior::CanGrabPlatforms"].SetFunctionName(
          "canGrabPlatforms");
      autConditions["PlatformBehavior::CurrentJumpSpeed"].SetFunctionName(
          "getCurrentJumpSpeed");
      autExpressions["CurrentJumpSpeed"].SetFunctionName("getCurrentJumpSpeed");
      autActions["PlatformBehavior::SetCanJump"].SetFunctionName("setCanJump");
      autActions["PlatformBehavior::PlatformerObjectBehavior::SetCanNotAirJump"].SetFunctionName("setCanNotAirJump");
      autActions["PlatformBehavior::PlatformerObjectBehavior::AbortJump"].SetFunctionName("abortJump");
      autConditions["PlatformBehavior::CanJump"].SetFunctionName(
          "canJump");
      autActions["PlatformBehavior::SimulateLeftKey"].SetFunctionName(
          "simulateLeftKey");
      autActions["PlatformBehavior::SimulateRightKey"].SetFunctionName(
          "simulateRightKey");
      autActions["PlatformBehavior::SimulateUpKey"].SetFunctionName(
          "simulateUpKey");
      autActions["PlatformBehavior::SimulateDownKey"].SetFunctionName(
          "simulateDownKey");
      autActions["PlatformBehavior::SimulateLadderKey"].SetFunctionName(
          "simulateLadderKey");
      autActions["PlatformBehavior::SimulateReleaseLadderKey"].SetFunctionName(
          "simulateReleaseLadderKey");
      autActions["PlatformBehavior::SimulateJumpKey"].SetFunctionName(
          "simulateJumpKey");
      // deprecated release platform key.
      autActions["PlatformBehavior::SimulateReleaseKey"].SetFunctionName(
          "simulateReleasePlatformKey");
      autActions["PlatformBehavior::SimulateReleasePlatformKey"].SetFunctionName(
          "simulateReleasePlatformKey");
      autActions["PlatformBehavior::SimulateControl"].SetFunctionName(
          "simulateControl");
      autConditions["PlatformBehavior::PlatformerObjectBehavior::IsUsingControl"].SetFunctionName(
          "isUsingControl");
      autActions["PlatformBehavior::IgnoreDefaultControls"].SetFunctionName(
          "ignoreDefaultControls");
    }
    {
      std::map<gd::String, gd::InstructionMetadata>& autActions =
          GetAllActionsForBehavior("PlatformBehavior::PlatformBehavior");

      autActions["PlatformBehavior::ChangePlatformType"].SetFunctionName(
          "changePlatformType");
    }
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

// We need a specific function to create the extension with emscripten.
#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSPlatformBehaviorExtension() {
  return new PlatformBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new PlatformBehaviorJsExtension;
}
#endif
