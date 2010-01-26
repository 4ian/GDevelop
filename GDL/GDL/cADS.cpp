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
#include "GDL/cADS.h"
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
#include "GDL/Instruction.h"
#include "GDL/SpriteObject.h"
#include "GDL/ObjectsConcerned.h"

/**
 * Test the number of the current animation of an object
 */
bool SpriteObject::CondAnim( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetAnimationNb() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetAnimationNb() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetAnimationNb() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetAnimationNb() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetAnimationNb() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetAnimationNb() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test if the current animation of an object is stopped
 */
bool SpriteObject::CondAnimStopped( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
   return IsAnimationStopped();
}

/**
 * Test the number of the current sprite ( image ) of a sprite object
 */
bool SpriteObject::CondSprite( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetSpriteNb() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetSpriteNb() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetSpriteNb() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetSpriteNb() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetSpriteNb() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetSpriteNb() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test the current direction of a sprite object
 */
bool SpriteObject::CondDirection( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    //optimisation : le test de signe en premier
    if (( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Equal && GetDirectionNb() == eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Inferior && GetDirectionNb() < eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Superior && GetDirectionNb() > eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::InferiorOrEqual && GetDirectionNb() <= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::SuperiorOrEqual && GetDirectionNb() >= eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) ) ||
            ( condition.GetParameter( 2 ).GetAsCompOperator() == GDExpression::Different && GetDirectionNb() != eval.EvalExp( condition.GetParameter( 1 ), shared_from_this() ) )
       )
    {
        return true;
    }

    return false;
}

/**
 * Test if a sprite object is turned toward another
 */
bool CondEstTourne( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & condition, const Evaluateur & eval )
{
    ObjectsConcerned originalObjectsConcerned = objectsConcerned;
    eval.SetObjectsConcerned(&originalObjectsConcerned);

    ObjList list = objectsConcerned.PickAndRemove(condition.GetParameter( 0 ).GetPlainString(), condition.IsGlobal());
    ObjList list2 = objectsConcerned.PickAndRemove(condition.GetParameter( 1 ).GetPlainString(), condition.IsGlobal());
    if ( condition.GetParameter( 1 ).GetPlainString() == condition.GetParameter( 0 ).GetPlainString())
        list2 = list;

    bool isTrue = false;

	ObjList::iterator obj = list.begin();
	ObjList::const_iterator obj_end = list.end();
    for ( ; obj != obj_end; ++obj )
    {
        ObjList::iterator obj2 = list2.begin();
        ObjList::const_iterator obj2_end = list2.end();
        for (; obj2 != obj2_end; ++obj2 )
        {
            //Enfin, on teste vraiment.
            if ( *obj != *obj2 )
            {
                Force force;
                force.SetX( ( (*obj2)->GetDrawableX() + (*obj2)->GetCenterX() ) - ( (*obj)->GetDrawableX() + (*obj)->GetCenterX() ) );
                force.SetY( ( (*obj2)->GetDrawableY() + (*obj2)->GetCenterY() ) - ( (*obj)->GetDrawableY() + (*obj)->GetCenterY() ) );

                int angle = static_cast<int>(force.GetAngle()); //On récupère l'angle entre les deux objets

                int angleObjet = 0;


                //On récupère l'angle de l'objet
                if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetAnimation(  boost::static_pointer_cast<SpriteObject>(*obj)->GetAnimationNb() ).typeNormal )
                {
                    //TODO : Refactor
                    if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 0 ) angleObjet = 0;
                    else if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 1 ) angleObjet = 45;
                    else if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 2 ) angleObjet = 90;
                    else if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 3 ) angleObjet = 135;
                    else if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 4 ) angleObjet = 180;
                    else if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 5 ) angleObjet = 225;
                    else if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 6 ) angleObjet = 270;
                    else if (  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb() == 7 ) angleObjet = 315;
                }
                else { angleObjet =  boost::static_pointer_cast<SpriteObject>(*obj)->GetDirectionNb(); }

                while ( angle < 0 )
                    angle += 360;
                while ( angle > 360 )
                    angle -= 360;

                while ( angleObjet < 0 )
                    angleObjet += 360;
                while ( angleObjet > 360 )
                    angleObjet -= 360;

                if ( fabs( angle - angleObjet ) < eval.EvalExp( condition.GetParameter( 2 ), *obj, *obj2 ) / 2 )
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
