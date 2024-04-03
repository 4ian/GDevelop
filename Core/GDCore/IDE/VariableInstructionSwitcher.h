/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/Project/Variable.h"
#include "GDCore/String.h"
#include <vector>

namespace gd {
class Instruction;
} // namespace gd

namespace gd {
/**
 * Contains tools to use events functions.
 */
class GD_CORE_API VariableInstructionSwitcher {
public:
  /**
   * \brief Return true if the instruction is a primitive variable getter or
   * setter.
   */
  static bool
  IsSwitchableVariableInstruction(const gd::String &instructionType);

  /**
   * \brief Return the common identifier for primitive variable getter or
   * setter or an empty string otherwise.
   *
   * The instruction type of the "number" one is actually used as the common
   * identifier.
   */
  static const gd::String &
  GetSwitchableVariableInstructionIdentifier(const gd::String &instructionType);

  /**
   * \brief Return the variable type for primitive variable getter or
   * setter.
   */
  static const gd::Variable::Type
  GetSwitchableInstructionVariableType(const gd::String &instructionType);

  /**
   * \brief Modify the instruction type to match the given variable type.
   */
  static void
  SwitchVariableInstructionType(gd::Instruction &instruction,
                                const gd::Variable::Type variableType);

private:
  static const gd::String variableGetterIdentifier;
  static const gd::String variableSetterIdentifier;
  static const gd::String objectVariableGetterIdentifier;
  static const gd::String objectVariableSetterIdentifier;
  static const gd::String unknownInstructionIdentifier;
};
} // namespace gd
