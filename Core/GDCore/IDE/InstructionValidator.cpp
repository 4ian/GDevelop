/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "InstructionValidator.h"

#include "GDCore/Events/Parsers/ExpressionParser2Node.h"
#include "GDCore/Extensions/Metadata/AbstractFunctionMetadata.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/IDE/VariableInstructionSwitcher.h"
#include "GDCore/Project/InitialInstancesContainer.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ObjectGroup.h"
#include "GDCore/Project/ObjectsContainer.h"
#include "GDCore/Project/ObjectsContainersList.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/Variable.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"

namespace gd {

ParameterValidationResult InstructionValidator::ValidateParameter(
    const gd::Platform &platform,
    const gd::ProjectScopedContainers projectScopedContainers,
    const gd::Instruction &instruction, const InstructionMetadata &metadata,
    std::size_t parameterIndex) {
  ParameterValidationResult result;

  if (parameterIndex >= instruction.GetParametersCount() ||
      parameterIndex >= metadata.GetParametersCount()) {
    result.isValid = false;
    return result;
  }

  const auto &parameterMetadata = metadata.GetParameter(parameterIndex);
  // TODO Remove the ternary when all parameter declarations use
  // "number" instead of "expression".
  const auto &parameterType = parameterMetadata.GetType() == "expression"
                                  ? "number"
                                  : parameterMetadata.GetType();

  // The parameter value as stored in the project: empty for an unset optional
  // parameter or for the base layer. This is what must be validated, as opposed
  // to the value formatted for display which may show a default value.
  const gd::String &value =
      instruction.GetParameter(parameterIndex).GetPlainString();

  bool shouldNotBeValidated = parameterType == "layer" && value.empty();
  if (shouldNotBeValidated) {
    return result;  // Valid by default, no deprecation warning
  }

  // An optional parameter left empty is valid: the default value is used when
  // generating the code.
  if (parameterMetadata.IsOptional() && value.empty()) {
    return result;  // Valid by default, no deprecation warning
  }

  if (gd::ParameterMetadata::IsExpression("number", parameterType) ||
      gd::ParameterMetadata::IsExpression("string", parameterType) ||
      gd::ParameterMetadata::IsExpression("variable", parameterType)) {

    // New object variable instructions require the variable to be
    // declared while legacy ones don't.
    // For legacy variable instruction, we pass an empty object name.
    gd::String rootObjectName = "";
    if (parameterType == "objectvar" &&
        gd::VariableInstructionSwitcher::IsSwitchableVariableInstruction(
            instruction.GetType())) {
      const auto &objectsContainersList =
          projectScopedContainers.GetObjectsContainersList();
      rootObjectName = instruction.GetParameter(0).GetPlainString();

      // Extensions still rely on undeclared object variables.
      auto objectSourceType =
          projectScopedContainers.GetObjectsContainersList()
              .GetObjectsContainerFromObjectName(rootObjectName)
              ->GetSourceType();
      // TODO Check child-object variables while keep ignoring object variables
      // from parameters.
      if (objectSourceType == gd::ObjectsContainer::SourceType::Function) {
        rootObjectName = "";
      }
    }
    auto &expressionNode =
        *instruction.GetParameter(parameterIndex).GetRootNode();
    ExpressionValidator expressionValidator(platform, projectScopedContainers,
                                            parameterType,
                                            rootObjectName,
                                            parameterMetadata.GetExtraInfo());
    expressionNode.Visit(expressionValidator);

    if (!expressionValidator.GetAllErrors().empty()) {
      result.isValid = false;
    }
    if (!expressionValidator.GetDeprecationWarnings().empty()) {
      result.hasDeprecationWarning = true;
    }
  } else if (gd::ParameterMetadata::IsObject(parameterType)) {
    const auto &objectOrGroupName =
        instruction.GetParameter(parameterIndex).GetPlainString();
    const auto &objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    result.isValid =
        objectsContainersList.HasObjectOrGroupNamed(objectOrGroupName) &&
        (parameterMetadata.GetExtraInfo().empty() ||
         objectsContainersList.GetTypeOfObject(objectOrGroupName) ==
             parameterMetadata.GetExtraInfo()) &&
        InstructionValidator::HasRequiredBehaviors(
            instruction, metadata, parameterIndex, objectsContainersList);
  } else if (gd::ParameterMetadata::IsExpression("resource", parameterType)) {
    const auto &resourceName =
        instruction.GetParameter(parameterIndex).GetPlainString();
    result.isValid = projectScopedContainers.GetResourcesContainersList()
                         .HasResourceNamed(resourceName);
  }

  return result;
}

bool InstructionValidator::IsParameterValid(
    const gd::Platform &platform,
    const gd::ProjectScopedContainers projectScopedContainers,
    const gd::Instruction &instruction, const InstructionMetadata &metadata,
    std::size_t parameterIndex) {
  return ValidateParameter(platform, projectScopedContainers, instruction,
                           metadata, parameterIndex)
      .isValid;
}

gd::String InstructionValidator::GetRootVariableName(const gd::String &name) {
  const auto dotPosition = name.find('.');
  const auto squareBracketPosition = name.find('[');
  if (dotPosition == gd::String::npos &&
      squareBracketPosition == gd::String::npos) {
    return name;
  }
  return name.substr(0, dotPosition < squareBracketPosition
                            ? dotPosition
                            : squareBracketPosition);
};

bool InstructionValidator::HasRequiredBehaviors(
    const gd::Instruction &instruction,
    const gd::InstructionMetadata &instructionMetadata,
    std::size_t objectParameterIndex,
    const gd::ObjectsContainersList &objectsContainersList) {
  if (objectParameterIndex >= instruction.GetParametersCount()) {
    return false;
  }
  const auto &objectOrGroupName =
      instruction.GetParameter(objectParameterIndex).GetPlainString();
  for (size_t index = objectParameterIndex + 1;
       index < instructionMetadata.GetParametersCount(); index++) {
    const auto &behaviorParameter = instructionMetadata.GetParameter(index);

    const auto &parameterType = behaviorParameter.GetValueTypeMetadata();
    if (parameterType.IsObject()) {
      return true;
    }
    if (!parameterType.IsBehavior()) {
      continue;
    }
    const auto &behaviorType = behaviorParameter.GetExtraInfo();
    if (behaviorType.empty()) {
      continue;
    }
    if (index >= instruction.GetParametersCount()) {
      return false;
    }
    const auto &behaviorName = instruction.GetParameter(index).GetPlainString();
    if (objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
            objectOrGroupName, behaviorName,
            /** searchInGroups = */ true) != behaviorType) {
      return false;
    }
  }
  return true;
};

} // namespace gd
