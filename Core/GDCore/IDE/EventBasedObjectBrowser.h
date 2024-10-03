/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#pragma once

#include "GDCore/IDE/ProjectBrowser.h"

namespace gd {
class Project;
class String;
class EventsFunctionsExtension;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
class ArbitraryEventsWorker;
class ArbitraryEventsWorkerWithContext;
class ArbitraryEventsFunctionsWorker;
class ArbitraryObjectsWorker;
class ArbitraryEventBasedBehaviorsWorker;
class ArbitraryBehaviorSharedDataWorker;
} // namespace gd

namespace gd {

/**
 * \brief Expose event-based object contents to workers.
 */
class GD_CORE_API EventBasedObjectBrowser : public ProjectBrowser {
public:
  EventBasedObjectBrowser(
      const gd::EventsFunctionsExtension &eventsFunctionsExtension_,
      gd::EventsBasedObject &eventsBasedObject_)
      : eventsFunctionsExtension(eventsFunctionsExtension_),
        eventsBasedObject(eventsBasedObject_) {}

  /**
   * \brief Call the specified worker on all events of the event-based
   * object.
   *
   * This should be the preferred way to traverse all the events of an event-based object.
   */
  void ExposeEvents(gd::Project &project,
                    gd::ArbitraryEventsWorker &worker) const override;

  /**
   * \brief Call the specified worker on all events of the event-based
   * object.
   *
   * This should be the preferred way to traverse all the events of an event-based object.
   */
  void
  ExposeEvents(gd::Project &project, 
               gd::ArbitraryEventsWorkerWithContext &worker) const override;

  /**
   * \brief Call the specified worker on all functions of the event-based object
   *
   * This should be the preferred way to traverse all the function signatures
   * of an event-based object.
   */
  void ExposeFunctions(gd::Project &project,
                       gd::ArbitraryEventsFunctionsWorker &worker) const override;

  /**
   * \brief Do nothing.
   */
  void ExposeObjects(gd::Project &project,
                     gd::ArbitraryObjectsWorker &worker) const override {};

  /**
   * @brief Do nothing.
   */
  void ExposeEventBasedBehaviors(
      gd::Project &project,
      gd::ArbitraryEventBasedBehaviorsWorker &worker) const override {};

  /**
   * \brief Do nothing.
   */
  void ExposeBehaviorSharedDatas(gd::Project &project,
                         gd::ArbitraryBehaviorSharedDataWorker &worker) const override {};

private:
  const gd::EventsFunctionsExtension &eventsFunctionsExtension;
  gd::EventsBasedObject &eventsBasedObject;
};

} // namespace gd
