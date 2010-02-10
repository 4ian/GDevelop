#include "GDL/Access.h"
#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/StdAlgo.h"
#include "DrawerObject.h"

bool DrawerObject::ActOutlineSize( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOutlineSize( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOutlineSize( GetOutlineSize() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOutlineSize( GetOutlineSize() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOutlineSize( GetOutlineSize() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOutlineSize( GetOutlineSize() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

/**
 * Modify fill color opacity
 */
bool DrawerObject::ActFillOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetFillOpacity( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetFillOpacity( GetFillOpacity() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetFillOpacity( GetFillOpacity() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetFillOpacity( GetFillOpacity() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetFillOpacity( GetFillOpacity() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

/**
 * Modify opacity
 */
bool DrawerObject::ActOutlineOpacity( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOutlineOpacity( static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOutlineOpacity( GetOutlineOpacity() + static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOutlineOpacity( GetOutlineOpacity() - static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOutlineOpacity( GetOutlineOpacity() * static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOutlineOpacity( GetOutlineOpacity() / static_cast<int>(eval.EvalExp( action.GetParameter( 1 ), shared_from_this())));

    return true;
}

/**
 * Change the fill color
 */
bool DrawerObject::ActFillColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < string > colors = SpliterStringToVector <string> (eval.EvalTxt(action.GetParameter(1), shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    fillColorR = toInt(colors[0]);
    fillColorG = toInt(colors[1]);
    fillColorB = toInt(colors[2]);

    return true;
}

/**
 * Change the color of the outline
 */
bool DrawerObject::ActOutlineColor( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    vector < string > colors = SpliterStringToVector <string> (eval.EvalTxt(action.GetParameter(1), shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    outlineColorR = toInt(colors[0]);
    outlineColorG = toInt(colors[1]);
    outlineColorB = toInt(colors[2]);

    return true;
}

bool DrawerObject::ActRectangle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Rectangle(eval.EvalExp(action.GetParameter(1), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(2), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(3), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(4), shared_from_this())+Ygap,
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool DrawerObject::ActLine( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Line(eval.EvalExp(action.GetParameter(1), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(2), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(3), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(4), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(5), shared_from_this()),
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool DrawerObject::ActCircle( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Circle(eval.EvalExp(action.GetParameter(1), shared_from_this())+Xgap,
                                                eval.EvalExp(action.GetParameter(2), shared_from_this())+Ygap,
                                                eval.EvalExp(action.GetParameter(3), shared_from_this()),
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool ActCopyImageOnAnother( RuntimeScene * scene, ObjectsConcerned & objectsConcerned, const Instruction & action, const Evaluateur & eval )
{
    std::map < string, sf::Image >::iterator dest = scene->game->imageManager.images.find(eval.EvalTxt(action.GetParameter(0)));
    if ( dest == scene->game->imageManager.images.end() ) return false;

    std::map < string, sf::Image >::const_iterator src = scene->game->imageManager.images.find(eval.EvalTxt(action.GetParameter(1)));
    if ( src == scene->game->imageManager.images.end() ) return false;

    //Make sure the coordinates are correct.
    int destX = eval.EvalExp(action.GetParameter(2));
    if ( destX < 0 || static_cast<unsigned>(destX) >= dest->second.GetWidth()) return false;

    int destY = eval.EvalExp(action.GetParameter(3));
    if ( destY < 0 || static_cast<unsigned>(destY) >= dest->second.GetWidth()) return false;

    dest->second.Copy(src->second, destX, destY);

    return true;
}
