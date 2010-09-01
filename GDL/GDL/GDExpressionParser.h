#ifndef GDEXPRESSIONPARSER_H
#define GDEXPRESSIONPARSER_H

#include <string>
#include <vector>
class GDExpression;
class ConstantTokenFunctor;
class StaticFunctionFunctor;
class ObjectFunctionFunctor;
class AutomatismFunctionFunctor;
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
        bool ParseMathExpression(const Game & game, const Scene & scene,
                                 ConstantTokenFunctor & constantTokenFunctor,
                                 StaticFunctionFunctor & staticFunctionFunctor,
                                 ObjectFunctionFunctor & objectFunctionFunctor,
                                 AutomatismFunctionFunctor & automatismFunctionFunctor);

        /**
         * Parse the expression, calling each functor when necessary
         * \return True if expression was correctly parsed.
         */
        bool ParseTextExpression(const Game & game, const Scene & scene,
                                 ConstantTokenFunctor & constantTokenFunctor,
                                 StaticFunctionFunctor & staticFunctionFunctor,
                                 ObjectFunctionFunctor & objectFunctionFunctor,
                                 AutomatismFunctionFunctor & automatismFunctionFunctor);


        #if defined(GDE)
        std::string firstErrorStr;
        size_t firstErrorPos;
        #endif

    private:

        /**
         * Tool function to add a parameter
         */
        bool AddParameterToList(const Game & game, const Scene & scene, std::vector < GDExpression > & parameters, std::string parameterStr, std::vector < ParameterInfo > parametersInfos, const size_t positionInExpression);

        /**
         * Tool function to prepare a parameter
         */
        bool PrepareParameter(const Game & game, const Scene & scene, GDExpression & parameter, const ParameterInfo & parametersInfo, const size_t positionInExpression);

        std::string expressionPlainString;
};

class ConstantTokenFunctor
{
    public:

    ConstantTokenFunctor() {};
    virtual ~ConstantTokenFunctor() {};

    virtual void operator()(std::string text){};
};

class StaticFunctionFunctor
{
    public:

    StaticFunctionFunctor() {};
    virtual ~StaticFunctionFunctor() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction){};
    virtual void operator()(std::string functionName, const StrExpressionInstruction & instruction){};
};

class ObjectFunctionFunctor
{
    public:

    ObjectFunctionFunctor() {};
    virtual ~ObjectFunctionFunctor() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction){};
    virtual void operator()(std::string functionName, const StrExpressionInstruction & instruction){};
};

class AutomatismFunctionFunctor
{
    public:

    AutomatismFunctionFunctor() {};
    virtual ~AutomatismFunctionFunctor() {};

    virtual void operator()(std::string functionName, const ExpressionInstruction & instruction){};
    virtual void operator()(std::string functionName, const StrExpressionInstruction & instruction){};
};

#endif // GDEXPRESSIONPARSER_H
