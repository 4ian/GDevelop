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
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/Variable.h"

namespace gd {
class Platform;
}  // namespace gd

namespace gd {

// This class is very similar to ExpressionVariableParentFinder.
/**
 * \brief Find the variable type of a node representing a variable.
 * 
 * It only works for expressions from variable parameters.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariableTypeFinder
    : public ExpressionParser2NodeWorker {
 public:
  static const gd::Variable::Type GetVariableType(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      gd::ExpressionNode& node, const gd::String& objectName) {
    gd::ExpressionVariableTypeFinder typeFinder(platform,
                                                  projectScopedContainers, objectName);
    node.Visit(typeFinder);
    return typeFinder.variable ? typeFinder.variable->GetType() : gd::Variable::Unknown;
  }

  static const gd::Variable::Type GetArrayVariableType(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      gd::ExpressionNode& node, const gd::String& objectName) {
    gd::ExpressionVariableTypeFinder typeFinder(platform,
                                                  projectScopedContainers, objectName);
    node.Visit(typeFinder);
    return typeFinder.variable && typeFinder.variable->GetChildrenCount() > 0
               ? typeFinder.variable->GetAtIndex(0).GetType()
               : gd::Variable::Unknown;
  }

  virtual ~ExpressionVariableTypeFinder(){};

 protected:
  ExpressionVariableTypeFinder(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::String& objectName_ = "")
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        objectName(objectName_),
        variableNode(nullptr),
        bailOutBecauseEmptyVariableName(false),
        variable{} {};

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

    if (objectName.empty()) {
      if (projectScopedContainers.GetVariablesContainersList().Has(node.name)) {
        variable = WalkUntilLastChild(
            projectScopedContainers.GetVariablesContainersList().Get(node.name),
            childVariableNames);
      }
    } else {
      const auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
      if (objectsContainersList.HasObjectOrGroupWithVariableNamed(objectName,
                                                                  node.name) !=
          gd::ObjectsContainersList::VariableExistence::DoesNotExist) {
        const auto *variableContainer =
            projectScopedContainers.GetObjectsContainersList()
                .GetObjectOrGroupVariablesContainer(objectName);
        variable = WalkUntilLastChild(variableContainer->Get(node.name),
                                      childVariableNames);
      }
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
    variableNode = &node;

    if (!node.childIdentifierName.empty())
      childVariableNames.insert(childVariableNames.begin(),
                                node.childIdentifierName);

    if (objectName.empty()) {
      if (projectScopedContainers.GetVariablesContainersList().Has(
              node.identifierName)) {
        variable = WalkUntilLastChild(
            projectScopedContainers.GetVariablesContainersList().Get(
                node.identifierName),
            childVariableNames);
      }
    } else {
      const auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
      if (objectsContainersList.HasObjectOrGroupWithVariableNamed(
              objectName, node.identifierName) !=
          gd::ObjectsContainersList::VariableExistence::DoesNotExist) {
        const auto *variableContainer =
            projectScopedContainers.GetObjectsContainersList()
                .GetObjectOrGroupVariablesContainer(objectName);
        variable = WalkUntilLastChild(
            variableContainer->Get(node.identifierName), childVariableNames);
      }
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
  void OnVisitFunctionCallNode(FunctionCallNode& functionCall) override {}

 private:
  const gd::Variable* WalkUntilLastChild(
      const gd::Variable& variable,
      const std::vector<gd::String>& childVariableNames,
      size_t startIndex = 0) {
    if (bailOutBecauseEmptyVariableName)
      return {};  // Do not even attempt to find the parent if we had an issue
                  // when visiting nodes.

    const gd::Variable* currentVariable = &variable;

    for (size_t index = startIndex; index < childVariableNames.size();
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
    return currentVariable;
  }

  gd::ExpressionNode* variableNode;
  std::vector<gd::String> childVariableNames;
  bool bailOutBecauseEmptyVariableName;
  const gd::Variable* variable;

  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::String& objectName;
};

}  // namespace gd
