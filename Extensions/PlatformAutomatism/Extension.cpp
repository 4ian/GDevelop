/**

GDevelop - Platform Automatism Extension
Copyright (c) 2014-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include "GDCpp/ExtensionBase.h"
#include "GDCore/Tools/Version.h"
#include "PlatformerObjectAutomatism.h"
#include "PlatformAutomatism.h"
#include "ScenePlatformObjectsManager.h"


void DeclarePlatformAutomatismExtension(gd::PlatformExtension & extension)
{
    extension.SetExtensionInformation("PlatformAutomatism",
                          GD_T("Platform Automatism"),
                          GD_T("Allows to use controllable objects which can run and jump on platforms."),
                          "Florian Rival",
                          "Open source (MIT License)");

    {
        gd::AutomatismMetadata & aut = extension.AddAutomatism("PlatformerObjectAutomatism",
              GD_T("Platformer character"),
              "PlatformerObject",
              GD_T("Controllable character which can jump and run on platforms."),
              "",
              "CppPlatform/Extensions/platformerobjecticon.png",
              "PlatformerObjectAutomatism",
              std::shared_ptr<gd::Automatism>(new PlatformerObjectAutomatism),
              std::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

        #if defined(GD_IDE_ONLY)
        aut.SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsMoving",
                       _("Is moving"),
                       _("Check if the object is moving (whether it is on the floor or in the air)."),
                       GD_T("_PARAM0_ is moving"),
                       _(""),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsSimple()
            .SetFunctionName("IsMoving").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsOnFloor",
                       _("Is on floor"),
                       _("Check if the object is on a platform."),
                       GD_T("_PARAM0_ is on floor"),
                       _(""),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsSimple()
            .SetFunctionName("IsOnFloor").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsOnLadder",
                       _("Is on ladder"),
                       _("Check if the object is on a ladder."),
                       GD_T("_PARAM0_ is on ladder"),
                       _(""),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsAdvanced()
            .SetFunctionName("IsOnLadder").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsJumping",
                       _("Is jumping"),
                       _("Check if the object is jumping."),
                       GD_T("_PARAM0_ is jumping"),
                       _(""),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsSimple()
            .SetFunctionName("IsJumping").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("IsFalling",
                       _("Is falling"),
                       _("Check if the object is falling.\nNote that the object can be flagged as jumping and falling at the same time: At the end of a jump, the fall speed becomes higher that the jump speed."),
                       GD_T("_PARAM0_ is falling"),
                       _(""),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("IsFalling").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("Gravity",
                       _("Gravity"),
                       _("Compare the gravity applied on the object (in pixels per second per second)."),
                       GD_T("Gravity of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", GD_T("Comparison sign"))
            .AddParameter("expression", GD_T("Value to test"))
            .MarkAsAdvanced()
            .SetFunctionName("GetGravity").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("Gravity",
                       _("Gravity"),
                       _("Change the gravity applied on an object (in pixels per second per second)."),
                       GD_T("Do _PARAM2__PARAM3_ to the gravity applied on _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))
            .MarkAsAdvanced()
            .SetFunctionName("SetGravity").SetManipulatedType("number").SetGetter("GetGravity").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("MaxFallingSpeed",
                       _("Maximum falling speed"),
                       _("Compare the maximum falling speed of the object (in pixels per second)."),
                       GD_T("The maximum falling speed of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", GD_T("Comparison sign"))
            .AddParameter("expression", GD_T("Value to test"))
            .MarkAsAdvanced()
            .SetFunctionName("GetMaxFallingSpeed").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("MaxFallingSpeed",
                       _("Maximum falling speed"),
                       _("Change the maximum falling speed of an object (in pixels per second)."),
                       GD_T("Do _PARAM2__PARAM3_ to the maximum falling speed of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))
            .MarkAsAdvanced()
            .SetFunctionName("SetMaxFallingSpeed").SetManipulatedType("number").SetGetter("GetMaxFallingSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("Acceleration",
                       _("Acceleration"),
                       _("Compare the acceleration of the object (in pixels per second per second)."),
                       GD_T("The acceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", GD_T("Comparison sign"))
            .AddParameter("expression", GD_T("Value to test"))
            .MarkAsAdvanced()
            .SetFunctionName("GetAcceleration").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("Acceleration",
                       _("Acceleration"),
                       _("Change the acceleration of an object (in pixels per second per second)."),
                       GD_T("Do _PARAM2__PARAM3_ to the acceleration of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))
            .MarkAsAdvanced()
            .SetFunctionName("SetAcceleration").SetManipulatedType("number").SetGetter("GetAcceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("Deceleration",
                       _("Deceleration"),
                       _("Compare the deceleration of the object (in pixels per second per second)."),
                       GD_T("The deceleration of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", GD_T("Comparison sign"))
            .AddParameter("expression", GD_T("Value to test"))
            .MarkAsAdvanced()
            .SetFunctionName("GetDeceleration").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("Deceleration",
                       _("Deceleration"),
                       _("Change the deceleration of an object (in pixels per second per second)."),
                       GD_T("Do _PARAM2__PARAM3_ to the deceleration of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))
            .MarkAsAdvanced()
            .SetFunctionName("SetDeceleration").SetManipulatedType("number").SetGetter("GetDeceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("MaxSpeed",
                       _("Maximum speed"),
                       _("Compare the maximum speed of the object (in pixels per second)."),
                       GD_T("The maximum speed of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", GD_T("Comparison sign"))
            .AddParameter("expression", GD_T("Value to test"))
            .SetFunctionName("GetMaxSpeed").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("MaxSpeed",
                       _("Maximum speed"),
                       _("Change the maximum speed of an object (in pixels per second)."),
                       GD_T("Do _PARAM2__PARAM3_ to the maximum speed of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))
            .MarkAsAdvanced()
            .SetFunctionName("SetMaxSpeed").SetManipulatedType("number").SetGetter("GetMaxSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddCondition("JumpSpeed",
                       _("Jump speed"),
                       _("Compare the jump speed of the object (in pixels per second)."),
                       GD_T("The jump speed of _PARAM0_ is _PARAM2__PARAM3_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("relationalOperator", GD_T("Comparison sign"))
            .AddParameter("expression", GD_T("Value to test"))
            .MarkAsAdvanced()
            .SetFunctionName("GetJumpSpeed").SetManipulatedType("number").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("JumpSpeed",
                       _("Jump speed"),
                       _("Change the jump speed of an object (in pixels per second)."),
                       GD_T("Do _PARAM2__PARAM3_ to the jump speed of _PARAM0_"),
                       _("Options"),
                       "CppPlatform/Extensions/platformerobjecticon24.png",
                       "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("operator", GD_T("Modification's sign"))
            .AddParameter("expression", GD_T("Value"))
            .SetFunctionName("SetJumpSpeed").SetManipulatedType("number").SetGetter("GetJumpSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SetCanJump",
                       _("Allow again jumping"),
                       _("Allow the object to jump again, even if it is in the air: this can be useful to allow double jump for example."),
                       GD_T("Allow _PARAM0_ to jump again"),
                       _("Options"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsSimple()
            .SetFunctionName("SetCanJump").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateLeftKey",
                       _("Simulate left key press"),
                       _("Simulate a pressing on left key."),
                       GD_T("Simulate pressing Left for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsAdvanced()
            .SetFunctionName("SimulateLeftKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateRightKey",
                       _("Simulate right key press"),
                       _("Simulate a pressing on right key."),
                       GD_T("Simulate pressing Right for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsAdvanced()
            .SetFunctionName("SimulateRightKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateUpKey",
                       _("Simulate up key press"),
                       _("Simulate a pressing on up key ( Used when on a ladder )."),
                       GD_T("Simulate pressing Up for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsAdvanced()
            .SetFunctionName("SimulateUpKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateDownKey",
                       _("Simulate down key press"),
                       _("Simulate a pressing on down key ( Used when on a ladder )."),
                       GD_T("Simulate pressing Down for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsAdvanced()
            .SetFunctionName("SimulateDownKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateLadderKey",
                       _("Simulate ladder key press"),
                       _("Simulate a pressing on ladder key ( Used to grab a ladder )."),
                       GD_T("Simulate pressing Ladder key for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .MarkAsAdvanced()
            .SetFunctionName("SimulateLadderKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateJumpKey",
                       _("Simulate jump key press"),
                       _("Simulate a pressing on jump key."),
                       GD_T("Simulate pressing Jump key for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("SimulateJumpKey").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("SimulateControl",
                       _("Simulate control"),
                       _("Simulate a pressing on a key.\nValid keys are Left, Right, Jump, Ladder, Up, Down."),
                       GD_T("Simulate pressing _PARAM2_ key for _PARAM0_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("string", GD_T("Key"))
            .MarkAsAdvanced()
            .SetFunctionName("SimulateControl").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddAction("IgnoreDefaultControls",
                       _("Ignore default controls"),
                       _("De/activate the use of default controls.\nIf deactivated, use the simulate actions to move the object."),
                       GD_T("Ignore default controls for _PARAM0_: _PARAM2_"),
                       _("Controls"),
                       "res/conditions/keyboard24.png",
                       "res/conditions/keyboard.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .AddParameter("yesorno", GD_T("Ignore controls"))
            .MarkAsAdvanced()
            .SetFunctionName("IgnoreDefaultControls").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("Gravity", GD_T("Gravity"), GD_T("Get the gravity applied on the object"), GD_T("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("GetGravity").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("MaxFallingSpeed", GD_T("Maximum falling speed"), GD_T("Get the maximum falling speed"), GD_T("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("GetMaxFallingSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("Acceleration", GD_T("Acceleration"), GD_T("Acceleration"), GD_T("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("GetAcceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("Deceleration", GD_T("Deceleration"), GD_T("Deceleration"), GD_T("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("GetDeceleration").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("MaxSpeed", GD_T("Maximum speed"), GD_T("Maximum speed"), GD_T("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("GetMaxSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");

        aut.AddExpression("JumpSpeed", GD_T("Jump speed"), GD_T("Jump speed"), GD_T("Options"), "CppPlatform/Extensions/platformerobjecticon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformerObjectAutomatism")
            .SetFunctionName("GetJumpSpeed").SetIncludeFile("PlatformAutomatism/PlatformerObjectAutomatism.h");
        #endif
    }
    {
        gd::AutomatismMetadata & aut = extension.AddAutomatism("PlatformAutomatism",
              GD_T("Platform"),
              "Platform",
              GD_T("Platform on which Platformer characters can run."),
              "",
              "CppPlatform/Extensions/platformicon.png",
              "PlatformAutomatism",
              std::shared_ptr<gd::Automatism>(new PlatformAutomatism),
              std::shared_ptr<gd::AutomatismsSharedData>(new gd::AutomatismsSharedData));

        #if defined(GD_IDE_ONLY)
        aut.SetIncludeFile("PlatformAutomatism/PlatformAutomatism.h");

        aut.AddAction("ChangePlatformType",
                       _("Change platform type"),
                       _("Change the platform type of the object: Platform, Jumpthru or Ladder."),
                       GD_T("Set platform type of _PARAM0_ to _PARAM2_"),
                       _("Platforms"),
                       "CppPlatform/Extensions/platformicon24.png",
                       "CppPlatform/Extensions/platformicon16.png")
            .AddParameter("object", GD_T("Object"))
            .AddParameter("automatism", GD_T("Automatism"), "PlatformAutomatism")
            .AddParameter("string", GD_T("Platform type (\"Platform\", \"Jumpthru\" or \"Ladder\")"))
            .MarkAsAdvanced()
            .SetFunctionName("ChangePlatformType").SetIncludeFile("PlatformAutomatism/PlatformAutomatism.h");
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
     * Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
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
