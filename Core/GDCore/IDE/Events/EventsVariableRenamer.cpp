/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsVariableRenamer.h"

#include <map>
#include <memory>
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
 * \brief Go through the nodes and rename any reference to an object behavior.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionVariableRenamer
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionVariableRenamer(
      const gd::Platform& platform_,
      const gd::ProjectScopedContainers& projectScopedContainers_,
      const gd::VariablesContainer& variablesContainerWithVariableToReplace_,
      const gd::String& oldVariableName_,
      const gd::String& newVariableName_)
      : hasDoneRenaming(false),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        forcedInitialVariablesContainer(nullptr),
        variablesContainerWithVariableToReplace(
            variablesContainerWithVariableToReplace_),
        oldVariableName(oldVariableName_),
        newVariableName(newVariableName_){};
  virtual ~ExpressionVariableRenamer(){};

  void SetForcedInitialVariablesContainer(
      const gd::VariablesContainer* forcedInitialVariablesContainer_) {
    forcedInitialVariablesContainer = forcedInitialVariablesContainer_;
  }

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
    auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    if (forcedInitialVariablesContainer) {
      // A scope was forced. Honor it.
      if (node.name == oldVariableName &&
          &variablesContainerWithVariableToReplace ==
              forcedInitialVariablesContainer) {
        node.name = newVariableName;
        hasDoneRenaming = true;
      }

      if (node.child) node.child->Visit(*this);
    } else if (objectsContainersList.HasObjectOrGroupNamed(node.name)) {
      // Remember the object name.
      objectNameToUseForVariableAccessor = node.name;
      if (node.child) node.child->Visit(*this);
      objectNameToUseForVariableAccessor = "";

    } else if (node.name == oldVariableName) {
      // We have a potential variable with the variable name to be renamed,
      // check if it's coming from the container where the renaming is being done:
      if (projectScopedContainers.GetVariablesContainersList()
              .HasVariablesContainer(variablesContainerWithVariableToReplace)) {
        node.name = newVariableName;
        hasDoneRenaming = true;
      }
      if (node.child) node.child->Visit(*this);
    } else {
      if (node.child) node.child->Visit(*this);
    }
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    auto& objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    if (!objectNameToUseForVariableAccessor.empty()) {
      if (node.name == oldVariableName) {
        // We have an object variable with the variable name to be renamed,
        // check if it's the same:
        if (objectsContainersList.HasVariablesContainer(
                objectNameToUseForVariableAccessor,
                variablesContainerWithVariableToReplace)) {
          node.name = newVariableName;
          hasDoneRenaming = true;
        }
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
      // A scope was forced. Honor it.
      if (node.identifierName == oldVariableName &&
          forcedInitialVariablesContainer ==
              &variablesContainerWithVariableToReplace) {
        node.identifierName = newVariableName;
        hasDoneRenaming = true;
      }
    } else if (objectsContainersList.HasObjectOrGroupNamed(
                   node.identifierName)) {
      if (node.childIdentifierName == oldVariableName) {
        // We have an object variable with the variable name to be renamed,
        // check if it's the same:
        if (objectsContainersList.HasVariablesContainer(
                node.identifierName, variablesContainerWithVariableToReplace)) {
          node.childIdentifierName = newVariableName;
          hasDoneRenaming = true;
        }
      }
    } else if (node.identifierName == oldVariableName) {
      // We have a potential variable with the variable name to be renamed,
      // check if it's coming from the container where the renaming is being done:
      if (projectScopedContainers.GetVariablesContainersList()
              .HasVariablesContainer(variablesContainerWithVariableToReplace)) {
        node.identifierName = newVariableName;
        hasDoneRenaming = true;
      }
    }
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

  // Scope:
  const gd::Platform& platform;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::VariablesContainer* forcedInitialVariablesContainer;

  // Renaming to do:
  const gd::VariablesContainer& variablesContainerWithVariableToReplace;
  const gd::String& oldVariableName;
  const gd::String& newVariableName;

  gd::String objectNameToUseForVariableAccessor;
};

bool EventsVariableRenamer::DoVisitInstruction(gd::Instruction& instruction,
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
        const gd::String& type = parameterMetadata.GetType();

        if (!gd::ParameterMetadata::IsExpression("variable", type) &&
            !gd::ParameterMetadata::IsExpression("number", type) &&
            !gd::ParameterMetadata::IsExpression("string", type))
          return;  // Not an expression that can contain variables.

        // Handle legacy pre-scoped variable parameters: in this case, we
        // force the "scope" at which starts the evalution of variables.
        const gd::VariablesContainer* forcedInitialVariablesContainer = nullptr;
        if (type == "objectvar") {
          forcedInitialVariablesContainer =
              GetProjectScopedContainers()
                  .GetObjectsContainersList()
                  .GetObjectOrGroupVariablesContainer(lastObjectName);
        } else if (type == "globalvar") {
          forcedInitialVariablesContainer = GetProjectScopedContainers()
                                                .GetVariablesContainersList()
                                                .GetTopMostVariablesContainer();
        } else if (type == "scenevar") {
          forcedInitialVariablesContainer =
              GetProjectScopedContainers()
                  .GetVariablesContainersList()
                  .GetBottomMostVariablesContainer();
        }

        auto node = parameterValue.GetRootNode();
        if (node) {
          ExpressionVariableRenamer renamer(
              platform,
              GetProjectScopedContainers(),
              variablesContainerWithVariableToReplace,
              oldVariableName,
              newVariableName);
          renamer.SetForcedInitialVariablesContainer(
              forcedInitialVariablesContainer);
          node->Visit(renamer);

          if (renamer.HasDoneRenaming()) {
            instruction.SetParameter(
                parameterIndex, ExpressionParser2NodePrinter::PrintNode(*node));
          }
        }
      });

  return false;
}

EventsVariableRenamer::~EventsVariableRenamer() {}

}  // namespace gd
