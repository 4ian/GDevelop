/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionSelfCallChecker.h"

#include "GDCore/Events/Expression.h"
#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/ExpressionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Extensions/PlatformExtension.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunction.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

/**
 * \brief Check the type of the first condition or action.
 */
class GD_CORE_API FirstInstructionTypeChecker
    : public ReadOnlyArbitraryEventsWorker {
public:
  FirstInstructionTypeChecker(const gd::String &eventFunctionType_,
                              const bool isEventFunctionCondition_)
      : eventFunctionType(eventFunctionType_),
        isEventFunctionCondition(isEventFunctionCondition_),
        isOnlyCallingItself(false){};
  virtual ~FirstInstructionTypeChecker(){};

  void DoVisitInstruction(const gd::Instruction &instruction,
                          bool isCondition) override {
    if (isCondition == isEventFunctionCondition) {
      isOnlyCallingItself = instruction.GetType() == eventFunctionType;
      StopAnyEventIteration();
    }
  };

  bool isOnlyCallingItself;

private:
  gd::String eventFunctionType;
  bool isEventFunctionCondition;
};

/**
 * \brief Check the type of the first condition or action.
 */
class GD_CORE_API FirstActionExpressionTypeChecker
    : public ReadOnlyArbitraryEventsWorker,
      ExpressionParser2NodeWorker {
public:
  FirstActionExpressionTypeChecker(const gd::Platform &platform_,
                                   const gd::String &eventFunctionType_)
      : platform(platform_), eventFunctionType(eventFunctionType_),
        isOnlyCallingItself(false){};
  virtual ~FirstActionExpressionTypeChecker(){};

  void DoVisitInstruction(const gd::Instruction &instruction,
                          bool isCondition) override {
    // Typically, it should be a "return" action.
    if (!isCondition) {
      gd::String lastObjectParameter = "";
      const gd::InstructionMetadata &instrInfos =
          MetadataProvider::GetActionMetadata(platform, instruction.GetType());
      for (std::size_t pNb = 0; pNb < instrInfos.parameters.size(); ++pNb) {

        if (ParameterMetadata::IsExpression(
                "number", instrInfos.parameters[pNb].GetType()) ||
            ParameterMetadata::IsExpression(
                "string", instrInfos.parameters[pNb].GetType())) {
          auto node = instruction.GetParameter(pNb).GetRootNode();
          node->Visit(*this);
        }
      }
      StopAnyEventIteration();
    }
  }

  // Only check expressions that directly calls a function.
  void OnVisitFunctionCallNode(FunctionCallNode &node) override {
    isOnlyCallingItself |= node.functionName == eventFunctionType;
  }

  // Handle extra parenthesis.
  void OnVisitSubExpressionNode(SubExpressionNode &node) override {
    node.expression->Visit(*this);
  }
  void OnVisitOperatorNode(OperatorNode &node) override {}
  // Handle sign that could have been forgotten
  void OnVisitUnaryOperatorNode(UnaryOperatorNode &node) override {
    node.factor->Visit(*this);
  }
  void OnVisitNumberNode(NumberNode &node) override {}
  void OnVisitTextNode(TextNode &node) override {}
  void OnVisitVariableNode(VariableNode &node) override {}
  void OnVisitVariableAccessorNode(VariableAccessorNode &node) override {}
  void OnVisitVariableBracketAccessorNode(
      VariableBracketAccessorNode &node) override {}
  void OnVisitIdentifierNode(IdentifierNode &node) override {}
  void OnVisitObjectFunctionNameNode(ObjectFunctionNameNode &node) override {}
  void OnVisitEmptyNode(EmptyNode &node) override {}

  bool isOnlyCallingItself;

private:
  const gd::Platform &platform;
  gd::String eventFunctionType;
};

bool EventsFunctionSelfCallChecker::IsOnlyCallingItself(
    const gd::Project &project, const gd::String &functionFullType,
    const gd::EventsFunction &eventsFunction) {
  bool isOnlyCallingItself = false;

  if (eventsFunction.IsExpression()) {
    FirstActionExpressionTypeChecker eventWorker(project.GetCurrentPlatform(),
                                                 functionFullType);
    eventWorker.Launch(eventsFunction.GetEvents());
    isOnlyCallingItself = eventWorker.isOnlyCallingItself;
  } else {
    FirstInstructionTypeChecker eventWorker(functionFullType,
                                            !eventsFunction.IsAction());
    eventWorker.Launch(eventsFunction.GetEvents());
    isOnlyCallingItself = eventWorker.isOnlyCallingItself;
  }
  return isOnlyCallingItself;
}

bool EventsFunctionSelfCallChecker::IsFreeFunctionOnlyCallingItself(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsFunction &eventsFunction) {
  return IsOnlyCallingItself(
      project,
      PlatformExtension::GetEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsFunction.GetName()),
      eventsFunction);
}

bool EventsFunctionSelfCallChecker::IsBehaviorFunctionOnlyCallingItself(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedBehavior &eventsBasedBehavior,
    const gd::EventsFunction &eventsFunction) {
  return IsOnlyCallingItself(
      project,
      PlatformExtension::GetBehaviorEventsFunctionFullType(
          eventsFunctionsExtension.GetName(), eventsBasedBehavior.GetName(),
          eventsFunction.GetName()),
      eventsFunction);
}
bool EventsFunctionSelfCallChecker::IsObjectFunctionOnlyCallingItself(
    const gd::Project &project,
    const gd::EventsFunctionsExtension &eventsFunctionsExtension,
    const gd::EventsBasedObject &eventsBasedObject,
    const gd::EventsFunction &eventsFunction) {
  return IsOnlyCallingItself(project,
                             PlatformExtension::GetObjectEventsFunctionFullType(
                                 eventsFunctionsExtension.GetName(),
                                 eventsBasedObject.GetName(),
                                 eventsFunction.GetName()),
                             eventsFunction);
}

} // namespace gd
