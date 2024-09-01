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
#include "GDCore/IDE/Events/ExpressionVariableNameFinder.h"
#include "GDCore/IDE/VariableInstructionSwitcher.h"
#include "GDCore/IDE/WholeProjectRefactorer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

VariablesContainer EventsVariableReplacer::nullVariablesContainer;

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
      const VariablesRenamingChangesetNode& variablesRenamingChangesetRoot_,
      const std::unordered_set<gd::String>& removedVariableNames_,
      const gd::VariablesContainer& targetVariablesContainer_,
      const gd::String &groupName_,
      const gd::String &forcedInitialObjectName)
      : hasDoneRenaming(false),
        removedVariableUsed(false),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        forcedVariablesContainer(nullptr),
        forcedObjectName(forcedInitialObjectName),
        variablesRenamingChangesetRoot(variablesRenamingChangesetRoot_),
        removedVariableNames(removedVariableNames_),
        targetVariablesContainer(targetVariablesContainer_),
        targetGroupName(groupName_){};
  virtual ~ExpressionVariableReplacer(){};

  void SetForcedInitialVariablesContainer(
      const gd::VariablesContainer* forcedInitialVariablesContainer_) {
    forcedVariablesContainer = forcedInitialVariablesContainer_;
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

    if (forcedVariablesContainer) {
      const gd::String oldVariableName = node.name;
      PushVariablesRenamingChangesetRoot();
      // A scope was forced. Honor it: it means this node represents a variable
      // of the forced variables container.
      if (forcedVariablesContainer == &targetVariablesContainer ||
          IsTargetingObjectGroup(forcedObjectName)) {
        RenameOrRemoveVariableOfTargetVariableContainer(node.name);
      }

      if (node.child) {
        bool hasBeenPushed =
            PushVariablesRenamingChangesetNodeForVariable(oldVariableName);
        node.child->Visit(*this);
        PopVariablesRenamingChangesetNode(hasBeenPushed);
      }
      PopVariablesRenamingChangesetNode(true);
      return;
    }

    // Match the potential *new* name of the variable, because refactorings are
    // done after changes in the variables container.
    projectScopedContainers.MatchIdentifierWithName<void>(
        node.name,
        [&]() {
          // This represents an object.
          // Remember the object name.
          objectNameToUseForVariableAccessor = node.name;
          if (node.child) node.child->Visit(*this);
          objectNameToUseForVariableAccessor = "";
        },
        [&]() {
          // This is a variable.
          if (&projectScopedContainers.GetVariablesContainersList()
                   .GetVariablesContainerFromVariableName(node.name) ==
              &targetVariablesContainer) {
            // The node represents a variable, that can come from the target
            // (because the target is in the scope), replace or remove it:
            PushVariablesRenamingChangesetRoot();
            RenameVariableAndVisitChild(node.name, node.child.get());
            PopVariablesRenamingChangesetNode(true);
          } else {
            if (node.child) {
              PushVariablesRenamingChangesetNodeForIgnoredVariables();
              node.child->Visit(*this);
              PopVariablesRenamingChangesetNode(true);
            }
          }
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
          // This is something else.
          if (node.child) node.child->Visit(*this);
        });
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    if (!objectNameToUseForVariableAccessor.empty()) {
      // This is always true because MatchIdentifierWithName is used to get
      // objectNameToUseForVariableAccessor.
      if (objectsContainersList.HasObjectOrGroupVariablesContainer(
              objectNameToUseForVariableAccessor, targetVariablesContainer) ||
          IsTargetingObjectGroup(objectNameToUseForVariableAccessor)) {
        objectNameToUseForVariableAccessor = "";
        // The node represents an object variable, and this object variables are
        // the target. Do the replacement or removals:
        PushVariablesRenamingChangesetRoot();
        RenameVariableAndVisitChild(node.name, node.child.get());
        PopVariablesRenamingChangesetNode(true);
      }
    } else {
      RenameVariableAndVisitChild(node.name, node.child.get());
    }
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    objectNameToUseForVariableAccessor = "";

    // TODO Literal expressions could be checked to handle renaming in
    // `expression` and in `child`.
    node.expression->Visit(*this);
    if (node.child) {
      PushVariablesRenamingChangesetNodeForIgnoredVariables();
      node.child->Visit(*this);
      PopVariablesRenamingChangesetNode(true);
    }
  }
  void OnVisitIdentifierNode(IdentifierNode &node) override {
    auto renameVariableAndChild = [this, &node]() {
      PushVariablesRenamingChangesetRoot();
      const gd::String oldVariableName = node.identifierName;
      RenameOrRemoveVariableOfTargetVariableContainer(node.identifierName);
      if (!node.childIdentifierName.empty()) {
        bool hasBeenPushed =
            PushVariablesRenamingChangesetNodeForVariable(oldVariableName);
        RenameOrRemoveVariableOfTargetVariableContainer(
            node.childIdentifierName);
        PopVariablesRenamingChangesetNode(hasBeenPushed);
      }
      PopVariablesRenamingChangesetNode(true);
    };

    auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();

    // The node represents a variable or an object variable in an expression
    // (and if it's a variable reference or a value does not have any importance
    // here).

    if (forcedVariablesContainer) {
      // A scope was forced. Honor it: it means this node represents a variable
      // of the forced variables container.
      if (forcedVariablesContainer == &targetVariablesContainer ||
          IsTargetingObjectGroup(forcedObjectName)) {
        renameVariableAndChild();
      }
      return;
    }

    // Match the potential *new* name of the variable, because refactorings are
    // done after changes in the variables container.
    projectScopedContainers.MatchIdentifierWithName<void>(
        node.identifierName,
        [&]() {
          // This represents an object.
          if (objectsContainersList.HasObjectOrGroupVariablesContainer(
                  node.identifierName, targetVariablesContainer) ||
              IsTargetingObjectGroup(node.identifierName)) {
            // The node represents an object variable, and this object variables
            // are the target. Do the replacement or removals:
            PushVariablesRenamingChangesetRoot();
            RenameOrRemoveVariableOfTargetVariableContainer(
                node.childIdentifierName);
            PopVariablesRenamingChangesetNode(true);
          }
        },
        [&]() {
          // This is a variable.
          if (&projectScopedContainers.GetVariablesContainersList()
                   .GetVariablesContainerFromVariableName(
                       node.identifierName) == &targetVariablesContainer) {
            // The node represents a variable, that can come from the target
            // (because the target is in the scope), replace or remove it:
            renameVariableAndChild();
          }
        },
        [&]() {
          // This is a property.
        },
        [&]() {
          // This is a parameter.
        },
        [&]() {
          // This is something else.
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
        const gd::VariablesContainer *oldForcedVariablesContainer =
            forcedVariablesContainer;
        const gd::String &oldForcedObjectName = forcedObjectName;

        forcedVariablesContainer = nullptr;
        forcedObjectName = "";
        if (parameterMetadata->GetType() == "globalvar") {
          forcedVariablesContainer =
              projectScopedContainers.GetVariablesContainersList()
                  .GetTopMostVariablesContainer();
        } else if (parameterMetadata->GetType() == "scenevar") {
          forcedVariablesContainer =
              projectScopedContainers.GetVariablesContainersList()
                  .GetBottomMostVariablesContainer();
        } else if (parameterMetadata->GetType() == "objectvar") {
          auto objectName = gd::ExpressionVariableOwnerFinder::GetObjectName(
              platform, projectScopedContainers.GetObjectsContainersList(),
              node.objectName, *node.parameters[parameterIndex].get());
          forcedVariablesContainer =
              projectScopedContainers.GetObjectsContainersList()
                  .GetObjectOrGroupVariablesContainer(objectName);
          forcedObjectName = objectName;
        }

        node.parameters[parameterIndex]->Visit(*this);
        forcedVariablesContainer = oldForcedVariablesContainer;
        forcedObjectName = oldForcedObjectName;
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

  bool IsTargetingObjectGroup(const gd::String &objectGroupName) {
    return !targetGroupName.empty() && objectGroupName == targetGroupName;
  }

  bool RenameOrRemoveVariableOfTargetVariableContainer(
      gd::String& variableName) {
    const auto *currentVariablesRenamingChangesetNode =
        GetCurrentVariablesRenamingChangesetNode();
    if (!currentVariablesRenamingChangesetNode) {
      return false;
    }
    const auto &oldToNewVariableNames =
        currentVariablesRenamingChangesetNode->oldToNewVariableNames;
    if (oldToNewVariableNames.count(variableName) >= 1) {
      variableName = oldToNewVariableNames.find(variableName)->second;
      hasDoneRenaming = true;
      return true;
    } else if (
      // Only the root variable is checked for removing.
      currentVariablesRenamingChangesetNode ==
                   &variablesRenamingChangesetRoot &&
               removedVariableNames.count(variableName) >= 1) {
      removedVariableUsed = true;
      return true;
    }

    return false;  // Nothing was changed or done.
  }

  void RenameVariableAndVisitChild(gd::String &variableName,
                                   ExpressionNode *childNode) {
    // `variableName` is modified by
    // `RenameOrRemoveVariableOfTargetVariableContainer`.
    const gd::String oldVariableName = variableName;
    RenameOrRemoveVariableOfTargetVariableContainer(variableName);
    if (childNode) {
      bool hasBeenPushed =
          PushVariablesRenamingChangesetNodeForVariable(oldVariableName);
      childNode->Visit(*this);
      PopVariablesRenamingChangesetNode(hasBeenPushed);
    }
  }

  void PushVariablesRenamingChangesetRoot() {
    variablesRenamingChangesetNodeStack.push_back(&variablesRenamingChangesetRoot);
  }

  void PushVariablesRenamingChangesetNodeForIgnoredVariables() {
    variablesRenamingChangesetNodeStack.push_back(nullptr);
  }

  const gd::VariablesRenamingChangesetNode *GetCurrentVariablesRenamingChangesetNode() {
    return variablesRenamingChangesetNodeStack.size() == 0 ?
    &variablesRenamingChangesetRoot :
        variablesRenamingChangesetNodeStack
            [variablesRenamingChangesetNodeStack.size() - 1];
  }

  bool PushVariablesRenamingChangesetNodeForVariable(const gd::String& variableName) {
    const auto *currentVariablesRenamingChangesetNode = GetCurrentVariablesRenamingChangesetNode();
    if (!currentVariablesRenamingChangesetNode) {
      // There were already no more change on a parent.
      return false;
    }
    const auto &childVariablesRenamingChangesetNodeItr =
        currentVariablesRenamingChangesetNode->modifiedVariables.find(
            variableName);
    if (childVariablesRenamingChangesetNodeItr ==
        currentVariablesRenamingChangesetNode->modifiedVariables.end()) {
      // There is no more change on the current variable child.
      variablesRenamingChangesetNodeStack.push_back(nullptr);
    }
    else {
      variablesRenamingChangesetNodeStack.push_back(
          childVariablesRenamingChangesetNodeItr->second.get());
    }
    return true;
  }

  void PopVariablesRenamingChangesetNode(bool hasBeenPushed) {
    if (hasBeenPushed) {
      variablesRenamingChangesetNodeStack.pop_back();
    }
  }

  // Scope:
  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::VariablesContainer* forcedVariablesContainer;
  gd::String forcedObjectName;

  // Renaming or removing to do:
  const gd::VariablesContainer& targetVariablesContainer;
  /**
   * Groups don't have VariablesContainer, so `targetVariablesContainer` will be
   * pointing to `nullVariablesContainer` and the group name is use instead to
   * check which variable accesses to modify in expressions.
   */
  const gd::String& targetGroupName;
  const VariablesRenamingChangesetNode &variablesRenamingChangesetRoot;
  const std::unordered_set<gd::String>& removedVariableNames;

  gd::String objectNameToUseForVariableAccessor;
  std::vector<const VariablesRenamingChangesetNode*> variablesRenamingChangesetNodeStack;
};

const gd::VariablesContainer*
EventsVariableReplacer::FindForcedVariablesContainerIfAny(
    const gd::String& type, const gd::String& lastObjectName) {
  // Handle legacy pre-scoped variable parameters: in this case, we
  // force the "scope" at which starts the evaluation of variables.
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
                                             variablesRenamingChangesetRoot,
                                             removedVariableNames,
                                             targetVariablesContainer,
                                             targetGroupName,
                                             type == "objectvar" ? lastObjectName : "");
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
                                       variablesRenamingChangesetRoot,
                                       removedVariableNames,
                                       targetVariablesContainer,
                                       targetGroupName,
                                       "");
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
