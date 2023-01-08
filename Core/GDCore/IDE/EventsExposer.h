/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_EVENTSEXPOSER_H
#define GDCORE_EVENTSEXPOSER_H
namespace gd {
class Project;
class String;
class EventsFunctionsExtension;
class EventsFunction;
class EventsBasedBehavior;
class EventsBasedObject;
class ArbitraryEventsWorker;
class ArbitraryEventsWorkerWithContext;
}  // namespace gd

namespace gd {

/**
 * \brief Tool functions to do refactoring on the whole project after
 * changes like deletion or renaming of an object.
 *
 * \TODO Ideally ObjectOrGroupRenamedInLayout, ObjectOrGroupRemovedInLayout,
 * GlobalObjectOrGroupRenamed, GlobalObjectOrGroupRemoved would be implemented
 * using ExposeProjectEvents.
 */
class GD_CORE_API EventsExposer {
 public:
  /**
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project& project,
                                  gd::ArbitraryEventsWorker& worker);

  /**
   * \brief Call the specified worker on all events of the project (layout,
   * external events, events functions...)
   *
   * This should be the preferred way to traverse all the events of a project.
   */
  static void ExposeProjectEvents(gd::Project& project,
                                  gd::ArbitraryEventsWorkerWithContext& worker);

  /**
   * \brief Call the specified worker on all events of the events based behavior
   *
   * This should be the preferred way to traverse all the events of an events
   * based behavior.
   */
  static void ExposeEventsBasedBehaviorEvents(
      gd::Project& project,
      const gd::EventsBasedBehavior& eventsBasedBehavior,
      gd::ArbitraryEventsWorkerWithContext& worker);

  /**
   * \brief Call the specified worker on all events of the events based object
   *
   * This should be the preferred way to traverse all the events of an events
   * based object.
   */
  static void ExposeEventsBasedObjectEvents(
      gd::Project& project,
      const gd::EventsBasedObject& eventsBasedObject,
      gd::ArbitraryEventsWorkerWithContext& worker);
};

}  // namespace gd

#endif  // GDCORE_EVENTSEXPOSER_H
