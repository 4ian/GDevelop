#include "LeaderboardIdRenamer.h"

#include "GDCore/Project/Behavior.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/PropertyDescriptor.h"

namespace gd {

void LeaderboardIdRenamer::DoVisitObject(gd::Object &object) {
  for (auto &pair : object.GetConfiguration().GetProperties()) {
    auto &propertyName = pair.first;
    auto &property = pair.second;
    if (property.GetType() == "LeaderboardId") {
      auto &leaderboardId = property.GetValue();
      if (leaderboardIdMap.find(leaderboardId) != leaderboardIdMap.end()) {
        object.GetConfiguration().UpdateProperty(propertyName, leaderboardIdMap[leaderboardId]);
      }
    }
  }
};

void LeaderboardIdRenamer::DoVisitBehavior(gd::Behavior &behavior){};

LeaderboardIdRenamer::~LeaderboardIdRenamer() {}

} // namespace gd
