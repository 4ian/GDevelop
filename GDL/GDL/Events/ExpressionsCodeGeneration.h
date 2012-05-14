/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EXPRESSIONSCODEGENERATION_H
#define EXPRESSIONSCODEGENERATION_H

#include <vector>
#include <string>
#include "GDL/IDE/GDExpressionParser.h"
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
namespace gd { class Expression; }
class Game;
class Scene;
class EventsCodeGenerationContext;
class EventsCodeGenerator;

/**
 * \brief Used to generate C++ code from expressions.
 *
 * Usage example :
 * \code
 *   std::string expressionOutputCppCode;
 *
 *   CallbacksForGeneratingExpressionCode callbacks(expressionOutputCppCode, game, scene, codeGenerator, context);
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
    CallbacksForGeneratingExpressionCode(std::string & output, const Game & game_, const Scene & scene_, EventsCodeGenerator & codeGenerator_, EventsCodeGenerationContext & context_);
    virtual ~CallbacksForGeneratingExpressionCode() {};

    void OnConstantToken(std::string text);
    void OnNumber(std::string text);
    void OnOperator(std::string text);
    void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo);
    void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo);
    void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo);
    void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo);
    void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo);
    void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::StrExpressionMetadata & expressionInfo);
    bool OnSubMathExpression(const Game & game, const Scene & scene, gd::Expression & expression);
    bool OnSubTextExpression(const Game & game, const Scene & scene, gd::Expression & expression);

private :
    std::string & plainExpression;
    const Game & game;
    const Scene & scene;
    EventsCodeGenerator & codeGenerator;
    EventsCodeGenerationContext & context;
};


#endif // EXPRESSIONSCODEGENERATION_H
#endif
