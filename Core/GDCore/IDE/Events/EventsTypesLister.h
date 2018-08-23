/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsTypesLister_H
#define EventsTypesLister_H
#include <map>
#include <iostream>
#include <memory>
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
 * \brief List the values of the parameters of events and their type.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsTypesLister : public ArbitraryEventsWorker {
 public:
  EventsTypesLister() {std::cout<< "Created"<<std::endl;};
  virtual ~EventsTypesLister();

  /**
   * Return the types of all events
   */
  const std::vector<gd::String>& GetAllEventsTypes() {
    return allEventsTypes;
  }

 private:
  // virtual bool DoVisitEvent(gd::BaseEvent& event) override;

  std::vector<gd::String> allEventsTypes;
};

}  // namespace gd

#endif  // EventsTypesLister_H
