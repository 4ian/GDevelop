#include <vector>
#include <string>
#include <iostream>
#include <sstream>
#include "GDL/Object.h"
#include "GDL/Event.h"
#include "GDL/Chercher.h"
#include "GDL/CommonTools.h"
#include "GDL/Access.h"
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeScene.h"
#include "GDL/ObjectsConcerned.h"

////////////////////////////////////////////////////////////
/// Modifie l'échelle d'un objet
///
/// Type : ChangeScale
/// Paramètre 1 : Objet
/// Paramètre 2 : Taille
/// Paramètre 3 : Signe de la modification
////////////////////////////////////////////////////////////
bool SpriteObject::ActChangeScale( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(newScale);
        SetScaleY(newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()+newScale);
        SetScaleY(GetScaleY()+newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()-newScale);
        SetScaleY(GetScaleY()-newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()*newScale);
        SetScaleY(GetScaleY()*newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()/newScale);
        SetScaleY(GetScaleY()/newScale);
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Modifie la largeur d'un objet
///
/// Type : ChangeScaleWidth
/// Paramètre 1 : Objet
/// Paramètre 2 : Taille
/// Paramètre 3 : Signe de la modification
////////////////////////////////////////////////////////////
bool SpriteObject::ActChangeScaleWidth( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()+newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()-newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()*newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleX(GetScaleX()/newScale);
    }

    return true;
}

////////////////////////////////////////////////////////////
/// Modifie la hauteur d'un objet
///
/// Type : ChangeScaleHeight
/// Paramètre 1 : Objet
/// Paramètre 2 : Taille
/// Paramètre 3 : Signe de la modification
////////////////////////////////////////////////////////////
bool SpriteObject::ActChangeScaleHeight( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleY(newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleY(GetScaleY()+newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleY(GetScaleY()-newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleY(GetScaleY()*newScale);
    }
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
    {
        float newScale = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
        SetScaleY(GetScaleY()/newScale);
    }

    return true;
}
