/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "SceneResourcesFinder.h"

#include "GDCore/IDE/ResourceExposer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

std::set<gd::String> SceneResourcesFinder::FindProjectResources(gd::Project &project) {
  gd::SceneResourcesFinder resourceWorker(project.GetResourcesManager());

  gd::ResourceExposer::ExposeProjectResources(project, resourceWorker);
  return resourceWorker.resourceNames;
}

std::set<gd::String> SceneResourcesFinder::FindSceneResources(gd::Project &project,
    gd::Layout &layout) {
  gd::SceneResourcesFinder resourceWorker(project.GetResourcesManager());

  gd::ResourceExposer::ExposeLayoutResources(project, layout, resourceWorker);
  return resourceWorker.resourceNames;
}

void SceneResourcesFinder::AddUsedResource(gd::String &resourceName) {
  if (resourceName.empty()) {
    return;
  }
  resourceNames.insert(resourceName);
}

} // namespace gd
