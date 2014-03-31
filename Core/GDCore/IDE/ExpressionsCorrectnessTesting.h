/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_EXPRESSIONSCORRECTNESSTESTING_H
#define GDCORE_EXPRESSIONSCORRECTNESSTESTING_H

#include <vector>
#include <string>
#include "GDCore/Events/ExpressionParser.h"
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
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

    void OnOperator(std::string text) {};
    void OnNumber(std::string text) {};
    void OnConstantToken(std::string text) {};
    void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) {};
    void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo) {};
    void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) {};
    void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo) {};
    void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) {};
    void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo) {};
    bool OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);
    bool OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);

private :
    const gd::Project & project;
    const gd::Layout & layout;
};

}

#endif // GDCORE_EXPRESSIONSCORRECTNESSTESTING_H
