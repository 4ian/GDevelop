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
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Version.h"
#include "GDCore/Tools/Localization.h"
#include <boost/version.hpp>
#include <iostream>

void DeclarePlatformAutomatismExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PlatformAutomatismJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    PlatformAutomatismJsExtension()
    {
        SetExtensionInformation("PlatformAutomatism",
                              _("Platform Automatism"),
                              _("Allows to use controllable objects which can run and jump on platforms."),
                              "Florian Rival",
                              "zlib/libpng License (Open Source)");
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
    virtual ~PlatformAutomatismJsExtension() {};
};

//We need a specific function to create the extension with emscripten.
#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSPlatformAutomatismExtension() {
    return new PlatformAutomatismJsExtension;
}
#else
/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new PlatformAutomatismJsExtension;
}

/**
 * Used by Game Develop to destroy the extension class
 * -- Do not need to be modified. --
 */
extern "C" void GD_EXTENSION_API DestroyGDJSExtension(gd::PlatformExtension * p) {
    delete p;
}
#endif

#endif
