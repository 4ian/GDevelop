/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "PhysicsAutomatism.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"
#include "Box2D/Box2D.h"

/**
 * Set a body to be static
 */
bool PhysicsAutomatism::ActSetStatic( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    dynamic = false;

    if ( !body ) CreateBody(scene);
    body->SetType(b2_staticBody);

    return true;
}

/**
 * Set a body to be dynamic
 */
bool PhysicsAutomatism::ActSetDynamic( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    dynamic = true;

    if ( !body ) CreateBody(scene);
    body->SetType(b2_dynamicBody);

    return true;
}

/**
 * Set rotation to be fixed
 */
bool PhysicsAutomatism::ActSetFixedRotation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    fixedRotation = true;

    if ( !body ) CreateBody(scene);
    body->SetFixedRotation(true);

    return true;
}

/**
 * Set rotation to be free
 */
bool PhysicsAutomatism::ActSetFreeRotation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    fixedRotation = false;

    if ( !body ) CreateBody(scene);
    body->SetFixedRotation(false);

    return true;
}

/**
 * Consider object as bullet, for better collision handling
 */
bool PhysicsAutomatism::ActSetAsBullet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    isBullet = true;

    if ( !body ) CreateBody(scene);
    body->SetBullet(true);

    return true;
}

/**
 * Don't consider object as bullet, for faster collision handling
 */
bool PhysicsAutomatism::ActDontSetAsBullet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    isBullet = false;

    if ( !body ) CreateBody(scene);
    body->SetBullet(false);

    return true;
}

/**
 * Apply a force
 */
bool PhysicsAutomatism::ActApplyForce( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);
    body->ApplyForce(b2Vec2(action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()),
                            -action.GetParameter(3).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())),
                     body->GetPosition());

    return true;
}

/**
 * Apply a force
 */
bool PhysicsAutomatism::ActApplyForceUsingPolarCoordinates( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float angle = -action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())/180.0f*3.14159f;
    float length = action.GetParameter(3).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject());

    if ( !body ) CreateBody(scene);
    body->ApplyForce(b2Vec2(cos(angle)*length,-sin(angle)*length), body->GetPosition());

    return true;
}

/**
 * Apply a force
 */
bool PhysicsAutomatism::ActApplyForceTowardPosition( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);

    float length = action.GetParameter(4).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject());
    float angle = atan2(action.GetParameter(3).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())*runtimeScenesPhysicsDatas->GetInvScaleY()+body->GetPosition().y,
                        action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())*runtimeScenesPhysicsDatas->GetInvScaleX()-body->GetPosition().x);

    body->ApplyForce(b2Vec2(cos(angle)*length,
                            -sin(angle)*length),
                     body->GetPosition());

    return true;
}

/**
 * Apply a torque
 */
bool PhysicsAutomatism::ActApplyTorque( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);
    body->ApplyTorque(action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()));

    return true;
}

/**
 * Change linear velocity
 */
bool PhysicsAutomatism::ActLinearVelocity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);
    body->SetLinearVelocity(b2Vec2(action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()),
                                   -action.GetParameter(3).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())));

    return true;
}

/**
 * Change angular velocity
 */
bool PhysicsAutomatism::ActAngularVelocity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);
    body->SetAngularVelocity(action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()));

    return true;
}

/**
 * Change linear damping
 */
bool PhysicsAutomatism::ActLinearDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);
    body->SetLinearDamping(action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()));

    return true;
}

/**
 * Change angular damping
 */
bool PhysicsAutomatism::ActAngularDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);
    body->SetAngularDamping(action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject()));

    return true;
}

/**
 * Add an hinge between two objects
 */
bool PhysicsAutomatism::ActAddRevoluteJointBetweenObjects( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);

    ObjList other = objectsConcerned.Pick(action.GetParameter(2).GetAsObjectIdentifier(), action.IsGlobal());
    if ( other.empty() || !other[0]->HasAutomatism(automatismId) ) return false;
    b2Body * otherBody = boost::static_pointer_cast<PhysicsAutomatism>(other[0]->GetAutomatism(automatismId))->GetBox2DBody(scene);

    if ( body == otherBody ) return false;

    b2RevoluteJointDef jointDef;
    jointDef.Initialize(otherBody, body, otherBody->GetWorldCenter());
    runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);

    return true;
}


/**
 * Add an hinge to an object
 */
bool PhysicsAutomatism::ActAddRevoluteJoint( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);

    b2RevoluteJointDef jointDef;
    jointDef.Initialize(body, runtimeScenesPhysicsDatas->staticBody,
                        b2Vec2( action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())*runtimeScenesPhysicsDatas->GetInvScaleX(),
                               -action.GetParameter(3).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())*runtimeScenesPhysicsDatas->GetInvScaleY()));

    runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);

    return true;
}


/**
 * Change gravity
 */
bool PhysicsAutomatism::ActSetGravity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);

    runtimeScenesPhysicsDatas->world->SetGravity(
                        b2Vec2( action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())*runtimeScenesPhysicsDatas->GetInvScaleX(),
                               -action.GetParameter(3).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject())*runtimeScenesPhysicsDatas->GetInvScaleY()));

    return true;
}


/**
 * Add a gear joint between two objects
 */
bool PhysicsAutomatism::ActAddGearJointBetweenObjects( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);

    ObjList other = objectsConcerned.Pick(action.GetParameter(2).GetAsObjectIdentifier(), action.IsGlobal());
    if ( other.empty() || !other[0]->HasAutomatism(automatismId) ) return false;
    b2Body * otherBody = boost::static_pointer_cast<PhysicsAutomatism>(other[0]->GetAutomatism(automatismId))->GetBox2DBody(scene);

    if ( body == otherBody ) return false;

    //Gear joint need a revolute joint to the ground for the two objects
    b2RevoluteJointDef jointDef1;
    jointDef1.Initialize(runtimeScenesPhysicsDatas->staticBody, body, body->GetWorldCenter());

    b2RevoluteJointDef jointDef2;
    jointDef2.Initialize(runtimeScenesPhysicsDatas->staticBody, otherBody, otherBody->GetWorldCenter());

    b2GearJointDef jointDef;
    jointDef.bodyA = body;
    jointDef.bodyB = otherBody;
    jointDef.joint1 = runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef1);
    jointDef.joint2 = runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef2);
    jointDef.ratio = 2.0f * b2_pi / 1.0f; //TODO : Ratio parameter ?


    runtimeScenesPhysicsDatas->world->CreateJoint(&jointDef);

    return true;
}
