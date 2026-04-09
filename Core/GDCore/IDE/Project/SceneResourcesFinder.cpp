/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "SceneResourcesFinder.h"

#include "GDCore/IDE/ResourceExposer.h"
#include "GDCore/Project/EventsBasedObjectVariant.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

std::set<gd::String> SceneResourcesFinder::FindProjectResources(gd::Project &project) {
  gd::SceneResourcesFinder resourceWorker(project.GetResourcesManager());

  gd::ResourceExposer::ExposeProjectResources(project, resourceWorker);
  return resourceWorker.resourceNames;
}

std::set<gd::String>
SceneResourcesFinder::FindSceneResources(gd::Project &project,
                                         gd::Layout &layout,
                                         bool ignoreObjectResourcePreloading) {
  gd::SceneResourcesFinder resourceWorker(project.GetResourcesManager());

  std::function<bool(const gd::Object &)> shouldCheckObject =
      [ignoreObjectResourcePreloading](const gd::Object &object) {
        return ignoreObjectResourcePreloading ||
               object.GetResourcesPreloading() != "manually";
      };
  gd::ResourceExposer::ExposeLayoutResources(project, layout, resourceWorker,
                                             shouldCheckObject);
  return resourceWorker.resourceNames;
}

std::set<gd::String>
SceneResourcesFinder::FindObjectResources(gd::Project &project,
                                          gd::Object &object) {
  gd::SceneResourcesFinder resourceWorker(project.GetResourcesManager());

  auto objectWorker = gd::GetResourceWorkerOnObjects(project, resourceWorker);
  objectWorker.Launch(object);
  return resourceWorker.resourceNames;
}

std::set<gd::String> SceneResourcesFinder::FindEventsBasedObjectVariantResources(gd::Project &project,
    gd::EventsBasedObjectVariant &variant) {
  gd::SceneResourcesFinder resourceWorker(project.GetResourcesManager());

  gd::ResourceExposer::ExposeEventsBasedObjectVariantResources(project, variant, resourceWorker);
  return resourceWorker.resourceNames;
}

void SceneResourcesFinder::AddUsedResource(gd::String &resourceName) {
  if (resourceName.empty() ||
      // It avoids to list resource parameters and properties.
      !resourcesManager->HasResource(resourceName)) {
    return;
  }
  resourceNames.insert(resourceName);
}

} // namespace gd
