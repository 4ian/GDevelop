#include "Box3DObject.h"
#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"

bool Box3DObject::ActWidth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        width = eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        width += eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        width -= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        width *= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        width /= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());

    return true;
}

bool Box3DObject::ActHeight( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        height = eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        height += eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        height -= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        height *= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        height /= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());

    return true;
}

bool Box3DObject::ActDepth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        depth = eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        depth += eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        depth -= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        depth *= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        depth /= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());

    return true;
}

bool Box3DObject::ActZPosition( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        zPosition = eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        zPosition += eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        zPosition -= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        zPosition *= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        zPosition /= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());

    return true;
}

bool Box3DObject::ActYaw( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        yaw = eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        yaw += eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        yaw -= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        yaw *= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        yaw /= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());

    return true;
}

bool Box3DObject::ActPitch( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        pitch = eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        pitch += eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        pitch -= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        pitch *= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        pitch /= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());

    return true;
}

bool Box3DObject::ActRoll( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        roll = eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        roll += eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        roll -= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        roll *= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        roll /= eval.EvalExp( action.GetParameter( 1 ), shared_from_this());

    return true;
}
