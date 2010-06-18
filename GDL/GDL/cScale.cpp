
#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"

#include "GDL/RuntimeScene.h"
#include "GDL/SpriteObject.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

/**
 * Test the width scale of a sprite object
 */
bool SpriteObject::CondScaleWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetScaleX() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetScaleX() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetScaleX() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetScaleX() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetScaleX() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetScaleX() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test the height scale of a sprite object
 */
bool SpriteObject::CondScaleHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetScaleY() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetScaleY() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetScaleY() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetScaleY() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetScaleY() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetScaleY() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}
