/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <memory>
#include <vector>

#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Events/Parsers/GrammarTerminals.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/ValueTypeMetadata.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/IDE/Events/ExpressionVariableOwnerFinder.h"
#include "GDCore/IDE/Events/ExpressionVariablePathFinder.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/Variable.h"

namespace gd {
class Expression;
class ObjectsContainer;
class Platform;
class ParameterMetadata;
class ExpressionMetadata;
class ObjectConfiguration;
} // namespace gd

namespace gd {

/**
 * \brief Describe colorations to be shown to the user.
 */
struct GD_CORE_API ExpressionColorationDescription {
public:
  /**
   * The different kind of colorations that can be described.
   * The IDE is responsible for actually *searching* and showing the colorations
   * of colorations with a kind "WithPrefix": these colorations are only
   * describing what must be listed.
   */
  enum ColorationKind { String, Number, Object, Variable, Operator };

  /** \brief Return the kind of the coloration */
  ColorationKind GetColorationKind() const { return colorationKind; }

  /**
   * \brief Return the first character index of the autocompleted part.
   */
  size_t GetStartPosition() const { return startPosition; }

  /**
   * \brief Return the first character index after the autocompleted part.
   */
  size_t GetEndPosition() const { return endPosition; }

  /** Default constructor, only to be used by Emscripten bindings. */
  ExpressionColorationDescription() : colorationKind(String){};

  ExpressionColorationDescription(ColorationKind colorationKind_,
                                  size_t replacementStartPosition_,
                                  size_t replacementEndPosition_)
      : colorationKind(colorationKind_),
        startPosition(replacementStartPosition_),
        endPosition(replacementEndPosition_) {}

private:
  ColorationKind colorationKind;
  size_t startPosition = 0;
  size_t endPosition = 0;
};

/**
 * \brief Returns the list of coloration descriptions for an expression node.
 *
 * \see gd::ExpressionColorationDescription
 */
class GD_CORE_API ExpressionSyntaxColoringHelper
    : public ExpressionParser2NodeWorker {
public:
  /**
   * \brief Given the expression, find the node at the specified location
   * and returns colorations for it.
   */
  static std::vector<ExpressionColorationDescription>
  GetColorationDescriptionsFor(
      const gd::Platform &platform,
      const gd::ProjectScopedContainers &projectScopedContainers,
      const gd::String &rootType, gd::ExpressionNode &node) {
    gd::ExpressionSyntaxColoringHelper colorationHelper(
        platform, projectScopedContainers, rootType);
    node.Visit(colorationHelper);
    return colorationHelper.GetColorationDescriptions();
  }

  /**
   * \brief Return the colorations found for the visited node.
   */
  const std::vector<ExpressionColorationDescription> &
  GetColorationDescriptions() {
    return colorations;
  };

  virtual ~ExpressionSyntaxColoringHelper(){};

protected:
  void OnVisitSubExpressionNode(SubExpressionNode &node) override {
    // TODO node.location should includes the parenthesis.
    {
      gd::ExpressionColorationDescription coloration(
          gd::ExpressionColorationDescription::ColorationKind::Operator,
          node.location.GetStartPosition() - 1,
          node.expression->location.GetStartPosition());
      colorations.push_back(coloration);
    }
    node.expression->Visit(*this);
    {
      gd::ExpressionColorationDescription coloration(
          gd::ExpressionColorationDescription::ColorationKind::Operator,
          node.expression->location.GetEndPosition(),
          node.location.GetEndPosition() + 1);
      colorations.push_back(coloration);
    }
  }
  void OnVisitOperatorNode(OperatorNode &node) override {
    node.leftHandSide->Visit(*this);

    gd::ExpressionColorationDescription coloration(
        gd::ExpressionColorationDescription::ColorationKind::Operator,
        node.leftHandSide->location.GetEndPosition(),
        node.rightHandSide->location.GetStartPosition());
    colorations.push_back(coloration);

    node.rightHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode &node) override {
    gd::ExpressionColorationDescription coloration(
        gd::ExpressionColorationDescription::ColorationKind::Operator,
        node.location.GetStartPosition(),
        node.factor->location.GetStartPosition());
    colorations.push_back(coloration);

    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode &node) override {
    gd::ExpressionColorationDescription coloration(
        gd::ExpressionColorationDescription::ColorationKind::Number,
        node.location.GetStartPosition(), node.location.GetEndPosition());
    colorations.push_back(coloration);
  }

  void OnVisitTextNode(TextNode &node) override {
    gd::ExpressionColorationDescription coloration(
        gd::ExpressionColorationDescription::ColorationKind::String,
        node.location.GetStartPosition(), node.location.GetEndPosition());
    colorations.push_back(coloration);
  }
  void OnVisitVariableNode(VariableNode &node) override {
    gd::ExpressionColorationDescription coloration(
        gd::ExpressionColorationDescription::ColorationKind::Variable,
        node.nameLocation.GetStartPosition(),
        node.nameLocation.GetEndPosition());
    colorations.push_back(coloration);

    if (node.child) {
      node.child->Visit(*this);
    }
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode &node) override {
    gd::ExpressionColorationDescription coloration(
        gd::ExpressionColorationDescription::ColorationKind::Variable,
        node.dotLocation.GetStartPosition(),
        node.nameLocation.GetEndPosition());
    colorations.push_back(coloration);

    if (node.child) {
      node.child->Visit(*this);
    }
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode &node) override {
    {
      gd::ExpressionColorationDescription coloration(
          gd::ExpressionColorationDescription::ColorationKind::Variable,
          node.location.GetStartPosition(),
          node.expression->location.GetStartPosition());
      colorations.push_back(coloration);
    }
    node.expression->Visit(*this);
    {
      gd::ExpressionColorationDescription coloration(
          gd::ExpressionColorationDescription::ColorationKind::Variable,
          node.expression->location.GetEndPosition(),
          node.child ? node.child->location.GetStartPosition()
                     : node.location.GetEndPosition());
      colorations.push_back(coloration);
    }
    if (node.child) {
      node.child->Visit(*this);
    }
  }
  void OnVisitIdentifierNode(IdentifierNode &node) override {
    const auto &objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    auto type = gd::ExpressionTypeFinder::GetType(
        platform, projectScopedContainers, rootType, node);
    if (gd::ParameterMetadata::IsObject(type)) {
      gd::ExpressionColorationDescription coloration(
          gd::ExpressionColorationDescription::ColorationKind::Object,
          node.identifierNameLocation.GetStartPosition(),
          node.identifierNameLocation.GetStartPosition());
      colorations.push_back(coloration);
    } else if (gd::ValueTypeMetadata::IsTypeLegacyPreScopedVariable(type)) {
      gd::ExpressionColorationDescription coloration(
          gd::ExpressionColorationDescription::ColorationKind::Variable,
          node.location.GetStartPosition(), node.location.GetStartPosition());
      colorations.push_back(coloration);
    } else {
      // Might be:
      // - An object variable, object behavior or object expression.
      // - Or a variable with a child.
      projectScopedContainers.MatchIdentifierWithName<void>(
          node.identifierName,
          [&]() {
            // This is an object.
            gd::ExpressionColorationDescription coloration(
                gd::ExpressionColorationDescription::ColorationKind::Object,
                node.identifierNameLocation.GetStartPosition(),
                node.identifierNameLocation.GetEndPosition());
            colorations.push_back(coloration);

            if (node.childIdentifierNameLocation.IsValid()) {
              gd::ExpressionColorationDescription coloration(
                  gd::ExpressionColorationDescription::ColorationKind::Variable,
                  node.childIdentifierNameLocation.GetStartPosition(),
                  node.childIdentifierNameLocation.GetEndPosition());
              colorations.push_back(coloration);
            }
          },
          [&]() {
            // This is a variable.
            gd::ExpressionColorationDescription coloration(
                gd::ExpressionColorationDescription::ColorationKind::Variable,
                node.location.GetStartPosition(),
                node.location.GetEndPosition());
            colorations.push_back(coloration);
          },
          [&]() {
            // This is a property.
            gd::ExpressionColorationDescription coloration(
                gd::ExpressionColorationDescription::ColorationKind::Variable,
                node.location.GetStartPosition(),
                node.location.GetEndPosition());
            colorations.push_back(coloration);
          },
          [&]() {
            // This is a parameter.
            gd::ExpressionColorationDescription coloration(
                gd::ExpressionColorationDescription::ColorationKind::Variable,
                node.location.GetStartPosition(),
                node.location.GetEndPosition());
            colorations.push_back(coloration);
          },
          [&]() {
            // Ignore unrecognised identifiers here.
          });
    }
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode &node) override {
    // No coloration
  }
  void OnVisitFunctionCallNode(FunctionCallNode &node) override {
    if (node.objectNameLocation.IsValid()) {
      gd::ExpressionColorationDescription coloration(
          gd::ExpressionColorationDescription::ColorationKind::Object,
          node.objectNameLocation.GetStartPosition(),
          node.objectNameLocation.GetEndPosition());
      colorations.push_back(coloration);
    }
    for (auto &&parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode &node) override {}

private:
  ExpressionSyntaxColoringHelper(
      const gd::Platform &platform_,
      const gd::ProjectScopedContainers &projectScopedContainers_,
      const gd::String &rootType_)
      : platform(platform_), projectScopedContainers(projectScopedContainers_),
        rootType(rootType_),
        rootObjectName("") // Always empty, might be changed if variable fields
                           // in the editor are changed to use coloration.
        {};

  std::vector<ExpressionColorationDescription> colorations;
  size_t searchedPosition;

  const gd::Platform &platform;
  const gd::ProjectScopedContainers &projectScopedContainers;
  const gd::String rootType;
  const gd::String rootObjectName;
};

} // namespace gd
