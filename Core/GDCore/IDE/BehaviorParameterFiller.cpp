/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorParameterFiller.h"

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/BehaviorMetadata.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/Project/ProjectScopedContainers.h"

namespace gd {

void BehaviorParameterFiller::FillBehaviorParameters(
    const gd::Platform &platform,
    const gd::ProjectScopedContainers &projectScopedContainers,
    const gd::InstructionMetadata &instructionMetadata,
    gd::Instruction &instruction) {
  auto &objectsContainersList =
      projectScopedContainers.GetObjectsContainersList();
  gd::ParameterMetadataTools::IterateOverParametersWithIndex(
      instruction.GetParameters(), instructionMetadata.parameters,
      [&platform, &objectsContainersList, &instruction](
          const gd::ParameterMetadata &parameterMetadata,
          const gd::Expression &parameterValue, size_t parameterIndex,
          const gd::String &lastObjectName, size_t lastObjectIndex) {
        if (lastObjectName.empty() ||
            !ParameterMetadata::IsBehavior(parameterMetadata.GetType())) {
          return;
        }
        const gd::String &expectedBehaviorType =
            parameterMetadata.GetExtraInfo();
        if (expectedBehaviorType.empty()) {
          // Don't auto-select a behavior in the case of allowedBehaviorType
          // being not specified which in practice is only the case where the
          // user really needs to select a behavior (like the action to
          // enable/disable a behavior). So making a choice there automatically
          // would not make sense unless there is only one.
          return;
        }
        const gd::String &behaviorName = parameterValue.GetPlainString();
        const gd::String &actualBehaviorType =
            behaviorName.empty()
                ? ""
                : objectsContainersList.GetTypeOfBehaviorInObjectOrGroup(
                      lastObjectName, behaviorName);
        if (actualBehaviorType == expectedBehaviorType) {
          return;
        }
        const auto &behaviorNames =
            objectsContainersList.GetBehaviorNamesInObjectOrGroup(
                lastObjectName, expectedBehaviorType, true);
        if (behaviorNames.empty()) {
          const BehaviorMetadata &behaviorMetadata =
              MetadataProvider::GetBehaviorMetadata(platform,
                                                    expectedBehaviorType);
          instruction.SetParameter(parameterIndex,
                                   behaviorMetadata.GetDefaultName());
        } else {
          instruction.SetParameter(parameterIndex, behaviorNames[0]);
        }
      });
}

} // namespace gd
