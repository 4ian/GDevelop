/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/InstructionsTypeRenamer.h"
#include <map>
#include <memory>
#include <vector>
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

bool InstructionsTypeRenamer::DoVisitInstruction(gd::Instruction& instruction,
                                           bool isCondition) {
  if (instruction.GetType() == oldType) {
    instruction.SetType(newType);
  }
  
  return false;
}

InstructionsTypeRenamer::~InstructionsTypeRenamer() {}

}  // namespace gd
