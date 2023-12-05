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
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Events/Parsers/GrammarTerminals.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"
#include "GDCore/IDE/Events/ExpressionNodeLocationFinder.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/IDE/Events/ExpressionVariableOwnerFinder.h"
#include "GDCore/IDE/Events/ExpressionVariableParentFinder.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/Variable.h"

namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
class ObjectConfiguration;
}  // namespace gd

namespace gd {

/**
 * \brief Describe completions to be shown to the user.
 */
struct GD_CORE_API ExpressionCompletionDescription {
 public:
  /**
   * The different kind of completions that can be described.
   * The IDE is responsible for actually *searching* and showing the completions
   * of completions with a kind "WithPrefix": these completions are only
   * describing what must be listed.
   */
  enum CompletionKind {
    Object,
    BehaviorWithPrefix,
    ExpressionWithPrefix,
    Variable,
    TextWithPrefix,
    Property,
    Parameter
  };

  /**
   * \brief Create a completion for a behavior with the given prefix, for
   * the specified object.
   */
  static ExpressionCompletionDescription ForBehaviorWithPrefix(
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_,
      const gd::String& objectName_) {
    ExpressionCompletionDescription description(
        BehaviorWithPrefix, replacementStartPosition_, replacementEndPosition_);
    description.SetPrefix(prefix_);
    description.SetObjectName(objectName_);
    return description;
  }

  /**
   * \brief Create a completion for a text with the given prefix
   */
  static ExpressionCompletionDescription ForTextWithPrefix(
      const gd::String& type_,
      const gd::ParameterMetadata& parameterMetadata_,
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_,
      const bool isLastParameter_,
      const gd::String& objectName_ = "") {
    auto description = ExpressionCompletionDescription(
        TextWithPrefix, replacementStartPosition_, replacementEndPosition_);
    description.SetObjectName(objectName_);
    description.SetType(type_);
    description.SetPrefix(prefix_);
    description.SetIsLastParameter(isLastParameter_);
    description.SetParameterMetadata(parameterMetadata_);
    return description;
  }

  /**
   * \brief Create a completion for an expression (free, object or behavior
   * expression) with the given prefix
   */
  static ExpressionCompletionDescription ForExpressionWithPrefix(
      const gd::String& type_,
      const gd::String& prefix_,
      size_t replacementStartPosition_,
      size_t replacementEndPosition_,
      const gd::String& objectName_ = "",
      const gd::String& behaviorName_ = "") {
    ExpressionCompletionDescription description(ExpressionWithPrefix,
                                                replacementStartPosition_,
                                                replacementEndPosition_);
    description.SetObjectName(objectName_);
    description.SetBehaviorName(behaviorName_);
    description.SetType(type_);
    description.SetPrefix(prefix_);
    return description;
  }

  /** Check if two description of completions are equal */
  bool operator==(const ExpressionCompletionDescription& other) const {
    return completionKind == other.completionKind && type == other.type &&
           variableType == other.variableType && prefix == other.prefix &&
           objectName == other.objectName && completion == other.completion &&
           behaviorName == other.behaviorName;
  };

  /** \brief Return the kind of the completion */
  CompletionKind GetCompletionKind() const { return completionKind; }

  /**
   * \brief Return the type of the completion (same type as types supported in
   * expressions). For properties, this is the type of the property.
   */
  const gd::String& GetType() const { return type; }

  ExpressionCompletionDescription& SetType(const gd::String& type_) {
    type = type_;
    return *this;
  }

  /**
   * \brief Return the type of the variable, for a variable completion.
   */
  gd::Variable::Type GetVariableType() const { return variableType; }

  ExpressionCompletionDescription& SetVariableType(
      gd::Variable::Type variableType_) {
    variableType = variableType_;
    return *this;
  }

  /**
   * \brief Return the prefix that must be completed.
   */
  const gd::String& GetPrefix() const { return prefix; }

  ExpressionCompletionDescription& SetPrefix(const gd::String& prefix_) {
    prefix = prefix_;
    return *this;
  }

  /**
   * \brief Return the completion that must be inserted.
   */
  const gd::String& GetCompletion() const { return completion; }

  ExpressionCompletionDescription& SetCompletion(
      const gd::String& completion_) {
    completion = completion_;
    return *this;
  }

  /**
   * \brief Return the object name, if completing an object expression or a
   * behavior.
   */
  const gd::String& GetObjectName() const { return objectName; }

  ExpressionCompletionDescription& SetObjectName(
      const gd::String& objectName_) {
    objectName = objectName_;
    return *this;
  }

  /**
   * \brief Return the behavior name, if completing an object behavior
   * expression.
   *
   * \warning If completing a behavior, the behavior (partial) name is returned
   * by `GetPrefix`.
   */
  const gd::String& GetBehaviorName() const { return behaviorName; }

  ExpressionCompletionDescription& SetBehaviorName(
      const gd::String& behaviorName_) {
    behaviorName = behaviorName_;
    return *this;
  }

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

  /**
   * \brief Set the object configuration, in the case the completion is about
   * an object.
   */
  ExpressionCompletionDescription& SetObjectConfiguration(
      const gd::ObjectConfiguration* objectConfiguration_) {
    objectConfiguration = objectConfiguration_;
    if (!objectConfiguration) objectConfiguration = &badObjectConfiguration;
    return *this;
  }

  /**
   * \brief Check if the completion is about an object.
   */
  bool HasObjectConfiguration() const {
    return objectConfiguration != &badObjectConfiguration;
  }

  /**
   * \brief Return the parameter metadata, if the completion is about a
   * object. Returns an empty configuration otherwise.
   */
  const gd::ObjectConfiguration& GetObjectConfiguration() const {
    return *objectConfiguration;
  }

  gd::String ToString() const {
    return "{ " + gd::String::From(GetCompletionKind()) + ", " +
           (GetType() || "no type") + ", " +
           gd::String::From(GetVariableType()) + ", " +
           (GetPrefix() || "no prefix") + ", " +
           (GetCompletion() || "no completion") + ", " +
           (GetObjectName() || "no object name") + ", " +
           (GetBehaviorName() || "no behavior name") + ", " +
           (IsExact() ? "exact" : "non-exact") + ", " +
           (IsLastParameter() ? "last parameter" : "not last parameter") +
           ", " +
           (HasParameterMetadata() ? "with parameter metadata"
                                   : "no parameter metadata") +
           ", " +
           (HasObjectConfiguration() ? "with object configuration"
                                     : "no object configuration") +
           " }";
  }

  /** Default constructor, only to be used by Emscripten bindings. */
  ExpressionCompletionDescription() : completionKind(Object){};

  ExpressionCompletionDescription(CompletionKind completionKind_,
                                  size_t replacementStartPosition_,
                                  size_t replacementEndPosition_)
      : completionKind(completionKind_),
        variableType(gd::Variable::Number),
        replacementStartPosition(replacementStartPosition_),
        replacementEndPosition(replacementEndPosition_),
        isExact(false),
        isLastParameter(false),
        parameterMetadata(&badParameterMetadata),
        objectConfiguration(&badObjectConfiguration) {}

 private:
  CompletionKind completionKind;
  gd::Variable::Type variableType;
  gd::String type;
  gd::String prefix;
  gd::String completion;
  size_t replacementStartPosition;
  size_t replacementEndPosition;
  gd::String objectName;
  gd::String behaviorName;
  bool isExact;
  bool isLastParameter;
  const gd::ParameterMetadata* parameterMetadata;
  const gd::ObjectConfiguration* objectConfiguration;

  static const gd::ParameterMetadata badParameterMetadata;
  static const gd::ObjectConfiguration badObjectConfiguration;
};

/**
 * \brief Turn an ExpressionCompletionDescription to a string.
 */
GD_CORE_API std::ostream& operator<<(
    std::ostream& os, ExpressionCompletionDescription const& value);

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
  GetCompletionDescriptionsFor(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      const gd::String& rootType,
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
        platform,
        projectScopedContainers,
        rootType,
        searchedPosition,
        maybeParentNodeAtLocation);
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
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);

    AddCompletionsForAllIdentifiersMatchingSearch("", type);
    completions.push_back(
        ExpressionCompletionDescription::ForExpressionWithPrefix(
            type, "", searchedPosition + 1, searchedPosition + 1));
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    // No completions.
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);

    AddCompletionsForAllIdentifiersMatchingSearch("", type);
    completions.push_back(
        ExpressionCompletionDescription::ForExpressionWithPrefix(
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
      const auto& objectsContainersList =
          projectScopedContainers.GetObjectsContainersList();
      const gd::ExpressionMetadata& metadata =
          MetadataProvider::GetFunctionCallMetadata(
              platform, objectsContainersList, *functionCall);

      const gd::ParameterMetadata* parameterMetadata = nullptr;
      while (metadataParameterIndex < metadata.parameters.size()) {
        if (!metadata.parameters[metadataParameterIndex].IsCodeOnly()) {
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
      completions.push_back(ExpressionCompletionDescription::ForTextWithPrefix(
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
    const auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);

    // Only attempt to complete with the children of the variable
    // if it's the last child (no more `.AnotherVariable` written after).
    bool eagerlyCompleteIfExactMatch = node.child == nullptr;

    if (gd::ValueTypeMetadata::IsTypeLegacyPreScopedVariable(type)) {
      if (type == "globalvar" || type == "scenevar") {
        const auto* variablesContainer =
            type == "globalvar"
                ? projectScopedContainers.GetVariablesContainersList()
                      .GetTopMostVariablesContainer()
                : projectScopedContainers.GetVariablesContainersList()
                      .GetBottomMostVariablesContainer();
        if (variablesContainer) {
          AddCompletionsForVariablesMatchingSearch(*variablesContainer,
                                                   node.name,
                                                   node.nameLocation,
                                                   eagerlyCompleteIfExactMatch);
        }
      } else if (type == "objectvar") {
        auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
            platform, objectsContainersList, rootObjectName, node);

        AddCompletionsForObjectOrGroupVariablesMatchingSearch(
            objectsContainersList,
            objectName,
            node.name,
            node.nameLocation,
            eagerlyCompleteIfExactMatch);
      }
    } else {
      AddCompletionsForObjectsAndVariablesMatchingSearch(
          node.name, type, node.nameLocation, eagerlyCompleteIfExactMatch);
    }
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    VariableAndItsParent variableAndItsParent =
        gd::ExpressionVariableParentFinder::GetLastParentOfNode(
            platform, projectScopedContainers, node);

    // If no child, we're at the end of a variable (like `GrandChild` in
    // `Something.Child.GrandChild`) so we can complete eagerly children if we
    // can.
    gd::String eagerlyCompleteForVariableName =
        node.child == nullptr ? node.name : "";
    AddCompletionsForChildrenVariablesOf(variableAndItsParent,
                                         node.nameLocation,
                                         eagerlyCompleteForVariableName);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {}
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    const auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);
    if (gd::ParameterMetadata::IsObject(type)) {
      // Only show completions of objects if an object is required.
      AddCompletionsForObjectMatchingSearch(
          node.identifierName, type, node.location);
    } else if (gd::ValueTypeMetadata::IsTypeLegacyPreScopedVariable(type)) {
      if (type == "globalvar" || type == "scenevar") {
        const auto* variablesContainer =
            type == "globalvar"
                ? projectScopedContainers.GetVariablesContainersList()
                      .GetTopMostVariablesContainer()
                : projectScopedContainers.GetVariablesContainersList()
                      .GetBottomMostVariablesContainer();
        if (variablesContainer) {
          if (IsCaretOn(node.identifierNameDotLocation) ||
              IsCaretOn(node.childIdentifierNameLocation)) {
            // Complete a potential child variable:
            if (variablesContainer->Has(node.identifierName)) {
              AddCompletionsForChildrenVariablesOf(
                  &variablesContainer->Get(node.identifierName),
                  node.childIdentifierNameLocation,
                  node.childIdentifierName);
            }
          } else {
            // Complete a root variable of the scene or project.

            // Don't attempt to complete children variables if there is
            // already a dot written (`MyVariable.`).
            bool eagerlyCompleteIfPossible =
                !node.identifierNameDotLocation.IsValid();
            AddCompletionsForVariablesMatchingSearch(
                *variablesContainer,
                node.identifierName,
                node.identifierNameLocation,
                eagerlyCompleteIfPossible);
          }
        }
      } else if (type == "objectvar") {
        auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
            platform, objectsContainersList, rootObjectName, node);

        if (IsCaretOn(node.identifierNameDotLocation) ||
            IsCaretOn(node.childIdentifierNameLocation)) {
          // Complete a potential child variable:
          const auto* variablesContainer =
              objectsContainersList.GetObjectOrGroupVariablesContainer(
                  objectName);
          if (variablesContainer &&
              variablesContainer->Has(node.identifierName)) {
            AddCompletionsForChildrenVariablesOf(
                &variablesContainer->Get(node.identifierName),
                node.childIdentifierNameLocation,
                node.childIdentifierName);
          }
        } else {
          // Complete a root variable of the object.

          // Don't attempt to complete children variables if there is
          // already a dot written (`MyVariable.`).
          bool eagerlyCompleteIfPossible =
              !node.identifierNameDotLocation.IsValid();
          AddCompletionsForObjectOrGroupVariablesMatchingSearch(
              objectsContainersList,
              objectName,
              node.identifierName,
              node.identifierNameLocation,
              eagerlyCompleteIfPossible);
        }
      }
    } else {
      // Object function, behavior name, variable, object variable.
      if (IsCaretOn(node.identifierNameLocation)) {
        // Don't attempt to complete children variables if there is
        // already a dot written (`MyVariable.`).
        bool eagerlyCompleteIfPossible =
            !node.identifierNameDotLocation.IsValid();
        AddCompletionsForAllIdentifiersMatchingSearch(
            node.identifierName,
            type,
            node.identifierNameLocation,
            eagerlyCompleteIfPossible);
        if (!node.identifierNameDotLocation.IsValid()) {
          completions.push_back(
              ExpressionCompletionDescription::ForExpressionWithPrefix(
                  type,
                  node.identifierName,
                  node.identifierNameLocation.GetStartPosition(),
                  node.identifierNameLocation.GetEndPosition()));
        }
      } else if (IsCaretOn(node.identifierNameDotLocation) ||
                 IsCaretOn(node.childIdentifierNameLocation)) {
        // Might be:
        // - An object variable, object behavior or object expression.
        // - Or a variable with a child.
        projectScopedContainers.MatchIdentifierWithName<void>(
            node.identifierName,
            [&]() {
              // This is an object.
              const gd::String& objectName = node.identifierName;
              AddCompletionsForObjectOrGroupVariablesMatchingSearch(
                  objectsContainersList,
                  objectName,
                  node.childIdentifierName,
                  node.childIdentifierNameLocation,
                  true);

              completions.push_back(
                  ExpressionCompletionDescription::ForBehaviorWithPrefix(
                      node.childIdentifierName,
                      node.childIdentifierNameLocation.GetStartPosition(),
                      node.childIdentifierNameLocation.GetEndPosition(),
                      objectName));
              completions.push_back(
                  ExpressionCompletionDescription::ForExpressionWithPrefix(
                      type,
                      node.childIdentifierName,
                      node.childIdentifierNameLocation.GetStartPosition(),
                      node.childIdentifierNameLocation.GetEndPosition(),
                      objectName));
            },
            [&]() {
              // This is a variable.
              VariableAndItsParent variableAndItsParent =
                  gd::ExpressionVariableParentFinder::GetLastParentOfNode(
                      platform, projectScopedContainers, node);

              AddCompletionsForChildrenVariablesOf(
                  variableAndItsParent,
                  node.childIdentifierNameLocation,
                  node.childIdentifierName);
            },
            [&]() {
              // Ignore properties here.
              // There is no support for "children" of properties.
            },
            [&]() {
              // Ignore parameters here.
              // There is no support for "children" of parameters.
            },
            [&]() {
              // Ignore unrecognised identifiers here.
            });
      }
    }
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);
    if (!node.behaviorFunctionName.empty() ||
        node.behaviorNameNamespaceSeparatorLocation.IsValid()) {
      // Behavior function (or behavior function being written, with the
      // function name missing)
      if (IsCaretOn(node.objectNameLocation)) {
        AddCompletionsForObjectMatchingSearch(
            node.objectName, type, node.objectNameLocation);
      } else if (IsCaretOn(node.objectNameDotLocation) ||
                 IsCaretOn(node.objectFunctionOrBehaviorNameLocation)) {
        completions.push_back(
            ExpressionCompletionDescription::ForBehaviorWithPrefix(
                node.objectFunctionOrBehaviorName,
                node.objectFunctionOrBehaviorNameLocation.GetStartPosition(),
                node.objectFunctionOrBehaviorNameLocation.GetEndPosition(),
                node.objectName));
      } else if (IsCaretOn(node.behaviorNameNamespaceSeparatorLocation) ||
                 IsCaretOn(node.behaviorFunctionNameLocation)) {
        completions.push_back(
            ExpressionCompletionDescription::ForExpressionWithPrefix(
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
        AddCompletionsForObjectMatchingSearch(
            node.objectName, type, node.objectNameLocation);
      } else if (IsCaretOn(node.objectNameDotLocation) ||
                 IsCaretOn(node.objectFunctionOrBehaviorNameLocation)) {
        completions.push_back(
            ExpressionCompletionDescription::ForBehaviorWithPrefix(
                node.objectFunctionOrBehaviorName,
                node.objectFunctionOrBehaviorNameLocation.GetStartPosition(),
                node.objectFunctionOrBehaviorNameLocation.GetEndPosition(),
                node.objectName));
        completions.push_back(
            ExpressionCompletionDescription::ForExpressionWithPrefix(
                type,
                node.objectFunctionOrBehaviorName,
                node.objectFunctionOrBehaviorNameLocation.GetStartPosition(),
                node.objectFunctionOrBehaviorNameLocation.GetEndPosition(),
                node.objectName));
      }
    }
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);
    bool isCaretOnParenthesis = IsCaretOn(node.openingParenthesisLocation) ||
                                IsCaretOn(node.closingParenthesisLocation);

    if (!node.behaviorName.empty()) {
      // Behavior function
      if (IsCaretOn(node.objectNameLocation)) {
        AddCompletionsForObjectMatchingSearch(
            node.objectName, type, node.objectNameLocation);
      } else if (IsCaretOn(node.objectNameDotLocation) ||
                 IsCaretOn(node.behaviorNameLocation)) {
        completions.push_back(
            ExpressionCompletionDescription::ForBehaviorWithPrefix(
                node.behaviorName,
                node.behaviorNameLocation.GetStartPosition(),
                node.behaviorNameLocation.GetEndPosition(),
                node.objectName));
      } else {
        completions.push_back(
            ExpressionCompletionDescription::ForExpressionWithPrefix(
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
        AddCompletionsForObjectMatchingSearch(
            node.objectName, type, node.objectNameLocation);
      } else {
        // Add completions for behaviors, because we could imagine that the user
        // wants to move from an object function to a behavior function, and so
        // need behavior completions. Do this unless we're on the parenthesis
        // (at which point we're only showing informative message about the
        // function).
        if (!isCaretOnParenthesis) {
          completions.push_back(
              ExpressionCompletionDescription::ForBehaviorWithPrefix(
                  node.functionName,
                  node.objectNameLocation.GetStartPosition(),
                  node.objectNameLocation.GetEndPosition(),
                  node.objectName));
        }

        completions.push_back(
            ExpressionCompletionDescription::ForExpressionWithPrefix(
                type,
                node.functionName,
                node.functionNameLocation.GetStartPosition(),
                node.functionNameLocation.GetEndPosition(),
                node.objectName)
                .SetIsExact(isCaretOnParenthesis));
      }
    } else {
      // Free function
      completions.push_back(
          ExpressionCompletionDescription::ForExpressionWithPrefix(
              type,
              node.functionName,
              node.functionNameLocation.GetStartPosition(),
              node.functionNameLocation.GetEndPosition())
              .SetIsExact(isCaretOnParenthesis));
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);

    AddCompletionsForAllIdentifiersMatchingSearch(
        node.text, type, node.location);
    completions.push_back(
        ExpressionCompletionDescription::ForExpressionWithPrefix(
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

  /**
   * A slightly less strict check than `gd::Project::IsNameSafe` as child
   * variables can be completed even if they start with a number.
   */
  bool IsIdentifierSafe(const gd::String& name) {
    if (name.empty()) return false;

    for (auto character : name) {
      if (!GrammarTerminals::IsAllowedInIdentifier(character)) {
        return false;
      }
    }

    return true;
  }

  void AddCompletionsForChildrenVariablesOf(
      VariableAndItsParent variableAndItsParent,
      const ExpressionParserLocation& location,
      gd::String eagerlyCompleteForVariableName = "") {
    if (variableAndItsParent.parentVariable) {
      AddCompletionsForChildrenVariablesOf(variableAndItsParent.parentVariable,
                                           location,
                                           eagerlyCompleteForVariableName);
    } else if (variableAndItsParent.parentVariablesContainer) {
      AddCompletionsForVariablesMatchingSearch(
          *variableAndItsParent.parentVariablesContainer, "", location);
    }
  }

  void AddCompletionsForChildrenVariablesOf(
      const gd::Variable* variable,
      const ExpressionParserLocation& location,
      gd::String eagerlyCompleteForVariableName = "") {
    if (!variable) return;

    if (variable->GetType() == gd::Variable::Structure) {
      for (const auto& name : variable->GetAllChildrenNames()) {
        if (!IsIdentifierSafe(name)) continue;

        const auto& childVariable = variable->GetChild(name);
        ExpressionCompletionDescription description(
            ExpressionCompletionDescription::Variable,
            location.GetStartPosition(),
            location.GetEndPosition());
        description.SetCompletion(name);
        description.SetVariableType(childVariable.GetType());
        completions.push_back(description);

        if (name == eagerlyCompleteForVariableName) {
          AddEagerCompletionForVariableChildren(childVariable, name, location);
        }
      }
    } else {
      // TODO: we could do a "comment only completion" to indicate that nothing
      // can/should be completed?
    }
  }

  void AddEagerCompletionForVariableChildren(
      const gd::Variable& variable,
      const gd::String& variableName,
      const ExpressionParserLocation& location) {
    if (variable.GetType() == gd::Variable::Structure) {
      gd::String prefix = variableName + ".";
      for (const auto& name : variable.GetAllChildrenNames()) {
        gd::String completion =
            IsIdentifierSafe(name)
                ? (prefix + name)
                : (variableName + "[" +
                   gd::ExpressionParser2NodePrinter::PrintStringLiteral(name) +
                   "]");

        const auto& childVariable = variable.GetChild(name);
        ExpressionCompletionDescription description(
            ExpressionCompletionDescription::Variable,
            location.GetStartPosition(),
            location.GetEndPosition());
        description.SetCompletion(completion);
        description.SetVariableType(childVariable.GetType());
        completions.push_back(description);
      }
    }
  }

  void AddCompletionsForVariablesMatchingSearch(
      const gd::VariablesContainer& variablesContainer,
      const gd::String& search,
      const ExpressionParserLocation& location,
      bool eagerlyCompleteIfExactMatch = false) {
    variablesContainer.ForEachVariableMatchingSearch(
        search,
        [&](const gd::String& variableName, const gd::Variable& variable) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Variable,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetCompletion(variableName);
          description.SetVariableType(variable.GetType());
          completions.push_back(description);

          if (eagerlyCompleteIfExactMatch && variableName == search) {
            AddEagerCompletionForVariableChildren(
                variable, variableName, location);
          }
        });
  }

  void AddCompletionsForObjectOrGroupVariablesMatchingSearch(
      const gd::ObjectsContainersList& objectsContainersList,
      const gd::String& objectOrGroupName,
      const gd::String& search,
      const ExpressionParserLocation& location,
      bool eagerlyCompleteIfExactMatch) {
    objectsContainersList.ForEachObjectOrGroupVariableMatchingSearch(
        objectOrGroupName,
        search,
        [&](const gd::String& variableName, const gd::Variable& variable) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Variable,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetCompletion(variableName);
          description.SetVariableType(variable.GetType());
          completions.push_back(description);

          if (eagerlyCompleteIfExactMatch && variableName == search) {
            AddEagerCompletionForVariableChildren(
                variable, variableName, location);
          }
        });
  }

  void AddCompletionsForObjectMatchingSearch(
      const gd::String& search,
      const gd::String& type,
      const ExpressionParserLocation& location) {
    projectScopedContainers.GetObjectsContainersList()
        .ForEachNameMatchingSearch(
            search,
            [&](const gd::String& name,
                const gd::ObjectConfiguration* objectConfiguration) {
              ExpressionCompletionDescription description(
                  ExpressionCompletionDescription::Object,
                  location.GetStartPosition(),
                  location.GetEndPosition());
              description.SetObjectConfiguration(objectConfiguration);
              description.SetCompletion(name);
              description.SetType(type);
              completions.push_back(description);
            });
  }

  void AddCompletionsForObjectsAndVariablesMatchingSearch(
      const gd::String& search,
      const gd::String& type,
      const ExpressionParserLocation& location,
      bool eagerlyCompleteIfExactMatch) {
    projectScopedContainers.ForEachIdentifierMatchingSearch(
        search,
        [&](const gd::String& objectName,
            const ObjectConfiguration* objectConfiguration) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Object,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetObjectConfiguration(objectConfiguration);
          description.SetCompletion(objectName);
          description.SetType(type);
          completions.push_back(description);
        },
        [&](const gd::String& variableName, const gd::Variable& variable) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Variable,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetCompletion(variableName);
          description.SetVariableType(variable.GetType());
          completions.push_back(description);

          if (eagerlyCompleteIfExactMatch && variableName == search) {
            AddEagerCompletionForVariableChildren(
                variable, variableName, location);
          }
        },
        [&](const gd::NamedPropertyDescriptor& property) {
          // Ignore properties here.
        },
        [&](const gd::ParameterMetadata& parameter) {
          // Ignore parameters here.
        });
  }

  void AddCompletionsForAllIdentifiersMatchingSearch(const gd::String& search,
                                                     const gd::String& type) {
    AddCompletionsForAllIdentifiersMatchingSearch(
        search,
        type,
        ExpressionParserLocation(searchedPosition + 1, searchedPosition + 1));
  }

  void AddCompletionsForAllIdentifiersMatchingSearch(
      const gd::String& search,
      const gd::String& type,
      const ExpressionParserLocation& location,
      bool eagerlyCompleteIfExactMatch = false) {
    projectScopedContainers.ForEachIdentifierMatchingSearch(
        search,
        [&](const gd::String& objectName,
            const ObjectConfiguration* objectConfiguration) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Object,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetObjectConfiguration(objectConfiguration);
          description.SetCompletion(objectName);
          description.SetType(type);
          completions.push_back(description);
        },
        [&](const gd::String& variableName, const gd::Variable& variable) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Variable,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetCompletion(variableName);
          description.SetVariableType(variable.GetType());
          completions.push_back(description);

          if (eagerlyCompleteIfExactMatch && variableName == search) {
            AddEagerCompletionForVariableChildren(
                variable, variableName, location);
          }
        },
        [&](const gd::NamedPropertyDescriptor& property) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Property,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetCompletion(property.GetName());
          description.SetType(property.GetType());
          completions.push_back(description);
        },
        [&](const gd::ParameterMetadata& parameter) {
          ExpressionCompletionDescription description(
              ExpressionCompletionDescription::Parameter,
              location.GetStartPosition(),
              location.GetEndPosition());
          description.SetCompletion(parameter.GetName());
          description.SetType(parameter.GetType());
          completions.push_back(description);
        });
  }

  ExpressionCompletionFinder(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::String& rootType_,
      size_t searchedPosition_,
      gd::ExpressionNode* maybeParentNodeAtLocation_)
      : searchedPosition(searchedPosition_),
        maybeParentNodeAtLocation(maybeParentNodeAtLocation_),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        rootType(rootType_),
        rootObjectName("")  // Always empty, might be changed if variable fields
                            // in the editor are changed to use completion.
        {};

  std::vector<ExpressionCompletionDescription> completions;
  size_t searchedPosition;
  gd::ExpressionNode* maybeParentNodeAtLocation;

  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::String rootType;
  const gd::String rootObjectName;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONAUTOCOMPLETIONPROVIDER_H
