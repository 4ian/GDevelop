#include "Box3DObject.h"
#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"

bool Box3DObject::CondWidth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && width == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && width < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && width > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && width <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && width >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && width != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

bool Box3DObject::CondHeight( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && height == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && height < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && height > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && height <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && height >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && height != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

bool Box3DObject::CondDepth( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && depth == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && depth < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && depth > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && depth <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && depth >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && depth != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

bool Box3DObject::CondZPosition( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && zPosition == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && zPosition < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && zPosition > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && zPosition <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && zPosition >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && zPosition != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

bool Box3DObject::CondYaw( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && yaw == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && yaw < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && yaw > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && yaw <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && yaw >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && yaw != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

bool Box3DObject::CondPitch( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && pitch == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && pitch < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && pitch > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && pitch <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && pitch >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && pitch != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

bool Box3DObject::CondRoll( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && roll == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && roll < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && roll > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && roll <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && roll >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && roll != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}
