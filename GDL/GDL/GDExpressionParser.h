#ifndef GDEXPRESSIONPARSER_H
#define GDEXPRESSIONPARSER_H

#include <string>
#include <vector>
class GDExpression;
class ParserCallbacks;
class Game;
class Scene;
class ParameterInfo;
class ExpressionInstruction;
class StrExpressionInstruction;

/** \brief Parse a plainExpression by calling functors at each token
 *
 * Parse the expression, and call functors when a token is reached
 * ( like a function call )
 */
class GD_API GDExpressionParser
{
    public:
        GDExpressionParser(const std::string & expressionPlainString_) : expressionPlainString(expressionPlainString_) {};
        virtual ~GDExpressionParser() {};

        /**
         * Parse the expression, calling each functor when necessary
         * \return True if expression was correctly parsed.
         */
        bool ParseMathExpression(const Game & game, const Scene & scene, ParserCallbacks & callbacks);

        /**
         * Parse the expression, calling each functor when necessary
         * \return True if expression was correctly parsed.
         */
        bool ParseTextExpression(const Game & game, const Scene & scene, ParserCallbacks & callbacks);


        #if defined(GDE)
        std::string firstErrorStr;
        size_t firstErrorPos;
        #endif

    private:

        /**
         * Tool function to add a parameter
         */
        bool AddParameterToList(const Game & game, const Scene & scene, ParserCallbacks &, std::vector < GDExpression > & parameters, std::string parameterStr, std::vector < ParameterInfo > parametersInfos, const size_t positionInExpression);

        /**
         * Tool function to prepare a parameter
         */
        bool PrepareParameter(const Game & game, const Scene & scene, ParserCallbacks &, GDExpression & parameter, const ParameterInfo & parametersInfo, const size_t positionInExpression);

        std::string expressionPlainString;
};

/** \brief Callbacks called by parser during parsing
 *
 * Parser will call the appropriate functions during parsing, allowing to do special works.
 */
class ParserCallbacks
{
    public:

    ParserCallbacks() {};
    virtual ~ParserCallbacks() {};

    virtual void OnConstantToken(std::string text) = 0;

    virtual void OnStaticFunction(std::string functionName, const ExpressionInstruction & instruction) = 0;
    virtual void OnStaticFunction(std::string functionName, const StrExpressionInstruction & instruction) = 0;

    virtual void OnObjectFunction(std::string functionName, const ExpressionInstruction & instruction) = 0;
    virtual void OnObjectFunction(std::string functionName, const StrExpressionInstruction & instruction) = 0;

    virtual void OnObjectAutomatismFunction(std::string functionName, const ExpressionInstruction & instruction) = 0;
    virtual void OnObjectAutomatismFunction(std::string functionName, const StrExpressionInstruction & instruction) = 0;

    virtual bool OnSubMathExpression(const Game & game, const Scene & scene, GDExpression & expression) = 0;
    virtual bool OnSubTextExpression(const Game & game, const Scene & scene, GDExpression & expression) = 0;
};

#endif // GDEXPRESSIONPARSER_H
