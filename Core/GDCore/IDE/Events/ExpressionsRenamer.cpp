/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ExpressionsRenamer.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
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
 * \brief Go through the nodes and change the given object name to a new one.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionFunctionRenamer
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionFunctionRenamer(const gd::ObjectsContainer& globalObjectsContainer_,
                            const gd::ObjectsContainer& objectsContainer_,
                            const gd::String& behaviorType_,
                            const gd::String& objectType_,
                            const gd::String& oldFunctionName_,
                            const gd::String& newFunctionName_)
      : hasDoneRenaming(false),
        globalObjectsContainer(globalObjectsContainer_),
        objectsContainer(objectsContainer_),
        behaviorType(behaviorType_),
        objectType(objectType_),
        oldFunctionName(oldFunctionName_),
        newFunctionName(newFunctionName_){};
  virtual ~ExpressionFunctionRenamer(){};

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
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    if (!node.behaviorFunctionName.empty()) {
      // Behavior function name
      if (!behaviorType.empty() &&
          node.behaviorFunctionName == oldFunctionName) {
        const gd::String& thisBehaviorType =
            gd::GetTypeOfBehavior(globalObjectsContainer,
                                  objectsContainer,
                                  node.objectFunctionOrBehaviorName);
        if (thisBehaviorType == behaviorType) {
          node.behaviorFunctionName = newFunctionName;
          hasDoneRenaming = true;
        }
      }
    } else {
      // Object function name
      if (behaviorType.empty() && !objectType.empty() &&
          node.objectFunctionOrBehaviorName == oldFunctionName) {
        const gd::String& thisObjectType = gd::GetTypeOfObject(
            globalObjectsContainer, objectsContainer, node.objectName);
        if (thisObjectType == objectType) {
          node.objectFunctionOrBehaviorName = newFunctionName;
          hasDoneRenaming = true;
        }
      }
    }
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    if (node.functionName == oldFunctionName) {
      if (behaviorType.empty() && !objectType.empty() &&
          !node.objectName.empty()) {
        // Replace an object function
        const gd::String& thisObjectType = gd::GetTypeOfObject(
            globalObjectsContainer, objectsContainer, node.objectName);
        if (thisObjectType == objectType) {
          node.functionName = newFunctionName;
          hasDoneRenaming = true;
        }
      } else if (!behaviorType.empty() && !node.behaviorName.empty()) {
        // Replace a behavior function
        const gd::String& thisBehaviorType = gd::GetTypeOfBehavior(
            globalObjectsContainer, objectsContainer, node.behaviorName);
        if (thisBehaviorType == behaviorType) {
          node.functionName = newFunctionName;
          hasDoneRenaming = true;
        }
      } else if (behaviorType.empty() && objectType.empty()) {
        // Replace a free function
        node.functionName = newFunctionName;
        hasDoneRenaming = true;
      }
    }
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  bool hasDoneRenaming;
  const gd::ObjectsContainer& globalObjectsContainer;
  const gd::ObjectsContainer& objectsContainer;
  const gd::String& behaviorType;  // The behavior type for which the expression
                                   // must be replaced (optional).
  const gd::String& objectType;    // The object type for which the expression
                                   // must be replaced (optional). If
                                   // `behaviorType` is not empty, it takes
                                   // precedence over `objectType`.
  const gd::String& oldFunctionName;
  const gd::String& newFunctionName;
};

bool ExpressionsRenamer::DoVisitInstruction(gd::Instruction& instruction,
                                            bool isCondition) {
  const auto& metadata = isCondition
                             ? gd::MetadataProvider::GetConditionMetadata(
                                   platform, instruction.GetType())
                             : gd::MetadataProvider::GetActionMetadata(
                                   platform, instruction.GetType());

  for (std::size_t pNb = 0; pNb < metadata.parameters.size() &&
                            pNb < instruction.GetParametersCount();
       ++pNb) {
    const gd::String& type = metadata.parameters[pNb].type;
    const gd::String& expression =
        instruction.GetParameter(pNb).GetPlainString();

    gd::ExpressionParser2 parser(
        platform, GetGlobalObjectsContainer(), GetObjectsContainer());

    auto node = gd::ParameterMetadata::IsExpression("number", type)
                    ? parser.ParseExpression("number", expression)
                    : (gd::ParameterMetadata::IsExpression("string", type)
                           ? parser.ParseExpression("string", expression)
                           : std::unique_ptr<gd::ExpressionNode>());
    if (node) {
      ExpressionFunctionRenamer renamer(GetGlobalObjectsContainer(),
                                        GetObjectsContainer(),
                                        behaviorType,
                                        objectType,
                                        oldFunctionName,
                                        newFunctionName);
      node->Visit(renamer);

      if (renamer.HasDoneRenaming()) {
        instruction.SetParameter(
            pNb, ExpressionParser2NodePrinter::PrintNode(*node));
      }
    }
  }

  return false;
}

ExpressionsRenamer::~ExpressionsRenamer() {}

}  // namespace gd
