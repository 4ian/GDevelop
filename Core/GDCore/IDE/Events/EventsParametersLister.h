/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef EventsParametersLister_H
#define EventsParametersLister_H
#include <map>
#include <memory>
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
 * \brief List the values of the parameters of events and their type.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsParametersLister : public ArbitraryEventsWorker {
 public:
  EventsParametersLister(gd::Project& project_) : project(project_){};
  virtual ~EventsParametersLister();

  /**
   * Return the values of all parameters associated with the type of their
   * parent.
   */
  const std::map<gd::String, gd::String>& GetParametersAndTypes() {
    return parameters;
  }

 private:
  virtual bool DoVisitInstruction(gd::Instruction& instruction,
                                  bool isCondition);

  std::map<gd::String, gd::String> parameters;
  gd::Project& project;
};

}  // namespace gd

#endif  // EventsParametersLister_H
