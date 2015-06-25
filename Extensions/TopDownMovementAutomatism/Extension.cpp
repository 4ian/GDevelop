/**

GDevelop - Top-down movement Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCpp/AutomatismsSharedData.h"
#include "GDCore/Tools/Version.h"
#include "TopDownMovementAutomatism.h"


void DeclareTopDownMovementAutomatismExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TopDownMovementAutomatism",
                              GD_T("Top-down movement"),
                              GD_T("Move objects in 4 or 8 directions"),
                              "Florian Rival",
                              "Open source (MIT License)");

    gd::AutomatismMetadata & aut = extension.AddAutomatism("TopDownMovementAutomatism",
          GD_T("Top-down movement (4 or 8 directions)"),
          "TopDownMovement",
          GD_T("The object can be moved left, up, right, down and optionally diagonals."),
          "",
          "CppPlatform/Extensions/topdownmovementicon.png",
          "TopDownMovementAutomatism",
          std::shared_ptr<gd::Automatism>(new TopDownMovementAutomatism),
          std::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

    #if defined(GD_IDE_ONLY)

    aut.SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateLeftKey",
                   _("Simulate left key press"),
                   _("Simulate a pressing on left key."),
                   GD_T("Simulate pressing Left for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .MarkAsAdvanced()
        .SetFunctionName("SimulateLeftKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateRightKey",
                   _("Simulate right key press"),
                   _("Simulate a pressing on right key."),
                   GD_T("Simulate pressing Right for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .MarkAsAdvanced()
        .SetFunctionName("SimulateRightKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateUpKey",
                   _("Simulate up key press"),
                   _("Simulate a pressing on up key ( Used when on a ladder )."),
                   GD_T("Simulate pressing Up for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .MarkAsAdvanced()
        .SetFunctionName("SimulateUpKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateDownKey",
                   _("Simulate down key press"),
                   _("Simulate a pressing on down key ( Used when on a ladder )."),
                   GD_T("Simulate pressing Down for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .MarkAsAdvanced()
        .SetFunctionName("SimulateDownKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateControl",
                   _("Simulate control"),
                   _("Simulate a pressing on a key.\nValid keys are Left, Right, Up, Down."),
                   GD_T("Simulate pressing _PARAM2_ key for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("string", GD_T("Key"))
        .MarkAsAdvanced()
        .SetFunctionName("SimulateControl").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("IgnoreDefaultControls",
                   _("Ignore default controls"),
                   _("De/activate the use of default controls.\nIf deactivated, use the simulate actions to move the object."),
                   GD_T("Ignore default controls for _PARAM0_: _PARAM2_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("yesorno", GD_T("Ignore controls"))
        .MarkAsAdvanced()
        .SetFunctionName("IgnoreDefaultControls").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("IsMoving",
                   _("Is moving"),
                   _("Check if the object is moving."),
                   GD_T("_PARAM0_ is moving"),
                   _(""),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .SetFunctionName("IsMoving").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("Acceleration",
                   _("Acceleration"),
                   _("Change the acceleration of the object"),
                   GD_T("Do _PARAM2__PARAM3_ to the acceleration of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetAcceleration").SetGetter("GetAcceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("Acceleration",
                   _("Acceleration"),
                   _("Compare the acceleration of the object"),
                   GD_T("Acceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("GetAcceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("Deceleration",
                   _("Deceleration"),
                   _("Change the deceleration of the object"),
                   GD_T("Do _PARAM2__PARAM3_ to the deceleration of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetDeceleration").SetGetter("GetDeceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("Deceleration",
                   _("Deceleration"),
                   _("Compare the deceleration of the object"),
                   GD_T("Deceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("GetDeceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("MaxSpeed",
                   _("Maximum speed"),
                   _("Change the maximum speed of the object"),
                   GD_T("Do _PARAM2__PARAM3_ to the max. speed of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .SetFunctionName("SetMaxSpeed").SetGetter("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("MaxSpeed",
                   _("Maximum speed"),
                   _("Compare the maximum speed of the object"),
                   GD_T("Max. speed of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("Speed",
                   _("Speed"),
                   _("Compare the speed of the object"),
                   GD_T("Speed of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value"))
        .SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("AngularMaxSpeed",
                   _("Angular maximum speed"),
                   _("Change the maximum angular speed of the object"),
                   GD_T("Do _PARAM2__PARAM3_ to the max. angular speed of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetAngularMaxSpeed").SetGetter("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("AngularMaxSpeed",
                   _("Angular maximum speed"),
                   _("Compare the maximum angular speed of the object"),
                   GD_T("Max. angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("AngleOffset",
                   _("Rotation offset"),
                   _("Change the rotation offset applied when moving the object"),
                   GD_T("Do _PARAM2__PARAM3_ to the rotation offset of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", GD_T("Modification's sign"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("SetAngleOffset").SetGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("AngleOffset",
                   _("Rotation offset"),
                   _("Compare the rotation offset applied when moving the object"),
                   GD_T("Rotation offset of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", GD_T("Sign of the test"))
        .AddParameter("expression", GD_T("Value"))
        .MarkAsAdvanced()
        .SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("AllowDiagonals",
                   _("Diagonals moves"),
                   _("Allow or restrict diagonal moves"),
                   GD_T("Allow diagonal moves for _PARAM0_: _PARAM2_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("yesorno", GD_T("Allow?"))
        .SetFunctionName("SetAllowDiagonals").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("DiagonalsAllowed",
                   _("Diagonals moves"),
                   _("Return true if the object is allowed to do diagonal moves"),
                   GD_T("Size of the extra border applied to _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .MarkAsAdvanced()
        .SetFunctionName("DiagonalsAllowed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("RotateObject",
                   _("Rotate the object"),
                   _("Enable or disable rotation of the object"),
                   GD_T("Enable rotation of _PARAM0_: _PARAM2_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("yesorno", GD_T("Rotate object?"))
        .MarkAsAdvanced()
        .SetFunctionName("SetRotateObject").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("ObjectRotated",
                   _("Object rotated"),
                   _("Return true if the object is rotated when traveling on its path."),
                   GD_T("_PARAM0_ is rotated when moving"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .MarkAsAdvanced()
        .SetFunctionName("IsObjectRotated").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");


    aut.AddExpression("Acceleration", GD_T("Acceleration"), GD_T("Acceleration of the object"), GD_T("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .SetFunctionName("GetAcceleration").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("Deceleration", GD_T("Deceleration"), GD_T("Deceleration of the object"), GD_T("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .SetFunctionName("GetDeceleration").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("MaxSpeed", GD_T("Maximum speed"), GD_T("Maximum speed of the object"), GD_T("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .SetFunctionName("GetMaxSpeed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("Speed", GD_T("Speed"), GD_T("Speed of the object"), GD_T("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .SetFunctionName("GetSpeed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("AngularMaxSpeed", GD_T("Angular maximum speed"), GD_T("Angular maximum speed of the object"), GD_T("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .SetFunctionName("GetAngularMaxSpeed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("AngleOffset", GD_T("Rotation offset"), GD_T("Rotation offset applied to the object"), GD_T("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", GD_T("Object"))
        .AddParameter("automatism", GD_T("Automatism"), "TopDownMovementAutomatism", false)
        .SetFunctionName("GetAngleOffset").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");
    #endif
}

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    Extension()
    {
        DeclareTopDownMovementAutomatismExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if !defined(EMSCRIPTEN)
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}
#endif
