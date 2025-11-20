/*
 * GDevelop Core
 * Copyright 2008-2025 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "InstructionValidator.h"

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

bool InstructionValidator::IsParameterValid(
    const gd::Platform &platform,
    const gd::ProjectScopedContainers projectScopedContainers,
    const gd::Instruction &instruction, const InstructionMetadata &metadata,
    std::size_t parameterIndex, const gd::String &value) {
  if (parameterIndex >= instruction.GetParametersCount() ||
      parameterIndex >= metadata.GetParametersCount()) {
    return false;
  }
  const auto &parameterMetadata = metadata.GetParameter(parameterIndex);
  // TODO Remove the ternary when all parameter declarations use
  // "number" instead of "expression".
  const auto &parameterType = parameterMetadata.GetType() == "expression"
                                  ? "number"
                                  : parameterMetadata.GetType();
  bool shouldNotBeValidated = parameterType == "layer" && value.empty();
  if (shouldNotBeValidated) {
    return true;
  }
  if (gd::ParameterMetadata::IsExpression("number", parameterType) ||
      gd::ParameterMetadata::IsExpression("string", parameterType) ||
      gd::ParameterMetadata::IsExpression("variable", parameterType)) {
    auto &expressionNode =
        *instruction.GetParameter(parameterIndex).GetRootNode();
    ExpressionValidator expressionValidator(platform, projectScopedContainers,
                                            parameterType,
                                            parameterMetadata.GetExtraInfo());
    expressionNode.Visit(expressionValidator);
    if (!expressionValidator.GetAllErrors().empty()) {
      return false;
    }
    // New object variable instructions require the variable to be
    // declared while legacy ones don't.
    // This is why it's done here instead of in the parser directly.
    if (parameterType == "objectvar" &&
        gd::VariableInstructionSwitcher::IsSwitchableVariableInstruction(
            instruction.GetType())) {
      // Check at least the name of the root variable, it's the best we can
      // do.
      const auto &objectsContainersList =
          projectScopedContainers.GetObjectsContainersList();
      const auto &objectName = instruction.GetParameter(0).GetPlainString();
      const auto &variableName =
          instruction.GetParameter(parameterIndex).GetPlainString();
      if (objectsContainersList.HasObjectOrGroupWithVariableNamed(
              objectName,
              gd::InstructionValidator::GetRootVariableName(variableName)) ==
          gd::ObjectsContainersList::DoesNotExist) {
        return false;
      }
    }
  } else if (gd::ParameterMetadata::IsObject(parameterType)) {
    const auto &objectOrGroupName =
        instruction.GetParameter(parameterIndex).GetPlainString();
    const auto &objectsContainersList =
        projectScopedContainers.GetObjectsContainersList();
    return objectsContainersList.HasObjectOrGroupNamed(objectOrGroupName) &&
           (parameterMetadata.GetExtraInfo().empty() ||
            objectsContainersList.GetTypeOfObject(objectOrGroupName) ==
                parameterMetadata.GetExtraInfo()) &&
           InstructionValidator::HasRequiredBehaviors(
               instruction, metadata, parameterIndex, objectsContainersList);
  } else if (gd::ParameterMetadata::IsExpression("resource", parameterType)) {
    const auto &resourceName =
        instruction.GetParameter(parameterIndex).GetPlainString();
    return projectScopedContainers.GetResourcesContainersList()
        .HasResourceNamed(resourceName);
  }
  return true;
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
