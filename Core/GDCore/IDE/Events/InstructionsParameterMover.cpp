/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/InstructionsParameterMover.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

bool InstructionsParameterMover::DoVisitInstruction(
    gd::Instruction& instruction, bool isCondition) {
  if (instruction.GetType() == instructionType) {
    std::vector<gd::Expression> updatedParameters = instruction.GetParameters();
    if (oldIndex < updatedParameters.size()) {
      gd::Expression movedParameter = updatedParameters.at(oldIndex);
      updatedParameters.erase(updatedParameters.begin() + oldIndex);
      if (newIndex < updatedParameters.size()) {
        updatedParameters.insert(updatedParameters.begin() + newIndex,
                                movedParameter);
      } else {
        updatedParameters.push_back(movedParameter);
      }
      instruction.SetParameters(updatedParameters);
    }
  }

  return false;
}

InstructionsParameterMover::~InstructionsParameterMover() {}

}  // namespace gd
