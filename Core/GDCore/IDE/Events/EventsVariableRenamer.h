/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class VariablesContainer;
class EventsList;
class Platform;
}  // namespace gd

namespace gd {

/**
 * \brief Replace in expressions and in parameters of actions or conditions, references
 * to the name of a variable by another.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsVariableRenamer : public ArbitraryEventsWorkerWithContext {
 public:
  EventsVariableRenamer(const gd::Platform &platform_,
    const gd::VariablesContainer &variablesContainerWithVariableToReplace_,
    const gd::String& oldVariableName_,
    const gd::String& newVariableName_) :
    platform(platform_),
    variablesContainerWithVariableToReplace(variablesContainerWithVariableToReplace_),
    oldVariableName(oldVariableName_),
    newVariableName(newVariableName_)
  {};
  virtual ~EventsVariableRenamer();

 private:
  bool DoVisitInstruction(gd::Instruction &instruction,
                          bool isCondition) override;
  // TODO: handle renaming of variables in events like "For each child variable".

  const gd::Platform &platform;
  const gd::VariablesContainer &variablesContainerWithVariableToReplace;
  gd::String objectName;
  gd::String oldVariableName;
  gd::String newVariableName;
};

}  // namespace gd
