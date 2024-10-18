/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once
#include <map>

#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/String.h"

namespace gd {
class Object;
class Behavior;
}  // namespace gd

namespace gd {

class GD_CORE_API LeaderboardIdRenamer : public ArbitraryObjectsWorker {
 public:
  LeaderboardIdRenamer(
      const std::map<gd::String, gd::String>& leaderboardIdMap_)
      : leaderboardIdMap(leaderboardIdMap_){};
  virtual ~LeaderboardIdRenamer();

 private:
  void DoVisitObject(gd::Object& object) override;
  void DoVisitBehavior(gd::Behavior& behavior) override;

  std::map<gd::String, gd::String> leaderboardIdMap;
};

};  // namespace gd
