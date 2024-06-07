/*
 * GDevelop Core
 * Copyright 2008-2024 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "BehaviorParametersFiller.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Instruction.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/ParameterMetadataTools.h"
#include "GDCore/String.h"
#include "GDCore/Tools/Log.h"

namespace gd {

bool BehaviorParametersFiller::DoVisitInstruction(gd::Instruction &instruction,
                                                  bool isCondition) {
  const auto &metadata = isCondition
                             ? gd::MetadataProvider::GetConditionMetadata(
                                   platform, instruction.GetType())
                             : gd::MetadataProvider::GetActionMetadata(
                                   platform, instruction.GetType());

  gd::ParameterMetadataTools::IterateOverParametersWithIndex(
      instruction.GetParameters(), metadata.GetParameters(),
      [&](const gd::ParameterMetadata &parameterMetadata,
          const gd::Expression &parameterValue, size_t parameterIndex,
          const gd::String &lastObjectName) {
        if (parameterMetadata.GetValueTypeMetadata().IsBehavior() &&
            parameterValue.GetPlainString().length() == 0) {

          auto &expectedBehaviorTypeName =
              parameterMetadata.GetValueTypeMetadata().GetExtraInfo();

          auto &objectsContainersList =
              projectScopedContainers.GetObjectsContainersList();
          auto behaviorNames =
              objectsContainersList.GetBehaviorsOfObject(lastObjectName, true);

          gd::String foundBehaviorName = "";
          for (auto &behaviorName : behaviorNames) {
            auto behaviorTypeName =
                objectsContainersList.GetTypeOfBehavior(behaviorName, false);
            if (behaviorTypeName == expectedBehaviorTypeName) {
              foundBehaviorName = behaviorName;
              break;
            }
          }
          if (!foundBehaviorName.empty()) {
            instruction.SetParameter(parameterIndex,
                                     gd::Expression(foundBehaviorName));
          }
        }
      });

  return false;
}

BehaviorParametersFiller::~BehaviorParametersFiller() {}

} // namespace gd
