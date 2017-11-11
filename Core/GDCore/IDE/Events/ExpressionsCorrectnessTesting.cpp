/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include "GDCore/IDE/Events/ExpressionsCorrectnessTesting.h"
#include "GDCore/Events/Parsers/ExpressionParser.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/CommonTools.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"

namespace gd
{

CallbacksForExpressionCorrectnessTesting::CallbacksForExpressionCorrectnessTesting(const gd::Project & project_, const gd::Layout & layout_) :
    project(project_),
    layout(layout_)
{
}

bool CallbacksForExpressionCorrectnessTesting::OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
{
    CallbacksForExpressionCorrectnessTesting callbacks(project, layout);

    gd::ExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseMathExpression(platform, project, layout, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.GetFirstError();
        firstErrorPos = callbacks.GetFirstErrorPosition();
        #endif
        return false;
    }

    return true;
}

bool CallbacksForExpressionCorrectnessTesting::OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression)
{
    CallbacksForExpressionCorrectnessTesting callbacks(project, layout);

    gd::ExpressionParser parser(expression.GetPlainString());
    if ( !parser.ParseStringExpression(platform, project, layout, callbacks) )
    {
        #if defined(GD_IDE_ONLY)
        firstErrorStr = callbacks.GetFirstError();
        firstErrorPos = callbacks.GetFirstErrorPosition();
        #endif
        return false;
    }

    return true;
}

}
