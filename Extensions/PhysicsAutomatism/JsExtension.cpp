/**

GDevelop - Physics Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/PlatformDefinition/PlatformExtension.h"
#include "GDCore/Tools/Version.h"

#include <iostream>
#include "GDCore/Tools/Localization.h"

/**
 * \brief This class declares information about the JS extension.
 */
class JsExtension : public gd::PlatformExtension
{
public:

    /**
     * \brief Constructor of an extension declares everything the extension contains: objects, actions, conditions and expressions.
     */
    JsExtension()
    {
        SetExtensionInformation("PhysicsAutomatism",
                              _("Physics automatism"),
                              _("Automatism allowing to move objects as if they were subject to the laws of physics."),
                              "Florian Rival",
                              "Open source (MIT License)");
        CloneExtension("GDevelop C++ platform", "PhysicsAutomatism");

        GetAutomatismMetadata("PhysicsAutomatism::PhysicsAutomatism")
            .SetIncludeFile("PhysicsAutomatism/box2djs/box2d.js")
            .AddIncludeFile("PhysicsAutomatism/physicsruntimeautomatism.js");

        std::map<std::string, gd::InstructionMetadata > & autActions = GetAllActionsForAutomatism("PhysicsAutomatism::PhysicsAutomatism");
        std::map<std::string, gd::InstructionMetadata > & autConditions = GetAllConditionsForAutomatism("PhysicsAutomatism::PhysicsAutomatism");
        std::map<std::string, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForAutomatism("PhysicsAutomatism::PhysicsAutomatism");

        autActions["PhysicsAutomatism::SetStatic"].SetFunctionName("setStatic");
        autActions["PhysicsAutomatism::SetDynamic"].SetFunctionName("setDynamic");
        autConditions["PhysicsAutomatism::SetDynamic"].SetFunctionName("isDynamic");
        autActions["PhysicsAutomatism::SetFixedRotation"].SetFunctionName("setFixedRotation");
        autActions["PhysicsAutomatism::SetFreeRotation"].SetFunctionName("setFreeRotation");
        autActions["PhysicsAutomatism::AddRevoluteJoint"].SetFunctionName("addRevoluteJoint");
        autActions["PhysicsAutomatism::AddRevoluteJointBetweenObjects"].SetFunctionName("addRevoluteJointBetweenObjects");
        autActions["PhysicsAutomatism::ActAddGearJointBetweenObjects"].SetFunctionName("addGearJointBetweenObjects");
        autConditions["PhysicsAutomatism::IsFixedRotation"].SetFunctionName("isFixedRotation");
        autActions["PhysicsAutomatism::SetAsBullet"].SetFunctionName("setAsBullet");
        autActions["PhysicsAutomatism::DontSetAsBullet"].SetFunctionName("dontSetAsBullet");
        autConditions["PhysicsAutomatism::IsBullet"].SetFunctionName("isBullet");
        autActions["PhysicsAutomatism::ApplyImpulse"].SetFunctionName("applyImpulse");
        autActions["PhysicsAutomatism::ApplyImpulseUsingPolarCoordinates"].SetFunctionName("applyImpulseUsingPolarCoordinates");
        autActions["PhysicsAutomatism::ApplyImpulseTowardPosition"].SetFunctionName("applyImpulseTowardPosition");
        autActions["PhysicsAutomatism::ApplyForce"].SetFunctionName("applyForce");
        autActions["PhysicsAutomatism::ApplyForceUsingPolarCoordinates"].SetFunctionName("applyForceUsingPolarCoordinates");
        autActions["PhysicsAutomatism::ApplyForceTowardPosition"].SetFunctionName("applyForceTowardPosition");
        autActions["PhysicsAutomatism::ApplyTorque"].SetFunctionName("applyTorque");
        autActions["PhysicsAutomatism::SetLinearVelocity"].SetFunctionName("setLinearVelocity");
        autConditions["PhysicsAutomatism::LinearVelocityX"].SetFunctionName("getLinearVelocityX");
        autConditions["PhysicsAutomatism::LinearVelocityY"].SetFunctionName("getLinearVelocityY");
        autConditions["PhysicsAutomatism::LinearVelocity"].SetFunctionName("getLinearVelocity");
        autActions["PhysicsAutomatism::SetAngularVelocity"].SetFunctionName("setAngularVelocity");
        autConditions["PhysicsAutomatism::AngularVelocity"].SetFunctionName("getAngularVelocity");
        autConditions["PhysicsAutomatism::CollisionWith"].SetFunctionName("collisionWith");
        autConditions["PhysicsAutomatism::LinearDamping"].SetFunctionName("getLinearDamping");
        autActions["PhysicsAutomatism::SetLinearDamping"].SetFunctionName("setLinearDamping");
        autConditions["PhysicsAutomatism::AngularDamping"].SetFunctionName("getAngularDamping");
        autActions["PhysicsAutomatism::SetAngularDamping"].SetFunctionName("setAngularDamping");
        autActions["PhysicsAutomatism::SetGravity"].SetFunctionName("setGravity");
        autExpressions["LinearVelocity"].SetFunctionName("getLinearVelocity");
        autExpressions["LinearVelocityX"].SetFunctionName("getLinearVelocityX");
        autExpressions["LinearVelocityY"].SetFunctionName("getLinearVelocityY");
        autExpressions["AngularVelocity"].SetFunctionName("getAngularVelocity");
        autExpressions["LinearDamping"].SetFunctionName("getLinearDamping");
        autExpressions["AngularDamping"].SetFunctionName("getAngularDamping");

        /*
            aut.AddAction("SetPolygonScaleX",
                           _("Change collision polygon X scale"),
                           _("Change the X scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           _("Change collision polygon of _PARAM0_ X scale to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddAction("SetPolygonScaleY",
                           _("Change collision polygon Y scale"),
                           _("Change the Y scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           _("Change collision polygon of _PARAM0_ Y scale to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleX",
                           _("Collision polygon X scale"),
                           _("Test the value of the collision polygon X scale."),
                           _("Collision polygon of _PARAM0_ X scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddCondition("GetPolygonScaleY",
                           _("Collision polygon Y scale"),
                           _("Test the value of the collision polygon Y scale."),
                           _("Collision polygon of _PARAM0_ Y scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetManipulatedType("number").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleX", _("Collision polygon X scale"), _("Collision polygon X scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");

            aut.AddExpression("PolygonScaleY", _("Collision polygon Y scale"), _("Collision polygon Y scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("automatism", _("Automatism"), "PhysicsAutomatism")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetIncludeFile("PhysicsAutomatism/PhysicsAutomatism.h");
*/

        StripUnimplementedInstructionsAndExpressions();
    };
};

/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension * GD_EXTENSION_API CreateGDJSExtension() {
    return new JsExtension;
}
#endif
