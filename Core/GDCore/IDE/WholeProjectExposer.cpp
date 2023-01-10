/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "WholeProjectExposer.h"

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

void WholeProjectExposer::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorker &worker) const {
  gd::ProjectExposerHelper::ExposeProjectEvents(project, worker);
}

void WholeProjectExposer::ExposeEvents(
    gd::Project &project, gd::ArbitraryEventsWorkerWithContext &worker) const {
  gd::ProjectExposerHelper::ExposeProjectEvents(project, worker);
}

void WholeProjectExposer::ExposeObjects(
    gd::Project &project, gd::ArbitraryObjectsWorker &worker) const {
  gd::ProjectExposerHelper::ExposeProjectObjects(project, worker);
}

void WholeProjectExposer::ExposeFunctions(
    gd::Project &project, gd::ArbitraryFunctionsWorker &worker) const {
  gd::ProjectExposerHelper::ExposeProjectFunctions(project, worker);
}

void WholeProjectExposer::ExposeEventBasedBehaviors(
    gd::Project &project,
    gd::ArbitraryEventBasedBehaviorsWorker &worker) const {
  gd::ProjectExposerHelper::ExposeProjectEventBasedBehaviors(project, worker);
}

void WholeProjectExposer::ExposeSharedDatas(
    gd::Project &project, gd::ArbitrarySharedDataWorker &worker) const {
  gd::ProjectExposerHelper::ExposeProjectSharedDatas(project, worker);
}
} // namespace gd
