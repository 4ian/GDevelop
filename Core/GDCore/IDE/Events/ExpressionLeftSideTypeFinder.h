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
#include "GDCore/Project/ProjectScopedContainers.h"
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
                      const gd::ProjectScopedContainers &projectScopedContainers,
                      gd::ExpressionNode& node) {
    gd::ExpressionLeftSideTypeFinder typeFinder(
        platform, projectScopedContainers);
    node.Visit(typeFinder);
    return typeFinder.GetType();
  }

  virtual ~ExpressionLeftSideTypeFinder(){};

 protected:
  ExpressionLeftSideTypeFinder(const gd::Platform &platform_,
                       const gd::ProjectScopedContainers &projectScopedContainers_)
      : platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        type("unknown") {};

  const gd::String &GetType() {
    return type;
  };

  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);

    // The type is decided by the first operand, unless it can (`number|string`)
    // or should (`unknown`) be refined, in which case we go for the right
    // operand (which got visited knowing the type of the first operand, so it's
    // equal or strictly more precise than the left operand).
    if (type == "unknown" || type == "number|string") {
      node.rightHandSide->Visit(*this);
    }
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
        platform, projectScopedContainers.GetObjectsContainersList(), node);
    if (gd::MetadataProvider::IsBadExpressionMetadata(metadata)) {
      type = "unknown";
    }
    else {
      type = metadata.GetReturnType();
    }
  }
  void OnVisitVariableNode(VariableNode& node) override {
    type = "unknown";

    projectScopedContainers.MatchIdentifierWithName<void>(node.name,
      [&]() {
        // This represents an object.
        // We could store it to explore the type of the variable, but in practice this
        // is only called for structures/arrays with 2 levels, and we don't support structure
        // type identification for now.
      },
      [&]() {
        // This is a variable.
        // We could store it to explore the type of the variable, but in practice this
        // is only called for structures/arrays with 2 levels, and we don't support structure
        // type identification for now.
      }, [&]() {
        // This is a property with more than one child - this is unsupported.
      }, [&]() {
        // This is a parameter with more than one child - this is unsupported.
      }, [&]() {
        // This is something else.
        type = "unknown";
      });
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    type = "unknown";
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    type = "unknown";
    projectScopedContainers.MatchIdentifierWithName<void>(node.identifierName,
      [&]() {
        // It's an object variable.
        if (projectScopedContainers.GetObjectsContainersList()
                .HasObjectOrGroupWithVariableNamed(
                    node.identifierName, node.childIdentifierName)
              == ObjectsContainersList::VariableExistence::DoesNotExist) {
          type = "unknown";
          return;
        }

        auto variableType =
            projectScopedContainers.GetObjectsContainersList()
                .GetTypeOfObjectOrGroupVariable(node.identifierName,
                                                node.childIdentifierName);
        ReadTypeFromVariable(variableType);
      },
      [&]() {
        // It's a variable.
        const auto& variable =
            projectScopedContainers.GetVariablesContainersList().Get(
                node.identifierName);

        if (node.childIdentifierName.empty()) {
          ReadTypeFromVariable(variable.GetType());
        } else {
          if (!variable.HasChild(node.childIdentifierName)) {
            type = "unknown";
            return;
          }

          ReadTypeFromVariable(
              variable.GetChild(node.childIdentifierName).GetType());
        }
      }, [&]() {
        // This is a property.
        const gd::NamedPropertyDescriptor& property = projectScopedContainers
            .GetPropertiesContainersList().Get(node.identifierName).second;

        if (property.GetType() == "Number") {
          type = "number";
        } else if (property.GetType() == "Boolean") {
          // Nothing - we don't know the precise type (this could be used a string or as a number)
        } else {
          // Assume type is String or equivalent.
          type = "string";
        }
      }, [&]() {
        // It's a parameter.

        const auto& parametersVectorsList = projectScopedContainers.GetParametersVectorsList();
        const auto& parameter = gd::ParameterMetadataTools::Get(parametersVectorsList, node.identifierName);
        const auto& valueTypeMetadata = parameter.GetValueTypeMetadata();
        if (valueTypeMetadata.IsNumber()) {
          type = "number";
        } else if (valueTypeMetadata.IsString()) {
          type = "string";
        } else if (valueTypeMetadata.IsBoolean()) {
          // Nothing - we don't know the precise type (this could be used as a string or as a number).
        } else {
          type = "unknown";
        }
      }, [&]() {
        // This is something else.
        type = "unknown";
      });
  }
  void OnVisitEmptyNode(EmptyNode& node) override {
    type = "unknown";
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    type = "unknown";
  }

 private:
  void ReadTypeFromVariable(gd::Variable::Type variableType) {
    if (variableType == gd::Variable::Number) {
      type = "number";
    } else if (variableType == gd::Variable::String) {
      type = "string";
    }
  }

  gd::String type;

  const gd::Platform &platform;
  const gd::ProjectScopedContainers &projectScopedContainers;
  const gd::String rootType;
};

}  // namespace gd

#endif  // GDCORE_EXPRESSIONLEFTSIDETYPEFINDER_H
