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

/**
 * \brief Contains a variables container or a variable. Useful
 * to refer to the parent of a variable (which can be a VariablesContainer
 * or another Variable).
 */
struct VariableAndItsParent {
  const gd::VariablesContainer* parentVariablesContainer;
  const gd::Variable* parentVariable;
};

/**
 * \brief Find the last parent (i.e: the variables container) of a node
 * representing a variable.
 *
 * Useful for completions, to know which variables can be entered in a node.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariableParentFinder
    : public ExpressionParser2NodeWorker {
 public:
  static VariableAndItsParent GetLastParentOfNode(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      gd::ExpressionNode& node) {
    gd::ExpressionVariableParentFinder typeFinder(platform,
                                                  projectScopedContainers);
    node.Visit(typeFinder);
    return typeFinder.variableAndItsParent;
  }

  virtual ~ExpressionVariableParentFinder(){};

 protected:
  ExpressionVariableParentFinder(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        variableNode(nullptr),
        thisIsALegacyPrescopedVariable(false),
        bailOutBecauseEmptyVariableName(false),
        legacyPrescopedVariablesContainer(nullptr),
        variableAndItsParent{} {};

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

    if (thisIsALegacyPrescopedVariable) {
      // The node represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      childVariableNames.insert(childVariableNames.begin(), node.name);
      if (legacyPrescopedVariablesContainer)
        variableAndItsParent = WalkUntilLastParent(
            *legacyPrescopedVariablesContainer, childVariableNames);
    } else {
      // Otherwise, the identifier is to be interpreted as usual:
      // it can be an object (on which a variable is accessed),
      // or a variable.
      projectScopedContainers.MatchIdentifierWithName<void>(
          node.name,
          [&]() {
            // This is an object.
            const auto* variablesContainer =
                projectScopedContainers.GetObjectsContainersList()
                    .GetObjectOrGroupVariablesContainer(node.name);
            if (variablesContainer)
              variableAndItsParent =
                  WalkUntilLastParent(*variablesContainer, childVariableNames);
          },
          [&]() {
            // This is a variable.
            if (projectScopedContainers.GetVariablesContainersList().Has(
                    node.name)) {
              variableAndItsParent = WalkUntilLastParent(
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
    if (node.name.empty() && node.child) {
      // A variable accessor should always have a name if it has a child (i.e:
      // another accessor). While the parser may have generated an empty name,
      // flag this so we avoid finding a wrong parent (and so, run the risk of
      // giving wrong autocompletions).
      bailOutBecauseEmptyVariableName = true;
    }
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

    if (thisIsALegacyPrescopedVariable) {
      // The identifier represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      if (!node.childIdentifierName.empty())
        childVariableNames.insert(childVariableNames.begin(),
                                  node.childIdentifierName);
      childVariableNames.insert(childVariableNames.begin(),
                                node.identifierName);

      if (legacyPrescopedVariablesContainer)
        variableAndItsParent = WalkUntilLastParent(
            *legacyPrescopedVariablesContainer, childVariableNames);

    } else {
      // Otherwise, the identifier is to be interpreted as usual:
      // it can be an object (on which a variable is accessed),
      // or a variable.
      projectScopedContainers.MatchIdentifierWithName<void>(
          node.identifierName,
          [&]() {
            // This is an object.
            if (!node.childIdentifierName.empty())
              childVariableNames.insert(childVariableNames.begin(),
                                        node.childIdentifierName);

            const auto* variablesContainer =
                projectScopedContainers.GetObjectsContainersList()
                    .GetObjectOrGroupVariablesContainer(node.identifierName);
            if (variablesContainer)
              variableAndItsParent =
                  WalkUntilLastParent(*variablesContainer, childVariableNames);
          },
          [&]() {
            // This is a variable.
            if (!node.childIdentifierName.empty())
              childVariableNames.insert(childVariableNames.begin(),
                                        node.childIdentifierName);

            if (projectScopedContainers.GetVariablesContainersList().Has(
                    node.identifierName)) {
              variableAndItsParent = WalkUntilLastParent(
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
        gd::String objectName = functionCall.objectName;
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
  VariableAndItsParent WalkUntilLastParent(
      const gd::Variable& variable,
      const std::vector<gd::String>& childVariableNames,
      size_t startIndex = 0) {
    if (bailOutBecauseEmptyVariableName)
      return {};  // Do not even attempt to find the parent if we had an issue
                  // when visiting nodes.

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

    // Return the last parent of the chain of variables (so not the last
    // variable but the one before it).
    return {.parentVariable = currentVariable};
  }

  VariableAndItsParent WalkUntilLastParent(
      const gd::VariablesContainer& variablesContainer,
      const std::vector<gd::String>& childVariableNames) {
    if (bailOutBecauseEmptyVariableName)
      return {};  // Do not even attempt to find the parent if we had an issue
                  // when visiting nodes.
    if (childVariableNames.empty())
      return {};  // There is no "parent" to the variables container itself.

    const gd::String& firstChildName = *childVariableNames.begin();

    const gd::Variable* variable = variablesContainer.Has(firstChildName)
                                       ? &variablesContainer.Get(firstChildName)
                                       : nullptr;
    if (childVariableNames.size() == 1 || !variable)
      return {// Only one child: the parent is the variables container itself.
              .parentVariablesContainer = &variablesContainer};

    return WalkUntilLastParent(*variable, childVariableNames, 1);
  }

  gd::ExpressionNode* variableNode;
  std::vector<gd::String> childVariableNames;
  bool thisIsALegacyPrescopedVariable;
  bool bailOutBecauseEmptyVariableName;
  const gd::VariablesContainer* legacyPrescopedVariablesContainer;
  VariableAndItsParent variableAndItsParent;

  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
};

}  // namespace gd
