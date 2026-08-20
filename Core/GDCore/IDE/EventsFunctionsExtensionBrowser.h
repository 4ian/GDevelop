/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
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
 * \brief Expose events-functions extension contents to workers.
 */
class GD_CORE_API EventsFunctionsExtensionBrowser : public ProjectBrowser {
public:
  EventsFunctionsExtensionBrowser(
      gd::EventsFunctionsExtension &eventsFunctionsExtension_)
      : eventsFunctionsExtension(eventsFunctionsExtension_) {}

  /**
   * \brief Call the specified worker on all events of the event-based
   * behavior.
   *
   * This should be the preferred way to traverse all the events of an event-based behavior.
   */
  void ExposeEvents(gd::Project &project,
                    gd::ArbitraryEventsWorker &worker) const override;

  /**
   * \brief Call the specified worker on all events of the event-based
   * behavior.
   *
   * This should be the preferred way to traverse all the events of an event-based behavior.
   */
  void
  ExposeEvents(gd::Project &project, 
               gd::ArbitraryEventsWorkerWithContext &worker) const override;

  /**
   * \brief Call the specified worker on all functions of the event-based behavior
   *
   * This should be the preferred way to traverse all the function signatures
   * of an event-based behavior.
   */
  void ExposeFunctions(gd::Project &project,
                       gd::ArbitraryEventsFunctionsWorker &worker) const override;

  /**
   * \brief Do nothing.
   */
  void ExposeObjects(gd::Project &project,
                     gd::ArbitraryObjectsWorker &worker) const override {};

  /**
   * \brief Call the specified worker on the event-based behavior.
   */
  void ExposeEventBasedBehaviors(
      gd::Project &project,
      gd::ArbitraryEventBasedBehaviorsWorker &worker) const override;

  /**
   * \brief Do nothing.
   */
  void ExposeBehaviorSharedDatas(gd::Project &project,
                         gd::ArbitraryBehaviorSharedDataWorker &worker) const override {};

private:
  gd::EventsFunctionsExtension &eventsFunctionsExtension;
};

} // namespace gd
