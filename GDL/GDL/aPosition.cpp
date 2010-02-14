/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *
 *  Contient une ou plusieurs actions
 */

#include <vector>
#include <string>
#include "GDL/Object.h"
#include <cmath>
#include "GDL/aPosition.h"
#include "GDL/Event.h"
#include <iostream>
#include <sstream>
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/Force.h"
#include <iostream>
#include "GDL/Access.h"
#include "GDL/ListVariable.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"



/**
 * Change the X position of an object
 */
bool Object::ActMettreX( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetX( eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetX( GetX() +eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetX( GetX() -eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetX( GetX() *eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetX( GetX() /eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );

    return true;
}

/**
 * Change the Y position of an object
 */
bool Object::ActMettreY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    //On modifie la position Y
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetY( eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetY( GetY() + eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetY( GetY() - eval.EvalExp( action.GetParameter( 1 ), shared_from_this()  ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetY( GetY() * eval.EvalExp( action.GetParameter( 1 ), shared_from_this()  ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetY( GetY() / eval.EvalExp( action.GetParameter( 1 ), shared_from_this()  ) );

    return true;
}


/**
 * Change the X and Y position of an object
 */
bool Object::ActMettreXY( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    //On modifie la position X
    if ( action.GetParameter( 2 ).GetPlainString().empty() || action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set)
        SetX( eval.EvalExp( action.GetParameter( 1 ), shared_from_this() ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetX( GetX() + eval.EvalExp( action.GetParameter( 1 ), shared_from_this()  ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetX( GetX() - eval.EvalExp( action.GetParameter( 1 ), shared_from_this()  ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetX( GetX() * eval.EvalExp( action.GetParameter( 1 ), shared_from_this()  ) );
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetX( GetX() / eval.EvalExp( action.GetParameter( 1 ), shared_from_this()  ) );

    //On modifie la position Y
    if ( action.GetParameter( 4 ).GetPlainString().empty() || action.GetParameter( 4 ).GetAsModOperator() == GDExpression::Set)
        SetY( eval.EvalExp( action.GetParameter( 3 ), shared_from_this() ) );
    else if ( action.GetParameter( 4 ).GetAsModOperator() == GDExpression::Add )
        SetY( GetY() + eval.EvalExp( action.GetParameter( 3 ), shared_from_this()  ) );
    else if ( action.GetParameter( 4 ).GetAsModOperator() == GDExpression::Substract )
        SetY( GetY() - eval.EvalExp( action.GetParameter( 3 ), shared_from_this()  ) );
    else if ( action.GetParameter( 4 ).GetAsModOperator() == GDExpression::Multiply )
        SetY( GetY() * eval.EvalExp( action.GetParameter( 3 ), shared_from_this()  ) );
    else if ( action.GetParameter( 4 ).GetAsModOperator() == GDExpression::Divide )
        SetY( GetY() / eval.EvalExp( action.GetParameter( 3 ), shared_from_this()  ) );

    return true;
}


////////////////////////////////////////////////////////////
/// Mettre un objet autour d'un autre
///
/// Type : MettreAutour
/// Paramètre 1 : Objet
/// Paramètre 2 : Objet centre
/// Paramètre 3 : Distance
/// Paramètre 4 : Angle
////////////////////////////////////////////////////////////
bool ActMettreAutour( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());
    ObjList list2 = objectsConcerned.Pick(action.GetParameter( 1 ).GetAsObjectIdentifier(), action.IsGlobal());

    if ( list2.empty() ) return true; //Pas d'objet vers lequel se diriger
    boost::shared_ptr<Object> obj2 = list2[0];

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        (*obj)->SetX( (obj2)->GetDrawableX()+(obj2)->GetCenterX()
                                               + cos(eval.EvalExp( action.GetParameter( 3 ), *obj, obj2 )/180*3.14)*eval.EvalExp( action.GetParameter( 2 ), *obj, obj2 )
                                               - (*obj)->GetCenterX() );

        (*obj)->SetY( (obj2)->GetDrawableY()+(obj2)->GetCenterY()
                                               + sin(eval.EvalExp( action.GetParameter( 3 ), *obj, obj2 )/180*3.14)*eval.EvalExp( action.GetParameter( 2 ), *obj, obj2 )
                                               - (*obj)->GetCenterY() );
    }

    return true;
}


////////////////////////////////////////////////////////////
/// Mettre un objet autour d'une position
///
/// Type : MettreAutourPos
/// Paramètre 1 : Objet
/// Paramètre 2 : Position X
/// Paramètre 3 : Position Y
/// Paramètre 4 : Distance
/// Paramètre 5 : Angle
////////////////////////////////////////////////////////////
bool Object::ActMettreAutourPos( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    SetX( eval.EvalExp( action.GetParameter( 1 ), shared_from_this() )
                                           + cos(eval.EvalExp( action.GetParameter( 4 ), shared_from_this() )/180*3.14)*eval.EvalExp( action.GetParameter( 3 ), shared_from_this() )
                                           - GetCenterX() );

    SetY( eval.EvalExp( action.GetParameter( 2 ), shared_from_this() )
                                           + sin(eval.EvalExp( action.GetParameter( 4 ), shared_from_this() )/180*3.14)*eval.EvalExp( action.GetParameter( 3 ), shared_from_this() )
                                           - GetCenterY() );

    return true;
}
