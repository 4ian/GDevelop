/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONPARSER2NODES_H
#define GDCORE_EXPRESSIONPARSER2NODES_H

#include <memory>
#include <vector>
#include "ExpressionParser2NodeWorker.h"
#include "GDCore/String.h"
namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief A diagnostic that can be attached to a gd::ExpressionNode.
 */
struct ExpressionParserDiagnostic {
  virtual bool IsError() { return false; }
  virtual const gd::String &GetMessage() { return noMessage; }
  virtual size_t GetStartPosition() { return 0; }
  virtual size_t GetEndPosition() { return 0; }

 private:
  static gd::String noMessage;
};

/**
 * \brief An error that can be attached to a gd::ExpressionNode.
 */
struct ExpressionParserError : public ExpressionParserDiagnostic {
  ExpressionParserError(const gd::String &type_,
                        const gd::String &message_,
                        size_t position_)
      : type(type_),
        message(message_),
        startPosition(position_),
        endPosition(position_){};
  ExpressionParserError(const gd::String &type_,
                        const gd::String &message_,
                        size_t startPosition_,
                        size_t endPosition_)
      : type(type_),
        message(message_),
        startPosition(startPosition_),
        endPosition(endPosition_){};
  virtual ~ExpressionParserError(){};

  bool IsError() override { return true; }
  const gd::String &GetMessage() override { return message; }
  size_t GetStartPosition() override { return startPosition; }
  size_t GetEndPosition() override { return endPosition; }

 private:
  gd::String type;  // TODO: Enumify the error type?
  gd::String message;
  size_t startPosition;
  size_t endPosition;
};

/**
 * \brief The base node, from which all nodes in the tree of
 * an expression inherits from.
 */
struct ExpressionNode {
  virtual ~ExpressionNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker){};

  std::unique_ptr<ExpressionParserDiagnostic> diagnostic;
};

struct SubExpressionNode : public ExpressionNode {
  SubExpressionNode(std::unique_ptr<ExpressionNode> expression_)
      : expression(std::move(expression_)){};
  virtual ~SubExpressionNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitSubExpressionNode(*this);
  };

  std::unique_ptr<ExpressionNode> expression;
};

/**
 * \brief An operator node. For example: "lhs + rhs".
 */
struct OperatorNode : public ExpressionNode {
  virtual ~OperatorNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitOperatorNode(*this);
  };

  std::unique_ptr<ExpressionNode> leftHandSide;
  std::unique_ptr<ExpressionNode> rightHandSide;
  gd::String::value_type op;  // TODO: Enumify?
};

/**
 * \brief A number node. For example: "123".
 */
struct NumberNode : public ExpressionNode {
  NumberNode(const gd::String &number_) : number(number_){};
  virtual ~NumberNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitNumberNode(*this);
  };

  gd::String number;
};

/**
 * \brief A text node. For example: "Hello World".
 */
struct TextNode : public ExpressionNode {
  TextNode(const gd::String &text_) : text(text_){};
  virtual ~TextNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitTextNode(*this);
  };

  gd::String text;
};

struct VariableAccessorOrVariableBracketAccessorNode : public ExpressionNode {
  std::unique_ptr<VariableAccessorOrVariableBracketAccessorNode> child;
};

/**
 * \brief A variable, potentially with accessor to its children.
 *
 * Example: MyVariable or MyVariable.MyChildren
 *
 * \see gd::VariableAccessorNode
 * \see gd::VariableBracketAccessorNode
 */
struct VariableNode : public ExpressionNode {
  VariableNode(const gd::String &type_,
               const gd::String &name_,
               const gd::String &objectName_)
      : type(type_), name(name_), objectName(objectName_){};
  virtual ~VariableNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitVariableNode(*this);
  };

  gd::String type;
  gd::String name;
  gd::String objectName;

  std::unique_ptr<VariableAccessorOrVariableBracketAccessorNode>
      child;  // Can be nullptr if no accessor
};

/**
 * \brief A bracket accessor of a variable. Example: MyChild
 * in MyVariable.MyChild
 */
struct VariableAccessorNode
    : public VariableAccessorOrVariableBracketAccessorNode {
  VariableAccessorNode(const gd::String &name_) : name(name_){};
  virtual ~VariableAccessorNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitVariableAccessorNode(*this);
  };

  gd::String name;
};

/**
 * \brief A bracket accessor of a variable. Example: ["MyChild"]
 * (in MyVariable["MyChild"]).
 */
struct VariableBracketAccessorNode
    : public VariableAccessorOrVariableBracketAccessorNode {
  VariableBracketAccessorNode(std::unique_ptr<ExpressionNode> expression_)
      : expression(std::move(expression_)){};
  virtual ~VariableBracketAccessorNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitVariableBracketAccessorNode(*this);
  };

  std::unique_ptr<ExpressionNode> expression;
};

struct IdentifierOrFunctionOrEmptyNode : public ExpressionNode {};

/**
 * \brief An identifier number node. For example: "layer1".
 */
struct IdentifierNode : public IdentifierOrFunctionOrEmptyNode {
  IdentifierNode(const gd::String &identifierName_)
      : identifierName(identifierName_){};
  virtual ~IdentifierNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitIdentifierNode(*this);
  };

  gd::String identifierName;
};

struct FunctionOrEmptyNode : public IdentifierOrFunctionOrEmptyNode {
  virtual ~FunctionOrEmptyNode(){};
  void Visit(ExpressionParser2NodeWorker &worker) override{};
};

/**
 * \brief A function node. For example: "MyExtension::MyFunction(1, 2)".
 */
struct FunctionNode : public FunctionOrEmptyNode {
  FunctionNode(const gd::String &type_,
               std::vector<std::unique_ptr<ExpressionNode>> parameters_,
               const ExpressionMetadata &expressionMetadata_,
               const gd::String &functionName_)
      : type(type_),
        parameters(std::move(parameters_)),
        expressionMetadata(expressionMetadata_),
        functionName(functionName_){};
  FunctionNode(const gd::String &type_,
               const gd::String &objectName_,
               std::vector<std::unique_ptr<ExpressionNode>> parameters_,
               const ExpressionMetadata &expressionMetadata_,
               const gd::String &functionName_)
      : type(type_),
        objectName(objectName_),
        parameters(std::move(parameters_)),
        expressionMetadata(expressionMetadata_),
        functionName(functionName_){};
  FunctionNode(const gd::String &type_,
               const gd::String &objectName_,
               const gd::String &behaviorName_,
               std::vector<std::unique_ptr<ExpressionNode>> parameters_,
               const ExpressionMetadata &expressionMetadata_,
               const gd::String &functionName_)
      : type(type_),
        objectName(objectName_),
        behaviorName(behaviorName_),
        parameters(std::move(parameters_)),
        expressionMetadata(expressionMetadata_),
        functionName(functionName_){};
  virtual ~FunctionNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitFunctionNode(*this);
  };

  gd::String type;  // This could be removed if the type ("string" or "number")
                    // was stored in ExpressionMetadata.
  gd::String objectName;
  gd::String behaviorName;
  std::vector<std::unique_ptr<ExpressionNode>> parameters;
  const ExpressionMetadata &expressionMetadata;
  gd::String functionName;
};

/**
 * \brief An empty node, used when parsing failed/a syntax error was
 * encountered and any other node could not make sense.
 */
struct EmptyNode : public FunctionOrEmptyNode {
  EmptyNode(const gd::String &type_, const gd::String & text_ = "") : type(type_),text(text_){};
  virtual ~EmptyNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitEmptyNode(*this);
  };

  gd::String type;
  gd::String text;
};

}  // namespace gd

#endif