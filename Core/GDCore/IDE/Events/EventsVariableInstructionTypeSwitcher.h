/*
 * GDevelop Core
 * Copyright 2008-2024 Florian Rival (Florian.Rival@gmail.com). All rights
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
class VariablesContainer;
class Platform;
}  // namespace gd

namespace gd {
/**
 * \brief Switch the types of variable instructions for a given set of
 * variables.
 *
 * \see gd::VariableInstructionSwitcher
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsVariableInstructionTypeSwitcher
    : public ArbitraryEventsWorkerWithContext {
public:
  EventsVariableInstructionTypeSwitcher(
      const gd::Platform &platform_,
      const gd::VariablesContainer &targetVariablesContainer_,
      const std::unordered_set<gd::String> &typeChangedVariableNames_)
      : platform(platform_),
        targetVariablesContainer(targetVariablesContainer_),
        typeChangedVariableNames(typeChangedVariableNames_){};
  virtual ~EventsVariableInstructionTypeSwitcher();

 private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;

  const gd::Platform &platform;
  const gd::VariablesContainer &targetVariablesContainer;
  gd::String objectName;
  const std::unordered_set<gd::String> &typeChangedVariableNames;
};

} // namespace gd
