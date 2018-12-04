/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
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
 * Code is output in a C-like/JavaScript compatible syntax.
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionCodeGenerator : public ExpressionParser2NodeWorker {
 public:
  ExpressionCodeGenerator(EventsCodeGenerator& codeGenerator_,
                          EventsCodeGenerationContext& context_)
      : codeGenerator(codeGenerator_), context(context_){};
  virtual ~ExpressionCodeGenerator(){};

  const gd::String& GetOutput() { return output; };

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override;
  void OnVisitOperatorNode(OperatorNode& node) override;
  void OnVisitNumberNode(NumberNode& node) override;
  void OnVisitTextNode(TextNode& node) override;
  void OnVisitVariableNode(VariableNode& node) override;
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override;
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override;
  void OnVisitIdentifierNode(IdentifierNode& node) override;
  void OnVisitFunctionNode(FunctionNode& node) override;
  void OnVisitEmptyNode(EmptyNode& node) override;

 private:
  gd::String GenerateFreeFunctionCode(
      const std::vector<std::unique_ptr<ExpressionNode>> & parameters,
      const ExpressionMetadata& expressionMetadata);
  gd::String GenerateObjectFunctionCode(
      const gd::String& type,
      const gd::String& objectName,
      const std::vector<std::unique_ptr<ExpressionNode>> & parameters,
      const ExpressionMetadata& expressionMetadata);
  gd::String GenerateBehaviorFunctionCode(
      const gd::String& type,
      const gd::String& objectName,
      const gd::String& behaviorName,
      const std::vector<std::unique_ptr<ExpressionNode>> & parameters,
      const ExpressionMetadata& expressionMetadata);
  gd::String GenerateParametersCodes(
      const std::vector<std::unique_ptr<ExpressionNode>> & parameters,
      const ExpressionMetadata& expressionMetadata,
      size_t initialParameterIndex);
  gd::String GenerateDefaultValue(const gd::String & type);

  gd::String output;
  EventsCodeGenerator& codeGenerator;
  EventsCodeGenerationContext& context;
};

}  // namespace gd

#endif  // GDCORE_ExpressionCodeGenerator_H
