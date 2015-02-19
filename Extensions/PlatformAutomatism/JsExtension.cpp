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
                              _("Platform Automatism"),
                              _("Allows to use controllable objects which can run and jump on platforms."),
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

            autConditions["PlatformAutomatism::IsMoving"].codeExtraInformation.SetFunctionName("isMoving");
            autConditions["PlatformAutomatism::IsOnFloor"].codeExtraInformation.SetFunctionName("isOnFloor");
            autConditions["PlatformAutomatism::IsOnLadder"].codeExtraInformation.SetFunctionName("isOnLadder");
            autConditions["PlatformAutomatism::IsJumping"].codeExtraInformation.SetFunctionName("isJumping");
            autConditions["PlatformAutomatism::IsFalling"].codeExtraInformation.SetFunctionName("isFalling");

            autConditions["PlatformAutomatism::Gravity"].codeExtraInformation.SetFunctionName("getGravity");
            autActions["PlatformAutomatism::Gravity"].codeExtraInformation.SetFunctionName("setGravity").SetAssociatedGetter("getGravity");
            autExpressions["Gravity"].codeExtraInformation.SetFunctionName("getGravity");
            autConditions["PlatformAutomatism::MaxFallingSpeed"].codeExtraInformation.SetFunctionName("getMaxFallingSpeed");
            autActions["PlatformAutomatism::MaxFallingSpeed"].codeExtraInformation.SetFunctionName("setMaxFallingSpeed").SetAssociatedGetter("getMaxFallingSpeed");
            autExpressions["MaxFallingSpeed"].codeExtraInformation.SetFunctionName("getMaxFallingSpeed");
            autConditions["PlatformAutomatism::Acceleration"].codeExtraInformation.SetFunctionName("getAcceleration");
            autActions["PlatformAutomatism::Acceleration"].codeExtraInformation.SetFunctionName("setAcceleration").SetAssociatedGetter("getAcceleration");
            autExpressions["Acceleration"].codeExtraInformation.SetFunctionName("getAcceleration");
            autConditions["PlatformAutomatism::Deceleration"].codeExtraInformation.SetFunctionName("getDeceleration");
            autActions["PlatformAutomatism::Deceleration"].codeExtraInformation.SetFunctionName("setDeceleration").SetAssociatedGetter("getDeceleration");
            autExpressions["Deceleration"].codeExtraInformation.SetFunctionName("getDeceleration");
            autConditions["PlatformAutomatism::MaxSpeed"].codeExtraInformation.SetFunctionName("getMaxSpeed");
            autActions["PlatformAutomatism::MaxSpeed"].codeExtraInformation.SetFunctionName("setMaxSpeed").SetAssociatedGetter("getMaxSpeed");
            autExpressions["MaxSpeed"].codeExtraInformation.SetFunctionName("getMaxSpeed");
            autConditions["PlatformAutomatism::JumpSpeed"].codeExtraInformation.SetFunctionName("getJumpSpeed");
            autActions["PlatformAutomatism::JumpSpeed"].codeExtraInformation.SetFunctionName("setJumpSpeed").SetAssociatedGetter("getJumpSpeed");
            autExpressions["JumpSpeed"].codeExtraInformation.SetFunctionName("getJumpSpeed");

            autActions["PlatformAutomatism::SetCanJump"].codeExtraInformation.SetFunctionName("setCanJump");
            autActions["PlatformAutomatism::SimulateLeftKey"].codeExtraInformation.SetFunctionName("simulateLeftKey");
            autActions["PlatformAutomatism::SimulateRightKey"].codeExtraInformation.SetFunctionName("simulateRightKey");
            autActions["PlatformAutomatism::SimulateUpKey"].codeExtraInformation.SetFunctionName("simulateUpKey");
            autActions["PlatformAutomatism::SimulateDownKey"].codeExtraInformation.SetFunctionName("simulateDownKey");
            autActions["PlatformAutomatism::SimulateLadderKey"].codeExtraInformation.SetFunctionName("simulateLadderKey");
            autActions["PlatformAutomatism::SimulateJumpKey"].codeExtraInformation.SetFunctionName("simulateJumpKey");
            autActions["PlatformAutomatism::SimulateControl"].codeExtraInformation.SetFunctionName("simulateControl");
            autActions["PlatformAutomatism::IgnoreDefaultControls"].codeExtraInformation.SetFunctionName("ignoreDefaultControls");
        }
        {
            std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("PlatformAutomatism::PlatformAutomatism");

            autActions["PlatformAutomatism::ChangePlatformType"].codeExtraInformation.SetFunctionName("changePlatformType");
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
