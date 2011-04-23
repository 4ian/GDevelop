/**

Game Develop - Light Extension
Copyright (c) 2008-2011 Florian Rival (Florian.Rival@gmail.com)

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

#include "LightObject.h"

#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/CommonTools.h"


/**
 * Modify opacity
 */
bool LightObject::ActIntensity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetIntensity( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetIntensity( GetIntensity() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetIntensity( GetIntensity() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetIntensity( GetIntensity() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetIntensity( GetIntensity() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}

/**
 * Change color
 */
bool LightObject::ActChangeColor( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    vector < string > colors = SpliterStringToVector <string> (action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    SetColor(sf::Color(ToInt(colors[0]),ToInt(colors[1]),ToInt(colors[2])));

    return true;
}


/**
 * Modify angle
 */
bool LightObject::ActAngle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetAngle( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetAngle( GetAngle() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetAngle( GetAngle() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetAngle( GetAngle() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetAngle( GetAngle() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
