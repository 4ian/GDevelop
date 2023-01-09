/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef GDCORE_PROJECTEXPOSER_H
#define GDCORE_PROJECTEXPOSER_H
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
}  // namespace gd

namespace gd {

/**
 * \brief Expose events to an events worker.
 */
class GD_CORE_API ProjectExposer {
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

  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  virtual void ExposeObjects(gd::Project& project,
                                   gd::ArbitraryObjectsWorker& worker) const = 0;

  /**
   * \brief Call the specified worker on all FunctionsContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the function signatures
   * of a project.
   */
  virtual void ExposeFunctions(gd::Project &project,
                                     gd::ArbitraryFunctionsWorker &worker) const = 0;

  virtual void ExposeEventBasedBehaviors(
      gd::Project &project, gd::ArbitraryEventBasedBehaviorsWorker &worker) const = 0;

  virtual void ExposeSharedDatas(
      gd::Project &project, gd::ArbitrarySharedDataWorker &worker) const = 0;

   virtual ~ProjectExposer(){};


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

  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  static void ExposeProjectObjects(gd::Project& project,
                                   gd::ArbitraryObjectsWorker& worker);

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

  static void ExposeProjectSharedDatas(
      gd::Project &project, gd::ArbitrarySharedDataWorker &worker);
};

class GD_CORE_API WholeProjectExposer : public ProjectExposer {
 public:
   /**
    * \brief Call the specified worker on all events of the project (layout,
    * external events, events functions...)
    *
    * This should be the preferred way to traverse all the events of a project.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorker &worker) const override {
      gd::ProjectExposer::ExposeProjectEvents(project, worker);
   }

   /**
    * \brief Call the specified worker on all events of the project (layout,
    * external events, events functions...)
    *
    * This should be the preferred way to traverse all the events of a project.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const override {
      gd::ProjectExposer::ExposeProjectEvents(project, worker);
   }
   
  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  virtual void ExposeObjects(gd::Project& project,
                                   gd::ArbitraryObjectsWorker& worker) const override {
      gd::ProjectExposer::ExposeProjectObjects(project, worker);
   }

  /**
   * \brief Call the specified worker on all FunctionsContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the function signatures
   * of a project.
   */
  virtual void ExposeFunctions(gd::Project &project,
                                     gd::ArbitraryFunctionsWorker &worker) const override {
      gd::ProjectExposer::ExposeProjectFunctions(project, worker);
   }

  virtual void ExposeEventBasedBehaviors(
      gd::Project &project, gd::ArbitraryEventBasedBehaviorsWorker &worker) const override {
      gd::ProjectExposer::ExposeProjectEventBasedBehaviors(project, worker);
   }

  virtual void ExposeSharedDatas(
      gd::Project &project, gd::ArbitrarySharedDataWorker &worker) const override {
      gd::ProjectExposer::ExposeProjectSharedDatas(project, worker);
   }
};

class GD_CORE_API BehaviorEventsExposer : public ProjectExposer {
 public:
    BehaviorEventsExposer(gd::EventsBasedBehavior& eventsBasedBehavior_) : eventsBasedBehavior(eventsBasedBehavior_) {}

   /**
    * \brief Call the specified worker on all events of the events based
    * behavior
    *
    * This should be the preferred way to traverse all the events of an events
    * based behavior.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorker &worker) const override {
      gd::ProjectExposer::ExposeEventsBasedBehaviorEvents(project, eventsBasedBehavior, worker);
   }

   /**
    * \brief Call the specified worker on all events of the events based
    * behavior
    *
    * This should be the preferred way to traverse all the events of an events
    * based behavior.
    */
   void ExposeEvents(gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const override {
      gd::ProjectExposer::ExposeEventsBasedBehaviorEvents(project, eventsBasedBehavior, worker);
   }

  /**
   * \brief Call the specified worker on all FunctionsContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the function signatures
   * of a project.
   */
  virtual void ExposeFunctions(gd::Project &project,
                                     gd::ArbitraryFunctionsWorker &worker) const override;

  virtual void ExposeEventBasedBehaviors(
      gd::Project &project, gd::ArbitraryEventBasedBehaviorsWorker &worker) const override;
   
  /**
   * \brief Call the specified worker on all ObjectContainers of the project
   * (global, layouts...)
   *
   * This should be the preferred way to traverse all the objects of a project.
   */
  virtual void ExposeObjects(gd::Project& project,
                                   gd::ArbitraryObjectsWorker& worker) const override { }

  virtual void ExposeSharedDatas(
      gd::Project &project, gd::ArbitrarySharedDataWorker &worker) const override { }

 private:
   gd::EventsBasedBehavior& eventsBasedBehavior;
};

}  // namespace gd

#endif  // GDCORE_PROJECTEXPOSER_H
