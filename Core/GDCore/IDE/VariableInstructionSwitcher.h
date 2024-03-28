/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once
#include <vector>
#include "GDCore/String.h"
#include "GDCore/Project/Variable.h"

namespace gd {
class Instruction;
}  // namespace gd

namespace gd {
/**
 * Contains tools to use events functions.
 */
class GD_CORE_API VariableInstructionSwitcher {
 public:
  /**
   * \brief 
   */
  static bool IsSwitchableVariableInstruction(const gd::String& instructionType);

  /**
   * \brief 
   */
  static const gd::String& GetSwitchableVariableInstructionIdentifier(const gd::String& instructionType);

  /**
   * \brief 
   */
  static void SwitchVariableInstructionType(
    gd::Instruction& instruction, const gd::Variable::Type variableType);

 private:
 static const gd::String variableGetterIdentifier;
 static const gd::String variableSetterIdentifier;
 static const gd::String objectVariableGetterIdentifier;
 static const gd::String objectVariableSetterIdentifier;
 static const gd::String unknownInstructionIdentifier;
};
}  // namespace gd
