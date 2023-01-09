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
 * \brief Expose events to an events worker.
 */
class GD_CORE_API EventsExposer {
 public:
   /**
    * \brief Call the specified worker on a subset of events (layout,
    * external events, events functions...)
    *
    * This should be the preferred way to traverse events of a project.
    */
   virtual void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorker &worker) const = 0;
   /**
    * \brief Call the specified worker on a subset of events (layout,
    * external events, events functions...)
    *
    * This should be the preferred way to traverse events of a project.
    */
   virtual void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const = 0;

   virtual ~EventsExposer(){};

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
   static void
   ExposeProjectEvents(gd::Project &project,
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
};

class GD_CORE_API ProjectEventsExposer : public EventsExposer {
 public:
   /**
    * \brief Call the specified worker on all events of the project (layout,
    * external events, events functions...)
    *
    * This should be the preferred way to traverse all the events of a project.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorker &worker) const override {
      gd::EventsExposer::ExposeProjectEvents(project, worker);
   }

   /**
    * \brief Call the specified worker on all events of the project (layout,
    * external events, events functions...)
    *
    * This should be the preferred way to traverse all the events of a project.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const override {
      gd::EventsExposer::ExposeProjectEvents(project, worker);
   }
};

class GD_CORE_API BehaviorEventsExposer : public EventsExposer {
 public:
    BehaviorEventsExposer(const gd::EventsBasedBehavior& eventsBasedBehavior_) : eventsBasedBehavior(eventsBasedBehavior_) {}

   /**
    * \brief Call the specified worker on all events of the events based
    * behavior
    *
    * This should be the preferred way to traverse all the events of an events
    * based behavior.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorker &worker) const override {
      gd::EventsExposer::ExposeEventsBasedBehaviorEvents(project, eventsBasedBehavior, worker);
   }

   /**
    * \brief Call the specified worker on all events of the events based
    * behavior
    *
    * This should be the preferred way to traverse all the events of an events
    * based behavior.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const override {
      gd::EventsExposer::ExposeEventsBasedBehaviorEvents(project, eventsBasedBehavior, worker);
   }

 private:
   const gd::EventsBasedBehavior& eventsBasedBehavior;
};

}  // namespace gd

#endif  // GDCORE_EVENTSEXPOSER_H
