/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EXPRESSIONSCODEGENERATION_H
#define EXPRESSIONSCODEGENERATION_H

#include <vector>
#include "GDCore/Events/Parsers/ExpressionParser.h"
#include "GDCore/String.h"
namespace gd {
class ExpressionMetadata;
}
namespace gd {
class Expression;
}
namespace gd {
class Project;
}
namespace gd {
class Layout;
}
namespace gd {
class Layout;
}
namespace gd {
class EventsCodeGenerationContext;
}
namespace gd {
class EventsCodeGenerator;
}

namespace gd {

/**
 * \brief Used to generate code from expressions.
 *
 * Usage example :
 * \code
 *   gd::String expressionOutputCppCode;
 *
 *   CallbacksForGeneratingExpressionCode callbacks(expressionOutputCppCode,
 * codeGenerator, context); gd::ExpressionParser
 * parser(theOriginalGameDevelopExpression);
 *   parser.ParseStringExpression(platform, project, scene, callbacks);
 *
 *   if (expressionOutputCppCode.empty()) expressionOutputCppCode = "\"\""; //If
 * generation failed, we make sure output code is not empty. \endcode \see
 * EventsCodeGenerator
 */
class GD_CORE_API CallbacksForGeneratingExpressionCode
    : public gd::ParserCallbacks {
 public:
  CallbacksForGeneratingExpressionCode(gd::String& output,
                                       EventsCodeGenerator& codeGenerator_,
                                       EventsCodeGenerationContext& context_);
  virtual ~CallbacksForGeneratingExpressionCode(){};

  void OnConstantToken(gd::String text);
  void OnStaticFunction(gd::String functionName,
                        const std::vector<gd::Expression>& parameters,
                        const gd::ExpressionMetadata& expressionInfo);
  void OnObjectFunction(gd::String functionName,
                        const std::vector<gd::Expression>& parameters,
                        const gd::ExpressionMetadata& expressionInfo);
  void OnObjectBehaviorFunction(gd::String functionName,
                                const std::vector<gd::Expression>& parameters,
                                const gd::ExpressionMetadata& expressionInfo);
  bool OnSubMathExpression(const gd::Platform& platform,
                           const gd::ClassWithObjects& project,
                           const gd::ClassWithObjects& layout,
                           gd::Expression& expression);
  bool OnSubTextExpression(const gd::Platform& platform,
                           const gd::ClassWithObjects& project,
                           const gd::ClassWithObjects& layout,
                           gd::Expression& expression);

 private:
  gd::String& plainExpression;
  EventsCodeGenerator& codeGenerator;
  EventsCodeGenerationContext& context;
};

}  // namespace gd

#endif  // EXPRESSIONSCODEGENERATION_H
