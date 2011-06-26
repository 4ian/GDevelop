/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include <cmath>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/CommonTools.h"
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"


//TODO : Rewrite most of the actions in a beautiful, plain, simple C++ code.

////////////////////////////////////////////////////////////
/// Mettre un objet autour d'un autre
///
/// Type : MettreAutour
/// Paramètre 1 : Objet
/// Paramètre 2 : Objet centre
/// Paramètre 3 : Distance
/// Paramètre 4 : Angle
////////////////////////////////////////////////////////////
/*
bool ActMettreAutour( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());
    ObjList list2 = objectsConcerned.Pick(action.GetParameter( 1 ).GetAsObjectIdentifier(), action.IsGlobal());

    if ( list2.empty() ) return true; //Pas d'objet vers lequel se diriger
    boost::shared_ptr<Object> obj2 = list2[0];

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        double angle = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned, *obj, obj2 )/180*3.14159;
        double length = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, *obj, obj2 );

        (*obj)->SetX( (obj2)->GetDrawableX()+(obj2)->GetCenterX()
                                               + cos(angle)*length
                                               - (*obj)->GetCenterX() );

        (*obj)->SetY( (obj2)->GetDrawableY()+(obj2)->GetCenterY()
                                               + sin(angle)*length
                                               - (*obj)->GetCenterY() );
    }

    return true;
}
*/
