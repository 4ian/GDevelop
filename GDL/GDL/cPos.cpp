/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *
 *  Contient une ou plusieurs conditions
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cPos.h"
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
#include "GDL/gpl.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

/**
 * Test X position of an object
 */
bool Object::CondPosX( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetX() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetX() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetX() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetX() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetX() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetX() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test Y position of an object
 */
bool Object::CondPosY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetY() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetY() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetY() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetY() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetY() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetY() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Test la distance d'un objet à un autre
///
/// Type : Distance
/// Paramètre 1 : Objet
/// Paramètre 2 : Objet
/// Paramètre 3 : Valeur
/// Paramètre 4 : Signe du test
////////////////////////////////////////////////////////////
bool CondDistance( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    ObjectsConcerned originalObjectsConcerned = objectsConcerned;
    eval.SetObjectsConcerned(&originalObjectsConcerned);

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetAsObjectIdentifier(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetPlainString() == condition.GetParameter( 0 ).GetPlainString())
        list2 = list;
    bool isTrue = false;

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        ObjList::iterator obj2 = list2.begin();
        ObjList::const_iterator obj2_end = list2.end();
        for ( ; obj2 != obj2_end; ++obj2 )
        {
            //Enfin, on teste vraiment.
            if ( *obj != *obj2 )
            {
                float X = (*obj)->GetDrawableX()+(*obj)->GetCenterX() - ((*obj2)->GetDrawableX()+(*obj2)->GetCenterX());
                float Y = (*obj)->GetDrawableY()+(*obj)->GetCenterY() - ((*obj2)->GetDrawableY()+(*obj2)->GetCenterY());

                //optimisation : le test de signe en premier
                if (( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Equal && gpl::sqrt(X*X+Y*Y) == eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Inferior && gpl::sqrt(X*X+Y*Y) < eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Superior && gpl::sqrt(X*X+Y*Y) > eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && gpl::sqrt(X*X+Y*Y) <= eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && gpl::sqrt(X*X+Y*Y) >= eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) ) ||
                        ( condition.GetParameter( 3 ).GetAsCompOperator() == GDExpression::Different && gpl::sqrt(X*X+Y*Y) != eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) )
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
