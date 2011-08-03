/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef EXPRESSIONSCODEGENERATION_H
#define EXPRESSIONSCODEGENERATION_H

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
class EventsCodeGenerationContext;

/**
 * \brief Used to generate C++ code from expressions.
 * Usage example :
 * \code
 *   std::string expressionOutputCppCode;
 *
 *   CallbacksForGeneratingExpressionCode callbacks(expressionOutputCppCode, game, scene, context);
 *   GDExpressionParser parser(theOriginalGameDevelopExpression);
 *   parser.ParseTextExpression(game, scene, callbacks);
 *
 *   if (expressionOutputCppCode.empty()) expressionOutputCppCode = "\"\""; //If generation failed, we make sure output code is not empty.
 * \endcode
 * \see EventsCodeGenerator
 */
class GD_API CallbacksForGeneratingExpressionCode : public ParserCallbacks
{
    public:

    CallbacksForGeneratingExpressionCode(std::string & output, const Game & game_, const Scene & scene_, EventsCodeGenerationContext & context_);
    virtual ~CallbacksForGeneratingExpressionCode() {};

    void OnConstantToken(std::string text);
    void OnNumber(std::string text);
    void OnOperator(std::string text);
    void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo);
    void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo);
    void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo);
    void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo);
    void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction, const ExpressionInfos & expressionInfo);
    void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction, const StrExpressionInfos & expressionInfo);
    bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression);
    bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression);


    private :
        std::string & plainExpression;
        const Game & game;
        const Scene & scene;
        EventsCodeGenerationContext & context;
};


#endif // EXPRESSIONSCODEGENERATION_H
