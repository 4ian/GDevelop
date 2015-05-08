/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONPARSER_H
#define GDCORE_EXPRESSIONPARSER_H

#include <string>
#include <vector>
namespace gd { class Expression; }
namespace gd { class ParserCallbacks; }
namespace gd { class Layout; }
namespace gd { class Project; }
namespace gd { class Platform; }
namespace gd { class ParameterMetadata; }
namespace gd { class ExpressionMetadata; }

namespace gd
{

/** \brief Parse an expression
 *
 * Parse an expression, calling callbacks when a token is reached
 * \see gd::ParserCallbacks
 */
class GD_CORE_API ExpressionParser
{
public:
    ExpressionParser(const std::string & expressionPlainString_);
    virtual ~ExpressionParser() {};

    /**
     * Parse the expression, calling each functor when necessary
     * \return True if expression was correctly parsed.
     */
    bool ParseMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::ParserCallbacks & callbacks);

    /**
     * Parse the expression, calling each functor when necessary
     * \return True if expression was correctly parsed.
     */
    bool ParseStringExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::ParserCallbacks & callbacks);

    std::string firstErrorStr;
    size_t firstErrorPos;

private:

    /**
     * Tool function to add a parameter
     */
    bool AddParameterToList(const gd::Project & project, const gd::Layout & layout, ParserCallbacks &, std::vector < gd::Expression > & parameters, std::string parameterStr, std::vector < gd::ParameterMetadata > parametersInfos, const size_t positionInExpression);

    /**
     * Tool function to prepare a parameter
     */
    bool PrepareParameter(const gd::Platform & platform,const gd::Project & project, const gd::Layout & layout, ParserCallbacks &, gd::Expression & parameter, const gd::ParameterMetadata & parametersInfo, const size_t positionInExpression);

    /**
     * Return the minimal number of parameters which can be used when calling an expression ( i.e. ParametersCount-OptionalParameters-CodeOnlyParameters )
     */
    size_t GetMinimalParametersNumber(const std::vector < gd::ParameterMetadata > & parametersInfos);

    /**
     * Return the maximal number of parameters which can be used when calling an expression ( i.e. ParametersCount-CodeOnlyParameters )
     */
    size_t GetMaximalParametersNumber(const std::vector < gd::ParameterMetadata > & parametersInfos);

    bool ValidSyntax(const std::string & str);

    std::string expressionPlainString;
    static std::string parserSeparators;
};

/** \brief Callbacks called by parser during parsing
 *
 * Parser will call the appropriate functions during parsing, allowing to do special works.
 * \see gd::ExpressionParser
 */
class GD_CORE_API ParserCallbacks
{
    friend class ExpressionParser;
public:

    ParserCallbacks() : returnType("expression") {};
    virtual ~ParserCallbacks() {};

    /**
     * \brief Get the type of the expression for which callbacks are used:
     * "expression" or "string".
     */
    const std::string & GetReturnType() { return returnType; }

    virtual void OnConstantToken(std::string text) = 0;

    virtual void OnStaticFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) = 0;

    virtual void OnObjectFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) = 0;

    virtual void OnObjectAutomatismFunction(std::string functionName, const std::vector<gd::Expression> & parameters, const gd::ExpressionMetadata & expressionInfo) = 0;

    virtual bool OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression) = 0;
    virtual bool OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression) = 0;

    std::string firstErrorStr;
    size_t firstErrorPos;
private:
    /**
     * \brief Set the return type of the expression: Done by ExpressionParser according to
     * which Parse* method is called.
     * \see gd::ExpressionParser
     */
    void SetReturnType(std::string type) { returnType = type; }

    std::string returnType; //The type of the expression ("expression" (default), "string"...)
};

}

#endif // GDEXPRESSIONPARSER_H
