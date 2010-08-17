/*! \file eObjectFunctions.h

    Functions which can be called by expressions.
    These functions use an object.
*/

#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"
#include <SFML/System.hpp>
#include <vector>
#include <string>

using namespace std;

double Object::ExpGetObjectX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetX();
}

double Object::ExpGetObjectY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetY();
}

double SpriteObject::ExpGetObjectX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    if ( exprInstruction.parameters.size() > 1 )
    {
        std::ostringstream renvoinum;

        return GetCurrentSFMLSprite().TransformToGlobal(
                    sf::Vector2f(
                        GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX(),
                        GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY()
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
                        GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX(),
                        GetCurrentSprite().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY()
                    )).y;
    }

    return GetY();
}

double SpriteObject::ExpGetObjectDirection( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetCurrentDirection();
}

double SpriteObject::ExpGetObjectSpriteNb( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetSpriteNb();
}

double SpriteObject::ExpGetObjectAnimationNb( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetCurrentAnimation();
}

double Object::ExpGetObjectTotalForceX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceX();
}

double Object::ExpGetObjectTotalForceY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceY();
}

double Object::ExpGetObjectTotalForceAngle( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceAngle();
}

double Object::ExpGetObjectTotalForceLength( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceLength();
}

double Object::ExpGetObjectWidth( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetWidth();
}

double Object::ExpGetObjectHeight( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetHeight();
}

double SpriteObject::ExpGetObjectScaleX( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetScaleX();
}

double SpriteObject::ExpGetObjectScaleY( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetScaleY();
}

double Object::ExpGetObjectZOrder( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetZOrder();
}

double Object::ExpGetObjectVariableValue( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return variablesObjet.GetVariableValue(exprInstruction.parameters[1].GetPlainString());
}

string Object::ExpGetObjectVariableString( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const StrExpressionInstruction & exprInstruction )
{
    return variablesObjet.GetVariableText(exprInstruction.parameters[1].GetPlainString());
}

double Object::ExpGetDistanceBetweenObjects( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    ObjSPtr object2;
    ObjList list2 = objectsConcerned.Pick( exprInstruction.parameters[1].GetAsObjectIdentifier() );

    if ( !list2.empty() )
    {
        object2 = list2[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la condition est dedans, on le prend
        ObjList::iterator iter = find(list2.begin(), list2.end(), obj1);
        if ( iter != list2.end() )
            object2 = *iter;
        else
        {
            //Si l'objet secondaire de la condition est dedans, on le prend
            iter = find(list2.begin(), list2.end(), obj2);
            if ( iter != list2.end() )
                object2 = *iter;
        }
    }

    if ( object2 != boost::shared_ptr<Object>( ) )
    {
        float X = GetDrawableX()+GetCenterX() - (object2->GetDrawableX()+object2->GetCenterX());
        float Y = GetDrawableY()+GetCenterY() - (object2->GetDrawableY()+object2->GetCenterY());

        return sqrt(X*X+Y*Y);
    }
    return 0;
}

double Object::ExpGetSqDistanceBetweenObjects( const RuntimeScene & scene, ObjectsConcerned & objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    ObjSPtr object2;
    ObjList list2 = objectsConcerned.Pick( exprInstruction.parameters[1].GetAsObjectIdentifier() );

    if ( !list2.empty() )
    {
        object2 = list2[0]; //On prend le premier objet de la liste par défaut

        //Si l'objet principal de la condition est dedans, on le prend
        ObjList::iterator iter = find(list2.begin(), list2.end(), obj1);
        if ( iter != list2.end() )
            object2 = *iter;
        else
        {
            //Si l'objet secondaire de la condition est dedans, on le prend
            iter = find(list2.begin(), list2.end(), obj2);
            if ( iter != list2.end() )
                object2 = *iter;
        }
    }

    if ( object2 != boost::shared_ptr<Object>( ) )
    {
        float X = GetDrawableX()+GetCenterX() - (object2->GetDrawableX()+object2->GetCenterX());
        float Y = GetDrawableY()+GetCenterY() - (object2->GetDrawableY()+object2->GetCenterY());

        return X*X+Y*Y; // No Square root
    }
    return 0;
}
