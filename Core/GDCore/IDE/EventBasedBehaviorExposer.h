/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_BEHAVIORPROJECTEXPOSER_H
#define GDCORE_BEHAVIORPROJECTEXPOSER_H

#include "GDCore/IDE/ProjectExposer.h"

namespace gd {
class Project;
class String;
class EventsFunctionsExtension;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
class ArbitraryEventsWorker;
class ArbitraryEventsWorkerWithContext;
class ArbitraryFunctionsWorker;
class ArbitraryObjectsWorker;
class ArbitraryEventBasedBehaviorsWorker;
class ArbitrarySharedDataWorker;
} // namespace gd

namespace gd {

class GD_CORE_API EventBasedBehaviorExposer : public ProjectExposer {
public:
  EventBasedBehaviorExposer(gd::EventsBasedBehavior &eventsBasedBehavior_)
      : eventsBasedBehavior(eventsBasedBehavior_) {}

  /**
   * \brief Call the specified worker on all events of the events based
   * behavior
   *
   * This should be the preferred way to traverse all the events of an events
   * based behavior.
   */
  void ExposeEvents(gd::Project &project,
                    gd::ArbitraryEventsWorker &worker) const override;

  /**
   * \brief Call the specified worker on all events of the events based
   * behavior
   *
   * This should be the preferred way to traverse all the events of an events
   * based behavior.
   */
  void
  ExposeEvents(gd::Project &project,
               gd::ArbitraryEventsWorkerWithContext &worker) const override;

  /**
   * \brief Call the specified worker on all FunctionsContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the function signatures
   * of a project.
   */
  void ExposeFunctions(gd::Project &project,
                       gd::ArbitraryFunctionsWorker &worker) const override;

  void ExposeEventBasedBehaviors(
      gd::Project &project,
      gd::ArbitraryEventBasedBehaviorsWorker &worker) const override;

  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  void ExposeObjects(gd::Project &project,
                     gd::ArbitraryObjectsWorker &worker) const override;

  void ExposeSharedDatas(gd::Project &project,
                         gd::ArbitrarySharedDataWorker &worker) const override;

private:
  gd::EventsBasedBehavior &eventsBasedBehavior;
};

} // namespace gd

#endif // GDCORE_BEHAVIORPROJECTEXPOSER_H
