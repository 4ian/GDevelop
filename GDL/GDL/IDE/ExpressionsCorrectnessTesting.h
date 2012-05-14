/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EXPRESSIONSCORRECTNESSTESTING_H
#define EXPRESSIONSCORRECTNESSTESTING_H

#include <vector>
#include <string>
#include "GDL/IDE/GDExpressionParser.h"
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
namespace gd { class Expression; }
class Game;
class Scene;

/**
 * Used to check for expressions correctness
 */
class GD_API CallbacksForExpressionCorrectnessTesting : public ParserCallbacks
{
    public:

    CallbacksForExpressionCorrectnessTesting(const Game & game_, const Scene & scene_);
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
    bool OnSubMathExpression(const Game & game, const Scene & scene, gd::Expression & expression);
    bool OnSubTextExpression(const Game & game, const Scene & scene, gd::Expression & expression);


    private :
        const Game & game;
        const Scene & scene;
};

#endif // EXPRESSIONSCORRECTNESSTESTING_H

#endif
