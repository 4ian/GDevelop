/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "ProjectResourcesAdder.h"
#include "GDCore/CommonTools.h"
#include "GDCore/IDE/Project/ResourcesInUseHelper.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Tools/Log.h"

using namespace std;

namespace gd {

bool ProjectResourcesAdder::AddAllMissing(gd::Project& project,
                                          const gd::String& resourceType) {
  // Search for resources used in the project
  gd::ResourcesInUseHelper resourcesInUse;
  project.ExposeResources(resourcesInUse);

  ResourcesManager& resourcesManager = project.GetResourcesManager();
  for (auto& resourceName : resourcesInUse.GetAll(resourceType)) {
    if (!resourcesManager.HasResource(resourceName)) {
      std::cout << "Adding missing resource \"" << resourceName
                << "\"to the project." << std::endl;
      resourcesManager.AddResource(
          resourceName, /*filename=*/resourceName, resourceType);
    }
  }

  return true;
}

std::vector<gd::String> ProjectResourcesAdder::GetAllUseless(
    gd::Project& project, const gd::String& resourceType) {
  std::vector<gd::String> unusedResources;
  // Search for resources used in the project
  gd::ResourcesInUseHelper resourcesInUse;
  project.ExposeResources(resourcesInUse);
  std::set<gd::String>& usedResources = resourcesInUse.GetAll(resourceType);

  // Search all resources not used
  const std::vector<std::shared_ptr<Resource>>& resources =
      project.GetResourcesManager().GetAllResources();
  for (std::size_t i = 0; i < resources.size(); i++) {
    if (resources[i]->GetKind() != resourceType) continue;

    if (usedResources.find(resources[i]->GetName()) == usedResources.end())
      unusedResources.push_back(resources[i]->GetName());
  }

  return unusedResources;
}

void ProjectResourcesAdder::RemoveAllUseless(gd::Project& project,
                                             const gd::String& resourceType) {
  std::vector<gd::String> unusedResources =
      GetAllUseless(project, resourceType);

  for (std::size_t i = 0; i < unusedResources.size(); ++i) {
    project.GetResourcesManager().RemoveResource(unusedResources[i]);
  }
}

}  // namespace gd
