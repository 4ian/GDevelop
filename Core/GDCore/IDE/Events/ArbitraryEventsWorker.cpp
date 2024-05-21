/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include <map>
#include <memory>
#include <iostream>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Instruction.h"
#include "GDCore/Events/Expression.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

AbstractArbitraryEventsWorker::~AbstractArbitraryEventsWorker() {}

void AbstractArbitraryEventsWorker::VisitEventList(gd::EventsList& events) {
  DoVisitEventList(events);

  for (std::size_t i = 0; i < events.size();) {
    if (events[i].AcceptVisitor(*this))
      events.RemoveEvent(i);
    else {
      ++i;
    }
  }
}

bool AbstractArbitraryEventsWorker::VisitEvent(gd::BaseEvent& event) {
  bool shouldDelete = DoVisitEvent(event);
  if (shouldDelete) return true;

  vector<gd::InstructionsList*> conditionsVectors =
      event.GetAllConditionsVectors();
  for (std::size_t j = 0; j < conditionsVectors.size(); ++j)
    VisitInstructionList(*conditionsVectors[j], true);

  vector<gd::InstructionsList*> actionsVectors = event.GetAllActionsVectors();
  for (std::size_t j = 0; j < actionsVectors.size(); ++j)
    VisitInstructionList(*actionsVectors[j], false);

  auto allExpressionsWithMetadata = event.GetAllExpressionsWithMetadata();
  for (auto& expressionAndMetadata : allExpressionsWithMetadata) {
    shouldDelete |= VisitEventExpression(
      *expressionAndMetadata.first, expressionAndMetadata.second);
  }

  if (!shouldDelete && event.CanHaveSubEvents()) {
    VisitEventList(event.GetSubEvents());
  }
  return shouldDelete;
}

bool AbstractArbitraryEventsWorker::VisitLinkEvent(gd::LinkEvent& linkEvent) {
  return DoVisitLinkEvent(linkEvent);
}

void AbstractArbitraryEventsWorker::VisitInstructionList(
    gd::InstructionsList& instructions, bool areConditions) {
  DoVisitInstructionList(instructions, areConditions);

  for (std::size_t i = 0; i < instructions.size();) {
    if (VisitInstruction(instructions[i], areConditions))
      instructions.Remove(i);
    else {
      if (!instructions[i].GetSubInstructions().empty())
        VisitInstructionList(instructions[i].GetSubInstructions(),
                             areConditions);
      ++i;
    }
  }
}

bool AbstractArbitraryEventsWorker::VisitInstruction(gd::Instruction& instruction,
                                             bool isCondition) {
  return DoVisitInstruction(instruction, isCondition);
}

bool AbstractArbitraryEventsWorker::VisitEventExpression(gd::Expression& expression,
                                                 const gd::ParameterMetadata& metadata) {
  return DoVisitEventExpression(expression, metadata);
}

AbstractReadOnlyArbitraryEventsWorker::~AbstractReadOnlyArbitraryEventsWorker() {}

void AbstractReadOnlyArbitraryEventsWorker::VisitEventList(const gd::EventsList& events) {
  DoVisitEventList(events);

  for (std::size_t i = 0; i < events.size(); ++i) {
    if (shouldStopIteration) {
      break;
    }
    events[i].AcceptVisitor(*this);

    if (events[i].CanHaveSubEvents()) {
      VisitEventList(events[i].GetSubEvents());
    }
  }
}

void AbstractReadOnlyArbitraryEventsWorker::VisitEvent(const gd::BaseEvent& event) {
  DoVisitEvent(event);

  const vector<const gd::InstructionsList*> conditionsVectors =
      event.GetAllConditionsVectors();
  for (std::size_t j = 0; j < conditionsVectors.size(); ++j) {
    if (shouldStopIteration) {
      break;
    }
    VisitInstructionList(*conditionsVectors[j], true);
  }

  const vector<const gd::InstructionsList*> actionsVectors = event.GetAllActionsVectors();
  for (std::size_t j = 0; j < actionsVectors.size(); ++j) {
    if (shouldStopIteration) {
      break;
    }
    VisitInstructionList(*actionsVectors[j], false);
  }
}

void AbstractReadOnlyArbitraryEventsWorker::VisitLinkEvent(const gd::LinkEvent& linkEvent) {
  DoVisitLinkEvent(linkEvent);
}

void AbstractReadOnlyArbitraryEventsWorker::VisitInstructionList(
    const gd::InstructionsList& instructions, bool areConditions) {
  DoVisitInstructionList(instructions, areConditions);

  for (std::size_t i = 0; i < instructions.size(); ++i) {
    if (shouldStopIteration) {
      break;
    }
    VisitInstruction(instructions[i], areConditions);
    if (!instructions[i].GetSubInstructions().empty()) {
      VisitInstructionList(instructions[i].GetSubInstructions(),
                            areConditions);
    }
  }
}

void AbstractReadOnlyArbitraryEventsWorker::VisitInstruction(const gd::Instruction& instruction,
                                             bool isCondition) {
  DoVisitInstruction(instruction, isCondition);
}


void AbstractReadOnlyArbitraryEventsWorker::VisitEventExpression(const gd::Expression& expression,
                                                 const gd::ParameterMetadata& metadata) {
  DoVisitEventExpression(expression, metadata);
}

void AbstractReadOnlyArbitraryEventsWorker::StopAnyEventIteration() {
  shouldStopIteration = true;
}

ArbitraryEventsWorker::~ArbitraryEventsWorker() {}

bool ArbitraryEventsWorker::VisitEvent(gd::BaseEvent &event) {
  return AbstractArbitraryEventsWorker::VisitEvent(event);
}

ArbitraryEventsWorkerWithContext::~ArbitraryEventsWorkerWithContext() {}

bool ArbitraryEventsWorkerWithContext::VisitEvent(gd::BaseEvent &event) {
  if (!event.HasVariables()) {
    return AbstractArbitraryEventsWorker::VisitEvent(event);
  }
  // Push local variables
  auto newProjectScopedContainers =
      ProjectScopedContainers::MakeNewProjectScopedContainersWithLocalVariables(
          *currentProjectScopedContainers, event);
  auto *parentProjectScopedContainers = currentProjectScopedContainers;
  currentProjectScopedContainers = &newProjectScopedContainers;

  bool shouldDelete = AbstractArbitraryEventsWorker::VisitEvent(event);

  // Pop local variables
  currentProjectScopedContainers = parentProjectScopedContainers;
  return shouldDelete;
}

ReadOnlyArbitraryEventsWorker::~ReadOnlyArbitraryEventsWorker() {}

void ReadOnlyArbitraryEventsWorker::VisitEvent(
    const gd::BaseEvent &event) {
  AbstractReadOnlyArbitraryEventsWorker::VisitEvent(event);
}

ReadOnlyArbitraryEventsWorkerWithContext::~ReadOnlyArbitraryEventsWorkerWithContext() {}

void ReadOnlyArbitraryEventsWorkerWithContext::VisitEvent(
    const gd::BaseEvent &event) {
  if (!event.HasVariables()) {
    AbstractReadOnlyArbitraryEventsWorker::VisitEvent(event);
    return;
  }
  // Push local variables
  auto newProjectScopedContainers =
      ProjectScopedContainers::MakeNewProjectScopedContainersWithLocalVariables(
          *currentProjectScopedContainers, event);
  auto *parentProjectScopedContainers = currentProjectScopedContainers;
  currentProjectScopedContainers = &newProjectScopedContainers;

  AbstractReadOnlyArbitraryEventsWorker::VisitEvent(event);

  // Pop local variables
  currentProjectScopedContainers = parentProjectScopedContainers;
}

}  // namespace gd
