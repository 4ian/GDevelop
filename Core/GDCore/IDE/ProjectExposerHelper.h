/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_PROJECTEXPOSERHELPER_H
#define GDCORE_PROJECTEXPOSERHELPER_H
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

/**
 * \brief Expose events to an events worker.
 */
class GD_CORE_API ProjectExposerHelper {
public:
  /**
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project &project,
                                  gd::ArbitraryEventsWorker &worker);

  /**
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project &project,
                                  gd::ArbitraryEventsWorkerWithContext &worker);

  /**
   * \brief Call the specified worker on all events of the events based
   * behavior
   *
   * This should be the preferred way to traverse all the events of an events
   * based behavior.
   */
  static void ExposeEventsBasedBehaviorEvents(
      gd::Project &project, const gd::EventsBasedBehavior &eventsBasedBehavior,
      gd::ArbitraryEventsWorker &worker);

  /**
   * \brief Call the specified worker on all events of the events based
   * behavior
   *
   * This should be the preferred way to traverse all the events of an events
   * based behavior.
   */
  static void ExposeEventsBasedBehaviorEvents(
      gd::Project &project, const gd::EventsBasedBehavior &eventsBasedBehavior,
      gd::ArbitraryEventsWorkerWithContext &worker);

  /**
   * \brief Call the specified worker on all events of the events based object
   *
   * This should be the preferred way to traverse all the events of an events
   * based object.
   */
  static void
  ExposeEventsBasedObjectEvents(gd::Project &project,
                                const gd::EventsBasedObject &eventsBasedObject,
                                gd::ArbitraryEventsWorkerWithContext &worker);

  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  static void ExposeProjectObjects(gd::Project &project,
                                   gd::ArbitraryObjectsWorker &worker);

  /**
   * \brief Call the specified worker on all FunctionsContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the function signatures
   * of a project.
   */
  static void ExposeProjectFunctions(gd::Project &project,
                                     gd::ArbitraryFunctionsWorker &worker);

  static void ExposeProjectEventBasedBehaviors(
      gd::Project &project, gd::ArbitraryEventBasedBehaviorsWorker &worker);

  static void ExposeProjectSharedDatas(gd::Project &project,
                                       gd::ArbitrarySharedDataWorker &worker);
};

} // namespace gd

#endif // GDCORE_PROJECTEXPOSERHELPER_H
