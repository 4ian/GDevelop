/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <memory>
#include <vector>

#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Project/Layout.h"  // For GetTypeOfObject and GetTypeOfBehavior
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Tools/Localization.h"

namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

struct VariableOrVariablesContainer {
  const gd::VariablesContainer* variablesContainer;
  const gd::Variable* variable;
};

/**
 * \brief Find the object name that should be used as a context of the
 * expression or sub-expression that a given node represents, or find
 * the last parent of a node representing a variable.
 *
 * Object name can be needed because of the legacy convention where a "objectvar"
 * parameter represents a variable of the object represented by the previous
 * "object" parameter.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariableOwnerFinder
    : public ExpressionParser2NodeWorker {
 public:
  /**
   * \brief Helper function to find the object name that should be used as a
   * context of the expression or sub-expression that a given node represents.
   */
  static const gd::String GetObjectName(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      const gd::String& rootObjectName,
      gd::ExpressionNode& node) {
    gd::ExpressionVariableOwnerFinder typeFinder(
        platform, projectScopedContainers, rootObjectName);
    node.Visit(typeFinder);
    return typeFinder.objectName;
  }

  static VariableOrVariablesContainer GetLastParentOfNode(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      const gd::String& rootObjectName,
      gd::ExpressionNode& node) {
    gd::ExpressionVariableOwnerFinder typeFinder(
        platform, projectScopedContainers, rootObjectName);
    node.Visit(typeFinder);
    return typeFinder.lastParentOfNode;
  }

  virtual ~ExpressionVariableOwnerFinder(){};

 protected:
  ExpressionVariableOwnerFinder(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::String& rootObjectName_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        objectName(),
        rootObjectName(rootObjectName_),
        variableNode(nullptr),
        thisIsALegacyPrescopedVariable(false),
        legacyPrescopedVariablesContainer(nullptr){};

  void OnVisitSubExpressionNode(SubExpressionNode& node) override {}
  void OnVisitOperatorNode(OperatorNode& node) override {}
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {}
  void OnVisitNumberNode(NumberNode& node) override {}
  void OnVisitTextNode(TextNode& node) override {}
  void OnVisitVariableNode(VariableNode& node) override {
    if (variableNode != nullptr) {
      // This is not possible
      return;
    }
    variableNode = &node;

    // Check if the parent is a function call, in which we might be dealing
    // with a legacy pre-scoped variable parameter:
    if (node.parent) node.parent->Visit(*this);
    else {
      objectName = rootObjectName;
    }

    if (thisIsALegacyPrescopedVariable) {
      // The node represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      childVariableNames.insert(childVariableNames.begin(), node.name);
      if (legacyPrescopedVariablesContainer)
        lastParentOfNode = WalkUntilLastParent(
            *legacyPrescopedVariablesContainer, childVariableNames);
    } else {
      // Otherwise, the identifier is to be interpreted as usual:
      // it can be an object (on which a variable is accessed),
      // or a variable.
      projectScopedContainers.MatchIdentifierWithName<void>(
          node.name,
          [&]() {
            // This is an object.
            objectName = node.name;

            const auto* variablesContainer =
                projectScopedContainers.GetObjectsContainersList()
                    .GetObjectOrGroupVariablesContainer(objectName);
            if (variablesContainer)
              lastParentOfNode =
                  WalkUntilLastParent(*variablesContainer, childVariableNames);
          },
          [&]() {
            // This is a variable.
            if (projectScopedContainers.GetVariablesContainersList().Has(
                    node.name)) {
              lastParentOfNode = WalkUntilLastParent(
                  projectScopedContainers.GetVariablesContainersList().Get(
                      node.name),
                  childVariableNames);
            }
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
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    childVariableNames.insert(childVariableNames.begin(), node.name);
    if (node.parent) node.parent->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    if (variableNode != nullptr) {
      // This is not possible
      return;
    }
    // This node is not necessarily a variable node.
    // It will be checked when visiting the FunctionCallNode, just after.
    variableNode = &node;

    // Check if the parent is a function call, in which we might be dealing
    // with a legacy pre-scoped variable parameter:
    if (node.parent) node.parent->Visit(*this);
    else {
      objectName = rootObjectName;
    }

    if (thisIsALegacyPrescopedVariable) {
      // The identifier represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      if (!node.childIdentifierName.empty())
        childVariableNames.insert(childVariableNames.begin(),
                                  node.childIdentifierName);
      childVariableNames.insert(childVariableNames.begin(),
                                node.identifierName);

      if (legacyPrescopedVariablesContainer)
        lastParentOfNode = WalkUntilLastParent(
            *legacyPrescopedVariablesContainer, childVariableNames);

    } else {
      // Otherwise, the identifier is to be interpreted as usual:
      // it can be an object (on which a variable is accessed),
      // or a variable.
      projectScopedContainers.MatchIdentifierWithName<void>(
          node.identifierName,
          [&]() {
            // This is an object.
            objectName = node.identifierName;
            if (!node.childIdentifierName.empty())
              childVariableNames.insert(childVariableNames.begin(),
                                        node.childIdentifierName);

            const auto* variablesContainer =
                projectScopedContainers.GetObjectsContainersList()
                    .GetObjectOrGroupVariablesContainer(objectName);
            if (variablesContainer)
              lastParentOfNode =
                  WalkUntilLastParent(*variablesContainer, childVariableNames);
          },
          [&]() {
            // This is a variable.
            if (!node.childIdentifierName.empty())
              childVariableNames.insert(childVariableNames.begin(),
                                        node.childIdentifierName);

            if (projectScopedContainers.GetVariablesContainersList().Has(
                    node.identifierName)) {
              lastParentOfNode = WalkUntilLastParent(
                  projectScopedContainers.GetVariablesContainersList().Get(
                      node.identifierName),
                  childVariableNames);
            }
          },
          [&]() {
            // Ignore properties here.
            // There is no support for "children" of properties.
          },
          [&]() {
            // Ignore parameters here.
            // There is no support for "children" of properties.
          },
          [&]() {
            // Ignore unrecognised identifiers here.
          });
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    // Add a child with an empty name, which will be interpreted as
    // "take the first child/item of the structure/array".
    childVariableNames.insert(childVariableNames.begin(), "");
    if (node.parent) node.parent->Visit(*this);
  }
  void OnVisitFunctionCallNode(FunctionCallNode& functionCall) override {
    if (variableNode == nullptr) {
      return;
    }
    int parameterIndex = -1;
    for (int i = 0; i < functionCall.parameters.size(); i++) {
      if (functionCall.parameters.at(i).get() == variableNode) {
        parameterIndex = i;
        break;
      }
    }
    if (parameterIndex < 0) {
      return;
    }

    const auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();

    const gd::ParameterMetadata* parameterMetadata =
        MetadataProvider::GetFunctionCallParameterMetadata(
            platform, objectsContainersList, functionCall, parameterIndex);
    if (parameterMetadata == nullptr) return;  // Unexpected

    // Support for legacy pre-scoped variables:
    if (parameterMetadata->GetValueTypeMetadata().IsLegacyPreScopedVariable()) {
      if (parameterMetadata->GetType() == "objectvar") {
        // Legacy convention where a "objectvar"
        // parameter represents a variable of the object represented by the
        // previous "object" parameter. The object on which the function is
        // called is returned if no previous parameters are objects.
        objectName = functionCall.objectName;
        for (int previousIndex = parameterIndex - 1; previousIndex >= 0;
             previousIndex--) {
          const gd::ParameterMetadata* previousParameterMetadata =
              MetadataProvider::GetFunctionCallParameterMetadata(
                  platform, objectsContainersList, functionCall, previousIndex);
          if (previousParameterMetadata != nullptr &&
              gd::ParameterMetadata::IsObject(
                  previousParameterMetadata->GetType())) {
            auto previousParameterNode =
                functionCall.parameters[previousIndex].get();
            IdentifierNode* objectNode =
                dynamic_cast<IdentifierNode*>(previousParameterNode);
            objectName = objectNode->identifierName;
            break;
          }
        }

        legacyPrescopedVariablesContainer =
            projectScopedContainers.GetObjectsContainersList()
                .GetObjectOrGroupVariablesContainer(objectName);
        thisIsALegacyPrescopedVariable = true;
      } else if (parameterMetadata->GetType() == "scenevar") {
        legacyPrescopedVariablesContainer =
            projectScopedContainers.GetVariablesContainersList()
                .GetBottomMostVariablesContainer();
        thisIsALegacyPrescopedVariable = true;
      } else if (parameterMetadata->GetType() == "globalvar") {
        legacyPrescopedVariablesContainer =
            projectScopedContainers.GetVariablesContainersList()
                .GetTopMostVariablesContainer();
        thisIsALegacyPrescopedVariable = true;
      }
    } else {
      thisIsALegacyPrescopedVariable = false;
      legacyPrescopedVariablesContainer = nullptr;
    }
  }

 private:
  static VariableOrVariablesContainer WalkUntilLastParent(
      const gd::Variable& variable,
      const std::vector<gd::String>& childVariableNames,
      size_t startIndex = 0) {
    const gd::Variable* currentVariable = &variable;

    // Walk until size - 1 as we want the last parent.
    for (size_t index = startIndex; index + 1 < childVariableNames.size();
         ++index) {
      const gd::String& childName = childVariableNames[index];

      if (childName.empty()) {
        if (currentVariable->GetChildrenCount() == 0) {
          // The array or structure is empty, we can't walk through it - there
          // is no "parent".
          return {};
        }

        if (currentVariable->GetType() == gd::Variable::Array) {
          currentVariable = &currentVariable->GetAtIndex(0);
        } else {
          currentVariable =
              currentVariable->GetAllChildren().begin()->second.get();
        }
      } else {
        if (!currentVariable->HasChild(childName)) {
          // Non existing child - there is no "parent".
          return {};
        }

        currentVariable = &currentVariable->GetChild(childName);
      }
    }

    // Return the last parent of the chain of variables (so not the last variable
    // but the one before it).
    return {.variable = currentVariable};
  }

  static VariableOrVariablesContainer WalkUntilLastParent(
      const gd::VariablesContainer& variablesContainer,
      const std::vector<gd::String>& childVariableNames) {
    if (childVariableNames.empty())
      return {};  // There is no "parent" to the variables container itself.
    if (childVariableNames.size() == 1)
      return {// Only one child: the parent is the variables container itself.
              .variablesContainer = &variablesContainer};

    const gd::String& firstChildName = *childVariableNames.begin();
    if (!variablesContainer.Has(firstChildName)) {
      // The child does not exist - there is no "parent".
      return {};
    }

    return WalkUntilLastParent(
        variablesContainer.Get(firstChildName), childVariableNames, 1);
  }

  gd::String objectName;
  const gd::String& rootObjectName;
  gd::ExpressionNode* variableNode;
  std::vector<gd::String> childVariableNames;
  bool thisIsALegacyPrescopedVariable;
  const gd::VariablesContainer* legacyPrescopedVariablesContainer;
  VariableOrVariablesContainer lastParentOfNode;

  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
};

}  // namespace gd
