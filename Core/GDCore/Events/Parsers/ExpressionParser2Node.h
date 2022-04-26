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
struct FunctionCallNode;
}  // namespace gd

namespace gd {

struct GD_CORE_API ExpressionParserLocation {
  ExpressionParserLocation() : isValid(false){};
  ExpressionParserLocation(size_t position)
      : isValid(true), startPosition(position), endPosition(position){};
  ExpressionParserLocation(size_t startPosition_, size_t endPosition_)
      : isValid(true),
        startPosition(startPosition_),
        endPosition(endPosition_){};
  size_t GetStartPosition() const { return startPosition; }
  size_t GetEndPosition() const { return endPosition; }
  bool IsValid() const { return isValid; }

 private:
  bool isValid;
  size_t startPosition;
  size_t endPosition;
};

struct GD_CORE_API ParentParameter {
  ParentParameter(const FunctionCallNode* function_, int parameterIndex_)
      : function(function_), parameterIndex(parameterIndex_){};

  const FunctionCallNode* function;
  int parameterIndex;
};

/**
 * \brief A diagnostic that can be attached to a gd::ExpressionNode.
 */
struct GD_CORE_API ExpressionParserDiagnostic {
  virtual ~ExpressionParserDiagnostic() = default;
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
struct GD_CORE_API ExpressionParserError : public ExpressionParserDiagnostic {
  ExpressionParserError(const gd::String &type_,
                        const gd::String &message_,
                        size_t position_)
      : type(type_), message(message_), location(position_){};
  ExpressionParserError(const gd::String &type_,
                        const gd::String &message_,
                        size_t startPosition_,
                        size_t endPosition_)
      : type(type_),
        message(message_),
        location(startPosition_, endPosition_){};
  virtual ~ExpressionParserError(){};

  bool IsError() override { return true; }
  const gd::String &GetMessage() override { return message; }
  size_t GetStartPosition() override { return location.GetStartPosition(); }
  size_t GetEndPosition() override { return location.GetEndPosition(); }

 private:
  gd::String type;
  gd::String message;
  ExpressionParserLocation location;
};

/**
 * \brief The base node, from which all nodes in the tree of
 * an expression inherits from.
 */
struct GD_CORE_API ExpressionNode {
  ExpressionNode(const ParentParameter parentParameter_): parentParameter(parentParameter_) {};
  virtual ~ExpressionNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker){};

  const gd::String &GetType(const gd::Platform &platform,
                      const gd::ObjectsContainer &globalObjectsContainer,
                      const gd::ObjectsContainer &objectsContainer,
                      const gd::String &rootType) {

    auto function = parentParameter.function;
    if (function == nullptr) {
      return rootType;
    }

    gd::String objectType = function->objectName.empty() ? gd::String() :
        GetTypeOfObject(globalObjectsContainer, objectsContainer, function->objectName);
        
    gd::String behaviorType = function->behaviorName.empty() ? gd::String() :
        GetTypeOfBehavior(globalObjectsContainer, objectsContainer, function->behaviorName);

    const gd::ExpressionMetadata &metadata = function->behaviorName.empty() ?
        function->objectName.empty() ?
            MetadataProvider::GetAnyExpressionMetadata(platform, function->functionName) :
            MetadataProvider::GetObjectAnyExpressionMetadata(
                platform, objectType, function->functionName) : 
        MetadataProvider::GetBehaviorAnyExpressionMetadata(
              platform, behaviorType, function->functionName);

    if (!function->objectName.empty()) {
      // If the function needs a capability on the object that may not be covered
      // by all objects, check it now.
      if (!metadata.GetRequiredBaseObjectCapability().empty()) {
        const gd::ObjectMetadata &objectMetadata =
            MetadataProvider::GetObjectMetadata(platform, objectType);

        if (objectMetadata.IsUnsupportedBaseObjectCapability(
                metadata.GetRequiredBaseObjectCapability())) {
          return "unknown";
        }
      }
    }

    return metadata.parameters[parentParameter.parameterIndex].GetType();
  }

  std::unique_ptr<ExpressionParserDiagnostic> diagnostic;
  ExpressionParserLocation location;  ///< The location of the entire node. Some
                                      /// nodes might have other locations
                                      /// stored inside them. For example, a
                                      /// function can store the position of the
                                      /// object name, the dot, the function
                                      /// name, etc...
  const ParentParameter parentParameter;
};

struct GD_CORE_API SubExpressionNode : public ExpressionNode {
  SubExpressionNode(const ParentParameter parentParameter_,
                    std::unique_ptr<ExpressionNode> expression_)
      : ExpressionNode(parentParameter_), expression(std::move(expression_)){};
  virtual ~SubExpressionNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitSubExpressionNode(*this);
  };

  std::unique_ptr<ExpressionNode> expression;
};

/**
 * \brief An operator node. For example: "lhs + rhs".
 */
struct GD_CORE_API OperatorNode : public ExpressionNode {
  OperatorNode(const ParentParameter parentParameter_, gd::String::value_type op_)
      : ExpressionNode(parentParameter_), op(op_){};
  virtual ~OperatorNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitOperatorNode(*this);
  };

  std::unique_ptr<ExpressionNode> leftHandSide;
  std::unique_ptr<ExpressionNode> rightHandSide;
  gd::String::value_type op;
};

/**
 * \brief A unary operator node. For example: "-2".
 */
struct GD_CORE_API UnaryOperatorNode : public ExpressionNode {
  UnaryOperatorNode(const ParentParameter parentParameter_, gd::String::value_type op_)
      : ExpressionNode(parentParameter_), op(op_){};
  virtual ~UnaryOperatorNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitUnaryOperatorNode(*this);
  };

  std::unique_ptr<ExpressionNode> factor;
  gd::String::value_type op;
};

/**
 * \brief A number node. For example: "123".
 * Its `type` is always "number".
 */
struct GD_CORE_API NumberNode : public ExpressionNode {
  NumberNode(const ParentParameter parentParameter_, const gd::String &number_)
      : ExpressionNode(parentParameter_), number(number_){};
  virtual ~NumberNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitNumberNode(*this);
  };

  //
  gd::String number;
};

/**
 * \brief A text node. For example: "Hello World".
 * Its `type` is always "string".
 */
struct GD_CORE_API TextNode : public ExpressionNode {
  TextNode(const ParentParameter parentParameter_, const gd::String &text_) : ExpressionNode(parentParameter_), text(text_){};
  virtual ~TextNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitTextNode(*this);
  };

  gd::String text;
};

struct GD_CORE_API IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode
    : public ExpressionNode {
  IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode(
  const ParentParameter parentParameter_)
      : ExpressionNode(parentParameter_){};
};

/**
 * \brief An identifier node, usually representing an object or a variable.
 */
struct GD_CORE_API IdentifierNode
    : public IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode {
  IdentifierNode(
  const ParentParameter parentParameter_, const gd::String &identifierName_)
      : IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter),
        identifierName(identifierName_){};
  virtual ~IdentifierNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitIdentifierNode(*this);
  };

  gd::String identifierName;
};

struct GD_CORE_API FunctionCallOrObjectFunctionNameOrEmptyNode
    : public IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode {
  FunctionCallOrObjectFunctionNameOrEmptyNode(
  const ParentParameter parentParameter_)
      : IdentifierOrFunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_){};
  virtual ~FunctionCallOrObjectFunctionNameOrEmptyNode(){};
  void Visit(ExpressionParser2NodeWorker &worker) override{};
};

struct GD_CORE_API VariableAccessorOrVariableBracketAccessorNode : public ExpressionNode {
  VariableAccessorOrVariableBracketAccessorNode(
      const ParentParameter parentParameter_) : ExpressionNode(parentParameter_){};

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
struct GD_CORE_API VariableNode : public FunctionCallOrObjectFunctionNameOrEmptyNode {
  VariableNode(const ParentParameter parentParameter_,
               const gd::String &type_,
               const gd::String &name_,
               const gd::String &objectName_)
      : FunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_), name(name_), objectName(objectName_){};
  virtual ~VariableNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitVariableNode(*this);
  };

  gd::String name;
  gd::String objectName;

  std::unique_ptr<VariableAccessorOrVariableBracketAccessorNode>
      child;  // Can be nullptr if no accessor

  ExpressionParserLocation nameLocation;
};

/**
 * \brief A bracket accessor of a variable. Example: MyChild
 * in MyVariable.MyChild
 */
struct GD_CORE_API VariableAccessorNode
    : public VariableAccessorOrVariableBracketAccessorNode {
  VariableAccessorNode(const ParentParameter parentParameter_, const gd::String &name_)
      : VariableAccessorOrVariableBracketAccessorNode(parentParameter_), name(name_){};
  virtual ~VariableAccessorNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitVariableAccessorNode(*this);
  };

  gd::String name;
  ExpressionParserLocation nameLocation;
  ExpressionParserLocation dotLocation;
};

/**
 * \brief A bracket accessor of a variable. Example: ["MyChild"]
 * (in MyVariable["MyChild"]).
 */
struct GD_CORE_API VariableBracketAccessorNode
    : public VariableAccessorOrVariableBracketAccessorNode {
  VariableBracketAccessorNode(const ParentParameter parentParameter_, std::unique_ptr<ExpressionNode> expression_)
      : VariableAccessorOrVariableBracketAccessorNode(parentParameter_), expression(std::move(expression_)){};
  virtual ~VariableBracketAccessorNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitVariableBracketAccessorNode(*this);
  };

  std::unique_ptr<ExpressionNode> expression;
};

/**
 * \brief The name of a function to call on an object or the behavior
 * For example: "MyObject.Function" or "MyObject.Physics" or
 * "MyObject.Physics::LinearVelocity".
 */
struct GD_CORE_API ObjectFunctionNameNode
    : public FunctionCallOrObjectFunctionNameOrEmptyNode {
  ObjectFunctionNameNode(const ParentParameter parentParameter_, const gd::String &objectName_,
                         const gd::String &objectFunctionOrBehaviorName_)
      : FunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_),
        objectName(objectName_),
        objectFunctionOrBehaviorName(objectFunctionOrBehaviorName_) {}
  ObjectFunctionNameNode(const ParentParameter parentParameter_, const gd::String &objectName_,
                         const gd::String &behaviorName_,
                         const gd::String &behaviorFunctionName_)
      : FunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_),
        objectName(objectName_),
        objectFunctionOrBehaviorName(behaviorName_),
        behaviorFunctionName(behaviorFunctionName_) {}
  virtual ~ObjectFunctionNameNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitObjectFunctionNameNode(*this);
  };

  gd::String objectName;
  gd::String objectFunctionOrBehaviorName;  ///< Behavior name if
                                            ///`behaviorFunctionName` is not
                                            /// empty.
  gd::String behaviorFunctionName;          ///< If empty, then
                                    /// objectFunctionOrBehaviorName is filled
                                    /// with the behavior name.

  ExpressionParserLocation
      objectNameLocation;  ///< Location of the object name.
  ExpressionParserLocation
      objectNameDotLocation;  ///< Location of the "." after the object name.
  ExpressionParserLocation objectFunctionOrBehaviorNameLocation;  ///< Location
                                                                  /// of object
                                                                  /// function
                                                                  /// name or
                                                                  /// behavior
                                                                  /// name.
  ExpressionParserLocation
      behaviorNameNamespaceSeparatorLocation;  ///< Location of the "::"
                                               /// separator, if any.
  ExpressionParserLocation behaviorFunctionNameLocation;  ///< Location of the
                                                          /// behavior function
                                                          /// name, if any.
};

/**
 * \brief A function call node (either free function, object function or object
 * behavior function).
 * For example: "MyExtension::MyFunction(1, 2)", "MyObject.Function()" or
 * "MyObject.Physics::LinearVelocity()".
 */
struct GD_CORE_API FunctionCallNode : public FunctionCallOrObjectFunctionNameOrEmptyNode {
  /** \brief Construct a free function call node. */
  FunctionCallNode(const ParentParameter parentParameter_,
                   const gd::String &functionName_)
      : FunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_),
        functionName(functionName_){};

  /** \brief Construct an object function call node. */
  FunctionCallNode(const ParentParameter parentParameter_,
                   const gd::String &objectName_,
                   const gd::String &functionName_)
      : FunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_),
        objectName(objectName_),
        functionName(functionName_){};

  /** \brief Construct a behavior function call node. */
  FunctionCallNode(const ParentParameter parentParameter_,
                   const gd::String &objectName_,
                   const gd::String &behaviorName_,
                   const gd::String &functionName_)
      : FunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_),
        objectName(objectName_),
        behaviorName(behaviorName_),
        functionName(functionName_){};
  virtual ~FunctionCallNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitFunctionCallNode(*this);
  };

  gd::String objectName;
  gd::String behaviorName;
  std::vector<std::unique_ptr<ExpressionNode>> parameters;
  gd::String functionName;

  ExpressionParserLocation
      functionNameLocation;  ///< Location of the function name.
  ExpressionParserLocation
      objectNameLocation;  ///< Location of the object name, if any.
  ExpressionParserLocation
      objectNameDotLocation;  ///< Location of the "." after the object name.
  ExpressionParserLocation
      behaviorNameLocation;  ///< Location of the behavior name, if any.
  ExpressionParserLocation
      behaviorNameNamespaceSeparatorLocation;  ///< Location of the "::"
                                               /// separator, if any.
  ExpressionParserLocation
      openingParenthesisLocation;  ///< Location of the "(".
  ExpressionParserLocation
      closingParenthesisLocation;  ///< Location of the ")".
};

/**
 * \brief An empty node, used when parsing failed/a syntax error was
 * encountered and any other node could not make sense.
 */
struct GD_CORE_API EmptyNode : public FunctionCallOrObjectFunctionNameOrEmptyNode {
  EmptyNode(const ParentParameter parentParameter_, const gd::String &text_ = "")
      : FunctionCallOrObjectFunctionNameOrEmptyNode(parentParameter_), text(text_){};
  virtual ~EmptyNode(){};
  virtual void Visit(ExpressionParser2NodeWorker &worker) {
    worker.OnVisitEmptyNode(*this);
  };

  gd::String text;
};

}  // namespace gd

#endif
