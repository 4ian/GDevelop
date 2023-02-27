/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventBasedBehaviorBrowser.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Project/ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void EventBasedBehaviorBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
      project, eventsBasedBehavior, worker);
}

void EventBasedBehaviorBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsBasedBehaviorEvents(
      project, eventsBasedBehavior, worker);
}

void EventBasedBehaviorBrowser::ExposeObjects(
    gd::Project &project, gd::ArbitraryObjectsWorker &worker) const {}

void EventBasedBehaviorBrowser::ExposeFunctions(
    gd::Project &project, gd::ArbitraryEventsFunctionsWorker &worker) const {
  worker.Launch(eventsBasedBehavior.GetEventsFunctions());
}

void EventBasedBehaviorBrowser::ExposeEventBasedBehaviors(
    gd::Project &project,
    gd::ArbitraryEventBasedBehaviorsWorker &worker) const {
  worker.Launch(eventsBasedBehavior);
}

void EventBasedBehaviorBrowser::ExposeBehaviorSharedDatas(
    gd::Project &project, gd::ArbitraryBehaviorSharedDataWorker &worker) const {}

} // namespace gd
