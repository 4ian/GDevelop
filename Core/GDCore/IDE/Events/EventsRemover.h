/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsRemover_H
#define EventsRemover_H
#include <set>
#include <vector>
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
}
namespace gd {
class Project;
}
namespace gd {
class EventsList;
}

namespace gd {

/**
 * \brief Allow to safely remove a bunch of events.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsRemover : public ArbitraryEventsWorker {
 public:
  EventsRemover(){};
  virtual ~EventsRemover();

  void AddEventToRemove(gd::BaseEvent &event) { eventsToRemove.insert(&event); }
  void AddInstructionToRemove(gd::Instruction &instruction) {
    instructionsToRemove.insert(&instruction);
  }

 private:
  virtual bool DoVisitEvent(gd::BaseEvent &event) {
    return eventsToRemove.count(&event) != 0;
  }

  virtual bool DoVisitInstruction(gd::Instruction &instruction,
                                  bool isCondition) {
    return instructionsToRemove.count(&instruction) != 0;
  }

  std::set<gd::BaseEvent *> eventsToRemove;
  std::set<gd::Instruction *> instructionsToRemove;
};

}  // namespace gd

#endif  // EventsRemover_H
