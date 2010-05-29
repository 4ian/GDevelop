/**

Game Develop - Box 3D Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

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

#include "Box3DObject.h"
#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"

bool Box3DObject::ActWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        width = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        width += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        width -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        width *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        width /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    return true;
}

bool Box3DObject::ActHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        height = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        height += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        height -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        height *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        height /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    return true;
}

bool Box3DObject::ActDepth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        depth = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        depth += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        depth -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        depth *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        depth /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    return true;
}

bool Box3DObject::ActZPosition( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        zPosition = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        zPosition += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        zPosition -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        zPosition *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        zPosition /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    return true;
}

bool Box3DObject::ActYaw( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        yaw = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        yaw += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        yaw -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        yaw *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        yaw /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    return true;
}

bool Box3DObject::ActPitch( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        pitch = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        pitch += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        pitch -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        pitch *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        pitch /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    return true;
}

bool Box3DObject::ActRoll( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        roll = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        roll += action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        roll -= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        roll *= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        roll /= action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    return true;
}
