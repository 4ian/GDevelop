/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EXPRESSIONSCORRECTNESSTESTING_H
#define EXPRESSIONSCORRECTNESSTESTING_H

#include <vector>
#include <string>
#include "GDL/GDExpressionParser.h"
class ExpressionInstruction;
class ExpressionInfos;
class StrExpressionInstruction;
class StrExpressionInfos;
class GDExpression;
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
    void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo) {};
    void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo) {};
    void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo) {};
    void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo) {};
    void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo) {};
    void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo) {};
    bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression);
    bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression);


    private :
        const Game & game;
        const Scene & scene;
};

#endif // EXPRESSIONSCORRECTNESSTESTING_H

#endif
