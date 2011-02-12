/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <vector>
#include <string>
#include <iostream>
#include "GDL/SpriteObject.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Force.h"

#include <SFML/Window.hpp>
#include "GDL/RuntimeScene.h"
#include "GDL/Instruction.h"
#include "GDL/SpriteObject.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Test the number of the current animation of an object
 */
bool SpriteObject::CondAnim( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetCurrentAnimation() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetCurrentAnimation() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetCurrentAnimation() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetCurrentAnimation() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetCurrentAnimation() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetCurrentAnimation() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test if the current animation of an object is stopped
 */
bool SpriteObject::CondAnimStopped( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
   return IsAnimationStopped();
}

/**
 * Test the number of the current sprite ( image ) of a sprite object
 */
bool SpriteObject::CondSprite( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetSpriteNb() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetSpriteNb() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetSpriteNb() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetSpriteNb() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetSpriteNb() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetSpriteNb() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test the current direction of a sprite object
 */
bool SpriteObject::CondDirection( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    if ( currentAnimation >= GetAnimationsNumber() ) return false;

    if ( GetAnimation( currentAnimation ).typeNormal )
    {
        //optimisation : le test de signe en premier
        if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetCurrentDirection() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetCurrentDirection() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetCurrentDirection() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetCurrentDirection() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetCurrentDirection() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetCurrentDirection() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
           )
        {
            return true;
        }
    }
    else
    {
        //optimisation : le test de signe en premier
        if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetAngle() == condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetAngle() < condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetAngle() > condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetAngle() <= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetAngle() >= condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) ) ||
                ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetAngle() != condition.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this() ) )
           )
        {
            return true;
        }
    }

    return false;
}

/**
 * Test if a sprite object is turned toward another
 */
bool CondEstTourne( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & condition )
{
    ObjectsConcerned objectsConcernedForExpressions = objectsConcerned;

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetAsObjectIdentifier(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetAsObjectIdentifier(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetPlainString() == condition.GetParameter( 0 ).GetPlainString() )
        list2 = list;

    bool isTrue = false;

    //Test each object against each other objects
	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        ObjList::iterator obj2 = list2.begin();
        ObjList::const_iterator obj2_end = list2.end();
        for (; obj2 != obj2_end; ++obj2 )
        {
            if ( *obj != *obj2 )
            {
                Force force;
                force.SetX( ( (*obj2)->GetDrawableX() + (*obj2)->GetCenterX() ) - ( (*obj)->GetDrawableX() + (*obj)->GetCenterX() ) );
                force.SetY( ( (*obj2)->GetDrawableY() + (*obj2)->GetCenterY() ) - ( (*obj)->GetDrawableY() + (*obj)->GetCenterY() ) );

                int angle = static_cast<int>(force.GetAngle()); //On récupère l'angle entre les deux objets

                int angleObjet = boost::static_pointer_cast<SpriteObject>(*obj)->GetAngle();

                angle = fmodf(angle, 360);
                if ( angle < 0 )
                    angle += 360;

                angleObjet = fmodf(angleObjet, 360);
                if ( angleObjet < 0 )
                    angleObjet += 360;

                float gap = fabs( static_cast<float>(angle - angleObjet) );
                gap = gap > 180 ? 360 - gap : gap;

                if ( gap < condition.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcernedForExpressions, *obj, *obj2 ) / 2 )
                {
                    if ( !condition.IsInverted() )
                    {
                        isTrue = true;
                        objectsConcerned.objectsPicked.AddObject( *obj );
                        objectsConcerned.objectsPicked.AddObject( *obj2 );
                    }
                }
                else
                {
                    if ( condition.IsInverted() )
                    {
                        isTrue = true;
                        objectsConcerned.objectsPicked.AddObject( *obj );
                        objectsConcerned.objectsPicked.AddObject( *obj2 );
                    }
                }
            }
        }
    }
    return isTrue;
}
