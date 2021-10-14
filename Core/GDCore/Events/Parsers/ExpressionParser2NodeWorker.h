/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONPARSER2NODEWORKER_H
#define GDCORE_EXPRESSIONPARSER2NODEWORKER_H

namespace gd {
struct ExpressionNode;
struct SubExpressionNode;
struct OperatorNode;
struct UnaryOperatorNode;
struct NumberNode;
struct TextNode;
struct VariableNode;
struct VariableAccessorNode;
struct VariableBracketAccessorNode;
struct IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode;
struct IdentifierNode;
struct FunctionCallOrObjectFunctionNameOrEmptyNode;
struct ObjectFunctionNameNode;
struct FunctionCallNode;
struct EmptyNode;
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
  friend struct ExpressionNode;
  friend struct SubExpressionNode;
  friend struct OperatorNode;
  friend struct UnaryOperatorNode;
  friend struct NumberNode;
  friend struct TextNode;
  friend struct VariableNode;
  friend struct VariableAccessorNode;
  friend struct VariableBracketAccessorNode;
  friend struct IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode;
  friend struct IdentifierNode;
  friend struct FunctionCallOrObjectFunctionNameOrEmptyNode;
  friend struct ObjectFunctionNameNode;
  friend struct FunctionCallNode;
  friend struct EmptyNode;

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
  virtual void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) = 0;
  virtual void OnVisitFunctionCallNode(FunctionCallNode& node) = 0;
  virtual void OnVisitEmptyNode(EmptyNode& node) = 0;
};

}  // namespace gd

#endif
