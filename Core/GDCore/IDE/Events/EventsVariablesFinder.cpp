/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#include "EventsVariablesFinder.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/IDE/DependenciesAnalyzer.h"

using namespace std;

namespace gd {
namespace {
/**
 * \brief Go through the nodes to search for variable occurrences.
 *
 * \see gd::ExpressionParser2
 */
class GD_CORE_API VariableFinderExpressionNodeWorker
    : public ExpressionParser2NodeWorker {
 public:
  VariableFinderExpressionNodeWorker(std::set<gd::String>& results_,
                              const gd::Platform &platform_,
                              const gd::ProjectScopedContainers &projectScopedContainers_,
                              const gd::String& parameterType_,
                              const gd::String& objectName_ = "")
      : results(results_),
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        parameterType(parameterType_),
        objectName(objectName_){};
  virtual ~VariableFinderExpressionNodeWorker(){};

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
    // We don't check variables or object variables here, because object variables only work
    // if the variable is already declared.

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
  void OnVisitIdentifierNode(IdentifierNode& node) override {
    // We don't check object variables here, because object variables only work
    // if the variable is already declared.
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {}
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    bool considerFunction = objectName.empty() || node.objectName == objectName;

    const bool isObjectFunction = !node.objectName.empty();
    const gd::ExpressionMetadata &metadata = isObjectFunction ?
            MetadataProvider::GetObjectAnyExpressionMetadata(
                platform,
                projectScopedContainers.GetObjectsContainersList().GetTypeOfObject(objectName),
                node.functionName):
            MetadataProvider::GetAnyExpressionMetadata(platform, node.functionName);

    if (gd::MetadataProvider::IsBadExpressionMetadata(metadata)) {
      return;
    }

    size_t parameterIndex = 0;
    for (size_t metadataIndex = (isObjectFunction ? 1 : 0); metadataIndex < metadata.parameters.size()
      && parameterIndex < node.parameters.size(); ++metadataIndex) {
      auto& parameterMetadata = metadata.parameters[metadataIndex];
      if (parameterMetadata.IsCodeOnly()) {
        continue;
      }
      auto& parameterNode = node.parameters[parameterIndex];
      ++parameterIndex;

      if (considerFunction && parameterMetadata.GetType() == parameterType) {
        // Store the value of the parameter
        results.insert(
            gd::ExpressionParser2NodePrinter::PrintNode(*parameterNode));
      } else {
        parameterNode->Visit(*this);
      }
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  const gd::Platform &platform;
  const gd::ProjectScopedContainers &projectScopedContainers;

  std::set<gd::String>& results;  ///< Reference to the std::set where argument
                                  ///< values must be stored.
  gd::String parameterType;  ///< The type of the parameters to be searched for.
  gd::String objectName;     ///< If not empty, parameters will be taken into
                             ///< account only if related to this object.
};

/**
 * \brief Go through the events to search for variable occurrences.
 */
class GD_CORE_API VariableFinderEventWorker
    : public ReadOnlyArbitraryEventsWorkerWithContext {
 public:
  VariableFinderEventWorker(std::set<gd::String>& results_,
                              const gd::Platform &platform_,
                              const gd::String& parameterType_,
                              const gd::String& objectName_ = "")
      : results(results_),
        platform(platform_),
        parameterType(parameterType_),
        objectName(objectName_){};
  virtual ~VariableFinderEventWorker(){};

  void DoVisitInstructionList(const gd::InstructionsList& instructions,
                                      bool areConditions) override {
    for (std::size_t aId = 0; aId < instructions.size(); ++aId) {
      auto& instruction = instructions[aId];
      gd::String lastObjectParameter = "";
      const gd::InstructionMetadata& instrInfos =
          areConditions ? MetadataProvider::GetConditionMetadata(
                              platform, instruction.GetType())
                        : MetadataProvider::GetActionMetadata(
                              platform, instruction.GetType());
      for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {
        // The parameter has the searched type...
        if (instrInfos.parameters[pNb].GetType() == parameterType) {
          //...remember the value of the parameter.
          if (objectName.empty() || lastObjectParameter == objectName)
            results.insert(instruction.GetParameter(pNb).GetPlainString());
        }
        // Search in expressions
        else if (ParameterMetadata::IsExpression(
                    "number", instrInfos.parameters[pNb].GetType()) ||
                ParameterMetadata::IsExpression(
                    "string", instrInfos.parameters[pNb].GetType())) {
          auto node = instruction.GetParameter(pNb).GetRootNode();

          VariableFinderExpressionNodeWorker searcher(
              results,
              platform,
              GetProjectScopedContainers(),
              parameterType,
              objectName);
          node->Visit(searcher);
        }
        // Remember the value of the last "object" parameter.
        else if (gd::ParameterMetadata::IsObject(
                    instrInfos.parameters[pNb].GetType())) {
          lastObjectParameter =
              instruction.GetParameter(pNb).GetPlainString();
        }
      }
    }
  };

 private:
  const gd::Platform &platform;

  std::set<gd::String>& results;  ///< Reference to the std::set where argument
                                  ///< values must be stored.
  gd::String parameterType;  ///< The type of the parameters to be searched for.
  gd::String objectName;     ///< If not empty, parameters will be taken into
                             ///< account only if related to this object.
};
} // namespace

std::set<gd::String> EventsVariablesFinder::FindAllGlobalVariables(
    const gd::Platform& platform, const gd::Project& project) {
  std::set<gd::String> results;

  for (std::size_t i = 0; i < project.GetLayoutsCount(); ++i) {
    FindArgumentsInEventsAndDependencies(
            results,
            platform,
            project,
            project.GetLayout(i),
            "globalvar");
  }

  return results;
}

std::set<gd::String> EventsVariablesFinder::FindAllLayoutVariables(
    const gd::Platform& platform,
    const gd::Project& project,
    const gd::Layout& layout) {
  std::set<gd::String> results;

  FindArgumentsInEventsAndDependencies(
      results,
      platform,
      project,
      layout,
      "scenevar");

  return results;
}

std::set<gd::String> EventsVariablesFinder::FindAllObjectVariables(
    const gd::Platform& platform,
    const gd::Project& project,
    const gd::Layout& layout,
    const gd::Object& object) {
  std::set<gd::String> results;

  FindArgumentsInEventsAndDependencies(
      results,
      platform,
      project,
      layout,
      "objectvar",
      object.GetName());

  return results;
}

void EventsVariablesFinder::FindArgumentsInEventsAndDependencies(
    std::set<gd::String>& results,
    const gd::Platform& platform,
    const gd::Project& project,
    const gd::Layout& layout,
    const gd::String& parameterType,
    const gd::String& objectName) {

  VariableFinderEventWorker eventWorker(results,
                                        platform,
                                        parameterType,
                                        objectName);
  eventWorker.Launch(layout.GetEvents(),
      gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout));

  DependenciesAnalyzer dependenciesAnalyzer(project, layout);
  dependenciesAnalyzer.Analyze();
  for (const gd::String& externalEventName : dependenciesAnalyzer.GetExternalEventsDependencies()) {
    const gd::ExternalEvents& externalEvents = project.GetExternalEvents(externalEventName);

    VariableFinderEventWorker eventWorker(results,
                                          platform,
                                          parameterType,
                                          objectName);
    eventWorker.Launch(externalEvents.GetEvents(),
        gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, layout));
  }
  for (const gd::String& sceneName : dependenciesAnalyzer.GetScenesDependencies()) {
    const gd::Layout& dependencyLayout = project.GetLayout(sceneName);

    VariableFinderEventWorker eventWorker(results,
                                          platform,
                                          parameterType,
                                          objectName);
    eventWorker.Launch(dependencyLayout.GetEvents(),
        gd::ProjectScopedContainers::MakeNewProjectScopedContainersForProjectAndLayout(project, dependencyLayout));
  }
}

}  // namespace gd
