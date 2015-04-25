/**

GDevelop - Top-down movement Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Version.h"

#include <iostream>

void DeclareTopDownMovementAutomatismExtension(gd::PlatformExtension & extension);

/**
 * \brief This class declares information about the JS extension.
 */
class TopDownMovementAutomatismJsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    TopDownMovementAutomatismJsExtension()
    {
        DeclareTopDownMovementAutomatismExtension(*this);

        GetAutomatismMetadata("TopDownMovementAutomatism::TopDownMovementAutomatism")
            .SetIncludeFile("TopDownMovementAutomatism/topdownmovementruntimeautomatism.js");

        std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("TopDownMovementAutomatism::TopDownMovementAutomatism");
        std::map<std::string, gd::InstructionMetadata > & autConditions = GetAllConditionsForAutomatism("TopDownMovementAutomatism::TopDownMovementAutomatism");
        std::map<std::string, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForAutomatism("TopDownMovementAutomatism::TopDownMovementAutomatism");

        autConditions["TopDownMovementAutomatism::IsMoving"].SetFunctionName("isMoving");

        autActions["TopDownMovementAutomatism::Acceleration"].SetFunctionName("setAcceleration").SetGetter("getAcceleration");
        autConditions["TopDownMovementAutomatism::Acceleration"].SetFunctionName("getAcceleration");
        autActions["TopDownMovementAutomatism::Deceleration"].SetFunctionName("setDeceleration").SetGetter("getDeceleration");
        autConditions["TopDownMovementAutomatism::Deceleration"].SetFunctionName("getDeceleration");
        autActions["TopDownMovementAutomatism::MaxSpeed"].SetFunctionName("setMaxSpeed").SetGetter("getMaxSpeed");
        autConditions["TopDownMovementAutomatism::MaxSpeed"].SetFunctionName("getMaxSpeed");
        autConditions["TopDownMovementAutomatism::Speed"].SetFunctionName("getSpeed");
        autActions["TopDownMovementAutomatism::AngularMaxSpeed"].SetFunctionName("setAngularMaxSpeed").SetGetter("getAngularMaxSpeed");
        autConditions["TopDownMovementAutomatism::AngularMaxSpeed"].SetFunctionName("getAngularMaxSpeed");
        autActions["TopDownMovementAutomatism::AngleOffset"].SetFunctionName("setAngleOffset").SetGetter("getAngleOffset");
        autConditions["TopDownMovementAutomatism::AngleOffset"].SetFunctionName("getAngleOffset");

        autActions["TopDownMovementAutomatism::AllowDiagonals"].SetFunctionName("allowDiagonals");
        autConditions["TopDownMovementAutomatism::DiagonalsAllowed"].SetFunctionName("diagonalsAllowed");
        autActions["TopDownMovementAutomatism::RotateObject"].SetFunctionName("setRotateObject");
        autConditions["TopDownMovementAutomatism::ObjectRotated"].SetFunctionName("isObjectRotated");

        autActions["TopDownMovementAutomatism::SimulateLeftKey"].SetFunctionName("simulateLeftKey");
        autActions["TopDownMovementAutomatism::SimulateRightKey"].SetFunctionName("simulateRightKey");
        autActions["TopDownMovementAutomatism::SimulateUpKey"].SetFunctionName("simulateUpKey");
        autActions["TopDownMovementAutomatism::SimulateDownKey"].SetFunctionName("simulateDownKey");
        autActions["TopDownMovementAutomatism::SimulateControl"].SetFunctionName("simulateControl");
        autActions["TopDownMovementAutomatism::IgnoreDefaultControls"].SetFunctionName("ignoreDefaultControls");

        autExpressions["Acceleration"].SetFunctionName("getAcceleration");
        autExpressions["Deceleration"].SetFunctionName("getDeceleration");
        autExpressions["MaxSpeed"].SetFunctionName("getMaxSpeed");
        autExpressions["Speed"].SetFunctionName("getSpeed");
        autExpressions["AngularMaxSpeed"].SetFunctionName("getAngularMaxSpeed");
        autExpressions["AngleOffset"].SetFunctionName("getAngleOffset");

        GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
    };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension * CreateGDJSTopDownMovementAutomatismExtension() {
    return new TopDownMovementAutomatismJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new TopDownMovementAutomatismJsExtension;
}
#endif
#endif
