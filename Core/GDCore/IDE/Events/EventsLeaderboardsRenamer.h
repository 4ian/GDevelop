/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsLeaderboardsRenamer_H
#define EventsLeaderboardsRenamer_H
#include <map>
#include <memory>
#include <set>
#include <vector>

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Project;
class EventsList;
}

namespace gd {

/**
 * \brief Replace the leaderboard ids in the instructions.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsLeaderboardsRenamer : public ArbitraryEventsWorker {
 public:
  EventsLeaderboardsRenamer(
      gd::Project& project_,
      const std::map<gd::String, gd::String>& leaderboardIdMap_)
      : project(project_), leaderboardIdMap(leaderboardIdMap_){};
  virtual ~EventsLeaderboardsRenamer();

 private:
  virtual bool DoVisitInstruction(gd::Instruction& instruction,
                                  bool isCondition);

  std::map<gd::String, gd::String> leaderboardIdMap;
  gd::Project& project;
};

}  // namespace gd

#endif  // EventsLeaderboardsRenamer_H
