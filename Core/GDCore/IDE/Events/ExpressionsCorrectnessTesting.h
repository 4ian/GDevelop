/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_EXPRESSIONSCORRECTNESSTESTING_H
#define GDCORE_EXPRESSIONSCORRECTNESSTESTING_H

#include <vector>
#include "GDCore/String.h"
#include "GDCore/Events/Parsers/ExpressionParser.h"
namespace gd { class ExpressionMetadata; }
namespace gd { class Expression; }
namespace gd { class Project; }
namespace gd { class Layout; }

namespace gd
{

/**
 * \brief Parser callbacks used to check expressions correctness
 *
 * Usage example:
 * \code
 * gd::CallbacksForExpressionCorrectnessTesting callbacks(game, scene);
 * gd::ExpressionParser expressionParser(expression);
 * if ( !expressionParser.ParseMathExpression(game, scene, callbacks) )
 *     //Expression is not valid
 * else
 *     //Expression is correct
 * \endcode
 *
 * \see gd::ExpressionParser
 * \see gd::ParserCallbacks
 *
 * \ingroup IDE
 */
class GD_CORE_API CallbacksForExpressionCorrectnessTesting : public gd::ParserCallbacks
{
public:

    CallbacksForExpressionCorrectnessTesting(const gd::Project & project, const gd::Layout & layout);
    virtual ~CallbacksForExpressionCorrectnessTesting() {};

    void OnConstantToken(gd::String text) {};
    void OnStaticFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) {};
    void OnObjectFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) {};
    void OnObjectBehaviorFunction(gd::String functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) {};
    bool OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);
    bool OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);

private:
    const gd::Project & project;
    const gd::Layout & layout;
};

}

#endif // GDCORE_EXPRESSIONSCORRECTNESSTESTING_H
