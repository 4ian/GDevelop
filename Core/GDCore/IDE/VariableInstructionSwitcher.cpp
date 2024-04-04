/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "VariableInstructionSwitcher.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Project/Variable.h"

namespace gd {

const gd::String VariableInstructionSwitcher::variableGetterIdentifier = "NumberVariable";
const gd::String VariableInstructionSwitcher::variableSetterIdentifier = "SetNumberVariable";
const gd::String VariableInstructionSwitcher::variablePushIdentifier = "PushNumber";
const gd::String VariableInstructionSwitcher::objectVariableGetterIdentifier = "NumberObjectVariable";
const gd::String VariableInstructionSwitcher::objectVariableSetterIdentifier = "SetNumberObjectVariable";
const gd::String VariableInstructionSwitcher::unknownInstructionIdentifier = "";

bool VariableInstructionSwitcher::IsSwitchableVariableInstruction(
    const gd::String &instructionType) {
  return instructionType == "NumberVariable" ||
      instructionType == "StringVariable" ||
      instructionType == "BooleanVariable" ||

      instructionType == "SetNumberVariable" ||
      instructionType == "SetStringVariable" ||
      instructionType == "SetBooleanVariable" ||

      instructionType == "PushNumber" ||
      instructionType == "PushString" ||
      instructionType == "PushBoolean" ||

      instructionType == "NumberObjectVariable" ||
      instructionType == "StringObjectVariable" ||
      instructionType == "BooleanObjectVariable" ||

      instructionType == "SetNumberObjectVariable" ||
      instructionType == "SetStringObjectVariable" ||
      instructionType == "SetBooleanObjectVariable";
}

const gd::String &
VariableInstructionSwitcher::GetSwitchableVariableInstructionIdentifier(
    const gd::String &instructionType) {
  return instructionType == "NumberVariable" ||
      instructionType == "StringVariable" ||
      instructionType == "BooleanVariable"
      ? VariableInstructionSwitcher::variableGetterIdentifier :

      instructionType == "SetNumberVariable" ||
      instructionType == "SetStringVariable" ||
      instructionType == "SetBooleanVariable"
      ? VariableInstructionSwitcher::variableSetterIdentifier :

      instructionType == "PushNumber" ||
      instructionType == "PushString" ||
      instructionType == "PushBoolean"
      ? VariableInstructionSwitcher::variablePushIdentifier :

      instructionType == "NumberObjectVariable" ||
      instructionType == "StringObjectVariable" ||
      instructionType == "BooleanObjectVariable"
      ? VariableInstructionSwitcher::objectVariableGetterIdentifier :

      instructionType == "SetNumberObjectVariable" ||
      instructionType == "SetStringObjectVariable" ||
      instructionType == "SetBooleanObjectVariable"
      ? VariableInstructionSwitcher::objectVariableSetterIdentifier :

      VariableInstructionSwitcher::unknownInstructionIdentifier;
}

const gd::Variable::Type
VariableInstructionSwitcher::GetSwitchableInstructionVariableType(const gd::String &instructionType) {
  return instructionType == "NumberVariable" ||
      instructionType == "SetNumberVariable" ||
      instructionType == "PushNumber" ||
      instructionType == "NumberObjectVariable" ||
      instructionType == "SetNumberObjectVariable"
      ? gd::Variable::Number :

      instructionType == "StringVariable" ||
      instructionType == "SetStringVariable" ||
      instructionType == "PushString" ||
      instructionType == "StringObjectVariable" ||
      instructionType == "SetStringObjectVariable"
      ? gd::Variable::String :

      instructionType == "BooleanVariable" ||
      instructionType == "SetBooleanVariable" ||
      instructionType == "PushBoolean" ||
      instructionType == "BooleanObjectVariable" ||
      instructionType == "SetBooleanObjectVariable"
      ? gd::Variable::Boolean :

      gd::Variable::Unknown;
}

void VariableInstructionSwitcher::SwitchVariableInstructionType(
    gd::Instruction& instruction, const gd::Variable::Type variableType) {
  if (instruction.GetType() == "NumberVariable" ||
      instruction.GetType() == "StringVariable" ||
      instruction.GetType() == "BooleanVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("NumberVariable");
    }
    else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("StringVariable");
    }
    else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("BooleanVariable");
    }
  }
  else if (instruction.GetType() == "SetNumberVariable" ||
      instruction.GetType() == "SetStringVariable" ||
      instruction.GetType() == "SetBooleanVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("SetNumberVariable");
    }
    else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("SetStringVariable");
    }
    else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("SetBooleanVariable");
    }
  }
  else if (instruction.GetType() == "PushNumber" ||
      instruction.GetType() == "PushString" ||
      instruction.GetType() == "PushBoolean") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("PushNumber");
    }
    else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("PushString");
    }
    else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("PushBoolean");
    }
  }
  else if (instruction.GetType() == "NumberObjectVariable" ||
      instruction.GetType() == "StringObjectVariable" ||
      instruction.GetType() == "BooleanObjectVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("NumberObjectVariable");
    }
    else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("StringObjectVariable");
    }
    else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("BooleanObjectVariable");
    }
  }
  else if (instruction.GetType() == "SetNumberObjectVariable" ||
      instruction.GetType() == "SetStringObjectVariable" ||
      instruction.GetType() == "SetBooleanObjectVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("SetNumberObjectVariable");
    }
    else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("SetStringObjectVariable");
    }
    else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("SetBooleanObjectVariable");
    }
  }
}

}  // namespace gd
