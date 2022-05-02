/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONTYPEFINDER_H
#define GDCORE_EXPRESSIONTYPEFINDER_H

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
 * \brief Validate that an expression is properly written by returning
 * any error attached to the nodes during parsing.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionTypeFinder : public ExpressionParser2NodeWorker {
 public:

  /**
   * \brief Helper function to check if a given node does not contain
   * any error.
   */
  static const gd::String &GetType(const gd::Platform &platform,
                      const gd::ObjectsContainer &globalObjectsContainer,
                      const gd::ObjectsContainer &objectsContainer,
                      const gd::String &rootType,
                      gd::ExpressionNode& node) {
    gd::ExpressionTypeFinder typeFinder(platform, globalObjectsContainer, objectsContainer, rootType);
    node.Visit(typeFinder);
    return typeFinder.GetType();
  }

  /**
   * \brief Get all the errors
   *
   * No errors means that the expression is valid.
   */
  const gd::String &GetType() {
    return type;
  };

  virtual ~ExpressionTypeFinder(){};

 protected:
  ExpressionTypeFinder(const gd::Platform &platform_,
                       const gd::ObjectsContainer &globalObjectsContainer_,
                       const gd::ObjectsContainer &objectsContainer_,
                       const gd::String &rootType_)
      : platform(platform_),
        globalObjectsContainer(globalObjectsContainer_),
        objectsContainer(objectsContainer_),
        rootType(rootType_),
        type("unknown"),
        child(nullptr) {};

  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    VisitParent(node);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    VisitParent(node);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    VisitParent(node);
  }
  void OnVisitNumberNode(NumberNode& node) override {
    type = "number";
  }
  void OnVisitTextNode(TextNode& node) override {
    type = "string";
  }
  void OnVisitVariableNode(VariableNode& node) override {
    VisitParent(node);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    VisitParent(node);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    VisitParent(node);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    type = "string";
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    type = "unknown";
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    type = "unknown";
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    if (child == nullptr) {
      const gd::ExpressionMetadata &metadata = MetadataProvider::GetFunctionCallMetadata(
          platform, globalObjectsContainer, objectsContainer, node);
      if (gd::MetadataProvider::IsBadExpressionMetadata(metadata)) {
        VisitParent(node);
      }
      else {
        type = metadata.GetReturnType();
      }
    }
    else {
      const gd::ParameterMetadata* parameterMetadata = MetadataProvider::GetFunctionCallParameterMetadata(
          platform, 
          globalObjectsContainer,
          objectsContainer,
          node,
          *child);
      if (parameterMetadata == nullptr) {
        type = "unknown";
      }
      else {
        type = parameterMetadata->GetType();
      }
    }
  }

 private:
  inline void VisitParent(ExpressionNode& node) {
    child = &node;
    if (node.parent != nullptr) {
      node.parent->Visit(*this);
    }
    else {
      type = rootType;
    }
  }

  gd::String type;
  ExpressionNode *child;

  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;
  const gd::String rootType;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONTYPEFINDER_H
