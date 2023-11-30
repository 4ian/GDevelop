/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsBehaviorRenamer.h"

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
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

/**
 * \brief Go through the nodes and rename any reference to an object behavior.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionBehaviorRenamer
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionBehaviorRenamer(const gd::String& objectName_,
                            const gd::String& oldBehaviorName_,
                            const gd::String& newBehaviorName_)
      : hasDoneRenaming(false),
        objectName(objectName_),
        oldBehaviorName(oldBehaviorName_),
        newBehaviorName(newBehaviorName_){};
  virtual ~ExpressionBehaviorRenamer(){};

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
      if (node.objectName == objectName && node.objectFunctionOrBehaviorName == oldBehaviorName) {
          node.objectFunctionOrBehaviorName = newBehaviorName;
          hasDoneRenaming = true;
      }
    }
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    if (!node.behaviorName.empty()) {
      // Behavior function call
      if (node.objectName == objectName && node.behaviorName == oldBehaviorName) {
        node.behaviorName = newBehaviorName;
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
  const gd::String& objectName;  // The object name for which the behavior
                                 // must be replaced.
  const gd::String& oldBehaviorName;
  const gd::String& newBehaviorName;
};

bool EventsBehaviorRenamer::DoVisitInstruction(gd::Instruction& instruction,
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

        if (gd::ParameterMetadata::IsBehavior(type)) {
          if (lastObjectName == objectName) {
            if (parameterValue.GetPlainString() == oldBehaviorName) {
              instruction.SetParameter(parameterIndex,
                                       gd::Expression(newBehaviorName));
            }
          }
        } else {
          auto node = parameterValue.GetRootNode();
          if (node) {
            ExpressionBehaviorRenamer renamer(objectName,
                                              oldBehaviorName,
                                              newBehaviorName);
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

EventsBehaviorRenamer::~EventsBehaviorRenamer() {}

}  // namespace gd
