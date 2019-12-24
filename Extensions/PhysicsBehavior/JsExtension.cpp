/**

GDevelop - Physics Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#if defined(GD_IDE_ONLY)
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/Tools/Localization.h"

void DeclarePhysicsBehaviorExtension(gd::PlatformExtension& extension);

/**
 * \brief This class declares information about the JS extension.
 */
class PhysicsBehaviorJsExtension : public gd::PlatformExtension {
 public:
  /**
   * \brief Constructor of an extension declares everything the extension
   * contains: objects, actions, conditions and expressions.
   */
  PhysicsBehaviorJsExtension() {
    DeclarePhysicsBehaviorExtension(*this);

    GetBehaviorMetadata("PhysicsBehavior::PhysicsBehavior")
        .SetIncludeFile("Extensions/PhysicsBehavior/box2djs/box2d.js")
        .AddIncludeFile("Extensions/PhysicsBehavior/physicsruntimebehavior.js");

    std::map<gd::String, gd::InstructionMetadata>& autActions =
        GetAllActionsForBehavior("PhysicsBehavior::PhysicsBehavior");
    std::map<gd::String, gd::InstructionMetadata>& autConditions =
        GetAllConditionsForBehavior("PhysicsBehavior::PhysicsBehavior");
    std::map<gd::String, gd::ExpressionMetadata>& autExpressions =
        GetAllExpressionsForBehavior("PhysicsBehavior::PhysicsBehavior");

    autActions["PhysicsBehavior::SetStatic"].SetFunctionName("setStatic");
    autActions["PhysicsBehavior::SetDynamic"].SetFunctionName("setDynamic");
    autConditions["PhysicsBehavior::SetDynamic"].SetFunctionName("isDynamic");
    autActions["PhysicsBehavior::SetFixedRotation"].SetFunctionName(
        "setFixedRotation");
    autActions["PhysicsBehavior::SetFreeRotation"].SetFunctionName(
        "setFreeRotation");
    autActions["PhysicsBehavior::AddRevoluteJoint"].SetFunctionName(
        "addRevoluteJoint");
    autActions["PhysicsBehavior::AddRevoluteJointBetweenObjects"]
        .SetFunctionName("addRevoluteJointBetweenObjects");
    autActions["PhysicsBehavior::ActAddGearJointBetweenObjects"]
        .SetFunctionName("addGearJointBetweenObjects");
    autConditions["PhysicsBehavior::IsFixedRotation"].SetFunctionName(
        "isFixedRotation");
    autActions["PhysicsBehavior::SetAsBullet"].SetFunctionName("setAsBullet");
    autActions["PhysicsBehavior::DontSetAsBullet"].SetFunctionName(
        "dontSetAsBullet");
    autConditions["PhysicsBehavior::IsBullet"].SetFunctionName("isBullet");
    autActions["PhysicsBehavior::ApplyImpulse"].SetFunctionName("applyImpulse");
    autActions["PhysicsBehavior::ApplyImpulseUsingPolarCoordinates"]
        .SetFunctionName("applyImpulseUsingPolarCoordinates");
    autActions["PhysicsBehavior::ApplyImpulseTowardPosition"].SetFunctionName(
        "applyImpulseTowardPosition");
    autActions["PhysicsBehavior::ApplyForce"].SetFunctionName("applyForce");
    autActions["PhysicsBehavior::ApplyForceUsingPolarCoordinates"]
        .SetFunctionName("applyForceUsingPolarCoordinates");
    autActions["PhysicsBehavior::ApplyForceTowardPosition"].SetFunctionName(
        "applyForceTowardPosition");
    autActions["PhysicsBehavior::ApplyTorque"].SetFunctionName("applyTorque");
    autActions["PhysicsBehavior::SetLinearVelocity"].SetFunctionName(
        "setLinearVelocity");
    autConditions["PhysicsBehavior::LinearVelocityX"].SetFunctionName(
        "getLinearVelocityX");
    autConditions["PhysicsBehavior::LinearVelocityY"].SetFunctionName(
        "getLinearVelocityY");
    autConditions["PhysicsBehavior::LinearVelocity"].SetFunctionName(
        "getLinearVelocity");
    autActions["PhysicsBehavior::SetAngularVelocity"].SetFunctionName(
        "setAngularVelocity");
    autConditions["PhysicsBehavior::AngularVelocity"].SetFunctionName(
        "getAngularVelocity");
    autConditions["PhysicsBehavior::CollisionWith"].SetFunctionName(
        "collisionWith");
    autConditions["PhysicsBehavior::LinearDamping"].SetFunctionName(
        "getLinearDamping");
    autActions["PhysicsBehavior::SetLinearDamping"].SetFunctionName(
        "setLinearDamping");
    autConditions["PhysicsBehavior::AngularDamping"].SetFunctionName(
        "getAngularDamping");
    autActions["PhysicsBehavior::SetAngularDamping"].SetFunctionName(
        "setAngularDamping");
    autActions["PhysicsBehavior::SetGravity"].SetFunctionName("setGravity");
    autExpressions["LinearVelocity"].SetFunctionName("getLinearVelocity");
    autExpressions["LinearVelocityX"].SetFunctionName("getLinearVelocityX");
    autExpressions["LinearVelocityY"].SetFunctionName("getLinearVelocityY");
    autExpressions["AngularVelocity"].SetFunctionName("getAngularVelocity");
    autExpressions["LinearDamping"].SetFunctionName("getLinearDamping");
    autExpressions["AngularDamping"].SetFunctionName("getAngularDamping");

    StripUnimplementedInstructionsAndExpressions();
    GD_COMPLETE_EXTENSION_COMPILATION_INFORMATION();
  };
};

#if defined(EMSCRIPTEN)
extern "C" gd::PlatformExtension* CreateGDJSPhysicsBehaviorExtension() {
  return new PhysicsBehaviorJsExtension;
}
#else
/**
 * Used by GDevelop to create the extension class
 * -- Do not need to be modified. --
 */
extern "C" gd::PlatformExtension* GD_EXTENSION_API CreateGDJSExtension() {
  return new PhysicsBehaviorJsExtension;
}
#endif
#endif
