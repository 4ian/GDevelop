/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONAUTOCOMPLETIONPROVIDER_H
#define GDCORE_EXPRESSIONAUTOCOMPLETIONPROVIDER_H

#include <memory>
#include <vector>
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/IDE/Events/ExpressionNodeLocationFinder.h"
namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief Describe completions to be shown to the user.
 *
 * The IDE is responsible for actually *searching* and showing the completions -
 * this is only describing what must be listed.
 */
struct ExpressionCompletionDescription {
 public:
  /**
   * The different kind of completions that can be described.
   */
  enum CompletionKind {
    Object,
    Behavior,
    Expression,
    Variable,
  };

  /**
   * \brief Create a completion for an object with the given prefix
   */
  static ExpressionCompletionDescription ForObject(const gd::String& prefix_) {
    return ExpressionCompletionDescription(Object, "", prefix_);
  }

  /**
   * \brief Create a completion for a behavior with the given prefix of
   * the specified object
   */
  static ExpressionCompletionDescription ForBehavior(
      const gd::String& prefix_, const gd::String& objectName_) {
    return ExpressionCompletionDescription(Behavior, "", prefix_, objectName_);
  }

  /**
   * \brief Create a completion for a variable with the given prefix
   */
  static ExpressionCompletionDescription ForVariable(
      const gd::String& prefix_) {
    return ExpressionCompletionDescription(Variable, "", prefix_);
  }
  /**
   * \brief Create a completion for an expression (free, object or behavior
   * expression) with the given prefix
   */
  static ExpressionCompletionDescription ForExpression(
      const gd::String& type_,
      const gd::String& prefix_,
      const gd::String& objectName_ = "",
      const gd::String& behaviorName_ = "") {
    return ExpressionCompletionDescription(
        Expression, type_, prefix_, objectName_, behaviorName_);
  }

  /** Check if two description of completions are equal */
  bool operator==(const ExpressionCompletionDescription& other) const {
    return completionKind == other.completionKind && type == other.type &&
           prefix == other.prefix && objectName == other.objectName &&
           behaviorName == other.behaviorName;
  };

  /** \brief Return the kind of the completion */
  CompletionKind GetCompletionKind() const { return completionKind; }

  /**
   * \brief Return the type of the completion (same type as types supported in
   * expressions)
   * (in other words, for expression this is the type of what must be returned).
   */
  const gd::String& GetType() const { return type; }

  /**
   * \brief Return the prefix currently entered and that must be completed.
   */
  const gd::String& GetPrefix() const { return prefix; }

  /**
   * \brief Return the object name, if completing an object expression or a
   * behavior.
   */
  const gd::String& GetObjectName() const { return objectName; }

  /**
   * \brief Return the behavior name, if completing an object behavior
   * expression.
   *
   * \warning If completing a behavior, the behavior (partial) name is returned
   * by `GetPrefix`.
   */
  const gd::String& GetBehaviorName() const { return behaviorName; }

  /** Default constructor, only to be used by Emscripten bindings. */
  ExpressionCompletionDescription() : completionKind(Object){};

 private:
  ExpressionCompletionDescription(CompletionKind completionKind_,
                                  const gd::String& type_,
                                  const gd::String& prefix_,
                                  const gd::String& objectName_ = "",
                                  const gd::String& behaviorName_ = "")
      : completionKind(completionKind_),
        type(type_),
        prefix(prefix_),
        objectName(objectName_),
        behaviorName(behaviorName_) {}

  CompletionKind completionKind;
  gd::String type;
  gd::String prefix;
  gd::String objectName;
  gd::String behaviorName;
};

/**
 * \brief Turn an ExpressionCompletionDescription to a string.
 */
std::ostream& operator<<(std::ostream& os,
                         ExpressionCompletionDescription const& value) {
  os << "{ " << value.GetCompletionKind() << ", " << value.GetType() << ", "
     << value.GetPrefix() << ", " << value.GetObjectName() << ", "
     << value.GetBehaviorName() << " }";
  return os;
}

/**
 * \brief Returns the list of completion descriptions for an expression node.
 *
 * \see gd::ExpressionCompletionDescription
 */
class GD_CORE_API ExpressionCompletionFinder
    : public ExpressionParser2NodeWorker {
 public:
  /**
   * \brief Given the expression, find the node at the specified location
   * and returns completions for it.
   */
  static std::vector<ExpressionCompletionDescription>
  GetCompletionDescriptionsFor(gd::ExpressionNode& node, size_t location) {
    gd::ExpressionNode* nodeAtLocation =
        gd::ExpressionNodeLocationFinder::GetNodeAtPosition(node, location);

    if (nodeAtLocation == nullptr) {
      std::vector<ExpressionCompletionDescription> emptyCompletions;
      return emptyCompletions;
    }

    gd::ExpressionCompletionFinder autocompletionProvider;
    nodeAtLocation->Visit(autocompletionProvider);
    return autocompletionProvider.GetCompletionDescriptions();
  }

  /**
   * \brief Return the completions found for the visited node.
   */
  const std::vector<ExpressionCompletionDescription>&
  GetCompletionDescriptions() {
    return completions;
  };

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    completions.push_back(ExpressionCompletionDescription::ForObject(""));
    completions.push_back(
        ExpressionCompletionDescription::ForExpression(node.type, ""));
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    completions.push_back(ExpressionCompletionDescription::ForObject(""));
    completions.push_back(
        ExpressionCompletionDescription::ForExpression(node.type, ""));
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    completions.push_back(ExpressionCompletionDescription::ForObject(""));
    completions.push_back(
        ExpressionCompletionDescription::ForExpression(node.type, ""));
  }
  void OnVisitNumberNode(NumberNode& node) override {
    // No completions
  }
  void OnVisitTextNode(TextNode& node) override {
    // No completions
  }
  void OnVisitVariableNode(VariableNode& node) override {
    completions.push_back(
        ExpressionCompletionDescription::ForVariable(node.name));
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    // No completions
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    // No completions
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    if (gd::ParameterMetadata::IsObject(node.type)) {
      // Only show completions of objects if an object is required
      completions.push_back(
          ExpressionCompletionDescription::ForObject(node.identifierName));
    } else {
      // Show completions for expressions and objects otherwise.
      completions.push_back(
          ExpressionCompletionDescription::ForObject(node.identifierName));
      completions.push_back(ExpressionCompletionDescription::ForExpression(
          node.type, node.identifierName));
    }
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    if (!node.behaviorFunctionName.empty()) {
      completions.push_back(ExpressionCompletionDescription::ForExpression(
          node.type,
          node.behaviorFunctionName,
          node.objectName,
          node.objectFunctionOrBehaviorName));
    } else {
      completions.push_back(ExpressionCompletionDescription::ForBehavior(
          node.objectFunctionOrBehaviorName, node.objectName));
      completions.push_back(ExpressionCompletionDescription::ForExpression(
          node.type, node.objectFunctionOrBehaviorName, node.objectName));
    }
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    completions.push_back(ExpressionCompletionDescription::ForExpression(
        node.type, node.functionName, node.objectName, node.behaviorName));
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    completions.push_back(
        ExpressionCompletionDescription::ForObject(node.text));
    completions.push_back(
        ExpressionCompletionDescription::ForExpression(node.type, node.text));
  }

 private:
  std::vector<ExpressionCompletionDescription> completions;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONAUTOCOMPLETIONPROVIDER_H
