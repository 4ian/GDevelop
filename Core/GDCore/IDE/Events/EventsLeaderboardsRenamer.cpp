/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsLeaderboardsRenamer.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

bool EventsLeaderboardsRenamer::DoVisitInstruction(gd::Instruction& instruction,
                                                   bool isCondition) {
  const gd::InstructionMetadata& instrInfo =
      isCondition ? MetadataProvider::GetConditionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType())
                  : MetadataProvider::GetActionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType());

  for (int i = 0; i < instruction.GetParametersCount() &&
                  i < instrInfo.GetParametersCount();
       ++i) {
    const gd::ParameterMetadata parameter = instrInfo.GetParameter(i);

    if (parameter.GetType() == "leaderboardId") {
      const gd::String leaderboardId =
          instruction.GetParameter(i).GetPlainString();

      if (leaderboardIdMap.find(leaderboardId) != leaderboardIdMap.end()) {
        instruction.SetParameter(i, leaderboardIdMap[leaderboardId]);
      }
    }
  }
  return false;
}

EventsLeaderboardsRenamer::~EventsLeaderboardsRenamer() {}

}  // namespace gd
