/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionsParameterMover.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

/**
 * \brief Go through the nodes and change the position of a parameter of the
 * given function.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionParameterMover
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionParameterMover(const gd::ProjectScopedContainers& projectScopedContainers_,
                           const gd::String& behaviorType_,
                           const gd::String& objectType_,
                           const gd::String& functionName_,
                           std::size_t oldIndex_,
                           std::size_t newIndex_)
      : hasDoneMoving(false),
        projectScopedContainers(projectScopedContainers_),
        behaviorType(behaviorType_),
        objectType(objectType_),
        functionName(functionName_),
        oldIndex(oldIndex_),
        newIndex(newIndex_){};
  virtual ~ExpressionParameterMover(){};

  bool HasDoneMoving() const { return hasDoneMoving; }

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
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableAccessorNode(VariableAccessorNode& node) override {
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode& node) override {
    node.expression->Visit(*this);
    if (node.child) node.child->Visit(*this);
  }
  void OnVisitIdentifierNode(IdentifierNode& node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    auto moveParameter =
        [this](std::vector<std::unique_ptr<gd::ExpressionNode>>& parameters, int firstWrittenParameterIndex) {
          size_t newExpressionIndex = newIndex - firstWrittenParameterIndex;
          size_t oldExpressionIndex = oldIndex - firstWrittenParameterIndex;

          if (oldExpressionIndex >= parameters.size() || newExpressionIndex >= parameters.size())
            return;

          auto movedParameterNode = std::move(parameters[oldExpressionIndex]);
          parameters.erase(parameters.begin() + oldExpressionIndex);
          parameters.insert(parameters.begin() + newExpressionIndex,
                            std::move(movedParameterNode));
        };

    if (node.functionName == functionName) {
      if (behaviorType.empty() && !objectType.empty() &&
          !node.objectName.empty()) {
        // Move parameter of an object function
        // This refactor only applies on events object functions
        // and events object functions doesn't exist yet.
        // This is a dead code.
        const gd::String& thisObjectType = projectScopedContainers
            .GetObjectsContainersList().GetTypeOfObject(node.objectName);
        if (thisObjectType == objectType) {
          moveParameter(node.parameters, 1);
          hasDoneMoving = true;
        }
      } else if (!behaviorType.empty() && !node.behaviorName.empty()) {
        // Move parameter of a behavior function
        const gd::String& thisBehaviorType = projectScopedContainers
            .GetObjectsContainersList().GetTypeOfBehavior(node.behaviorName);
        if (thisBehaviorType == behaviorType) {
          moveParameter(node.parameters, 2);
          hasDoneMoving = true;
        }
      } else if (behaviorType.empty() && objectType.empty()) {
        // Move parameter of a free function
        moveParameter(node.parameters, 1);
        hasDoneMoving = true;
      }
    }
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasDoneMoving;
  const gd::ProjectScopedContainers& projectScopedContainers;
  const gd::String& behaviorType;  // The behavior type of the function which
                                   // must have a parameter moved (optional).
  const gd::String& objectType;    // The object type of the function which
                                   // must have a parameter moved (optional). If
                                   // `behaviorType` is not empty, it takes
                                   // precedence over `objectType`.
  const gd::String& functionName;
  std::size_t oldIndex;
  std::size_t newIndex;
};

bool ExpressionsParameterMover::DoVisitInstruction(gd::Instruction& instruction,
                                                   bool isCondition) {
  const auto& metadata = isCondition
                             ? gd::MetadataProvider::GetConditionMetadata(
                                   platform, instruction.GetType())
                             : gd::MetadataProvider::GetActionMetadata(
                                   platform, instruction.GetType());

  for (std::size_t pNb = 0; pNb < metadata.parameters.size() &&
                            pNb < instruction.GetParametersCount();
       ++pNb) {
    const gd::String& type = metadata.parameters[pNb].GetType();
    const gd::Expression& expression = instruction.GetParameter(pNb);

    auto node = expression.GetRootNode();
    if (node) {
      ExpressionParameterMover mover(GetProjectScopedContainers(),
                                     behaviorType,
                                     objectType,
                                     functionName,
                                     oldIndex,
                                     newIndex);
      node->Visit(mover);

      if (mover.HasDoneMoving()) {
        instruction.SetParameter(
            pNb, ExpressionParser2NodePrinter::PrintNode(*node));
      }
    }
  }

  return false;
}

ExpressionsParameterMover::~ExpressionsParameterMover() {}

}  // namespace gd
