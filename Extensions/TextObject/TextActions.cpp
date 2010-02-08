#include "TextObject.h"
#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/StdAlgo.h"


/**
 * Change the string
 */
bool TextObject::ActString( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter(2).GetAsModOperator() == GDExpression::Set )
        text.SetString( eval.EvalTxt(action.GetParameter(1), shared_from_this()) );
    else if ( action.GetParameter(2).GetAsModOperator() == GDExpression::Add )
        text.SetString( string(text.GetString()) + eval.EvalTxt(action.GetParameter(1), shared_from_this()) );

    return true;
}

bool TextObject::ActFont( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    SetFont(eval.EvalTxt(action.GetParameter(1), shared_from_this()));

    return true;
}


bool TextObject::ActSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetCharacterSize( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetCharacterSize( GetCharacterSize() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetCharacterSize( GetCharacterSize() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetCharacterSize( GetCharacterSize() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetCharacterSize( GetCharacterSize() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}


/**
 * Modify opacity
 */
bool TextObject::ActOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOpacity( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOpacity( GetOpacity() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOpacity( GetOpacity() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOpacity( GetOpacity() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOpacity( GetOpacity() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

/**
 * Change the color of the texte
 */
bool TextObject::ActChangeColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < string > colors = SpliterStringToVector <string> (eval.EvalTxt(action.GetParameter(1), shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    colorR = toInt(colors[0]);
    colorG = toInt(colors[1]);
    colorB = toInt(colors[2]);

    return true;
}


/**
 * Modify angle
 */
bool TextObject::ActAngle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetAngle( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetAngle( GetAngle() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetAngle( GetAngle() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetAngle( GetAngle() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetAngle( GetAngle() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}
