/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include "GDCore/Project/Variable.h"
#include "GDCore/String.h"

namespace gd {
class Instruction;
class Platform;
class ProjectScopedContainers;
} // namespace gd

namespace gd {
/**
 * Events set and check variables with sets of 3 instructions for:
 * - number
 * - string
 * - boolean
 *
 * Users only see 1 instruction. The editor automatically switches between the 3
 * instructions according to the variable type.
 */
class GD_CORE_API VariableInstructionSwitcher {
public:
  /**
   * \brief Return true if the instruction is a variable getter or setter
   * (including object variable instructions).
   */
  static bool
  IsSwitchableVariableInstruction(const gd::String &instructionType);

  /**
   * \brief Return true if the instruction is an object variable getter or
   * setter.
   */
  static bool
  IsSwitchableObjectVariableInstruction(const gd::String &instructionType);

  /**
   * \brief Return the common identifier for variable getter or setter or an
   * empty string otherwise.
   *
   * The instruction type of the "number" one is actually used as the common
   * identifier.
   */
  static const gd::String &
  GetSwitchableVariableInstructionIdentifier(const gd::String &instructionType);

  /**
   * \brief Return the variable type for variable getter or setter.
   */
  static const gd::Variable::Type
  GetSwitchableInstructionVariableType(const gd::String &instructionType);

  /**
   * \brief Modify the instruction type to match the given variable type.
   */
  static void
  SwitchVariableInstructionType(gd::Instruction &instruction,
                                const gd::Variable::Type variableType);

  /**
   * \brief Return the variable type of the instruction parameter.
   */
  static const gd::Variable::Type GetVariableTypeFromParameters(
      const gd::Platform &platform,
      const gd::ProjectScopedContainers &projectScopedContainers,
      const gd::Instruction &instruction);

  /**
   * \brief Modify the instruction type to match the variable type of the
   * instruction parameter.
   */
  static void SwitchBetweenUnifiedInstructionIfNeeded(
      const gd::Platform &platform,
      const gd::ProjectScopedContainers &projectScopedContainers,
      gd::Instruction &instruction);

private:
  static const gd::String variableGetterIdentifier;
  static const gd::String variableSetterIdentifier;
  static const gd::String variablePushIdentifier;
  static const gd::String objectVariableGetterIdentifier;
  static const gd::String objectVariableSetterIdentifier;
  static const gd::String objectVariablePushIdentifier;
  static const gd::String unknownInstructionIdentifier;
};
} // namespace gd
