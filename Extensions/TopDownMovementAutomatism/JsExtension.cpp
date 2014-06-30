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
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"
#include <boost/version.hpp>
#include <iostream>

void DeclareTopDownMovementAutomatismExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TopDownMovementAutomatismJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains : Objects, actions, conditions and expressions.
     */
    TopDownMovementAutomatismJsExtension()
    {
        DeclareTopDownMovementAutomatismExtension(*this);

        GetAutomatismMetadata("TopDownMovementAutomatism::TopDownMovementAutomatism")
            .SetIncludeFile("TopDownMovementAutomatism/topdownmovementruntimeautomatism.js");

        std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("TopDownMovementAutomatism::TopDownMovementAutomatism");
        std::map<std::string, gd::InstructionMetadata > & autConditions = GetAllConditionsForAutomatism("TopDownMovementAutomatism::TopDownMovementAutomatism");
        std::map<std::string, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForAutomatism("TopDownMovementAutomatism::TopDownMovementAutomatism");

        autConditions["TopDownMovementAutomatism::IsMoving"].codeExtraInformation.SetFunctionName("isMoving");

        autActions["TopDownMovementAutomatism::Acceleration"].codeExtraInformation.SetFunctionName("setAcceleration").SetAssociatedGetter("getAcceleration");
        autConditions["TopDownMovementAutomatism::Acceleration"].codeExtraInformation.SetFunctionName("getAcceleration");
        autActions["TopDownMovementAutomatism::Deceleration"].codeExtraInformation.SetFunctionName("setDeceleration").SetAssociatedGetter("getDeceleration");
        autConditions["TopDownMovementAutomatism::Deceleration"].codeExtraInformation.SetFunctionName("getDeceleration");
        autActions["TopDownMovementAutomatism::MaxSpeed"].codeExtraInformation.SetFunctionName("setMaxSpeed").SetAssociatedGetter("getMaxSpeed");
        autConditions["TopDownMovementAutomatism::MaxSpeed"].codeExtraInformation.SetFunctionName("getMaxSpeed");
        autConditions["TopDownMovementAutomatism::Speed"].codeExtraInformation.SetFunctionName("getSpeed");
        autActions["TopDownMovementAutomatism::AngularMaxSpeed"].codeExtraInformation.SetFunctionName("setAngularMaxSpeed").SetAssociatedGetter("getAngularMaxSpeed");
        autConditions["TopDownMovementAutomatism::AngularMaxSpeed"].codeExtraInformation.SetFunctionName("getAngularMaxSpeed");
        autActions["TopDownMovementAutomatism::AngleOffset"].codeExtraInformation.SetFunctionName("setAngleOffset").SetAssociatedGetter("getAngleOffset");
        autConditions["TopDownMovementAutomatism::AngleOffset"].codeExtraInformation.SetFunctionName("getAngleOffset");

        autActions["TopDownMovementAutomatism::AllowDiagonals"].codeExtraInformation.SetFunctionName("allowDiagonals");
        autConditions["TopDownMovementAutomatism::DiagonalsAllowed"].codeExtraInformation.SetFunctionName("diagonalsAllowed");
        autActions["TopDownMovementAutomatism::RotateObject"].codeExtraInformation.SetFunctionName("setRotateObject");
        autConditions["TopDownMovementAutomatism::ObjectRotated"].codeExtraInformation.SetFunctionName("isObjectRotated");

        autActions["TopDownMovementAutomatism::SimulateLeftKey"].codeExtraInformation.SetFunctionName("simulateLeftKey");
        autActions["TopDownMovementAutomatism::SimulateRightKey"].codeExtraInformation.SetFunctionName("simulateRightKey");
        autActions["TopDownMovementAutomatism::SimulateUpKey"].codeExtraInformation.SetFunctionName("simulateUpKey");
        autActions["TopDownMovementAutomatism::SimulateDownKey"].codeExtraInformation.SetFunctionName("simulateDownKey");
        autActions["TopDownMovementAutomatism::SimulateControl"].codeExtraInformation.SetFunctionName("simulateControl");
        autActions["TopDownMovementAutomatism::IgnoreDefaultControls"].codeExtraInformation.SetFunctionName("ignoreDefaultControls");

        autExpressions["Acceleration"].codeExtraInformation.SetFunctionName("getAcceleration");
        autExpressions["Deceleration"].codeExtraInformation.SetFunctionName("getDeceleration");
        autExpressions["MaxSpeed"].codeExtraInformation.SetFunctionName("getMaxSpeed");
        autExpressions["Speed"].codeExtraInformation.SetFunctionName("getSpeed");
        autExpressions["AngularMaxSpeed"].codeExtraInformation.SetFunctionName("getAngularMaxSpeed");
        autExpressions["AngleOffset"].codeExtraInformation.SetFunctionName("getAngleOffset");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
    virtual ~TopDownMovementAutomatismJsExtension() {};
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSTopDownMovementAutomatismExtension() {
    return new TopDownMovementAutomatismJsExtension;
}
#else
/**
 * Used by Game Develop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new TopDownMovementAutomatismJsExtension;
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