/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "VariableInstructionSwitcher.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/IDE/Events/ExpressionVariablePathFinder.h"
#include "GDCore/Project/Variable.h"

namespace gd {

const gd::String VariableInstructionSwitcher::variableGetterIdentifier =
    "NumberVariable";
const gd::String VariableInstructionSwitcher::variableSetterIdentifier =
    "SetNumberVariable";
const gd::String VariableInstructionSwitcher::variablePushIdentifier =
    "PushNumber";
const gd::String VariableInstructionSwitcher::objectVariableGetterIdentifier =
    "NumberObjectVariable";
const gd::String VariableInstructionSwitcher::objectVariableSetterIdentifier =
    "SetNumberObjectVariable";
const gd::String VariableInstructionSwitcher::objectVariablePushIdentifier =
    "PushNumberToObjectVariable";
const gd::String VariableInstructionSwitcher::unknownInstructionIdentifier = "";

bool VariableInstructionSwitcher::IsSwitchableVariableInstruction(
    const gd::String &instructionType) {
  return instructionType == "NumberVariable" ||
         instructionType == "StringVariable" ||
         instructionType == "BooleanVariable" ||

         instructionType == "SetNumberVariable" ||
         instructionType == "SetStringVariable" ||
         instructionType == "SetBooleanVariable" ||

         instructionType == "PushNumber" || instructionType == "PushString" ||
         instructionType == "PushBoolean" ||

         IsSwitchableObjectVariableInstruction(instructionType);
}

bool VariableInstructionSwitcher::IsSwitchableObjectVariableInstruction(
    const gd::String &instructionType) {
  return instructionType == "NumberObjectVariable" ||
         instructionType == "StringObjectVariable" ||
         instructionType == "BooleanObjectVariable" ||

         instructionType == "SetNumberObjectVariable" ||
         instructionType == "SetStringObjectVariable" ||
         instructionType == "SetBooleanObjectVariable" ||

         instructionType == "PushNumberToObjectVariable" ||
         instructionType == "PushStringToObjectVariable" ||
         instructionType == "PushBooleanToObjectVariable";
}

const gd::String &
VariableInstructionSwitcher::GetSwitchableVariableInstructionIdentifier(
    const gd::String &instructionType) {
  return instructionType == "NumberVariable" ||
                 instructionType == "StringVariable" ||
                 instructionType == "BooleanVariable"
             ? VariableInstructionSwitcher::variableGetterIdentifier
         :

         instructionType == "SetNumberVariable" ||
                 instructionType == "SetStringVariable" ||
                 instructionType == "SetBooleanVariable"
             ? VariableInstructionSwitcher::variableSetterIdentifier
         :

         instructionType == "PushNumber" || instructionType == "PushString" ||
                 instructionType == "PushBoolean"
             ? VariableInstructionSwitcher::variablePushIdentifier
         :

         instructionType == "NumberObjectVariable" ||
                 instructionType == "StringObjectVariable" ||
                 instructionType == "BooleanObjectVariable"
             ? VariableInstructionSwitcher::objectVariableGetterIdentifier
         :

         instructionType == "SetNumberObjectVariable" ||
                 instructionType == "SetStringObjectVariable" ||
                 instructionType == "SetBooleanObjectVariable"
             ? VariableInstructionSwitcher::objectVariableSetterIdentifier
         :

         instructionType == "PushNumberToObjectVariable" ||
                 instructionType == "PushStringToObjectVariable" ||
                 instructionType == "PushBooleanToObjectVariable"
             ? VariableInstructionSwitcher::objectVariablePushIdentifier
             :

             VariableInstructionSwitcher::unknownInstructionIdentifier;
}

const gd::Variable::Type
VariableInstructionSwitcher::GetSwitchableInstructionVariableType(
    const gd::String &instructionType) {
  return instructionType == "NumberVariable" ||
                 instructionType == "SetNumberVariable" ||
                 instructionType == "PushNumber" ||
                 instructionType == "NumberObjectVariable" ||
                 instructionType == "SetNumberObjectVariable" ||
                 instructionType == "PushNumberToObjectVariable"
             ? gd::Variable::Number
         :

         instructionType == "StringVariable" ||
                 instructionType == "SetStringVariable" ||
                 instructionType == "PushString" ||
                 instructionType == "StringObjectVariable" ||
                 instructionType == "SetStringObjectVariable" ||
                 instructionType == "PushStringToObjectVariable"
             ? gd::Variable::String
         :

         instructionType == "BooleanVariable" ||
                 instructionType == "SetBooleanVariable" ||
                 instructionType == "PushBoolean" ||
                 instructionType == "BooleanObjectVariable" ||
                 instructionType == "SetBooleanObjectVariable" ||
                 instructionType == "PushBooleanToObjectVariable"
             ? gd::Variable::Boolean
             :

             gd::Variable::Unknown;
}

void VariableInstructionSwitcher::SwitchVariableInstructionType(
    gd::Instruction &instruction, const gd::Variable::Type variableType) {
  if (instruction.GetType() == "NumberVariable" ||
      instruction.GetType() == "StringVariable" ||
      instruction.GetType() == "BooleanVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("NumberVariable");
    } else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("StringVariable");
    } else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("BooleanVariable");
    }
  } else if (instruction.GetType() == "SetNumberVariable" ||
             instruction.GetType() == "SetStringVariable" ||
             instruction.GetType() == "SetBooleanVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("SetNumberVariable");
    } else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("SetStringVariable");
    } else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("SetBooleanVariable");
    }
  } else if (instruction.GetType() == "PushNumber" ||
             instruction.GetType() == "PushString" ||
             instruction.GetType() == "PushBoolean") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("PushNumber");
    } else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("PushString");
    } else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("PushBoolean");
    }
  } else if (instruction.GetType() == "NumberObjectVariable" ||
             instruction.GetType() == "StringObjectVariable" ||
             instruction.GetType() == "BooleanObjectVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("NumberObjectVariable");
    } else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("StringObjectVariable");
    } else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("BooleanObjectVariable");
    }
  } else if (instruction.GetType() == "SetNumberObjectVariable" ||
             instruction.GetType() == "SetStringObjectVariable" ||
             instruction.GetType() == "SetBooleanObjectVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("SetNumberObjectVariable");
    } else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("SetStringObjectVariable");
    } else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("SetBooleanObjectVariable");
    }
  } else if (instruction.GetType() == "PushNumberToObjectVariable" ||
             instruction.GetType() == "PushStringToObjectVariable" ||
             instruction.GetType() == "PushBooleanToObjectVariable") {
    if (variableType == gd::Variable::Type::Number) {
      instruction.SetType("PushNumberToObjectVariable");
    } else if (variableType == gd::Variable::Type::String) {
      instruction.SetType("PushStringToObjectVariable");
    } else if (variableType == gd::Variable::Type::Boolean) {
      instruction.SetType("PushBooleanToObjectVariable");
    }
  }
}

const gd::Variable::Type
VariableInstructionSwitcher::GetVariableTypeFromParameters(
    const gd::Platform &platform,
    const gd::ProjectScopedContainers &projectScopedContainers,
    const gd::Instruction &instruction) {
  if (instruction.GetParametersCount() < 2 ||
      !gd::VariableInstructionSwitcher::IsSwitchableVariableInstruction(
          instruction.GetType())) {
    return gd::Variable::Type::Unknown;
  }
  const bool isObjectVariable =
      gd::VariableInstructionSwitcher::IsSwitchableObjectVariableInstruction(
          instruction.GetType());
  const gd::String &objectName =
      isObjectVariable ? instruction.GetParameter(0).GetPlainString() : "";

  const std::size_t variableParameterIndex = isObjectVariable ? 1 : 0;
  auto &variableExpressionNode =
      *instruction.GetParameter(variableParameterIndex).GetRootNode();

  auto variableType = gd::ExpressionVariablePathFinder::GetVariableType(
      platform, projectScopedContainers, variableExpressionNode, objectName);
  return variableType == gd::Variable::Type::Array
             ? // "Push" actions need the child type to be able to switch.
             gd::ExpressionVariablePathFinder::GetArrayVariableType(
                 platform, projectScopedContainers, variableExpressionNode,
                 objectName)
             : variableType;
}

void VariableInstructionSwitcher::SwitchBetweenUnifiedInstructionIfNeeded(
    const gd::Platform &platform,
    const gd::ProjectScopedContainers &projectScopedContainers,
    gd::Instruction &instruction) {
  const auto variableType =
      gd::VariableInstructionSwitcher::GetVariableTypeFromParameters(
          platform, projectScopedContainers, instruction);
  if (variableType != gd::Variable::Type::Unknown) {
    gd::VariableInstructionSwitcher::SwitchVariableInstructionType(
        instruction, variableType);
  }
}

} // namespace gd
