/**

Game Develop - Platform Automatism Extension
Copyright (c) 2014 Florian Rival (Florian.Rival@gmail.com)

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
#include "GDCore/Tools/Version.h"
#include "PlatformerObjectAutomatism.h"
#include "PlatformAutomatism.h"
#include "ScenePlatformObjectsManager.h"
#include <boost/version.hpp>

void DeclarePlatformAutomatismExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("PlatformAutomatism",
                          _("Platform Automatism"),
                          _("Allows to use controllable objects which can run and jump on platforms."),
                          "Florian Rival",
                          "zlib/libpng License (Open Source)");

    {
        gd::AutomatismMetadata & aut = extension.AddAutomatism("PlatformerObjectAutomatism",
              _("Platformer character"),
              "PlatformerObject",
              _("Controllable character which can jump and run on platforms."),
              "",
              "CppPlatform/Extensions/platformerobjecticon.png",
              "PlatformerObjectAutomatism",
              boost::shared_ptr<gd::Automatism>(new PlatformerObjectAutomatism),
              boost::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

        #if defined(GD_IDE_ONLY)
        aut.SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsMoving",
                       _("Is moving"),
                       _("Check if the object is moving (whether it is on the floor or in the air)."),
                       _("_PARAM0_ is moving"),
                       "",
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("IsMoving").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsOnFloor",
                       _("Is on floor"),
                       _("Check if the object is on a platform."),
                       _("_PARAM0_ is on floor"),
                       "",
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("IsOnFloor").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsOnLadder",
                       _("Is on ladder"),
                       _("Check if the object is on a ladder."),
                       _("_PARAM0_ is on ladder"),
                       "",
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("IsOnLadder").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsJumping",
                       _("Is jumping"),
                       _("Check if the object is jumping."),
                       _("_PARAM0_ is jumping"),
                       "",
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("IsJumping").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsFalling",
                       _("Is falling"),
                       _("Check if the object is falling.\nNote that the object can be flagged as jumping and falling at the same time: At the end of a jump, the fall speed becomes higher that the jump speed."),
                       _("_PARAM0_ is falling"),
                       "",
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("IsFalling").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("Gravity",
                       _("Gravity"),
                       _("Compare the gravity applied on the object (in pixels per second per second)."),
                       _("Gravity of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", _("Comparison sign"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetGravity").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("Gravity",
                       _("Gravity"),
                       _("Change the gravity applied on an object (in pixels per second per second)."),
                       _("Do _PARAM2__PARAM3_ to the gravity applied on _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))
            .codeExtraInformation.SetFunctionName("SetGravity").SetManipulatedType("number").SetAssociatedGetter("GetGravity").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("MaxFallingSpeed",
                       _("Maximum falling speed"),
                       _("Compare the maximum falling speed of the object (in pixels per second)."),
                       _("The maximum falling speed of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", _("Comparison sign"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetMaxFallingSpeed").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("MaxFallingSpeed",
                       _("Maximum falling speed"),
                       _("Change the maximum falling speed of an object (in pixels per second)."),
                       _("Do _PARAM2__PARAM3_ to the maximum falling speed of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))
            .codeExtraInformation.SetFunctionName("SetMaxFallingSpeed").SetManipulatedType("number").SetAssociatedGetter("GetMaxFallingSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("Acceleration",
                       _("Acceleration"),
                       _("Compare the acceleration of the object (in pixels per second per second)."),
                       _("The acceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", _("Comparison sign"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("Acceleration",
                       _("Acceleration"),
                       _("Change the acceleration of an object (in pixels per second per second)."),
                       _("Do _PARAM2__PARAM3_ to the acceleration of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))
            .codeExtraInformation.SetFunctionName("SetAcceleration").SetManipulatedType("number").SetAssociatedGetter("GetAcceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("Deceleration",
                       _("Deceleration"),
                       _("Compare the deceleration of the object (in pixels per second per second)."),
                       _("The deceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", _("Comparison sign"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetDeceleration").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("Deceleration",
                       _("Deceleration"),
                       _("Change the deceleration of an object (in pixels per second per second)."),
                       _("Do _PARAM2__PARAM3_ to the deceleration of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))
            .codeExtraInformation.SetFunctionName("SetDeceleration").SetManipulatedType("number").SetAssociatedGetter("GetDeceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("MaxSpeed",
                       _("Maximum speed"),
                       _("Compare the maximum speed of the object (in pixels per second)."),
                       _("The maximum speed of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", _("Comparison sign"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("MaxSpeed",
                       _("Maximum speed"),
                       _("Change the maximum speed of an object (in pixels per second)."),
                       _("Do _PARAM2__PARAM3_ to the maximum speed of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))
            .codeExtraInformation.SetFunctionName("SetMaxSpeed").SetManipulatedType("number").SetAssociatedGetter("GetMaxSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("JumpSpeed",
                       _("Jump speed"),
                       _("Compare the jump speed of the object (in pixels per second)."),
                       _("The jump speed of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", _("Comparison sign"))
            .AddParameter("expression", _("Value to test"))
            .codeExtraInformation.SetFunctionName("GetJumpSpeed").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("JumpSpeed",
                       _("Jump speed"),
                       _("Change the jump speed of an object (in pixels per second)."),
                       _("Do _PARAM2__PARAM3_ to the jump speed of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", _("Modification's sign"))
            .AddParameter("expression", _("Value"))
            .codeExtraInformation.SetFunctionName("SetJumpSpeed").SetManipulatedType("number").SetAssociatedGetter("GetJumpSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SetCanJump",
                       _("Allow again jumping"),
                       _("Allow the object to jump again, even if it is in the air: this can be useful to allow double jump for example."),
                       _("Allow _PARAM0_ to jump again"),
                       _("Options"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("SetCanJump").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateLeftKey",
                       _("Simulate left key press"),
                       _("Simulate a pressing on left key."),
                       _("Simulate pressing Left for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("SimulateLeftKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateRightKey",
                       _("Simulate right key press"),
                       _("Simulate a pressing on right key."),
                       _("Simulate pressing Right for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("SimulateRightKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateUpKey",
                       _("Simulate up key press"),
                       _("Simulate a pressing on up key ( Used when on a ladder )."),
                       _("Simulate pressing Up for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("SimulateUpKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateDownKey",
                       _("Simulate down key press"),
                       _("Simulate a pressing on down key ( Used when on a ladder )."),
                       _("Simulate pressing Down for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("SimulateDownKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateLadderKey",
                       _("Simulate ladder key press"),
                       _("Simulate a pressing on ladder key ( Used to grab a ladder )."),
                       _("Simulate pressing Ladder key for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("SimulateLadderKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateJumpKey",
                       _("Simulate jump key press"),
                       _("Simulate a pressing on jump key."),
                       _("Simulate pressing Jump key for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("SimulateJumpKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateControl",
                       _("Simulate control"),
                       _("Simulate a pressing on a key.\nValid keys are Left, Right, Jump, Ladder, Up, Down."),
                       _("Simulate pressing _PARAM2_ key for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("string", _("Key"))
            .codeExtraInformation.SetFunctionName("SimulateControl").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("IgnoreDefaultControls",
                       _("Ignore default controls"),
                       _("De/activate the use of default controls.\nIf deactivated, use the simulate actions to move the object."),
                       _("Ignore default controls for _PARAM0_: _PARAM2_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("yesorno", _("Ignore controls"))
            .codeExtraInformation.SetFunctionName("IgnoreDefaultControls").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("Gravity", _("Gravity"), _("Get the gravity applied on the object"), _("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("GetGravity").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("MaxFallingSpeed", _("Maximum falling speed"), _("Get the maximum falling speed"), _("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("GetMaxFallingSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("Acceleration", _("Acceleration"), _("Acceleration"), _("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("GetAcceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("Deceleration", _("Deceleration"), _("Deceleration"), _("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("GetDeceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("MaxSpeed", _("Maximum speed"), _("Maximum speed"), _("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("GetMaxSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("JumpSpeed", _("Jump speed"), _("Jump speed"), _("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformerObjectAutomatism")
            .codeExtraInformation.SetFunctionName("GetJumpSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");
        #endif
    }
    {
        gd::AutomatismMetadata & aut = extension.AddAutomatism("PlatformAutomatism",
              _("Platform"),
              "Platform",
              _("Platform on which Platformer characters can run."),
              "",
              "CppPlatform/Extensions/platformicon.png",
              "PlatformAutomatism",
              boost::shared_ptr<gd::Automatism>(new PlatformAutomatism),
              boost::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

        #if defined(GD_IDE_ONLY)
        aut.SetIncludeFile("PlatformAutomatism/PlatformAutomatism.h");

        aut.AddAction("ChangePlatformType",
                       _("Change platform type"),
                       _("Change the platform type of the object: Platform, Jumpthru or Ladder."),
                       _("Set platform type of _PARAM0_ to _PARAM2_"),
                       _("Platforms"),
                       "CppPlatform/Extensions/platformicon24.png",
                       "CppPlatform/Extensions/platformicon16.png")
            .AddParameter("object", _("Object"))
            .AddParameter("automatism", _("Automatism"), "PlatformAutomatism")
            .AddParameter("string", _("Platform type (\"Platform\", \"Jumpthru\" or \"Ladder\")"))
            .codeExtraInformation.SetFunctionName("ChangePlatformType").SetIncludeFile("PlatformAutomatism/PlatformAutomatism.h");
        #endif
    }
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
        DeclarePlatformAutomatismExtension(*this);
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };

    /**
     * \brief Initialize platforms list of the scene
     */
    virtual void SceneLoaded(RuntimeScene & scene)
    {
        ScenePlatformObjectsManager emptyManager;
        ScenePlatformObjectsManager::managers[&scene] = emptyManager;
    }

    /**
     * \brief Destroy platforms list of the scene
     */
    virtual void SceneUnloaded(RuntimeScene & scene)
    {
        ScenePlatformObjectsManager::managers.erase(&scene);
    }

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