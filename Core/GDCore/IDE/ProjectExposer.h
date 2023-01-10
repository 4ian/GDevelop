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
};

}  // namespace gd

#endif  // GDCORE_PROJECTEXPOSER_H
