/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsPropertyReplacer.h"

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
 * \brief Go through the nodes and rename properties,
 * or signal if the instruction must be renamed if a removed property is used.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionPropertyReplacer
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionPropertyReplacer(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::PropertiesContainer& targetPropertiesContainer_,
      const std::unordered_map<gd::String, gd::String>& oldToNewPropertyNames_,
      const std::unordered_set<gd::String>& removedPropertyNames_)
      : hasDoneRenaming(false),
        removedPropertyUsed(false),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        targetPropertiesContainer(targetPropertiesContainer_),
        oldToNewPropertyNames(oldToNewPropertyNames_),
        removedPropertyNames(removedPropertyNames_){};
  virtual ~ExpressionPropertyReplacer(){};

  bool HasDoneRenaming() const { return hasDoneRenaming; }
  bool IsRemovedPropertyUsed() const { return removedPropertyUsed; }

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
    auto& propertiesContainersList =
        projectScopedContainers.GetPropertiesContainersList();

    // The node represents a variable or an object name on which a variable
    // will be accessed, or a property with a child.

    // Match the potential *new* name of the property, because refactorings are
    // done after changes in the variables container.
    projectScopedContainers.MatchIdentifierWithName<void>(
      GetPotentialNewName(node.name),
      [&]() {
        // Do nothing, it's an object variable.
        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // Do nothing, it's a variable.
        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // This is a property, check if it's coming from the target container with
        // properties to replace.
        if (propertiesContainersList.HasPropertiesContainer(
                targetPropertiesContainer)) {
          // The node represents a property, that can come from the target
          // (because the target is in the scope), replace or remove it:
          RenameOrRemovePropertyOfTargetPropertyContainer(node.name);
        }

        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // Do nothing, it's a parameter.
        if (node.child) node.child->Visit(*this);
      }, [&]() {
        // This is something else - potentially a deleted property.
        // Check if it's coming from the target container with
        // properties to replace.
        if (propertiesContainersList.HasPropertiesContainer(
                targetPropertiesContainer)) {
          // The node represents a property, that can come from the target
          // (because the target is in the scope), replace or remove it:
          RenameOrRemovePropertyOfTargetPropertyContainer(node.name);
        }

        if (node.child) node.child->Visit(*this);
      });
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    node.expression->Visit(*this);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    auto& propertiesContainersList =
        projectScopedContainers.GetPropertiesContainersList();

    // Match the potential *new* name of the property, because refactorings are
    // done after changes in the variables container.
    projectScopedContainers.MatchIdentifierWithName<void>(
      GetPotentialNewName(node.identifierName),
      [&]() {
        // Do nothing, it's an object variable.
      }, [&]() {
        // Do nothing, it's a variable.
      }, [&]() {
        // This is a property, check if it's coming from the target container with
        // properties to replace.
        if (propertiesContainersList.HasPropertiesContainer(
                targetPropertiesContainer)) {
          // The node represents a property, that can come from the target
          // (because the target is in the scope), replace or remove it:
          RenameOrRemovePropertyOfTargetPropertyContainer(node.identifierName);
        }
      }, [&]() {
        // Do nothing, it's a parameter.
      }, [&]() {
        // This is something else - potentially a deleted property.
        // Check if it's coming from the target container with
        // properties to replace.
        if (propertiesContainersList.HasPropertiesContainer(
                targetPropertiesContainer)) {
          // The node represents a property, that can come from the target
          // (because the target is in the scope), replace or remove it:
          RenameOrRemovePropertyOfTargetPropertyContainer(node.identifierName);
        }
      });
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasDoneRenaming;
  bool removedPropertyUsed;

  const gd::String& GetPotentialNewName(const gd::String& oldName) {
    return oldToNewPropertyNames.count(oldName) >= 1
            ? oldToNewPropertyNames.find(oldName)->second
            : oldName;
  }

  bool RenameOrRemovePropertyOfTargetPropertyContainer(
      gd::String& propertyName) {
    if (oldToNewPropertyNames.count(propertyName) >= 1) {
      propertyName = oldToNewPropertyNames.find(propertyName)->second;
      hasDoneRenaming = true;
      return true;
    } else if (removedPropertyNames.count(propertyName) >= 1) {
      removedPropertyUsed = true;
      return true;
    }

    return false;  // Nothing was changed or done.
  }

  // Scope:
  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;

  // Renaming or removing to do:
  const gd::PropertiesContainer& targetPropertiesContainer;
  const std::unordered_map<gd::String, gd::String>& oldToNewPropertyNames;
  const std::unordered_set<gd::String>& removedPropertyNames;

  gd::String objectNameToUseForVariableAccessor;
};

bool EventsPropertyReplacer::DoVisitInstruction(gd::Instruction& instruction,
                                                bool isCondition) {
  const auto& metadata = isCondition
                             ? gd::MetadataProvider::GetConditionMetadata(
                                   platform, instruction.GetType())
                             : gd::MetadataProvider::GetActionMetadata(
                                   platform, instruction.GetType());
  bool shouldDeleteInstruction = false;

  gd::ParameterMetadataTools::IterateOverParametersWithIndex(
      instruction.GetParameters(),
      metadata.GetParameters(),
      [&](const gd::ParameterMetadata& parameterMetadata,
          const gd::Expression& parameterValue,
          size_t parameterIndex,
          const gd::String& lastObjectName) {
        const gd::String& type = parameterMetadata.GetType();

        if (!gd::ParameterMetadata::IsExpression("variable", type) &&
            !gd::ParameterMetadata::IsExpression("number", type) &&
            !gd::ParameterMetadata::IsExpression("string", type))
          return;  // Not an expression that can contain properties.

        auto node = parameterValue.GetRootNode();
        if (node) {
          ExpressionPropertyReplacer renamer(platform,
                                             GetProjectScopedContainers(),
                                             targetPropertiesContainer,
                                             oldToNewPropertyNames,
                                             removedPropertyNames);
          node->Visit(renamer);

          if (renamer.IsRemovedPropertyUsed()) {
            shouldDeleteInstruction = true;
          } else if (renamer.HasDoneRenaming()) {
            instruction.SetParameter(
                parameterIndex, ExpressionParser2NodePrinter::PrintNode(*node));
          }
        }
      });

  return shouldDeleteInstruction;
}

bool EventsPropertyReplacer::DoVisitEventExpression(
    gd::Expression& expression, const gd::ParameterMetadata& metadata) {
  const gd::String& type = metadata.GetType();

  if (!gd::ParameterMetadata::IsExpression("variable", type) &&
      !gd::ParameterMetadata::IsExpression("number", type) &&
      !gd::ParameterMetadata::IsExpression("string", type))
    return false;  // Not an expression that can contain properties.

  auto node = expression.GetRootNode();
  if (node) {
    ExpressionPropertyReplacer renamer(platform,
                                       GetProjectScopedContainers(),
                                       targetPropertiesContainer,
                                       oldToNewPropertyNames,
                                       removedPropertyNames);
    node->Visit(renamer);

    if (renamer.IsRemovedPropertyUsed()) {
      return true;
    } else if (renamer.HasDoneRenaming()) {
      expression = ExpressionParser2NodePrinter::PrintNode(*node);
    }
  }

  return false;
}

EventsPropertyReplacer::~EventsPropertyReplacer() {}

}  // namespace gd
