/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"


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
        SetExtensionInformation("PhysicsBehavior",
                              _("Physics behavior"),
                              _("Behavior allowing to move objects as if they were subject to the laws of physics."),
                              "Florian Rival",
                              "Open source (MIT License)");
        CloneExtension("GDevelop C++ platform", "PhysicsBehavior");

        GetBehaviorMetadata("PhysicsBehavior::PhysicsBehavior")
            .SetIncludeFile("Extensions/PhysicsBehavior/box2djs/box2d.js")
            .AddIncludeFile("Extensions/PhysicsBehavior/physicsruntimebehavior.js");

        std::map<gd::String, gd::InstructionMetadata > & autActions = GetAllActionsForBehavior("PhysicsBehavior::PhysicsBehavior");
        std::map<gd::String, gd::InstructionMetadata > & autConditions = GetAllConditionsForBehavior("PhysicsBehavior::PhysicsBehavior");
        std::map<gd::String, gd::ExpressionMetadata > & autExpressions = GetAllExpressionsForBehavior("PhysicsBehavior::PhysicsBehavior");

        autActions["PhysicsBehavior::SetStatic"].SetFunctionName("setStatic");
        autActions["PhysicsBehavior::SetDynamic"].SetFunctionName("setDynamic");
        autConditions["PhysicsBehavior::SetDynamic"].SetFunctionName("isDynamic");
        autActions["PhysicsBehavior::SetFixedRotation"].SetFunctionName("setFixedRotation");
        autActions["PhysicsBehavior::SetFreeRotation"].SetFunctionName("setFreeRotation");
        autActions["PhysicsBehavior::AddRevoluteJoint"].SetFunctionName("addRevoluteJoint");
        autActions["PhysicsBehavior::AddRevoluteJointBetweenObjects"].SetFunctionName("addRevoluteJointBetweenObjects");
        autActions["PhysicsBehavior::ActAddGearJointBetweenObjects"].SetFunctionName("addGearJointBetweenObjects");
        autConditions["PhysicsBehavior::IsFixedRotation"].SetFunctionName("isFixedRotation");
        autActions["PhysicsBehavior::SetAsBullet"].SetFunctionName("setAsBullet");
        autActions["PhysicsBehavior::DontSetAsBullet"].SetFunctionName("dontSetAsBullet");
        autConditions["PhysicsBehavior::IsBullet"].SetFunctionName("isBullet");
        autActions["PhysicsBehavior::ApplyImpulse"].SetFunctionName("applyImpulse");
        autActions["PhysicsBehavior::ApplyImpulseUsingPolarCoordinates"].SetFunctionName("applyImpulseUsingPolarCoordinates");
        autActions["PhysicsBehavior::ApplyImpulseTowardPosition"].SetFunctionName("applyImpulseTowardPosition");
        autActions["PhysicsBehavior::ApplyForce"].SetFunctionName("applyForce");
        autActions["PhysicsBehavior::ApplyForceUsingPolarCoordinates"].SetFunctionName("applyForceUsingPolarCoordinates");
        autActions["PhysicsBehavior::ApplyForceTowardPosition"].SetFunctionName("applyForceTowardPosition");
        autActions["PhysicsBehavior::ApplyTorque"].SetFunctionName("applyTorque");
        autActions["PhysicsBehavior::SetLinearVelocity"].SetFunctionName("setLinearVelocity");
        autConditions["PhysicsBehavior::LinearVelocityX"].SetFunctionName("getLinearVelocityX");
        autConditions["PhysicsBehavior::LinearVelocityY"].SetFunctionName("getLinearVelocityY");
        autConditions["PhysicsBehavior::LinearVelocity"].SetFunctionName("getLinearVelocity");
        autActions["PhysicsBehavior::SetAngularVelocity"].SetFunctionName("setAngularVelocity");
        autConditions["PhysicsBehavior::AngularVelocity"].SetFunctionName("getAngularVelocity");
        autConditions["PhysicsBehavior::CollisionWith"].SetFunctionName("collisionWith");
        autConditions["PhysicsBehavior::LinearDamping"].SetFunctionName("getLinearDamping");
        autActions["PhysicsBehavior::SetLinearDamping"].SetFunctionName("setLinearDamping");
        autConditions["PhysicsBehavior::AngularDamping"].SetFunctionName("getAngularDamping");
        autActions["PhysicsBehavior::SetAngularDamping"].SetFunctionName("setAngularDamping");
        autActions["PhysicsBehavior::SetGravity"].SetFunctionName("setGravity");
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
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleX").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddAction("SetPolygonScaleY",
                           _("Change collision polygon Y scale"),
                           _("Change the Y scale of the polygon. Use a value greater than 1 to enlarge the polygon, less than 1 to reduce it."),
                           _("Change collision polygon of _PARAM0_ Y scale to _PARAM2_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("expression", _("Scale"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("SetPolygonScaleY").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("GetPolygonScaleX",
                           _("Collision polygon X scale"),
                           _("Test the value of the collision polygon X scale."),
                           _("Collision polygon of _PARAM0_ X scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddCondition("GetPolygonScaleY",
                           _("Collision polygon Y scale"),
                           _("Test the value of the collision polygon Y scale."),
                           _("Collision polygon of _PARAM0_ Y scale is _PARAM2__PARAM3_"),
                           _("Collision polygon"),
                           "res/physics24.png",
                           "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddParameter("relationalOperator", _("Comparison sign"))
                .AddParameter("expression", _("Value to test"))
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetManipulatedType("number").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("PolygonScaleX", _("Collision polygon X scale"), _("Collision polygon X scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleX").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");

            aut.AddExpression("PolygonScaleY", _("Collision polygon Y scale"), _("Collision polygon Y scale"), _("Collision polygon"), "res/physics16.png")
                .AddParameter("object", _("Object"))
                .AddParameter("behavior", _("Behavior"), "PhysicsBehavior")
                .AddCodeOnlyParameter("currentScene", "")
                .SetFunctionName("GetPolygonScaleY").SetIncludeFile("PhysicsBehavior/PhysicsBehavior.h");
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
