/**

Game Develop - Physic Automatism Extension
Copyright (c) 2010 Florian Rival (Florian.Rival@gmail.com)

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
