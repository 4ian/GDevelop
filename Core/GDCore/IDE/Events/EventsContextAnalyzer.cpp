/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsContextAnalyzer.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

/**
 * \brief Go through the nodes and report any object found.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionObjectsAnalyzer
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionObjectsAnalyzer(EventsContext& context_) : context(context_){};
  virtual ~ExpressionObjectsAnalyzer(){};

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
  void OnVisitFunctionNode(FunctionNode& node) override {
    if (!node.objectName.empty()) {
      context.AddObjectName(node.objectName);
    }
    // TODO: we're potentially missing objects that are asked in parameters
    // of type "object", "objectPtr", "objectList".
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  EventsContext& context;
};

bool EventsContextAnalyzer::DoVisitInstruction(gd::Instruction& instruction,
                                               bool isCondition) {
  const gd::InstructionMetadata& instrInfo =
      isCondition ? MetadataProvider::GetConditionMetadata(
                        platform, instruction.GetType())
                  : MetadataProvider::GetActionMetadata(platform,
                                                        instruction.GetType());

  for (int i = 0; i < instruction.GetParametersCount() &&
                  i < instrInfo.GetParametersCount();
       ++i) {
    AnalyzeParameter(platform,
                     project,
                     layout,
                     instrInfo.GetParameter(i),
                     instruction.GetParameter(i),
                     context);
  }

  return false;
}

void EventsContextAnalyzer::AnalyzeParameter(
    const gd::Platform& platform,
    const gd::ObjectsContainer& project,
    const gd::ObjectsContainer& layout,
    const gd::ParameterMetadata& metadata,
    const gd::Expression& parameter,
    EventsContext& context) {
  const auto& value = parameter.GetPlainString();
  const auto& type = metadata.GetType();
  if (ParameterMetadata::IsObject(type)) {
    context.AddObjectName(value);
  } else if (ParameterMetadata::IsExpression("number", type)) {
    gd::ExpressionParser2 parser(platform, project, layout);
    auto node = parser.ParseExpression("number", value);

    ExpressionObjectsAnalyzer analyzer(context);
    node->Visit(analyzer);
  } else if (ParameterMetadata::IsExpression("string", type)) {
    gd::ExpressionParser2 parser(platform, project, layout);
    auto node = parser.ParseExpression("string", value);

    ExpressionObjectsAnalyzer analyzer(context);
    node->Visit(analyzer);
  }
}

void EventsContext::AddObjectName(const gd::String& objectName) {
  for (auto& realObjectName : ExpandObjectsName(objectName)) {
    objectNames.insert(realObjectName);
  }
  objectOrGroupNames.insert(objectName);
}

std::vector<gd::String> EventsContext::ExpandObjectsName(
    const gd::String& objectName) {
  // Note: this logic is duplicated in EventsCodeGenerator::ExpandObjectsName
  std::vector<gd::String> realObjects;
  if (project.GetObjectGroups().Has(objectName))
    realObjects =
        project.GetObjectGroups().Get(objectName).GetAllObjectsNames();
  else if (layout.GetObjectGroups().Has(objectName))
    realObjects = layout.GetObjectGroups().Get(objectName).GetAllObjectsNames();
  else
    realObjects.push_back(objectName);

  // Ensure that all returned objects actually exists.
  for (std::size_t i = 0; i < realObjects.size();) {
    if (!layout.HasObjectNamed(realObjects[i]) &&
        !project.HasObjectNamed(realObjects[i]))
      realObjects.erase(realObjects.begin() + i);
    else
      ++i;
  }

  return realObjects;
}

}  // namespace gd
