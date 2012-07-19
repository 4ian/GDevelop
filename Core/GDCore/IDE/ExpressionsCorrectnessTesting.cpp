/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCore/IDE/ExpressionsCorrectnessTesting.h"
#include "GDCore/Events/ExpressionParser.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/CommonTools.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Project.h"

namespace gd
{

CallbacksForExpressionCorrectnessTesting::CallbacksForExpressionCorrectnessTesting(const gd::Project & project_, const gd::Layout & layout_) :
    project(project_),
    layout(layout_)
{
}

bool CallbacksForExpressionCorrectnessTesting::OnSubMathExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
{
    CallbacksForExpressionCorrectnessTesting callbacks(project, layout);

    gd::ExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseMathExpression(project, layout, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    return true;
}

bool CallbacksForExpressionCorrectnessTesting::OnSubTextExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
{
    CallbacksForExpressionCorrectnessTesting callbacks(project, layout);

    gd::ExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseStringExpression(project, layout, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.firstErrorStr;
        firstErrorPos = callbacks.firstErrorPos;
        #endif
        return false;
    }

    return true;
}

}
