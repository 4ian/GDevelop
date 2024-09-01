/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsVariableInstructionTypeSwitcher.h"

#include <map>
#include <memory>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodePrinter.h"
#include "GDCore/Events/Parsers/ExpressionParser2NodeWorker.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadata.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/IDE/Events/ExpressionValidator.h"
#include "GDCore/IDE/Events/ExpressionVariableOwnerFinder.h"
#include "GDCore/IDE/Events/ExpressionVariableNameFinder.h"
#include "GDCore/IDE/VariableInstructionSwitcher.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/ProjectScopedContainers.h"
#include "GDCore/Project/VariablesContainer.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

VariablesContainer EventsVariableInstructionTypeSwitcher::nullVariablesContainer;

bool EventsVariableInstructionTypeSwitcher::DoVisitInstruction(gd::Instruction& instruction,
                                                bool isCondition) {
  const auto& metadata = isCondition
                             ? gd::MetadataProvider::GetConditionMetadata(
                                   platform, instruction.GetType())
                             : gd::MetadataProvider::GetActionMetadata(
                                   platform, instruction.GetType());

  gd::ParameterMetadataTools::IterateOverParametersWithIndex(
      instruction.GetParameters(),
      metadata.GetParameters(),
      [&](const gd::ParameterMetadata& parameterMetadata,
          const gd::Expression& parameterValue,
          size_t parameterIndex,
          const gd::String& lastObjectName) {
        const gd::String& type = parameterMetadata.GetType();

        if (!gd::ParameterMetadata::IsExpression("variable", type) ||
            !gd::VariableInstructionSwitcher::IsSwitchableVariableInstruction(
                instruction.GetType())) {
                  return;
        }
        const auto variableName =
            gd::ExpressionVariableNameFinder::GetVariableName(
                *parameterValue.GetRootNode());

        const gd::VariablesContainer *variablesContainer = nullptr;
        if (type == "objectvar") {
          const auto &objectsContainersList =
              GetProjectScopedContainers().GetObjectsContainersList();
          if (objectsContainersList.HasObjectOrGroupWithVariableNamed(
                  lastObjectName, variableName) !=
              gd::ObjectsContainersList::VariableExistence::DoesNotExist) {
            variablesContainer =
                GetProjectScopedContainers()
                    .GetObjectsContainersList()
                    .GetObjectOrGroupVariablesContainer(lastObjectName);
          }
        } else {
          if (GetProjectScopedContainers().GetVariablesContainersList().Has(
                  variableName)) {
            variablesContainer =
                &GetProjectScopedContainers()
                      .GetVariablesContainersList()
                      .GetVariablesContainerFromVariableName(variableName);
          }
        }

        // Every occurrence of the variable or its children are checked.
        // Ensuring that a child is actually the one with a type change would
        // take more time.
        if (variablesContainer == &targetVariablesContainer ||
            lastObjectName == groupName) {
          if (typeChangedVariableNames.find(variableName) !=
              typeChangedVariableNames.end()) {
            gd::VariableInstructionSwitcher::
                SwitchBetweenUnifiedInstructionIfNeeded(
                    platform, GetProjectScopedContainers(), instruction);
          }
        }
      });

  return false;
}

EventsVariableInstructionTypeSwitcher::~EventsVariableInstructionTypeSwitcher() {}

}  // namespace gd
