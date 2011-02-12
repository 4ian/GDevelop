/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"

/**
 * Condition testing equality between two expressions
 */
bool CondEgal( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    bool isTrue = false;

    if ( condition.GetParameters().size() < 3 )
    {
        if ( condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) )
            isTrue = true;
    }
    else
    {
        if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && condition.GetParameter( 0 ).GetAsMathExpressionResult(scene, objectsConcerned) != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned) )
           )
        {
            isTrue = true;
        }
    }

    if ( condition.IsInverted() )
        return !isTrue;

    return isTrue;
}


