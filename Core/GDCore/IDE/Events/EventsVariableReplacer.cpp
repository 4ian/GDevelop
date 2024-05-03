/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsVariableReplacer.h"

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
#include "GDCore/IDE/Events/ExpressionVariableOwnerFinder.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

/**
 * \brief Go through the nodes and rename variables,
 * or signal if the instruction must be renamed if a removed variable is used.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariableReplacer
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionVariableReplacer(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::VariablesContainer& targetVariablesContainer_,
      const std::unordered_map<gd::String, gd::String>& oldToNewVariableNames_,
      const std::unordered_set<gd::String>& removedVariableNames_)
      : hasDoneRenaming(false),
        removedVariableUsed(false),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        forcedInitialVariablesContainer(nullptr),
        targetVariablesContainer(targetVariablesContainer_),
        oldToNewVariableNames(oldToNewVariableNames_),
        removedVariableNames(removedVariableNames_){};
  virtual ~ExpressionVariableReplacer(){};

  void SetForcedInitialVariablesContainer(
      const gd::VariablesContainer* forcedInitialVariablesContainer_) {
    forcedInitialVariablesContainer = forcedInitialVariablesContainer_;
  }

  bool HasDoneRenaming() const { return hasDoneRenaming; }
  bool IsRemovedVariableUsed() const { return removedVariableUsed; }

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
    // The node represents a variable or an object name on which a variable
    // will be accessed.

    if (forcedInitialVariablesContainer) {
      // A scope was forced. Honor it: it means this node represents a variable
      // of the forced variables container.
      if (forcedInitialVariablesContainer == &targetVariablesContainer) {
        RenameOrRemoveVariableOfTargetVariableContainer(node.name);
      }

      if (node.child) node.child->Visit(*this);
      return;
    }

    // Match the potential *new* name of the variable, because refactorings are
    // done after changes in the variables container.
    projectScopedContainers.MatchIdentifierWithName<void>(
        GetPotentialNewName(node.name),
        [&]() {
          // This represents an object.
          // Remember the object name.
          objectNameToUseForVariableAccessor = node.name;
          if (node.child) node.child->Visit(*this);
          objectNameToUseForVariableAccessor = "";
        },
        [&]() {
          // This is a variable.
          if (projectScopedContainers.GetVariablesContainersList()
                  .HasVariablesContainer(targetVariablesContainer)) {
            // The node represents a variable, that can come from the target
            // (because the target is in the scope), replace or remove it:
            RenameOrRemoveVariableOfTargetVariableContainer(node.name);
          }

          if (node.child) node.child->Visit(*this);
        },
        [&]() {
          // This is a property.
          if (node.child) node.child->Visit(*this);
        },
        [&]() {
          // This is a parameter.
          if (node.child) node.child->Visit(*this);
        },
        [&]() {
          // This is something else - potentially a deleted variable.
          if (projectScopedContainers.GetVariablesContainersList()
                  .HasVariablesContainer(targetVariablesContainer)) {
            // The node represents a variable, that can come from the target
            // (because the target is in the scope), replace or remove it:
            RenameOrRemoveVariableOfTargetVariableContainer(node.name);
          }

          if (node.child) node.child->Visit(*this);
        });
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    if (!objectNameToUseForVariableAccessor.empty()) {
      if (objectsContainersList.HasObjectOrGroupVariablesContainer(
              objectNameToUseForVariableAccessor, targetVariablesContainer)) {
        // The node represents an object variable, and this object variables are
        // the target. Do the replacement or removals:
        RenameOrRemoveVariableOfTargetVariableContainer(node.name);
      }
    }
    objectNameToUseForVariableAccessor = "";

    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    objectNameToUseForVariableAccessor = "";

    node.expression->Visit(*this);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();

    // The node represents a variable or an object variable in an expression
    // (and if it's a variable reference or a value does not have any importance
    // here).

    if (forcedInitialVariablesContainer) {
      // A scope was forced. Honor it: it means this node represents a variable
      // of the forced variables container.
      if (forcedInitialVariablesContainer == &targetVariablesContainer) {
        RenameOrRemoveVariableOfTargetVariableContainer(node.identifierName);
      }
      return;
    }

    // Match the potential *new* name of the variable, because refactorings are
    // done after changes in the variables container.
    projectScopedContainers.MatchIdentifierWithName<void>(
        GetPotentialNewName(node.identifierName),
        [&]() {
          // This represents an object.
          if (objectsContainersList.HasObjectOrGroupVariablesContainer(
                  node.identifierName, targetVariablesContainer)) {
            // The node represents an object variable, and this object variables
            // are the target. Do the replacement or removals:
            RenameOrRemoveVariableOfTargetVariableContainer(
                node.childIdentifierName);
          }
        },
        [&]() {
          // This is a variable.
          if (projectScopedContainers.GetVariablesContainersList()
                  .HasVariablesContainer(targetVariablesContainer)) {
            // The node represents a variable, that can come from the target
            // (because the target is in the scope), replace or remove it:
            RenameOrRemoveVariableOfTargetVariableContainer(
                node.identifierName);
          }
        },
        [&]() {
          // This is a property.
        },
        [&]() {
          // This is a parameter.
        },
        [&]() {
          // This is something else - potentially a deleted variable.
          if (projectScopedContainers.GetVariablesContainersList()
                  .HasVariablesContainer(targetVariablesContainer)) {
            // The node represents a variable, that can come from the target
            // (because the target is in the scope), replace or remove it:
            RenameOrRemoveVariableOfTargetVariableContainer(
                node.identifierName);
          }
        });
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    const gd::ExpressionMetadata& metadata =
        MetadataProvider::GetFunctionCallMetadata(
            platform, projectScopedContainers.GetObjectsContainersList(), node);

    for (size_t parameterIndex = 0; parameterIndex < node.parameters.size();
         ++parameterIndex) {
      const gd::ParameterMetadata* parameterMetadata =
          MetadataProvider::GetFunctionCallParameterMetadata(
              platform,
              projectScopedContainers.GetObjectsContainersList(),
              node,
              parameterIndex);

      // Handle legacy pre-scoped variable parameters: in this case, we
      // force the "scope" at which starts the evalution of variables.
      if (parameterMetadata && parameterMetadata->GetValueTypeMetadata()
                                   .IsLegacyPreScopedVariable()) {
        const gd::VariablesContainer* oldForcedInitialVariablesContainer =
            forcedInitialVariablesContainer;

        forcedInitialVariablesContainer = nullptr;
        if (parameterMetadata->GetType() == "globalvar") {
          forcedInitialVariablesContainer =
              projectScopedContainers.GetVariablesContainersList()
                  .GetTopMostVariablesContainer();
        } else if (parameterMetadata->GetType() == "scenevar") {
          forcedInitialVariablesContainer =
              projectScopedContainers.GetVariablesContainersList()
                  .GetBottomMostVariablesContainer();
        } else if (parameterMetadata->GetType() == "objectvar") {
          auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
              platform,
              projectScopedContainers.GetObjectsContainersList(),
              node.objectName,
              *node.parameters[parameterIndex].get());
          forcedInitialVariablesContainer =
              projectScopedContainers.GetObjectsContainersList()
                  .GetObjectOrGroupVariablesContainer(objectName);
        }

        node.parameters[parameterIndex]->Visit(*this);
        forcedInitialVariablesContainer = oldForcedInitialVariablesContainer;
      } else {
        // For any other parameter, there is no special treatment being needed.
        node.parameters[parameterIndex]->Visit(*this);
      }
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasDoneRenaming;
  bool removedVariableUsed;

  const gd::String& GetPotentialNewName(const gd::String& oldName) {
    return oldToNewVariableNames.count(oldName) >= 1
            ? oldToNewVariableNames.find(oldName)->second
            : oldName;
  }

  bool RenameOrRemoveVariableOfTargetVariableContainer(
      gd::String& variableName) {
    if (oldToNewVariableNames.count(variableName) >= 1) {
      variableName = oldToNewVariableNames.find(variableName)->second;
      hasDoneRenaming = true;
      return true;
    } else if (removedVariableNames.count(variableName) >= 1) {
      removedVariableUsed = true;
      return true;
    }

    return false;  // Nothing was changed or done.
  }

  // Scope:
  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::VariablesContainer* forcedInitialVariablesContainer;

  // Renaming or removing to do:
  const gd::VariablesContainer& targetVariablesContainer;
  const std::unordered_map<gd::String, gd::String>& oldToNewVariableNames;
  const std::unordered_set<gd::String>& removedVariableNames;

  gd::String objectNameToUseForVariableAccessor;
};

const gd::VariablesContainer*
EventsVariableReplacer::FindForcedVariablesContainerIfAny(
    const gd::String& type, const gd::String& lastObjectName) {
  // Handle legacy pre-scoped variable parameters: in this case, we
  // force the "scope" at which starts the evalution of variables.
  if (type == "objectvar") {
    return GetProjectScopedContainers()
        .GetObjectsContainersList()
        .GetObjectOrGroupVariablesContainer(lastObjectName);
  } else if (type == "globalvar") {
    return GetProjectScopedContainers()
        .GetVariablesContainersList()
        .GetTopMostVariablesContainer();
  } else if (type == "scenevar") {
    return GetProjectScopedContainers()
        .GetVariablesContainersList()
        .GetBottomMostVariablesContainer();
  }

  return nullptr;
}

bool EventsVariableReplacer::DoVisitInstruction(gd::Instruction& instruction,
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
          return;  // Not an expression that can contain variables.

        auto node = parameterValue.GetRootNode();
        if (node) {
          ExpressionVariableReplacer renamer(platform,
                                             GetProjectScopedContainers(),
                                             targetVariablesContainer,
                                             oldToNewVariableNames,
                                             removedVariableNames);
          renamer.SetForcedInitialVariablesContainer(
              FindForcedVariablesContainerIfAny(type, lastObjectName));
          node->Visit(renamer);

          if (renamer.IsRemovedVariableUsed()) {
            shouldDeleteInstruction = true;
          } else if (renamer.HasDoneRenaming()) {
            instruction.SetParameter(
                parameterIndex, ExpressionParser2NodePrinter::PrintNode(*node));
          }
        }
      });

  return shouldDeleteInstruction;
}

bool EventsVariableReplacer::DoVisitEventExpression(
    gd::Expression& expression, const gd::ParameterMetadata& metadata) {
  const gd::String& type = metadata.GetType();

  if (!gd::ParameterMetadata::IsExpression("variable", type) &&
      !gd::ParameterMetadata::IsExpression("number", type) &&
      !gd::ParameterMetadata::IsExpression("string", type))
    return false;  // Not an expression that can contain variables.

  auto node = expression.GetRootNode();
  if (node) {
    ExpressionVariableReplacer renamer(platform,
                                       GetProjectScopedContainers(),
                                       targetVariablesContainer,
                                       oldToNewVariableNames,
                                       removedVariableNames);
    renamer.SetForcedInitialVariablesContainer(
        FindForcedVariablesContainerIfAny(type, ""));
    node->Visit(renamer);

    if (renamer.IsRemovedVariableUsed()) {
      return true;
    } else if (renamer.HasDoneRenaming()) {
      expression = ExpressionParser2NodePrinter::PrintNode(*node);
    }
  }

  return false;
}

EventsVariableReplacer::~EventsVariableReplacer() {}

}  // namespace gd
