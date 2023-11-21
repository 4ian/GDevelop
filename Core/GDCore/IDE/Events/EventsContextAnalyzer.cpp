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
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/IDE/Events/ExpressionTypeFinder.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/ProjectScopedContainers.h"
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
  ExpressionObjectsAnalyzer(
        const gd::Platform &platform_,
        const gd::ProjectScopedContainers &projectScopedContainers_,
        const gd::String &rootType_,
        EventsContext& context_) :
        platform(platform_),
        projectScopedContainers(projectScopedContainers_),
        rootType(rootType_),
        context(context_){};
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
    auto type = gd::ExpressionTypeFinder::GetType(platform, projectScopedContainers, rootType, node);

    if (gd::ParameterMetadata::IsExpression("variable", type)) {
      // Nothing to do (this can't reference an object)
    } else {
      projectScopedContainers.MatchIdentifierWithName<void>(node.name, [&]() {
          // This is an object variable.
          context.AddObjectName(projectScopedContainers, node.name);
        }, [&]() {
          // This is a variable.
        }, [&]() {
          // This is a property.
        }, [&]() {
          // This is a parameter.
        }, [&]() {
          // This is something else.
        });
    }

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
    auto type = gd::ExpressionTypeFinder::GetType(platform, projectScopedContainers, rootType, node);
    if (gd::ParameterMetadata::IsObject(type)) {
      context.AddObjectName(projectScopedContainers, node.identifierName);
    } else if (gd::ParameterMetadata::IsExpression("variable", type)) {
      // Nothing to do (identifier is a variable but not an object).
    } else {
      projectScopedContainers.MatchIdentifierWithName<void>(node.identifierName, [&]() {
          // This is an object variable.
          context.AddObjectName(projectScopedContainers, node.identifierName);
        }, [&]() {
          // This is a variable.
        }, [&]() {
          // This is a property.
        }, [&]() {
          // This is a parameter.
        }, [&]() {
          // This is something else.
        });
    }
  }
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode& node) override {
    if (!node.objectName.empty()) {
      context.AddObjectName(projectScopedContainers, node.objectName);

      if (!node.behaviorFunctionName.empty()) {
        context.AddBehaviorName(projectScopedContainers, node.objectName, node.objectFunctionOrBehaviorName);
      }
    }
  }
  void OnVisitFunctionCallNode(FunctionCallNode& node) override {
    if (!node.objectName.empty()) {
      context.AddObjectName(projectScopedContainers, node.objectName);

      if (!node.behaviorName.empty()) {
        context.AddBehaviorName(projectScopedContainers, node.objectName, node.behaviorName);
      }
    }
    for (auto& parameter : node.parameters) {
      parameter->Visit(*this);
    }
  }
  void OnVisitEmptyNode(EmptyNode& node) override {}

 private:
  const gd::Platform &platform;
  const gd::ProjectScopedContainers &projectScopedContainers;
  const gd::String rootType;

  EventsContext& context;
};

bool EventsContextAnalyzer::DoVisitInstruction(gd::Instruction& instruction,
                                               bool isCondition) {
  const gd::InstructionMetadata& instrInfo =
      isCondition ? MetadataProvider::GetConditionMetadata(
                        platform, instruction.GetType())
                  : MetadataProvider::GetActionMetadata(platform,
                                                        instruction.GetType());

  gd::ParameterMetadataTools::IterateOverParameters(
      instruction.GetParameters(),
      instrInfo.parameters,
      [this](const gd::ParameterMetadata& parameterMetadata,
             const gd::Expression& parameterValue,
             const gd::String& lastObjectName) {
        AnalyzeParameter(platform,
                         GetProjectScopedContainers(),
                         parameterMetadata,
                         parameterValue,
                         context,
                         lastObjectName);
      });

  return false;
}

void EventsContextAnalyzer::AnalyzeParameter(
    const gd::Platform& platform,
    const gd::ProjectScopedContainers& projectScopedContainers,
    const gd::ParameterMetadata& metadata,
    const gd::Expression& parameter,
    EventsContext& context,
    const gd::String& lastObjectName) {
  const auto& value = parameter.GetPlainString();
  const auto& type = metadata.GetType();
  if (ParameterMetadata::IsObject(type)) {
    context.AddObjectName(projectScopedContainers, value);
  } else if (ParameterMetadata::IsExpression("number", type)) {
    auto node = parameter.GetRootNode();

    ExpressionObjectsAnalyzer analyzer(platform, projectScopedContainers, "number", context);
    node->Visit(analyzer);
  } else if (ParameterMetadata::IsExpression("string", type)) {
    auto node = parameter.GetRootNode();

    ExpressionObjectsAnalyzer analyzer(platform, projectScopedContainers, "string", context);
    node->Visit(analyzer);
  } else if (ParameterMetadata::IsBehavior(type)) {
    context.AddBehaviorName(projectScopedContainers, lastObjectName, value);
  }
}

void EventsContext::AddObjectName(const gd::ProjectScopedContainers& projectScopedContainers,
                                  const gd::String& objectOrGroupName) {
  auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
  for (auto& realObjectName : objectsContainersList.ExpandObjectName(objectOrGroupName)) {
    objectNames.insert(realObjectName);
  }
  referencedObjectOrGroupNames.insert(objectOrGroupName);
}

void EventsContext::AddBehaviorName(const gd::ProjectScopedContainers& projectScopedContainers,
                                    const gd::String& objectOrGroupName,
                                    const gd::String& behaviorName) {
                                      auto& objectsContainersList = projectScopedContainers.GetObjectsContainersList();
  for (auto& realObjectName : objectsContainersList.ExpandObjectName(objectOrGroupName)) {
    objectOrGroupBehaviorNames[realObjectName].insert(behaviorName);
  }
  objectOrGroupBehaviorNames[objectOrGroupName].insert(behaviorName);
}

}  // namespace gd
