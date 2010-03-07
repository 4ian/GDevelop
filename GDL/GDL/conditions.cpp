/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
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
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/Access.h"
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
bool CondEgal( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    bool isTrue = false;

    if ( condition.GetParameters().size() < 3 )
    {
        if ( eval.EvalExp( condition.GetParameter( 0 ) ) == eval.EvalExp( condition.GetParameter( 1 ) ) )
            isTrue = true;
    }
    else
    {
        if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && eval.EvalExp( condition.GetParameter( 0 ) ) == eval.EvalExp( condition.GetParameter( 1 )) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && eval.EvalExp( condition.GetParameter( 0 ) ) < eval.EvalExp( condition.GetParameter( 1 )) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && eval.EvalExp( condition.GetParameter( 0 ) ) > eval.EvalExp( condition.GetParameter( 1 )) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && eval.EvalExp( condition.GetParameter( 0 ) ) <= eval.EvalExp( condition.GetParameter( 1 )) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && eval.EvalExp( condition.GetParameter( 0 ) ) >= eval.EvalExp( condition.GetParameter( 1 )) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && eval.EvalExp( condition.GetParameter( 0 ) ) != eval.EvalExp( condition.GetParameter( 1 )) )
           )
        {
            isTrue = true;
        }
    }

    if ( condition.IsInverted() )
        return !isTrue;

    return isTrue;
}


