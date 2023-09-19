/*
 * GDevelop JS Platform
 * Copyright 2008-2023 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "UsedResourcesDeclarer.h"

#include "GDCore/IDE/ResourceExposer.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Serialization/SerializerElement.h"

namespace gd {

std::set<gd::String> UsedResourcesFinder::FindProjectUsedResources(gd::Project &project) {
  gd::UsedResourcesFinder resourceWorker;
  gd::ResourceExposer::ExposeProjectResources(project, resourceWorker);
  return resourceWorker.resourceNames;
}

std::set<gd::String> UsedResourcesFinder::FindLayoutUsedResources(gd::Project &project,
    gd::Layout &layout) {
  gd::UsedResourcesFinder resourceWorker;
  gd::ResourceExposer::ExposeLayoutResources(project, layout, resourceWorker);
  return resourceWorker.resourceNames;
}

void UsedResourcesFinder::AddUsedResource(gd::String &resourceName) {
  if (resourceName.empty()) {
    return;
  }
  resourceNames.insert(resourceName);
}

} // namespace gd
