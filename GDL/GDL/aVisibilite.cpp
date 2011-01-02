/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Opacity action for sprites objects
 */
bool SpriteObject::ActOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOpacity( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOpacity( GetOpacity() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOpacity( GetOpacity() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOpacity( GetOpacity() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOpacity( GetOpacity() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}

/**
 * Hide an object
 */
bool Object::ActCacheObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    SetHidden();

    return true;
}

/**
 * Show an object
 */
bool Object::ActMontreObjet( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    SetHidden(false);

    return true;
}
