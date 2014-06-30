/**

Game Develop - Top-down movement Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDCpp/ExtensionBase.h"
#include "GDCpp/AutomatismsSharedData.h"
#include "GDCore/Tools/Version.h"
#include "TopDownMovementAutomatism.h"
#include <boost/version.hpp>

void DeclareTopDownMovementAutomatismExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("TopDownMovementAutomatism",
                              _("Top-down movement"),
                              _("Move objects in 4 or 8 directions"),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");

    gd::AutomatismMetadata & aut = extension.AddAutomatism("TopDownMovementAutomatism",
          _("Top-down movement (4 or 8 directions)"),
          "TopDownMovement",
          _("The object can be moved left, up, right, down and optionally diagonals."),
          "",
          "CppPlatform/Extensions/topdownmovementicon.png",
          "TopDownMovementAutomatism",
          boost::shared_ptr<gd::Automatism>(new TopDownMovementAutomatism),
          boost::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

    #if defined(GD_IDE_ONLY)

    aut.SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateLeftKey",
                   _("Simulate left key press"),
                   _("Simulate a pressing on left key."),
                   _("Simulate pressing Left for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("SimulateLeftKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateRightKey",
                   _("Simulate right key press"),
                   _("Simulate a pressing on right key."),
                   _("Simulate pressing Right for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("SimulateRightKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateUpKey",
                   _("Simulate up key press"),
                   _("Simulate a pressing on up key ( Used when on a ladder )."),
                   _("Simulate pressing Up for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("SimulateUpKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateDownKey",
                   _("Simulate down key press"),
                   _("Simulate a pressing on down key ( Used when on a ladder )."),
                   _("Simulate pressing Down for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("SimulateDownKey").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("SimulateControl",
                   _("Simulate control"),
                   _("Simulate a pressing on a key.\nValid keys are Left, Right, Up, Down."),
                   _("Simulate pressing _PARAM2_ key for _PARAM0_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("string", _("Key"))
        .codeExtraInformation.SetFunctionName("SimulateControl").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("IgnoreDefaultControls",
                   _("Ignore default controls"),
                   _("De/activate the use of default controls.\nIf deactivated, use the simulate actions to move the object."),
                   _("Ignore default controls for _PARAM0_: _PARAM2_"),
                   _("Controls"),
                   "res/conditions/keyboard24.png",
                   "res/conditions/keyboard.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("yesorno", _("Ignore controls"))
        .codeExtraInformation.SetFunctionName("IgnoreDefaultControls").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("IsMoving",
                   _("Is moving"),
                   _("Check if the object is moving."),
                   _("_PARAM0_ is moving"),
                   "",
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("IsMoving").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("Acceleration",
                   _("Acceleration"),
                   _("Change the acceleration of the object"),
                   _("Do _PARAM2__PARAM3_ to the acceleration of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetAcceleration").SetAssociatedGetter("GetAcceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("Acceleration",
                   _("Acceleration"),
                   _("Compare the acceleration of the object"),
                   _("Acceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("GetAcceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("Deceleration",
                   _("Deceleration"),
                   _("Change the deceleration of the object"),
                   _("Do _PARAM2__PARAM3_ to the deceleration of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetDeceleration").SetAssociatedGetter("GetDeceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("Deceleration",
                   _("Deceleration"),
                   _("Compare the deceleration of the object"),
                   _("Deceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("GetDeceleration").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("MaxSpeed",
                   _("Maximum speed"),
                   _("Change the maximum speed of the object"),
                   _("Do _PARAM2__PARAM3_ to the max. speed of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetMaxSpeed").SetAssociatedGetter("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("MaxSpeed",
                   _("Maximum speed"),
                   _("Compare the maximum speed of the object"),
                   _("Max. speed of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("Speed",
                   _("Speed"),
                   _("Compare the speed of the object"),
                   _("Speed of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("GetSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("AngularMaxSpeed",
                   _("Angular maximum speed"),
                   _("Change the maximum angular speed of the object"),
                   _("Do _PARAM2__PARAM3_ to the max. angular speed of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetAngularMaxSpeed").SetAssociatedGetter("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("AngularMaxSpeed",
                   _("Angular maximum speed"),
                   _("Compare the maximum angular speed of the object"),
                   _("Max. angular speed of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("GetAngularMaxSpeed").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("AngleOffset",
                   _("Rotation offset"),
                   _("Change the rotation offset applied when moving the object"),
                   _("Do _PARAM2__PARAM3_ to the rotation offset of _PARAM0_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("operator", _("Modification's sign"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("SetAngleOffset").SetAssociatedGetter("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("AngleOffset",
                   _("Rotation offset"),
                   _("Compare the rotation offset applied when moving the object"),
                   _("Rotation offset of _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("relationalOperator", _("Sign of the test"))
        .AddParameter("expression", _("Value"))
        .codeExtraInformation.SetFunctionName("GetAngleOffset").SetManipulatedType("number").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("AllowDiagonals",
                   _("Diagonals moves"),
                   _("Allow or restrict diagonal moves"),
                   _("Allow diagonal moves for _PARAM0_: _PARAM2_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("yesorno", _("Allow?"))
        .codeExtraInformation.SetFunctionName("SetAllowDiagonals").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("DiagonalsAllowed",
                   _("Diagonals moves"),
                   _("Return true if the object is allowed to do diagonal moves"),
                   _("Size of the extra border applied to _PARAM0_ is _PARAM2__PARAM3_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("DiagonalsAllowed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddAction("RotateObject",
                   _("Rotate the object"),
                   _("Enable or disable rotation of the object"),
                   _("Enable rotation of _PARAM0_: _PARAM2_"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .AddParameter("yesorno", _("Rotate object?"))
        .codeExtraInformation.SetFunctionName("SetRotateObject").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddCondition("ObjectRotated",
                   _("Object rotated"),
                   _("Return true if the object is rotated when traveling on its path."),
                   _("_PARAM0_ is rotated when moving"),
                   _("Movement"),
                   "CppPlatform/Extensions/topdownmovementicon24.png",
                   "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("IsObjectRotated").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("Acceleration", _("Acceleration"), _("Acceleration of the object"), _("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("GetAcceleration").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("Deceleration", _("Deceleration"), _("Deceleration of the object"), _("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("GetDeceleration").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("MaxSpeed", _("Maximum speed"), _("Maximum speed of the object"), _("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("GetMaxSpeed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("Speed", _("Speed"), _("Speed of the object"), _("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("GetSpeed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("AngularMaxSpeed", _("Angular maximum speed"), _("Angular maximum speed of the object"), _("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("GetAngularMaxSpeed").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");

    aut.AddExpression("AngleOffset", _("Rotation offset"), _("Rotation offset applied to the object"), _("Movement"), "CppPlatform/Extensions/topdownmovementicon16.png")
        .AddParameter("object", _("Object"))
        .AddParameter("automatism", _("Automatism"), "TopDownMovementAutomatism", false)
        .codeExtraInformation.SetFunctionName("GetAngleOffset").SetIncludeFile("TopDownMovementAutomatism/TopDownMovementAutomatism.h");
    #endif
}

/**
 * \brief This class declares information about the extension.
 */
class Extension : public ExtensionBase
{
public:

    /**
     * Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    Extension()
    {
        DeclareTopDownMovementAutomatismExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~Extension() {};
};

#if !defined(EMSCRIPTEN)
/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" ExtensionBase * GD_EXTENSION_API CreateGDExtension() {
    return new Extension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDExtension(ExtensionBase * p) {
    delete p;
}
#endif