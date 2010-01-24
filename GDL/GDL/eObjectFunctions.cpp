/*! \file eObjectFunctions.h

    Functions which can be called by expressions.
    These functions use an object.
*/

#include "GDL/Object.h"
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/gpl.h"
#include "GDL/ObjectsConcerned.h"
#include <SFML/System.hpp>
#include <vector>
#include <string>

using namespace std;

double Object::ExpGetObjectX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetX();
}

double Object::ExpGetObjectY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetY();
}

double SpriteObject::ExpGetObjectX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    if ( exprInstruction.parameters.size() > 1 )
    {
        std::ostringstream renvoinum;

        return GetCurrentSprite().TransformToGlobal(
                    sf::Vector2f(
                        GetCurrentSpriteDatas().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX(),
                        GetCurrentSpriteDatas().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY()
                    )).x;
    }

    return GetX();
}

double SpriteObject::ExpGetObjectY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    if ( exprInstruction.parameters.size() > 1 )
    {
        return GetCurrentSprite().TransformToGlobal(
                    sf::Vector2f(
                        GetCurrentSpriteDatas().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetX(),
                        GetCurrentSpriteDatas().GetPoint(exprInstruction.parameters[1].GetPlainString()).GetY()
                    )).y;
    }

    return GetY();
}

double SpriteObject::ExpGetObjectDirection( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetDirectionNb();
}

double SpriteObject::ExpGetObjectSpriteNb( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetSpriteNb();
}

double SpriteObject::ExpGetObjectAnimationNb( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetAnimationNb();
}

double Object::ExpGetObjectTotalForceX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceX();
}

double Object::ExpGetObjectTotalForceY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceY();
}

double Object::ExpGetObjectTotalForceAngle( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceAngle();
}

double Object::ExpGetObjectTotalForceLength( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return TotalForceLength();
}

double Object::ExpGetObjectWidth( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetWidth();
}

double Object::ExpGetObjectHeight( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetHeight();
}

double SpriteObject::ExpGetObjectScaleX( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetScaleX();
}

double SpriteObject::ExpGetObjectScaleY( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetScaleY();
}

double Object::ExpGetObjectZOrder( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    return GetZOrder();
}

double Object::ExpGetObjectVariableValue( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    int varId = variablesObjet.FindVariable(exprInstruction.parameters[1].GetPlainString());
    double varValue = varId != -1 ? variablesObjet.variables[varId].Getvalue() : 0;

    return varValue;
}

double Object::ExpGetDistanceBetweenObjects( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    ObjSPtr object2 = boost::shared_ptr<Object>( );
    ObjList list2 = objectsConcerned->Pick( exprInstruction.parameters[1].GetPlainString() );

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

        return gpl::sqrt(X*X+Y*Y); // Pythagore
    }
    return 0;
}

double Object::ExpGetSqDistanceBetweenObjects( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )
{
    ObjSPtr object2 = boost::shared_ptr<Object>( );
    ObjList list2 = objectsConcerned->Pick( exprInstruction.parameters[1].GetPlainString() );

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

/**
 * Return the table containing the mapping between expressions name and functions
 */
const std::map<std::string, double (Object::*)( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )> &
GetExpObjectBuiltinTable()
{
    static std::map<std::string, double (Object::*)( const RuntimeScene * scene, ObjectsConcerned * objectsConcerned, ObjSPtr obj1, ObjSPtr obj2, const ExpressionInstruction & exprInstruction )> expObjectBuiltinTable;
    if ( expObjectBuiltinTable.empty() )
    {
        //expObjectBuiltinTable["x"]            = &Object::ExpGetObjectX;
        //expObjectBuiltinTable["y"]            = &Object::ExpGetObjectY;
        //expObjectBuiltinTable["forceX"]       = &Object::ExpGetObjectTotalForceX;
        //expObjectBuiltinTable["forceY"]       = &Object::ExpGetObjectTotalForceY;
        //expObjectBuiltinTable["angle"]        = expObjectBuiltinTable["forceAngle"]     = &Object::ExpGetObjectTotalForceAngle;
        //expObjectBuiltinTable["longueur"]     = expObjectBuiltinTable["forceLength"]    = &Object::ExpGetObjectTotalForceLength;
        //expObjectBuiltinTable["largeur"]      = expObjectBuiltinTable["width"]          = &Object::ExpGetObjectWidth;
        //expObjectBuiltinTable["hauteur"]      = expObjectBuiltinTable["height"]         = &Object::ExpGetObjectHeight;
        //expObjectBuiltinTable["plan"]         = expObjectBuiltinTable["zOrder"]         = &Object::ExpGetObjectZOrder;
        //expObjectBuiltinTable["distance"]     = &Object::ExpGetDistanceBetweenObjects;
        //expObjectBuiltinTable["sqDistance"]   = &Object::ExpGetSqDistanceBetweenObjects;
    }

    return expObjectBuiltinTable;
}
