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
#include "GDCore/IDE/Events/ExpressionLeftSideTypeFinder.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ObjectMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Project/Layout.h" // For GetTypeOfObject and GetTypeOfBehavior
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
 * \brief Find the type of the expression or sub-expression that a given node
 * represents.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionTypeFinder : public ExpressionParser2NodeWorker {
 public:

  /**
   * \brief Helper function to find the type of the expression or
   * sub-expression that a given node represents.
   */
  static const gd::String GetType(const gd::Platform &platform,
                      const gd::ObjectsContainer &globalObjectsContainer,
                      const gd::ObjectsContainer &objectsContainer,
                      const gd::String &rootType,
                      gd::ExpressionNode& node) {
    gd::ExpressionTypeFinder typeFinder(
        platform, globalObjectsContainer, objectsContainer, rootType);
    node.Visit(typeFinder);
    return typeFinder.GetType();
  }

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

  const gd::String &GetType() {
    return ConvertSubtype(type);
  };

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
  void OnVisitEmptyNode(EmptyNode& node) override {
    VisitParent(node);
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    VisitParent(node);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    // TODO Should it be unknown if it is the node in GetType?
    // TODO Should it go back down and give the left side type?
    type = "number|string";
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
      const gd::ParameterMetadata* parameterMetadata =
          MetadataProvider::GetFunctionCallParameterMetadata(
              platform,
              globalObjectsContainer,
              objectsContainer,
              node,
              *child);
      if (parameterMetadata == nullptr || parameterMetadata->GetType().empty()) {
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
    else if (rootType == "number|string") {
      auto leftSideType = gd::ExpressionLeftSideTypeFinder::GetType(
          platform, 
          globalObjectsContainer,
          objectsContainer,
          node);
      if (leftSideType == "number" || leftSideType == "string") {
        type = leftSideType;
      }
      else {
        type = rootType;
      }
    }
    else {
      type = rootType;
    }
  }

  static const gd::String numberTypeString;
  static const gd::String stringTypeString;
  static const gd::String variableTypeString;
  static const gd::String objectTypeString;
  static const gd::String &ConvertSubtype(const gd::String &type);

  gd::String type;
  ExpressionNode *child;

  const gd::Platform &platform;
  const gd::ObjectsContainer &globalObjectsContainer;
  const gd::ObjectsContainer &objectsContainer;
  const gd::String rootType;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONTYPEFINDER_H
