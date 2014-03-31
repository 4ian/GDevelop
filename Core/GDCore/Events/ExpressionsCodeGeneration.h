/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef EXPRESSIONSCODEGENERATION_H
#define EXPRESSIONSCODEGENERATION_H

#include <vector>
#include <string>
#include "GDCore/Events/ExpressionParser.h"
namespace gd { class ExpressionMetadata; }
namespace gd { class StrExpressionMetadata; }
namespace gd { class Expression; }
namespace gd { class Project; }
namespace gd { class Layout; }
namespace gd { class Layout; }
namespace gd { class EventsCodeGenerationContext; }
namespace gd { class EventsCodeGenerator; }

namespace gd
{

/**
 * \brief Used to generate code from expressions.
 *
 * Usage example :
 * \code
 *   std::string expressionOutputCppCode;
 *
 *   CallbacksForGeneratingExpressionCode callbacks(expressionOutputCppCode, codeGenerator, context);
 *   gd::ExpressionParser parser(theOriginalGameDevelopExpression);
 *   parser.ParseStringExpression(platform, project, scene, callbacks);
 *
 *   if (expressionOutputCppCode.empty()) expressionOutputCppCode = "\"\""; //If generation failed, we make sure output code is not empty.
 * \endcode
 * \see EventsCodeGenerator
 */
class GD_CORE_API CallbacksForGeneratingExpressionCode : public gd::ParserCallbacks
{
public:
    CallbacksForGeneratingExpressionCode(std::string & output, EventsCodeGenerator & codeGenerator_, EventsCodeGenerationContext & context_);
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
    bool OnSubMathExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);
    bool OnSubTextExpression(const gd::Platform & platform, const gd::Project & project, const gd::Layout & layout, gd::Expression & expression);

private:
    std::string & plainExpression;
    EventsCodeGenerator & codeGenerator;
    EventsCodeGenerationContext & context;
};

}

#endif // EXPRESSIONSCODEGENERATION_H
