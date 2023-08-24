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

void UsedResourcesDeclarer::DeclareProjectUsedResources(
    gd::SerializerElement &layoutElement, gd::Project &project) {
  auto &resourcesElement = layoutElement.AddChild("usedResources");
  resourcesElement.ConsiderAsArrayOf("resource");

  gd::UsedResourcesDeclarer resourceWorker(resourcesElement);
  gd::ResourceExposer::ExposeProjectResources(project, resourceWorker);
}

void UsedResourcesDeclarer::DeclareLayoutUsedResources(
    gd::SerializerElement &projectElement, gd::Project &project,
    gd::Layout &layout) {
  auto &resourcesElement = projectElement.AddChild("usedResources");
  resourcesElement.ConsiderAsArrayOf("resource");

  gd::UsedResourcesDeclarer resourceWorker(resourcesElement);
  gd::ResourceExposer::ExposeLayoutResources(project, layout, resourceWorker);
}

void UsedResourcesDeclarer::DeclareLayoutResource(gd::String &resourceName) {
  if (resourceName.empty()) {
    return;
  }
  bool isNotYetAdded = resourceNames.insert(resourceName).second;
  if (isNotYetAdded) {
    SerializerElement &resourceElement = resourcesElement.AddChild("resource");
    resourceElement.SetAttribute("name", resourceName);
  }
}

} // namespace gd
