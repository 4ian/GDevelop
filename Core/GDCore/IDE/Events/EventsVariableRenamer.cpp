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
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/Project/ProjectScopedContainers.h"
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
  ExpressionVariableRenamer(const gd::ProjectScopedContainers& projectScopedContainers_,
                            const gd::VariablesContainer& variablesContainer_,
                            const gd::String& oldVariableName_,
                            const gd::String& newVariableName_)
      : hasDoneRenaming(false),
        projectScopedContainers(projectScopedContainers_),
        variablesContainer(variablesContainer_),
        oldVariableName(oldVariableName_),
        newVariableName(newVariableName_){};
  virtual ~ExpressionVariableRenamer(){};

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
    auto & objectsContainersList = projectScopedContainers.GetObjectsContainersList();
    if (objectsContainersList.HasObjectOrGroupNamed(node.name)) {
      objectNameToUseForVariableAccessor = node.name;
      if (node.child) node.child->Visit(*this);
      objectNameToUseForVariableAccessor = "";

    } else if (node.name == oldVariableName) {
      if (projectScopedContainers.GetVariablesContainersList().HasVariablesContainer(variablesContainer)) {
        node.name = newVariableName;
        hasDoneRenaming = true;
      }
      if (node.child) node.child->Visit(*this);
    } else {
      if (node.child) node.child->Visit(*this);
    }

  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    auto & objectsContainersList = projectScopedContainers.GetObjectsContainersList();
    if (!objectNameToUseForVariableAccessor.empty()) {
      if (node.name == oldVariableName) {
        // We have an object variable with the variable name to be renamed, check if it's the same:
        if (objectsContainersList.HasVariablesContainer(objectNameToUseForVariableAccessor, variablesContainer)) {
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
    // auto type = gd::ExpressionTypeFinder::GetType(platform,
    //                                         codeGenerator.GetObjectsContainersList(),
    //                                         rootType,
    //                                         node);

    auto & objectsContainersList = projectScopedContainers.GetObjectsContainersList();

  // if (gd::ParameterMetadata::IsExpression("variable", type)) {
    // The node is a variable inside an expression waiting for a *variable* to be returned, not its value.
    // TODO
  // } else {
    // The node represents a variable or an object variable in an expression waiting for its *value* to be returned.

    if (objectsContainersList.HasObjectOrGroupNamed(node.identifierName)) {
      if (node.childIdentifierName == oldVariableName) {
        // We have an object variable with the variable name to be renamed, check if it's the same:
        if (objectsContainersList.HasVariablesContainer(node.identifierName, variablesContainer)) {
          node.childIdentifierName = newVariableName;
          hasDoneRenaming = true;
        }
      }
    } else if (node.identifierName == oldVariableName) {
      if (projectScopedContainers.GetVariablesContainersList().HasVariablesContainer(variablesContainer)) {
        node.identifierName = newVariableName;
        hasDoneRenaming = true;
      }

    }
    // else {
      // The identifier does not represents a variable (or a child variable), or not at least an existing
      // one, nor an object variable. It's invalid.
    // }
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasDoneRenaming;
  const gd::VariablesContainer& variablesContainer;
  const gd::ProjectScopedContainers& projectScopedContainers;
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

        if (gd::ParameterMetadata::IsExpression("variable", type)) {
          // ???
          // TODO: Handle "old" objectvar/scenevar/globalvar
        } else {
          auto node = parameterValue.GetRootNode();
          if (node) {
            ExpressionVariableRenamer renamer(GetProjectScopedContainers(),
                                              variablesContainer,
                                              oldVariableName,
                                              newVariableName);
            node->Visit(renamer);

            if (renamer.HasDoneRenaming()) {
              instruction.SetParameter(
                  parameterIndex,
                  ExpressionParser2NodePrinter::PrintNode(*node));
            }
          }
        }
      });

  return false;
}

EventsVariableRenamer::~EventsVariableRenamer() {}

}  // namespace gd
