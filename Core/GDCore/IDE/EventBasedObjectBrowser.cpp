/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventBasedObjectBrowser.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Project/ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void EventBasedObjectBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsBasedObject, worker);
}

void EventBasedObjectBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsBasedObjectEvents(
      project, eventsFunctionsExtension, eventsBasedObject, worker);
}

void EventBasedObjectBrowser::ExposeFunctions(
    gd::Project &project, gd::ArbitraryEventsFunctionsWorker &worker) const {
  worker.Launch(eventsBasedObject.GetEventsFunctions());
}

} // namespace gd
