/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsLeaderboardsLister_H
#define EventsLeaderboardsLister_H
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
 * \brief List the leaderboard ids in the instructions.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsLeaderboardsLister : public ArbitraryEventsWorker {
 public:
  EventsLeaderboardsLister(gd::Project& project_) : project(project_){};
  virtual ~EventsLeaderboardsLister();

  /**
   * Return the values of all leaderboardIds found in the events.
   */
  const std::set<gd::String>& GetLeaderboardIds() { return leaderboardIds; }

 private:
  virtual bool DoVisitInstruction(gd::Instruction& instruction,
                                  bool isCondition);

  std::set<gd::String> leaderboardIds;
  gd::Project& project;
};

}  // namespace gd

#endif  // EventsLeaderboardsLister_H
