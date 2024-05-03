/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "WholeProjectBrowser.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Project/ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void WholeProjectBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, worker);
}

void WholeProjectBrowser::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const {
  gd::ProjectBrowserHelper::ExposeProjectEvents(project, worker);
}

void WholeProjectBrowser::ExposeObjects(
    gd::Project &project, gd::ArbitraryObjectsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeProjectObjects(project, worker);
}

void WholeProjectBrowser::ExposeFunctions(
    gd::Project &project, gd::ArbitraryEventsFunctionsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeProjectFunctions(project, worker);
}

void WholeProjectBrowser::ExposeEventBasedBehaviors(
    gd::Project &project,
    gd::ArbitraryEventBasedBehaviorsWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeProjectEventBasedBehaviors(project, worker);
}

void WholeProjectBrowser::ExposeBehaviorSharedDatas(
    gd::Project &project, gd::ArbitraryBehaviorSharedDataWorker &worker) const {
  gd::ProjectBrowserHelper::ExposeProjectSharedDatas(project, worker);
}
} // namespace gd
