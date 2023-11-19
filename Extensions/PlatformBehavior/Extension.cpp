/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"
#include "PlatformBehavior.h"
#include "PlatformerObjectBehavior.h"

void DeclarePlatformBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "PlatformBehavior",
          _("Platform behavior"),
          "The platformer engine allows to create controllable objects that "
          "can run and jump on other objects that are marked as platforms. It "
          "supports various features commonly found in platformers: "
          "grabbing the edge of a platform, sustaining the jump while a key is "
          "held, customizable gravity... It can be used for the player, but "
          "also for other objects moving on platforms. In this case though, "
          "it's recommended to first check if there is a simpler behavior that "
          "could be used.",
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Movement")
      .SetTags("platformer, platform, character, jump, obstacle, collision")
      .SetExtensionHelpPath("/behaviors/platformer");
  extension.AddInstructionOrExpressionGroupMetadata(_("Platform behavior"))
      .SetIcon("CppPlatform/Extensions/platformerobjecticon.png");

  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PlatformerObjectBehavior",
        _("Platformer character"),
        "PlatformerObject",
        _("Jump and run on platforms."),
        "",
        "CppPlatform/Extensions/platformerobjecticon.png",
        "PlatformerObjectBehavior",
        std::make_shared<PlatformerObjectBehavior>(),
        std::make_shared<gd::BehaviorsSharedData>());

    // Deprecated, use IsMovingEvenALittle instead
    aut.AddCondition("IsMoving",
                     _("Is moving"),
                     _("Check if the object is moving (whether it is on the "
                       "floor or in the air)."),
                     _("_PARAM0_ is moving"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetHidden()
        .MarkAsSimple()
        .SetFunctionName("IsMoving");

    aut.AddScopedCondition("IsMovingEvenALittle",
                     _("Is moving"),
                     _("Check if the object is moving (whether it is on the "
                       "floor or in the air)."),
                     _("_PARAM0_ is moving"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple();

    aut.AddCondition("IsOnFloor",
                     _("Is on floor"),
                     _("Check if the object is on a platform."),
                     _("_PARAM0_ is on floor"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("IsOnFloor");

    aut.AddCondition("IsOnLadder",
                     _("Is on ladder"),
                     _("Check if the object is on a ladder."),
                     _("_PARAM0_ is on ladder"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("IsOnLadder");

    aut.AddCondition("IsJumping",
                     _("Is jumping"),
                     _("Check if the object is jumping."),
                     _("_PARAM0_ is jumping"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("IsJumping");

    aut.AddCondition(
           "IsFalling",
           _("Is falling"),
           _("Check if the object is falling.\nNote that the object can be "
             "flagged as jumping and falling at the same time: at the end of a "
             "jump, the fall speed becomes higher than the jump speed."),
           _("_PARAM0_ is falling"),
           _("Platformer state"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("IsFalling");

    aut.AddCondition("IsGrabbingPlatform",
                     _("Is grabbing platform ledge"),
                     _("Check if the object is grabbing a platform ledge."),
                     _("_PARAM0_ is grabbing a platform ledge"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("IsGrabbingPlatform");

    aut.AddCondition("Gravity",
                     _("Gravity"),
                     _("Compare the gravity applied on the object."),
                     _("the gravity"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Gravity to compare to (in pixels per "
                  "second per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetGravity");

    aut.AddAction("Gravity",
                  _("Gravity"),
                  _("Change the gravity applied on an object."),
                  _("the gravity"),
                  _("Platformer configuration"),
                  "CppPlatform/Extensions/platformerobjecticon.png",
                  "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Gravity (in pixels per "
                  "second per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("SetGravity")
        .SetGetter("GetGravity");

    aut.AddCondition("MaxFallingSpeed",
                     _("Maximum falling speed"),
                     _("Compare the maximum falling speed of the object."),
                     _("the maximum falling speed"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max speed to compare to (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetMaxFallingSpeed");

    aut.AddAction("MaxFallingSpeed",
                  _("Maximum falling speed"),
                  _("Change the maximum falling speed of an object."),
                  _("the maximum falling speed"),
                  _("Platformer configuration"),
                  "CppPlatform/Extensions/platformerobjecticon.png",
                  "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max speed (in pixels per second)")))
        .AddParameter(
            "yesorno",
            _("If jumping, try to preserve the current speed in the air"))
        .MarkAsAdvanced()
        .SetFunctionName("SetMaxFallingSpeed")
        .SetGetter("GetMaxFallingSpeed");

    aut.AddCondition("LadderClimbingSpeed",
                     _("Ladder climbing speed"),
                     _("Compare the ladder climbing speed (in pixels per "
                       "second)."),
                     _("the ladder climbing speed"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed to compare to (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetLadderClimbingSpeed");

    aut.AddAction("LadderClimbingSpeed",
                  _("Ladder climbing speed"),
                  _("Change the ladder climbing speed."),
                  _("the ladder climbing speed"),
                  _("Platformer configuration"),
                  "CppPlatform/Extensions/platformerobjecticon.png",
                  "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("SetLadderClimbingSpeed")
        .SetGetter("GetLadderClimbingSpeed");

    aut.AddCondition("Acceleration",
                     _("Acceleration"),
                     _("Compare the horizontal acceleration of the object."),
                     _("the horizontal acceleration"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Acceleration to compare to (in pixels per "
                  "second per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetAcceleration");

    aut.AddAction("Acceleration",
                  _("Acceleration"),
                  _("Change the horizontal acceleration of an object."),
                  _("the horizontal acceleration"),
                  _("Platformer configuration"),
                  "CppPlatform/Extensions/platformerobjecticon.png",
                  "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Acceleration (in pixels per "
                  "second per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("SetAcceleration")
        .SetGetter("GetAcceleration");

    aut.AddCondition("Deceleration",
                     _("Deceleration"),
                     _("Compare the horizontal deceleration of the object."),
                     _("the horizontal deceleration"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Deceleration to compare to (in pixels per "
                  "second per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetDeceleration");

    aut.AddAction("Deceleration",
                  _("Deceleration"),
                  _("Change the horizontal deceleration of an object."),
                  _("the horizontal deceleration"),
                  _("Platformer configuration"),
                  "CppPlatform/Extensions/platformerobjecticon.png",
                  "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Deceleration (in pixels per "
                  "second per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("SetDeceleration")
        .SetGetter("GetDeceleration");

    aut.AddCondition("MaxSpeed",
                     _("Maximum horizontal speed"),
                     _("Compare the maximum horizontal speed of the object."),
                     _("the maximum horizontal speed"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max speed to compare to (in pixels per second)")))
        .SetFunctionName("GetMaxSpeed");

    aut.AddAction("MaxSpeed",
                  _("Maximum horizontal speed"),
                  _("Change the maximum horizontal speed of an object."),
                  _("the maximum horizontal speed"),
                  _("Platformer configuration"),
                  "CppPlatform/Extensions/platformerobjecticon.png",
                  "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Max speed (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("SetMaxSpeed")
        .SetGetter("GetMaxSpeed");

    aut.AddCondition("JumpSpeed",
                     _("Jump speed"),
                     _("Compare the jump speed of the object."
                       "Its value is always positive."),
                     _("the jump speed"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed to compare to (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetJumpSpeed");

    aut.AddAction("JumpSpeed",
                  _("Jump speed"),
                  _("Change the jump speed of an object. "
                    "Its value is always positive."),
                  _("the jump speed"),
                  _("Platformer configuration"),
                  "CppPlatform/Extensions/platformerobjecticon.png",
                  "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed (in pixels per second)")))
        .SetFunctionName("SetJumpSpeed")
        .SetGetter("GetJumpSpeed");

    aut.AddCondition(
           "JumpSustainTime",
           _("Jump sustain time"),
           _("Compare the jump sustain time of the object."
             "This is the time during which keeping the jump button held "
             "allow the initial jump speed to be maintained."),
           _("the jump sustain time"),
           _("Platformer configuration"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Duration to compare to (in seconds)")))
        .MarkAsAdvanced();

    aut.AddAction(
           "JumpSustainTime",
           _("Jump sustain time"),
           _("Change the jump sustain time of an object."
             "This is the time during which keeping the jump button held "
             "allow the initial jump speed to be maintained."),
           _("the jump sustain time"),
           _("Platformer configuration"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Duration (in seconds)")));

    aut.AddAction(
           "SetCanJump",
           _("Allow jumping again"),
           _("When this action is executed, the object is able to jump again, "
             "even if it is in the air: this can be useful to allow a double "
             "jump for example. This is not a permanent effect: you must call "
             "again this action everytime you want to allow the object to jump "
             "(apart if it's on the floor)."),
           _("Allow _PARAM0_ to jump again"),
           _("Platformer state"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("SetCanJump");

    aut.AddScopedAction(
           "SetCanNotAirJump",
           _("Forbid jumping again in the air"),
           _("This revokes the effect of \"Allow jumping again\". The object "
             "is made unable to jump while in mid air. This has no effect if "
             "the object is not in the air."),
           _("Forbid _PARAM0_ to air jump"),
           _("Platformer state"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior");

    aut.AddScopedAction(
           "AbortJump",
           _("Abort jump"),
           _("Abort the current jump and stop the object vertically. "
             "This action doesn't have any effect when the character is not "
             "jumping."),
           _("Abort the current jump of _PARAM0_"),
           _("Platformer state"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior");

    aut.AddCondition("CanJump",
                     _("Can jump"),
                     _("Check if the object can jump."),
                     _("_PARAM0_ can jump"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("canJump");

    aut.AddAction("SimulateLeftKey",
                  _("Simulate left key press"),
                  _("Simulate a press of the left key."),
                  _("Simulate pressing Left for _PARAM0_"),
                  _("Platformer controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateLeftKey");

    aut.AddAction("SimulateRightKey",
                  _("Simulate right key press"),
                  _("Simulate a press of the right key."),
                  _("Simulate pressing Right for _PARAM0_"),
                  _("Platformer controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateRightKey");

    aut.AddAction("SimulateUpKey",
                  _("Simulate up key press"),
                  _("Simulate a press of the up key (used when on a ladder)."),
                  _("Simulate pressing Up for _PARAM0_"),
                  _("Platformer controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateUpKey");

    aut.AddAction(
           "SimulateDownKey",
           _("Simulate down key press"),
           _("Simulate a press of the down key (used when on a ladder)."),
           _("Simulate pressing Down for _PARAM0_"),
           _("Platformer controls"),
           "res/conditions/keyboard24.png",
           "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateDownKey");

    aut.AddAction(
           "SimulateLadderKey",
           _("Simulate ladder key press"),
           _("Simulate a press of the ladder key (used to grab a ladder)."),
           _("Simulate pressing Ladder key for _PARAM0_"),
           _("Platformer controls"),
           "res/conditions/keyboard24.png",
           "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateLadderKey");

    aut.AddAction(
           "SimulateReleaseLadderKey",
           _("Simulate release ladder key press"),
           _("Simulate a press of the Release Ladder key (used to get off a ladder)."),
           _("Simulate pressing Release Ladder key for _PARAM0_"),
           _("Platformer controls"),
           "res/conditions/keyboard24.png",
           "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced();

    aut.AddAction("SimulateJumpKey",
                  _("Simulate jump key press"),
                  _("Simulate a press of the jump key."),
                  _("Simulate pressing Jump key for _PARAM0_"),
                  _("Platformer controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("SimulateJumpKey");

    aut.AddAction("SimulateReleasePlatformKey",
                  _("Simulate release platform key press"),
                  _("Simulate a press of the release platform key (used when grabbing a "
                    "platform ledge)."),
                  _("Simulate pressing Release Platform key for _PARAM0_"),
                  _("Platformer controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("SimulateReleasePlatformKey");

    // Support for deprecated names:
    aut.AddDuplicatedAction("SimulateReleaseKey", "SimulateReleasePlatformKey").SetHidden();

    aut.AddAction("SimulateControl",
                  _("Simulate control"),
                  _("Simulate a press of a key.\nValid keys are Left, Right, "
                    "Jump, Ladder, Release Ladder, Up, Down."),
                  _("Simulate pressing _PARAM2_ key for _PARAM0_"),
                  _("Platformer controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .AddParameter("stringWithSelector",
                    _("Key"),
                    "[\"Left\", \"Right\", \"Jump\", \"Ladder\", \"Release Ladder\", \"Up\", \"Down\"]")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateControl");

    aut.AddScopedCondition("IsUsingControl",
                  _("Control pressed or simulated"),
                  _("A control was applied from a default control or simulated by an action."),
                  _("_PARAM0_ has the _PARAM2_ key pressed or simulated"),
                  _("Platformer state"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .AddParameter("stringWithSelector",
                    _("Key"),
                    "[\"Left\", \"Right\", \"Jump\", \"Ladder\", \"Release Ladder\", \"Up\", \"Down\"]")
        .MarkAsAdvanced();

    aut.AddAction("IgnoreDefaultControls",
                  _("Ignore default controls"),
                  _("De/activate the use of default controls.\nIf deactivated, "
                    "use the simulated actions to move the object."),
                  _("Ignore default controls for _PARAM0_: _PARAM2_"),
                  _("Platformer configuration"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .AddParameter("yesorno", _("Ignore controls"))
        .MarkAsAdvanced()
        .SetFunctionName("IgnoreDefaultControls");

    aut.AddAction("CanGrabPlatforms",
                  _("Platform grabbing"),
                  _("Enable (or disable) the ability of the object to grab "
                    "platforms when falling near to one."),
                  _("Allow _PARAM0_ to grab platforms: _PARAM2_"),
                  _("Platformer configuration"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .AddParameter("yesorno", _("Can grab platforms"))
        .MarkAsAdvanced();

    aut.AddCondition("CanGrabPlatforms",
                     _("Can grab platforms"),
                     _("Check if the object can grab the platforms."),
                     _("_PARAM0_ can grab the platforms"),
                     _("Platformer configuration"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("canGrabPlatforms");

    aut.AddCondition("CurrentFallSpeed",
                     _("Current falling speed"),
                     _("Compare the current falling speed of the object. Its "
                       "value is always positive."),
                     _("the current falling speed"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed to compare to (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetCurrentFallSpeed");

    aut.AddScopedAction(
           "SetCurrentFallSpeed",
           _("Current falling speed"),
           _("Change the current falling speed of the object. This action "
             "doesn't have any effect when the character "
             "is not falling or is in the first phase of a jump."),
           _("the current falling speed"),
           _("Platformer state"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed (in pixels per second)")))
        .MarkAsAdvanced();

    aut.AddCondition("CurrentJumpSpeed",
                     _("Current jump speed"),
                     _("Compare the current jump speed of the object. Its "
                       "value is always positive."),
                     _("the current jump speed"),
                     _("Platformer state"),
                     "CppPlatform/Extensions/platformerobjecticon.png",
                     "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed to compare to (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetCurrentJumpSpeed");

    aut.AddScopedAction(
           "SetCurrentSpeed",
           _("Current horizontal speed"),
           _("Change the current horizontal speed of the object. The object "
             "moves to the left with negative values and to the right with "
             "positive ones"),
           _("the current horizontal speed"),
           _("Platformer state"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed (in pixels per second)")))
        .MarkAsAdvanced();

    aut.AddCondition(
           "CurrentSpeed",
           _("Current horizontal speed"),
           _("Compare the current horizontal speed of the object. The object "
             "moves to the left "
             "with negative values and to the right with positive ones"),
           _("the current horizontal speed"),
           _("Platformer state"),
           "CppPlatform/Extensions/platformerobjecticon.png",
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters(
            "number",
            gd::ParameterOptions::MakeNewOptions().SetDescription(
                _("Speed to compare to (in pixels per second)")))
        .MarkAsAdvanced()
        .SetFunctionName("GetCurrentSpeed");

    aut.AddExpression("Gravity",
                      _("Gravity"),
                      _("Return the gravity applied on the object "
                        "(in pixels per second per second)."),
                      _("Platformer configuration"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetGravity");

    aut.AddExpression("MaxFallingSpeed",
                      _("Maximum falling speed"),
                      _("Return the maximum falling speed of the object "
                        "(in pixels per second)."),
                      _("Platformer configuration"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetMaxFallingSpeed");

    aut.AddExpression("LadderClimbingSpeed",
                      _("Ladder climbing speed"),
                      _("Return the ladder climbing speed of the object "
                        "(in pixels per second)."),
                      _("Platformer configuration"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetLadderClimbingSpeed");

    aut.AddExpression("Acceleration",
                      _("Acceleration"),
                      _("Return the horizontal acceleration of the object "
                        "(in pixels per second per second)."),
                      _("Platformer configuration"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetAcceleration");

    aut.AddExpression("Deceleration",
                      _("Deceleration"),
                      _("Return the horizontal deceleration of the object "
                        "(in pixels per second per second)."),
                      _("Platformer configuration"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetDeceleration");

    aut.AddExpression("MaxSpeed",
                      _("Maximum horizontal speed"),
                      _("Return the maximum horizontal speed of the object "
                        "(in pixels per second)."),
                      _("Platformer configuration"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetMaxSpeed");

    aut.AddExpression(
           "JumpSpeed",
           _("Jump speed"),
           _("Return the jump speed of the object "
             "(in pixels per second). Its value is always positive."),
           _("Platformer configuration"),
           "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetJumpSpeed");

    aut.AddExpression("JumpSustainTime",
                      _("Jump sustain time"),
                      _("Return the jump sustain time of the object (in seconds)."
                        "This is the time during which keeping the jump button held "
                        "allow the initial jump speed to be maintained."),
                      _("Platformer configuration"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior");

    aut.AddExpression("CurrentFallSpeed",
                      _("Current fall speed"),
                      _("Return the current fall speed of the object "
                        "(in pixels per second). Its value is always positive."),
                      _("Platformer state"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetCurrentFallSpeed");

    aut.AddExpression("CurrentSpeed",
                      _("Current horizontal speed"),
                      _("Return the current horizontal speed of the object "
                     "(in pixels per second). The object moves to the left "
                     "with negative values and to the right with positive ones"),
                      _("Platformer state"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetCurrentSpeed");

    aut.AddExpression("CurrentJumpSpeed",
                      _("Current jump speed"),
                      _("Return the current jump speed of the object "
                        "(in pixels per second). Its value is always positive."),
                      _("Platformer state"),
                      "CppPlatform/Extensions/platformerobjecticon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetCurrentJumpSpeed");
  }
  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PlatformBehavior",
        _("Platform"),
        "Platform",
        _("Flag objects as being platforms which characters can run on."),
        "",
        "CppPlatform/Extensions/platformicon.png",
        "PlatformBehavior",
        std::make_shared<PlatformBehavior>(),
        std::make_shared<gd::BehaviorsSharedData>());

    aut.AddAction("ChangePlatformType",
                  _("Platform type"),
                  _("Change the platform type of the object: Platform, "
                    "Jump-Through, or Ladder."),
                  _("Set platform type of _PARAM0_ to _PARAM2_"),
                  _("Platform"),
                  "CppPlatform/Extensions/platformicon.png",
                  "CppPlatform/Extensions/platformicon.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformBehavior")
        .AddParameter(
            "string",
            _("Platform type (\"Platform\", \"Jumpthru\" or \"Ladder\")"))
        .MarkAsAdvanced()
        .SetFunctionName("ChangePlatformType");
  }

  extension.AddCondition("IsObjectOnGivenFloor",
                         _("Character is on given platform"),
                         _("Check if a platformer character is on a given platform."),
                         _("_PARAM0_ is on platform _PARAM2_"),
                         _("Collision"),
                         "CppPlatform/Extensions/platformicon.png",
                         "CppPlatform/Extensions/platformicon.png")
           .AddParameter("objectList", _("Object"), "", false)
           .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
           .AddParameter("objectList", _("Platforms"), "", false)
           .AddCodeOnlyParameter("conditionInverted", "")
           .SetFunctionName("gdjs.evtTools.platform.isOnPlatform");
}
