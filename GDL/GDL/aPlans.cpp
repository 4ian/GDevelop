/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"



/**
 * Change the zOrder of an object
 */
bool Object::ActChangeZOrder( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetZOrder( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() )) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetZOrder( GetZOrder() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() )) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetZOrder( GetZOrder() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() )) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetZOrder( GetZOrder() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() )) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetZOrder( GetZOrder() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() )) );

    return true;
}
