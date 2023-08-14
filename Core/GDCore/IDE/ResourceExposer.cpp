/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ResourceExposer.h"

#include "GDCore/IDE/Events/ArbitraryEventsWorker.h"
#include "GDCore/IDE/EventsFunctionTools.h"
#include "GDCore/IDE/Project/ArbitraryBehaviorSharedDataWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventBasedBehaviorsWorker.h"
#include "GDCore/IDE/Project/ArbitraryEventsFunctionsWorker.h"
#include "GDCore/IDE/Project/ArbitraryObjectsWorker.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/ProjectBrowserHelper.h"
#include "GDCore/Project/EventsBasedBehavior.h"
#include "GDCore/Project/EventsBasedObject.h"
#include "GDCore/Project/EventsFunctionsExtension.h"
#include "GDCore/Project/ExternalEvents.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/String.h"

namespace gd {

void ResourceExposer::ExposeWholeProjectResources(gd::Project& project, gd::ArbitraryResourceWorker& worker) {
  // See also gd::ProjectBrowserHelper::ExposeProjectEvents for a method that
  // traverse the whole project (this time for events) and ExposeProjectEffects
  // (this time for effects).

  gd::ResourcesManager* resourcesManager = &(project.GetResourcesManager());

  // Add project resources
  worker.ExposeResources(resourcesManager);
  project.GetPlatformSpecificAssets().ExposeResources(worker);

  // Add event resources
  auto eventWorker = gd::GetResourceWorkerOnEvents(project, worker);
  gd::ProjectBrowserHelper::ExposeProjectEvents(
    project, eventWorker);

  // Add object configuration resources
  auto objectWorker = gd::GetResourceWorkerOnObjects(worker);
  gd::ProjectBrowserHelper::ExposeProjectObjects(
    project, objectWorker);

  // Add loading screen background image if present
  auto& loadingScreen = project.GetLoadingScreen();
  if (loadingScreen.GetBackgroundImageResourceName() != "")
    worker.ExposeImage(loadingScreen.GetBackgroundImageResourceName());
}
} // namespace gd
