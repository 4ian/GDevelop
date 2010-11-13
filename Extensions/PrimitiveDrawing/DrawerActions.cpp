/**

Game Develop - Primitive Drawing Extension
Copyright (c) 2008-2010 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/


#include "GDL/Instruction.h"
#include "GDL/ObjectsConcerned.h"
#include "GDL/RuntimeScene.h"
#include "GDL/CommonTools.h"
#include "DrawerObject.h"

bool DrawerObject::ActOutlineSize( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOutlineSize( static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOutlineSize( GetOutlineSize() + static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOutlineSize( GetOutlineSize() - static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOutlineSize( GetOutlineSize() * static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOutlineSize( GetOutlineSize() / static_cast<int>(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())));

    return true;
}

/**
 * Modify fill color opacity
 */
bool DrawerObject::ActFillOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetFillOpacity( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetFillOpacity( GetFillOpacity() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetFillOpacity( GetFillOpacity() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetFillOpacity( GetFillOpacity() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetFillOpacity( GetFillOpacity() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}

/**
 * Modify opacity
 */
bool DrawerObject::ActOutlineOpacity( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Set )
        SetOutlineOpacity( action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Add )
        SetOutlineOpacity( GetOutlineOpacity() + action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Substract )
        SetOutlineOpacity( GetOutlineOpacity() - action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Multiply )
        SetOutlineOpacity( GetOutlineOpacity() * action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));
    else if ( action.GetParameter( 2 ).GetAsModOperator() == GDExpression::Divide )
        SetOutlineOpacity( GetOutlineOpacity() / action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()));

    return true;
}

/**
 * Change the fill color
 */
bool DrawerObject::ActFillColor( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    vector < string > colors = SpliterStringToVector <string> (action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    fillColorR = ToInt(colors[0]);
    fillColorG = ToInt(colors[1]);
    fillColorB = ToInt(colors[2]);

    return true;
}

/**
 * Change the color of the outline
 */
bool DrawerObject::ActOutlineColor( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    vector < string > colors = SpliterStringToVector <string> (action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned, shared_from_this()), ';');

    if ( colors.size() < 3 ) return false; //La couleur est incorrecte

    outlineColorR = ToInt(colors[0]);
    outlineColorG = ToInt(colors[1]);
    outlineColorB = ToInt(colors[2]);

    return true;
}

bool DrawerObject::ActRectangle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    float x = action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());
    float y = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this());

    shapesToDraw.push_back(sf::Shape::Rectangle(x+Xgap,
                                                y+Ygap,
                                                action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())-x+Xgap,
                                                action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())-y+Ygap,
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool DrawerObject::ActLine( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Line(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())+Xgap,
                                                action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())+Ygap,
                                                action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())+Xgap,
                                                action.GetParameter( 4 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())+Ygap,
                                                action.GetParameter( 5 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()),
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool DrawerObject::ActCircle( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    float Xgap = absoluteCoordinates ? 0 : GetX();
    float Ygap = absoluteCoordinates ? 0 : GetY();

    shapesToDraw.push_back(sf::Shape::Circle(action.GetParameter( 1 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())+Xgap,
                                                action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this())+Ygap,
                                                action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned, shared_from_this()),
                                                sf::Color(fillColorR, fillColorG, fillColorB, fillOpacity),
                                                outlineSize,
                                                sf::Color(outlineColorR, outlineColorG, outlineColorB, outlineOpacity)
                                                ));

    return true;
}

bool ActCopyImageOnAnother( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    std::string destName = action.GetParameter(0).GetAsTextExpressionResult(scene, objectsConcerned);
    if ( !scene.game->imageManager->HasImage(destName) ) return false;
    boost::shared_ptr<sf::Image> dest = scene.game->imageManager->GetSFMLImage(destName);

    std::string srcName = action.GetParameter(1).GetAsTextExpressionResult(scene, objectsConcerned);
    if ( !scene.game->imageManager->HasImage(srcName) ) return false;

    //Make sure the coordinates are correct.
    int destX = action.GetParameter( 2 ).GetAsMathExpressionResult(scene, objectsConcerned);
    if ( destX < 0 || static_cast<unsigned>(destX) >= dest->GetWidth()) return false;

    int destY = action.GetParameter( 3 ).GetAsMathExpressionResult(scene, objectsConcerned);
    if ( destY < 0 || static_cast<unsigned>(destY) >= dest->GetWidth()) return false;

    dest->Copy(*scene.game->imageManager->GetSFMLImage(srcName), destX, destY);

    return true;
}
