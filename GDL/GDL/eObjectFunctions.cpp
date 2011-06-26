/*! \file eObjectFunctions.h

    Functions which can be called by expressions.
    These functions use an object.
*/

#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/ExpressionInstruction.h"
#include "GDL/StrExpressionInstruction.h"
#include <SFML/System.hpp>
#include <vector>
#include <string>

using namespace std;

/*
double SpriteObject::ExpGetObjectX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    if ( exprInstruction.parameters.size() > 1 )
    {
        std::ostringstream renvoinum;

        return GetCurrentSFMLSprite().TransformToGlobal(
                    sf::Vector2f(
                        !isFlippedX ? GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX() : GetCurrentSprite().GetSFMLSprite().GetSize().x/2-GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX(),
                        !isFlippedY ? GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY() : GetCurrentSprite().GetSFMLSprite().GetSize().y/2-GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY()
                    )).x;
    }

    return GetX();
}

double SpriteObject::ExpGetObjectY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    if ( exprInstruction.parameters.size() > 1 )
    {
        return GetCurrentSFMLSprite().TransformToGlobal(
                    sf::Vector2f(
                        !isFlippedX ? GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX() : GetCurrentSprite().GetSFMLSprite().GetSize().x/2-GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX(),
                        !isFlippedY ? GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY() : GetCurrentSprite().GetSFMLSprite().GetSize().y/2-GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY()
                    )).y;
    }

    return GetY();
}

double SpriteObject::ExpGetObjectDirection( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    if ( currentAnimation >= GetAnimationsNumber() ) return false;

    if ( GetAnimation( currentAnimation ).typeNormal )
        return GetCurrentDirection();
    else
        return GetAngle();
}

double SpriteObject::ExpGetObjectSpriteNb( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetSpriteNb();
}

double SpriteObject::ExpGetObjectAnimationNb( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetCurrentAnimation();
}
*/

/*
double SpriteObject::ExpGetObjectScaleX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetScaleX();
}

double SpriteObject::ExpGetObjectScaleY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetScaleY();
}
*/
