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

struct ChildVariableName {
  gd::String childName;
};

// TODO: rename to ExpressionVariableFinder?

/**
 * \brief Find the object name that should be used as a context of the
 * expression or sub-expression that a given node represents.
 *
 * This is needed because of the legacy convention where a "objectvar"
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

  static const gd::Variable* GetVariableUnderNode(
      const gd::Platform& platform,
      const gd::ProjectScopedContainers& projectScopedContainers,
      const gd::String& rootObjectName,
      gd::ExpressionNode& node) {
    gd::ExpressionVariableOwnerFinder typeFinder(
        platform, projectScopedContainers, rootObjectName);
    node.Visit(typeFinder);
    return typeFinder.variableUnderNode;
  }

  virtual ~ExpressionVariableOwnerFinder(){};

 protected:
  ExpressionVariableOwnerFinder(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::String& rootObjectName_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        rootObjectName(rootObjectName_),
        objectName(""),
        variableNode(nullptr),
        thisIsALegacyPrescopedVariable(false),
        legacyPrescopedVariablesContainer(nullptr),
        variableUnderNode(nullptr) {};

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
    if (node.parent == nullptr) {
      objectName = rootObjectName;

      // TODO: this represents a identifier/variable node for an object
      // if rootObjectName is not null, or otherwise a scene/global variable?
      if (objectName.empty()) {
        std::cout << "UNEXPECTED USE CASE (variable): " << node.name << std::endl;
        std::cout << "rootObjectName empty" << std::endl;
      }
      // childVariableNames.insert(childVariableNames.begin(), {
      //   .childName = node.name
      // });
      // if
      // (projectScopedContainers.GetVariablesContainersList().Has(node.name)) {
      //   variableUnderNode =
      //   WalkThroughVariables(projectScopedContainers.GetVariablesContainersList().Get(node.name),
      //   childVariableNames);
      // }
      return;
    }
    variableNode = &node;

    // Check if the parent is a function call, in which we might be dealing
    // with a legacy pre-scoped variable parameter:
    node.parent->Visit(*this);

    // TODO: factor
    if (thisIsALegacyPrescopedVariable) {
      // The identifier represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      childVariableNames.insert(childVariableNames.begin(),
                                {.childName = node.name});
      if (legacyPrescopedVariablesContainer)
        variableUnderNode = WalkThroughVariables(
            *legacyPrescopedVariablesContainer, childVariableNames);
    } else {
      projectScopedContainers.MatchIdentifierWithName<void>(
          node.name,
          [&]() {
            // This is an object.
            objectName = node.name;

            const auto* variablesContainer =
                projectScopedContainers.GetObjectsContainersList()
                    .GetObjectOrGroupVariablesContainer(objectName);
            if (variablesContainer)
              variableUnderNode =
                  WalkThroughVariables(*variablesContainer, childVariableNames);
          },
          [&]() {
            // This is a variable.
            if (projectScopedContainers.GetVariablesContainersList().Has(
                    node.name)) {
              variableUnderNode = WalkThroughVariables(
                  projectScopedContainers.GetVariablesContainersList().Get(
                      node.name),
                  childVariableNames);
            }
          },
          [&]() {
            // Ignore properties here.
          },
          [&]() {
            // Ignore parameters here.
          },
          [&]() {
            // Ignore unrecognised identifiers here.
          });
    }
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    childVariableNames.insert(childVariableNames.begin(),
                              {.childName = node.name});
    if (node.parent) node.parent->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    if (variableNode != nullptr) {
      // This is not possible
      return;
    }
    if (node.parent == nullptr) {
      objectName = rootObjectName;

      // TODO: this represents a identifier/variable node for an object
      // if rootObjectName is not null, or otherwise a scene/global variable?
      if (objectName.empty()) {
        std::cout << "UNEXPECTED USE CASE (identifier): " << node.identifierName << std::endl;
        std::cout << "rootObjectName empty" << std::endl;
      }
      // childVariableNames.insert(childVariableNames.begin(), {
      //   .childName = node.identifierName
      // });
      // if
      // (projectScopedContainers.GetVariablesContainersList().Has(node.identifierName))
      // {
      //   variableUnderNode =
      //   WalkThroughVariables(projectScopedContainers.GetVariablesContainersList().Get(node.identifierName),
      //   childVariableNames);
      // }

      return;
    }

    // This node is not necessarily a variable node.
    // It will be checked when visiting the FunctionCallNode, just after.
    variableNode = &node;

    // Check if the parent is a function call, in which we might be dealing
    // with a legacy pre-scoped variable parameter:
    node.parent->Visit(*this);

    if (thisIsALegacyPrescopedVariable) {
      // The identifier represents a variable name, and the variables container
      // containing it was identified in the FunctionCallNode.
      if (!node.childIdentifierName.empty())
        childVariableNames.insert(childVariableNames.begin(),
                                  {.childName = node.childIdentifierName});
      childVariableNames.insert(childVariableNames.begin(),
                                {.childName = node.identifierName});

      if (legacyPrescopedVariablesContainer)
        variableUnderNode = WalkThroughVariables(
            *legacyPrescopedVariablesContainer, childVariableNames);
    } else {
      projectScopedContainers.MatchIdentifierWithName<void>(
          node.identifierName,
          [&]() {
            // This is an object.
            objectName = node.identifierName;
            if (!node.childIdentifierName.empty())
              childVariableNames.insert(childVariableNames.begin(),
                                        {.childName = node.childIdentifierName});

            const auto* variablesContainer =
                projectScopedContainers.GetObjectsContainersList()
                    .GetObjectOrGroupVariablesContainer(objectName);
            if (variablesContainer)
              variableUnderNode =
                  WalkThroughVariables(*variablesContainer, childVariableNames);
          },
          [&]() {
            // This is a variable.
            if (!node.childIdentifierName.empty())
              childVariableNames.insert(childVariableNames.begin(),
                                        {.childName = node.childIdentifierName});

            if (projectScopedContainers.GetVariablesContainersList().Has(
                    node.identifierName)) {
              variableUnderNode = WalkThroughVariables(
                  projectScopedContainers.GetVariablesContainersList().Get(
                      node.identifierName),
                  childVariableNames);
            }
          },
          [&]() {
            // Ignore properties here.
          },
          [&]() {
            // Ignore parameters here.
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
    childVariableNames.insert(childVariableNames.begin(), {.childName = ""});
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
  const gd::Variable* WalkThroughVariables(
      const gd::Variable& variable,
      const std::vector<ChildVariableName>& childVariableNames,
      size_t startIndex = 0) {
    const gd::Variable* currentVariable = &variable;
    size_t index = startIndex;
    std::cout << "walk through from" << &variable << std::endl;
      std::cout << "Will walk through: " << std::endl;
    for (const auto& name: childVariableNames) {
      std::cout << name.childName << std::endl;
    }
    for (size_t index = startIndex;index < childVariableNames.size() - 1;++index) {
      const gd::String& childName = childVariableNames[index].childName;
      std::cout << "childName" << childName << std::endl;
      if (childName.empty()) {
        if (currentVariable->GetChildrenCount() == 0) {
          // The array or structure is empty, we can't walk through it.
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
          // Non existing child.
          return nullptr;
        }

        currentVariable = &currentVariable->GetChild(childName);
      }
    }

    return currentVariable;
  }

  const gd::Variable* WalkThroughVariables(
      const gd::VariablesContainer& variablesContainer,
      const std::vector<ChildVariableName>& childVariableNames) {
      std::cout << "Will walk through (var container): " << std::endl;
    for (const auto& name: childVariableNames) {
      std::cout << name.childName << std::endl;
    }

    const gd::String& firstChildName = childVariableNames.begin()->childName;
    if (!variablesContainer.Has(firstChildName)) {
      return nullptr;
    }

    return WalkThroughVariables(
        variablesContainer.Get(firstChildName), childVariableNames, 1);
  }

  gd::String objectName;
  gd::ExpressionNode* variableNode;
  std::vector<ChildVariableName> childVariableNames;
  bool thisIsALegacyPrescopedVariable;
  const gd::VariablesContainer* legacyPrescopedVariablesContainer;
  const gd::Variable* variableUnderNode;

  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::String& rootObjectName;
};

}  // namespace gd
