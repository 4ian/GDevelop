/**

GDevelop - Platform Automatism Extension
Copyright (c) 2014-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/Localization.h"

#include <iostream>

void DeclarePlatformAutomatismExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PlatformAutomatismJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    PlatformAutomatismJsExtension()
    {
        SetExtensionInformation("PlatformAutomatism",
                              GD_T("Platform Automatism"),
                              GD_T("Allows to use controllable objects which can run and jump on platforms."),
                              "Florian Rival",
                              "Open source (MIT License)");
        DeclarePlatformAutomatismExtension(*this);

        GetAutomatismMetadata("PlatformAutomatism::PlatformAutomatism")
            .SetIncludeFile("PlatformAutomatism/platformruntimeautomatism.js")
            .AddIncludeFile("PlatformAutomatism/platformerobjectruntimeautomatism.js");

        GetAutomatismMetadata("PlatformAutomatism::PlatformerObjectAutomatism")
            .SetIncludeFile("PlatformAutomatism/platformruntimeautomatism.js")
            .AddIncludeFile("PlatformAutomatism/platformerobjectruntimeautomatism.js");

        {

            std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("PlatformAutomatism::PlatformerObjectAutomatism");
            std::map<std::string, gd::InstructionMetadata > & autConditions = GetAllConditionsForAutomatism("PlatformAutomatism::PlatformerObjectAutomatism");
            std::map<std::string, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForAutomatism("PlatformAutomatism::PlatformerObjectAutomatism");

            autConditions["PlatformAutomatism::IsMoving"].SetFunctionName("isMoving");
            autConditions["PlatformAutomatism::IsOnFloor"].SetFunctionName("isOnFloor");
            autConditions["PlatformAutomatism::IsOnLadder"].SetFunctionName("isOnLadder");
            autConditions["PlatformAutomatism::IsJumping"].SetFunctionName("isJumping");
            autConditions["PlatformAutomatism::IsFalling"].SetFunctionName("isFalling");

            autConditions["PlatformAutomatism::Gravity"].SetFunctionName("getGravity");
            autActions["PlatformAutomatism::Gravity"].SetFunctionName("setGravity").SetGetter("getGravity");
            autExpressions["Gravity"].SetFunctionName("getGravity");
            autConditions["PlatformAutomatism::MaxFallingSpeed"].SetFunctionName("getMaxFallingSpeed");
            autActions["PlatformAutomatism::MaxFallingSpeed"].SetFunctionName("setMaxFallingSpeed").SetGetter("getMaxFallingSpeed");
            autExpressions["MaxFallingSpeed"].SetFunctionName("getMaxFallingSpeed");
            autConditions["PlatformAutomatism::Acceleration"].SetFunctionName("getAcceleration");
            autActions["PlatformAutomatism::Acceleration"].SetFunctionName("setAcceleration").SetGetter("getAcceleration");
            autExpressions["Acceleration"].SetFunctionName("getAcceleration");
            autConditions["PlatformAutomatism::Deceleration"].SetFunctionName("getDeceleration");
            autActions["PlatformAutomatism::Deceleration"].SetFunctionName("setDeceleration").SetGetter("getDeceleration");
            autExpressions["Deceleration"].SetFunctionName("getDeceleration");
            autConditions["PlatformAutomatism::MaxSpeed"].SetFunctionName("getMaxSpeed");
            autActions["PlatformAutomatism::MaxSpeed"].SetFunctionName("setMaxSpeed").SetGetter("getMaxSpeed");
            autExpressions["MaxSpeed"].SetFunctionName("getMaxSpeed");
            autConditions["PlatformAutomatism::JumpSpeed"].SetFunctionName("getJumpSpeed");
            autActions["PlatformAutomatism::JumpSpeed"].SetFunctionName("setJumpSpeed").SetGetter("getJumpSpeed");
            autExpressions["JumpSpeed"].SetFunctionName("getJumpSpeed");

            autActions["PlatformAutomatism::SetCanJump"].SetFunctionName("setCanJump");
            autActions["PlatformAutomatism::SimulateLeftKey"].SetFunctionName("simulateLeftKey");
            autActions["PlatformAutomatism::SimulateRightKey"].SetFunctionName("simulateRightKey");
            autActions["PlatformAutomatism::SimulateUpKey"].SetFunctionName("simulateUpKey");
            autActions["PlatformAutomatism::SimulateDownKey"].SetFunctionName("simulateDownKey");
            autActions["PlatformAutomatism::SimulateLadderKey"].SetFunctionName("simulateLadderKey");
            autActions["PlatformAutomatism::SimulateJumpKey"].SetFunctionName("simulateJumpKey");
            autActions["PlatformAutomatism::SimulateControl"].SetFunctionName("simulateControl");
            autActions["PlatformAutomatism::IgnoreDefaultControls"].SetFunctionName("ignoreDefaultControls");
        }
        {
            std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("PlatformAutomatism::PlatformAutomatism");

            autActions["PlatformAutomatism::ChangePlatformType"].SetFunctionName("changePlatformType");
        }
        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

//We need a specific function to create the extension with emscripten.
#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSPlatformAutomatismExtension() {
    return new PlatformAutomatismJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new PlatformAutomatismJsExtension;
}
#endif

#endif
