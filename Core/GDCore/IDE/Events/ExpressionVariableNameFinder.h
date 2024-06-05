/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"

namespace gd {

/**
 * \brief Find the variable name from a variable expression.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariableNameFinder : public ExpressionParser2NodeWorker {
 public:

  static const gd::String GetVariableName(gd::ExpressionNode& node) {
    gd::ExpressionVariableNameFinder typeFinder;
    node.Visit(typeFinder);
    return typeFinder.variableName;
  }

  virtual ~ExpressionVariableNameFinder(){};

 protected:
  ExpressionVariableNameFinder()
      : variableName("") {};

  void OnVisitSubExpressionNode(SubExpressionNode& node) override {}
  void OnVisitOperatorNode(OperatorNode& node) override {}
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {}
  void OnVisitNumberNode(NumberNode& node) override {}
  void OnVisitTextNode(TextNode& node) override {}
  void OnVisitVariableNode(VariableNode& node) override {
    variableName = node.name;
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {}
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    variableName = node.identifierName;
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode& functionCall) override {}

 private:
  gd::String variableName;
};

}  // namespace gd
