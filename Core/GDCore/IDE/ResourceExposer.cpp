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
#include "GDCore/Project/Effect.h"
#include "GDCore/String.h"
#include "GDCore/Extensions/Platform.h"
#include "GDCore/Extensions/Metadata/MetadataProvider.h"
#include "GDCore/Extensions/Metadata/EffectMetadata.h"
#include "GDCore/IDE/Events/UsedExtensionsFinder.h"

namespace gd {

void ResourceExposer::ExposeWholeProjectResources(gd::Project& project, gd::ArbitraryResourceWorker& worker) {
  // See also gd::ProjectBrowserHelper::ExposeProjectEvents for a method that
  // traverse the whole project (this time for events) and ExposeProjectEffects
  // (this time for effects).

  // Expose any project resources as files.
  worker.ExposeResources();

  project.GetPlatformSpecificAssets().ExposeResources(worker);

  // Expose event resources
  auto eventWorker = gd::GetResourceWorkerOnEvents(project, worker);
  gd::ProjectBrowserHelper::ExposeProjectEvents(
    project, eventWorker);

  // Expose object configuration resources
  auto objectWorker = gd::GetResourceWorkerOnObjects(project, worker);
  gd::ProjectBrowserHelper::ExposeProjectObjects(
    project, objectWorker);

  // Expose layer effect resources
  for (std::size_t layoutIndex = 0; layoutIndex < project.GetLayoutsCount();
       layoutIndex++) {
    auto &layout = project.GetLayout(layoutIndex);

    for (std::size_t layerIndex = 0; layerIndex < layout.GetLayersCount();
         layerIndex++) {
      auto &layer = layout.GetLayer(layerIndex);

      auto &effects = layer.GetEffects();
      for (size_t effectIndex = 0; effectIndex < effects.GetEffectsCount();
           effectIndex++) {
        auto &effect = effects.GetEffect(effectIndex);
        gd::ResourceExposer::ExposeEffectResources(project.GetCurrentPlatform(),
                                                   effect, worker);
      }
    }
  }

  // Expose loading screen background image if present
  auto& loadingScreen = project.GetLoadingScreen();
  if (loadingScreen.GetBackgroundImageResourceName() != "")
    worker.ExposeImage(loadingScreen.GetBackgroundImageResourceName());
}

void ResourceExposer::ExposeProjectResources(gd::Project& project, gd::ArbitraryResourceWorker& worker) {
  // Expose global objects configuration resources
  auto objectWorker = gd::GetResourceWorkerOnObjects(project, worker);
  objectWorker.Launch(project);
}

void ResourceExposer::ExposeLayoutResources(
    gd::Project &project, gd::Layout &layout,
    gd::ArbitraryResourceWorker &worker) {

  // Expose object configuration resources
  auto objectWorker = gd::GetResourceWorkerOnObjects(project, worker);
  gd::ProjectBrowserHelper::ExposeLayoutObjects(layout, objectWorker);

  // Expose layer effect resources
  for (std::size_t layerIndex = 0; layerIndex < layout.GetLayersCount();
       layerIndex++) {
    auto &layer = layout.GetLayer(layerIndex);

    auto &effects = layer.GetEffects();
    for (size_t effectIndex = 0; effectIndex < effects.GetEffectsCount();
         effectIndex++) {
      auto &effect = effects.GetEffect(effectIndex);
      gd::ResourceExposer::ExposeEffectResources(project.GetCurrentPlatform(),
                                                 effect, worker);
    }
  }

  // Expose event resources
  auto eventWorker = gd::GetResourceWorkerOnEvents(project, worker);
  gd::ProjectBrowserHelper::ExposeLayoutEventsAndDependencies(project, layout,
                                                              eventWorker);

  // Exposed extension event resources
  // Note that using resources in extensions is very unlikely and probably not
  // worth the effort of something smart.
  for (std::size_t e = 0; e < project.GetEventsFunctionsExtensionsCount();
       e++) {
    auto &eventsFunctionsExtension = project.GetEventsFunctionsExtension(e);
    gd::ProjectBrowserHelper::ExposeEventsFunctionsExtensionEvents(project, eventsFunctionsExtension, eventWorker);
  }
}

void ResourceExposer::ExposeEffectResources(
    gd::Platform &platform, gd::Effect &effect,
    gd::ArbitraryResourceWorker &worker) {
  auto &effectMetadata =
      MetadataProvider::GetEffectMetadata(platform, effect.GetEffectType());

  for (auto &propertyPair : effectMetadata.GetProperties()) {
    auto &propertyName = propertyPair.first;
    auto &propertyDescriptor = propertyPair.second;

    if (propertyDescriptor.GetType() == "resource" &&
        propertyDescriptor.GetExtraInfo().size() > 0) {
      auto &resourceType = propertyDescriptor.GetExtraInfo()[0];

      const gd::String &resourceName = effect.GetStringParameter(propertyName);
      if (!resourceName.empty()) {
        gd::String potentiallyUpdatedResourceName = resourceName;
        worker.ExposeResourceWithType(resourceType,
                                      potentiallyUpdatedResourceName);
        if (potentiallyUpdatedResourceName != resourceName) {
          effect.SetStringParameter(propertyName, potentiallyUpdatedResourceName);
        }
      }
    }
  }
}

} // namespace gd
