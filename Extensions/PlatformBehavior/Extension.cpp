/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"

#include "PlatformBehavior.h"
#include "PlatformRuntimeBehavior.h"
#include "PlatformerObjectBehavior.h"
#include "PlatformerObjectRuntimeBehavior.h"
#include "ScenePlatformObjectsManager.h"

void DeclarePlatformBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation("PlatformBehavior",
                               _("Platform Behavior"),
                               _("This Extension enables the use of "
                                 "controllable objects that can run "
                                 "and jump on platforms."),
                               "Florian Rival",
                               "Open source (MIT License)")
      .SetExtensionHelpPath("/behaviors/platformer");

  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PlatformerObjectBehavior",
        _("Platformer character"),
        "PlatformerObject",
        _("Controllable character that can jump and run on platforms."),
        "",
        "CppPlatform/Extensions/platformerobjecticon.png",
        "PlatformerObjectBehavior",
        std::make_shared<PlatformerObjectBehavior>(),
        std::make_shared<gd::BehaviorsSharedData>());

#if defined(GD_IDE_ONLY)
    aut.AddCondition("IsMoving",
                     _("Is moving"),
                     _("Check if the object is moving (whether it is on the "
                       "floor or in the air)."),
                     _("_PARAM0_ is moving"),
                     "",
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("IsMoving")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition("IsOnFloor",
                     _("Is on floor"),
                     _("Check if the object is on a platform."),
                     _("_PARAM0_ is on floor"),
                     "",
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("IsOnFloor")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition("IsOnLadder",
                     _("Is on ladder"),
                     _("Check if the object is on a ladder."),
                     _("_PARAM0_ is on ladder"),
                     "",
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("IsOnLadder")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition("IsJumping",
                     _("Is jumping"),
                     _("Check if the object is jumping."),
                     _("_PARAM0_ is jumping"),
                     "",
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("IsJumping")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition(
           "IsFalling",
           _("Is falling"),
           _("Check if the object is falling.\nNote that the object can be "
             "flagged as jumping and falling at the same time: at the end of a "
             "jump, the fall speed becomes higher than the jump speed."),
           _("_PARAM0_ is falling"),
           "",
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("IsFalling")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition("IsGrabbingPlatform",
                     _("Is grabbing platform ledge"),
                     _("Check if the object is grabbing a platform ledge."),
                     _("_PARAM0_ is grabbing a platform ledge"),
                     "",
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("IsGrabbingPlatform")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition("Gravity",
                     _("Gravity"),
                     _("Compare the gravity applied on the object (in pixels "
                       "per second per second)."),
                     _("the gravity"),
                     _("Options"),
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("GetGravity")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("Gravity",
                  _("Gravity"),
                  _("Change the gravity applied on an object (in pixels per "
                    "second per second)."),
                  _("the gravity"),
                  _("Options"),
                  "CppPlatform/Extensions/platformerobjecticon24.png",
                  "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("SetGravity")
        .SetGetter("GetGravity")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition(
           "MaxFallingSpeed",
           _("Maximum falling speed"),
           _("Compare the maximum falling speed of the object (in pixels per "
             "second)."),
           _("the maximum falling speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("GetMaxFallingSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction(
           "MaxFallingSpeed",
           _("Maximum falling speed"),
           _("Change the maximum falling speed of an object (in pixels per "
             "second)."),
           _("the maximum falling speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("SetMaxFallingSpeed")
        .SetGetter("GetMaxFallingSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

     aut.AddCondition(
           "LadderClimbingSpeed",
           _("Ladder climbing speed"),
           _("Compare the ladder climbing speed (in pixels per "
             "second)."),
           _("the ladder climbing speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("GetLadderClimbingSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction(
           "LadderClimbingSpeed",
           _("Ladder climbing speed"),
           _("Change the ladder climbing speed (in pixels per "
             "second)."),
           _("the ladder climbing speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("SetLadderClimbingSpeed")
        .SetGetter("GetLadderClimbingSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition("Acceleration",
                     _("Acceleration"),
                     _("Compare the acceleration of the object (in pixels per "
                       "second per second)."),
                     _("the acceleration"),
                     _("Options"),
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("GetAcceleration")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("Acceleration",
                  _("Acceleration"),
                  _("Change the acceleration of an object (in pixels per "
                    "second per second)."),
                  _("the acceleration"),
                  _("Options"),
                  "CppPlatform/Extensions/platformerobjecticon24.png",
                  "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("SetAcceleration")
        .SetGetter("GetAcceleration")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition("Deceleration",
                     _("Deceleration"),
                     _("Compare the deceleration of the object (in pixels per "
                       "second per second)."),
                     _("the deceleration"),
                     _("Options"),
                     "CppPlatform/Extensions/platformerobjecticon24.png",
                     "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("GetDeceleration")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("Deceleration",
                  _("Deceleration"),
                  _("Change the deceleration of an object (in pixels per "
                    "second per second)."),
                  _("the deceleration"),
                  _("Options"),
                  "CppPlatform/Extensions/platformerobjecticon24.png",
                  "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("SetDeceleration")
        .SetGetter("GetDeceleration")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition(
           "MaxSpeed",
           _("Maximum speed"),
           _("Compare the maximum speed of the object (in pixels per second)."),
           _("the maximum speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .SetFunctionName("GetMaxSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction(
           "MaxSpeed",
           _("Maximum speed"),
           _("Change the maximum speed of an object (in pixels per second)."),
           _("the maximum speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("SetMaxSpeed")
        .SetGetter("GetMaxSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition(
           "JumpSpeed",
           _("Jump speed"),
           _("Compare the jump speed of the object (in pixels per second)."),
           _("the jump speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .MarkAsAdvanced()
        .SetFunctionName("GetJumpSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction(
           "JumpSpeed",
           _("Jump speed"),
           _("Change the jump speed of an object (in pixels per second)."),
           _("the jump speed"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number")
        .SetFunctionName("SetJumpSpeed")
        .SetGetter("GetJumpSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddCondition(
           "JumpSustainTime",
           _("Jump sustain time"),
           _("Compare the jump sustain time of the object (in seconds)."),
           _("the jump sustain time"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardRelationalOperatorParameters("number")
        .MarkAsAdvanced();

    aut.AddAction(
           "JumpSustainTime",
           _("Jump sustain time"),
           _("Change the jump sustain time of an object (in seconds)."),
           _("the jump sustain time"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .UseStandardOperatorParameters("number");

    aut.AddAction(
           "SetCanJump",
           _("Allow jumping again"),
           _("When this action is executed, the object is able to jump again, "
             "even if it is in the air: this can be useful to allow a double "
             "jump for example. This is not a permanent effect: you must call "
             "again this action everytime you want to allow the object to jump "
             "(apart if it's on the floor)."),
           _("Allow _PARAM0_ to jump again"),
           _("Options"),
           "CppPlatform/Extensions/platformerobjecticon24.png",
           "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsSimple()
        .SetFunctionName("SetCanJump")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("SimulateLeftKey",
                  _("Simulate left key press"),
                  _("Simulate a press of the left key."),
                  _("Simulate pressing Left for _PARAM0_"),
                  _("Controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateLeftKey")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("SimulateRightKey",
                  _("Simulate right key press"),
                  _("Simulate a press of the right key."),
                  _("Simulate pressing Right for _PARAM0_"),
                  _("Controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateRightKey")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("SimulateUpKey",
                  _("Simulate up key press"),
                  _("Simulate a press of the up key (used when on a ladder)."),
                  _("Simulate pressing Up for _PARAM0_"),
                  _("Controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateUpKey")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction(
           "SimulateDownKey",
           _("Simulate down key press"),
           _("Simulate a press of the down key (used when on a ladder)."),
           _("Simulate pressing Down for _PARAM0_"),
           _("Controls"),
           "res/conditions/keyboard24.png",
           "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateDownKey")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction(
           "SimulateLadderKey",
           _("Simulate ladder key press"),
           _("Simulate a press of the ladder key (used to grab a ladder)."),
           _("Simulate pressing Ladder key for _PARAM0_"),
           _("Controls"),
           "res/conditions/keyboard24.png",
           "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .MarkAsAdvanced()
        .SetFunctionName("SimulateLadderKey")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("SimulateJumpKey",
                  _("Simulate jump key press"),
                  _("Simulate a press of the jump key."),
                  _("Simulate pressing Jump key for _PARAM0_"),
                  _("Controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("SimulateJumpKey")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("SimulateReleaseKey",
                  _("Simulate release key press"),
                  _("Simulate a press of the release key (used when grabbing a "
                    "platform ledge)."),
                  _("Simulate pressing Release key for _PARAM0_"),
                  _("Controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("SimulateReleaseKey")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("SimulateControl",
                  _("Simulate control"),
                  _("Simulate a press of a key.\nValid keys are Left, Right, "
                    "Jump, Ladder, Up, Down."),
                  _("Simulate pressing _PARAM2_ key for _PARAM0_"),
                  _("Controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .AddParameter("string", _("Key"))
        .MarkAsAdvanced()
        .SetFunctionName("SimulateControl")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddAction("IgnoreDefaultControls",
                  _("Ignore default controls"),
                  _("De/activate the use of default controls.\nIf deactivated, "
                    "use the simulated actions to move the object."),
                  _("Ignore default controls for _PARAM0_: _PARAM2_"),
                  _("Controls"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .AddParameter("yesorno", _("Ignore controls"))
        .MarkAsAdvanced()
        .SetFunctionName("IgnoreDefaultControls")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("Gravity",
                      _("Gravity"),
                      _("Get the gravity applied on the object"),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetGravity")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("MaxFallingSpeed",
                      _("Maximum falling speed"),
                      _("Get the maximum falling speed"),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetMaxFallingSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("LadderClimbingSpeed",
                      _("Ladder climbing speed"),
                      _("Get the ladder climbing speed"),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetLadderClimbingSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("Acceleration",
                      _("Acceleration"),
                      _("Acceleration"),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetAcceleration")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("Deceleration",
                      _("Deceleration"),
                      _("Deceleration"),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetDeceleration")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("MaxSpeed",
                      _("Maximum speed"),
                      _("Maximum speed"),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetMaxSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("JumpSpeed",
                      _("Jump speed"),
                      _("Jump speed"),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior")
        .SetFunctionName("GetJumpSpeed")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    aut.AddExpression("JumpSustainTime",
                      _("Jump sustain time"),
                      _("The time during which keeping the jump button held allow the initial jump speed to be maintained."),
                      _("Options"),
                      "CppPlatform/Extensions/platformerobjecticon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformerObjectBehavior");
#endif
  }
  {
    gd::BehaviorMetadata& aut = extension.AddBehavior(
        "PlatformBehavior",
        _("Platform"),
        "Platform",
        _("Platform that Platformer characters can run on."),
        "",
        "CppPlatform/Extensions/platformicon.png",
        "PlatformBehavior",
        std::make_shared<PlatformBehavior>(),
        std::make_shared<gd::BehaviorsSharedData>());

#if defined(GD_IDE_ONLY)
    aut.SetIncludeFile("PlatformBehavior/PlatformRuntimeBehavior.h");

    aut.AddAction("ChangePlatformType",
                  _("Change platform type"),
                  _("Change the platform type of the object: Platform, "
                    "Jump-Through, or Ladder."),
                  _("Set platform type of _PARAM0_ to _PARAM2_"),
                  _("Platforms"),
                  "CppPlatform/Extensions/platformicon24.png",
                  "CppPlatform/Extensions/platformicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "PlatformBehavior")
        .AddParameter(
            "string",
            _("Platform type (\"Platform\", \"Jumpthru\" or \"Ladder\")"))
        .MarkAsAdvanced()
        .SetFunctionName("ChangePlatformType")
        .SetIncludeFile("PlatformBehavior/PlatformRuntimeBehavior.h");
#endif
  }
}

/**
 * \brief This class declares information about the extension.
 */
class PlatformBehaviorCppExtension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  PlatformBehaviorCppExtension() {
    DeclarePlatformBehaviorExtension(*this);
    AddRuntimeBehavior<PlatformRuntimeBehavior>(
        GetBehaviorMetadata("PlatformBehavior::PlatformBehavior"),
        "PlatformRuntimeBehavior");
    GetBehaviorMetadata("PlatformBehavior::PlatformBehavior")
        .SetIncludeFile("PlatformBehavior/PlatformRuntimeBehavior.h");
    AddRuntimeBehavior<PlatformerObjectRuntimeBehavior>(
        GetBehaviorMetadata("PlatformBehavior::PlatformerObjectBehavior"),
        "PlatformerObjectRuntimeBehavior");
    GetBehaviorMetadata("PlatformBehavior::PlatformerObjectBehavior")
        .SetIncludeFile("PlatformBehavior/PlatformerObjectRuntimeBehavior.h");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };

  /**
   * \brief Initialize platforms list of the scene
   */
  virtual void SceneLoaded(RuntimeScene& scene) {
    ScenePlatformObjectsManager emptyManager;
    ScenePlatformObjectsManager::managers[&scene] = emptyManager;
  }

  /**
   * \brief Destroy platforms list of the scene
   */
  virtual void SceneUnloaded(RuntimeScene& scene) {
    ScenePlatformObjectsManager::managers.erase(&scene);
  }
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppPlatformBehaviorExtension() {
  return new PlatformBehaviorCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new PlatformBehaviorCppExtension;
}
#endif
