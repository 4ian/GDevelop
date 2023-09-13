/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EXPRESSIONLEFTSIDETYPEFINDER_H
#define GDCORE_EXPRESSIONLEFTSIDETYPEFINDER_H

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
class ObjectsContainersList;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
}  // namespace gd

namespace gd {

/**
 * \brief Find the type of the node at the left side of operations.
 *
 * \see gd::ExpressionTypeFinder
 */
class GD_CORE_API ExpressionLeftSideTypeFinder : public ExpressionParser2NodeWorker {
 public:

  /**
   * \brief Helper function to find the type of the node at the left side of
   * operations.
   */
  static const gd::String GetType(const gd::Platform &platform,
                      const gd::ObjectsContainersList &objectsContainersList,
                      gd::ExpressionNode& node) {
    gd::ExpressionLeftSideTypeFinder typeFinder(
        platform, objectsContainersList);
    node.Visit(typeFinder);
    return typeFinder.GetType();
  }

  virtual ~ExpressionLeftSideTypeFinder(){};

 protected:
  ExpressionLeftSideTypeFinder(const gd::Platform &platform_,
                       const gd::ObjectsContainersList &objectsContainersList_)
      : platform(platform_),
        objectsContainersList(objectsContainersList_),
        type("unknown") {};

  const gd::String &GetType() {
    return type;
  };

  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    node.factor->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    node.expression->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode& node) override {
    type = "number";
  }
  void OnVisitTextNode(TextNode& node) override {
    type = "string";
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    const gd::ExpressionMetadata &metadata = MetadataProvider::GetFunctionCallMetadata(
        platform, objectsContainersList, node);
    if (gd::MetadataProvider::IsBadExpressionMetadata(metadata)) {
      type = "unknown";
    }
    else {
      type = metadata.GetReturnType();
    }
  }
  void OnVisitVariableNode(VariableNode& node) override {
    type = "unknown";
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    type = "unknown";
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    type = "unknown";
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    type = "unknown";
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    type = "unknown";
  }

 private:
  gd::String type;

  const gd::Platform &platform;
  const gd::ObjectsContainersList &objectsContainersList;
  const gd::String rootType;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONLEFTSIDETYPEFINDER_H
