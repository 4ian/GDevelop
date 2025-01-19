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
#include "GDCore/Project/VariablesContainer.h"

namespace gd {
class Platform;
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
 * \brief Find a variable path from an expression node.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariablePathFinder
    : public ExpressionParser2NodeWorker {
 public:

  static VariableAndItsParent GetLastParentOfNode(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      gd::ExpressionNode& node);

  static const gd::Variable::Type GetVariableType(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      gd::ExpressionNode& node, const gd::String& objectName) {
    // The context is not checked because this is called on variable parameters.
    gd::String parameterType = objectName.empty() ? "variable" : "objectvar";
    gd::String objName = objectName;
    gd::ExpressionVariablePathFinder typeFinder(
        platform, projectScopedContainers, parameterType, objName);
    node.Visit(typeFinder);

    if (typeFinder.variableName.empty() || !typeFinder.variablesContainer) {
      return gd::Variable::Unknown;
    }
    auto *variable = typeFinder.WalkUntilLastChild(
        typeFinder.variablesContainer->Get(typeFinder.variableName),
        typeFinder.childVariableNames);
    return variable ? variable->GetType() : gd::Variable::Unknown;
  }

  static const gd::Variable::Type GetArrayVariableType(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      gd::ExpressionNode& node, const gd::String& objectName) {
    // The context is not checked because this is called on variable parameters.
    gd::String parameterType = objectName.empty() ? "variable" : "objectvar";
    gd::String objName = objectName;
    gd::ExpressionVariablePathFinder typeFinder(
        platform, projectScopedContainers, parameterType, objName);
    node.Visit(typeFinder);

    if (typeFinder.variableName.empty() || !typeFinder.variablesContainer) {
      return gd::Variable::Unknown;
    }
    auto *variable = typeFinder.WalkUntilLastChild(
        typeFinder.variablesContainer->Get(typeFinder.variableName),
        typeFinder.childVariableNames);
    if (variable && variable->GetType() != gd::Variable::Array) {
      return gd::Variable::Unknown;
    }
    return variable && variable->GetChildrenCount() > 0
               ? variable->GetAtIndex(0).GetType()
               : gd::Variable::Unknown;
  }

  virtual ~ExpressionVariablePathFinder(){};

 protected:
  ExpressionVariablePathFinder(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::String& parameterType_,
      gd::String& objectName_,
      const gd::ExpressionNode* lastNodeToCheck_ = nullptr)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        parameterType(parameterType_),
        objectName(objectName_),
        lastNodeToCheck(lastNodeToCheck_),
        variablesContainer(nullptr),
        variableName(""),
        bailOutBecauseEmptyVariableName(false) {};

  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override;

  void OnVisitSubExpressionNode(SubExpressionNode& node) override {}
  void OnVisitOperatorNode(OperatorNode& node) override {}
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {}
  void OnVisitNumberNode(NumberNode& node) override {}
  void OnVisitTextNode(TextNode& node) override {}
  void OnVisitVariableNode(VariableNode& node) override {
    FindVariableFor(node.name);
    if (node.child && &node != lastNodeToCheck) node.child->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    if (node.name.empty() && node.child) {
      // A variable accessor should always have a name if it has a child (i.e:
      // another accessor). While the parser may have generated an empty name,
      // flag this so we avoid finding a wrong parent (and so, run the risk of
      // giving wrong autocompletions).
      bailOutBecauseEmptyVariableName = true;
    }
    if (variableName.empty()) {
      const auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
      if (objectsContainersList.HasObjectOrGroupWithVariableNamed(objectName,
                                                                  node.name) !=
          gd::ObjectsContainersList::VariableExistence::DoesNotExist) {
        variableName = node.name;
        variablesContainer =
            projectScopedContainers.GetObjectsContainersList()
                .GetObjectOrGroupVariablesContainer(objectName);
      }
    } else {
      childVariableNames.push_back(node.name);
    }
    if (node.child && &node != lastNodeToCheck) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    FindVariableFor(node.identifierName, node.identifierNameDotLocation.IsValid() ? &node.childIdentifierName : nullptr);
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode& functionCall) override {}

  void FindVariableFor(const gd::String& identifier, gd::String* childIdentifier = nullptr) {
    if (!objectName.empty()) {
      const auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
      if (objectsContainersList.HasObjectOrGroupWithVariableNamed(objectName,
                                                                  identifier) !=
          gd::ObjectsContainersList::VariableExistence::DoesNotExist) {
        variableName = identifier;
        variablesContainer =
            projectScopedContainers.GetObjectsContainersList()
                .GetObjectOrGroupVariablesContainer(objectName);
        if (childIdentifier) {
          childVariableNames.push_back(*childIdentifier);
        }
      }
    }
    else if (parameterType == "scenevar") {
      // The node represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      variablesContainer = projectScopedContainers.GetVariablesContainersList()
                .GetBottomMostVariablesContainer();
      variableName = identifier;
      if (childIdentifier) {
        childVariableNames.push_back(*childIdentifier);
      }
    } 
    else if (parameterType == "globalvar") {
      // The node represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      variablesContainer = projectScopedContainers.GetVariablesContainersList()
                .GetTopMostVariablesContainer();
      variableName = identifier;
      if (childIdentifier) {
        childVariableNames.push_back(*childIdentifier);
      }
    } else {
      // Otherwise, the identifier is to be interpreted as usual:
      // it can be an object (on which a variable is accessed),
      // or a variable.
      projectScopedContainers.MatchIdentifierWithName<void>(
          identifier,
          [&]() {
            objectName = identifier;
            if (childIdentifier) {
              if (parameterType == "variable") {
                // An object is overlapping the variable.
                // Even in "variable" parameters, this is not allowed to be
                // consistent with expressions.
              } else {
                // It's an object variable expression.
                const auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
                if (objectsContainersList.HasObjectOrGroupWithVariableNamed(objectName,
                                                                            *childIdentifier) !=
                    gd::ObjectsContainersList::VariableExistence::DoesNotExist) {
                  variableName = *childIdentifier;
                  variablesContainer =
                      projectScopedContainers.GetObjectsContainersList()
                          .GetObjectOrGroupVariablesContainer(objectName);
                }
              }
            }
          },
          [&]() {
            // This is a variable.
            if (projectScopedContainers.GetVariablesContainersList().Has(identifier)) {
              variablesContainer =
                  &(projectScopedContainers.GetVariablesContainersList()
                        .GetVariablesContainerFromVariableName(identifier));
              variableName = identifier;
              if (childIdentifier) {
                childVariableNames.push_back(*childIdentifier);
              }
            }
          },
          [&]() {
            // This is a property.
            if (parameterType != "objectvar" &&
                    projectScopedContainers.GetVariablesContainersList().Has(
                        identifier)) {
              variablesContainer =
                  &(projectScopedContainers.GetVariablesContainersList()
                        .GetVariablesContainerFromVariableName(identifier));
              variableName = identifier;
              // There is no support for "children" of properties.
            }
          },
          [&]() {
            // This is a parameter.
            if (parameterType != "objectvar" &&
                projectScopedContainers.GetVariablesContainersList().Has(
                    identifier)) {
              variablesContainer =
                  &(projectScopedContainers.GetVariablesContainersList()
                        .GetVariablesContainerFromVariableName(identifier));
              variableName = identifier;
              // There is no support for "children" of parameters.
            }
          },
          [&]() {
            // Ignore unrecognised identifiers here.
          });
    }
  }

 private:
  const gd::Variable* WalkUntilLastChild(
      const gd::Variable& variable,
      const std::vector<gd::String>& childVariableNames,
      size_t startIndex = 0) {
    if (bailOutBecauseEmptyVariableName)
      return nullptr;  // Do not even attempt to find the parent if we had an issue
                  // when visiting nodes.

    const gd::Variable* currentVariable = &variable;

    for (size_t index = startIndex; index < childVariableNames.size();
         ++index) {
      const gd::String& childName = childVariableNames[index];

      if (childName.empty()) {
        if (currentVariable->GetChildrenCount() == 0) {
          // The array or structure is empty, we can't walk through it - there
          // is no "parent".
          return nullptr;
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
          return nullptr;
        }

        currentVariable = &currentVariable->GetChild(childName);
      }
    }

    // Return the last parent of the chain of variables (so not the last
    // variable but the one before it).
    return currentVariable;
  }

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

    if (variableName.empty())
      return {};  // There is no "parent" to the variables container itself.

    const gd::Variable* variable = variablesContainer.Has(variableName)
                                       ? &variablesContainer.Get(variableName)
                                       : nullptr;
    if (childVariableNames.empty() || !variable)
      return {// No child: the parent is the variables container itself.
              .parentVariablesContainer = &variablesContainer};

    return WalkUntilLastParent(*variable, childVariableNames, 0);
  }

  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::String& parameterType;
  gd::String& objectName;
  const gd::ExpressionNode* lastNodeToCheck;

  const gd::VariablesContainer* variablesContainer;
  gd::String variableName;
  std::vector<gd::String> childVariableNames;
  bool bailOutBecauseEmptyVariableName;
};

}  // namespace gd
