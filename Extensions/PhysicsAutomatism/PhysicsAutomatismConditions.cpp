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
 * Test linear velocity on X axis
 */
bool PhysicsAutomatism::CondLinearVelocityX( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !body ) CreateBody(scene);

    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && body->GetLinearVelocity().x == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && body->GetLinearVelocity().x < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && body->GetLinearVelocity().x > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && body->GetLinearVelocity().x <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && body->GetLinearVelocity().x >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && body->GetLinearVelocity().x != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test linear velocity on Y axis
 */
bool PhysicsAutomatism::CondLinearVelocityY( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !body ) CreateBody(scene);

    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && -body->GetLinearVelocity().y == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && -body->GetLinearVelocity().y < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && -body->GetLinearVelocity().y > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && -body->GetLinearVelocity().y <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && -body->GetLinearVelocity().y >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && -body->GetLinearVelocity().y != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test angular velocity
 */
bool PhysicsAutomatism::CondAngularVelocity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !body ) CreateBody(scene);

    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && body->GetAngularVelocity() == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && body->GetAngularVelocity() < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && body->GetAngularVelocity() > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && body->GetAngularVelocity() <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && body->GetAngularVelocity() >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && body->GetAngularVelocity() != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test linear damping
 */
bool PhysicsAutomatism::CondLinearDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !body ) CreateBody(scene);

    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && body->GetLinearDamping() == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && body->GetLinearDamping() < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && body->GetLinearDamping() > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && body->GetLinearDamping() <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && body->GetLinearDamping() >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && body->GetLinearDamping() != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test linear damping
 */
bool PhysicsAutomatism::CondAngularDamping( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !body ) CreateBody(scene);

    if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && body->GetAngularDamping() == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && body->GetAngularDamping() < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && body->GetAngularDamping() > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && body->GetAngularDamping() <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && body->GetAngularDamping() >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) ) ||
            ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && body->GetAngularDamping() != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, object->Shared_ptrFromObject() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test if there is a contact with another object
 */
bool PhysicsAutomatism::CondCollisionWith( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !body ) CreateBody(scene);

    ObjList list = objectsConcerned.Pick(condition.GetParameter( 2 ).GetAsObjectIdentifier(), condition.IsGlobal());

	ObjList::const_iterator obj_end = list.end();
    for (ObjList::iterator obj = list.begin(); obj != obj_end; ++obj )
    {
        set<PhysicsAutomatism*>::const_iterator it = currentContacts.begin();
        set<PhysicsAutomatism*>::const_iterator end = currentContacts.end();
        for (;it != end;++it)
        {
            if ( (*it)->GetObject()->GetObjectIdentifier() == (*obj)->GetObjectIdentifier() )
                return true;
        }
    }

    return false;
}
