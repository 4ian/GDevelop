/**

GDevelop - Top-down movement Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/Extensions/ExtensionBase.h"
#include "GDCpp/Runtime/Project/BehaviorsSharedData.h"
#include "TopDownMovementBehavior.h"
#include "TopDownMovementRuntimeBehavior.h"

void DeclareTopDownMovementBehaviorExtension(gd::PlatformExtension& extension) {
  extension.SetExtensionInformation(
      "TopDownMovementBehavior",
      _("Top-down movement"),
      _("Move objects in either 4 or 8 directions"),
      "Florian Rival",
      "Open source (MIT License)")
      .SetExtensionHelpPath("/behaviors/topdown");

  gd::BehaviorMetadata& aut =
      extension.AddBehavior("TopDownMovementBehavior",
                            _("Top-down movement (4 or 8 directions)"),
                            "TopDownMovement",
                            _("The object can be moved left, up, right, and "
                              "down (and, optionally, diagonally)."),
                            "",
                            "CppPlatform/Extensions/topdownmovementicon.png",
                            "TopDownMovementBehavior",
                            std::make_shared<TopDownMovementBehavior>(),
                            std::make_shared<gd::BehaviorsSharedData>());

#if defined(GD_IDE_ONLY)

  aut.SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("SimulateLeftKey",
                _("Simulate left key press"),
                _("Simulate a press of left key."),
                _("Simulate pressing Left for _PARAM0_"),
                _("Controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateLeftKey")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("SimulateRightKey",
                _("Simulate right key press"),
                _("Simulate a press of right key."),
                _("Simulate pressing Right for _PARAM0_"),
                _("Controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateRightKey")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("SimulateUpKey",
                _("Simulate up key press"),
                _("Simulate a press of up key."),
                _("Simulate pressing Up for _PARAM0_"),
                _("Controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateUpKey")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("SimulateDownKey",
                _("Simulate down key press"),
                _("Simulate a press of down key."),
                _("Simulate pressing Down for _PARAM0_"),
                _("Controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("SimulateDownKey")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction(
         "SimulateControl",
         _("Simulate control"),
         _("Simulate a press of a key.\nValid keys are Left, Right, Up, Down."),
         _("Simulate pressing _PARAM2_ key for _PARAM0_"),
         _("Controls"),
         "res/conditions/keyboard24.png",
         "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("string", _("Key"))
      .MarkAsAdvanced()
      .SetFunctionName("SimulateControl")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("IgnoreDefaultControls",
                _("Ignore default controls"),
                _("De/activate the use of default controls.\nIf deactivated, "
                  "use the simulated actions to move the object."),
                _("Ignore default controls for _PARAM0_: _PARAM2_"),
                _("Controls"),
                "res/conditions/keyboard24.png",
                "res/conditions/keyboard.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("yesorno", _("Ignore controls"))
      .MarkAsAdvanced()
      .SetFunctionName("IgnoreDefaultControls")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition("IsMoving",
                   _("Is moving"),
                   _("Check if the object is moving."),
                   _("_PARAM0_ is moving"),
                   "",
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("IsMoving")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("Acceleration",
                _("Acceleration"),
                _("Change the acceleration of the object"),
                _("the acceleration"),
                _("Movement"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetAcceleration")
      .SetGetter("GetAcceleration")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition("Acceleration",
                   _("Acceleration"),
                   _("Compare the acceleration of the object"),
                   _("the acceleration"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetAcceleration")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("Deceleration",
                _("Deceleration"),
                _("Change the deceleration of the object"),
                _("the deceleration"),
                _("Movement"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetDeceleration")
      .SetGetter("GetDeceleration")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition("Deceleration",
                   _("Deceleration"),
                   _("Compare the deceleration of the object"),
                   _("the deceleration"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetDeceleration")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("MaxSpeed",
                _("Maximum speed"),
                _("Change the maximum speed of the object"),
                _("the max. speed"),
                _("Movement"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters("number")
      .SetFunctionName("SetMaxSpeed")
      .SetGetter("GetMaxSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition("MaxSpeed",
                   _("Maximum speed"),
                   _("Compare the maximum speed of the object"),
                   _("the max. speed"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetMaxSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition("Speed",
                   _("Speed"),
                   _("Compare the speed of the object"),
                   _("the speed"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .SetFunctionName("GetSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("AngularMaxSpeed",
                _("Angular maximum speed"),
                _("Change the maximum angular speed of the object"),
                _("the max. angular speed"),
                _("Movement"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetAngularMaxSpeed")
      .SetGetter("GetAngularMaxSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition("AngularMaxSpeed",
                   _("Angular maximum speed"),
                   _("Compare the maximum angular speed of the object"),
                   _("the max. angular speed"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetAngularMaxSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("AngleOffset",
                _("Rotation offset"),
                _("Change the rotation offset applied when moving the object"),
                _("the rotation offset"),
                _("Movement"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("SetAngleOffset")
      .SetGetter("GetAngleOffset")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition(
         "AngleOffset",
         _("Rotation offset"),
         _("Compare the rotation offset applied when moving the object"),
         _("the rotation offset"),
         _("Movement"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetAngleOffset")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition(
         "Angle",
         _("Angle of movement"),
         _("Compare the angle of the top-down movement of the object."),
         _("the angle of movement"),
         _("Movement"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetAngle")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition(
         "XVelocity",
         _("Speed on X axis"),
         _("Compare the velocity of the top-down movement of the object on the X axis."),
         _("the speed of movement on X axis"),
         _("Movement"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetXVelocity")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition(
         "YVelocity",
         _("Speed on Y axis"),
         _("Compare the velocity of the top-down movement of the object on the Y axis."),
         _("the speed of movement on Y axis"),
         _("Movement"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .UseStandardRelationalOperatorParameters("number")
      .MarkAsAdvanced()
      .SetFunctionName("GetYVelocity")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("AllowDiagonals",
                _("Diagonal movement"),
                _("Allow or restrict diagonal movemment"),
                _("Allow diagonal moves for _PARAM0_: _PARAM2_"),
                _("Movement"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("yesorno", _("Allow?"))
      .SetFunctionName("SetAllowDiagonals")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition("DiagonalsAllowed",
                   _("Diagonal movement"),
                   _("Check if the object is allowed to move diagonally"),
                   _("Allow diagonal moves for _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("DiagonalsAllowed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddAction("RotateObject",
                _("Rotate the object"),
                _("Enable or disable rotation of the object"),
                _("Enable rotation of _PARAM0_: _PARAM2_"),
                _("Movement"),
                "CppPlatform/Extensions/topdownmovementicon24.png",
                "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .AddParameter("yesorno", _("Rotate object?"))
      .MarkAsAdvanced()
      .SetFunctionName("SetRotateObject")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddCondition(
         "ObjectRotated",
         _("Object rotated"),
         _("Check if the object is rotated while traveling on its path."),
         _("_PARAM0_ is rotated when moving"),
         _("Movement"),
         "CppPlatform/Extensions/topdownmovementicon24.png",
         "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .MarkAsAdvanced()
      .SetFunctionName("IsObjectRotated")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("Acceleration",
                    _("Acceleration"),
                    _("Acceleration of the object"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAcceleration")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("Deceleration",
                    _("Deceleration"),
                    _("Deceleration of the object"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetDeceleration")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("MaxSpeed",
                    _("Maximum speed"),
                    _("Maximum speed of the object"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetMaxSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("Speed",
                    _("Speed"),
                    _("Speed of the object"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("AngularMaxSpeed",
                    _("Angular maximum speed"),
                    _("Angular maximum speed of the object"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAngularMaxSpeed")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("AngleOffset",
                    _("Rotation offset"),
                    _("Rotation offset applied to the object"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAngleOffset")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("Angle",
                    _("Angle of the movement"),
                    _("Angle, in degrees, of the movement"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetAngle")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("XVelocity",
                    _("Speed on the X axis"),
                    _("Speed on the X axis of the movement"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetXVelocity")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

  aut.AddExpression("YVelocity",
                    _("Speed on the Y axis"),
                    _("Speed on the Y axis of the movement"),
                    _("Movement"),
                    "CppPlatform/Extensions/topdownmovementicon16.png")
      .AddParameter("object", _("Object"))
      .AddParameter("behavior", _("Behavior"), "TopDownMovementBehavior")
      .SetFunctionName("GetYVelocity")
      .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");
#endif
}

/**
 * \brief This class declares information about the extension.
 */
class TopDownMovementBehaviorCppExtension : public ExtensionBase {
 public:
  /**
   * Constructor of an extension declares everything the extension contains:
   * objects, actions, conditions and expressions.
   */
  TopDownMovementBehaviorCppExtension() {
    DeclareTopDownMovementBehaviorExtension(*this);
    AddRuntimeBehavior<TopDownMovementRuntimeBehavior>(
        GetBehaviorMetadata("TopDownMovementBehavior::TopDownMovementBehavior"),
        "TopDownMovementRuntimeBehavior");
    GetBehaviorMetadata("TopDownMovementBehavior::TopDownMovementBehavior")
        .SetIncludeFile("TopDownMovementBehavior/TopDownMovementRuntimeBehavior.h");

    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(ANDROID)
extern "C" ExtensionBase* CreateGDCppTopDownMovementBehaviorExtension() {
  return new TopDownMovementBehaviorCppExtension;
}
#elif !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase* GD_EXTENSION_API CreateGDExtension() {
  return new TopDownMovementBehaviorCppExtension;
}
#endif
