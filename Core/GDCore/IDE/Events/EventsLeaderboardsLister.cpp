/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCore/IDE/Events/EventsLeaderboardsLister.h"

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

bool EventsLeaderboardsLister::DoVisitInstruction(gd::Instruction& instruction,
                                                  bool isCondition) {
  const gd::InstructionMetadata& instrInfo =
      isCondition ? MetadataProvider::GetConditionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType())
                  : MetadataProvider::GetActionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType());

  for (int i = 0; i < instruction.GetParametersCount() &&
                  i < instrInfo.GetParametersCount();
       ++i) {
    if (instrInfo.GetParameter(i).GetType() != "leaderboardId") {
      continue;
    }
    const gd::String leaderboardIdExpression =
        instruction.GetParameter(i).GetPlainString();
    if (leaderboardIdExpression[0] != '"' ||
        leaderboardIdExpression[leaderboardIdExpression.size() - 1] != '"') {
      continue;
    }
    const gd::String leaderboardId =
        leaderboardIdExpression.substr(1, leaderboardIdExpression.size() - 2);
    leaderboardIds.insert(leaderboardId);
  }
  return false;
}

EventsLeaderboardsLister::~EventsLeaderboardsLister() {}

}  // namespace gd
