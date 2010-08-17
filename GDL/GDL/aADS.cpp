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
#include "GDL/CommonTools.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

typedef vector < boost::shared_ptr<Object> > ObjList;
typedef boost::shared_ptr<Object> ObjSPtr;

/**
 * Pause the current animation of a sprite object
 */
bool SpriteObject::ActPauseAnimation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    StopAnimation();

    return true;
}

/**
 * Play the current animation of a sprite object
 */
bool SpriteObject::ActPlayAnimation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    PlayAnimation();

    return true;
}

/**
 * Change animation of a sprite object
 */
bool SpriteObject::ActChangeAnimation( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetAnimation(static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetAnimation(static_cast<int>(GetCurrentAnimation() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetAnimation(static_cast<int>(GetCurrentAnimation() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetAnimation(static_cast<int>(GetCurrentAnimation() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetAnimation(static_cast<int>(GetCurrentAnimation() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}


/**
 * Change the direction of a sprite object
 */
bool SpriteObject::ActChangeDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( currentAnimation >= GetAnimationsNumber() ) return false;

    if ( GetAnimation( currentAnimation ).typeNormal )
    {
        if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
            SetDirection(GDRound((action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
            SetDirection(GDRound((GetCurrentDirection() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
            SetDirection(GDRound((GetCurrentDirection() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
            SetDirection(GDRound((GetCurrentDirection() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
            SetDirection(GDRound((GetCurrentDirection() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()))));
    }
    else
    {
        if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
            SetAngle((action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
            SetAngle((GetAngle() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
            SetAngle((GetAngle() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
            SetAngle((GetAngle() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
        else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
            SetAngle((GetAngle() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    }

    return true;
}

/**
 * Turn a sprite object toward another
 */
bool ActTourneVers( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
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
        float angle = atan2(
        (obj2->GetDrawableY() + obj2->GetCenterY()) - ((*obj)->GetDrawableY()+(*obj)->GetCenterY()),
        (obj2->GetDrawableX() + obj2->GetCenterX()) - ((*obj)->GetDrawableX()+(*obj)->GetCenterX())
        ) * 180 / 3.14;

        boost::static_pointer_cast<SpriteObject>(*obj)->SetAngle(angle);
    }
    return true;
}


/**
 * Turn a sprite object toward a position
 */
bool SpriteObject::ActTourneVersPos( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
	//Work around for a Visual C++ internal compiler error (!)
	double y = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()) - (GetDrawableY()+GetCenterY());
	double x = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()) - (GetDrawableX()+GetCenterX());
    float angle = atan2(y,x) * 180 / 3.14;

    SetAngle(angle);
    return true;
}


/**
 * Change the current sprite (image) of a sprite object
 */
bool SpriteObject::ActChangeSprite( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
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
