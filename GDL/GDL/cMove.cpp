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

/**
 * Test if an object don't move.
 */
bool Object::CondArret( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( TotalForceLength() == 0 )
        return true;

    return false;
}


/**
 * Test the speed of an object
 */
bool Object::CondVitesse( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && TotalForceLength() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && TotalForceLength() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && TotalForceLength() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && TotalForceLength() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && TotalForceLength() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && TotalForceLength() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
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
bool CondSeDirige( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjectsConcerned objectsConcernedForExpressions = objectsConcerned;

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetAsObjectIdentifier(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetPlainString() == condition.GetParameter( 0 ).GetPlainString())
        list2 = list;
    bool isTrue = false;

    //Test each object against each other objects
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
                if ( *obj != *obj2 )
                {
                    Force force;
                    //Les comparaisons sont faites de centre à centre
                    force.SetX( ( (*obj2)->GetDrawableX() + (*obj2)->GetCenterX() ) - ( (*obj)->GetDrawableX() + (*obj)->GetCenterX() ) );
                    force.SetY( ( (*obj2)->GetDrawableY() + (*obj2)->GetCenterY() ) - ( (*obj)->GetDrawableY() + (*obj)->GetCenterY() ) );

                    float angle = force.GetAngle(); //On récupère l'angle entre les deux objets

                    float objectAngle = (*obj)->TotalForceAngle();

                    //Compute difference between two angles
                    float diff = objectAngle - angle;
                    while ( diff>180 )
                        diff -= 360;
                    while ( diff<-180 )
                        diff += 360;

                    if ( fabs( diff ) <= condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) / 2 )
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

/**
 * Compare the angle of displacement of an object
 */
bool Object::CondAngleOfDisplacement( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( TotalForceLength() == 0) return condition.IsInverted();

    float angle = condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() );
    float objectAngle = TotalForceAngle();

    //Compute difference between two angles
    float diff = objectAngle - angle;
    while ( diff>180 )
		diff -= 360;
	while ( diff<-180 )
		diff += 360;

    if ( fabs(diff) <= (condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())/2) )
        return !condition.IsInverted();

    return condition.IsInverted();
}
