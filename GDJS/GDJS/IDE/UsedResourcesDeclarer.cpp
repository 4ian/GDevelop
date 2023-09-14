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

std::set<gd::String> UsedResourcesDeclarer::GetProjectUsedResources(gd::Project &project) {
  gd::UsedResourcesDeclarer resourceWorker;
  gd::ResourceExposer::ExposeProjectResources(project, resourceWorker);
  return resourceWorker.resourceNames;
}

std::set<gd::String> UsedResourcesDeclarer::GetLayoutUsedResources(gd::Project &project,
    gd::Layout &layout) {
  gd::UsedResourcesDeclarer resourceWorker;
  gd::ResourceExposer::ExposeLayoutResources(project, layout, resourceWorker);
  return resourceWorker.resourceNames;
}

void UsedResourcesDeclarer::DeclareUsedResource(gd::String &resourceName) {
  if (resourceName.empty()) {
    return;
  }
  resourceNames.insert(resourceName);
}

} // namespace gd
