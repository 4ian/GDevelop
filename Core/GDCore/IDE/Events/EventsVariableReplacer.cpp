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
      const VariablesRenamingChangesetNode& variablesRenamingChangesetRoot_,
      const std::unordered_set<gd::String>& removedVariableNames_)
      : hasDoneRenaming(false),
        removedVariableUsed(false),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        forcedInitialVariablesContainer(nullptr),
        targetVariablesContainer(targetVariablesContainer_),
        variablesRenamingChangesetRoot(variablesRenamingChangesetRoot_),
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
            bool hasBeenPushed = PushVariablesRenamingChangesetNodeForNewVariable(node.name);
            RenameOrRemoveVariableOfTargetVariableContainer(node.name);
            if (node.child) node.child->Visit(*this);
            PopVariablesRenamingChangesetNode(hasBeenPushed);
          }
          else {
            if (node.child) {
              bool hasBeenPushed = PushVariablesRenamingChangesetNodeForIgnoredVariables();
              node.child->Visit(*this);
              PopVariablesRenamingChangesetNode(hasBeenPushed);
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
              objectNameToUseForVariableAccessor, targetVariablesContainer)) {
        // The node represents an object variable, and this object variables are
        // the target. Do the replacement or removals:
        bool hasBeenPushed = PushVariablesRenamingChangesetNodeForNewVariable(node.name);
        RenameOrRemoveVariableOfTargetVariableContainer(node.name);
        if (node.child) {
          node.child->Visit(*this);
        }
        PopVariablesRenamingChangesetNode(hasBeenPushed);
      }
      objectNameToUseForVariableAccessor = "";
    } else {
      bool hasBeenPushed = PushVariablesRenamingChangesetNodeForChild(node.name);
      RenameOrRemoveVariableOfTargetVariableContainer(node.name);
      if (node.child) {
        node.child->Visit(*this);
      }
      PopVariablesRenamingChangesetNode(hasBeenPushed);
    }
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    objectNameToUseForVariableAccessor = "";

    // TODO Literal expressions could be checked to handle renaming in
    // `expression` and in `child`.
    node.expression->Visit(*this);
    if (node.child) {
      bool hasBeenPushed = PushVariablesRenamingChangesetNodeForIgnoredVariables();
      node.child->Visit(*this);
      PopVariablesRenamingChangesetNode(hasBeenPushed);
    }
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
        node.identifierName,
        [&]() {
          // This represents an object.
          if (objectsContainersList.HasObjectOrGroupVariablesContainer(
                  node.identifierName, targetVariablesContainer)) {
            // The node represents an object variable, and this object variables
            // are the target. Do the replacement or removals:
            bool hasBeenPushed = PushVariablesRenamingChangesetNodeForNewVariable(node.childIdentifierName);
            RenameOrRemoveVariableOfTargetVariableContainer(
                node.childIdentifierName);
            PopVariablesRenamingChangesetNode(hasBeenPushed);
          }
        },
        [&]() {
          // This is a variable.
          if (&projectScopedContainers.GetVariablesContainersList()
                   .GetVariablesContainerFromVariableName(
                       node.identifierName) == &targetVariablesContainer) {
            // The node represents a variable, that can come from the target
            // (because the target is in the scope), replace or remove it:
            
          bool hasBeenPushed = PushVariablesRenamingChangesetNodeForNewVariable(node.identifierName);
          RenameOrRemoveVariableOfTargetVariableContainer(
              node.identifierName);
          if (hasBeenPushed) {
            bool hasBeenPushed = PushVariablesRenamingChangesetNodeForNewVariable(node.childIdentifierName);
            RenameOrRemoveVariableOfTargetVariableContainer(
                node.childIdentifierName);
            PopVariablesRenamingChangesetNode(hasBeenPushed);
          }
          PopVariablesRenamingChangesetNode(hasBeenPushed);
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

  bool PushVariablesRenamingChangesetNodeForNewVariable(const gd::String& variableName) {
      variablesRenamingChangesetNodeStack.push_back(&variablesRenamingChangesetRoot);
    return true;
  }

  bool PushVariablesRenamingChangesetNodeForIgnoredVariables() {
      variablesRenamingChangesetNodeStack.push_back(nullptr);
    return true;
  }

  const gd::VariablesRenamingChangesetNode *GetCurrentVariablesRenamingChangesetNode() {
    return variablesRenamingChangesetNodeStack.size() == 0 ?
    &variablesRenamingChangesetRoot :
        variablesRenamingChangesetNodeStack
            [variablesRenamingChangesetNodeStack.size() - 1];
  }

  bool PushVariablesRenamingChangesetNodeForChild(const gd::String& childVariableName) {
    const auto *currentVariablesRenamingChangesetNode = GetCurrentVariablesRenamingChangesetNode();
    if (!currentVariablesRenamingChangesetNode) {
      // There were already no more change on a parent.
      return false;
    }
    const auto &childVariablesRenamingChangesetNodeItr =
        currentVariablesRenamingChangesetNode->modifiedVariables.find(
            childVariableName);
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
      variablesRenamingChangesetNodeStack.push_back(&variablesRenamingChangesetRoot);
    }
  }

  // Scope:
  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::VariablesContainer* forcedInitialVariablesContainer;

  // Renaming or removing to do:
  const gd::VariablesContainer& targetVariablesContainer;
  const VariablesRenamingChangesetNode &variablesRenamingChangesetRoot;
  const std::unordered_set<gd::String>& removedVariableNames;

  gd::String objectNameToUseForVariableAccessor;
  std::vector<const VariablesRenamingChangesetNode*> variablesRenamingChangesetNodeStack;
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
                                             variablesRenamingChangesetRoot,
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
                                       variablesRenamingChangesetRoot,
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
