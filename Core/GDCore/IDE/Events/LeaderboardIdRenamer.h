/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once
#include <map>

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
class Behavior;
}  // namespace gd

namespace gd {

class GD_CORE_API LeaderboardIdRenamer : public ArbitraryObjectsWorker, public ArbitraryEventsWorker {
 public:
  LeaderboardIdRenamer(gd::Project& project_): project(project_) {};
  virtual ~LeaderboardIdRenamer();

  /**
   * Set the leaderboard identifiers to be replaced.
   */
  void SetLeaderboardIdsToReplace(const std::map<gd::String, gd::String>& leaderboardIdMap_) {
    leaderboardIdMap = leaderboardIdMap_;
  }

  /**
   * Return the all the leaderboard identifiers found in the project.
   */
  const std::set<gd::String>& GetAllLeaderboardIds() const {
    return allLeaderboardIds;
  }

 private:
  bool DoVisitInstruction(gd::Instruction& instruction, bool isCondition) override;
  void DoVisitObject(gd::Object& object) override;
  void DoVisitBehavior(gd::Behavior& behavior) override;

  std::map<gd::String, gd::String> leaderboardIdMap;
  std::set<gd::String> allLeaderboardIds;
  gd::Project& project;
};

};  // namespace gd
