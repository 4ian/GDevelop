/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */
#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cVariables.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/SpriteObject.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

/**
 * Test the opacity of a sprite object
 */
bool SpriteObject::CondOpacityObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetOpacity() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetOpacity() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetOpacity() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetOpacity() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetOpacity() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetOpacity() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
       return true;
    }

    return false;
}

/**
 * Test if an object is hidden
 */
bool Object::CondInvisibleObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( IsHidden() )
        return true;

    return false;
}

/**
 * Test if an object is not hidden
 */
bool Object::CondVisibleObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( !IsHidden() )
        return true;

    return false;
}

#undef PARAM
#undef PREPARATION
#undef RENVOI
