/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONVARIABLEOWNERFINDER_H
#define GDCORE_EXPRESSIONVARIABLEOWNERFINDER_H

#include <memory>
#include <vector>
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Project/Layout.h"  // For GetTypeOfObject and GetTypeOfBehavior
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
 * \brief Find the object name that should be used as a context of the
 * expression or sub-expression that a given node represents.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariableOwnerFinder : public ExpressionParser2NodeWorker {
 public:

  /**
   * \brief Helper function to find the object name that should be used as a
   * context of the expression or sub-expression that a given node represents.
   */
  static const gd::String GetObjectName(const gd::Platform &platform,
                      const gd::ObjectsContainer &globalObjectsContainer,
                      const gd::ObjectsContainer &objectsContainer,
                      const gd::String& rootObjectName,
                      gd::ExpressionNode& node) {
    gd::ExpressionVariableOwnerFinder typeFinder(
        platform, globalObjectsContainer, objectsContainer, rootObjectName);
    node.Visit(typeFinder);
    return typeFinder.GetObjectName();
  }

  virtual ~ExpressionVariableOwnerFinder(){};

 protected:
  ExpressionVariableOwnerFinder(const gd::Platform &platform_,
                       const gd::ObjectsContainer &globalObjectsContainer_,
                       const gd::ObjectsContainer &objectsContainer_,
                       const gd::String& rootObjectName_)
      : platform(platform_),
        globalObjectsContainer(globalObjectsContainer_),
        objectsContainer(objectsContainer_),
        rootObjectName(rootObjectName_),
        objectName(""),
        variableNode(nullptr) {};

  /**
   * \brief Get all the errors
   *
   * No errors means that the expression is valid.
   */
  const gd::String &GetObjectName() {
    return objectName;
  };

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
      return;
    }
    variableNode = &node;
    node.parent->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {}
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    if (variableNode != nullptr) {
      // This is not possible
      return;
    }
    if (node.parent == nullptr) {
      objectName = rootObjectName;
      return;
    }
    // This node is not necessarily a variable node.
    // It will be checked when visiting the FunctionCallNode.
    variableNode = &node;
    node.parent->Visit(*this);
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {}
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
    const gd::ParameterMetadata* parameterMetadata =
        MetadataProvider::GetFunctionCallParameterMetadata(
            platform, 
            globalObjectsContainer,
            objectsContainer,
            functionCall,
            parameterIndex);
    if (parameterMetadata == nullptr
     || parameterMetadata->GetType() != "objectvar") {
      return;
    }

    objectName = functionCall.objectName;
    if (parameterIndex == 0) {
      return;
    }
    // TODO Could there be a behavior or other variable paramater in between?
    const gd::ParameterMetadata* previousParameterMetadata =
        MetadataProvider::GetFunctionCallParameterMetadata(
            platform, 
            globalObjectsContainer,
            objectsContainer,
            functionCall,
            parameterIndex - 1);
    if (previousParameterMetadata != nullptr
     && gd::ParameterMetadata::IsObject(previousParameterMetadata->GetType())) {
      auto previousParameterNode = functionCall.parameters[parameterIndex - 1].get();
      IdentifierNode* objectNode = dynamic_cast<IdentifierNode*>(previousParameterNode);
      objectName = objectNode->identifierName;
    }
  }

 private:
  gd::String objectName;
  gd::ExpressionNode *variableNode;

  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;
  const gd::String &rootObjectName;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONVARIABLEOWNERFINDER_H
