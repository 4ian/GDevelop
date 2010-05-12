/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include <cmath>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/algo.h"
#include "GDL/StdAlgo.h"
#include "GDL/Access.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

typedef vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

/**
 * Pause the current animation of a sprite object
 */
bool SpriteObject::ActPauseAnimation( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    StopAnimation();

    return true;
}

/**
 * Play the current animation of a sprite object
 */
bool SpriteObject::ActPlayAnimation( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    PlayAnimation();

    return true;
}

/**
 * Change animation of a sprite object
 */
bool SpriteObject::ActChangeAnimation( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetAnim(static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetAnim(static_cast<int>(GetAnimationNb() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetAnim(static_cast<int>(GetAnimationNb() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetAnim(static_cast<int>(GetAnimationNb() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetAnim(static_cast<int>(GetAnimationNb() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}


/**
 * Change the direction of a sprite object
 */
bool SpriteObject::ActChangeDirection( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetDirec(gdRound((action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetDirec(gdRound((GetDirectionNb() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetDirec(gdRound((GetDirectionNb() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetDirec(gdRound((GetDirectionNb() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetDirec(gdRound((GetDirectionNb() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));

    return true;
}

/**
 * Turn a sprite object toward another
 */
bool ActTourneVers( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    ObjList list = objectsConcerned.Pick(action.GetParameter( 0 ).GetAsObjectIdentifier(), action.IsGlobal());
    ObjList list2 = objectsConcerned.Pick(action.GetParameter( 1 ).GetAsObjectIdentifier(), action.IsGlobal());

    if ( list2.empty() ) return true; //Pas d'objet vers lequel se diriger
    boost::shared_ptr<Object> obj2 = list2[0];

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        //On se dirige vers le centre
        int angle = atan2(
        (obj2->GetDrawableY() + obj2->GetCenterY()) - ((*obj)->GetDrawableY()+(*obj)->GetCenterY()),
        (obj2->GetDrawableX() + obj2->GetCenterX()) - ((*obj)->GetDrawableX()+(*obj)->GetCenterX())
        ) * 180 / 3.14;

        if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetAnimation(
                                                                           boost::static_pointer_cast<SpriteObject>(*obj)->GetAnimationNb()
                                                                           ).typeNormal )
        {
            if ( angle < 0 )
                angle += 360;

            //TODO : Refactor
            if ( angle >= 337.5 || angle < 22.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(0);
            else if ( angle >= 22.5 && angle < 67.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(1);
            else if ( angle >= 67.5 && angle < 112.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(2);
            else if ( angle >= 112.5 && angle < 157.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(3);
            else if ( angle >= 157.5 && angle < 202.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(4);
            else if ( angle >= 202.5 && angle < 247.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(5);
            else if ( angle >= 247.5 && angle < 292.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(6);
            else if ( angle >= 292.5 && angle < 337.5 )
                boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(7);
        }
        else
        {
            boost::static_pointer_cast<SpriteObject>(*obj)->SetDirec(angle);
        }
    }
    return true;
}


/**
 * Turn a sprite object toward a position
 */
bool SpriteObject::ActTourneVersPos( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
	//Work around for a Visual C++ internal compiler error (!)
	double y = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()) - (GetDrawableY()+GetCenterY());
	double x = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()) - (GetDrawableX()+GetCenterX());
    int angle = atan2(y,x) * 180 / 3.14;

    if ( GetAnimation( GetAnimationNb() ).typeNormal )
    {
        //TODO : Refactor this
        if ( angle < 0 )
            angle += 360;

        if ( angle >= 337.5 || angle < 22.5 )
            SetDirec(0);
        else if ( angle >= 22.5 && angle < 67.5 )
            SetDirec(1);
        else if ( angle >= 67.5 && angle < 112.5 )
            SetDirec(2);
        else if ( angle >= 112.5 && angle < 157.5 )
            SetDirec(3);
        else if ( angle >= 157.5 && angle < 202.5 )
            SetDirec(4);
        else if ( angle >= 202.5 && angle < 247.5 )
            SetDirec(5);
        else if ( angle >= 247.5 && angle < 292.5 )
            SetDirec(6);
        else if ( angle >= 292.5 && angle < 337.5 )
            SetDirec(7);
    }
    else
    {
        SetDirec(angle);
    }
    return true;
}


/**
 * Change the current sprite (image) of a sprite object
 */
bool SpriteObject::ActChangeSprite( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetSprite(static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetSprite(static_cast<int>(GetSpriteNb() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetSprite(static_cast<int>(GetSpriteNb() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetSprite(static_cast<int>(GetSpriteNb() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetSprite(static_cast<int>(GetSpriteNb() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}
