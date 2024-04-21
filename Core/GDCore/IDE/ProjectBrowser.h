/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */

#pragma once

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
 * \brief Expose a subset of the project to workers.
 */
class GD_CORE_API ProjectBrowser {
public:
  /**
   * \brief Call the specified worker on all events of a project subset.
   *
   * This should be the preferred way to traverse events of a project.
   */
  virtual void ExposeEvents(gd::Project &project,
                            gd::ArbitraryEventsWorker &worker) const = 0;
  /**
   * \brief Call the specified worker on all events of a project subset.
   *
   * This should be the preferred way to traverse events of a project.
   */
  virtual void
  ExposeEvents(gd::Project &project,
               gd::ArbitraryEventsWorkerWithContext &worker) const = 0;

  /**
   * \brief Call the specified worker on all ObjectContainer of a project subset
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  virtual void ExposeObjects(gd::Project &project,
                             gd::ArbitraryObjectsWorker &worker) const = 0;

  /**
   * \brief Call the specified worker on all FunctionsContainer of a project
   * subset.
   *
   * This should be the preferred way to traverse all the function signatures
   * of a project.
   */
  virtual void ExposeFunctions(gd::Project &project,
                               gd::ArbitraryEventsFunctionsWorker &worker) const = 0;

  /**
   * \brief Call the specified worker on all EventBasedBehavior of a project
   * subset.
   *
   * This should be the preferred way to traverse all the event-based behavior
   * of a project.
   */
  virtual void ExposeEventBasedBehaviors(
      gd::Project &project,
      gd::ArbitraryEventBasedBehaviorsWorker &worker) const = 0;

  /**
   * \brief Call the specified worker on all SharedData of a project subset.
   *
   * This should be the preferred way to traverse all the shared data
   * of a project.
   */
  virtual void
  ExposeBehaviorSharedDatas(gd::Project &project,
                    gd::ArbitraryBehaviorSharedDataWorker &worker) const = 0;

  virtual ~ProjectBrowser(){};
};

} // namespace gd
