/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY)
#ifndef GDCORE_ExpressionCodeGenerator_H
#define GDCORE_ExpressionCodeGenerator_H

#include <memory>
#include <vector>
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/String.h"
namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
class EventsCodeGenerationContext;
class EventsCodeGenerator;
}  // namespace gd

namespace gd {

/**
 * \brief Generate code for a parsed expression.
 *
 * Almost all code generation is dedicated to the gd::EventsCodeGenerator,
 * so that it can be adapted to the target.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionCodeGenerator : public ExpressionParser2NodeWorker {
 public:
  ExpressionCodeGenerator(const gd::String &rootType_,
                          const gd::String &rootObjectName_,
                          EventsCodeGenerator& codeGenerator_,
                          EventsCodeGenerationContext& context_)
      : rootType(rootType_), rootObjectName(rootObjectName_), codeGenerator(codeGenerator_), context(context_){};
  virtual ~ExpressionCodeGenerator(){};

  /**
   * Helper to generate the code for an expression.
   * If expression is invalid, a default generated value is returned (0 for
   * number expression, empty string for strings).
   *
   * \param codeGenerator The code generator to use to output code.
   * \param context The context of the code generation.
   * \param type The type of the expression (see gd::ExpressionParser2).
   * \param expression The expression to parse and generate code for.
   * \param object The object the expression refers too (only for "objectvar"
   * type).
   *
   * \see see gd::ExpressionParser2
   */
  static gd::String GenerateExpressionCode(EventsCodeGenerator& codeGenerator,
                                           EventsCodeGenerationContext& context,
                                           const gd::String& type,
                                           const gd::Expression& expression,
                                           const gd::String& objectName = "");

  const gd::String& GetOutput() { return output; };

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override;
  void OnVisitOperatorNode(OperatorNode& node) override;
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override;
  void OnVisitNumberNode(NumberNode& node) override;
  void OnVisitTextNode(TextNode& node) override;
  void OnVisitVariableNode(VariableNode& node) override;
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override;
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override;
  void OnVisitIdentifierNode(IdentifierNode& node) override;
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override;
  void OnVisitFunctionCallNode(FunctionCallNode& node) override;
  void OnVisitEmptyNode(EmptyNode& node) override;

 private:
  gd::String GenerateFreeFunctionCode(
      const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
      const ExpressionMetadata& expressionMetadata);
  gd::String GenerateObjectFunctionCode(
      const gd::String& type,
      const gd::String& objectName,
      const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
      const ExpressionMetadata& expressionMetadata);
  gd::String GenerateBehaviorFunctionCode(
      const gd::String& type,
      const gd::String& objectName,
      const gd::String& behaviorName,
      const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
      const ExpressionMetadata& expressionMetadata);
  gd::String GenerateParametersCodes(
      const std::vector<std::unique_ptr<ExpressionNode>>& parameters,
      const ExpressionMetadata& expressionMetadata,
      size_t initialParameterIndex);
  gd::String GenerateDefaultValue(const gd::String& type);
  static std::vector<gd::Expression> PrintParameters(
      const std::vector<std::unique_ptr<ExpressionNode>>& parameters);

  gd::String output;
  gd::String objectNameToUseForVariableAccessor;
  EventsCodeGenerator& codeGenerator;
  EventsCodeGenerationContext& context;
  const gd::String rootType;
  const gd::String rootObjectName;
};

}  // namespace gd

#endif  // GDCORE_ExpressionCodeGenerator_H
#endif
