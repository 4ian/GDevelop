/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/Events/Instruction.h"

#include <assert.h>

#include <iostream>
#include <vector>

#include "GDCore/Events/Expression.h"
#include "GDCore/Events/InstructionsList.h"
#include "GDCore/String.h"

namespace gd {

gd::Expression Instruction::badExpression("");

Instruction::Instruction(gd::String type_) : type(type_), inverted(false) {
  parameters.reserve(8);
}

Instruction::Instruction(gd::String type_,
                         const std::vector<gd::Expression>& parameters_,
                         bool inverted_)
    : type(type_), inverted(inverted_), parameters(parameters_) {
  parameters.reserve(8);
}

const gd::Expression& Instruction::GetParameter(std::size_t index) const {
  if (index >= parameters.size()) return badExpression;

  return parameters[index];
}

gd::Expression& Instruction::GetParameter(std::size_t index) {
  if (index >= parameters.size()) return badExpression;

  return parameters[index];
}

void Instruction::SetParametersCount(std::size_t size) {
  while (size < parameters.size())
    parameters.erase(parameters.begin() + parameters.size() - 1);
  while (size > parameters.size()) parameters.push_back(gd::Expression(""));
}

void Instruction::SetParameter(std::size_t nb, const gd::Expression& val) {
  if (nb >= parameters.size()) {
    std::cout << "Trying to write an out of bound parameter.\n\n" << std::endl;
    return;
  }
  parameters[nb] = val;
}

void Instruction::AddParameter(const gd::Expression& val) {
  parameters.push_back(val);
}

std::shared_ptr<Instruction> GD_CORE_API
CloneRememberingOriginalElement(std::shared_ptr<Instruction> instruction) {
  std::shared_ptr<Instruction> copy =
      std::make_shared<Instruction>(*instruction);
  // Original instruction is either the original instruction of the copied
  // instruction, or the instruction copied.
  copy->originalInstruction = instruction->originalInstruction.expired()
                                  ? instruction
                                  : instruction->originalInstruction;

  return copy;
}

}  // namespace gd
