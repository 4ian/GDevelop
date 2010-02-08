#include "TextObject.h"
#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"


/**
 * Test the string
 */
bool TextObject::CondString( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter(2).GetAsCompOperator() == GDExpression::Equal && string(text.GetString()) == eval.EvalTxt(condition.GetParameter( 1 ), shared_from_this()) ) ||
        ( condition.GetParameter(2).GetAsCompOperator() == GDExpression::Different && string(text.GetString()) != eval.EvalTxt(condition.GetParameter( 1 ), shared_from_this()) )
       )
    {
        return true;
    }

    return false;
}

bool TextObject::CondSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetCharacterSize() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetCharacterSize() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetCharacterSize() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetCharacterSize() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetCharacterSize() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetCharacterSize() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

/**
 * Test the opacity
 */
bool TextObject::CondOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetOpacity() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetOpacity() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetOpacity() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetOpacity() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetOpacity() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetOpacity() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

/**
 * Test the angle
 */
bool TextObject::CondAngle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetAngle() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetAngle() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetAngle() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetAngle() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetAngle() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetAngle() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}
