/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsTypesLister_H
#define EventsTypesLister_H
#include <map>
#include <memory>
#include <vector>
#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/String.h"
namespace gd {
class BaseEvent;
class Project;
class EventsList;
}  // namespace gd

namespace gd {

/**
 * \brief List the values of the parameters of events and their type.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsTypesLister : public ArbitraryEventsWorker {
 public:
  EventsTypesLister(const gd::Project& project_) : project(project_){};
  virtual ~EventsTypesLister();

  /**
   * Return the types of all events
   */
  const std::vector<gd::String>& GetAllEventsTypes() { return allEventsTypes; }

  /**
   * Return the types of all conditions
   */
  const std::vector<gd::String>& GetAllConditionsTypes() {
    return allConditionsTypes;
  }

  /**
   * Return the types of all actions
   */
  const std::vector<gd::String>& GetAllActionsTypes() {
    return allActionsTypes;
  }

 private:
  bool DoVisitEvent(gd::BaseEvent& event) override;
  bool DoVisitInstruction(gd::Instruction& instruction,
                          bool isCondition) override;

  std::vector<gd::String> allEventsTypes;
  std::vector<gd::String> allConditionsTypes;
  std::vector<gd::String> allActionsTypes;
  const gd::Project& project;
};

}  // namespace gd

#endif  // EventsTypesLister_H
