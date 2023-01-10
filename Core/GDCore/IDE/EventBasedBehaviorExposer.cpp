/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventBasedBehaviorExposer.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryFunctionsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Project/ArbitrarySharedDataWorker.h"
#include "GDCore/IDE/ProjectExposerHelper.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void EventBasedBehaviorExposer::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorker &worker) const {
  gd::ProjectExposerHelper::ExposeEventsBasedBehaviorEvents(
      project, eventsBasedBehavior, worker);
}

void EventBasedBehaviorExposer::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const {
  gd::ProjectExposerHelper::ExposeEventsBasedBehaviorEvents(
      project, eventsBasedBehavior, worker);
}

void EventBasedBehaviorExposer::ExposeObjects(
    gd::Project &project, gd::ArbitraryObjectsWorker &worker) const {}

void EventBasedBehaviorExposer::ExposeFunctions(
    gd::Project &project, gd::ArbitraryFunctionsWorker &worker) const {
  worker.Launch(eventsBasedBehavior.GetEventsFunctions());
}

void EventBasedBehaviorExposer::ExposeEventBasedBehaviors(
    gd::Project &project,
    gd::ArbitraryEventBasedBehaviorsWorker &worker) const {
  worker.Launch(eventsBasedBehavior);
}

void EventBasedBehaviorExposer::ExposeSharedDatas(
    gd::Project &project, gd::ArbitrarySharedDataWorker &worker) const {}

} // namespace gd
