/*
 * GDevelop Core
 * Copyright 2008-present Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "EventsFunctionsExtensionBrowser.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void EventsFunctionsExtensionBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(
      project, eventsFunctionsExtension, worker);
}

void EventsFunctionsExtensionBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(
      project, eventsFunctionsExtension, worker);
}

void EventsFunctionsExtensionBrowser::ExposeFunctions(
    gd::Project &project, gd::ArbitraryEventsFunctionsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsFunctionsExtensionFunctions(
      project, eventsFunctionsExtension, worker);
}

void EventsFunctionsExtensionBrowser::ExposeEventBasedBehaviors(
    gd::Project &project,
    gd::ArbitraryEventBasedBehaviorsWorker &worker) const {
  worker.Launch(eventsFunctionsExtension.GetEventsBasedBehaviors());
}

void EventsFunctionsExtensionBrowser::ExposeObjects(
    gd::Project &project, gd::ArbitraryObjectsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeEventsFunctionsExtensionObjects(
      eventsFunctionsExtension, worker);
}

} // namespace gd
