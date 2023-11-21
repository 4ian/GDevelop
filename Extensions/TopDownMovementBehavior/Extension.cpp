/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCore/Extensions/Metadata/MultipleInstructionMetadata.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Project/BehaviorsSharedData.h"
#include "GDCore/Tools/Localization.h"
#include "TopDownMovementBehavior.h"

void DeclareTopDownMovementBehaviorExtension(gd::PlatformExtension& extension) {
  extension
      .SetExtensionInformation(
          "TopDownMovementBehavior",
          _("Top-down movement"),
          _("Allows to move objects in either 4 or 8 directions, with the "
            "keyboard or using events."),
          "Florian Rival",
          "Open source (MIT License)")
      .SetCategory("Movement")
      .SetTags("top-down")
      .SetExtensionHelpPath("/behaviors/topdown");
  extension.AddInstructionOrExpressionGroupMetadata(_("Top-down movement"))
      .SetIcon("CppPlatform/Extensions/topdownmovementicon16.png");

  gd::BehaviorMetadata& aut = extension.AddBehavior(
      "TopDownMovementBehavior",
      _("Top-down movement (4 or 8 directions)"),
      "TopDownMovement",
      _("Move objects left, up, right, and "
        "down (and, optionally, diagonally)."),
      "",
      "CppPlatform/Extensions/topdownmovementicon.png",
      "TopDownMovementBehavior",
      std::make_shared<TopDownMovementBehavior>(),
      std::make_shared<gd::BehaviorsSharedData>());

  aut.AddAction("SimulateLeftKey",
                _("Simulate left key press"),
                _("Simulate a press of left key."),
                _("Simulate pressing Left for _PARAM0_"),
                _("Top-down controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateLeftKey");

  aut.AddAction("SimulateRightKey",
                _("Simulate right key press"),
                _("Simulate a press of right key."),
                _("Simulate pressing Right for _PARAM0_"),
                _("Top-down controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateRightKey");

  aut.AddAction("SimulateUpKey",
                _("Simulate up key press"),
                _("Simulate a press of up key."),
                _("Simulate pressing Up for _PARAM0_"),
                _("Top-down controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateUpKey");

  aut.AddAction("SimulateDownKey",
                _("Simulate down key press"),
                _("Simulate a press of down key."),
                _("Simulate pressing Down for _PARAM0_"),
                _("Top-down controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateDownKey");

  aut.AddAction(
         "SimulateControl",
         _("Simulate control"),
         _("Simulate a press of a key.\nValid keys are Left, Right, Up, Down."),
         _("Simulate pressing _PARAM2_ key for _PARAM0_"),
         _("Top-down controls"),
         "res/conditions/keyboard24.png",
         "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("stringWithSelector",
                    _("Key"),
                    "[\"Left\", \"Right\", \"Up\", \"Down\"]")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateControl");

  aut.AddAction("IgnoreDefaultControls",
                _("Ignore default controls"),
                _("De/activate the use of default controls.\nIf deactivated, "
                  "use the simulated actions to move the object."),
                _("Ignore default controls for _PARAM0_: _PARAM2_"),
                _("Top-down controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("yesorno", _("Ignore controls"))
      .MarkAsAdvanced()
      .SetFunctionName("IgnoreDefaultControls");

  aut.AddAction("SimulateStick",
                _("Simulate stick control"),
                _("Simulate a stick control."),
                _("Simulate a stick control for _PARAM0_ with a _PARAM2_ angle and a _PARAM3_ force"),
                _("Top-down controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("expression", _("Stick angle (in degrees)"))
      .AddParameter("expression", _("Stick force (between 0 and 1)"))
      .MarkAsAdvanced()
      .SetFunctionName("SimulateStick");

    aut.AddScopedCondition("IsUsingControl",
                  _("Control pressed or simulated"),
                  _("A control was applied from a default control or simulated by an action."),
                  _("_PARAM0_ has the _PARAM2_ key pressed or simulated"),
                  _("Top-down state"),
                  "res/conditions/keyboard24.png",
                  "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
        .AddParameter("stringWithSelector",
                    _("Key"),
                    "[\"Left\", \"Right\", \"Up\", \"Down\", \"Stick\"]")
        .MarkAsAdvanced();

  aut.AddExpression("StickAngle",
                    _("Stick angle"),
                    _("Return the angle of the simulated stick input (in degrees)"),
                    _("Top-down controls"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior");

  aut.AddCondition("IsMoving",
                   _("Is moving"),
                   _("Check if the object is moving."),
                   _("_PARAM0_ is moving"),
                   _("Top-down state"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("IsMoving");

  aut.AddAction("Acceleration",
                _("Acceleration"),
                _("Change the acceleration of the object"),
                _("the acceleration"),
                _("Top-down configuration"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Acceleration (in pixels per second per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("SetAcceleration")
      .SetGetter("GetAcceleration");

  aut.AddCondition("Acceleration",
                   _("Acceleration"),
                   _("Compare the acceleration of the object"),
                   _("the acceleration"),
                   _("Top-down configuration"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(_(
              "Acceleration to compare to (in pixels per second per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("GetAcceleration");

  aut.AddAction("Deceleration",
                _("Deceleration"),
                _("Change the deceleration of the object"),
                _("the deceleration"),
                _("Top-down configuration"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Deceleration (in pixels per second per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("SetDeceleration")
      .SetGetter("GetDeceleration");

  aut.AddCondition("Deceleration",
                   _("Deceleration"),
                   _("Compare the deceleration of the object"),
                   _("the deceleration"),
                   _("Top-down configuration"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(_(
              "Deceleration to compare to (in pixels per second per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("GetDeceleration");

  aut.AddAction("MaxSpeed",
                _("Maximum speed"),
                _("Change the maximum speed of the object"),
                _("the max. speed"),
                _("Top-down configuration"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Max speed (in pixels per second)")))
      .SetFunctionName("SetMaxSpeed")
      .SetGetter("GetMaxSpeed");

  aut.AddCondition("MaxSpeed",
                   _("Maximum speed"),
                   _("Compare the maximum speed of the object"),
                   _("the max. speed"),
                   _("Top-down configuration"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Max speed to compare to (in pixels per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("GetMaxSpeed");

  aut.AddCondition("Speed",
                   _("Speed"),
                   _("Compare the speed of the object"),
                   _("the speed"),
                   _("Top-down state"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Speed to compare to (in pixels per second)")))
      .SetFunctionName("GetSpeed");

  aut.AddAction("AngularMaxSpeed",
                _("Angular maximum speed"),
                _("Change the maximum angular speed of the object"),
                _("the max. angular speed"),
                _("Top-down configuration"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Max angular speed (in degrees per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("SetAngularMaxSpeed")
      .SetGetter("GetAngularMaxSpeed");

  aut.AddCondition("AngularMaxSpeed",
                   _("Angular maximum speed"),
                   _("Compare the maximum angular speed of the object"),
                   _("the max. angular speed"),
                   _("Top-down configuration"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Max angular speed to compare to (in degrees per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("GetAngularMaxSpeed");

  aut.AddAction("AngleOffset",
                _("Rotation offset"),
                _("Change the rotation offset applied when moving the object"),
                _("the rotation offset"),
                _("Top-down configuration"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")))
      .MarkAsAdvanced()
      .SetFunctionName("SetAngleOffset")
      .SetGetter("GetAngleOffset");

  aut.AddCondition(
         "AngleOffset",
         _("Rotation offset"),
         _("Compare the rotation offset applied when moving the object"),
         _("the rotation offset"),
         _("Top-down configuration"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle to compare to (in degrees)")))
      .MarkAsAdvanced()
      .SetFunctionName("GetAngleOffset");

  // Deprecated
  aut.AddCondition(
         "Angle",
         _("Angle of movement"),
         _("Compare the angle of the top-down movement of the object."),
         _("the angle of movement"),
         _("Top-down state"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle to compare to (in degrees)")))
      .MarkAsAdvanced()
      .SetHidden()
      .SetFunctionName("GetAngle");
    
    aut.AddScopedCondition(
           "IsMovementAngleAround",
           _("Angle of movement"),
           _("Compare the angle of the top-down movement of the object."),
           _("Angle of movement of _PARAM0_ is _PARAM2_ ± _PARAM3_°"),
         _("Top-down state"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
        .AddParameter("expression", _("Angle (in degrees)"))
        .AddParameter("expression", _("Tolerance (in degrees)"));

  aut.AddCondition("XVelocity",
                   _("Speed on X axis"),
                   _("Compare the velocity of the top-down movement of the "
                     "object on the X axis."),
                   _("the speed of movement on X axis"),
                   _("Top-down state"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Speed to compare to (in pixels per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("GetXVelocity");

  aut.AddScopedAction("SetVelocityX",
                      _("Speed on the X axis"),
                      _("Change the speed on the X axis of the movement"),
                      _("the speed on the X axis of the movement"),
                      _("Top-down state"),
                      "CppPlatform/Extensions/topdownmovementicon24.png",
                      "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Speed (in pixels per second)")))
      .MarkAsAdvanced();

  aut.AddCondition("YVelocity",
                   _("Speed on Y axis"),
                   _("Compare the velocity of the top-down movement of the "
                     "object on the Y axis."),
                   _("the speed of movement on Y axis"),
                   _("Top-down state"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Speed to compare to (in pixels per second)")))
      .MarkAsAdvanced()
      .SetFunctionName("GetYVelocity");

  aut.AddScopedAction("SetVelocityY",
                      _("Speed on the Y axis"),
                      _("Change the speed on the Y axis of the movement"),
                      _("the speed on the Y axis of the movement"),
                      _("Top-down state"),
                      "CppPlatform/Extensions/topdownmovementicon24.png",
                      "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Speed (in pixels per second)")))
      .MarkAsAdvanced();

  aut.AddAction("AllowDiagonals",
                _("Diagonal movement"),
                _("Allow or restrict diagonal movement"),
                _("Allow diagonal moves for _PARAM0_: _PARAM2_"),
                _("Top-down configuration"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("yesorno", _("Allow?"))
      .SetFunctionName("SetAllowDiagonals");

  aut.AddCondition("DiagonalsAllowed",
                   _("Diagonal movement"),
                   _("Check if the object is allowed to move diagonally"),
                   _("Allow diagonal moves for _PARAM0_"),
                   _("Top-down configuration"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("DiagonalsAllowed");

  aut.AddAction("RotateObject",
                _("Rotate the object"),
                _("Enable or disable rotation of the object"),
                _("Enable rotation of _PARAM0_: _PARAM2_"),
                _("Top-down configuration"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("yesorno", _("Rotate object?"))
      .MarkAsAdvanced()
      .SetFunctionName("SetRotateObject");

  aut.AddCondition(
         "ObjectRotated",
         _("Object rotated"),
         _("Check if the object is rotated while traveling on its path."),
         _("_PARAM0_ is rotated when moving"),
         _("Top-down configuration"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("IsObjectRotated");

  aut.AddExpression("Acceleration",
                    _("Acceleration"),
                    _("Acceleration of the object"),
                    _("Top-down configuration"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAcceleration");

  aut.AddExpression("Deceleration",
                    _("Deceleration"),
                    _("Deceleration of the object"),
                    _("Top-down configuration"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetDeceleration");

  aut.AddExpression("MaxSpeed",
                    _("Maximum speed"),
                    _("Maximum speed of the object"),
                    _("Top-down configuration"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetMaxSpeed");

  aut.AddExpression("Speed",
                    _("Speed"),
                    _("Speed of the object"),
                    _("Top-down state"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetSpeed");

  aut.AddExpression("AngularMaxSpeed",
                    _("Angular maximum speed"),
                    _("Angular maximum speed of the object"),
                    _("Top-down configuration"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAngularMaxSpeed");

  aut.AddExpression("AngleOffset",
                    _("Rotation offset"),
                    _("Rotation offset applied to the object"),
                    _("Top-down configuration"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAngleOffset");

  aut.AddExpression("Angle",
                    _("Angle of the movement"),
                    _("Angle, in degrees, of the movement"),
                    _("Top-down state"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAngle");

  aut.AddExpression("XVelocity",
                    _("Speed on the X axis"),
                    _("Speed on the X axis of the movement"),
                    _("Top-down state"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetXVelocity");

  aut.AddExpression("YVelocity",
                    _("Speed on the Y axis"),
                    _("Speed on the Y axis of the movement"),
                    _("Top-down state"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetYVelocity");

  aut.AddExpressionAndConditionAndAction(
         "number",
         "MovementAngleOffset",
         _("Movement angle offset"),
         _("the movement angle offset"),
         _("the movement angle offset"),
         _("Top-down configuration"),
         "CppPlatform/Extensions/topdownmovementicon24.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardParameters(
          "number",
          gd::ParameterOptions::MakeNewOptions().SetDescription(
              _("Angle (in degrees)")));
}
