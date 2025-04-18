/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsParameterReplacer.h"

#include <map>
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/PropertiesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

/**
 * \brief Go through the nodes and rename parameters.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionParameterReplacer
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionParameterReplacer(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      bool isParentTypeAVariable_,
      const std::unordered_map<gd::String, gd::String>& oldToNewPropertyNames_)
      : hasDoneRenaming(false),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        isParentTypeAVariable(isParentTypeAVariable_),
        oldToNewPropertyNames(oldToNewPropertyNames_){};
  virtual ~ExpressionParameterReplacer(){};

  bool HasDoneRenaming() const { return hasDoneRenaming; }

 protected:
  void OnVisitSubExpressionNode(SubExpressionNode& node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode& node) override {
    node.leftHandSide->Visit(*this);
    node.rightHandSide->Visit(*this);
  }
  void OnVisitUnaryOperatorNode(UnaryOperatorNode& node) override {
    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode& node) override {}
  void OnVisitTextNode(TextNode& node) override {}
  void OnVisitVariableNode(VariableNode& node) override {
    if (isParentTypeAVariable) {
        // Do nothing, it's a variable.
        if (node.child) node.child->Visit(*this);
        return;
    }

    // The node represents a variable or an object name on which a variable
    // will be accessed, or a property with a child.

    projectScopedContainers.MatchIdentifierWithName<void>(
      // The property name is changed after the refactor operation.
      node.name,
      [&]() {
        // Do nothing, it's an object variable.
        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // Do nothing, it's a variable.
        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // Do nothing, it's a property.
        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // This is a parameter
        RenameParameter(node.name);
        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // Do nothing, it's something else.
        if (node.child) node.child->Visit(*this);
      });
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    bool isGrandParentTypeAVariable = isParentTypeAVariable;
    isParentTypeAVariable = false;
    node.expression->Visit(*this);
    isParentTypeAVariable = isGrandParentTypeAVariable;
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    if (isParentTypeAVariable) {
        // Do nothing, it's a variable.
        return;
    }
    projectScopedContainers.MatchIdentifierWithName<void>(
      // The property name is changed after the refactor operation
      node.identifierName,
      [&]() {
        // Do nothing, it's an object variable.
      }, [&]() {
        // Do nothing, it's a variable.
      }, [&]() {
        // Do nothing, it's a property.
      }, [&]() {
        // This is a parameter.
        RenameParameter(node.identifierName);
      }, [&]() {
        // Do nothing, it's something else.
      });
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode &node) override {
    bool isGrandParentTypeAVariable = isParentTypeAVariable;
    for (auto &parameter : node.parameters) {
      const auto &parameterMetadata =
          gd::MetadataProvider::GetFunctionCallParameterMetadata(
              platform, projectScopedContainers.GetObjectsContainersList(),
              node, *parameter);
      if (!parameterMetadata) {
        continue;
      }
      const auto &parameterTypeMetadata =
          parameterMetadata->GetValueTypeMetadata();
      if (gd::EventsParameterReplacer::CanContainParameter(
              parameterTypeMetadata)) {
        isParentTypeAVariable = parameterTypeMetadata.IsVariableOnly();
        parameter->Visit(*this);
      }
    }
    isParentTypeAVariable = isGrandParentTypeAVariable;
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasDoneRenaming;

  bool RenameParameter(
      gd::String& name) {
    if (oldToNewPropertyNames.count(name) >= 1) {
      name = oldToNewPropertyNames.find(name)->second;
      hasDoneRenaming = true;
      return true;
    }

    return false;  // Nothing was changed or done.
  }

  // Scope:
  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;

  // Renaming to do
  const std::unordered_map<gd::String, gd::String>& oldToNewPropertyNames;

  gd::String objectNameToUseForVariableAccessor;
  bool isParentTypeAVariable;
};

bool EventsParameterReplacer::DoVisitInstruction(gd::Instruction& instruction,
                                                bool isCondition) {
  const auto& metadata = isCondition
                             ? gd::MetadataProvider::GetConditionMetadata(
                                   platform, instruction.GetType())
                             : gd::MetadataProvider::GetActionMetadata(
                                   platform, instruction.GetType());

  gd::ParameterMetadataTools::IterateOverParametersWithIndex(
      instruction.GetParameters(),
      metadata.GetParameters(),
      [&](const gd::ParameterMetadata& parameterMetadata,
          const gd::Expression& parameterValue,
          size_t parameterIndex,
          const gd::String& lastObjectName) {
        if (!gd::EventsParameterReplacer::CanContainParameter(
          parameterMetadata.GetValueTypeMetadata())) {
          return;
        }
        auto node = parameterValue.GetRootNode();
        if (node) {
          ExpressionParameterReplacer renamer(
              platform, GetProjectScopedContainers(),
              parameterMetadata.GetValueTypeMetadata().IsVariableOnly(),
              oldToNewPropertyNames);
          node->Visit(renamer);

          if (renamer.HasDoneRenaming()) {
            instruction.SetParameter(
                parameterIndex, ExpressionParser2NodePrinter::PrintNode(*node));
          }
        }
      });

  return false;
}

bool EventsParameterReplacer::DoVisitEventExpression(
    gd::Expression& expression, const gd::ParameterMetadata& metadata) {
  if (!gd::EventsParameterReplacer::CanContainParameter(
          metadata.GetValueTypeMetadata())) {
    return false;
  }
  auto node = expression.GetRootNode();
  if (node) {
    ExpressionParameterReplacer renamer(
        platform, GetProjectScopedContainers(),
        metadata.GetValueTypeMetadata().IsVariableOnly(), oldToNewPropertyNames);
    node->Visit(renamer);

    if (renamer.HasDoneRenaming()) {
      expression = ExpressionParser2NodePrinter::PrintNode(*node);
    }
  }

  return false;
}

bool EventsParameterReplacer::CanContainParameter(
    const gd::ValueTypeMetadata &valueTypeMetadata) {
  return valueTypeMetadata.IsVariable() || valueTypeMetadata.IsNumber() ||
         valueTypeMetadata.IsString();
}

EventsParameterReplacer::~EventsParameterReplacer() {}

}  // namespace gd
