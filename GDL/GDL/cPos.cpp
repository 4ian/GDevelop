/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <cmath>
#include <iostream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"

#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

//TODO : Rewrite most of the actions in a beautiful, plain, simple C++ code.

////////////////////////////////////////////////////////////
/// Test la distance d'un objet à un autre
///
/// Type : Distance
/// Paramètre 1 : Objet
/// Paramètre 2 : Objet
/// Paramètre 3 : Valeur
/// Paramètre 4 : Signe du test
////////////////////////////////////////////////////////////
/*
bool CondDistance( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjectsConcerned objectsConcernedForExpressions = objectsConcerned;

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetAsObjectIdentifier(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetPlainString() == condition.GetParameter( 0 ).GetPlainString())
        list2 = list;
    bool isTrue = false;

    //Test each object with each others objects
	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        ObjList::iterator obj2 = list2.begin();
        ObjList::const_iterator obj2_end = list2.end();
        for ( ; obj2 != obj2_end; ++obj2 )
        {
            if ( *obj != *obj2 )
            {
                float X = (*obj)->GetDrawableX()+(*obj)->GetCenterX() - ((*obj2)->GetDrawableX()+(*obj2)->GetCenterX());
                float Y = (*obj)->GetDrawableY()+(*obj)->GetCenterY() - ((*obj2)->GetDrawableY()+(*obj2)->GetCenterY());

                if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && sqrt(X*X+Y*Y) == condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && sqrt(X*X+Y*Y) < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && sqrt(X*X+Y*Y) > condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && sqrt(X*X+Y*Y) <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && sqrt(X*X+Y*Y) >= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && sqrt(X*X+Y*Y) != condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) )
                   )
                {
                    if ( !condition.IsInverted() )
                    {
                        isTrue = true;
                        objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                        objectsConcerned.objectsPicked.AddObject( *obj2 ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                    }
                }
                else
                {
                    if ( condition.IsInverted() )
                    {
                        isTrue = true;
                        objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                        objectsConcerned.objectsPicked.AddObject( *obj2 ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
                    }
                }
            }
        }
    }

    return isTrue;
}
*/
