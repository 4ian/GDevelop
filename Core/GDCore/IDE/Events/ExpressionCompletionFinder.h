/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONAUTOCOMPLETIONPROVIDER_H
#define GDCORE_EXPRESSIONAUTOCOMPLETIONPROVIDER_H

#include <memory>
#include <vector>

#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/IDE/Events/ExpressionNodeLocationFinder.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/IDE/Events/ExpressionVariableOwnerFinder.h"

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
struct GD_CORE_API ExpressionCompletionDescription {
 public:
  /**
   * The different kind of completions that can be described.
   */
  enum CompletionKind { Object, Behavior, Expression, Variable, Text };

  /**
   * \brief Create a completion for an object with the given prefix
   */
  static ExpressionCompletionDescription ForObject(
      const gd::String& type_,
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_) {
    return ExpressionCompletionDescription(Object,
                                           type_,
                                           prefix_,
                                           replacementStartPosition_,
                                           replacementEndPosition_);
  }

  /**
   * \brief Create a completion for a behavior with the given prefix of
   * the specified object
   */
  static ExpressionCompletionDescription ForBehavior(
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_,
      const gd::String& objectName_) {
    return ExpressionCompletionDescription(Behavior,
                                           "",
                                           prefix_,
                                           replacementStartPosition_,
                                           replacementEndPosition_,
                                           objectName_);
  }

  /**
   * \brief Create a completion for a variable with the given prefix
   */
  static ExpressionCompletionDescription ForVariable(
      const gd::String& type_,
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_,
      const gd::String& objectName_ = "") {
    return ExpressionCompletionDescription(Variable,
                                           type_,
                                           prefix_,
                                           replacementStartPosition_,
                                           replacementEndPosition_,
                                           objectName_);
  }

  /**
   * \brief Create a completion for a text with the given prefix
   */
  static ExpressionCompletionDescription ForText(
      const gd::String& type_,
      const gd::ParameterMetadata& parameterMetadata_,
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_,
      const bool isLastParameter_,
      const gd::String& objectName_ = "") {
    auto description =
        ExpressionCompletionDescription(Text,
                                        type_,
                                        prefix_,
                                        replacementStartPosition_,
                                        replacementEndPosition_,
                                        objectName_);
    description.SetIsLastParameter(isLastParameter_);
    description.SetParameterMetadata(parameterMetadata_);
    return description;
  }

  /**
   * \brief Create a completion for an expression (free, object or behavior
   * expression) with the given prefix
   */
  static ExpressionCompletionDescription ForExpression(
      const gd::String& type_,
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_,
      const gd::String& objectName_ = "",
      const gd::String& behaviorName_ = "") {
    return ExpressionCompletionDescription(Expression,
                                           type_,
                                           prefix_,
                                           replacementStartPosition_,
                                           replacementEndPosition_,
                                           objectName_,
                                           behaviorName_);
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

  /**
   * \brief Set if the completion description is exact, i.e: it's not used
   * to complete anything. Rather, it should display information about what is
   * described by the completion.
   */
  ExpressionCompletionDescription& SetIsExact(bool isExact_) {
    isExact = isExact_;
    return *this;
  }

  /**
   * \brief Check if the completion description is exact, i.e: it's not
   * used to complete anything. Rather, it should display information
   * about what is described by the completion.
   */
  bool IsExact() const { return isExact; }

  /**
   * \brief Return the first character index of the autocompleted part.
   */
  size_t GetReplacementStartPosition() const {
    return replacementStartPosition;
  }

  /**
   * \brief Return the first character index after the autocompleted part.
   */
  size_t GetReplacementEndPosition() const { return replacementEndPosition; }

  /**
   * \brief Set if the expression is the last child of a function call.
   */
  ExpressionCompletionDescription& SetIsLastParameter(bool isLastParameter_) {
    isLastParameter = isLastParameter_;
    return *this;
  }

  /**
   * \brief Check if the expression is the last child of a function call.
   */
  bool IsLastParameter() const { return isLastParameter; }

  /**
   * \brief Set the parameter metadata, in the case the completion is about
   * a parameter of a function call.
   */
  ExpressionCompletionDescription& SetParameterMetadata(
      const gd::ParameterMetadata& parameterMetadata_) {
    parameterMetadata = &parameterMetadata_;
    return *this;
  }

  /**
   * \brief Check if the completion is about a parameter of a function call.
   */
  bool HasParameterMetadata() const {
    return parameterMetadata != &badParameterMetadata;
  }

  /**
   * \brief Return the parameter metadata, if the completion is about a
   * parameter of a function call. Returns an empty metadata otherwise.
   */
  const gd::ParameterMetadata& GetParameterMetadata() const {
    return *parameterMetadata;
  }

  /** Default constructor, only to be used by Emscripten bindings. */
  ExpressionCompletionDescription() : completionKind(Object){};

 private:
  ExpressionCompletionDescription(CompletionKind completionKind_,
                                  const gd::String& type_,
                                  const gd::String& prefix_,
                                  size_t replacementStartPosition_,
                                  size_t replacementEndPosition_,
                                  const gd::String& objectName_ = "",
                                  const gd::String& behaviorName_ = "")
      : completionKind(completionKind_),
        type(type_),
        prefix(prefix_),
        replacementStartPosition(replacementStartPosition_),
        replacementEndPosition(replacementEndPosition_),
        objectName(objectName_),
        behaviorName(behaviorName_),
        isExact(false),
        isLastParameter(false),
        parameterMetadata(&badParameterMetadata) {}

  CompletionKind completionKind;
  gd::String type;
  gd::String prefix;
  size_t replacementStartPosition;
  size_t replacementEndPosition;
  gd::String objectName;
  gd::String behaviorName;
  bool isExact;
  bool isLastParameter;
  const gd::ParameterMetadata* parameterMetadata;

  static const gd::ParameterMetadata badParameterMetadata;
};

/**
 * \brief Turn an ExpressionCompletionDescription to a string.
 */
GD_CORE_API std::ostream& operator<<(std::ostream& os,
                         ExpressionCompletionDescription const& value);

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
  GetCompletionDescriptionsFor(const gd::Platform &platform,
                               const gd::ObjectsContainersList &objectsContainersList,
                               const gd::String &rootType,
                               gd::ExpressionNode& node,
                               size_t searchedPosition) {
    gd::ExpressionNodeLocationFinder finder(searchedPosition);
    node.Visit(finder);
    gd::ExpressionNode* nodeAtLocation = finder.GetNode();

    if (nodeAtLocation == nullptr) {
      std::vector<ExpressionCompletionDescription> emptyCompletions;
      return emptyCompletions;
    }

    gd::ExpressionNode* maybeParentNodeAtLocation = finder.GetParentNode();
    gd::ExpressionCompletionFinder autocompletionProvider(
        platform, objectsContainersList, rootType,
        searchedPosition, maybeParentNodeAtLocation);
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

  virtual ~ExpressionCompletionFinder(){};

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(platform, objectsContainersList, rootType, node);
    completions.push_back(ExpressionCompletionDescription::ForObject(
        type, "", searchedPosition + 1, searchedPosition + 1));
    completions.push_back(ExpressionCompletionDescription::ForExpression(
        type, "", searchedPosition + 1, searchedPosition + 1));
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    // No completions.
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(platform, objectsContainersList, rootType, node);
    completions.push_back(ExpressionCompletionDescription::ForObject(
        type, "", searchedPosition + 1, searchedPosition + 1));
    completions.push_back(ExpressionCompletionDescription::ForExpression(
        type, "", searchedPosition + 1, searchedPosition + 1));
  }
  void OnVisitNumberNode(NumberNode& node) override {
    // No completions
  }

  void OnVisitTextNode(TextNode& node) override {
    // Completions are searched in the case the text node is a parameter of a
    // function call.
    FunctionCallNode* functionCall =
        dynamic_cast<FunctionCallNode*>(maybeParentNodeAtLocation);
    if (functionCall != nullptr) {

      int parameterIndex = -1;
      for (int i = 0; i < functionCall->parameters.size(); i++) {
        if (functionCall->parameters.at(i).get() == &node) {
          parameterIndex = i;
          break;
        }
      }
      if (parameterIndex < 0) {
        return;
      }
      // Search the parameter metadata index skipping invisible ones.
      size_t visibleParameterIndex = 0;
      size_t metadataParameterIndex =
          ExpressionParser2::WrittenParametersFirstIndex(
              functionCall->objectName, functionCall->behaviorName);
      const gd::ExpressionMetadata &metadata = MetadataProvider::GetFunctionCallMetadata(
          platform, objectsContainersList, *functionCall);

      const gd::ParameterMetadata* parameterMetadata = nullptr;
      while (metadataParameterIndex <
             metadata.parameters.size()) {
        if (!metadata.parameters[metadataParameterIndex]
                 .IsCodeOnly()) {
          if (visibleParameterIndex == parameterIndex) {
            parameterMetadata = &metadata.parameters[metadataParameterIndex];
          }
          visibleParameterIndex++;
        }
        metadataParameterIndex++;
      }
      const int visibleParameterCount = visibleParameterIndex;
      if (parameterMetadata == nullptr) {
        // There are too many parameters in the expression, this text node is
        // not actually linked to a parameter expected by the function call.
        return;
      }

      const gd::String& type = parameterMetadata->GetType();
      if (type == "string") {
        // No completions for an arbitrary string.
        return;
      }

      bool isLastParameter = parameterIndex == visibleParameterCount - 1;
      completions.push_back(ExpressionCompletionDescription::ForText(
          type,
          *parameterMetadata,
          node.text,
          node.location.GetStartPosition(),
          node.location.GetEndPosition(),
          isLastParameter,
          functionCall->objectName));
    }
  }
  void OnVisitVariableNode(VariableNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(platform, objectsContainersList, rootType, node);
    auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
        platform,
        objectsContainersList,
        // Variable fields doesn't use expression completion,
        // so the object will be found inside the expression itself.
        "",
        node);
    completions.push_back(ExpressionCompletionDescription::ForVariable(
        type,
        node.name,
        node.location.GetStartPosition(),
        node.location.GetEndPosition(),
        objectName));
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    // No completions
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    // No completions
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(platform, objectsContainersList, rootType, node);
    if (gd::ParameterMetadata::IsObject(type)) {
      // Only show completions of objects if an object is required
      completions.push_back(ExpressionCompletionDescription::ForObject(
          type,
          node.identifierName,
          node.location.GetStartPosition(),
          node.location.GetEndPosition()));
    } else if (gd::ParameterMetadata::IsExpression("variable", type)) {
      auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
          platform,
          objectsContainersList,
          // Variable fields doesn't use expression completion,
          // so the object will be found inside the expression itself.
          "",
          node);
      completions.push_back(ExpressionCompletionDescription::ForVariable(
          type,
          node.identifierName,
          node.location.GetStartPosition(),
          node.location.GetEndPosition(),
          objectName));
    } else {
      // Object function, behavior name, variable, object variable.
      if (IsCaretOn(node.identifierNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForVariable(
            type,
            node.identifierName,
            node.identifierNameLocation.GetStartPosition(),
            node.identifierNameLocation.GetEndPosition()));
        completions.push_back(ExpressionCompletionDescription::ForObject(
            type,
            node.identifierName,
            node.identifierNameLocation.GetStartPosition(),
            node.identifierNameLocation.GetEndPosition()));
        if (!node.identifierNameDotLocation.IsValid()) {
          completions.push_back(ExpressionCompletionDescription::ForExpression(
              type,
              node.identifierName,
              node.identifierNameLocation.GetStartPosition(),
              node.identifierNameLocation.GetEndPosition()));
        }
      } else if (IsCaretOn(node.identifierNameDotLocation) ||
                 IsCaretOn(node.childIdentifierNameLocation)) {
        const gd::String& objectName = node.identifierName;

        // Might be an object variable, object behavior or object expression:
        completions.push_back(ExpressionCompletionDescription::ForVariable(
            type,
            node.childIdentifierName,
            node.childIdentifierNameLocation.GetStartPosition(),
            node.childIdentifierNameLocation.GetEndPosition(),
            objectName));
        completions.push_back(ExpressionCompletionDescription::ForBehavior(
            node.childIdentifierName,
            node.childIdentifierNameLocation.GetStartPosition(),
            node.childIdentifierNameLocation.GetEndPosition(),
            objectName));
        completions.push_back(ExpressionCompletionDescription::ForExpression(
            type,
            node.childIdentifierName,
            node.childIdentifierNameLocation.GetStartPosition(),
            node.childIdentifierNameLocation.GetEndPosition(),
            objectName));
      }
    }
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(platform, objectsContainersList, rootType, node);
    if (!node.behaviorFunctionName.empty() ||
        node.behaviorNameNamespaceSeparatorLocation.IsValid()) {
      // Behavior function (or behavior function being written, with the
      // function name missing)
      if (IsCaretOn(node.objectNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForObject(
            type,
            node.objectName,
            node.objectNameLocation.GetStartPosition(),
            node.objectNameLocation.GetEndPosition()));
      } else if (IsCaretOn(node.objectNameDotLocation) ||
                 IsCaretOn(node.objectFunctionOrBehaviorNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForBehavior(
            node.objectFunctionOrBehaviorName,
            node.objectFunctionOrBehaviorNameLocation.GetStartPosition(),
            node.objectFunctionOrBehaviorNameLocation.GetEndPosition(),
            node.objectName));
      } else if (IsCaretOn(node.behaviorNameNamespaceSeparatorLocation) ||
                 IsCaretOn(node.behaviorFunctionNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForExpression(
            type,
            node.behaviorFunctionName,
            node.behaviorFunctionNameLocation.GetStartPosition(),
            node.behaviorFunctionNameLocation.GetEndPosition(),
            node.objectName,
            node.objectFunctionOrBehaviorName));
      }
    } else {
      // Object function or behavior name
      if (IsCaretOn(node.objectNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForObject(
            type,
            node.objectName,
            node.objectNameLocation.GetStartPosition(),
            node.objectNameLocation.GetEndPosition()));
      } else if (IsCaretOn(node.objectNameDotLocation) ||
                 IsCaretOn(node.objectFunctionOrBehaviorNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForBehavior(
            node.objectFunctionOrBehaviorName,
            node.objectFunctionOrBehaviorNameLocation.GetStartPosition(),
            node.objectFunctionOrBehaviorNameLocation.GetEndPosition(),
            node.objectName));
        completions.push_back(ExpressionCompletionDescription::ForExpression(
            type,
            node.objectFunctionOrBehaviorName,
            node.objectFunctionOrBehaviorNameLocation.GetStartPosition(),
            node.objectFunctionOrBehaviorNameLocation.GetEndPosition(),
            node.objectName));
      }
    }
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(platform, objectsContainersList, rootType, node);
    bool isCaretOnParenthesis = IsCaretOn(node.openingParenthesisLocation) ||
                                IsCaretOn(node.closingParenthesisLocation);

    if (!node.behaviorName.empty()) {
      // Behavior function
      if (IsCaretOn(node.objectNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForObject(
            type,
            node.objectName,
            node.objectNameLocation.GetStartPosition(),
            node.objectNameLocation.GetEndPosition()));
      } else if (IsCaretOn(node.objectNameDotLocation) ||
                 IsCaretOn(node.behaviorNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForBehavior(
            node.behaviorName,
            node.behaviorNameLocation.GetStartPosition(),
            node.behaviorNameLocation.GetEndPosition(),
            node.objectName));
      } else {
        completions.push_back(ExpressionCompletionDescription::ForExpression(
                                  type,
                                  node.functionName,
                                  node.functionNameLocation.GetStartPosition(),
                                  node.functionNameLocation.GetEndPosition(),
                                  node.objectName,
                                  node.behaviorName)
                                  .SetIsExact(isCaretOnParenthesis));
      }
    } else if (!node.objectName.empty()) {
      // Object function
      if (IsCaretOn(node.objectNameLocation)) {
        completions.push_back(ExpressionCompletionDescription::ForObject(
            type,
            node.objectName,
            node.objectNameLocation.GetStartPosition(),
            node.objectNameLocation.GetEndPosition()));
      } else {
        // Add completions for behaviors, because we could imagine that the user
        // wants to move from an object function to a behavior function, and so
        // need behavior completions. Do this unless we're on the parenthesis
        // (at which point we're only showing informative message about the
        // function).
        if (!isCaretOnParenthesis) {
          completions.push_back(ExpressionCompletionDescription::ForBehavior(
              node.functionName,
              node.objectNameLocation.GetStartPosition(),
              node.objectNameLocation.GetEndPosition(),
              node.objectName));
        }

        completions.push_back(ExpressionCompletionDescription::ForExpression(
                                  type,
                                  node.functionName,
                                  node.functionNameLocation.GetStartPosition(),
                                  node.functionNameLocation.GetEndPosition(),
                                  node.objectName)
                                  .SetIsExact(isCaretOnParenthesis));
      }
    } else {
      // Free function
      completions.push_back(ExpressionCompletionDescription::ForExpression(
                                type,
                                node.functionName,
                                node.functionNameLocation.GetStartPosition(),
                                node.functionNameLocation.GetEndPosition())
                                .SetIsExact(isCaretOnParenthesis));
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(platform, objectsContainersList, rootType, node);
    completions.push_back(ExpressionCompletionDescription::ForObject(
        type,
        node.text,
        node.location.GetStartPosition(),
        node.location.GetEndPosition()));
    completions.push_back(ExpressionCompletionDescription::ForExpression(
        type,
        node.text,
        node.location.GetStartPosition(),
        node.location.GetEndPosition()));
  }

 private:
  bool IsCaretOn(const ExpressionParserLocation& location,
                 bool inclusive = false) {
    if (!location.IsValid()) return false;

    return (location.GetStartPosition() <= searchedPosition &&
            ((!inclusive && searchedPosition < location.GetEndPosition()) ||
             (inclusive && searchedPosition <= location.GetEndPosition())));
  }

  ExpressionCompletionFinder(const gd::Platform &platform_,
                             const gd::ObjectsContainersList &objectsContainersList_,
                             const gd::String &rootType_,
                             size_t searchedPosition_,
                             gd::ExpressionNode* maybeParentNodeAtLocation_)
      : platform(platform_),
        objectsContainersList(objectsContainersList_),
        rootType(rootType_),
        searchedPosition(searchedPosition_),
        maybeParentNodeAtLocation(maybeParentNodeAtLocation_){};

  std::vector<ExpressionCompletionDescription> completions;
  size_t searchedPosition;
  gd::ExpressionNode* maybeParentNodeAtLocation;

  const gd::Platform &platform;
  const gd::ObjectsContainersList &objectsContainersList;
  const gd::String rootType;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONAUTOCOMPLETIONPROVIDER_H
