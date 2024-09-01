/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include <map>
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"

namespace gd {
class BaseEvent;
class VariablesContainer;
class EventsList;
class Platform;
struct VariablesRenamingChangesetNode;
}  // namespace gd

namespace gd {

/**
 * \brief Replace in expressions and in parameters of actions or conditions,
 * references to the name of a variable by another.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsVariableReplacer
    : public ArbitraryEventsWorkerWithContext {
 public:
  EventsVariableReplacer(
      const gd::Platform &platform_,
      const VariablesRenamingChangesetNode &variablesRenamingChangesetRoot_,
      const std::unordered_set<gd::String> &removedVariableNames_,
      const gd::VariablesContainer &targetVariablesContainer_)
      : platform(platform_),
        variablesRenamingChangesetRoot(variablesRenamingChangesetRoot_),
        removedVariableNames(removedVariableNames_),
        targetVariablesContainer(targetVariablesContainer_),
        targetGroupName("") {};
  EventsVariableReplacer(
      const gd::Platform &platform_,
      const VariablesRenamingChangesetNode &variablesRenamingChangesetRoot_,
      const std::unordered_set<gd::String> &removedVariableNames_,
      const gd::String &targetGroupName_)
      : platform(platform_),
        variablesRenamingChangesetRoot(variablesRenamingChangesetRoot_),
        removedVariableNames(removedVariableNames_),
        targetVariablesContainer(nullVariablesContainer),
        targetGroupName(targetGroupName_) {};
  virtual ~EventsVariableReplacer();

 private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;
  bool DoVisitEventExpression(gd::Expression &expression,
                              const gd::ParameterMetadata &metadata) override;

  const gd::VariablesContainer *FindForcedVariablesContainerIfAny(
      const gd::String &type, const gd::String &lastObjectName);

  const gd::Platform &platform;
  const gd::VariablesContainer &targetVariablesContainer;
  /**
   * Groups don't have VariablesContainer, so `targetVariablesContainer` will be
   * pointing to `nullVariablesContainer` and the group name is use instead to
   * check which variable accesses to modify in expressions.
   */
  const gd::String targetGroupName;
  const VariablesRenamingChangesetNode &variablesRenamingChangesetRoot;
  const std::unordered_set<gd::String> &removedVariableNames;

  static VariablesContainer nullVariablesContainer;
};

}  // namespace gd
