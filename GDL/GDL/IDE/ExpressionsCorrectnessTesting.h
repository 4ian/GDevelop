/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EXPRESSIONSCORRECTNESSTESTING_H
#define EXPRESSIONSCORRECTNESSTESTING_H

#include <vector>
#include <string>
#include "GDCore/Events/ExpressionParser.h"
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
namespace gd { class Expression; }
class Game;
class Scene;

/**
 * Used to check for expressions correctness
 */
class GD_API CallbacksForExpressionCorrectnessTesting : public gd::ParserCallbacks
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
    bool OnSubMathExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);
    bool OnSubTextExpression(const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);

private :
    const gd::Project & project;
    const gd::Layout & layout;
};

#endif // EXPRESSIONSCORRECTNESSTESTING_H

#endif
