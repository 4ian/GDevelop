/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/ExpressionsCorrectnessTesting.h"
#include "GDL/GDExpressionParser.h"
#include "GDL/CommonTools.h"
#include "GDL/Scene.h"
#include "GDL/Game.h"

using namespace std;

CallbacksForExpressionCorrectnessTesting::CallbacksForExpressionCorrectnessTesting(const Game & game_, const Scene & scene_) :
    game(game_),
    scene(scene_)
{

}

bool CallbacksForExpressionCorrectnessTesting::OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression)
{
    CallbacksForExpressionCorrectnessTesting callbacks(game, scene);

    GDExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseMathExpression(game, scene, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    return true;
}

bool CallbacksForExpressionCorrectnessTesting::OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression)
{
    CallbacksForExpressionCorrectnessTesting callbacks(game, scene);

    GDExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseTextExpression(game, scene, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    return true;
}
