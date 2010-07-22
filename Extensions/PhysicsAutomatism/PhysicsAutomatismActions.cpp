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
    body->ApplyForce(b2Vec2(action.GetParameter(1).GetAsMathExpressionResult(scene, objectsConcerned), action.GetParameter(2).GetAsMathExpressionResult(scene, objectsConcerned)),
                     body->GetPosition());
}

/**
 * Apply a torque
 */
bool PhysicsAutomatism::ActApplyTorque( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( !body ) CreateBody(scene);
    body->ApplyTorque(action.GetParameter(1).GetAsMathExpressionResult(scene, objectsConcerned));
}
