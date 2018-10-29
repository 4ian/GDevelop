/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONVALIDATOR_H
#define GDCORE_EXPRESSIONVALIDATOR_H

#include <memory>
#include <vector>
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief Validate that an expression is properly written by returning
 * any error attached to the nodes during parsing.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionValidator : public ExpressionParser2NodeWorker {
 public:
  ExpressionValidator(){};
  virtual ~ExpressionValidator(){};

  /**
   * \brief Get all the errors
   *
   * No errors means that the expression is valid.
   */
  const std::vector<ExpressionParserDiagnostic*>& GetErrors() {
    return errors;
  };

 protected:
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
    ReportAnyError(node);
    node.rightHandSide->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode& node) override { ReportAnyError(node); }
  void OnVisitTextNode(TextNode& node) override { ReportAnyError(node); }
  void OnVisitVariableNode(VariableNode& node) override {
    ReportAnyError(node);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    ReportAnyError(node);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    ReportAnyError(node);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    ReportAnyError(node);
  }
  void OnVisitFunctionNode(FunctionNode& node) override {
    ReportAnyError(node);
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override { ReportAnyError(node); }

 private:
  void ReportAnyError(ExpressionNode& node) {
    if (node.diagnostic && node.diagnostic->IsError()) {
      errors.push_back(node.diagnostic.get());
    }
  }

  std::vector<ExpressionParserDiagnostic*> errors;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONVALIDATOR_H
