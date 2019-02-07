/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONPARSER2NODEWORKER_H
#define GDCORE_EXPRESSIONPARSER2NODEWORKER_H

namespace gd {
class ExpressionNode;
class SubExpressionNode;
class OperatorNode;
class UnaryOperatorNode;
class NumberNode;
class TextNode;
class VariableNode;
class VariableAccessorNode;
class VariableBracketAccessorNode;
class IdentifierOrFunctionOrEmptyNode;
class IdentifierNode;
class FunctionOrEmptyNode;
class FunctionNode;
class EmptyNode;
}  // namespace gd

namespace gd {

/**
 * \brief The interface for any worker class ("visitor" pattern)
 * that want to interact with the nodes of a parsed expression.
 *
 * \see gd::ExpressionParser2
 * \see gd::ExpressionNode
 */
class GD_CORE_API ExpressionParser2NodeWorker {
  friend class ExpressionNode;
  friend class SubExpressionNode;
  friend class OperatorNode;
  friend class UnaryOperatorNode;
  friend class NumberNode;
  friend class TextNode;
  friend class VariableNode;
  friend class VariableAccessorNode;
  friend class VariableBracketAccessorNode;
  friend class IdentifierOrFunctionOrEmptyNode;
  friend class IdentifierNode;
  friend class FunctionOrEmptyNode;
  friend class FunctionNode;
  friend class EmptyNode;

 public:
  virtual ~ExpressionParser2NodeWorker();

 protected:
  virtual void OnVisitSubExpressionNode(SubExpressionNode& node) = 0;
  virtual void OnVisitOperatorNode(OperatorNode& node) = 0;
  virtual void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) = 0;
  virtual void OnVisitNumberNode(NumberNode& node) = 0;
  virtual void OnVisitTextNode(TextNode& node) = 0;
  virtual void OnVisitVariableNode(VariableNode& node) = 0;
  virtual void OnVisitVariableAccessorNode(VariableAccessorNode& node) = 0;
  virtual void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) = 0;
  virtual void OnVisitIdentifierNode(IdentifierNode& node) = 0;
  virtual void OnVisitFunctionNode(FunctionNode& node) = 0;
  virtual void OnVisitEmptyNode(EmptyNode& node) = 0;
};

}  // namespace gd

#endif