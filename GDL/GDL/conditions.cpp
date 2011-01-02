/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/Collisions.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"
#include <iostream>

#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"

#include "GDL/Instruction.h"

////////////////////////////////////////////////////////////
/// Test d'égalité
///
/// Type : Egal
/// Paramètre 1 : Valeur 1
/// Paramètre 2 : Valeur 2
///
/// ATTENTION ! N'AJOUTE PAS LES OBJETS DANS LA LISTE DES
/// OBJETS CONCERNES. PREFERER UTILISER LES CONDITIONS
/// APPROPRIEES
////////////////////////////////////////////////////////////
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


