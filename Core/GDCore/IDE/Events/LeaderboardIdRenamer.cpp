#include "LeaderboardIdRenamer.h"

#include <map>
#include <memory>
#include <vector>

#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Extensions/Metadata/InstructionMetadata.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/PropertyDescriptor.h"
#include "GDCore/String.h"

namespace gd {

void LeaderboardIdRenamer::DoVisitObject(gd::Object &object) {
  for (auto &pair : object.GetConfiguration().GetProperties()) {
    auto &propertyName = pair.first;
    auto &property = pair.second;
    if (property.GetType() == "LeaderboardId") {
      auto &leaderboardId = property.GetValue();

      allLeaderboardIds.insert(leaderboardId);

      if (leaderboardIdMap.find(leaderboardId) != leaderboardIdMap.end()) {
        object.GetConfiguration().UpdateProperty(
            propertyName, leaderboardIdMap[leaderboardId]);
      }
    }
  }
};

void LeaderboardIdRenamer::DoVisitBehavior(gd::Behavior &behavior) {};

bool LeaderboardIdRenamer::DoVisitInstruction(gd::Instruction &instruction,
                                              bool isCondition) {
  const gd::InstructionMetadata &instrInfo =
      isCondition ? MetadataProvider::GetConditionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType())
                  : MetadataProvider::GetActionMetadata(
                        project.GetCurrentPlatform(), instruction.GetType());

  for (int i = 0; i < instruction.GetParametersCount() &&
                  i < instrInfo.GetParametersCount();
       ++i) {
    const gd::ParameterMetadata parameter = instrInfo.GetParameter(i);

    if (parameter.GetType() != "leaderboardId") {
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

    allLeaderboardIds.insert(leaderboardId);

    if (leaderboardIdMap.find(leaderboardId) != leaderboardIdMap.end()) {
      instruction.SetParameter(i,
                               "\"" + leaderboardIdMap[leaderboardId] + "\"");
    }
  }
  return false;
}

LeaderboardIdRenamer::~LeaderboardIdRenamer() {}

}  // namespace gd
