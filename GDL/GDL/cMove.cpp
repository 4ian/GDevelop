/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/cMove.h"
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
#include "GDL/ObjectsConcerned.h"
#include "GDL/Instruction.h"

/**
 * Test if an object don't move.
 */
bool Object::CondArret( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if ( TotalForceLength() == 0 )
        return true;

    return false;
}


/**
 * Test the speed of an object
 */
bool Object::CondVitesse( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && TotalForceLength() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && TotalForceLength() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && TotalForceLength() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && TotalForceLength() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && TotalForceLength() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && TotalForceLength() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

////////////////////////////////////////////////////////////
/// Test si un objet se dirige vers un autre
///
/// Type : SeDirige
/// Paramètre 1 : Objet
/// Paramètre 2 : Objet
/// Paramètre 3 : Angle de tolérance
////////////////////////////////////////////////////////////
bool CondSeDirige( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
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
        if ( (*obj)->TotalForceLength() != 0 )
        {
            ObjList::iterator obj2 = list2.begin();
            ObjList::const_iterator obj2_end = list2.end();
            for ( ; obj2 != obj2_end; ++obj2 )
            {
                //Enfin, on teste vraiment.
                if ( *obj != *obj2 )
                {
                    Force force;
                    //Les comparaisons sont faites de centre à centre
                    force.SetX( ( (*obj2)->GetDrawableX() + (*obj2)->GetCenterX() ) - ( (*obj)->GetDrawableX() + (*obj)->GetCenterX() ) );
                    force.SetY( ( (*obj2)->GetDrawableY() + (*obj2)->GetCenterY() ) - ( (*obj)->GetDrawableY() + (*obj)->GetCenterY() ) );

                    int angle = static_cast<int>(force.GetAngle()); //On récupère l'angle entre les deux objets

                    int angleObjet = static_cast<int>((*obj)->TotalForceAngle());

                    while ( angle < 0 )
                        angle += 360;
                    while ( angle > 360 )
                        angle -= 360;

                    while ( angleObjet < 0 )
                        angleObjet += 360;
                    while ( angleObjet > 360 )
                        angleObjet -= 360;

                    if ( fabs( static_cast<float>(angle - angleObjet) ) < eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) / 2 )
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
        else
        {
            if ( condition.IsInverted() )
            {
                isTrue = true;
                objectsConcerned.objectsPicked.AddObject( *obj ); //L'objet est ajouté aux objets concernés ( Il n'y est pas déjà )
            }
        }
    }

    return isTrue;
}
