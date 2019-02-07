/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "EventsVariablesFinder.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Parsers/ExpressionParser2.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"

using namespace std;

namespace gd {

/**
 * \brief Go through the nodes and change the given object name to a new one.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API ExpressionParameterSearcher
    : public ExpressionParser2NodeWorker {
 public:
  ExpressionParameterSearcher(std::set<gd::String>& results_,
                              const gd::String& parameterType_,
                              const gd::String& objectName_ = "")
      : results(results_),
        parameterType(parameterType_),
        objectName(objectName_){};
  virtual ~ExpressionParameterSearcher(){};

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
    bool considerFunction = objectName.empty() || node.objectName == objectName;
    for (size_t i = 0; i < node.parameters.size() &&
                       i < node.expressionMetadata.parameters.size();
         ++i) {
      auto& parameterMetadata = node.expressionMetadata.parameters[i];
      if (considerFunction && parameterMetadata.GetType() == parameterType) {
        // Store the value of the parameter
        results.insert(
            gd::ExpressionParser2NodePrinter::PrintNode(*node.parameters[i]));
      } else {
        node.parameters[i]->Visit(*this);
      }
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  std::set<gd::String>& results;  ///< Reference to the std::set where argument
                                  ///< values must be stored.
  gd::String parameterType;  ///< The type of the parameters to be searched for.
  gd::String objectName;     ///< If not empty, parameters will be taken into
                             ///< account only if related to this object.
};

std::set<gd::String> EventsVariablesFinder::FindAllGlobalVariables(
    const gd::Platform& platform, const gd::Project& project) {
  std::set<gd::String> results;

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    std::set<gd::String> results2 =
        FindArgumentsInEvents(platform,
                              project,
                              project.GetLayout(i),
                              project.GetLayout(i).GetEvents(),
                              "globalvar");
    results.insert(results2.begin(), results2.end());
  }

  return results;
}

std::set<gd::String> EventsVariablesFinder::FindAllLayoutVariables(
    const gd::Platform& platform,
    const gd::Project& project,
    const gd::Layout& layout) {
  std::set<gd::String> results;

  std::set<gd::String> results2 = FindArgumentsInEvents(
      platform, project, layout, layout.GetEvents(), "scenevar");
  results.insert(results2.begin(), results2.end());

  return results;
}

std::set<gd::String> EventsVariablesFinder::FindAllObjectVariables(
    const gd::Platform& platform,
    const gd::Project& project,
    const gd::Layout& layout,
    const gd::Object& object) {
  std::set<gd::String> results;

  std::set<gd::String> results2 = FindArgumentsInEvents(platform,
                                                        project,
                                                        layout,
                                                        layout.GetEvents(),
                                                        "objectvar",
                                                        object.GetName());
  results.insert(results2.begin(), results2.end());

  return results;
}

std::set<gd::String> EventsVariablesFinder::FindArgumentsInInstructions(
    const gd::Platform& platform,
    const gd::Project& project,
    const gd::Layout& layout,
    const gd::InstructionsList& instructions,
    bool instructionsAreConditions,
    const gd::String& parameterType,
    const gd::String& objectName) {
  std::set<gd::String> results;

  for (std::size_t aId = 0; aId < instructions.size(); ++aId) {
    gd::String lastObjectParameter = "";
    gd::InstructionMetadata instrInfos =
        instructionsAreConditions ? MetadataProvider::GetConditionMetadata(
                                        platform, instructions[aId].GetType())
                                  : MetadataProvider::GetActionMetadata(
                                        platform, instructions[aId].GetType());
    for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
      // The parameter has the searched type...
      if (instrInfos.parameters[pNb].type == parameterType) {
        //...remember the value of the parameter.
        if (objectName.empty() || lastObjectParameter == objectName)
          results.insert(instructions[aId].GetParameter(pNb).GetPlainString());
      }
      // Search in expressions
      else if (ParameterMetadata::IsExpression(
                   "number", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression(
            "number", instructions[aId].GetParameter(pNb).GetPlainString());

        ExpressionParameterSearcher searcher(
            results, parameterType, objectName);
        node->Visit(searcher);
      }
      // Search in gd::String expressions
      else if (ParameterMetadata::IsExpression(
                   "string", instrInfos.parameters[pNb].type)) {
        gd::ExpressionParser2 parser(platform, project, layout);
        auto node = parser.ParseExpression(
            "number", instructions[aId].GetParameter(pNb).GetPlainString());

        ExpressionParameterSearcher searcher(
            results, parameterType, objectName);
        node->Visit(searcher);
      }
      // Remember the value of the last "object" parameter.
      else if (gd::ParameterMetadata::IsObject(
                   instrInfos.parameters[pNb].type)) {
        lastObjectParameter =
            instructions[aId].GetParameter(pNb).GetPlainString();
      }
    }

    if (!instructions[aId].GetSubInstructions().empty())
      FindArgumentsInInstructions(platform,
                                  project,
                                  layout,
                                  instructions[aId].GetSubInstructions(),
                                  instructionsAreConditions,
                                  parameterType);
  }

  return results;
}

std::set<gd::String> EventsVariablesFinder::FindArgumentsInEvents(
    const gd::Platform& platform,
    const gd::Project& project,
    const gd::Layout& layout,
    const gd::EventsList& events,
    const gd::String& parameterType,
    const gd::String& objectName) {
  std::set<gd::String> results;
  for (std::size_t i = 0; i < events.size(); ++i) {
    vector<const gd::InstructionsList*> conditionsVectors =
        events[i].GetAllConditionsVectors();
    for (std::size_t j = 0; j < conditionsVectors.size(); ++j) {
      std::set<gd::String> results2 =
          FindArgumentsInInstructions(platform,
                                      project,
                                      layout,
                                      *conditionsVectors[j],
                                      /*conditions=*/true,
                                      parameterType,
                                      objectName);
      results.insert(results2.begin(), results2.end());
    }

    vector<const gd::InstructionsList*> actionsVectors =
        events[i].GetAllActionsVectors();
    for (std::size_t j = 0; j < actionsVectors.size(); ++j) {
      std::set<gd::String> results2 =
          FindArgumentsInInstructions(platform,
                                      project,
                                      layout,
                                      *actionsVectors[j],
                                      /*conditions=*/false,
                                      parameterType,
                                      objectName);
      results.insert(results2.begin(), results2.end());
    }

    if (events[i].CanHaveSubEvents()) {
      std::set<gd::String> results2 =
          FindArgumentsInEvents(platform,
                                project,
                                layout,
                                events[i].GetSubEvents(),
                                parameterType,
                                objectName);
      results.insert(results2.begin(), results2.end());
    }
  }

  return results;
}

}  // namespace gd
